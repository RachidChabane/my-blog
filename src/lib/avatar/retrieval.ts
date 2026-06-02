// Server-only: do not import in client-side islands.
//
// Hybrid lexical+vector retrieval, fused with Reciprocal Rank Fusion, with an
// optional rerank. Composes rrf + lexical + vector-store behind the provider
// seams. Never imports the LLM seam (NFR-4 — see threshold.ts).

import type {
  Candidate,
  Embedder,
  IndexArtifact,
  Reranker,
  RetrievalResult,
  ScoredChunk,
  VectorStore,
} from './contracts';
import { Bm25Index } from './lexical';
import { reciprocalRankFusion, DEFAULT_RRF_K } from './rrf';
import { InMemoryVectorStore } from './vector-store';

export interface RetrieveDeps {
  embedder: Embedder;
  vectorStore: VectorStore;
  lexical: Bm25Index;
  /** Optional cross-encoder rerank. Omit for the canonical "no rerank" config. */
  reranker?: Reranker;
}

export interface RetrieveOptions {
  /** Candidates pulled per leg before fusion. Default 30 (bayan). */
  legTopK?: number;
  /** Final candidate count. Default 5. */
  topK?: number;
  /** RRF damping constant. Default DEFAULT_RRF_K (60). */
  rrfK?: number;
}

const DEFAULT_LEG_TOP_K = 30;
const DEFAULT_TOP_K = 5;

/**
 * Run hybrid lexical+vector retrieval, fuse with RRF, optionally rerank.
 *
 * `topSimilarity` is captured from the vector leg's #1 result BEFORE fusion or
 * truncation — it is the corpus max cosine and the only signal the threshold
 * gate keys on. Capturing it post-truncation would let a vector-#1 chunk that
 * fusion/rerank demoted out of the final set falsely refuse a grounded query.
 *
 * When a reranker is present it sees the WIDER fused pool (up to `legTopK`), not
 * the already-truncated top-k, so it can promote a chunk RRF ranked below `topK`
 * into the final set (standard hybrid: fuse → rerank wide → then narrow).
 */
export async function retrieve(
  query: string,
  deps: RetrieveDeps,
  opts?: RetrieveOptions
): Promise<RetrievalResult> {
  const topK = opts?.topK ?? DEFAULT_TOP_K;
  // legTopK >= topK always: the per-leg pull must be at least the final count.
  const legTopK = Math.max(opts?.legTopK ?? DEFAULT_LEG_TOP_K, topK);
  const rrfK = opts?.rrfK ?? DEFAULT_RRF_K;

  const queryEmbedding = await deps.embedder.embedQuery(query);
  const vectorResults = await deps.vectorStore.search(queryEmbedding, legTopK);
  const lexicalResults = deps.lexical.search(query, legTopK);

  // Gate signal: the vector leg is sorted by cosine, so [0].score is the corpus
  // max cosine. Captured BEFORE fusion/rerank/truncation.
  const topSimilarity = vectorResults.length > 0 ? vectorResults[0].score : 0;

  const vectorById = new Map<string, number>();
  for (const r of vectorResults) vectorById.set(r.chunk.id, r.score);
  const lexicalById = new Map<string, number>();
  for (const r of lexicalResults) lexicalById.set(r.chunk.id, r.score);

  const fused = reciprocalRankFusion(
    [vectorResults, lexicalResults],
    (r) => r.chunk.id,
    rrfK
  );
  // Built from the FULL fused list so a reranker-promoted chunk (fused-rank
  // beyond topK) still carries its fusedScore.
  const fusedById = new Map<string, number>();
  for (const f of fused) fusedById.set(f.key, f.score);

  let candidates: Candidate[];
  if (deps.reranker) {
    const pool: ScoredChunk[] = fused
      .slice(0, legTopK)
      .map((f) => ({ chunk: f.item.chunk, score: f.score }));
    const reranked = await deps.reranker.rerank(query, pool, topK);
    candidates = reranked.map((sc) => ({
      chunk: sc.chunk,
      vectorSimilarity: vectorById.get(sc.chunk.id) ?? 0,
      lexicalScore: lexicalById.get(sc.chunk.id) ?? 0,
      fusedScore: fusedById.get(sc.chunk.id) ?? 0,
      rerankScore: sc.score,
    }));
  } else {
    candidates = fused.slice(0, topK).map((f) => ({
      chunk: f.item.chunk,
      vectorSimilarity: vectorById.get(f.key) ?? 0,
      lexicalScore: lexicalById.get(f.key) ?? 0,
      fusedScore: f.score,
      rerankScore: null,
    }));
  }

  return { query, candidates, topSimilarity };
}

/**
 * Build a ready-to-use retriever from a loaded artifact (task 19's entry point).
 * Wires InMemoryVectorStore + Bm25Index over `artifact.chunks`.
 *
 * Front-loads the dimension check (C5): an artifact built with one embedder but
 * loaded with another fails once, clearly, here — not as a per-query length
 * mismatch deep in the vector scan.
 */
export function createRetriever(
  artifact: IndexArtifact,
  deps: { embedder: Embedder; reranker?: Reranker }
): { retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult> } {
  if (artifact.dimensions !== deps.embedder.dimensions) {
    throw new Error(
      `createRetriever: artifact dimensions ${artifact.dimensions} != embedder dimensions ${deps.embedder.dimensions}`
    );
  }
  const vectorStore = new InMemoryVectorStore(artifact.chunks, artifact.dimensions);
  const lexical = new Bm25Index(artifact.chunks);
  return {
    retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult> {
      return retrieve(query, { embedder: deps.embedder, vectorStore, lexical, reranker: deps.reranker }, opts);
    },
  };
}
