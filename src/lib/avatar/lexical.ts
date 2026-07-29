// Server-only: do not import in client-side islands.
//
// In-memory BM25 lexical leg + the shared tokenizer. The lexical leg is always
// in-memory and dependency-free, so it is an internal module, NOT one of the
// four pinned provider seams.

import type { IndexChunk, ScoredChunk } from './contracts';

/**
 * Lowercase, fold diacritics (NFD + strip combining marks), split on
 * non-alphanumerics, drop empties. Folding lets a FR query ("modele") match a
 * FR chunk written "Modèle", and is Unicode-safe via String.normalize.
 *
 * tokenize('Modèle Récupération')  → ['modele', 'recuperation']
 * tokenize('Astro, Cloudflare!')   → ['astro', 'cloudflare']
 */
export function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 0);
}

export interface Bm25Options {
  /** Term-frequency saturation. Default 1.5. */
  k1?: number;
  /** Length-normalization strength. Default 0.75. */
  b?: number;
}

interface Bm25Doc {
  chunk: IndexChunk;
  tf: Map<string, number>;
  len: number;
}

/**
 * Classic BM25 over the chunk corpus. Built once from the artifact's chunks.
 * No stopword list at MVP (multilingual; a FR+EN stoplist is overkill and risky)
 * — a future refinement.
 */
export class Bm25Index {
  private readonly docs: Bm25Doc[];
  private readonly df: Map<string, number>;
  private readonly n: number;
  private readonly avgdl: number;
  private readonly k1: number;
  private readonly b: number;

  constructor(chunks: readonly IndexChunk[], opts?: Bm25Options) {
    this.k1 = opts?.k1 ?? 1.5;
    this.b = opts?.b ?? 0.75;
    this.df = new Map();
    this.docs = [];

    let totalLen = 0;
    for (const chunk of chunks) {
      const tokens = tokenize(chunk.text);
      const tf = new Map<string, number>();
      for (const token of tokens) {
        tf.set(token, (tf.get(token) ?? 0) + 1);
      }
      for (const term of tf.keys()) {
        this.df.set(term, (this.df.get(term) ?? 0) + 1);
      }
      this.docs.push({ chunk, tf, len: tokens.length });
      totalLen += tokens.length;
    }

    this.n = this.docs.length;
    this.avgdl = this.n > 0 ? totalLen / this.n : 0;
  }

  /**
   * Top-k chunks by BM25, sorted descending (then by `chunk.id` ascending for
   * determinism). `score` is the BM25 sum (>= 0). Repeated query terms are
   * deduped (standard BM25-over-bag behaviour). Returns only chunks scoring > 0.
   * Empty corpus / empty query / `avgdl === 0` → [].
   *
   * `scope.slug` restricts which docs may be RETURNED, before truncation. The
   * corpus-level term statistics (idf, avgdl) are deliberately left global — they
   * describe the corpus, not the scoped subset, and recomputing them per article
   * would make a term's weight depend on which article you happen to be reading.
   */
  search(
    query: string,
    topK: number,
    scope?: { slug?: string }
  ): ScoredChunk[] {
    if (this.n === 0 || this.avgdl === 0) return [];
    const terms = [...new Set(tokenize(query))];
    if (terms.length === 0) return [];

    const scored: ScoredChunk[] = [];
    for (const doc of this.docs) {
      if (scope?.slug !== undefined && doc.chunk.slug !== scope.slug) continue;
      let score = 0;
      for (const term of terms) {
        const df = this.df.get(term);
        if (!df) continue;
        const f = doc.tf.get(term);
        if (!f) continue;
        const idf = Math.log(1 + (this.n - df + 0.5) / (df + 0.5));
        const denom =
          f + this.k1 * (1 - this.b + this.b * (doc.len / this.avgdl));
        score += (idf * (f * (this.k1 + 1))) / denom;
      }
      if (score > 0) scored.push({ chunk: doc.chunk, score });
    }

    scored.sort(
      (a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)
    );
    return scored.slice(0, topK);
  }
}
