// Server-only: do not import in client-side islands.
//
// The production `VectorStore`: Cloudflare Vectorize for the dense leg. `query()`
// returns ids+scores; chunk text/provenance is hydrated from D1 (the JOIN key is
// `chunk.id` == the Vectorize vector id). Same `VectorStore` seam as the MVP
// InMemoryVectorStore, so retrieval.ts is unchanged.

import type { ScoredChunk, SearchScope, VectorStore } from './contracts';
import type { D1Database, VectorizeIndex } from './cf';
import { loadChunkIdsBySlug, loadChunksByIds } from './d1';
import { cosineSimilarity } from './vector-store';

// Cloudflare Vectorize's documented max query topK for id+score results (it is lower
// when returning values/metadata, which we do not). A request above this throws, so the
// store clamps to it. This cap applies to the CORPUS-WIDE leg only — the scoped leg
// never calls query(), so it is not subject to it.
export const VECTORIZE_MAX_TOPK = 100;

export class VectorizeVectorStore implements VectorStore {
  constructor(
    private readonly index: VectorizeIndex,
    private readonly db: D1Database
  ) {}

  async search(
    queryEmbedding: number[],
    topK: number,
    scope?: SearchScope
  ): Promise<ScoredChunk[]> {
    return scope?.slug === undefined
      ? this.searchCorpus(queryEmbedding, topK)
      : this.searchArticle(queryEmbedding, topK, scope.slug);
  }

  /** Corpus-wide: Vectorize ranks, D1 hydrates. Clamped to the documented cap. */
  private async searchCorpus(
    queryEmbedding: number[],
    topK: number
  ): Promise<ScoredChunk[]> {
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

  /**
   * Scoped to one article: a TRUE pre-filter, so the result is that article's own
   * top-k however large the corpus grows.
   *
   * `query()` is deliberately not used here — it ranks globally and would hand back
   * the corpus top-k, from which an article's chunks must then be filtered out. Past
   * ~100 chunks that filter starts returning nothing (or a weak leftover chunk), which
   * drops `topSimilarity` below the gate and makes on-article questions refuse. Instead
   * D1 names the article's chunk ids, `getByIds` returns their vectors, and cosine is
   * computed over exactly those — no global ranking involved, nothing to truncate.
   */
  private async searchArticle(
    queryEmbedding: number[],
    topK: number,
    slug: string
  ): Promise<ScoredChunk[]> {
    const ids = await loadChunkIdsBySlug(this.db, slug);
    if (ids.length === 0) return []; // unknown slug -> honest empty (topSimilarity 0)

    const [vectors, chunks] = await Promise.all([
      this.index.getByIds(ids),
      loadChunksByIds(this.db, ids),
    ]);

    const out: ScoredChunk[] = [];
    for (const vector of vectors) {
      const chunk = chunks.get(vector.id);
      // Same orphan tolerance as the corpus leg, in the other direction: a vector
      // whose D1 row is gone is skipped rather than surfaced half-hydrated.
      if (!chunk) continue;
      out.push({
        chunk,
        score: cosineSimilarity(queryEmbedding, vector.values),
      });
    }
    // getByIds gives no ordering guarantee, so rank here — id ascending breaks ties
    // for determinism, matching InMemoryVectorStore.
    out.sort(
      (a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)
    );
    return out.slice(0, topK);
  }
}
