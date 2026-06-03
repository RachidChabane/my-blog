import { describe, it, expect } from 'vitest';
import { reindex, selectMode } from '@/lib/avatar/reindex';
import type { SourceDoc } from '@/lib/avatar/index-build';
import { FakeEmbedder } from '@/lib/avatar/fakes';
import { chunkDocument } from '@/lib/avatar/chunk';
import type { Embedder, IndexArtifact } from '@/lib/avatar/contracts';

const GEN = '2026-06-03T00:00:00.000Z'; // injected generatedAt literal (determinism)
const SITE = 'https://test.example';

/**
 * Wraps an embedder to count embed() calls + capture every text it sees, so a
 * test can prove reuse skips unchanged slugs (zero re-embeds). Copied from
 * avatar-index.test.ts (test helpers are not shared across files).
 */
class CountingEmbedder implements Embedder {
  readonly model: string;
  readonly dimensions: number;
  readonly batches: string[][] = [];
  constructor(private readonly inner: Embedder) {
    this.model = inner.model;
    this.dimensions = inner.dimensions;
  }
  embed(texts: string[]): Promise<number[][]> {
    this.batches.push(texts);
    return this.inner.embed(texts);
  }
  embedQuery(text: string): Promise<number[]> {
    return this.inner.embedQuery(text);
  }
  get embeddedTexts(): string[] {
    return this.batches.flat();
  }
}

/** Build a SourceDoc with sensible defaults; override any field. */
function doc(over: Partial<SourceDoc> & { slug: string }): SourceDoc {
  return {
    kind: 'article',
    lang: 'en',
    title: `Title ${over.slug}`,
    summary: '',
    body: `Body for ${over.slug} with several words.`,
    pageUrl: `${SITE}/en/blog/${over.slug}/`,
    ...over,
  };
}

/** Three single-chunk docs (no headings), deterministic content. */
function simpleSources(): SourceDoc[] {
  return [
    doc({ slug: 'x', body: 'Xenon retrieval vectors content alpha.' }),
    doc({ slug: 'y', body: 'Yarrow astro deployment content beta.' }),
    doc({ slug: 'z', body: 'Zephyr serverless edge content gamma.' }),
  ];
}

/** Seed a valid prior via a full build (same FakeEmbedder identity as the tests). */
async function seedPrior(sources = simpleSources()): Promise<IndexArtifact> {
  return (
    await reindex({
      mode: 'full',
      sources,
      embedder: new FakeEmbedder(),
      generatedAt: GEN,
    })
  ).artifact;
}

// ---------------------------------------------------------------------------
// reindex() — the mode-aware wrapper contract (task 21, FR-E3)
// ---------------------------------------------------------------------------
describe('reindex', () => {
  it('incremental: only changed slugs re-embedded + stale removed', async () => {
    const prior = await seedPrior();

    const next = simpleSources().filter((d) => d.slug !== 'z'); // drop z
    const yi = next.findIndex((d) => d.slug === 'y');
    next[yi] = { ...next[yi], body: `${next[yi].body} EDITED zappa token` };

    const counter = new CountingEmbedder(new FakeEmbedder());
    const { artifact, report } = await reindex({
      mode: 'incremental',
      sources: next,
      prior,
      embedder: counter,
      generatedAt: GEN,
    });

    expect(report.changedSlugs).toEqual(['y']);
    expect(report.removedSlugs).toEqual(['z']);
    expect(report.reusedSlugs).toEqual(['x']);
    expect(report.changed).toBe(true);

    // y's new text WAS embedded; x's (reused) text was NOT.
    const yText = chunkDocument(next[yi])[0].text;
    expect(counter.embeddedTexts).toContain(yText);
    const xText = chunkDocument(simpleSources()[0])[0].text;
    expect(counter.embeddedTexts).not.toContain(xText);

    // z dropped entirely — no chunk, no hash.
    expect(artifact.chunks.some((c) => c.slug === 'z')).toBe(false);
    expect(artifact.sourceHashes['z']).toBeUndefined();
  });

  it('full IGNORES a valid matching prior and re-embeds everything', async () => {
    const prior = await seedPrior(); // valid: same embedder identity, hashes all match

    const counter = new CountingEmbedder(new FakeEmbedder());
    const { report } = await reindex({
      mode: 'full',
      sources: simpleSources(),
      prior,
      embedder: counter,
      generatedAt: GEN,
    });

    expect(report.changedSlugs.slice().sort()).toEqual(['x', 'y', 'z']);
    expect(report.reusedSlugs).toEqual([]);
    expect(report.removedSlugs).toEqual([]);
    expect(report.changed).toBe(true);
    expect(counter.embeddedTexts).toHaveLength(3); // every text re-embedded despite a valid prior

    // Contrast: incremental with that SAME prior re-embeds nothing.
    const counter2 = new CountingEmbedder(new FakeEmbedder());
    await reindex({
      mode: 'incremental',
      sources: simpleSources(),
      prior,
      embedder: counter2,
      generatedAt: GEN,
    });
    expect(counter2.embeddedTexts).toHaveLength(0);
  });

  it('incremental no-op → changed === false, deep-equal artifact, zero re-embeds', async () => {
    const prior = await seedPrior();

    const counter = new CountingEmbedder(new FakeEmbedder());
    const { artifact, report } = await reindex({
      mode: 'incremental',
      sources: simpleSources(),
      prior,
      embedder: counter,
      generatedAt: GEN,
    });

    expect(report.changed).toBe(false);
    expect(report.changedSlugs).toEqual([]);
    expect(report.removedSlugs).toEqual([]);
    expect(report.reusedSlugs.slice().sort()).toEqual(['x', 'y', 'z']);
    expect(counter.embeddedTexts).toHaveLength(0);
    expect(artifact).toEqual(prior); // build twice = deep-equal
  });

  it('incremental with a prior from a DIFFERENT embedder → full re-embed', async () => {
    const prior = (
      await reindex({
        mode: 'full',
        sources: simpleSources(),
        embedder: new FakeEmbedder(256),
        generatedAt: GEN,
      })
    ).artifact;

    const { artifact, report } = await reindex({
      mode: 'incremental',
      sources: simpleSources(),
      prior,
      embedder: new FakeEmbedder(128), // different dims/model — invalidates reuse
      generatedAt: GEN,
    });

    expect(report.reusedSlugs).toEqual([]);
    expect(report.changedSlugs).toHaveLength(3);
    expect(artifact.dimensions).toBe(128);
  });

  it('incremental with prior = null ≡ full (the CI 404 fallback)', async () => {
    const a = await reindex({
      mode: 'incremental',
      sources: simpleSources(),
      prior: null,
      embedder: new FakeEmbedder(),
      generatedAt: GEN,
    });
    const b = await reindex({
      mode: 'full',
      sources: simpleSources(),
      embedder: new FakeEmbedder(),
      generatedAt: GEN,
    });

    expect(a.artifact).toEqual(b.artifact);
    expect(a.report.changedSlugs).toHaveLength(3);
    expect(b.report.changedSlugs).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// selectMode() — the trigger→mode policy (so the YAML stays dumb)
// ---------------------------------------------------------------------------
describe('selectMode', () => {
  it('maps triggers to modes; explicit dispatch override wins', () => {
    expect(selectMode('push')).toBe('incremental');
    expect(selectMode('schedule')).toBe('full');
    expect(selectMode('workflow_dispatch')).toBe('incremental');
    expect(selectMode('workflow_dispatch', 'full')).toBe('full');
    expect(selectMode('schedule', 'incremental')).toBe('incremental'); // override wins
    expect(selectMode(undefined)).toBe('incremental');
  });
});
