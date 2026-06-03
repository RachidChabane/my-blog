// Server-only: do not import in client-side islands.
//
// D1 chunk hydration for the avatar RAG: map chunk rows -> IndexChunk and bulk-load
// by id. The dense vector is NOT stored in D1 (it lives in Vectorize), so the
// hydrated `embedding` is empty — retrieval never reads it after the legs run
// (topSimilarity comes from Vectorize's score; downstream uses text/title/sourceUrl).

import type { D1Database } from './cf';
import type { IndexChunk } from './contracts';

export interface ChunkRow {
  id: string;
  slug: string;
  lang: string;
  source_url: string;
  heading_anchor: string;
  title: string;
  text: string;
  ordinal: number;
}

/** Column list shared by the dense-hydration SELECT and the lexical JOIN. */
export const CHUNK_COLUMNS =
  'id, slug, lang, source_url, heading_anchor, title, text, ordinal';

export function rowToChunk(row: ChunkRow): IndexChunk {
  return {
    id: row.id,
    slug: row.slug,
    lang: row.lang === 'fr' ? 'fr' : 'en',
    sourceUrl: row.source_url,
    headingAnchor: row.heading_anchor,
    title: row.title,
    text: row.text,
    embedding: [], // vector lives in Vectorize; not read after the legs run
  };
}

/** Bulk-hydrate chunks by id (`IN (...)`). Returns a Map id -> IndexChunk. */
export async function loadChunksByIds(
  db: D1Database,
  ids: string[]
): Promise<Map<string, IndexChunk>> {
  const map = new Map<string, IndexChunk>();
  if (ids.length === 0) return map;
  const placeholders = ids.map(() => '?').join(',');
  const { results } = await db
    .prepare(
      `SELECT ${CHUNK_COLUMNS} FROM chunks WHERE id IN (${placeholders})`
    )
    .bind(...ids)
    .all<ChunkRow>();
  for (const row of results) map.set(row.id, rowToChunk(row));
  return map;
}
