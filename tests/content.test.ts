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
} from '@/lib/content';
import type { ArticleEntryLike } from '@/lib/content';
import type { ArticleFrontmatter, Tag } from '@/content/schemas';

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

/* -------------------------------------------------------- constants */
describe('constants', () => {
  it('ARTICLES_PER_PAGE is a positive integer', () => {
    expect(Number.isInteger(ARTICLES_PER_PAGE)).toBe(true);
    expect(ARTICLES_PER_PAGE).toBeGreaterThan(0);
  });
});
