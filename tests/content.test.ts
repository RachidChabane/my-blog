import { describe, it, expect } from 'vitest';
import {
  ARTICLES_PER_PAGE,
  TAG_RAIL_ORDER,
  parsePublishDate,
  getPublishedArticles,
  readingTime,
  readingLabel,
  excerpt,
  tagLabel,
  toArticleCard,
  tagRail,
  sourceHost,
  toSourceViews,
  buildSlugMap,
  getPrevNextByTag,
  PROJECT_ORDER,
  isLiveStatus,
  getPublishedProjects,
  toProjectCard,
  formatCount,
  tagCounts,
  getArticlesByTag,
  tagDirectory,
  unknownArticleTags,
  getRelatedArticles,
} from '@/lib/content';
import type {
  ArticleEntryLike,
  ProjectEntryLike,
  TagDirEntry,
} from '@/lib/content';
import type {
  ArticleFrontmatter,
  ProjectFrontmatter,
  Tag,
} from '@/content/schemas';
import { PORTFOLIO_PROJECTS } from '../scripts/gen-portfolio';

/* -------------------------------------------------------------- fixtures */
const TAGS: Tag[] = [
  { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
  { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
  {
    slug: 'agentic-coding',
    label: { fr: 'agentic coding', en: 'agentic coding' },
  },
  { slug: 'evaluation', label: { fr: 'évaluation', en: 'evaluation' } },
  { slug: 'llm-oss', label: { fr: 'LLM open-source', en: 'open-source LLM' } },
  { slug: 'retrieval', label: { fr: 'retrieval', en: 'retrieval' } },
  { slug: 'qualite', label: { fr: 'qualité', en: 'quality' } },
];

/** Build an ArticleEntryLike with sensible defaults; override per test. */
function entry(
  over: Partial<ArticleFrontmatter> & { id?: string; body?: string } = {}
): ArticleEntryLike {
  const { id, body, ...data } = over;
  return {
    id: id ?? 'id',
    body,
    data: {
      translationKey: 'k',
      lang: 'fr',
      slug: 's',
      title: 'T',
      publishDate: '01-01-2026',
      tags: ['agents'],
      sources: [
        { label: 'a', url: 'https://a.example', date: '01-01-2024' },
        { label: 'b', url: 'https://b.example', date: '01-01-2024' },
      ],
      contentHash: 'h',
      publishState: 'published',
      ...data,
    },
  };
}

/* ------------------------------------------------------- 1. filtering */
describe('getPublishedArticles — filtering', () => {
  it('excludes drafts and other-locale entries', () => {
    const mixed = [
      entry({ slug: 'fr-pub', lang: 'fr', publishState: 'published' }),
      entry({ slug: 'fr-draft', lang: 'fr', publishState: 'draft' }),
      entry({ slug: 'en-pub', lang: 'en', publishState: 'published' }),
    ];
    expect(getPublishedArticles(mixed, 'fr').map((e) => e.data.slug)).toEqual([
      'fr-pub',
    ]);
    expect(getPublishedArticles(mixed, 'en').map((e) => e.data.slug)).toEqual([
      'en-pub',
    ]);
  });

  it('does not mutate the input array', () => {
    const items = [
      entry({ slug: 'b', publishDate: '01-05-2026' }),
      entry({ slug: 'a', publishDate: '03-05-2026' }),
    ];
    const before = items.map((e) => e.data.slug);
    getPublishedArticles(items, 'fr');
    expect(items.map((e) => e.data.slug)).toEqual(before);
  });
});

/* --------------------------------------------------- 2. ordering */
describe('getPublishedArticles — ordering', () => {
  it('sorts newest-first with a stable slug tiebreak on equal dates', () => {
    const items = [
      entry({ slug: 'b', publishDate: '01-05-2026' }),
      entry({ slug: 'a', publishDate: '03-05-2026' }),
      entry({ slug: 'c', publishDate: '03-05-2026' }), // ties with 'a'
      entry({ slug: 'd', publishDate: '02-05-2026' }),
    ];
    expect(getPublishedArticles(items, 'fr').map((e) => e.data.slug)).toEqual([
      'a',
      'c',
      'd',
      'b',
    ]);
  });
});

/* ---------------------------------------------- 3. parsePublishDate */
describe('parsePublishDate', () => {
  it('produces a sortable YYYYMMDD number', () => {
    expect(parsePublishDate('27-05-2026')).toBe(20260527);
    expect(parsePublishDate('30-05-2026')).toBe(20260530);
    expect(parsePublishDate('27-05-2026')).toBeLessThan(
      parsePublishDate('30-05-2026')
    );
  });

  it('malformed input → 0', () => {
    expect(parsePublishDate('nope')).toBe(0);
  });
});

/* ------------------------------------------------ 4. reading time */
describe('readingTime / readingLabel', () => {
  it('empty or short body → 1 min', () => {
    expect(readingTime(undefined)).toBe(1);
    expect(readingTime('')).toBe(1);
    expect(readingTime('a few short words')).toBe(1);
  });

  it('~400-word body → 2 min', () => {
    const long = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(long)).toBe(2);
    expect(readingLabel(long)).toBe('2 min');
  });

  it('does not count fenced code toward reading time', () => {
    const fence =
      '```\n' + Array.from({ length: 400 }, () => 'x').join(' ') + '\n```';
    expect(readingTime(`Short intro.\n\n${fence}`)).toBe(1);
  });

  it('label matches the "/^\\d+ min$/" format', () => {
    expect(readingLabel('hello there')).toMatch(/^\d+ min$/);
  });
});

/* ----------------------------------------------------- 5. excerpt */
describe('excerpt', () => {
  it('skips a leading heading, returns the first paragraph, strips inline markdown', () => {
    const body =
      '# A Heading\n\nThis is the **first** paragraph with a [link](https://x.example) inside.\n\nSecond paragraph.';
    expect(excerpt(body)).toBe(
      'This is the first paragraph with a link inside.'
    );
  });

  it('skips blockquotes too', () => {
    const body = '> a pull quote\n\nReal lead paragraph.';
    expect(excerpt(body)).toBe('Real lead paragraph.');
  });

  it('truncates at a word boundary with an ellipsis, staying within maxLen', () => {
    const longPara = 'Lorem ipsum dolor sit amet '.repeat(20).trim();
    const ex = excerpt(longPara, 40);
    expect(ex.length).toBeLessThanOrEqual(40);
    expect(ex.endsWith('…')).toBe(true);
    const head = ex.slice(0, -1);
    expect(longPara.startsWith(head)).toBe(true); // real prefix
    expect(longPara[head.length]).toBe(' '); // cut on a word boundary, not mid-word
  });

  it('empty / undefined body → empty string', () => {
    expect(excerpt(undefined)).toBe('');
    expect(excerpt('')).toBe('');
  });
});

/* ---------------------------------------------------- 6. tagLabel */
describe('tagLabel', () => {
  it('resolves a known slug to its localized label', () => {
    expect(tagLabel('llm-oss', 'en', TAGS)).toBe('open-source LLM');
    expect(tagLabel('llm-oss', 'fr', TAGS)).toBe('LLM open-source');
    expect(tagLabel('evaluation', 'fr', TAGS)).toBe('évaluation');
  });

  it('falls back to the slug for an unknown tag', () => {
    expect(tagLabel('does-not-exist', 'fr', TAGS)).toBe('does-not-exist');
  });
});

/* ------------------------------------------------- 7. toArticleCard */
describe('toArticleCard', () => {
  it('builds hrefs, dek, date and resolved tag labels', () => {
    const e = entry({
      slug: 'hello-world',
      lang: 'fr',
      title: 'Hello',
      publishDate: '15-05-2026',
      tags: ['agents', 'rag'],
      body: 'Lead paragraph here.\n\nMore body text.',
    });
    const card = toArticleCard(e, 'fr', TAGS);
    expect(card.href).toBe('/fr/blog/hello-world/');
    expect(card.tags.map((t) => t.href)).toEqual([
      '/fr/tags/agents/',
      '/fr/tags/rag/',
    ]);
    expect(card.tags.map((t) => t.label)).toEqual(['agents', 'RAG']);
    expect(card.dateDisplay).toBe('15-05-2026');
    expect(card.dek).toBe('Lead paragraph here.');
    expect(card.readingLabel).toMatch(/^\d+ min$/);
    expect(card.title).toBe('Hello');
    expect(card.lang).toBe('fr');
  });
});

/* --------------------------------------------------------- 8. tagRail */
describe('tagRail', () => {
  it('imposes TAG_RAIL_ORDER regardless of input order, with localized labels and hrefs', () => {
    const shuffled: Tag[] = [
      { slug: 'retrieval', label: { fr: 'retrieval', en: 'retrieval' } },
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
      { slug: 'qualite', label: { fr: 'qualité', en: 'quality' } },
      { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
      { slug: 'evaluation', label: { fr: 'évaluation', en: 'evaluation' } },
      {
        slug: 'agentic-coding',
        label: { fr: 'agentic coding', en: 'agentic coding' },
      },
      {
        slug: 'llm-oss',
        label: { fr: 'LLM open-source', en: 'open-source LLM' },
      },
    ];
    const rail = tagRail(shuffled, 'en');
    expect(rail.map((r) => r.slug)).toEqual([...TAG_RAIL_ORDER]);
    expect(rail.map((r) => r.href)).toEqual(
      TAG_RAIL_ORDER.map((s) => `/en/tags/${s}/`)
    );
    expect(rail.find((r) => r.slug === 'llm-oss')?.label).toBe(
      'open-source LLM'
    );
    expect(rail.find((r) => r.slug === 'qualite')?.label).toBe('quality');
  });

  it('appends a vocabulary tag that is absent from TAG_RAIL_ORDER (alphabetically, after ordered ones)', () => {
    const withExtra: Tag[] = [
      { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
      { slug: 'zeta-extra', label: { fr: 'zeta', en: 'zeta' } },
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
    ];
    expect(tagRail(withExtra, 'fr').map((r) => r.slug)).toEqual([
      'agents',
      'rag',
      'zeta-extra',
    ]);
  });

  it('skips ordered slugs absent from the vocabulary (no crash, no empty entries)', () => {
    const partial: Tag[] = [
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
      { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
    ];
    expect(tagRail(partial, 'fr').map((r) => r.slug)).toEqual([
      'agents',
      'rag',
    ]);
  });
});

/* ------------------------------------------- 8b. formatCount (S4/S5) */
describe('formatCount', () => {
  it('uses the singular template at n === 1, the plural otherwise', () => {
    expect(formatCount(1, '{n} post', '{n} posts')).toBe('1 post');
    expect(formatCount(3, '{n} écrit', '{n} écrits')).toBe('3 écrits');
  });

  it('uses the *many* form for 0 (matches the S2 digit-pluralization rule)', () => {
    expect(formatCount(0, '{n} post', '{n} posts')).toBe('0 posts');
  });

  it('always substitutes the {n} placeholder (none remains)', () => {
    expect(formatCount(5, '{n} x', '{n} y')).not.toContain('{n}');
    expect(formatCount(1, '{n} x', '{n} y')).not.toContain('{n}');
  });
});

/* ------------------------------------------------ 8c. tagCounts (S4/S5) */
describe('tagCounts', () => {
  const mixed = [
    entry({ slug: 'a', tags: ['agents', 'rag'] }), // fr published
    entry({ slug: 'b', tags: ['agents'] }), // fr published
    entry({ slug: 'c', tags: ['rag'], publishState: 'draft' }), // excluded
    entry({ slug: 'd', tags: ['agents'], lang: 'en' }), // other-lang
  ];

  it('counts published same-lang occurrences, incrementing each tag of a multi-tag article', () => {
    const c = tagCounts(mixed, 'fr');
    expect(c.get('agents')).toBe(2); // a + b
    expect(c.get('rag')).toBe(1); // a only (draft c excluded)
  });

  it('a tag carried by no published article is ABSENT from the map (not 0)', () => {
    const c = tagCounts(mixed, 'fr');
    expect(c.has('qualite')).toBe(false);
  });

  it('is per-locale (the en entry counts only under en)', () => {
    expect(tagCounts(mixed, 'en').get('agents')).toBe(1); // d only
    expect(tagCounts(mixed, 'en').has('rag')).toBe(false);
  });
});

/* ------------------------------------------- 8d. getArticlesByTag (S4/S5) */
describe('getArticlesByTag', () => {
  const fixture = [
    entry({ slug: 'old', publishDate: '01-01-2026', tags: ['rag'] }),
    entry({ slug: 'mid', publishDate: '02-01-2026', tags: ['rag'] }),
    entry({ slug: 'new', publishDate: '03-01-2026', tags: ['rag'] }),
    entry({
      slug: 'draft-rag',
      publishDate: '04-01-2026',
      tags: ['rag'],
      publishState: 'draft',
    }),
    entry({
      slug: 'en-rag',
      publishDate: '05-01-2026',
      tags: ['rag'],
      lang: 'en',
    }),
    entry({ slug: 'other', publishDate: '06-01-2026', tags: ['agents'] }),
  ];

  it('returns only published same-lang carriers, newest-first', () => {
    expect(
      getArticlesByTag(fixture, 'fr', 'rag').map((e) => e.data.slug)
    ).toEqual(['new', 'mid', 'old']);
  });

  it('excludes a draft / other-lang carrier and a non-carrier', () => {
    const slugs = getArticlesByTag(fixture, 'fr', 'rag').map(
      (e) => e.data.slug
    );
    expect(slugs).not.toContain('draft-rag');
    expect(slugs).not.toContain('en-rag');
    expect(slugs).not.toContain('other');
  });

  it('an absent slug → []', () => {
    expect(getArticlesByTag(fixture, 'fr', 'no-such-tag')).toEqual([]);
  });
});

/* --------------------------------------------- 8e. tagDirectory (S4) */
describe('tagDirectory', () => {
  // agents=2, rag=1, qualite=1; evaluation has only a draft (→ 0); the rest 0.
  const dirArticles = [
    entry({ slug: 'a1', tags: ['agents'] }),
    entry({ slug: 'a2', tags: ['agents'] }),
    entry({ slug: 'r1', tags: ['rag'] }),
    entry({ slug: 'q1', tags: ['qualite'] }),
    entry({ slug: 'd1', tags: ['evaluation'], publishState: 'draft' }),
  ];

  it('imposes TAG_RAIL_ORDER regardless of input tags[] order, omitting count-0 tags', () => {
    const shuffled: Tag[] = [...TAGS].reverse();
    const dir = tagDirectory(dirArticles, shuffled, 'fr');
    expect(dir.map((e) => e.slug)).toEqual(['agents', 'rag', 'qualite']);
    expect(dir.map((e) => e.count)).toEqual([2, 1, 1]);
  });

  it('emits localized labels + /<lang>/tags/<slug>/ hrefs (fr)', () => {
    const dir = tagDirectory(dirArticles, TAGS, 'fr');
    expect(dir.map((e) => e.label)).toEqual(['agents', 'RAG', 'qualité']);
    expect(dir.map((e) => e.href)).toEqual([
      '/fr/tags/agents/',
      '/fr/tags/rag/',
      '/fr/tags/qualite/',
    ]);
  });

  it('localizes per the requested locale (en)', () => {
    const enDir: TagDirEntry[] = tagDirectory(
      [entry({ slug: 'q-en', tags: ['qualite'], lang: 'en' })],
      TAGS,
      'en'
    );
    expect(enDir).toEqual([
      {
        slug: 'qualite',
        label: 'quality',
        href: '/en/tags/qualite/',
        count: 1,
      },
    ]);
  });

  it('appends a vocabulary tag absent from TAG_RAIL_ORDER (alpha, after ordered) when count>0', () => {
    const withExtra: Tag[] = [
      { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
      { slug: 'zeta-extra', label: { fr: 'zeta', en: 'zeta' } },
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
    ];
    const articles = [
      entry({ slug: 'x1', tags: ['agents'] }),
      entry({ slug: 'x2', tags: ['rag'] }),
      entry({ slug: 'x3', tags: ['zeta-extra'] }),
    ];
    expect(tagDirectory(articles, withExtra, 'fr').map((e) => e.slug)).toEqual([
      'agents',
      'rag',
      'zeta-extra',
    ]);
  });

  it('omits an extra (non-ordered) vocabulary tag with count==0', () => {
    const withExtra: Tag[] = [
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
      { slug: 'zeta-extra', label: { fr: 'zeta', en: 'zeta' } },
    ];
    expect(
      tagDirectory(
        [entry({ slug: 'x1', tags: ['agents'] })],
        withExtra,
        'fr'
      ).map((e) => e.slug)
    ).toEqual(['agents']);
  });

  it('skips orphan ordered slugs absent from the passed vocabulary (no crash, no empty entries)', () => {
    const partial: Tag[] = [
      { slug: 'agents', label: { fr: 'agents', en: 'agents' } },
      { slug: 'rag', label: { fr: 'RAG', en: 'RAG' } },
    ];
    const articles = [
      entry({ slug: 'p1', tags: ['agents'] }),
      entry({ slug: 'p2', tags: ['rag'] }),
    ];
    expect(tagDirectory(articles, partial, 'fr').map((e) => e.slug)).toEqual([
      'agents',
      'rag',
    ]);
  });
});

/* ------------------------------------------ 8f. unknownArticleTags (S5 guard) */
describe('unknownArticleTags', () => {
  it('a clean corpus (every tag curated) → []', () => {
    expect(
      unknownArticleTags(
        [entry({ slug: 'c1', tags: ['agents', 'rag'] })],
        TAGS,
        'fr'
      )
    ).toEqual([]);
  });

  it('surfaces a published tag absent from the vocabulary', () => {
    expect(
      unknownArticleTags(
        [entry({ slug: 'r1', tags: ['agents', 'rogue'] })],
        TAGS,
        'fr'
      )
    ).toEqual(['rogue']);
  });

  it('ignores a draft carrying a rogue tag (published-only)', () => {
    expect(
      unknownArticleTags(
        [entry({ slug: 'dr', tags: ['rogue'], publishState: 'draft' })],
        TAGS,
        'fr'
      )
    ).toEqual([]);
  });

  it('returns a sorted, deduped set', () => {
    const many = [
      entry({ slug: 'm1', tags: ['zzz', 'aaa'] }),
      entry({ slug: 'm2', tags: ['aaa'] }), // duplicate aaa
    ];
    expect(unknownArticleTags(many, TAGS, 'fr')).toEqual(['aaa', 'zzz']);
  });
});

/* -------------------------------------------------------- constants */
describe('constants', () => {
  it('ARTICLES_PER_PAGE is a positive integer', () => {
    expect(Number.isInteger(ARTICLES_PER_PAGE)).toBe(true);
    expect(ARTICLES_PER_PAGE).toBeGreaterThan(0);
  });
});

/* ------------------------------------------ 9. sourceHost / toSourceViews */
describe('sourceHost', () => {
  it('returns the hostname without a leading "www."', () => {
    expect(
      sourceHost('https://www.pinecone.io/learn/hybrid-search-intro/')
    ).toBe('pinecone.io');
    expect(sourceHost('https://arxiv.org/abs/2210.03629')).toBe('arxiv.org');
  });

  it('keeps a non-www subdomain intact', () => {
    expect(sourceHost('https://docs.astro.build/en/guides/')).toBe(
      'docs.astro.build'
    );
  });

  it('returns "" for an unparseable URL', () => {
    expect(sourceHost('not a url')).toBe('');
    expect(sourceHost('')).toBe('');
  });
});

describe('toSourceViews', () => {
  it('numbers sources (zero-padded), resolves host, preserves order + fields', () => {
    const views = toSourceViews([
      {
        label: 'Pinecone — Hybrid search intro',
        url: 'https://www.pinecone.io/learn/hybrid-search-intro/',
        date: '01-03-2024',
      },
      {
        label: 'arXiv — ReAct',
        url: 'https://arxiv.org/abs/2210.03629',
        date: '06-10-2022',
      },
    ]);
    expect(views.map((v) => v.n)).toEqual(['01', '02']);
    expect(views[0]).toEqual({
      n: '01',
      label: 'Pinecone — Hybrid search intro',
      url: 'https://www.pinecone.io/learn/hybrid-search-intro/',
      host: 'pinecone.io',
      date: '01-03-2024',
    });
    expect(views[1].host).toBe('arxiv.org');
    expect(views[1].label).toBe('arXiv — ReAct');
  });

  it('empty host when a source URL is unparseable (never throws)', () => {
    const views = toSourceViews([
      { label: 'broken', url: 'http://', date: '01-01-2024' },
    ]);
    expect(views[0].host).toBe('');
    expect(views[0].n).toBe('01');
  });
});

/* ------------------------------------------------------- 10. buildSlugMap */
describe('buildSlugMap', () => {
  it('maps each published locale of a translationKey to its slug', () => {
    const entries = [
      entry({ translationKey: 'k', lang: 'fr', slug: 'fr-slug' }),
      entry({ translationKey: 'k', lang: 'en', slug: 'en-slug' }),
      entry({ translationKey: 'other', lang: 'fr', slug: 'nope' }),
    ];
    expect(buildSlugMap(entries, 'k')).toEqual({
      fr: 'fr-slug',
      en: 'en-slug',
    });
  });

  it('omits a draft counterpart (never links to an unbuilt page)', () => {
    const entries = [
      entry({ translationKey: 'k', lang: 'fr', slug: 'fr-slug' }),
      entry({
        translationKey: 'k',
        lang: 'en',
        slug: 'en-draft',
        publishState: 'draft',
      }),
    ];
    expect(buildSlugMap(entries, 'k')).toEqual({ fr: 'fr-slug' });
  });

  it('unknown translationKey → empty map', () => {
    const entries = [entry({ translationKey: 'k', lang: 'fr', slug: 's' })];
    expect(buildSlugMap(entries, 'absent')).toEqual({});
  });
});

/* -------------------------------------------- 11. getPrevNextByTag */
describe('getPrevNextByTag', () => {
  // Newest-first after sorting: A(10) B(09) C(08) D(07) E(06), all fr/published.
  //   A ['rag','retrieval']  B ['agents']  C ['rag']  D ['llm-oss']  E ['rag','evaluation']
  // B and D are non-sharers, sitting BETWEEN rag-mates → exercise the skip.
  const cluster = [
    entry({ slug: 'a', publishDate: '10-05-2026', tags: ['rag', 'retrieval'] }),
    entry({ slug: 'b', publishDate: '09-05-2026', tags: ['agents'] }),
    entry({ slug: 'c', publishDate: '08-05-2026', tags: ['rag'] }),
    entry({ slug: 'd', publishDate: '07-05-2026', tags: ['llm-oss'] }),
    entry({
      slug: 'e',
      publishDate: '06-05-2026',
      tags: ['rag', 'evaluation'],
    }),
  ];
  const bySlug = (s: string) => cluster.find((e) => e.data.slug === s)!;

  it('middle of a cluster → both neighbours, skipping non-sharers in BOTH directions', () => {
    const nav = getPrevNextByTag(cluster, bySlug('c'), 'fr', TAGS);
    // next = nearest NEWER sharing a tag: skips B(agents) → A(rag)
    expect(nav.next).toEqual({
      href: '/fr/blog/a/',
      title: 'T',
      topic: 'RAG',
    });
    // prev = nearest OLDER sharing a tag: skips D(llm-oss) → E(rag)
    expect(nav.prev).toEqual({
      href: '/fr/blog/e/',
      title: 'T',
      topic: 'RAG',
    });
  });

  it('newest in its cluster → prev only (no newer neighbour)', () => {
    const nav = getPrevNextByTag(cluster, bySlug('a'), 'fr', TAGS);
    expect(nav.next).toBeNull();
    expect(nav.prev?.href).toBe('/fr/blog/c/'); // skips B(agents) → C(rag)
  });

  it('oldest in its cluster → next only (no older neighbour)', () => {
    const nav = getPrevNextByTag(cluster, bySlug('e'), 'fr', TAGS);
    expect(nav.prev).toBeNull();
    expect(nav.next?.href).toBe('/fr/blog/c/'); // skips D(llm-oss) → C(rag)
  });

  it('no tag-mate anywhere → both null (route omits the nav)', () => {
    const nav = getPrevNextByTag(cluster, bySlug('d'), 'fr', TAGS); // llm-oss alone
    expect(nav).toEqual({ prev: null, next: null });
  });

  it('localizes the shared-tag topic label', () => {
    // current shares 'evaluation' with an older neighbour; lang-matched fixtures
    // (the helper filters by lang, so fr/en need their own same-lang neighbours).
    const frEvals = [
      entry({
        slug: 'eval-a',
        publishDate: '10-05-2026',
        tags: ['evaluation'],
        lang: 'fr',
      }),
      entry({
        slug: 'eval-b',
        publishDate: '09-05-2026',
        tags: ['evaluation'],
        lang: 'fr',
      }),
    ];
    const enEvals = [
      entry({
        slug: 'eval-a',
        publishDate: '10-05-2026',
        tags: ['evaluation'],
        lang: 'en',
      }),
      entry({
        slug: 'eval-b',
        publishDate: '09-05-2026',
        tags: ['evaluation'],
        lang: 'en',
      }),
    ];
    expect(getPrevNextByTag(frEvals, frEvals[0], 'fr', TAGS).prev?.topic).toBe(
      'évaluation'
    );
    expect(getPrevNextByTag(enEvals, enEvals[0], 'en', TAGS).prev?.topic).toBe(
      'evaluation'
    );
  });

  it('ignores drafts and other-locale neighbours (published + same-lang only)', () => {
    const mixed = [
      entry({
        slug: 'p',
        publishDate: '10-05-2026',
        tags: ['rag'],
        lang: 'fr',
      }),
      entry({
        slug: 'q',
        publishDate: '09-05-2026',
        tags: ['rag'],
        lang: 'fr',
        publishState: 'draft',
      }),
      entry({
        slug: 'r',
        publishDate: '09-05-2026',
        tags: ['rag'],
        lang: 'en',
      }),
      entry({
        slug: 's',
        publishDate: '08-05-2026',
        tags: ['rag'],
        lang: 'fr',
      }),
    ];
    const nav = getPrevNextByTag(mixed, mixed[3], 'fr', TAGS); // current = 's'
    expect(nav.prev).toBeNull();
    expect(nav.next?.href).toBe('/fr/blog/p/'); // draft 'q' + en 'r' skipped → 'p'
  });

  it('current absent from the published set → both null', () => {
    const draftCurrent = entry({
      slug: 'ghost',
      tags: ['rag'],
      publishState: 'draft',
    });
    expect(getPrevNextByTag(cluster, draftCurrent, 'fr', TAGS)).toEqual({
      prev: null,
      next: null,
    });
  });
});

/* ====================================================== portfolio (S6) ==== */
/** Build a ProjectEntryLike with sensible defaults; override per test. */
function projectEntry(
  over: Partial<ProjectFrontmatter> & { id?: string } = {}
): ProjectEntryLike {
  const { id, ...data } = over;
  return {
    id: id ?? 'id',
    data: {
      translationKey: 'k',
      lang: 'fr',
      slug: 's',
      name: 'N',
      summary: 'one-liner',
      stack: ['TS'],
      status: 'active',
      links: [],
      publishState: 'published',
      ...data,
    },
  };
}

/* ----------------------------------------------- 12. isLiveStatus */
describe('isLiveStatus', () => {
  it('classifies only production-live statuses as live', () => {
    expect(isLiveStatus('shipped')).toBe(true);
    expect(isLiveStatus('publié')).toBe(true);
    expect(isLiveStatus('in production')).toBe(true);
    expect(isLiveStatus('en production')).toBe(true);
    for (const s of [
      'active',
      'actif',
      'active (paused)',
      'actif (en pause)',
      'MVP ready',
      'MVP prêt',
      'pre-launch',
      'pré-lancement',
    ]) {
      expect(isLiveStatus(s), s).toBe(false);
    }
  });

  it('is case-insensitive, trims, and treats empty as not-live', () => {
    expect(isLiveStatus('  SHIPPED  ')).toBe(true);
    expect(isLiveStatus('Publié')).toBe(true);
    expect(isLiveStatus('EN PRODUCTION')).toBe(true);
    expect(isLiveStatus('')).toBe(false);
    expect(isLiveStatus('   ')).toBe(false);
  });

  it('matches the real seed statuses in both langs (guards silent misclassification)', () => {
    // Only mcp-secrets-vault (shipped / publié) is production-live.
    const expectedLive: Record<string, boolean> = {
      'sterna-ai-platform': false,
      'claude-plan-execute': false,
      'ijtihad-engine': false,
      'bayan-rag-platform': false,
      atelier: false,
      'mcp-secrets-vault': true,
      'athletic-tracker': false,
    };
    for (const p of PORTFOLIO_PROJECTS) {
      const want = expectedLive[p.translationKey];
      expect(want, `unmapped translationKey ${p.translationKey}`).toBeDefined();
      expect(isLiveStatus(p.status.en), `${p.translationKey} en`).toBe(want);
      expect(isLiveStatus(p.status.fr), `${p.translationKey} fr`).toBe(want);
    }
  });
});

/* ----------------------------------------------- 13. PROJECT_ORDER coverage */
describe('PROJECT_ORDER', () => {
  it('covers every seed translationKey (no project silently un-ordered)', () => {
    for (const p of PORTFOLIO_PROJECTS) {
      expect([...PROJECT_ORDER], p.translationKey).toContain(p.translationKey);
    }
  });
});

/* ----------------------------------------------- 14. getPublishedProjects */
describe('getPublishedProjects', () => {
  it('drops drafts and other-locale entries', () => {
    const mixed = [
      projectEntry({
        translationKey: 'sterna-ai-platform',
        lang: 'fr',
        slug: 'a',
        publishState: 'published',
      }),
      projectEntry({
        translationKey: 'atelier',
        lang: 'fr',
        slug: 'b',
        publishState: 'draft',
      }),
      projectEntry({
        translationKey: 'bayan-rag-platform',
        lang: 'en',
        slug: 'c',
        publishState: 'published',
      }),
    ];
    expect(getPublishedProjects(mixed, 'fr').map((e) => e.data.slug)).toEqual([
      'a',
    ]);
  });

  it('orders by PROJECT_ORDER (translationKey) regardless of input order', () => {
    const shuffled = [
      projectEntry({ translationKey: 'athletic-tracker', slug: 'at' }),
      projectEntry({ translationKey: 'sterna-ai-platform', slug: 'st' }),
      projectEntry({ translationKey: 'bayan-rag-platform', slug: 'ba' }),
      projectEntry({ translationKey: 'claude-plan-execute', slug: 'cpe' }),
    ];
    expect(
      getPublishedProjects(shuffled, 'fr').map((e) => e.data.translationKey)
    ).toEqual([
      'sterna-ai-platform',
      'claude-plan-execute',
      'bayan-rag-platform',
      'athletic-tracker',
    ]);
  });

  it('appends an unknown-translationKey project after ordered ones, alpha by slug', () => {
    const items = [
      projectEntry({ translationKey: 'zzz-unknown', slug: 'zzz-b' }),
      projectEntry({ translationKey: 'sterna-ai-platform', slug: 'st' }),
      projectEntry({ translationKey: 'yyy-unknown', slug: 'aaa-a' }),
    ];
    expect(getPublishedProjects(items, 'fr').map((e) => e.data.slug)).toEqual([
      'st', // ordered (sterna) first
      'aaa-a', // extras sorted alpha by slug
      'zzz-b',
    ]);
  });

  it('does not mutate the input array', () => {
    const items = [
      projectEntry({ translationKey: 'athletic-tracker', slug: 'b' }),
      projectEntry({ translationKey: 'sterna-ai-platform', slug: 'a' }),
    ];
    const before = items.map((e) => e.data.slug);
    getPublishedProjects(items, 'fr');
    expect(items.map((e) => e.data.slug)).toEqual(before);
  });
});

/* ----------------------------------------------- 15. toProjectCard */
describe('toProjectCard', () => {
  it('builds the work href, maps fields, sets lang and a non-live isLive', () => {
    const e = projectEntry({
      lang: 'fr',
      slug: 'mon-projet',
      name: 'Mon Projet',
      summary: 'Une ligne.',
      stack: ['TS', 'Astro'],
      status: 'actif',
    });
    const card = toProjectCard(e, 'fr');
    expect(card.href).toBe('/fr/work/mon-projet/');
    expect(card.name).toBe('Mon Projet');
    expect(card.summary).toBe('Une ligne.');
    expect(card.stack).toEqual(['TS', 'Astro']);
    expect(card.status).toBe('actif');
    expect(card.lang).toBe('fr');
    expect(card.isLive).toBe(isLiveStatus('actif')); // false
  });

  it('uses the localized slug; isLive tracks isLiveStatus for a live status', () => {
    const e = projectEntry({
      lang: 'en',
      slug: 'mcp-secrets-vault',
      status: 'shipped',
    });
    const card = toProjectCard(e, 'en');
    expect(card.href).toBe('/en/work/mcp-secrets-vault/');
    expect(card.isLive).toBe(true);
    expect(card.isLive).toBe(isLiveStatus(e.data.status));
  });
});

/* ----------------------------------------- getRelatedArticles (S7, task 13) */
describe('getRelatedArticles — resolve project relatedArticles', () => {
  it('returns [] for undefined and for empty keys', () => {
    expect(getRelatedArticles([entry()], undefined, 'fr')).toEqual([]);
    expect(getRelatedArticles([entry()], [], 'fr')).toEqual([]);
  });

  it('resolves keys to published current-lang articles, preserving key order', () => {
    const articles = [
      entry({
        translationKey: 'k1',
        slug: 's1',
        title: 'T1',
        publishDate: '01-01-2026',
        body: 'word '.repeat(400), // 400 words → 2 min
      }),
      entry({
        translationKey: 'k2',
        slug: 's2',
        title: 'T2',
        publishDate: '02-02-2026',
        body: 'tiny', // 1 word → 1 min
      }),
    ];
    // given order ['k2','k1'] is preserved (NOT input/date order)
    const out = getRelatedArticles(articles, ['k2', 'k1'], 'fr');
    expect(out.map((r) => r.href)).toEqual(['/fr/blog/s2/', '/fr/blog/s1/']);
    // each row maps title / dateDisplay / readingLabel from its article
    expect(out[0]).toEqual({
      href: '/fr/blog/s2/',
      title: 'T2',
      dateDisplay: '02-02-2026',
      readingLabel: '1 min',
    });
    expect(out[1]).toEqual({
      href: '/fr/blog/s1/',
      title: 'T1',
      dateDisplay: '01-01-2026',
      readingLabel: '2 min',
    });
  });

  it('drops a draft key, an other-lang-only key, and a missing key', () => {
    const articles = [
      entry({ translationKey: 'kd', slug: 'sd', lang: 'fr', publishState: 'draft' }),
      entry({ translationKey: 'ko', slug: 'so', lang: 'en', publishState: 'published' }),
    ];
    // kd = draft, ko = wrong lang for 'fr', kmissing = absent → all dropped
    expect(getRelatedArticles(articles, ['kd', 'ko', 'kmissing'], 'fr')).toEqual(
      []
    );
  });

  it('resolves the same key to the per-locale published article', () => {
    const articles = [
      entry({ translationKey: 'kx', slug: 'en-x', lang: 'en' }),
      entry({ translationKey: 'kx', slug: 'fr-x', lang: 'fr' }),
    ];
    expect(getRelatedArticles(articles, ['kx'], 'en').map((r) => r.href)).toEqual(
      ['/en/blog/en-x/']
    );
    expect(getRelatedArticles(articles, ['kx'], 'fr').map((r) => r.href)).toEqual(
      ['/fr/blog/fr-x/']
    );
  });
});
