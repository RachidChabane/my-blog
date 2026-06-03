import { describe, it, expect, beforeAll } from 'vitest';
import { toVectorizeNdjson, toD1Sql } from '@/lib/avatar/index-sink';
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
  it('wraps a full replace in a transaction and wipes all four tables', () => {
    const sql = toD1Sql(artifact);
    expect(sql.startsWith('BEGIN TRANSACTION;')).toBe(true);
    expect(sql.trimEnd().endsWith('COMMIT;')).toBe(true);
    for (const table of [
      'chunks',
      'chunks_fts',
      'source_hashes',
      'index_meta',
    ]) {
      expect(sql).toContain(`DELETE FROM ${table};`);
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
