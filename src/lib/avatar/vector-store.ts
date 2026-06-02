// Server-only: do not import in client-side islands.
//
// The production `VectorStore` seam impl (MVP: a linear in-memory cosine scan)
// plus the shared `cosineSimilarity`. A managed vector DB swaps in behind the
// same `VectorStore` interface without touching callers.

import type { IndexChunk, ScoredChunk, VectorStore } from './contracts';

/**
 * Cosine similarity in [-1, 1]. Returns 0 for a zero-magnitude vector (no NaN).
 * Computes dot product and both norms in a single pass.
 *
 * @throws if the two vectors differ in length (guards a corrupt artifact).
 */
export function cosineSimilarity(
  a: readonly number[],
  b: readonly number[]
): number {
  if (a.length !== b.length) {
    throw new Error('cosineSimilarity: vector length mismatch');
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * MVP VectorStore: a linear cosine scan over the in-memory artifact chunks.
 * Async to satisfy the seam (a managed vector DB swaps in unchanged).
 */
export class InMemoryVectorStore implements VectorStore {
  private readonly chunks: readonly IndexChunk[];
  private readonly dimensions: number;

  /** Validates every chunk.embedding.length === dimensions; throws otherwise. */
  constructor(chunks: readonly IndexChunk[], dimensions: number) {
    for (const chunk of chunks) {
      if (chunk.embedding.length !== dimensions) {
        throw new Error(
          `InMemoryVectorStore: chunk ${chunk.id} embedding length ${chunk.embedding.length} != dimensions ${dimensions}`
        );
      }
    }
    this.chunks = chunks;
    this.dimensions = dimensions;
  }

  /**
   * Top-k chunks by cosine, sorted descending (then by `chunk.id` ascending for
   * determinism). Validates the query vector's length up front (surfaces an
   * embedder/artifact mismatch early).
   */
  search(queryEmbedding: number[], topK: number): Promise<ScoredChunk[]> {
    if (queryEmbedding.length !== this.dimensions) {
      throw new Error(
        `InMemoryVectorStore.search: query length ${queryEmbedding.length} != dimensions ${this.dimensions}`
      );
    }
    const scored: ScoredChunk[] = this.chunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    scored.sort(
      (a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)
    );
    return Promise.resolve(scored.slice(0, topK));
  }
}
