/**
 * src/i18n/ui.ts — Chrome string table (sibling to the pinned i18n/index.ts,
 * which stays locale-logic-only). Holds the bilingual UI-chrome dictionary the
 * navigation shell consumes. Later screen tasks EXTEND `ChromeStrings` here;
 * keep `index.ts` free of copy. Typographic apostrophes (U+2019) are used in the
 * French literals so the single-quoted strings need no escaping (Prettier-stable).
 */
import type { Locale } from '@/i18n/index';

export interface ChromeStrings {
  skipToContent: string; // a11y skip link
  homeAria: string; // wordmark aria-label
  navAria: string; // primary <nav> aria-label
  navArticles: string; // → /[lang]/blog/
  navWork: string; // → /[lang]/work/
  navAbout: string; // → /[lang]/about/
  searchLabel: string; // search button visible text + aria-label
  langGroupAria: string; // switcher group aria-label
  switchToFr: string; // FR link aria-label
  switchToEn: string; // EN link aria-label
  themeToggleAria: string; // theme button aria-label (EN MUST contain "theme")
  footerCredit: string; // the quiet autonomous-maintenance line
  footerRss: string; // visible "RSS"
  footerRssAria: string; // RSS link aria-label
  footerRights: string; // copyright tail
  avatarAria: string; // launcher label — consumed by task 20
}

export const CHROME: Record<Locale, ChromeStrings> = {
  fr: {
    skipToContent: 'Aller au contenu',
    homeAria: 'rachid chabane — accueil',
    navAria: 'Navigation principale',
    navArticles: 'Articles',
    navWork: 'Projets',
    navAbout: 'À propos',
    searchLabel: 'Rechercher',
    langGroupAria: 'Langue',
    switchToFr: 'Afficher en français',
    switchToEn: 'Afficher en anglais',
    themeToggleAria: 'Basculer entre thème clair et sombre',
    footerCredit: 'écrit et maintenu de façon autonome',
    footerRss: 'RSS',
    footerRssAria: 'Flux RSS',
    footerRights: 'Tous droits réservés.',
    avatarAria: 'Demander à l’agent',
  },
  en: {
    skipToContent: 'Skip to content',
    homeAria: 'rachid chabane — home',
    navAria: 'Main navigation',
    navArticles: 'Articles',
    navWork: 'Projects',
    navAbout: 'About',
    searchLabel: 'Search',
    langGroupAria: 'Language',
    switchToFr: 'View in French',
    switchToEn: 'View in English',
    themeToggleAria: 'Toggle light and dark theme',
    footerCredit: 'written and maintained autonomously',
    footerRss: 'RSS',
    footerRssAria: 'RSS feed',
    footerRights: 'All rights reserved.',
    avatarAria: 'Ask the agent',
  },
};

export function chrome(lang: Locale): ChromeStrings {
  return CHROME[lang];
}

/**
 * Localized label key → SHARED route slug. Path-prefix i18n keeps the slug
 * locale-neutral (only the `/fr/ /en/` prefix changes); the visible label is
 * localized via the key. Consumed by Masthead's primary nav.
 */
export const NAV_ITEMS = [
  { key: 'navArticles', path: 'blog' },
  { key: 'navWork', path: 'work' },
  { key: 'navAbout', path: 'about' },
] as const;

/**
 * Article index (S2) copy. Dedicated table — kept out of ChromeStrings (nav/footer
 * chrome) per this file's header. Strings lifted verbatim from the design `T`
 * (articles.jsx). The count line is composed in the page: `${total} ${countSuffix}`.
 * `·` and `→` are typographic punctuation, not emoji (INV-9 safe).
 */
export interface ArticleIndexStrings {
  eyebrow: string; // "Carnet" / "Notebook"
  title: string; // "Articles"
  countSuffix: string; // follows the count: "écrits · du plus récent"
  allTag: string; // "Tous" / "All"
  filterAria: string; // chip-rail group aria-label
  readCta: string; // "Lire" / "Read" (rendered "<readCta> →")
  prev: string; // pager previous
  next: string; // pager next
  pagerAria: string; // pager nav aria-label
  empty: string; // empty-state line
}

export const ARTICLE_INDEX: Record<Locale, ArticleIndexStrings> = {
  fr: {
    eyebrow: 'Carnet',
    title: 'Articles',
    countSuffix: 'écrits · du plus récent',
    allTag: 'Tous',
    filterAria: 'Filtrer par tag',
    readCta: 'Lire',
    prev: 'Précédent',
    next: 'Suivant',
    pagerAria: 'Pagination',
    empty: 'Aucun article pour le moment.',
  },
  en: {
    eyebrow: 'Notebook',
    title: 'Articles',
    countSuffix: 'posts · newest first',
    allTag: 'All',
    filterAria: 'Filter by tag',
    readCta: 'Read',
    prev: 'Previous',
    next: 'Next',
    pagerAria: 'Pagination',
    empty: 'No articles yet.',
  },
};

export function articleIndexStrings(lang: Locale): ArticleIndexStrings {
  return ARTICLE_INDEX[lang];
}

/**
 * Article detail (S3) copy. Dedicated table — sibling to ARTICLE_INDEX, kept out
 * of ChromeStrings per this file's header. Copy lifted from the design `T`
 * (article.jsx): back-link, the `agent-maintained` eyebrow tail, the Sources
 * heading, prev/next direction labels, and the `FR / EN` bilingual meta note.
 * `·` is typographic punctuation, not emoji (INV-9 safe).
 */
export interface ArticleDetailStrings {
  back: string; // index back-link text ("All articles" / "Tous les articles")
  maintained: string; // eyebrow tail ("agent-maintained" / "maintenu par l’agent")
  sourcesH: string; // "Sources"
  prevDir: string; // "Previous" / "Précédent"
  nextDir: string; // "Next" / "Suivant"
  prevNextAria: string; // related-nav aria-label
  bilingualNote: string; // meta tail "FR / EN"
}

export const ARTICLE_DETAIL: Record<Locale, ArticleDetailStrings> = {
  fr: {
    back: 'Tous les articles',
    maintained: 'maintenu par l’agent',
    sourcesH: 'Sources',
    prevDir: 'Précédent',
    nextDir: 'Suivant',
    prevNextAria: 'Articles liés',
    bilingualNote: 'FR / EN',
  },
  en: {
    back: 'All articles',
    maintained: 'agent-maintained',
    sourcesH: 'Sources',
    prevDir: 'Previous',
    nextDir: 'Next',
    prevNextAria: 'Related articles',
    bilingualNote: 'FR / EN',
  },
};

export function articleDetailStrings(lang: Locale): ArticleDetailStrings {
  return ARTICLE_DETAIL[lang];
}
