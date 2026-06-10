import { describe, it, expect, beforeAll } from 'vitest';
import {
  toVectorizeNdjson,
  toD1Sql,
  computeOrphanIds,
} from '@/lib/avatar/index-sink';
import { buildFixtureArtifact, FakeEmbedder } from '@/lib/avatar/fakes';
import type { IndexArtifact } from '@/lib/avatar/contracts';

let artifact: IndexArtifact;
beforeAll(async () => {
  artifact = await buildFixtureArtifact(new FakeEmbedder());
});

describe('toVectorizeNdjson', () => {
  it('emits one {id, values} line per chunk', () => {
    const lines = toVectorizeNdjson(artifact).split('\n');
    expect(lines).toHaveLength(artifact.chunks.length);
    const first = JSON.parse(lines[0]) as { id: string; values: number[] };
    expect(first.id).toBe(artifact.chunks[0].id);
    expect(first.values).toEqual(artifact.chunks[0].embedding);
    expect(first.values).toHaveLength(artifact.dimensions);
  });

  it('produces valid JSON on every line', () => {
    for (const line of toVectorizeNdjson(artifact).split('\n')) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
  });
});

describe('toD1Sql', () => {
  it('wipes all four tables before any insert, with NO file-level transaction', () => {
    const sql = toD1Sql(artifact);
    // D1's `wrangler d1 execute --remote --file` import REJECTS file-level
    // BEGIN TRANSACTION/COMMIT and is itself atomic, so the script must not emit them.
    expect(sql).not.toContain('BEGIN TRANSACTION');
    expect(sql).not.toContain('COMMIT;');
    const firstInsert = sql.indexOf('INSERT INTO');
    expect(firstInsert).toBeGreaterThan(0);
    for (const table of [
      'chunks',
      'chunks_fts',
      'source_hashes',
      'index_meta',
    ]) {
      const del = sql.indexOf(`DELETE FROM ${table};`);
      expect(del).toBeGreaterThanOrEqual(0);
      // every wipe precedes every insert -> the replace stays all-or-nothing
      expect(del).toBeLessThan(firstInsert);
    }
  });

  it('inserts every chunk into chunks + the FTS mirror with its ordinal', () => {
    const sql = toD1Sql(artifact);
    for (const c of artifact.chunks) {
      expect(sql).toContain(
        `INSERT INTO chunks_fts (chunk_id, text) VALUES ('${c.id}',`
      );
      const ordinal = Number(c.id.slice(c.id.lastIndexOf('#') + 1));
      expect(sql).toContain(`, ${ordinal});`);
    }
  });

  it('records provenance + per-slug hashes', () => {
    const sql = toD1Sql(artifact);
    expect(sql).toContain(
      `INSERT INTO index_meta (key, value) VALUES ('embedding_model', '${artifact.embeddingModel}');`
    );
    expect(sql).toContain(
      `INSERT INTO index_meta (key, value) VALUES ('dimensions', '${artifact.dimensions}');`
    );
    for (const slug of Object.keys(artifact.sourceHashes)) {
      expect(sql).toContain(
        `INSERT INTO source_hashes (slug, hash) VALUES ('${slug}',`
      );
    }
  });

  it("escapes single quotes in text (apostrophes can't break the SQL)", () => {
    const tricky: IndexArtifact = {
      ...artifact,
      chunks: [
        {
          id: 'x#intro#0',
          slug: 'x',
          lang: 'en',
          sourceUrl: 'https://x/',
          headingAnchor: '',
          title: "O'Brien's note",
          text: "l'allure d'aujourd'hui",
          embedding: [0, 0, 0],
        },
      ],
      sourceHashes: { x: 'h1' },
    };
    const sql = toD1Sql(tricky);
    expect(sql).toContain("'O''Brien''s note'");
    expect(sql).toContain("'l''allure d''aujourd''hui'");
    // every INSERT/DELETE/transaction line is balanced on single quotes
    for (const line of sql.split('\n')) {
      expect((line.match(/'/g) ?? []).length % 2).toBe(0);
    }
  });
});

describe('computeOrphanIds', () => {
  it('returns prior ids absent from the current set (the slugs to purge)', () => {
    const prior = ['a#i#0', 'a#i#1', 'gone#i#0', 'gone#i#1'];
    const current = ['a#i#0', 'a#i#1', 'new#i#0'];
    expect(computeOrphanIds(prior, current)).toEqual(['gone#i#0', 'gone#i#1']);
  });

  it('returns [] when nothing was removed (no over-deletion of current vectors)', () => {
    const ids = ['a#i#0', 'b#i#0'];
    expect(computeOrphanIds(ids, ids)).toEqual([]);
    // a pure superset in current (a fresh article added) also yields no orphans
    expect(computeOrphanIds(ids, [...ids, 'c#i#0'])).toEqual([]);
  });

  it('handles an empty prior (first deploy) and dedupes the prior set', () => {
    expect(computeOrphanIds([], ['a#i#0'])).toEqual([]);
    expect(computeOrphanIds(['x#i#0', 'x#i#0'], [])).toEqual(['x#i#0']);
  });
});
