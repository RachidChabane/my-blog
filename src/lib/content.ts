/**
 * src/lib/content.ts — pure content query + view-model utilities for the article
 * surfaces (S2 index here; reused by S5 tag pages, S9 search, S1 home "latest").
 *
 * PURE by design: no `astro:content` import, so vitest can exercise it directly.
 * Types are structural — `getCollection('articles')` entries assign to
 * `ArticleEntryLike` without casting. The Astro route maps entries → ArticleCard
 * once, decoupling components from collection internals.
 *
 * Conventions honored:
 *  - dek = the article's lead paragraph (no `dek` frontmatter field; see plan §3
 *    + memory reading-surface-content-conventions). reading-time = words / wpm.
 *  - regexes avoid control-char ranges (memory eslint-no-control-regex) and emit
 *    no emojis (INV-9 / memory emoji-detection-regex).
 */
import { localePath } from '@/i18n/index';
import type { Locale } from '@/i18n/index';
import type { ArticleFrontmatter, Tag } from '@/content/schemas';

/** 8 seeds → pages of 5 + 3 (exercises pagination); reused by task 9. */
export const ARTICLES_PER_PAGE = 5;

/**
 * Curated chip-rail order. `getCollection('tags')` returns entries sorted
 * alphabetically by `id`, NOT in JSON array order, so the rail imposes its own
 * order here (= design TAG_ORDER + `qualite`). Verified empirically (Astro 6.4.2).
 */
export const TAG_RAIL_ORDER = [
  'agents',
  'rag',
  'agentic-coding',
  'evaluation',
  'llm-oss',
  'retrieval',
  'qualite',
] as const;

/** Structural shape of a glob-loaded markdown collection entry (subset we use). */
export interface ArticleEntryLike {
  id: string;
  body?: string;
  data: ArticleFrontmatter;
}

/** View-model the list item renders — built once, decoupled from collection internals. */
export interface ArticleCard {
  slug: string;
  lang: Locale;
  href: string; // /<lang>/blog/<slug>/
  title: string;
  dek: string;
  dateDisplay: string; // DD-MM-YYYY (already stored that way)
  readingLabel: string; // "N min"
  tags: { slug: string; label: string; href: string }[]; // href → /<lang>/tags/<slug>/
}

export interface RailTag {
  slug: string;
  label: string;
  href: string;
}

/** "DD-MM-YYYY" → sortable YYYYMMDD number. No Date/TZ. Malformed → 0. */
export function parsePublishDate(s: string): number {
  const parts = s.split('-');
  if (parts.length !== 3) return 0;
  const [dd, mm, yyyy] = parts;
  const n = Number(`${yyyy}${mm}${dd}`);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Published articles for `lang`, newest-first, with a stable slug tiebreak so
 * equal-date posts never reorder across builds (deterministic pagination/e2e).
 * Does not mutate the input (filter → new array → sort).
 */
export function getPublishedArticles(
  entries: ArticleEntryLike[],
  lang: Locale
): ArticleEntryLike[] {
  return entries
    .filter((e) => e.data.publishState === 'published' && e.data.lang === lang)
    .sort((a, b) => {
      const byDate =
        parsePublishDate(b.data.publishDate) -
        parsePublishDate(a.data.publishDate);
      if (byDate !== 0) return byDate;
      return a.data.slug < b.data.slug ? -1 : a.data.slug > b.data.slug ? 1 : 0;
    });
}

/** Drop fenced code blocks (``` … ```) — they shouldn't inflate word/excerpt logic. */
function stripCodeFences(s: string): string {
  return s.replace(/```[\s\S]*?```/g, '\n\n');
}

/** Strip inline markdown to plain text. Order matters: images before links. */
function stripInlineMarkdown(s: string): string {
  return s
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → link text
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/[*_]+/g, '') // bold/italic markers
    .replace(/\s+/g, ' ')
    .trim();
}

/** Reading time in minutes from raw markdown body. Empty/short → 1. */
export function readingTime(body: string | undefined, wpm = 200): number {
  if (!body) return 1;
  const text = stripInlineMarkdown(stripCodeFences(body));
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

/** Language-neutral reading label, e.g. "7 min" (matches the design). */
export function readingLabel(body: string | undefined, wpm = 200): string {
  return `${readingTime(body, wpm)} min`;
}

/**
 * Lead-paragraph excerpt (the dek). First non-empty block of body text that is
 * not a heading/blockquote/fence; inline markdown stripped; collapsed; truncated
 * at a word boundary with `…` when longer than maxLen (result stays ≤ maxLen).
 */
export function excerpt(body: string | undefined, maxLen = 180): string {
  if (!body) return '';
  const lines = stripCodeFences(body).split('\n');
  const collected: string[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      if (collected.length > 0) break; // end of first paragraph
      continue; // skip leading blanks
    }
    if (line.startsWith('#') || line.startsWith('>')) {
      if (collected.length > 0) break;
      continue; // skip heading/blockquote lines preceding the paragraph
    }
    collected.push(line);
  }
  const clean = stripInlineMarkdown(collected.join(' '));
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen - 1); // reserve one char for the ellipsis
  const lastSpace = slice.lastIndexOf(' ');
  const head = (lastSpace > 0 ? slice.slice(0, lastSpace) : slice).replace(
    /\s+$/,
    ''
  );
  return `${head}…`;
}

/** Localized tag label with a slug fallback so a missing vocab entry never breaks render. */
export function tagLabel(slug: string, lang: Locale, tags: Tag[]): string {
  return tags.find((t) => t.slug === slug)?.label[lang] ?? slug;
}

/** Assemble the list-item view-model for one entry. */
export function toArticleCard(
  entry: ArticleEntryLike,
  lang: Locale,
  tags: Tag[]
): ArticleCard {
  const { slug, title, publishDate } = entry.data;
  return {
    slug,
    lang,
    href: localePath(lang, `blog/${slug}`),
    title,
    dek: excerpt(entry.body),
    dateDisplay: publishDate,
    readingLabel: readingLabel(entry.body),
    tags: entry.data.tags.map((s) => ({
      slug: s,
      label: tagLabel(s, lang, tags),
      href: localePath(lang, `tags/${s}`),
    })),
  };
}

/**
 * The chip rail in curated order (TAG_RAIL_ORDER), independent of the input
 * array order. Orphans (ordered but absent from the vocabulary) are skipped;
 * any vocabulary tag not in the order list is appended alphabetically so nothing
 * silently vanishes.
 */
export function tagRail(tags: Tag[], lang: Locale): RailTag[] {
  const bySlug = new Map(tags.map((t) => [t.slug, t]));
  const seen = new Set<string>();
  const rail: RailTag[] = [];
  for (const slug of TAG_RAIL_ORDER) {
    const t = bySlug.get(slug);
    if (!t) continue; // orphan in the order list — skip
    seen.add(slug);
    rail.push({
      slug,
      label: t.label[lang],
      href: localePath(lang, `tags/${slug}`),
    });
  }
  const extras = tags
    .filter((t) => !seen.has(t.slug))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  for (const t of extras) {
    rail.push({
      slug: t.slug,
      label: t.label[lang],
      href: localePath(lang, `tags/${t.slug}`),
    });
  }
  return rail;
}

/* ----------------------------------------------------- Source view-model (S3) */
export interface SourceView {
  n: string; // zero-padded ordinal: "01", "02", …
  label: string;
  url: string;
  host: string; // hostname without leading "www."; "" if unparseable
  date: string; // DD-MM-YYYY (as stored)
}

/** Hostname without a leading "www.", or "" if the URL can't be parsed. */
export function sourceHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/** Numbered, host-resolved source view-models; preserves schema (source) order. */
export function toSourceViews(
  sources: ArticleFrontmatter['sources']
): SourceView[] {
  return sources.map((s, i) => ({
    n: String(i + 1).padStart(2, '0'),
    label: s.label,
    url: s.url,
    host: sourceHost(s.url),
    date: s.date,
  }));
}

/* ------------------------------------------- Translation slug map (lang switch) */
/**
 * locale → published slug for a translationKey, across both languages. ONLY
 * published counterparts are included, so the switcher never links to a page that
 * wasn't built; a missing/draft counterpart → that locale is omitted →
 * switcherHref falls back to the localized home (NFR-11 net). INV-1 FR/EN parity
 * is a content guarantee (pipeline), not enforced here.
 */
export function buildSlugMap(
  entries: ArticleEntryLike[],
  translationKey: string
): Partial<Record<Locale, string>> {
  const map: Partial<Record<Locale, string>> = {};
  for (const e of entries) {
    if (
      e.data.translationKey === translationKey &&
      e.data.publishState === 'published'
    ) {
      map[e.data.lang] = e.data.slug;
    }
  }
  return map;
}

/* ------------------------------------------------- prev / next by shared tag (S3) */
export interface PrevNextCard {
  href: string; // /<lang>/blog/<slug>/
  title: string;
  topic: string; // localized label of the shared tag
}
export interface PrevNextNav {
  prev: PrevNextCard | null; // nearest OLDER post sharing ≥1 tag
  next: PrevNextCard | null; // nearest NEWER post sharing ≥1 tag
}

/** First tag in `a`'s order that `b` also carries, else null. */
function sharedTag(a: ArticleEntryLike, b: ArticleEntryLike): string | null {
  for (const t of a.data.tags) if (b.data.tags.includes(t)) return t;
  return null;
}

/**
 * Nearest published same-lang neighbours sharing ≥1 tag with `current`, over the
 * index ordering (newest-first). prev = nearest OLDER, next = nearest NEWER. Ends
 * → that side null; no tag-mates → both null (route omits the nav).
 */
export function getPrevNextByTag(
  entries: ArticleEntryLike[],
  current: ArticleEntryLike,
  lang: Locale,
  tags: Tag[]
): PrevNextNav {
  const published = getPublishedArticles(entries, lang); // newest-first, filtered
  const ci = published.findIndex((e) => e.data.slug === current.data.slug);
  if (ci === -1) return { prev: null, next: null };

  const toCard = (e: ArticleEntryLike): PrevNextCard => ({
    href: localePath(lang, `blog/${e.data.slug}`),
    title: e.data.title,
    topic: tagLabel(sharedTag(current, e)!, lang, tags), // finder guarantees non-null
  });

  let next: PrevNextCard | null = null;
  for (let i = ci - 1; i >= 0; i--) {
    if (sharedTag(current, published[i])) {
      next = toCard(published[i]);
      break;
    }
  }
  let prev: PrevNextCard | null = null;
  for (let i = ci + 1; i < published.length; i++) {
    if (sharedTag(current, published[i])) {
      prev = toCard(published[i]);
      break;
    }
  }
  return { prev, next };
}
