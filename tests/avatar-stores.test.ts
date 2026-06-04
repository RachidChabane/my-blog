import { describe, it, expect } from 'vitest';
import { rowToChunk, type ChunkRow } from '@/lib/avatar/d1';
import {
  VectorizeVectorStore,
  VECTORIZE_MAX_TOPK,
} from '@/lib/avatar/vectorize-store';
import { D1LexicalStore, toFtsMatch } from '@/lib/avatar/d1-lexical';
import { retrieve } from '@/lib/avatar/retrieval';
import { FakeEmbedder } from '@/lib/avatar/fakes';
import type {
  D1Database,
  D1PreparedStatement,
  VectorizeIndex,
  VectorizeMatch,
} from '@/lib/avatar/cf';

function row(id: string, over: Partial<ChunkRow> = {}): ChunkRow {
  return {
    id,
    slug: id.split('#')[0],
    lang: 'en',
    source_url: `https://x/${id}`,
    heading_anchor: '',
    title: `Title ${id}`,
    text: `Text for ${id}`,
    ordinal: 0,
    ...over,
  };
}

/** Fake D1: the FTS JOIN returns `ftsRows`; the `IN (...)` hydration maps bound ids. */
function fakeD1(
  rowsById: Record<string, ChunkRow>,
  ftsRows: (ChunkRow & { score: number })[] = []
): D1Database {
  return {
    prepare(sql: string): D1PreparedStatement {
      const isFts = sql.includes('chunks_fts');
      let bound: unknown[] = [];
      const stmt: D1PreparedStatement = {
        bind(...vals: unknown[]) {
          bound = vals;
          return stmt;
        },
        all<T = Record<string, unknown>>() {
          const results = isFts
            ? (ftsRows as unknown as T[])
            : (bound
                .map((id) => rowsById[id as string])
                .filter(Boolean) as unknown as T[]);
          return Promise.resolve({ results, success: true, meta: {} });
        },
        run<T = Record<string, unknown>>() {
          return Promise.resolve({
            results: [] as T[],
            success: true,
            meta: {},
          });
        },
        first<T = unknown>() {
          return Promise.resolve(null as T | null);
        },
      };
      return stmt;
    },
    batch() {
      return Promise.resolve([]);
    },
    exec() {
      return Promise.resolve({ count: 0, duration: 0 });
    },
  };
}

function fakeVectorize(matches: VectorizeMatch[]): VectorizeIndex {
  return {
    query: () => Promise.resolve({ matches, count: matches.length }),
    upsert: () => Promise.resolve({ ids: [], count: 0 }),
    insert: () => Promise.resolve({ ids: [], count: 0 }),
    deleteByIds: () => Promise.resolve({ ids: [], count: 0 }),
  };
}

describe('rowToChunk', () => {
  it('maps snake_case columns to the IndexChunk shape (empty embedding)', () => {
    const c = rowToChunk(
      row('a#h#1', {
        lang: 'fr',
        heading_anchor: 'h',
        source_url: 'https://x/a',
      })
    );
    expect(c).toMatchObject({
      id: 'a#h#1',
      slug: 'a',
      lang: 'fr',
      sourceUrl: 'https://x/a',
      headingAnchor: 'h',
    });
    expect(c.embedding).toEqual([]); // vector lives in Vectorize
  });

  it('coerces an unexpected lang to en', () => {
    expect(rowToChunk(row('a', { lang: 'es' })).lang).toBe('en');
  });
});

describe('toFtsMatch (FTS5 query escaping)', () => {
  it('quotes + OR-joins word tokens', () => {
    expect(toFtsMatch('hybrid retrieval fusion')).toBe(
      '"hybrid" OR "retrieval" OR "fusion"'
    );
  });

  it('neutralizes FTS5 operators in user input', () => {
    // `"` `*` `-` `:` `++` and a bare NEAR/OR must not reach FTS5 as operators.
    const m = toFtsMatch('c++ "rust* -drop NEAR:5 OR');
    expect(m).toBe('"c" OR "rust" OR "drop" OR "NEAR" OR "5" OR "OR"');
    // no raw double-quote-then-space-then-star etc. — every term is a closed phrase
    expect(m).not.toContain('*');
    expect(m).not.toContain(':');
  });

  it('returns empty string for punctuation-only / empty input', () => {
    expect(toFtsMatch('   ***  ')).toBe('');
    expect(toFtsMatch('')).toBe('');
  });
});

describe('VectorizeVectorStore', () => {
  it('queries Vectorize, hydrates chunks from D1, preserves match order/score', async () => {
    const store = new VectorizeVectorStore(
      fakeVectorize([
        { id: 'a#h#0', score: 0.91 },
        { id: 'b#h#0', score: 0.42 },
      ]),
      fakeD1({ 'a#h#0': row('a#h#0'), 'b#h#0': row('b#h#0') })
    );
    const out = await store.search([0, 0, 0], 10);
    expect(out.map((s) => s.chunk.id)).toEqual(['a#h#0', 'b#h#0']);
    expect(out.map((s) => s.score)).toEqual([0.91, 0.42]);
  });

  it('clamps query topK to the Vectorize ceiling (wide scoped pull never throws)', async () => {
    const sink = { topK: -1 };
    const recording: VectorizeIndex = {
      query: (_v, opts) => {
        sink.topK = opts?.topK ?? -1;
        return Promise.resolve({ matches: [], count: 0 });
      },
      upsert: () => Promise.resolve({ ids: [], count: 0 }),
      insert: () => Promise.resolve({ ids: [], count: 0 }),
      deleteByIds: () => Promise.resolve({ ids: [], count: 0 }),
    };
    const store = new VectorizeVectorStore(recording, fakeD1({}));
    await store.search([0], 500); // a wide scoped pull above the cap
    expect(sink.topK).toBe(VECTORIZE_MAX_TOPK);
    await store.search([0], 10); // under the cap -> passed through unchanged
    expect(sink.topK).toBe(10);
  });

  it('skips an orphaned vector id (no matching D1 row)', async () => {
    const store = new VectorizeVectorStore(
      fakeVectorize([
        { id: 'gone#h#0', score: 0.9 },
        { id: 'a#h#0', score: 0.5 },
      ]),
      fakeD1({ 'a#h#0': row('a#h#0') })
    );
    const out = await store.search([0], 10);
    expect(out.map((s) => s.chunk.id)).toEqual(['a#h#0']);
  });
});

describe('D1LexicalStore', () => {
  it('returns hydrated chunks with bm25 sign flipped to positive', async () => {
    const store = new D1LexicalStore(
      fakeD1({}, [
        { ...row('a#h#0'), score: -2.5 },
        { ...row('b#h#0'), score: -1.0 },
      ])
    );
    const out = await store.search('hybrid', 10);
    expect(out.map((s) => s.chunk.id)).toEqual(['a#h#0', 'b#h#0']);
    expect(out.map((s) => s.score)).toEqual([2.5, 1.0]); // >= 0 per the ScoredChunk contract
  });

  it('returns [] for a query with no word tokens (no MATCH issued)', async () => {
    const store = new D1LexicalStore(fakeD1({}, [{ ...row('a'), score: -1 }]));
    expect(await store.search('***', 10)).toEqual([]);
  });
});

describe('retrieve() over Vectorize + D1 (await-widened lexical leg)', () => {
  it('fuses the dense + lexical legs by id and gates on the vector top score', async () => {
    const rows = {
      'a#h#0': row('a#h#0'),
      'b#h#0': row('b#h#0'),
      'c#h#0': row('c#h#0'),
    };
    const vectorStore = new VectorizeVectorStore(
      fakeVectorize([
        { id: 'a#h#0', score: 0.88 },
        { id: 'b#h#0', score: 0.4 },
      ]),
      fakeD1(rows)
    );
    const lexical = new D1LexicalStore(
      fakeD1(rows, [
        { ...rows['b#h#0'], score: -3 },
        { ...rows['c#h#0'], score: -1 },
      ])
    );
    const result = await retrieve(
      'hybrid retrieval',
      { embedder: new FakeEmbedder(), vectorStore, lexical },
      { topK: 3 }
    );
    // topSimilarity = the vector leg's #1 cosine, captured before fusion.
    expect(result.topSimilarity).toBeCloseTo(0.88);
    const ids = result.candidates.map((c) => c.chunk.id);
    expect(ids).toContain('a#h#0');
    expect(ids).toContain('b#h#0'); // in both legs -> strong fused rank
    expect(ids).toContain('c#h#0');
    // b appears in both legs, so it should outrank c (lexical-only) and a (vector-only)
    expect(ids[0]).toBe('b#h#0');
  });
});
