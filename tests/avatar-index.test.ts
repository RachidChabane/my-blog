import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import GithubSlugger from 'github-slugger';
import {
  MAX_CHUNK_CHARS,
  chunkDocument,
  slugifyHeading,
} from '@/lib/avatar/chunk';
import {
  loadPublishedSources,
  contentHashOf,
  buildIndex,
} from '@/lib/avatar/index-build';
import type { SourceDoc } from '@/lib/avatar/index-build';
import { createRetriever } from '@/lib/avatar/retrieval';
import { applyThreshold } from '@/lib/avatar/threshold';
import { FakeEmbedder } from '@/lib/avatar/fakes';
import type { Embedder } from '@/lib/avatar/contracts';

const GEN = '2026-06-03T00:00:00.000Z'; // injected generatedAt literal (determinism)
const SITE = 'https://test.example';

/**
 * Wraps an embedder to count embed() calls + capture every text it sees, so a
 * test can prove reuse skips unchanged slugs (zero re-embeds).
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

/** An embedder that returns vectors of the wrong length (surfaces a builder guard). */
class BadEmbedder implements Embedder {
  readonly model = 'bad-embedder';
  readonly dimensions = 8;
  embed(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map(() => [1, 2, 3])); // length 3 != 8
  }
  embedQuery(): Promise<number[]> {
    return Promise.resolve([1, 2, 3]);
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

const ordinalOf = (id: string): number => Number(id.split('#').pop());

// ---------------------------------------------------------------------------
// Group 1 — chunkDocument / slugifyHeading
// ---------------------------------------------------------------------------
describe('chunkDocument', () => {
  it('heading-less article → exactly one lead chunk, markdown stripped', () => {
    const pageUrl = `${SITE}/en/blog/post/`;
    const seeds = chunkDocument({
      slug: 'post',
      lang: 'en',
      title: 'My Post',
      summary: '',
      pageUrl,
      body: 'Intro prose with **bold** and a [link](https://x.test) and `code`.',
    });
    expect(seeds).toHaveLength(1);
    const c = seeds[0];
    expect(c.headingAnchor).toBe('');
    expect(c.sourceUrl).toBe(pageUrl); // no fragment
    expect(c.title).toBe('My Post');
    expect(c.id).toBe('post#intro#0');
    expect(c.text).toContain('bold');
    expect(c.text).toContain('link');
    expect(c.text).not.toContain('*');
    expect(c.text).not.toContain('`');
    expect(c.text).not.toContain('[');
    expect(c.text).not.toContain('https://x.test');
  });

  it('article with two ## headings → 3 chunks (lead + 2), anchors/urls/ordinals', () => {
    const pageUrl = `${SITE}/en/blog/p/`;
    const seeds = chunkDocument({
      slug: 'p',
      lang: 'en',
      title: 'P',
      summary: '',
      pageUrl,
      body: 'lead text here\n\n## Hybrid Retrieval\n\nalpha\n\n## Fusion\n\nbeta',
    });
    expect(seeds).toHaveLength(3);

    // Mirror chunkDocument: a fresh slugger, headings slugged in document order.
    const sg = new GithubSlugger();
    const aHybrid = sg.slug('Hybrid Retrieval');
    const aFusion = sg.slug('Fusion');

    expect(seeds[0]).toMatchObject({
      headingAnchor: '',
      sourceUrl: pageUrl,
      title: 'P',
      id: 'p#intro#0',
    });
    expect(seeds[1]).toMatchObject({
      headingAnchor: aHybrid,
      sourceUrl: `${pageUrl}#${aHybrid}`,
      title: 'Hybrid Retrieval',
      id: `p#${aHybrid}#1`,
    });
    expect(seeds[2]).toMatchObject({
      headingAnchor: aFusion,
      sourceUrl: `${pageUrl}#${aFusion}`,
      title: 'Fusion',
      id: `p#${aFusion}#2`,
    });
  });

  it('fence-aware: a # comment inside a code fence does not start a section', () => {
    const seeds = chunkDocument({
      slug: 'f',
      lang: 'en',
      title: 'F',
      summary: '',
      pageUrl: `${SITE}/en/blog/f/`,
      body: '## Code\n\n```py\n# not a heading\nval = 1\n```\n\ntail text',
    });
    expect(seeds).toHaveLength(1); // lead empty; one "Code" section
    expect(seeds[0].headingAnchor).toBe('code');
    expect(seeds[0].text).toContain('not a heading'); // comment survives (# stripped)
    expect(seeds[0].text).toContain('val = 1');
    expect(seeds.every((s) => s.headingAnchor !== 'not-a-heading')).toBe(true);
  });

  it('dedup parity: two identical headings → test, test-1 (matches github-slugger)', () => {
    const seeds = chunkDocument({
      slug: 'd',
      lang: 'en',
      title: 'D',
      summary: '',
      pageUrl: `${SITE}/en/blog/d/`,
      body: '## Test\n\nfirst\n\n## Test\n\nsecond',
    });
    expect(seeds).toHaveLength(2);
    const sg = new GithubSlugger();
    expect(seeds[0].headingAnchor).toBe(sg.slug('Test')); // 'test'
    expect(seeds[1].headingAnchor).toBe(sg.slug('Test')); // 'test-1'
    expect(seeds[0].id).toBe('d#test#0');
    expect(seeds[1].id).toBe('d#test-1#1');
  });

  it('inline-markdown + accented heading → plain-text title, accented anchor', () => {
    const seeds = chunkDocument({
      slug: 'r',
      lang: 'en',
      title: 'R',
      summary: '',
      pageUrl: `${SITE}/en/blog/r/`,
      body: '## **Récupération** du modèle\n\ncontenu',
    });
    expect(seeds).toHaveLength(1);
    const expected = new GithubSlugger().slug('Récupération du modèle');
    expect(seeds[0].headingAnchor).toBe(expected);
    expect(seeds[0].title).toBe('Récupération du modèle'); // emphasis markers stripped
  });

  it('project input → summary prepended to lead text, /work/ url, no anchor', () => {
    const seeds = chunkDocument({
      slug: 'proj',
      lang: 'en',
      title: 'Proj Name',
      summary: 'Concise summary about edge.',
      pageUrl: `${SITE}/en/work/proj/`,
      body: 'Body paragraph about serverless.',
    });
    expect(seeds[0].text).toContain('Concise summary about edge');
    expect(seeds[0].text).toContain('Body paragraph about serverless');
    expect(seeds[0].sourceUrl).toBe(`${SITE}/en/work/proj/`);
    expect(seeds[0].headingAnchor).toBe('');
  });

  it('empty/whitespace section is skipped (no zero-text chunk)', () => {
    const seeds = chunkDocument({
      slug: 'e',
      lang: 'en',
      title: 'E',
      summary: '',
      pageUrl: `${SITE}/en/blog/e/`,
      body: 'lead\n\n## Empty\n\n   \n\n## Full\n\ncontent',
    });
    expect(seeds.map((s) => s.headingAnchor)).toEqual(['', 'full']);
    expect(seeds.map((s) => s.id)).toEqual(['e#intro#0', 'e#full#1']);
  });

  it('section over MAX_CHUNK_CHARS → paragraph-split, shared anchor/title, rising ordinals', () => {
    const para = 'word '.repeat(200).trim(); // ~999 chars
    const big = [para, para, para].join('\n\n');
    const seeds = chunkDocument({
      slug: 'big',
      lang: 'en',
      title: 'Big',
      summary: '',
      pageUrl: `${SITE}/en/blog/big/`,
      body: `## Long\n\n${big}`,
    });
    expect(seeds.length).toBeGreaterThanOrEqual(2);
    expect(seeds.every((s) => s.headingAnchor === 'long')).toBe(true);
    expect(seeds.every((s) => s.title === 'Long')).toBe(true);
    expect(seeds.every((s) => s.text.length <= MAX_CHUNK_CHARS)).toBe(true);
    const ords = seeds.map((s) => ordinalOf(s.id));
    for (let i = 1; i < ords.length; i++) {
      expect(ords[i]).toBe(ords[i - 1] + 1);
    }
  });

  it('slugifyHeading strips markdown and matches github-slugger', () => {
    expect(slugifyHeading('**Hybrid** Retrieval')).toBe(
      new GithubSlugger().slug('Hybrid Retrieval')
    );
    expect(slugifyHeading('Code & Config')).toBe('code--config');
  });
});

// ---------------------------------------------------------------------------
// Group 2 — contentHashOf
// ---------------------------------------------------------------------------
describe('contentHashOf', () => {
  const base = doc({ slug: 'h', title: 'T', summary: 'S', body: 'B' });

  it('is deterministic for the same SourceDoc', () => {
    expect(contentHashOf(base)).toBe(contentHashOf(base));
  });

  it('changes when body, title, or summary changes', () => {
    const h0 = contentHashOf(base);
    expect(contentHashOf({ ...base, body: 'B2' })).not.toBe(h0);
    expect(contentHashOf({ ...base, title: 'T2' })).not.toBe(h0);
    expect(contentHashOf({ ...base, summary: 'S2' })).not.toBe(h0);
  });
});

// ---------------------------------------------------------------------------
// Group 3 — buildIndex (incremental core)
// ---------------------------------------------------------------------------
describe('buildIndex', () => {
  it('full build: shape, hashes, embeddings, stats', async () => {
    const embedder = new FakeEmbedder();
    const { artifact, stats } = await buildIndex({
      sources: simpleSources(),
      embedder,
      prior: null,
      generatedAt: GEN,
    });

    expect(artifact.version).toBe(1);
    expect(artifact.embeddingModel).toBe(embedder.model);
    expect(artifact.dimensions).toBe(embedder.dimensions);
    expect(artifact.generatedAt).toBe(GEN);
    expect(Object.keys(artifact.sourceHashes).sort()).toEqual(['x', 'y', 'z']);
    for (const c of artifact.chunks) {
      expect(c.embedding.length).toBe(artifact.dimensions);
    }
    expect(stats.embeddedSlugs.sort()).toEqual(['x', 'y', 'z']);
    expect(stats.reusedSlugs).toEqual([]);
    expect(stats.droppedSlugs).toEqual([]);
    expect(stats.totalChunks).toBe(artifact.chunks.length);
  });

  it('sorts chunks deterministically by (slug asc, ordinal asc)', async () => {
    const sources = [
      doc({
        slug: 'm',
        title: 'M',
        body: 'lead\n\n## One\n\naaa\n\n## Two\n\nbbb',
      }),
      doc({ slug: 'a', body: 'single chunk doc' }),
    ];
    const { artifact } = await buildIndex({
      sources,
      embedder: new FakeEmbedder(),
      prior: null,
      generatedAt: GEN,
    });
    expect(artifact.chunks.map((c) => c.id)).toEqual([
      'a#intro#0',
      'm#intro#0',
      'm#one#1',
      'm#two#2',
    ]);
  });

  it('no-op incremental: same sources + prior → deep-equal, zero re-embeds', async () => {
    const counter = new CountingEmbedder(new FakeEmbedder());
    const a = await buildIndex({
      sources: simpleSources(),
      embedder: new FakeEmbedder(),
      prior: null,
      generatedAt: GEN,
    });
    const b = await buildIndex({
      sources: simpleSources(),
      embedder: counter,
      prior: a.artifact,
      generatedAt: GEN,
    });
    expect(b.artifact).toEqual(a.artifact); // build twice = deep-equal
    expect(b.stats.reusedSlugs.sort()).toEqual(['x', 'y', 'z']);
    expect(b.stats.embeddedSlugs).toEqual([]);
    expect(counter.embeddedTexts).toHaveLength(0); // nothing re-embedded
  });

  it('incremental: unchanged reused, edited re-embedded, removed dropped', async () => {
    const a = (
      await buildIndex({
        sources: simpleSources(),
        embedder: new FakeEmbedder(),
        prior: null,
        generatedAt: GEN,
      })
    ).artifact;

    const next = simpleSources().filter((d) => d.slug !== 'z'); // drop z
    const yi = next.findIndex((d) => d.slug === 'y');
    next[yi] = { ...next[yi], body: `${next[yi].body} EDITED zappa token` };

    const counter = new CountingEmbedder(new FakeEmbedder());
    const { artifact: b, stats } = await buildIndex({
      sources: next,
      embedder: counter,
      prior: a,
      generatedAt: GEN,
    });

    expect(stats.reusedSlugs).toEqual(['x']);
    expect(stats.embeddedSlugs).toEqual(['y']);
    expect(stats.droppedSlugs).toEqual(['z']);

    // x reused → embedding preserved verbatim, x's text never re-embedded.
    const xA = a.chunks.find((c) => c.slug === 'x');
    const xB = b.chunks.find((c) => c.slug === 'x');
    expect(xA).toBeDefined();
    expect(xB).toBeDefined();
    expect(xB?.embedding).toEqual(xA?.embedding);
    const xText = chunkDocument(simpleSources()[0])[0].text;
    expect(counter.embeddedTexts).not.toContain(xText);

    // y edited → its new text IS embedded.
    const yText = chunkDocument(next[yi])[0].text;
    expect(counter.embeddedTexts).toContain(yText);

    // z dropped entirely.
    expect(b.chunks.some((c) => c.slug === 'z')).toBe(false);
    expect(b.sourceHashes['z']).toBeUndefined();
  });

  it('embedder identity change invalidates all reuse', async () => {
    const a = (
      await buildIndex({
        sources: simpleSources(),
        embedder: new FakeEmbedder(256),
        prior: null,
        generatedAt: GEN,
      })
    ).artifact;
    const { artifact: b, stats } = await buildIndex({
      sources: simpleSources(),
      embedder: new FakeEmbedder(128), // different dims/model
      prior: a,
      generatedAt: GEN,
    });
    expect(stats.reusedSlugs).toEqual([]);
    expect(stats.embeddedSlugs.sort()).toEqual(['x', 'y', 'z']);
    expect(b.dimensions).toBe(128);
    for (const c of b.chunks) expect(c.embedding.length).toBe(128);
  });

  it('rejects duplicate slugs across the source set', async () => {
    const dup = [doc({ slug: 'dup' }), doc({ slug: 'dup', title: 'Other' })];
    await expect(
      buildIndex({
        sources: dup,
        embedder: new FakeEmbedder(),
        prior: null,
        generatedAt: GEN,
      })
    ).rejects.toThrow(/duplicate slug/);
  });

  it('rejects an embedder returning wrong-length vectors', async () => {
    await expect(
      buildIndex({
        sources: simpleSources(),
        embedder: new BadEmbedder(),
        prior: null,
        generatedAt: GEN,
      })
    ).rejects.toThrow();
  });

  it('is deterministic: identical inputs → deep-equal artifacts', async () => {
    const one = await buildIndex({
      sources: simpleSources(),
      embedder: new FakeEmbedder(),
      prior: null,
      generatedAt: GEN,
    });
    const two = await buildIndex({
      sources: simpleSources(),
      embedder: new FakeEmbedder(),
      prior: null,
      generatedAt: GEN,
    });
    expect(two.artifact).toEqual(one.artifact);
  });
});

// ---------------------------------------------------------------------------
// FS-backed groups (3 draft-exclusion, 4 loader, 5 build→retrieve) share a
// throwaway content tree under os.tmpdir().
// ---------------------------------------------------------------------------
function articleMd(o: {
  slug: string;
  lang: 'fr' | 'en';
  translationKey: string;
  title: string;
  publishState: 'published' | 'draft';
  body: string;
}): string {
  return [
    '---',
    '# SEED - throwaway test fixture',
    `translationKey: ${o.translationKey}`,
    `lang: ${o.lang}`,
    `slug: ${o.slug}`,
    `title: ${JSON.stringify(o.title)}`,
    `publishDate: '01-06-2026'`,
    'tags:',
    '  - rag',
    'difficulty: 2',
    'sources:',
    `  - label: 'Source One'`,
    `    url: 'https://example.com/one'`,
    `    date: '01-01-2024'`,
    `  - label: 'Source Two'`,
    `    url: 'https://example.com/two'`,
    `    date: '02-02-2024'`,
    `contentHash: 'hash-${o.slug}'`,
    `publishState: ${o.publishState}`,
    '---',
    '',
    o.body,
    '',
  ].join('\n');
}

function projectMd(o: {
  slug: string;
  lang: 'fr' | 'en';
  translationKey: string;
  name: string;
  summary: string;
  publishState: 'published' | 'draft';
  body: string;
}): string {
  return [
    '---',
    `translationKey: ${o.translationKey}`,
    `lang: ${o.lang}`,
    `slug: ${o.slug}`,
    `name: ${JSON.stringify(o.name)}`,
    `summary: ${JSON.stringify(o.summary)}`,
    'stack:',
    '  - TypeScript',
    `status: 'active'`,
    'links: []',
    `publishState: ${o.publishState}`,
    '---',
    '',
    o.body,
    '',
  ].join('\n');
}

describe('loadPublishedSources + draft exclusion + build→retrieve (FS fixtures)', () => {
  let contentRoot: string;
  let tmpRoot: string;

  beforeAll(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'avatar-index-'));
    contentRoot = join(tmpRoot, 'content');
    const articlesDir = join(contentRoot, 'articles');
    const projectsDir = join(contentRoot, 'projects');
    mkdirSync(articlesDir, { recursive: true });
    mkdirSync(projectsDir, { recursive: true });

    writeFileSync(
      join(articlesDir, 'a-pub.en.md'),
      articleMd({
        slug: 'a-pub-en',
        lang: 'en',
        translationKey: 'a-pub',
        title: 'Hybrid Retrieval Post',
        publishState: 'published',
        body: 'Lead intro about hybrid retrieval.\n\n## Hybrid Retrieval\n\nDense vectors and bm25 fused together.\n\n```py\n# not a heading\nx = 1\n```\n\n## Fusion\n\nReciprocal rank fusion combines ranked lists.',
      })
    );
    writeFileSync(
      join(articlesDir, 'a-pub.fr.md'),
      articleMd({
        slug: 'a-pub-fr',
        lang: 'fr',
        translationKey: 'a-pub',
        title: 'Article publié',
        publishState: 'published',
        body: 'Introduction sur la récupération hybride.\n\n## Récupération\n\nVecteurs denses et bm25.',
      })
    );
    writeFileSync(
      join(articlesDir, 'a-draft.en.md'),
      articleMd({
        slug: 'a-draft-en',
        lang: 'en',
        translationKey: 'a-draft',
        title: 'Draft Post',
        publishState: 'draft',
        body: 'This draft must never enter the public artifact.',
      })
    );
    writeFileSync(
      join(projectsDir, 'p-pub.en.md'),
      projectMd({
        slug: 'p-pub-en',
        lang: 'en',
        translationKey: 'p-pub',
        name: 'Sample Project',
        summary: 'A concise project summary about edge deployment.',
        publishState: 'published',
        body: 'Project body paragraph about serverless edge functions.',
      })
    );
  });

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true });
  });

  // -- Group 4 — loadPublishedSources --------------------------------------
  it('loads only published docs, both kinds + langs, with correct fields', () => {
    const sources = loadPublishedSources({ contentRoot, siteUrl: SITE });
    expect(sources.map((s) => s.slug).sort()).toEqual([
      'a-pub-en',
      'a-pub-fr',
      'p-pub-en',
    ]);

    const article = sources.find((s) => s.slug === 'a-pub-en');
    const fr = sources.find((s) => s.slug === 'a-pub-fr');
    const project = sources.find((s) => s.slug === 'p-pub-en');

    expect(article?.kind).toBe('article');
    expect(article?.title).toBe('Hybrid Retrieval Post');
    expect(article?.summary).toBe('');
    expect(article?.pageUrl).toBe(`${SITE}/en/blog/a-pub-en/`);

    expect(fr?.lang).toBe('fr');

    expect(project?.kind).toBe('project');
    expect(project?.title).toBe('Sample Project'); // from `name`
    expect(project?.summary.length).toBeGreaterThan(0);
    expect(project?.pageUrl).toBe(`${SITE}/en/work/p-pub-en/`);

    // body is frontmatter-stripped (no fences of YAML, no SEED comment).
    expect(article?.body).not.toContain('---');
    expect(article?.body).not.toContain('# SEED');
    expect(article?.body).not.toContain('translationKey');
  });

  it('honors a siteUrl override', () => {
    const sources = loadPublishedSources({
      contentRoot,
      siteUrl: 'https://other.test',
    });
    expect(sources.find((s) => s.slug === 'a-pub-en')?.pageUrl).toBe(
      'https://other.test/en/blog/a-pub-en/'
    );
  });

  // -- Group 3 — DRAFT-EXCLUSION SAFETY (non-negotiable) -------------------
  it('the draft never enters the public artifact (no chunks, no hash)', async () => {
    const sources = loadPublishedSources({ contentRoot, siteUrl: SITE });
    expect(sources.map((s) => s.slug)).not.toContain('a-draft-en');

    const { artifact } = await buildIndex({
      sources,
      embedder: new FakeEmbedder(),
      prior: null,
      generatedAt: GEN,
    });
    expect(artifact.sourceHashes['a-draft-en']).toBeUndefined();
    expect(artifact.chunks.some((c) => c.slug === 'a-draft-en')).toBe(false);
  });

  // -- Group 5 — build → retrieve loop-closing (monolingual-fake-safe) -----
  it('builds an artifact a retriever can consume (same-language query)', async () => {
    const embedder = new FakeEmbedder();
    const { artifact } = await buildIndex({
      sources: loadPublishedSources({ contentRoot, siteUrl: SITE }),
      embedder,
      prior: null,
      generatedAt: GEN,
    });

    // Endpoint load checks (functions/api/avatar/query.ts#loadIndexArtifact).
    expect(artifact.version).toBe(1);
    expect(artifact.dimensions).toBeGreaterThan(0);
    expect(Array.isArray(artifact.chunks)).toBe(true);

    const retriever = createRetriever(artifact, { embedder });
    const result = await retriever.retrieve('hybrid retrieval fusion'); // EN, on-topic
    expect(result.topSimilarity).toBeGreaterThan(0);
    expect(result.candidates[0].chunk.slug).toBe('a-pub-en');

    // Sanity: the gate yields a decision over a real-shaped artifact.
    const outcome = applyThreshold(result);
    expect(['grounded', 'idk']).toContain(outcome.kind);
  });
});
