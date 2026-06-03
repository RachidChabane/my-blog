// Server-only: do not import in client-side islands.
//
// Minimal hand-rolled Cloudflare binding types for the avatar RAG. The repo
// deliberately avoids a global `@cloudflare/workers-types` dependency (it pollutes
// the Astro `astro check` globals and the EnvRecord index-signature — see the note
// in functions/api/avatar/query.ts#createLLMProvider). These are FAITHFUL minimal
// subsets of the official `.d.ts` (workers-types index.d.ts): only the members the
// avatar dense/lexical legs + index sink actually use. Keep them in lockstep with
// the official types if you widen usage.

// --- Workers AI (embeddings: @cf/baai/bge-m3 -> 1024-dim) ---
export interface AiTextEmbeddingsInput {
  text: string | string[];
}
export interface AiTextEmbeddingsOutput {
  shape: number[];
  data: number[][];
}
export interface AiBinding {
  run(
    model: '@cf/baai/bge-m3',
    input: AiTextEmbeddingsInput
  ): Promise<AiTextEmbeddingsOutput>;
}

// --- Vectorize (dense leg) ---
export interface VectorizeMatch {
  id: string;
  score: number;
  values?: number[];
  metadata?: Record<string, unknown>;
}
export interface VectorizeMatches {
  matches: VectorizeMatch[];
  count: number;
}
export interface VectorizeQueryOptions {
  topK?: number;
  returnValues?: boolean;
  returnMetadata?: boolean;
}
export interface VectorizeVector {
  id: string;
  values: number[];
  namespace?: string;
  metadata?: Record<string, unknown>;
}
export interface VectorizeVectorMutation {
  ids: string[];
  count: number;
}
export interface VectorizeIndex {
  query(
    vector: number[],
    options?: VectorizeQueryOptions
  ): Promise<VectorizeMatches>;
  upsert(vectors: VectorizeVector[]): Promise<VectorizeVectorMutation>;
  insert(vectors: VectorizeVector[]): Promise<VectorizeVectorMutation>;
  deleteByIds(ids: string[]): Promise<VectorizeVectorMutation>;
}

// --- D1 (lexical leg + chunk hydration) ---
export interface D1Result<T = Record<string, unknown>> {
  results: T[];
  success: boolean;
  meta: Record<string, unknown>;
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = unknown>(colName?: string): Promise<T | null>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}
