// Server-only: do not import in client-side islands.
//
// The production lexical leg: D1 FTS5 BM25. A single MATCH JOINs to `chunks` so each
// hit returns the full chunk + its bm25 score. The user query is ESCAPED into a
// quoted FTS5 MATCH string so operators (`"` `*` `-` `OR` `NEAR` `:`) in input can't
// throw a syntax error (the lexical leg would 500) or silently alter the query.

import type { ScoredChunk } from './contracts';
import type { D1Database } from './cf';
import type { LexicalSearcher } from './retrieval';
import { rowToChunk, type ChunkRow } from './d1';

/**
 * Turn an arbitrary user query into a safe FTS5 MATCH expression: extract word
 * tokens (letters/digits/underscore runs), wrap each as a quoted phrase (doubling
 * any internal `"`), and OR-join them — any term may match; RRF ranks the hits.
 * Diacritics are kept here; the `remove_diacritics 2` tokenizer folds them on both
 * the index and the query side. Empty input -> '' (caller returns no hits).
 */
export function toFtsMatch(query: string): string {
  const tokens = query.match(/[\p{L}\p{N}_]+/gu) ?? [];
  return tokens.map((t) => `"${t.replace(/"/g, '""')}"`).join(' OR ');
}

export class D1LexicalStore implements LexicalSearcher {
  constructor(private readonly db: D1Database) {}

  async search(query: string, topK: number): Promise<ScoredChunk[]> {
    const match = toFtsMatch(query);
    if (!match) return [];
    const { results } = await this.db
      .prepare(
        `SELECT c.id, c.slug, c.lang, c.source_url, c.heading_anchor, c.title,
                c.text, c.ordinal, bm25(chunks_fts) AS score
         FROM chunks_fts JOIN chunks c ON c.id = chunks_fts.chunk_id
         WHERE chunks_fts MATCH ? ORDER BY score LIMIT ?`
      )
      .bind(match, topK)
      .all<ChunkRow & { score: number }>();
    // bm25() is negative (more negative = better); flip to a positive score so it
    // honors the ScoredChunk "BM25 (>= 0)" contract. RRF only uses rank order, so
    // the sign never affects fusion.
    return results.map((row) => ({
      chunk: rowToChunk(row),
      score: -row.score,
    }));
  }
}
