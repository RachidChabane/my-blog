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

/**
 * Portfolio index (S6) copy. Dedicated table — sibling to ARTICLE_INDEX, kept out
 * of ChromeStrings per this file's header. Copy lifted verbatim from the design `T`
 * (projects.jsx). `ordinalWord` is rendered uppercased via CSS ("PROJET · 01") and
 * `viewCta` as a decorative "<viewCta> →". The em-dash `—` in `meta` and the `·`/`→`
 * are typographic punctuation, not emoji (INV-9 safe).
 */
export interface PortfolioIndexStrings {
  eyebrow: string; // "Travaux" / "Work"
  title: string; // "Projets" / "Projects" (the <h1>)
  meta: string; // "Sélection — code et systèmes" / "Selection — code and systems"
  ordinalWord: string; // "Projet" / "Project" (rendered uppercased via CSS → "PROJET · 01")
  viewCta: string; // "Voir" / "View" (rendered "<viewCta> →", decorative)
  empty: string; // empty-state line
}

export const PORTFOLIO_INDEX: Record<Locale, PortfolioIndexStrings> = {
  fr: {
    eyebrow: 'Travaux',
    title: 'Projets',
    meta: 'Sélection — code et systèmes',
    ordinalWord: 'Projet',
    viewCta: 'Voir',
    empty: 'Aucun projet pour le moment.',
  },
  en: {
    eyebrow: 'Work',
    title: 'Projects',
    meta: 'Selection — code and systems',
    ordinalWord: 'Project',
    viewCta: 'View',
    empty: 'No projects yet.',
  },
};

export function portfolioIndexStrings(lang: Locale): PortfolioIndexStrings {
  return PORTFOLIO_INDEX[lang];
}

/**
 * Tag surfaces (S4 directory + S5 tag index) copy. One combined table — S4 and S5
 * are a single feature and share the count templates. The chip-rail/CTA/empty copy
 * S5 needs is REUSED from ARTICLE_INDEX (allTag, filterAria, readCta, empty), not
 * re-translated here. Count templates carry a `{n}` placeholder composed via
 * formatCount() in the page (a function here would break the Object.entries string
 * guard in ui.test.ts). `·`/`←`/`→` are typographic punctuation, not emoji (INV-9).
 */
export interface TagStrings {
  dirEyebrow: string; // S4 mono kicker — "Index"
  dirTitle: string; // S4 <h1> — "Sujets" / "Topics"
  dirMeta: string; // S4 subtitle — "Parcourir les articles par sujet" / "Browse articles by topic"
  dirEmpty: string; // S4 empty-state — "Aucun sujet pour le moment." / "No topics yet."
  idxEyebrow: string; // S5 mono kicker above the tag-name <h1> — "Sujet" / "Topic"
  allTopics: string; // S5 back-link to S4 — "Tous les sujets" / "All topics"
  countOne: string; // singular count template — "{n} écrit" / "{n} post"
  countMany: string; // plural count template — "{n} écrits" / "{n} posts"
}

export const TAGS: Record<Locale, TagStrings> = {
  fr: {
    dirEyebrow: 'Index',
    dirTitle: 'Sujets',
    dirMeta: 'Parcourir les articles par sujet',
    dirEmpty: 'Aucun sujet pour le moment.',
    idxEyebrow: 'Sujet',
    allTopics: 'Tous les sujets',
    countOne: '{n} écrit',
    countMany: '{n} écrits',
  },
  en: {
    dirEyebrow: 'Index',
    dirTitle: 'Topics',
    dirMeta: 'Browse articles by topic',
    dirEmpty: 'No topics yet.',
    idxEyebrow: 'Topic',
    allTopics: 'All topics',
    countOne: '{n} post',
    countMany: '{n} posts',
  },
};

export function tagStrings(lang: Locale): TagStrings {
  return TAGS[lang];
}

/**
 * S11 — 404 Not Found page copy. Localized headline, body, and back-to-home CTA.
 * Search affordance from the S11 spec is deferred until S9 (task TBD) — slot noted
 * in the 404 page as a TODO comment so the intent is not lost.
 */
export interface NotFoundStrings {
  title: string;
  eyebrow: string;
  body: string;
  ctaHome: string;
  ctaBlog: string;
  ctaSearch: string;
}

export const NOT_FOUND: Record<Locale, NotFoundStrings> = {
  fr: {
    title: 'Page introuvable',
    eyebrow: '404',
    body: 'La page que vous cherchez n’existe pas ou a été déplacée.',
    ctaHome: 'Retour à l’accueil',
    ctaBlog: 'Tous les articles',
    ctaSearch: 'Rechercher',
  },
  en: {
    title: 'Page not found',
    eyebrow: '404',
    body: 'The page you’re looking for doesn’t exist or has been moved.',
    ctaHome: 'Back to home',
    ctaBlog: 'All articles',
    ctaSearch: 'Search',
  },
};

export function notFoundStrings(lang: Locale): NotFoundStrings {
  return NOT_FOUND[lang];
}

/**
 * About (S8) copy. Sibling table to ARTICLE_DETAIL / NOT_FOUND. Bio + tagline are
 * owner-fill PLACEHOLDERS (the build never fabricates first-person facts); the
 * how-it-works note is REAL — it describes the autonomous pipeline (a P2
 * credibility asset), carries no personal data/secrets, and is lifted verbatim
 * from the design `T` (about.jsx). `howLbl` intentionally matches
 * ARTICLE_DETAIL.maintained.
 */
export interface AboutStrings {
  metaDesc: string; // <meta name="description"> (site-level, safe)
  eyebrow: string; // mono eyebrow
  title: string; // h1
  tagline: string; // owner-fill placeholder (bracketed)
  bioH: string; // "Bio"
  bioLabel: string; // owner-fill label
  bioText: string; // owner-fill placeholder (bracketed)
  contactH: string; // "Contact"
  contactPh: string; // owner-fill hint shown as the value of placeholder rows
  howH: string; // "Comment ce site fonctionne" / "How this site works"
  howLbl: string; // "maintenu par l’agent" / "agent-maintained"
  howText: string; // REAL credibility paragraph (verbatim from about.jsx)
}

export const ABOUT: Record<Locale, AboutStrings> = {
  fr: {
    metaDesc:
      'À propos de Rachid Chabane et de ce carnet d’ingénierie IA maintenu de façon autonome.',
    eyebrow: 'À propos',
    title: 'À propos',
    tagline:
      '[une ligne — qui vous êtes, en bref : rôle, terrain, ce qui vous tient à cœur]',
    bioH: 'Bio',
    bioLabel: 'à compléter — première personne',
    bioText:
      '[bio courte, première personne — parcours, ce que vous construisez, et le fil qui relie vos projets et vos écrits. Deux ou trois phrases suffisent.]',
    contactH: 'Contact',
    contactPh: 'à compléter',
    howH: 'Comment ce site fonctionne',
    howLbl: 'maintenu par l’agent',
    howText:
      'Ce carnet n’a pas de rédacteur humain au quotidien. Un agent explore la littérature et les dépôts, rédige chaque note en français et en anglais, vérifie ses affirmations contre des sources citées, puis publie — sans intervention humaine dans la boucle. Les erreurs restent possibles ; chaque page expose ses sources pour qu’on puisse la contredire.',
  },
  en: {
    metaDesc:
      'About Rachid Chabane and this autonomously maintained AI engineering notebook.',
    eyebrow: 'About',
    title: 'About',
    tagline:
      '[one line — who you are, in brief: role, field, what you care about]',
    bioH: 'Bio',
    bioLabel: 'owner-filled — first person',
    bioText:
      '[short bio, first person — background, what you build, and the thread that ties your projects to your writing. Two or three sentences are enough.]',
    contactH: 'Contact',
    contactPh: 'owner-filled',
    howH: 'How this site works',
    howLbl: 'agent-maintained',
    howText:
      'This notebook has no day-to-day human editor. An agent surveys the literature and repositories, drafts each note in French and English, checks its claims against cited sources, then publishes — with no human in the loop. Errors remain possible; every page exposes its sources so it can be challenged.',
  },
};

export function aboutStrings(lang: Locale): AboutStrings {
  return ABOUT[lang];
}

/**
 * Contact destinations (S8). Locale-neutral: hrefs and proper-noun labels are the
 * same in FR/EN. ONLY verifiably-public links are committed live (GitHub = the repo
 * remote). Email + LinkedIn are owner-fill (href: null) — publishing a personal
 * address/handle is a privacy-gated owner decision (CLAUDE.md #3 / FR-D3 / NFR-6),
 * not a build default. Fill them by adding `value` + `href` here (one line); the page
 * promotes any entry with a non-null href to a live <a>. No backend form (W-2).
 */
export type ContactIconName = 'mail' | 'github' | 'linkedin';

export interface ContactLink {
  icon: ContactIconName;
  label: string;
  value: string; // displayed (e.g. the handle)
  href: string; // 'https://…' or 'mailto:…'
}
export interface ContactPlaceholder {
  icon: ContactIconName;
  label: string;
  href: null;
}
export type Contact = ContactLink | ContactPlaceholder;

export const CONTACTS: Contact[] = [
  { icon: 'mail', label: 'Email', href: null },
  {
    icon: 'github',
    label: 'GitHub',
    value: 'RachidChabane',
    href: 'https://github.com/RachidChabane',
  },
  { icon: 'linkedin', label: 'LinkedIn', href: null },
];

/**
 * Search (S9) copy. Dedicated table — sibling to ARTICLE_INDEX, kept out of
 * ChromeStrings per this file's header. The page returns ARTICLES (not avatar
 * answers); copy is authored here in the S2 tone (no design mockup for S9).
 * `countOne/countMany` carry the `{n}` placeholder substituted in the Search
 * island's a11y live region (mirrors TAGS + formatCount). Typographic `…`
 * (U+2026) / `’` (U+2019) need no escaping (INV-9 safe).
 */
export interface SearchStrings {
  eyebrow: string; // mono kicker — "Index"
  title: string; // <h1> — "Recherche" / "Search"
  inputLabel: string; // input aria-label
  placeholder: string; // input placeholder
  idleHint: string; // quiet line when the query is empty (the "empty-query state")
  empty: string; // quiet no-match line — "Aucun résultat" / "No results"
  countOne: string; // a11y live-region singular — "{n} résultat" / "{n} result"
  countMany: string; // a11y live-region plural — "{n} résultats" / "{n} results"
}

export const SEARCH: Record<Locale, SearchStrings> = {
  fr: {
    eyebrow: 'Index',
    title: 'Recherche',
    inputLabel: 'Rechercher des articles',
    placeholder: 'Rechercher un article…',
    idleHint: 'Saisissez un mot-clé pour trouver un article.',
    empty: 'Aucun résultat',
    countOne: '{n} résultat',
    countMany: '{n} résultats',
  },
  en: {
    eyebrow: 'Index',
    title: 'Search',
    inputLabel: 'Search articles',
    placeholder: 'Search articles…',
    idleHint: 'Type a keyword to find an article.',
    empty: 'No results',
    countOne: '{n} result',
    countMany: '{n} results',
  },
};

export function searchStrings(lang: Locale): SearchStrings {
  return SEARCH[lang];
}
