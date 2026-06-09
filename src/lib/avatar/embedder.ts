// Server-only: do not import in client-side islands.
//
// The real multilingual Embedder (replaces the OQ-5 defer-and-throw). Model:
// Cloudflare Workers AI `@cf/baai/bge-m3` (1024-dim, multilingual, instruction-free
// -> embedQuery(t) == embed([t])[0], no query/passage prefix asymmetry). Two impls
// behind the same `Embedder` seam so index-build and query produce comparable
// vectors from the SAME model/serving stack (never mix Workers-AI-built vectors with
// an OpenRouter-served bge-m3 — same weights, different stack, drifting floats):
//
//   - WorkersAiRestEmbedder   : build/index scripts + the Python-mirrored REST path.
//                               POSTs to the Workers AI REST API with the CF token.
//   - WorkersAiBindingEmbedder : the Pages Function. Calls env.AI.run() in-Worker
//                               (no external HTTP on the hot path, no key needed).
//
// `fetchImpl` is injectable (mirrors OpenRouterLLMProvider) so the REST path is
// unit-tested offline. Pinned to the same model/dimensions as pipeline/memory/embedder.py.

import type { Embedder } from './contracts';
import type { AiBinding } from './cf';

export const WORKERS_AI_MODEL = '@cf/baai/bge-m3';
export const WORKERS_AI_DIMENSIONS = 1024;
/** Per-request batch cap for the REST path (kept well under Workers AI limits). */
export const EMBED_BATCH_SIZE = 100;
const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

/** Fail-loud when the real embedder is requested without wiring (mirrors Python). */
export class EmbedderNotConfigured extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmbedderNotConfigured';
  }
}

/** Split `items` into consecutive batches of at most `size`. */
function batched<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size)
    out.push(items.slice(i, i + size));
  return out;
}

function assertDims(vectors: number[][], where: string): number[][] {
  for (const v of vectors) {
    if (v.length !== WORKERS_AI_DIMENSIONS) {
      throw new Error(
        `${where}: expected ${WORKERS_AI_DIMENSIONS}-d embedding, got ${v.length}`
      );
    }
  }
  return vectors;
}

/**
 * Build-time embedder: calls the Workers AI REST API
 * (`POST /accounts/{id}/ai/run/@cf/baai/bge-m3`, body `{ text: string[] }`, the REST
 * envelope returns `{ result: { data }, success }`). Used by build-avatar-index.ts /
 * reindex.ts (Node, where the AI binding is unavailable).
 */
export class WorkersAiRestEmbedder implements Embedder {
  readonly model = WORKERS_AI_MODEL;
  readonly dimensions = WORKERS_AI_DIMENSIONS;
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: {
    accountId: string;
    apiToken: string;
    fetchImpl?: typeof fetch;
  }) {
    this.accountId = opts.accountId;
    this.apiToken = opts.apiToken;
    // Bind to globalThis so a bare native `fetch` survives being called as
    // `this.fetchImpl(...)` (the Workers runtime throws "Illegal invocation" otherwise).
    // This REST path runs in Node today; bound for parity with synthesize.ts.
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  private async runBatch(texts: string[]): Promise<number[][]> {
    const url = `${CF_API_BASE}/accounts/${this.accountId}/ai/run/${WORKERS_AI_MODEL}`;
    const res = await this.fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: texts }),
    });
    if (!res.ok) {
      throw new Error(`Workers AI embeddings error (status ${res.status}).`);
    }
    const json = (await res.json()) as {
      success?: boolean;
      result?: { data?: number[][] };
    };
    const data = json.result?.data;
    if (!json.success || !Array.isArray(data) || data.length !== texts.length) {
      throw new Error('Workers AI embeddings: malformed response.');
    }
    return data;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (const batch of batched(texts, EMBED_BATCH_SIZE)) {
      out.push(...(await this.runBatch(batch)));
    }
    return assertDims(out, 'WorkersAiRestEmbedder.embed');
  }

  async embedQuery(text: string): Promise<number[]> {
    return (await this.embed([text]))[0];
  }
}

/**
 * Query-time embedder for the Pages Function: `env.AI.run('@cf/baai/bge-m3',
 * { text })` -> `{ data }`. No external HTTP, no embeddings key. Same model/stack as
 * the REST builder, so query vectors match the indexed ones.
 */
export class WorkersAiBindingEmbedder implements Embedder {
  readonly model = WORKERS_AI_MODEL;
  readonly dimensions = WORKERS_AI_DIMENSIONS;
  private readonly ai: AiBinding;

  constructor(ai: AiBinding) {
    this.ai = ai;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const out: number[][] = [];
    for (const batch of batched(texts, EMBED_BATCH_SIZE)) {
      const { data } = await this.ai.run(WORKERS_AI_MODEL, { text: batch });
      if (!Array.isArray(data) || data.length !== batch.length) {
        throw new Error('Workers AI binding: malformed embedding response.');
      }
      out.push(...data);
    }
    return assertDims(out, 'WorkersAiBindingEmbedder.embed');
  }

  async embedQuery(text: string): Promise<number[]> {
    const { data } = await this.ai.run(WORKERS_AI_MODEL, { text });
    return assertDims(data, 'WorkersAiBindingEmbedder.embedQuery')[0];
  }
}

/**
 * Factory for the build/index (Node) path. Reads the Cloudflare credentials from
 * `env`: the API token from `EMBEDDINGS_API_KEY` (or `CLOUDFLARE_API_TOKEN`) and the
 * account from `CLOUDFLARE_ACCOUNT_ID`. Throws `EmbedderNotConfigured` (fail-loud,
 * same contract as the Python sibling) when either is absent — never silent-fakes.
 */
export function createWorkersAiRestEmbedder(
  env: Record<string, string | undefined>,
  fetchImpl?: typeof fetch
): WorkersAiRestEmbedder {
  const apiToken = env.EMBEDDINGS_API_KEY ?? env.CLOUDFLARE_API_TOKEN;
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiToken || !accountId) {
    throw new EmbedderNotConfigured(
      'Workers AI embedder not configured: need EMBEDDINGS_API_KEY (or ' +
        'CLOUDFLARE_API_TOKEN) + CLOUDFLARE_ACCOUNT_ID (see DEPLOY.md §5). ' +
        `token ${apiToken ? 'present' : 'absent'}, account ${accountId ? 'present' : 'absent'}.`
    );
  }
  return new WorkersAiRestEmbedder({ accountId, apiToken, fetchImpl });
}
