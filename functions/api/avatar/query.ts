// Server-only: do not import in client-side islands.
// The Pages bundler (wrangler/esbuild) does NOT honor tsconfig `paths`, so reach
// the lib via the relative path, not the `@/` alias. Value vs type-only imports
// are split (verbatimModuleSyntax). Mind the source split: applyThreshold +
// DEFAULT_SIMILARITY_THRESHOLD live in ./threshold; the TYPES ThresholdOutcome +
// RetrievalResult live in ./contracts.

// --- value imports ---
import { validateQueryRequest } from '../../../src/lib/avatar/guard';
import {
  applyThreshold,
  DEFAULT_SIMILARITY_THRESHOLD,
} from '../../../src/lib/avatar/threshold';
import { createRetriever } from '../../../src/lib/avatar/retrieval';
import {
  buildSynthesisRequest,
  IDK_MESSAGE,
  OpenRouterLLMProvider,
} from '../../../src/lib/avatar/synthesize';
import {
  encodeSSE,
  SSE_CONTENT_TYPE,
  SSE_EVENT,
} from '../../../src/lib/avatar/protocol';

// --- type-only imports (verbatimModuleSyntax) ---
import type {
  Embedder,
  IndexArtifact,
  LLMProvider,
  LlmRequest,
  RetrievalResult,
  ThresholdOutcome,
} from '../../../src/lib/avatar/contracts';
import type { RetrieveOptions } from '../../../src/lib/avatar/retrieval';
import type { Citation, Locale } from '../../../src/lib/avatar/protocol';

// --- minimal Cloudflare Pages types (no @cloudflare/workers-types dependency) -
interface Fetcher {
  fetch(input: Request | string): Promise<Response>;
}
interface Env {
  OPENROUTER_API_KEY?: string;
  EMBEDDINGS_API_KEY?: string;
  AVATAR_SIMILARITY_THRESHOLD?: string; // optional runtime override, non-secret
  ASSETS?: Fetcher; // Pages static-asset binding
}
interface PagesContext {
  request: Request;
  env: Env;
}

// --- SSE assembly primitives -------------------------------------------------
const enc = new TextEncoder();
const sseHeaders = {
  'Content-Type': SSE_CONTENT_TYPE,
  'Cache-Control': 'no-store',
};

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** REFUSAL: idk + done. Pure function of `outcome`; the LLM is never touched. */
function idkResponse(
  outcome: Extract<ThresholdOutcome, { kind: 'idk' }>,
  lang: Locale
): Response {
  const suggestions: Citation[] = outcome.nearMisses.map((c, i) => ({
    n: i + 1,
    title: c.chunk.title,
    sourceUrl: c.chunk.sourceUrl,
    headingAnchor: c.chunk.headingAnchor,
    slug: c.chunk.slug,
    lang: c.chunk.lang,
  }));
  const body =
    encodeSSE(SSE_EVENT.idk, { message: IDK_MESSAGE[lang], suggestions }) +
    encodeSSE(SSE_EVENT.done, {
      finishReason: 'idk',
      topSimilarity: outcome.topSimilarity,
      threshold: outcome.threshold,
    });
  return new Response(body, { status: 200, headers: sseHeaders });
}

/** GROUNDED: sources (citations) FIRST, then token deltas, then done. */
function groundedResponse(
  citations: Citation[],
  llm: LLMProvider,
  llmRequest: LlmRequest,
  topSimilarity: number,
  threshold: number
): Response {
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(
        enc.encode(encodeSSE(SSE_EVENT.sources, { citations }))
      );
      try {
        for await (const delta of llm.stream(llmRequest)) {
          controller.enqueue(
            enc.encode(encodeSSE(SSE_EVENT.token, { text: delta }))
          );
        }
        controller.enqueue(
          enc.encode(
            encodeSSE(SSE_EVENT.done, {
              finishReason: 'grounded',
              topSimilarity,
              threshold,
            })
          )
        );
      } catch {
        // No provider internals leaked; emit a generic error frame and close.
        controller.enqueue(
          enc.encode(
            encodeSSE(SSE_EVENT.error, { message: 'Synthesis failed.' })
          )
        );
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { status: 200, headers: sseHeaders });
}

// --- testable core handler (pure DI; fakes injected in tests) ----------------
export interface AvatarRetriever {
  retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult>;
}
export interface AvatarEndpointDeps {
  retriever: AvatarRetriever;
  llm: LLMProvider;
  threshold?: number; // default DEFAULT_SIMILARITY_THRESHOLD (0.25)
  maxNearMisses?: number; // default DEFAULT_MAX_NEAR_MISSES (3)
  retrieveOptions?: RetrieveOptions;
}

export async function handleAvatarQuery(
  request: Request,
  deps: AvatarEndpointDeps
): Promise<Response> {
  if (request.method !== 'POST') return jsonError(405, 'Method not allowed.');

  // 1. Parse body (malformed JSON → 400, never reaches retrieval/LLM).
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return jsonError(400, 'Invalid JSON body.');
  }

  // 2. Sanitize + validate (guard).
  const v = validateQueryRequest(parsed);
  if (!v.ok) return jsonError(v.status, v.message);

  // 3. Retrieve + gate. Retrieval/gate failures → generic 500 (no leak).
  let outcome: ThresholdOutcome;
  try {
    const result = await deps.retriever.retrieve(v.query, deps.retrieveOptions);
    outcome = applyThreshold(result, {
      threshold: deps.threshold,
      maxNearMisses: deps.maxNearMisses,
    });
  } catch {
    return jsonError(500, 'Avatar service error.');
  }

  // 4. REFUSAL branch — never references deps.llm (NFR-4).
  if (outcome.kind === 'idk') {
    return idkResponse(outcome, v.lang);
  }

  // 5. GROUNDED branch — citations first, then streamed prose.
  const { request: llmRequest, citations } = buildSynthesisRequest({
    query: v.query,
    lang: v.lang,
    chunks: outcome.chunks,
  });
  return groundedResponse(
    citations,
    deps.llm,
    llmRequest,
    outcome.topSimilarity,
    outcome.threshold
  );
}

// --- runtime wiring (onRequestPost; not unit-tested — needs secrets+artifact) -
let cached: { artifact: IndexArtifact; retriever: AvatarRetriever } | null =
  null;

export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  try {
    if (!cached) {
      const artifact = await loadIndexArtifact(request, env);
      const embedder = createEmbedder(env); // throws until OQ-5 resolves
      cached = { artifact, retriever: createRetriever(artifact, { embedder }) };
    }
    const llm = createLLMProvider(env);
    const threshold = parseThreshold(env.AVATAR_SIMILARITY_THRESHOLD);
    return await handleAvatarQuery(request, {
      retriever: cached.retriever,
      llm,
      threshold,
    });
  } catch {
    return jsonError(503, 'Avatar service unavailable.');
  }
}

/** PINNED CONTRACT: task 18 emits the artifact to `/avatar-index.json`. */
async function loadIndexArtifact(
  request: Request,
  env: Env
): Promise<IndexArtifact> {
  const url = new URL('/avatar-index.json', request.url);
  const res = env.ASSETS
    ? await env.ASSETS.fetch(new Request(url.toString()))
    : await fetch(url.toString());
  if (!res.ok) throw new Error('Index artifact unavailable.');
  const artifact = (await res.json()) as IndexArtifact;
  // `version !== 1` is a DELIBERATE fail-closed hard pin, not an oversight: an
  // unknown future `version: 2` may carry an incompatible shape, so we 503
  // rather than risk mis-reading it. Bump this in lockstep when task 18 revs the
  // artifact format. (Known forward-compat limit — see Risks.)
  if (
    artifact.version !== 1 ||
    !(artifact.dimensions > 0) ||
    !Array.isArray(artifact.chunks)
  ) {
    throw new Error('Index artifact malformed.');
  }
  return artifact;
}

/**
 * OQ-5 still open: the real multilingual embedder is not chosen yet. Keep `env`
 * and reference it (the real embedder will read `EMBEDDINGS_API_KEY`) so the stub
 * is honest about its future input AND so eslint's `no-unused-vars` (bare
 * `recommended` — no `argsIgnorePattern`, a leading `_` is NOT exempt) does not
 * fail the BLOCK lint gate. (Dropping the param instead would force changing the
 * call site too: `createEmbedder(env)` against a 0-arity fn errors TS2554.)
 */
function createEmbedder(env: Env): Embedder {
  const hasKey = Boolean(env.EMBEDDINGS_API_KEY);
  throw new Error(
    `Avatar embedder not configured (OQ-5 pending — see docs/persona.md; ` +
      `EMBEDDINGS_API_KEY ${hasKey ? 'present, embedder not wired yet' : 'absent'}).`
  );
}

function createLLMProvider(env: Env): LLMProvider {
  // Read the Workers binding directly. Do NOT route it through `getRequired`
  // from `@/lib/env`: its `env?: EnvRecord` param is `Record<string, string |
  // undefined>`, and the local `interface Env` (with `ASSETS?: Fetcher`) is not
  // assignable to that index signature → `astro check` errors TS2345 (BLOCK lint
  // gate). A direct guard is secret-free; onRequestPost's catch turns it to 503.
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('Missing OPENROUTER_API_KEY.');
  return new OpenRouterLLMProvider({ apiKey });
}

/**
 * Parse the optional AVATAR_SIMILARITY_THRESHOLD override. NFR-4 hard floor: a
 * non-finite OR non-positive value (`0`, negative) must NOT be honored — with
 * `threshold <= 0` an off-topic query (`topSimilarity === 0`) would pass `>=`
 * and reach the LLM, defeating the "I don't know" gate. Such values fall back to
 * the safe default. (Values > 1 only make the gate stricter — accepted as-is.)
 * Exported so the threshold-floor test can lock it.
 */
export function parseThreshold(raw: string | undefined): number {
  const n = raw === undefined ? NaN : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_SIMILARITY_THRESHOLD;
}
