// Server-only: do not import in client-side islands.
//
// The production `VectorStore`: Cloudflare Vectorize for the dense leg. `query()`
// returns ids+scores; chunk text/provenance is hydrated from D1 (the JOIN key is
// `chunk.id` == the Vectorize vector id). Same `VectorStore` seam as the MVP
// InMemoryVectorStore, so retrieval.ts is unchanged.

import type { ScoredChunk, VectorStore } from './contracts';
import type { D1Database, VectorizeIndex } from './cf';
import { loadChunksByIds } from './d1';

// Cloudflare Vectorize's documented max query topK for id+score results (it is lower
// when returning values/metadata, which we do not). A request above this throws, so the
// store clamps to it — see the scoped wide-pull (retrieval.ts SCOPED_LEG_TOP_K).
export const VECTORIZE_MAX_TOPK = 100;

export class VectorizeVectorStore implements VectorStore {
  constructor(
    private readonly index: VectorizeIndex,
    private readonly db: D1Database
  ) {}

  async search(queryEmbedding: number[], topK: number): Promise<ScoredChunk[]> {
    // Clamp to Vectorize's cap so a wide scoped pull can never exceed it and throw. The
    // corpus is far under 100 chunks, so this never truncates today; scoped retrieval
    // beyond 100 chunks needs a slug-metadata pre-filter (avatar-index-builder-seams).
    const { matches } = await this.index.query(queryEmbedding, {
      topK: Math.min(topK, VECTORIZE_MAX_TOPK),
    });
    const chunks = await loadChunksByIds(
      this.db,
      matches.map((m) => m.id)
    );
    const out: ScoredChunk[] = [];
    for (const m of matches) {
      const chunk = chunks.get(m.id);
      // Skip an orphaned vector (id in Vectorize but row gone from D1) rather than
      // surface a half-deleted chunk; preserves Vectorize's descending score order,
      // so retrieval.ts can still read vectorResults[0].score as the corpus-max cosine.
      if (chunk) out.push({ chunk, score: m.score });
    }
    return out;
  }
}
