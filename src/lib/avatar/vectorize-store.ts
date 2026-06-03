// Server-only: do not import in client-side islands.
//
// The production `VectorStore`: Cloudflare Vectorize for the dense leg. `query()`
// returns ids+scores; chunk text/provenance is hydrated from D1 (the JOIN key is
// `chunk.id` == the Vectorize vector id). Same `VectorStore` seam as the MVP
// InMemoryVectorStore, so retrieval.ts is unchanged.

import type { ScoredChunk, VectorStore } from './contracts';
import type { D1Database, VectorizeIndex } from './cf';
import { loadChunksByIds } from './d1';

export class VectorizeVectorStore implements VectorStore {
  constructor(
    private readonly index: VectorizeIndex,
    private readonly db: D1Database
  ) {}

  async search(queryEmbedding: number[], topK: number): Promise<ScoredChunk[]> {
    const { matches } = await this.index.query(queryEmbedding, { topK });
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
