// Server-only: do not import in client-side islands.
//
// Turn an IndexArtifact into the two deploy payloads that populate the avatar store:
//   - Vectorize NDJSON: one vector per chunk ({ id, values }) for `wrangler vectorize
//     upsert --file`.
//   - D1 SQL: a FULL-REPLACE script (wipe + repopulate chunks / chunks_fts /
//     source_hashes / index_meta) for `wrangler d1 execute --remote --file`.
//
// Pure + deterministic — the wrangler shell-out lives in scripts/seed-avatar-index.ts.
// A full replace (not per-slug incremental) keeps this simple + correct: at one
// article/day the corpus is small and bge-m3 re-embedding is ~$0, so the cost of a
// full rebuild is negligible. (Incremental upsert/delete is a future optimization.)

import type { IndexArtifact, IndexChunk } from './contracts';

/** Vectorize NDJSON — one `{ id, values }` line per chunk (upsert replaces by id). */
export function toVectorizeNdjson(artifact: IndexArtifact): string {
  return artifact.chunks
    .map((c) => JSON.stringify({ id: c.id, values: c.embedding }))
    .join('\n');
}

/** SQLite single-quote escaping for a string literal. */
function sqlStr(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

/** The chunk ordinal is the last `#`-segment of the id (`${slug}#${anchor}#${ordinal}`). */
function ordinalFromId(id: string): number {
  const n = Number(id.slice(id.lastIndexOf('#') + 1));
  return Number.isFinite(n) ? n : 0;
}

function insertChunk(c: IndexChunk): string {
  return (
    'INSERT INTO chunks (id, slug, lang, source_url, heading_anchor, title, text, ordinal) ' +
    `VALUES (${sqlStr(c.id)}, ${sqlStr(c.slug)}, ${sqlStr(c.lang)}, ${sqlStr(c.sourceUrl)}, ` +
    `${sqlStr(c.headingAnchor)}, ${sqlStr(c.title)}, ${sqlStr(c.text)}, ${ordinalFromId(c.id)});`
  );
}

/**
 * A full-replace D1 script: wipe the four tables, then repopulate chunks + the
 * FTS5 mirror + per-slug hashes + provenance. All string values are
 * single-quote-escaped.
 *
 * NO explicit `BEGIN TRANSACTION`/`COMMIT`: the import path that runs this
 * (`wrangler d1 execute --remote --file`, used by build:index + reindex.yml)
 * REJECTS file-level SQL transactions ("To execute a transaction, please use the
 * state.storage.transaction() API … BEGIN TRANSACTION … is [not allowed]") and is
 * ALREADY atomic — a failed import rolls the DB back to its prior state. The wrapper
 * was therefore both redundant and fatal. Ordering the four DELETEs ahead of every
 * INSERT keeps the replace all-or-nothing within that import.
 */
export function toD1Sql(artifact: IndexArtifact): string {
  const lines: string[] = [];
  for (const table of ['chunks', 'chunks_fts', 'source_hashes', 'index_meta']) {
    lines.push(`DELETE FROM ${table};`);
  }
  for (const c of artifact.chunks) {
    lines.push(insertChunk(c));
    lines.push(
      `INSERT INTO chunks_fts (chunk_id, text) VALUES (${sqlStr(c.id)}, ${sqlStr(c.text)});`
    );
  }
  for (const [slug, hash] of Object.entries(artifact.sourceHashes)) {
    lines.push(
      `INSERT INTO source_hashes (slug, hash) VALUES (${sqlStr(slug)}, ${sqlStr(hash)});`
    );
  }
  for (const [key, value] of [
    ['embedding_model', artifact.embeddingModel],
    ['dimensions', String(artifact.dimensions)],
    ['generated_at', artifact.generatedAt],
  ]) {
    lines.push(
      `INSERT INTO index_meta (key, value) VALUES (${sqlStr(key)}, ${sqlStr(value)});`
    );
  }
  return lines.join('\n') + '\n';
}
