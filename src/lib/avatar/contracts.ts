// Server-only: do not import in client-side islands.
//
// PINNED provider contract — see docs/persona.md ("Shared contracts").
// Consumed verbatim by tasks 18 (index builder), 19 (query endpoint),
// 21 (reindex), 22 (red-team). Change the index-artifact shape HERE, never
// re-invent it downstream.
//
// NFR-4 note: `LLMProvider` is defined here but is NOT imported by
// `retrieval.ts` or `threshold.ts`. Only the task-19 endpoint calls it, on the
// grounded branch. That separation makes the "I don't know" gate a structural
// guarantee, not a matter of discipline.

/** A single indexed unit: one markdown section of a published post/page. */
export interface IndexChunk {
  /** Stable id, unique within the artifact. Convention: `${slug}#${headingAnchor}#${ordinal}`. */
  id: string;
  /** Article/Project slug — the incremental upsert/delete key (FR-E3, app-ia §4). */
  slug: string;
  /** Locale of the source content (D-004). Available for downstream filtering. */
  lang: 'fr' | 'en';
  /** Citation target: canonical page URL. */
  sourceUrl: string;
  /** Citation target: in-page heading anchor; '' for the lead/intro section. */
  headingAnchor: string;
  /** Display title for the citation (post or section title). */
  title: string;
  /** Plain-text chunk body — fed to the lexical leg and (later) to synthesis. */
  text: string;
  /** Dense embedding; length MUST equal `IndexArtifact.dimensions`. */
  embedding: number[];
}

/**
 * The static index artifact: built at deploy time (task 18), loaded by the
 * Pages Function (task 19), refreshed incrementally (task 21).
 * PINNED — downstream tasks read this shape; do not fork it.
 */
export interface IndexArtifact {
  /** Artifact schema version. Start at 1; bump on breaking shape changes. */
  version: number;
  /** Embedding model/provider id used to produce every vector (provenance). */
  embeddingModel: string;
  /** Embedding length; every chunk.embedding.length must equal this. */
  dimensions: number;
  /** Build timestamp (ISO string). Builder fills it; fixtures use a literal. */
  generatedAt: string;
  /**
   * Per-slug content hash — the incremental-reindex key (FR-E3, tasks 18/21).
   * On publish: re-embed only slugs whose hash changed; delete chunks whose
   * slug is absent here. Keyed by Article/Project slug (NOT per-chunk).
   */
  sourceHashes: Record<string, string>;
  /** Every indexed chunk across both languages. */
  chunks: IndexChunk[];
}

/** A chunk paired with one leg's native score (cosine, BM25, or rerank relevance). */
export interface ScoredChunk {
  chunk: IndexChunk;
  /** Vector leg: cosine in [-1, 1]. Lexical leg: BM25 (>= 0). Rerank: relevance. */
  score: number;
}

/** A retrieval candidate carrying all accumulated evidence. */
export interface Candidate {
  chunk: IndexChunk;
  /** Cosine from the vector leg; 0 if this chunk was not in the vector top-N. */
  vectorSimilarity: number;
  /** BM25 from the lexical leg; 0 if not in the lexical top-N. */
  lexicalScore: number;
  /** Reciprocal Rank Fusion score (sum of 1/(k+rank) across legs). */
  fusedScore: number;
  /** Reranker relevance if a reranker ran; `null` when no rerank was applied. */
  rerankScore: number | null;
}

/**
 * Output of `retrieve()`. `candidates` are ordered best-first (rerank order if a
 * reranker ran, else fused order). `topSimilarity` is the corpus's MAX cosine
 * taken from the vector leg's #1 result BEFORE fusion/truncation — the gate signal.
 */
export interface RetrievalResult {
  query: string;
  candidates: Candidate[];
  topSimilarity: number;
}

/** The threshold gate's decision. Discriminated on `kind`. */
export type ThresholdOutcome =
  | {
      kind: 'grounded';
      chunks: Candidate[];
      topSimilarity: number;
      threshold: number;
    }
  | {
      kind: 'idk';
      nearMisses: Candidate[];
      topSimilarity: number;
      threshold: number;
    };

/**
 * Turns text into dense vectors. Real impl (post-secret) targets the
 * multilingual embeddings provider (OQ-5) behind this seam.
 */
export interface Embedder {
  /** Provider/model id, copied into IndexArtifact.embeddingModel. */
  readonly model: string;
  /** Output vector length. */
  readonly dimensions: number;
  /** Batch-embed (used by the builder, task 18). Order-preserving. */
  embed(texts: string[]): Promise<number[][]>;
  /** Embed one query (used by retrieval). */
  embedQuery(text: string): Promise<number[]>;
}

/**
 * Restriction applied to a search BEFORE ranking and truncation — a specification
 * the store satisfies natively (SQL `WHERE`, an id lookup, an in-memory filter),
 * never a filter the caller applies to the results.
 *
 * That distinction is the whole point. Post-filtering a global top-k silently
 * degrades as the corpus grows: the scoped article's chunks stop making the cut,
 * so its best chunk never reaches the gate and an on-article question refuses.
 * Every impl MUST honour `slug` exactly (Liskov): the returned top-k is the top-k
 * OF THE SCOPED SUBSET, whatever the corpus size.
 */
export interface SearchScope {
  /** Restrict to one article's chunks. Omit for corpus-wide search. */
  slug?: string;
}

/**
 * Dense nearest-neighbour search over the indexed chunks. Real swap-in: a
 * managed vector DB. MVP impl: InMemoryVectorStore (vector-store.ts).
 */
export interface VectorStore {
  /**
   * Top-k by cosine, sorted descending. `score` is cosine in [-1, 1].
   * When `scope.slug` is set, the top-k is over that article's chunks only.
   */
  search(
    queryEmbedding: number[],
    topK: number,
    scope?: SearchScope
  ): Promise<ScoredChunk[]>;
}

/**
 * Optional cross-encoder rerank of fused candidates (rag-avatar §2: "optionally
 * one rerank"). Absent/disabled is a valid configuration.
 */
export interface Reranker {
  readonly model: string;
  rerank(
    query: string,
    candidates: ScoredChunk[],
    topK: number
  ): Promise<ScoredChunk[]>;
}

/** One chat message for the synthesis LLM. */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** A synthesis request (citations-precede-prose is the caller's prompt concern). */
export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
  model?: string;
  temperature?: number;
}

/**
 * Streamed synthesis (consumed by task 19). Real impl targets OpenRouter
 * (https://openrouter.ai/api/v1, OPENROUTER_API_KEY) — NOT the Anthropic API.
 */
export interface LLMProvider {
  readonly model: string;
  /** Yields answer deltas (tokens/segments) for SSE streaming (NFR-2). */
  stream(request: LlmRequest): AsyncIterable<string>;
}
