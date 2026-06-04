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

/**
 * The lexical (BM25) leg. The in-memory `Bm25Index` (sync) and the D1 FTS5 store
 * (async) both satisfy this — `retrieve()` awaits the result either way, so the
 * production swap (in-memory -> D1) needs no change to the fusion logic.
 */
export interface LexicalSearcher {
  search(query: string, topK: number): ScoredChunk[] | Promise<ScoredChunk[]>;
}

export interface RetrieveDeps {
  embedder: Embedder;
  vectorStore: VectorStore;
  lexical: LexicalSearcher;
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
  /**
   * Restrict retrieval to a single article (its slug) — the per-article "ask about
   * this piece" mode. Both legs are filtered to this slug BEFORE the gate signal is
   * captured, so an out-of-scope query honestly refuses (topSimilarity over the
   * scoped subset) instead of passing on an out-of-scope chunk.
   */
  scopeSlug?: string;
}

const DEFAULT_LEG_TOP_K = 30;
const DEFAULT_TOP_K = 5;
// When scoped, pull a WIDE leg so the in-scope chunks are present before the slug filter:
// the stores have no slug pre-filter (slug is known only post-hydration), so a default-30
// pull could miss an article's chunks for an off-topic query. Capped at Cloudflare
// Vectorize's max query topK (VECTORIZE_MAX_TOPK = 100) so the production dense leg never
// throws; the corpus is far under 100 chunks, so this returns the whole corpus and never
// truncates today. Beyond 100 chunks, scoped retrieval needs a Vectorize reindex with slug
// metadata (a true pre-filter) -- see avatar-index-builder-seams.
const SCOPED_LEG_TOP_K = 100;

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
  const scopeSlug = opts?.scopeSlug;
  // legTopK >= topK always: the per-leg pull must be at least the final count. When scoped,
  // widen the default pull so the in-scope chunks survive the slug filter below.
  const baseLegTopK =
    opts?.legTopK ?? (scopeSlug ? SCOPED_LEG_TOP_K : DEFAULT_LEG_TOP_K);
  const legTopK = Math.max(baseLegTopK, topK);
  const rrfK = opts?.rrfK ?? DEFAULT_RRF_K;

  const queryEmbedding = await deps.embedder.embedQuery(query);
  // Restrict both legs to the scoped article (if any) BEFORE the gate signal is captured.
  // The store results are still cosine/BM25-sorted, so filtering preserves order.
  const inScope = (r: ScoredChunk): boolean =>
    scopeSlug === undefined || r.chunk.slug === scopeSlug;
  const vectorResults = (
    await deps.vectorStore.search(queryEmbedding, legTopK)
  ).filter(inScope);
  // `await` covers both legs: in-memory Bm25Index (sync) and the D1 FTS5 store (async).
  const lexicalResults = (await deps.lexical.search(query, legTopK)).filter(
    inScope
  );

  // Gate signal: the vector leg is sorted by cosine, so [0].score is the max cosine of the
  // (possibly scoped) candidate set. Captured BEFORE fusion/rerank/truncation. When scoped,
  // this is the in-scope max -> an out-of-scope query has topSimilarity 0 -> honest refusal.
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
): {
  retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult>;
} {
  if (artifact.dimensions !== deps.embedder.dimensions) {
    throw new Error(
      `createRetriever: artifact dimensions ${artifact.dimensions} != embedder dimensions ${deps.embedder.dimensions}`
    );
  }
  const vectorStore = new InMemoryVectorStore(
    artifact.chunks,
    artifact.dimensions
  );
  const lexical = new Bm25Index(artifact.chunks);
  return {
    retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult> {
      return retrieve(
        query,
        {
          embedder: deps.embedder,
          vectorStore,
          lexical,
          reranker: deps.reranker,
        },
        opts
      );
    },
  };
}
