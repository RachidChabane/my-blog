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
import type {
  ArticleFrontmatter,
  ProjectFrontmatter,
  Tag,
  Category,
} from '@/content/schemas';

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
  difficulty: number; // 1-5 (rubric-rated; rendered as stars next to readingLabel)
  category: ArticleFrontmatter['category']; // 'essays' | 'explainers' | 'briefings' | 'lessons' (schema default applied)
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

/**
 * Non-empty lines inside fenced blocks (``` … ```). Code and fenced diagrams
 * read slower than prose, so readingTime charges them per LINE (not per word)
 * instead of dropping them entirely.
 */
function fencedBlockLines(s: string): number {
  let lines = 0;
  for (const m of s.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    lines += m[1].split('\n').filter((l) => l.trim().length > 0).length;
  }
  return lines;
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

/**
 * THE single reading-speed constants — every surface (card, article page,
 * search meta) derives its estimate from readingTime below, so the numbers
 * stay comparable across the whole blog. 210 wpm sits mid-band of the
 * 200-225 wpm spec; fenced code/diagram lines are charged at a slower
 * per-line rate since they take longer to absorb than prose.
 */
export const READING_WPM = 210;
export const CODE_LINES_PER_MINUTE = 30;

/** Reading time in minutes from raw markdown body. Empty/short → 1. */
export function readingTime(
  body: string | undefined,
  wpm = READING_WPM
): number {
  if (!body) return 1;
  const text = stripInlineMarkdown(stripCodeFences(body));
  const words = text.split(/\s+/).filter(Boolean).length;
  const codeMinutes = fencedBlockLines(body) / CODE_LINES_PER_MINUTE;
  return Math.max(1, Math.round(words / wpm + codeMinutes));
}

/** Language-neutral reading label, e.g. "7 min" (matches the design). */
export function readingLabel(
  body: string | undefined,
  wpm = READING_WPM
): string {
  return `${readingTime(body, wpm)} min`;
}

/* --------------------------------------------------- Difficulty (1-5 meter) */
/**
 * The PRESSWORK difficulty METER for the 1-5 rating (rubric:
 * pipeline/difficulty_rubric.md). Full blocks (U+2588) = level, light shade
 * blocks (U+2591) = remainder — a typeset gauge that reads in grayscale and via
 * the companion aria-label, never on color alone. U+2588/U+2591 are box-drawing
 * glyphs, not emoji (INV-9 safe — they don't match \p{Emoji_Presentation}).
 * Out-of-range input is clamped. Always 5 glyphs → columns align.
 * (Name kept as `difficultyStars` so every call site / import stays stable.)
 */
export function difficultyStars(level: number): string {
  const n = Math.min(5, Math.max(1, Math.round(level)));
  return '█'.repeat(n) + '░'.repeat(5 - n);
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

/** Localized category label with a slug fallback so a missing vocab entry never breaks render. */
export function categoryLabel(
  slug: string,
  lang: Locale,
  categories: Category[]
): string {
  return categories.find((c) => c.slug === slug)?.label[lang] ?? slug;
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
    difficulty: entry.data.difficulty,
    category: entry.data.category,
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

/* ------------------------------------------------------ Tag surfaces (S4 / S5) */

/** A topic row in the S4 directory: localized label + S5 href + published-article count. */
export interface TagDirEntry {
  slug: string;
  label: string;
  href: string; // /<lang>/tags/<slug>/
  count: number; // published articles in `lang` carrying this tag
}

/**
 * Compose a localized count label from singular/plural templates carrying a `{n}`
 * placeholder. Pluralization is the caller's data, not locale logic here.
 *   formatCount(1, '{n} post', '{n} posts')  → '1 post'
 *   formatCount(3, '{n} écrit', '{n} écrits') → '3 écrits'
 */
export function formatCount(n: number, one: string, many: string): string {
  return (n === 1 ? one : many).replace('{n}', String(n));
}

/** Published-article count per tag slug for `lang` (drafts/other-lang excluded). */
export function tagCounts(
  entries: ArticleEntryLike[],
  lang: Locale
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of getPublishedArticles(entries, lang)) {
    for (const slug of e.data.tags) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1);
    }
  }
  return counts;
}

/**
 * Published articles for `lang` carrying `slug`, newest-first. Reuses
 * getPublishedArticles' filter+ordering (date desc, slug tiebreak) → deterministic.
 */
export function getArticlesByTag(
  entries: ArticleEntryLike[],
  lang: Locale,
  slug: string
): ArticleEntryLike[] {
  return getPublishedArticles(entries, lang).filter((e) =>
    e.data.tags.includes(slug)
  );
}

/* ------------------------------------------------ Category grouping (blog index) */

/**
 * Display/grouping order of the 4-way `category` taxonomy. `category` is a closed
 * `z.enum`, so every article value is guaranteed to be one of these — there are no
 * "extras" to append (unlike free-form tags). Order is fixed by the design;
 * `lessons` (structured educational deep-dives, generated on no-news days) sits
 * last so the news-driven sections keep their established positions.
 */
export const CATEGORY_ORDER = [
  'essays',
  'explainers',
  'briefings',
  'lessons',
] as const;

/** One category section on the blog index: the slug + its published articles (raw entries). */
export interface CategoryGroup {
  category: string;
  articles: ArticleEntryLike[]; // same item type getPublishedArticles returns
}

/**
 * Group `lang`'s published articles by `category`, in CATEGORY_ORDER. Each group's
 * articles inherit getPublishedArticles' ordering (newest-first, slug tiebreak) and
 * its published+lang filter. The schema's `.default('explainers')` already populated
 * `e.data.category`, so no fallback is needed here. Empty categories are OMITTED, so
 * the index never renders a heading with no posts. Returns raw entries; the route
 * maps each through toArticleCard.
 */
export function getArticlesByCategory(
  entries: ArticleEntryLike[],
  lang: Locale
): CategoryGroup[] {
  const published = getPublishedArticles(entries, lang); // filtered + newest-first
  const buckets = new Map<string, ArticleEntryLike[]>();
  for (const e of published) {
    const cat = e.data.category;
    const list = buckets.get(cat);
    if (list) list.push(e);
    else buckets.set(cat, [e]);
  }
  const out: CategoryGroup[] = [];
  for (const category of CATEGORY_ORDER) {
    const articles = buckets.get(category);
    if (articles && articles.length > 0) out.push({ category, articles });
  }
  return out;
}

/**
 * S4 directory: curated-vocabulary topics with ≥1 published article in `lang`, in
 * TAG_RAIL_ORDER (extras — vocabulary tags absent from the order — appended alpha),
 * each with its count. Mirrors tagRail's ordering so the directory and the S2 chip
 * rail agree. Tags with 0 articles are omitted (a directory of populated topics);
 * their S5 page still exists (generated from the full vocabulary) so the chip rail
 * never dead-ends. Orphan ordered slugs (in the order, absent from vocab) skip.
 */
export function tagDirectory(
  entries: ArticleEntryLike[],
  tags: Tag[],
  lang: Locale
): TagDirEntry[] {
  const counts = tagCounts(entries, lang);
  const bySlug = new Map(tags.map((t) => [t.slug, t]));
  const seen = new Set<string>();
  const out: TagDirEntry[] = [];
  const push = (t: Tag) => {
    const count = counts.get(t.slug) ?? 0;
    if (count > 0) {
      out.push({
        slug: t.slug,
        label: t.label[lang],
        href: localePath(lang, `tags/${t.slug}`),
        count,
      });
    }
  };
  for (const slug of TAG_RAIL_ORDER) {
    const t = bySlug.get(slug);
    if (!t) continue; // orphan in the order list — skip
    seen.add(slug);
    push(t);
  }
  const extras = tags
    .filter((t) => !seen.has(t.slug))
    .sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
  for (const t of extras) push(t);
  return out;
}

/**
 * Published-article tag slugs NOT present in the vocabulary `tags`, for `lang`
 * (sorted, deduped). Empty ⇒ every article tag is curated. The S5 route throws on
 * a non-empty result so a rogue tag fails the build loudly instead of emitting an
 * orphan page / a dangling tag-link from ArticleListItem.
 */
export function unknownArticleTags(
  entries: ArticleEntryLike[],
  tags: Tag[],
  lang: Locale
): string[] {
  const vocab = new Set(tags.map((t) => t.slug));
  const unknown = new Set<string>();
  for (const e of getPublishedArticles(entries, lang)) {
    for (const slug of e.data.tags) if (!vocab.has(slug)) unknown.add(slug);
  }
  return [...unknown].sort();
}

/* ============================================================ Portfolio (S6) */
/**
 * Pure project query + view-model helpers — the portfolio analog of the article
 * seam above. Still no `astro:content` import, so vitest exercises them directly.
 * Projects need no `body` for the card: `summary` is a real frontmatter field
 * (unlike the article dek, which is derived from the body). The S6 route maps
 * published projects → ProjectCardVM once, decoupling ProjectCard.astro from
 * collection internals.
 */

/** Structural shape of a glob-loaded project entry (the subset the card uses). */
export interface ProjectEntryLike {
  id: string;
  data: ProjectFrontmatter;
}

/** One at-a-glance stat on the featured card / detail page (verbatim frontmatter). */
export interface ProjectMetricVM {
  value: string;
  label: string;
}

/** View-model the project card renders (named `…VM` to avoid colliding with the component). */
export interface ProjectCardVM {
  slug: string;
  lang: Locale;
  href: string; // /<lang>/work/<slug>/
  name: string;
  summary: string; // frontmatter `summary` verbatim (the one-liner)
  stack: string[];
  status: string; // localized free-text status, rendered verbatim
  isLive: boolean; // derived → accent status dot
  // ---- enrichment (populated only by toProjectFeature for the flagship "feature"
  // card; undefined on the uniform cards, which never read these). ----
  year?: string;
  highlights?: string[]; // key points (capped)
  metrics?: ProjectMetricVM[]; // stat cards (capped)
}

/**
 * Curated portfolio order, by `translationKey`. Glob-loader order is not
 * guaranteed (same reason as TAG_RAIL_ORDER), so impose it: flagships first
 * (app-ia.md line 86 order), then the rest. Any published project whose
 * translationKey is absent here is appended, sorted alpha by slug, so a future
 * project never silently vanishes. Editorial order is tunable.
 */
export const PROJECT_ORDER = [
  'sterna-ai-platform',
  'claude-plan-execute',
  'cca-f-exam-trainer',
  'ijtihad-engine',
  'bayan-rag-platform',
  'atelier',
  'mcp-secrets-vault',
  'athletic-tracker',
] as const;

/**
 * Statuses that earn the accent "live" status-dot. The design reserves the
 * accent for production-live status only ("l’accent ne sert qu’au survol et au
 * statut « en production »"), so match EXACTLY against a normalized set — not
 * `startsWith`, which would wrongly catch "active (paused)". Easily tuned later;
 * a documented editorial judgment, not pinned in e2e (visual → Playwright-MCP).
 */
const LIVE_STATUSES: ReadonlySet<string> = new Set([
  'shipped',
  'in production', // EN
  'publié',
  'en production', // FR
]);

/** True when `status` denotes production-live (case-insensitive, trimmed). */
export function isLiveStatus(status: string): boolean {
  return LIVE_STATUSES.has(status.trim().toLowerCase());
}

/**
 * Published projects for `lang`, in curated PROJECT_ORDER (by translationKey);
 * extras (translationKey absent from the order) are appended alpha-by-slug.
 * Does not mutate the input (filter → new array → sort).
 */
export function getPublishedProjects(
  entries: ProjectEntryLike[],
  lang: Locale
): ProjectEntryLike[] {
  const order = new Map(PROJECT_ORDER.map((k, i) => [k as string, i]));
  return entries
    .filter((e) => e.data.publishState === 'published' && e.data.lang === lang)
    .sort((a, b) => {
      const ai = order.get(a.data.translationKey) ?? Number.MAX_SAFE_INTEGER;
      const bi = order.get(b.data.translationKey) ?? Number.MAX_SAFE_INTEGER;
      if (ai !== bi) return ai - bi; // curated order
      return a.data.slug < b.data.slug ? -1 : a.data.slug > b.data.slug ? 1 : 0; // extras: alpha
    });
}

/* ------------------------------------------------------- S1 home (task 10) */
/**
 * Home/hub "latest" + "teaser" selectors. Thin slices over the existing
 * published+ordered queries — newest-first articles, curated-order projects —
 * so the home reuses the exact ordering S2/S6 already prove. Pure (no
 * astro:content import); the route maps the returned entries → cards.
 */

/** S1 home — newest published articles to feature (design: 3; app-ia §7: 3–5). */
export const HOME_LATEST_COUNT = 3;
/** S1 home — top flagship projects to tease (design/app-ia: 2–3 → 3). */
export const HOME_TEASER_COUNT = 3;

/** Newest `n` published articles for `lang` (reuses getPublishedArticles' order). */
export function latestArticles(
  entries: ArticleEntryLike[],
  lang: Locale,
  n: number = HOME_LATEST_COUNT
): ArticleEntryLike[] {
  return getPublishedArticles(entries, lang).slice(0, n);
}

/** Top `n` published projects for `lang` in curated PROJECT_ORDER (flagships first). */
export function teaserProjects(
  entries: ProjectEntryLike[],
  lang: Locale,
  n: number = HOME_TEASER_COUNT
): ProjectEntryLike[] {
  return getPublishedProjects(entries, lang).slice(0, n);
}

/* ---- RSS helpers (task 16) ---- */

/**
 * "DD-MM-YYYY" → JavaScript Date at midnight UTC.
 * Companion to parsePublishDate — returns a real Date for RSS pubDate.
 * Malformed input → epoch (same zero-sentinel as parsePublishDate).
 */
export function parsePublishDateToDate(s: string): Date {
  const parts = s.split('-');
  if (parts.length !== 3) return new Date(0);
  const [dd, mm, yyyy] = parts;
  const iso = `${yyyy}-${mm}-${dd}T00:00:00Z`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date(0) : d;
}

/** RSS feed item shape (mirrors @astrojs/rss RSSFeedItem; pure so vitest can cover it). */
export interface RssFeedItem {
  title: string;
  pubDate: Date;
  description: string;
  link: string;
}

/**
 * Map one published ArticleEntryLike to an RSS feed item.
 * Uses parsePublishDateToDate and excerpt (both pure).
 */
export function toRssFeedItem(
  entry: ArticleEntryLike,
  lang: Locale
): RssFeedItem {
  return {
    title: entry.data.title,
    pubDate: parsePublishDateToDate(entry.data.publishDate),
    description: excerpt(entry.body),
    link: localePath(lang, `blog/${entry.data.slug}`),
  };
}

/**
 * Full RSS item list for `lang`: published articles newest-first, mapped to feed items.
 * Pure — takes pre-fetched entries so vitest can call it without astro:content.
 */
export function getFeedItems(
  entries: ArticleEntryLike[],
  lang: Locale
): RssFeedItem[] {
  return getPublishedArticles(entries, lang).map((e) => toRssFeedItem(e, lang));
}

/** Assemble the card view-model for one project entry. */
export function toProjectCard(
  entry: ProjectEntryLike,
  lang: Locale
): ProjectCardVM {
  const { slug, name, summary, stack, status } = entry.data;
  return {
    slug,
    lang,
    name,
    summary,
    stack,
    status,
    href: localePath(lang, `work/${slug}`), // /<lang>/work/<slug>/ (matches task-13 route)
    isLive: isLiveStatus(status),
  };
}

/** How many enrichment items the feature card surfaces (kept tight so it stays scannable). */
export const FEATURE_MAX_HIGHLIGHTS = 3;
export const FEATURE_MAX_METRICS = 3;

/**
 * Enriched view-model for the single flagship "feature" card on the portfolio index
 * (PROJECT_ORDER[0]). Extends the uniform card with the optional frontmatter
 * enrichment — year, key highlights, stat metrics — capped so the bigger card stays
 * scannable. Falls back gracefully: a flagship lacking any enrichment renders the same
 * anatomy as a uniform card, just wider. Pure (no astro:content import).
 */
export function toProjectFeature(
  entry: ProjectEntryLike,
  lang: Locale
): ProjectCardVM {
  const base = toProjectCard(entry, lang);
  const { year, highlights, metrics } = entry.data;
  return {
    ...base,
    year,
    highlights: highlights?.slice(0, FEATURE_MAX_HIGHLIGHTS),
    metrics: metrics?.slice(0, FEATURE_MAX_METRICS),
  };
}

/* ---- Related articles on the project detail page (S7, task 13) ---- */

/** A related-article row on the project detail page (S7). */
export interface RelatedArticleVM {
  href: string; // /<lang>/blog/<slug>/
  title: string;
  dateDisplay: string; // DD-MM-YYYY (as stored)
  readingLabel: string; // "N min"
}

/**
 * Resolve a project's `relatedArticles` (translationKeys) to published articles in
 * `lang`, preserving the given key order. Keys with no published current-lang match
 * (draft, other lang, or absent) are dropped silently, so a dangling key never
 * breaks render or links an unbuilt page (INV-3). Empty/undefined keys → []. Pure
 * (no astro:content import) — mirrors buildSlugMap's published+lang discipline.
 */
export function getRelatedArticles(
  entries: ArticleEntryLike[],
  keys: string[] | undefined,
  lang: Locale
): RelatedArticleVM[] {
  if (!keys || keys.length === 0) return [];
  const out: RelatedArticleVM[] = [];
  for (const key of keys) {
    const e = entries.find(
      (a) =>
        a.data.translationKey === key &&
        a.data.lang === lang &&
        a.data.publishState === 'published'
    );
    if (!e) continue;
    out.push({
      href: localePath(lang, `blog/${e.data.slug}`),
      title: e.data.title,
      dateDisplay: e.data.publishDate,
      readingLabel: readingLabel(e.body),
    });
  }
  return out;
}
