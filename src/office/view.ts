/**
 * View models of the office pages: what a list row, a library entry and the 3D
 * world need, derived from the content collections.
 */
import type { Locale } from '@/i18n/index';
import { localePath } from '@/i18n/index';
import {
  excerpt,
  getPublishedArticles,
  getPublishedJournal,
  getPublishedProjects,
  getPublishedRadar,
  parsePublishDate,
  readingTime,
} from '@/lib/content';
import type {
  ArticleEntryLike,
  JournalEntryLike,
  ProjectEntryLike,
  RadarEntryLike,
} from '@/lib/content';
import type { Concept } from '@/content/schemas';

export type RowSection = 'radar' | 'blog' | 'journal';

export interface Row {
  section: RowSection;
  href: string;
  /** DD-MM-YYYY, as written in the content. */
  date: string;
  /** YYYY-MM, for grouping by month. */
  month: string;
  title: string;
  dek: string;
  /** Kind of text: a radar kind, an article category, or empty. */
  kind: string;
  minutes: number;
  sources: number;
  tags: string[];
}

/** How many texts are offered after a reading page, and projects after a project. */
export const NEXT_COUNT = 2;
export const OTHERS_COUNT = 3;

const DEK_MAX = 210;

/** One or two whole sentences, never a word cut in half. */
export function shortDek(text: string, max = DEK_MAX): string {
  const flat = text
    .replace(/\s*\[s\d+\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (flat.length <= max) return flat;
  const sentence = flat.match(new RegExp(`^(.{60,${max}}[.!?])\\s`));
  if (sentence) return sentence[1];
  return `${flat.slice(0, max).replace(/\s\S*$/, '')}…`;
}

function monthOf(publishDate: string): string {
  const ms = parsePublishDate(publishDate);
  if (ms === 0) return '';
  return new Date(ms).toISOString().slice(0, 7);
}

export function articleRow(entry: ArticleEntryLike, lang: Locale): Row {
  const d = entry.data;
  return {
    section: 'blog',
    href: localePath(lang, `blog/${d.slug}`),
    date: d.publishDate,
    month: monthOf(d.publishDate),
    title: d.title,
    dek: shortDek(excerpt(entry.body, 400)),
    kind: d.category,
    minutes: readingTime(entry.body),
    sources: d.sources.length,
    tags: d.tags,
  };
}

export function radarRow(entry: RadarEntryLike, lang: Locale): Row {
  const d = entry.data;
  return {
    section: 'radar',
    href: localePath(lang, `radar/${d.slug}`),
    date: d.publishDate,
    month: monthOf(d.publishDate),
    title: d.title,
    dek: shortDek(d.summary),
    kind: d.kind,
    minutes: readingTime(entry.body),
    sources: d.sources.length,
    tags: d.tags,
  };
}

export function journalRow(entry: JournalEntryLike, lang: Locale): Row {
  const d = entry.data;
  return {
    section: 'journal',
    href: localePath(lang, `journal/${d.slug}`),
    date: d.publishDate,
    month: monthOf(d.publishDate),
    title: d.title,
    dek: shortDek(d.summary),
    kind: '',
    minutes: readingTime(entry.body),
    sources: 0,
    tags: [],
  };
}

export function articleRows(entries: ArticleEntryLike[], lang: Locale): Row[] {
  return getPublishedArticles(entries, lang).map((e) => articleRow(e, lang));
}

export function radarRows(entries: RadarEntryLike[], lang: Locale): Row[] {
  return getPublishedRadar(entries, lang).map((e) => radarRow(e, lang));
}

export function journalRows(entries: JournalEntryLike[], lang: Locale): Row[] {
  return getPublishedJournal(entries, lang).map((e) => journalRow(e, lang));
}

/** Rows of several sections merged, newest first. */
export function mergeRows(...lists: Row[][]): Row[] {
  return lists
    .flat()
    .sort((a, b) => parsePublishDate(b.date) - parsePublishDate(a.date));
}

/** A concept as the library and Glose use it. */
export interface Word {
  id: string;
  label: string;
  def: string;
  theme: string;
  related: string[];
  aliases: string[];
  /** Texts that cite the concept: title and address. */
  cited: { title: string; href: string }[];
}

const WORD_CITED_MAX = 3;

export function words(
  concepts: Concept[],
  articles: ArticleEntryLike[],
  radar: RadarEntryLike[],
  lang: Locale
): Word[] {
  const byKey = new Map<string, { title: string; href: string }>();
  for (const e of getPublishedArticles(articles, lang))
    byKey.set(e.data.translationKey, {
      title: e.data.title,
      href: localePath(lang, `blog/${e.data.slug}`),
    });
  for (const e of getPublishedRadar(radar, lang))
    byKey.set(e.data.translationKey, {
      title: e.data.title,
      href: localePath(lang, `radar/${e.data.slug}`),
    });
  return concepts.map((c) => ({
    id: c.id,
    label: c.label[lang],
    def: c.definition[lang],
    theme: c.theme,
    related: c.related ?? [],
    aliases: c.aliases ?? [],
    cited: c.articles
      .map((k) => byKey.get(k))
      .filter((x): x is { title: string; href: string } => x !== undefined)
      .slice(0, WORD_CITED_MAX),
  }));
}

/** Paragraphs of a Markdown body as plain text, for the sheets of the 3D office. */
export function plainParagraphs(body: string | undefined, max = 6): string[] {
  if (!body) return [];
  return body
    .replace(/```[\s\S]*?```/g, '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !/^(#|>|\||-{3}|\*{3}|!\[|<)/.test(p))
    .map((p) =>
      p
        .replace(/\s*\[s\d+\]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
    )
    .slice(0, max);
}

interface WorldText {
  title: string;
  date: string;
  url: string;
  text: string[];
}

export interface WorldData {
  radar: WorldText[];
  articles: WorldText[];
  journal: WorldText | null;
  projects: {
    key: string;
    name: string;
    year: string;
    summary: string;
    highlights: string[];
  }[];
  words: [label: string, def: string][];
}

/** How many frames each gallery of the 3D office holds. */
const WORLD_FRAMES = 12;
const WORLD_HIGHLIGHTS = 4;

export function worldData(
  lang: Locale,
  src: {
    articles: ArticleEntryLike[];
    radar: RadarEntryLike[];
    journal: JournalEntryLike[];
    projects: ProjectEntryLike[];
    concepts: Concept[];
  }
): WorldData {
  const text = (
    e: { body?: string; data: { title: string; publishDate: string } },
    url: string,
    lead?: string
  ): WorldText => ({
    title: e.data.title,
    date: e.data.publishDate,
    url,
    text: [...(lead ? [shortDek(lead, 400)] : []), ...plainParagraphs(e.body)],
  });
  const journal = getPublishedJournal(src.journal, lang)[0];
  return {
    radar: getPublishedRadar(src.radar, lang)
      .slice(0, WORLD_FRAMES)
      .map((e) =>
        text(e, localePath(lang, `radar/${e.data.slug}`), e.data.summary)
      ),
    articles: getPublishedArticles(src.articles, lang)
      .slice(0, WORLD_FRAMES)
      .map((e) => text(e, localePath(lang, `blog/${e.data.slug}`))),
    journal: journal
      ? text(
          journal,
          localePath(lang, `journal/${journal.data.slug}`),
          journal.data.summary
        )
      : null,
    projects: getPublishedProjects(src.projects, lang).map((p) => ({
      key: p.data.translationKey,
      name: p.data.name.split(':')[0].trim(),
      year: p.data.year ?? '',
      summary: p.data.summary,
      highlights: (p.data.highlights ?? []).slice(0, WORLD_HIGHLIGHTS),
    })),
    words: src.concepts.map((c) => [c.label[lang], c.definition[lang]]),
  };
}
