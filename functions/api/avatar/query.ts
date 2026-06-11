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
import { retrieve } from '../../../src/lib/avatar/retrieval';
import { WorkersAiBindingEmbedder } from '../../../src/lib/avatar/embedder';
import { VectorizeVectorStore } from '../../../src/lib/avatar/vectorize-store';
import { D1LexicalStore } from '../../../src/lib/avatar/d1-lexical';
import {
  buildSynthesisRequest,
  dedupeChunksByArticle,
  IDK_MESSAGE,
  OpenRouterLLMProvider,
} from '../../../src/lib/avatar/synthesize';
import {
  encodeSSE,
  SSE_CONTENT_TYPE,
  SSE_EVENT,
} from '../../../src/lib/avatar/protocol';
import { parseArtifactStream } from '../../../src/lib/avatar/artifacts';

// --- type-only imports (verbatimModuleSyntax) ---
import type {
  LLMProvider,
  LlmRequest,
  RetrievalResult,
  ThresholdOutcome,
} from '../../../src/lib/avatar/contracts';
import type { RetrieveOptions } from '../../../src/lib/avatar/retrieval';
import type { Citation, Locale } from '../../../src/lib/avatar/protocol';
import type {
  AiBinding,
  VectorizeIndex,
  D1Database,
} from '../../../src/lib/avatar/cf';

// --- Cloudflare Pages env (bindings hand-typed in src/lib/avatar/cf.ts) ---------
interface Env {
  OPENROUTER_API_KEY?: string; // avatar LLM (synthesis)
  AVATAR_SIMILARITY_THRESHOLD?: string; // optional runtime override, non-secret
  AI?: AiBinding; // Workers AI: query-time bge-m3 embeddings (no key/HTTP)
  VECTORIZE?: VectorizeIndex; // dense leg
  DB?: D1Database; // lexical (FTS5 BM25) + chunk hydration
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
        // Parse the model's stream for fenced artifacts (diagrams/code): prose flows
        // out as `token` frames, a completed fence as one typed `artifact` frame. The
        // ordering (sources → interleaved tokens/artifacts → done) is preserved.
        for await (const ev of parseArtifactStream(llm.stream(llmRequest))) {
          const frame =
            ev.type === 'artifact'
              ? encodeSSE(SSE_EVENT.artifact, ev.artifact)
              : encodeSSE(SSE_EVENT.token, { text: ev.text });
          controller.enqueue(enc.encode(frame));
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
    // Per-request scope (the per-article "ask about this piece" mode) overrides any
    // deps-level options; absent scopeSlug keeps the corpus-wide behavior unchanged.
    const retrieveOptions: RetrieveOptions | undefined =
      v.scopeSlug !== undefined
        ? { ...deps.retrieveOptions, scopeSlug: v.scopeSlug }
        : deps.retrieveOptions;
    const result = await deps.retriever.retrieve(v.query, retrieveOptions);
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

  // 5. GROUNDED branch — citations first, then streamed prose. Collapse the retrieved
  // chunks to one per article in the reader's language so each source is cited ONCE
  // (not its EN + FR versions both); dedup before synthesis keeps the [n] aligned.
  const { request: llmRequest, citations } = buildSynthesisRequest({
    query: v.query,
    lang: v.lang,
    chunks: dedupeChunksByArticle(outcome.chunks, v.lang),
  });
  return groundedResponse(
    citations,
    deps.llm,
    llmRequest,
    outcome.topSimilarity,
    outcome.threshold
  );
}

// --- runtime wiring (onRequestPost; not unit-tested — needs the live bindings) -
export async function onRequestPost(context: PagesContext): Promise<Response> {
  const { request, env } = context;
  try {
    const retriever = createBindingRetriever(env); // throws if a binding is absent
    const llm = createLLMProvider(env);
    const threshold = parseThreshold(env.AVATAR_SIMILARITY_THRESHOLD);
    return await handleAvatarQuery(request, { retriever, llm, threshold });
  } catch {
    return jsonError(503, 'Avatar service unavailable.');
  }
}

/**
 * Wire the production retriever from the Cloudflare bindings: bge-m3 via the AI
 * binding (query-time embeddings, no key/HTTP), the dense leg over Vectorize, the
 * lexical leg over D1 FTS5. The wrappers are thin (no heavy index load), so building
 * one per request is cheap. Throws (-> 503) if a binding is missing — e.g. on a
 * preview deploy where the avatar index has not been provisioned.
 */
function createBindingRetriever(env: Env): AvatarRetriever {
  if (!env.AI || !env.VECTORIZE || !env.DB) {
    throw new Error('Avatar bindings unavailable (AI / VECTORIZE / DB).');
  }
  const embedder = new WorkersAiBindingEmbedder(env.AI);
  const vectorStore = new VectorizeVectorStore(env.VECTORIZE, env.DB);
  const lexical = new D1LexicalStore(env.DB);
  return {
    retrieve: (query: string, opts?: RetrieveOptions) =>
      retrieve(query, { embedder, vectorStore, lexical }, opts),
  };
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
