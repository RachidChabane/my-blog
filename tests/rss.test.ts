import { describe, it, expect } from 'vitest';
import rss from '@astrojs/rss';
import {
  parsePublishDateToDate,
  toRssFeedItem,
  getFeedItems,
} from '@/lib/content';
import type { ArticleEntryLike } from '@/lib/content';
import type { ArticleFrontmatter } from '@/content/schemas';

/* -------------------------------------------------------------- fixtures */

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
      slug: 'test-slug',
      title: 'Test Title',
      publishDate: '15-05-2026',
      tags: ['agents'],
      category: 'explainers',
      difficulty: 3,
      sources: [
        { label: 'src', url: 'https://example.com', date: '01-01-2024' },
      ],
      contentHash: 'h',
      publishState: 'published',
      ...data,
    },
  };
}

const FR_PUBLISHED = [
  entry({
    id: 'fr-1',
    slug: 'newest-fr',
    lang: 'fr',
    publishDate: '20-05-2026',
    title: 'Newest FR',
    body: 'This is the lead paragraph for the newest FR article.',
    publishState: 'published',
  }),
  entry({
    id: 'fr-2',
    slug: 'older-fr',
    lang: 'fr',
    publishDate: '10-05-2026',
    title: 'Older FR',
    body: 'Lead paragraph for the older FR article.',
    publishState: 'published',
  }),
  entry({
    id: 'fr-draft',
    slug: 'draft-fr',
    lang: 'fr',
    publishDate: '25-05-2026',
    title: 'Draft FR',
    body: 'This draft should never appear in the feed.',
    publishState: 'draft',
  }),
  entry({
    id: 'en-1',
    slug: 'en-article',
    lang: 'en',
    publishDate: '21-05-2026',
    title: 'EN Article',
    body: 'Lead paragraph for the EN article.',
    publishState: 'published',
  }),
];

/* ----------------------------------------- parsePublishDateToDate */
describe('parsePublishDateToDate', () => {
  it('converts DD-MM-YYYY to a UTC midnight Date (correct field mapping)', () => {
    const d = parsePublishDateToDate('15-05-2026');
    expect(d.toISOString()).toBe('2026-05-15T00:00:00.000Z');
  });

  it('does NOT confuse day and month (day > 12 is unambiguous)', () => {
    const d = parsePublishDateToDate('28-03-2026');
    expect(d.getUTCMonth()).toBe(2); // March is index 2
    expect(d.getUTCDate()).toBe(28);
  });

  it('correctly handles day <= 12 (potentially ambiguous) without transposing', () => {
    const d = parsePublishDateToDate('05-11-2026');
    expect(d.getUTCMonth()).toBe(10); // November is index 10
    expect(d.getUTCDate()).toBe(5);
  });

  it('malformed input returns epoch (not NaN, not a throw)', () => {
    expect(parsePublishDateToDate('').getTime()).toBe(0);
    expect(parsePublishDateToDate('bad').getTime()).toBe(0);
    expect(parsePublishDateToDate('2026/05/15').getTime()).toBe(0);
  });
});

/* ----------------------------------------- toRssFeedItem */
describe('toRssFeedItem', () => {
  const e = entry({
    slug: 'hello-world',
    lang: 'fr',
    title: 'Hello World',
    publishDate: '15-05-2026',
    body: 'This is the lead paragraph.\n\nSecond paragraph ignored.',
    publishState: 'published',
  });

  it('maps title from entry.data.title', () => {
    expect(toRssFeedItem(e, 'fr').title).toBe('Hello World');
  });

  it('maps pubDate to the correct UTC midnight Date', () => {
    expect(toRssFeedItem(e, 'fr').pubDate.toISOString()).toBe(
      '2026-05-15T00:00:00.000Z'
    );
  });

  it('description is a non-empty lead-paragraph excerpt', () => {
    const desc = toRssFeedItem(e, 'fr').description;
    expect(desc.length).toBeGreaterThan(0);
    expect(desc).toContain('lead paragraph');
  });

  it('link matches /<lang>/blog/<slug>/', () => {
    expect(toRssFeedItem(e, 'fr').link).toBe('/fr/blog/hello-world/');
    expect(toRssFeedItem(e, 'en').link).toBe('/en/blog/hello-world/');
  });
});

/* ----------------------------------------- getFeedItems */
describe('getFeedItems', () => {
  it('returns only published articles for the requested locale', () => {
    const frItems = getFeedItems(FR_PUBLISHED, 'fr');
    const slugs = frItems.map((i) => i.link);
    expect(slugs.some((s) => s.includes('draft-fr'))).toBe(false);
    expect(slugs.some((s) => s.includes('en-article'))).toBe(false);
    expect(slugs.some((s) => s.includes('newest-fr'))).toBe(true);
    expect(slugs.some((s) => s.includes('older-fr'))).toBe(true);
  });

  it('items are newest-first (pubDate descending)', () => {
    const items = getFeedItems(FR_PUBLISHED, 'fr');
    for (let i = 1; i < items.length; i++) {
      expect(items[i - 1].pubDate.getTime()).toBeGreaterThanOrEqual(
        items[i].pubDate.getTime()
      );
    }
  });

  it('FR and EN lists differ (different language filtering)', () => {
    const frItems = getFeedItems(FR_PUBLISHED, 'fr');
    const enItems = getFeedItems(FR_PUBLISHED, 'en');
    expect(frItems.length).not.toBe(0);
    expect(enItems.length).not.toBe(0);
    const frSlugs = frItems.map((i) => i.link);
    const enSlugs = enItems.map((i) => i.link);
    expect(frSlugs).not.toEqual(enSlugs);
  });

  it('drafts are excluded', () => {
    const items = getFeedItems(FR_PUBLISHED, 'fr');
    expect(items.some((i) => i.title === 'Draft FR')).toBe(false);
  });
});

/* ----------------------------------------- Feed XML validity */
describe('Feed XML validity (@astrojs/rss)', () => {
  it('produces valid RSS XML with expected structure', async () => {
    const items = getFeedItems(FR_PUBLISHED, 'en');
    const response = await rss({
      title: 'Test feed',
      description: 'Test',
      site: 'https://example.com',
      items,
      customData: '<language>en-US</language>',
    });
    const xml = await response.text();

    expect(xml).toContain('<rss');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<language>en-US</language>');
  });

  it('contains one <item> per published EN article', async () => {
    const items = getFeedItems(FR_PUBLISHED, 'en');
    const response = await rss({
      title: 'Test feed',
      description: 'Test',
      site: 'https://example.com',
      items,
    });
    const xml = await response.text();

    const itemMatches = xml.match(/<item>/g) ?? [];
    expect(itemMatches.length).toBe(items.length);
    expect(itemMatches.length).toBe(1); // only en-article is EN published
  });

  it('does NOT contain items for draft articles', async () => {
    const items = getFeedItems(FR_PUBLISHED, 'fr');
    const response = await rss({
      title: 'Test feed',
      description: 'Test',
      site: 'https://example.com',
      items,
    });
    const xml = await response.text();

    expect(xml).not.toContain('Draft FR');
    expect(xml).not.toContain('draft-fr');
  });

  it('item links are absolute (resolved against site)', async () => {
    const items = getFeedItems(FR_PUBLISHED, 'en');
    const response = await rss({
      title: 'Test feed',
      description: 'Test',
      site: 'https://example.com',
      items,
    });
    const xml = await response.text();

    expect(xml).toContain('https://example.com/en/blog/en-article/');
  });

  it('<pubDate> entries appear newest-first in the XML', async () => {
    const frItems = getFeedItems(FR_PUBLISHED, 'fr');
    const response = await rss({
      title: 'Test feed',
      description: 'Test',
      site: 'https://example.com',
      items: frItems,
    });
    const xml = await response.text();

    const pubDateMatches = [
      ...xml.matchAll(/<pubDate>([^<]+)<\/pubDate>/g),
    ].map((m) => new Date(m[1]).getTime());
    expect(pubDateMatches.length).toBeGreaterThan(1);
    for (let i = 1; i < pubDateMatches.length; i++) {
      expect(pubDateMatches[i - 1]).toBeGreaterThanOrEqual(pubDateMatches[i]);
    }
  });
});
