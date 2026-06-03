-- Avatar RAG — D1 schema (M-3/M-4). Loaded by scripts/cf-provision.sh and the
-- reindex workflow. Idempotent (IF NOT EXISTS) so it is safe to re-run.
--
-- `chunks.id` is the JOIN KEY shared with the Vectorize vector ids
-- (`${slug}#${headingAnchor}#${ordinal}`): the dense leg (Vectorize.query) and the
-- lexical leg (FTS5 MATCH) both return ids, RRF fuses by id, then the fused top-k
-- is hydrated from `chunks` in one lookup. A reindex replaces a slug's rows
-- (DELETE … WHERE slug=? then INSERT) and deletes the same ids from Vectorize.

CREATE TABLE IF NOT EXISTS chunks (
  id             TEXT PRIMARY KEY,   -- == the Vectorize vector id
  slug           TEXT NOT NULL,
  lang           TEXT NOT NULL,      -- 'fr' | 'en'
  source_url     TEXT NOT NULL,
  heading_anchor TEXT NOT NULL,
  title          TEXT NOT NULL,
  text           TEXT NOT NULL,
  ordinal        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS chunks_by_slug ON chunks (slug);

-- FTS5 BM25 lexical leg. `unicode61 remove_diacritics 2` so accented FR terms match
-- (the default tokenizer tanks accented-term recall — "café" would miss "cafe").
-- `chunk_id` is UNINDEXED so a single MATCH returns the join key + bm25() score with
-- no secondary lookup; hydration of the FUSED top-k reads `chunks` by id.
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
  chunk_id UNINDEXED,
  text,
  tokenize = 'unicode61 remove_diacritics 2'
);

-- Per-slug content hash: the incremental-reindex key (re-embed only changed slugs).
CREATE TABLE IF NOT EXISTS source_hashes (
  slug TEXT PRIMARY KEY,
  hash TEXT NOT NULL
);

-- Global provenance: embedding model + dimensions + last build timestamp.
CREATE TABLE IF NOT EXISTS index_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
