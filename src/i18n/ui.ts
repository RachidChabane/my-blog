/**
 * src/i18n/ui.ts — Chrome string table (sibling to the pinned i18n/index.ts,
 * which stays locale-logic-only). Holds the bilingual UI-chrome dictionary the
 * navigation shell consumes. Later screen tasks EXTEND `ChromeStrings` here;
 * keep `index.ts` free of copy. Typographic apostrophes (U+2019) are used in the
 * French literals so the single-quoted strings need no escaping (Prettier-stable).
 */
import type { Locale } from '@/i18n/index';
import type { RadarKind } from '@/content/schemas';

export interface ChromeStrings {
  skipToContent: string; // a11y skip link
  homeAria: string; // wordmark aria-label
  navAria: string; // primary <nav> aria-label
  navArticles: string; // → /[lang]/blog/
  navRadar: string; // → /[lang]/radar/
  navWork: string; // → /[lang]/work/
  navGraph: string; // → /[lang]/graph/ (the knowledge map)
  navAbout: string; // → /[lang]/about/
  menuToggleAria: string; // hamburger button aria-label (mobile nav disclosure)
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
    homeAria: 'rachid chabane, accueil',
    navAria: 'Navigation principale',
    navArticles: 'Articles',
    navRadar: 'Radar',
    navWork: 'Projets',
    navGraph: 'Graphe',
    navAbout: 'À propos',
    menuToggleAria: 'Ouvrir le menu',
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
    homeAria: 'rachid chabane, home',
    navAria: 'Main navigation',
    navArticles: 'Articles',
    navRadar: 'Radar',
    navWork: 'Projects',
    navGraph: 'Graph',
    navAbout: 'About',
    menuToggleAria: 'Open menu',
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
  { key: 'navRadar', path: 'radar' },
  { key: 'navWork', path: 'work' },
  { key: 'navGraph', path: 'graph' },
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
  askPrompt: string; // quiet lead-in above the "ask the agent" entry button
  askLabel: string; // entry-button text + aria-label (opens the avatar panel)
  // Seed question template; "{title}" is filled with the ARTICLE TITLE in the page.
  // Keyed on the title, NOT on a tag: tags are broad taxonomy buckets ("quality",
  // "agents") that are often only loosely related to an article's thesis, so a
  // tag-seeded question could score below the avatar's similarity gate and get an
  // honest "I don't know" on the very article it was asked about. The title carries
  // the thesis, so it lands squarely in the article's own chunks. Keep the title
  // verbatim and the wrapper short — the wrapper only dilutes the match. See
  // DEPLOY.md (scoped gate) and `pnpm probe:avatar`, which measures exactly this.
  askSeed: string;
  askFeatureLabel: string; // prominent TOP entry-button text + aria-label ("Ask the agent")
  askFeaturePrompt: string; // inviting one-liner under the featured top entry
  copyLink: string; // aria-label for the per-heading copy-permalink button
  copyCode: string; // aria-label/text for the copy-code-block button
  copied: string; // transient "copied" confirmation (both link + code)
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
    askPrompt: 'Envie d’aller plus loin ?',
    askLabel: 'Interroger l’agent sur cet article',
    askSeed: '« {title} » : que montre cet article ?',
    askFeatureLabel: 'Demander à l’agent',
    askFeaturePrompt:
      'Une question sur cet article ? Obtenez une réponse sourcée, tout de suite.',
    copyLink: 'Copier le lien vers cette section',
    copyCode: 'Copier le code',
    copied: 'Copié',
  },
  en: {
    back: 'All articles',
    maintained: 'agent-maintained',
    sourcesH: 'Sources',
    prevDir: 'Previous',
    nextDir: 'Next',
    prevNextAria: 'Related articles',
    bilingualNote: 'FR / EN',
    askPrompt: 'Want to go deeper?',
    askLabel: 'Ask the agent about this article',
    askSeed: '“{title}”: what does this article show?',
    askFeatureLabel: 'Ask the agent',
    askFeaturePrompt:
      'A question about this article? Get a sourced answer, instantly.',
    copyLink: 'Copy link to this section',
    copyCode: 'Copy code',
    copied: 'Copied',
  },
};

export function articleDetailStrings(lang: Locale): ArticleDetailStrings {
  return ARTICLE_DETAIL[lang];
}

/**
 * Difficulty rating copy. One tiny dedicated table (not a ChromeStrings field):
 * the stars render on BOTH the card (ArticleListItem) and the article page, so
 * the aria template lives once here and both surfaces consume it. `{n}` is the
 * 1-5 level, substituted in the template (mirrors TAGS/SEARCH `{n}` counts —
 * tables hold strings only, per the ui.test.ts Object.entries guard). The star
 * glyphs themselves come from difficultyStars() in src/lib/content.ts; the
 * SCALE is pinned by pipeline/difficulty_rubric.md.
 */
export interface DifficultyStrings {
  aria: string; // role="img" label — "Difficulté : {n} sur 5" / "Difficulty: {n} out of 5"
}

export const DIFFICULTY: Record<Locale, DifficultyStrings> = {
  fr: { aria: 'Difficulté : {n} sur 5' },
  en: { aria: 'Difficulty: {n} out of 5' },
};

export function difficultyStrings(lang: Locale): DifficultyStrings {
  return DIFFICULTY[lang];
}

/**
 * Project detail (S7) copy. Dedicated, self-contained table — sibling to
 * ARTICLE_DETAIL, kept out of ChromeStrings per this file's header. Copy lifted
 * verbatim from the design `T` (project-detail.jsx): back-link, the eyebrow word
 * ("Projet"/"Project", CSS-uppercased), the `agent-maintained` tail, the `FR / EN`
 * bilingual note, and the six section headings (`h.{what,eng,stack,status,links,
 * related}`). French apostrophes use U+2019 `’` (file convention; Prettier-stable,
 * INV-9 safe). `maintained` intentionally matches ARTICLE_DETAIL.maintained.
 */
export interface ProjectDetailStrings {
  back: string; // "Tous les projets" / "All projects"
  ordinalWord: string; // "Projet" / "Project" (eyebrow; CSS uppercases it)
  maintained: string; // "maintenu par l’agent" / "agent-maintained"
  bilingualNote: string; // "FR / EN"
  hWhat: string; // "Ce que c’est" / "What it is"
  hEng: string; // "Ingénierie" / "Engineering"
  hArch: string; // "Architecture" (optional section)
  hHighlights: string; // "Points clés" / "Highlights" (optional section)
  hGallery: string; // "Aperçus" / "Screens" (optional screenshot carousel — a11y name)
  galleryPrev: string; // prev-slide button aria-label
  galleryNext: string; // next-slide button aria-label
  gallerySlide: string; // dot/open button aria-label prefix ("Screen 1" / "Aperçu 1")
  galleryClose: string; // lightbox close button aria-label
  hStack: string; // "Stack" / "Stack"
  hStatus: string; // "Statut" / "Status"
  hLinks: string; // "Liens" / "Links"
  hRelated: string; // "Articles liés" / "Related articles"
}

export const PROJECT_DETAIL: Record<Locale, ProjectDetailStrings> = {
  fr: {
    back: 'Tous les projets',
    ordinalWord: 'Projet',
    maintained: 'maintenu par l’agent',
    bilingualNote: 'FR / EN',
    hWhat: 'Ce que c’est',
    hEng: 'Ingénierie',
    hArch: 'Architecture',
    hHighlights: 'Points clés',
    hGallery: 'Aperçus',
    galleryPrev: 'Aperçu précédent',
    galleryNext: 'Aperçu suivant',
    gallerySlide: 'Aperçu',
    galleryClose: 'Fermer',
    hStack: 'Stack',
    hStatus: 'Statut',
    hLinks: 'Liens',
    hRelated: 'Articles liés',
  },
  en: {
    back: 'All projects',
    ordinalWord: 'Project',
    maintained: 'agent-maintained',
    bilingualNote: 'FR / EN',
    hWhat: 'What it is',
    hEng: 'Engineering',
    hArch: 'Architecture',
    hHighlights: 'Highlights',
    hGallery: 'Screens',
    galleryPrev: 'Previous screen',
    galleryNext: 'Next screen',
    gallerySlide: 'Screen',
    galleryClose: 'Close',
    hStack: 'Stack',
    hStatus: 'Status',
    hLinks: 'Links',
    hRelated: 'Related articles',
  },
};

export function projectDetailStrings(lang: Locale): ProjectDetailStrings {
  return PROJECT_DETAIL[lang];
}

/**
 * Portfolio index (S6) copy. Dedicated table — sibling to ARTICLE_INDEX, kept out
 * of ChromeStrings per this file's header. Copy lifted verbatim from the design `T`
 * (projects.jsx). `ordinalWord` is rendered uppercased via CSS ("PROJET · 01") and
 * `viewCta` as a decorative "<viewCta> →". The `·`/`→` and the `meta` separator
 * are typographic punctuation, not emoji (INV-9 safe).
 */
export interface PortfolioIndexStrings {
  eyebrow: string; // "Travaux" / "Work"
  title: string; // "Projets" / "Projects" (the <h1>)
  meta: string; // "Sélection · code et systèmes" / "Selection · code and systems"
  ordinalWord: string; // "Projet" / "Project" (rendered uppercased via CSS → "PROJET · 01")
  viewCta: string; // "Voir" / "View" (rendered "<viewCta> →", decorative)
  empty: string; // empty-state line
  statLive: string; // stat-line label — "En production" / "In production"
}

export const PORTFOLIO_INDEX: Record<Locale, PortfolioIndexStrings> = {
  fr: {
    eyebrow: 'Travaux',
    title: 'Projets',
    meta: 'Sélection · code et systèmes',
    ordinalWord: 'Projet',
    viewCta: 'Voir',
    empty: 'Aucun projet pour le moment.',
    statLive: 'En production',
  },
  en: {
    eyebrow: 'Work',
    title: 'Projects',
    meta: 'Selection · code and systems',
    ordinalWord: 'Project',
    viewCta: 'View',
    empty: 'No projects yet.',
    statLive: 'In production',
  },
};

export function portfolioIndexStrings(lang: Locale): PortfolioIndexStrings {
  return PORTFOLIO_INDEX[lang];
}

/**
 * Home / hub (S1) copy. Dedicated table — sibling to the other *_INDEX tables,
 * kept out of ChromeStrings per this file's header. Hero + block copy lifted
 * verbatim from the design `T` (home.jsx). `metaTitle` leads with the brand so
 * the existing `toHaveTitle(/Rachid Chabane/)` e2e assertions stay green after
 * the home stubs are removed. NO arrows in the strings — the template appends
 * ` →` (mirrors ArticleListItem). The `·` separator is typographic, FR apostrophes
 * use U+2019 `’` (file convention; Prettier-stable, INV-9 safe). `projectsTitle`
 * intentionally equals `PORTFOLIO_INDEX.title` (no cross-table uniqueness rule).
 */
export interface HomeStrings {
  metaTitle: string; // <title> — leads with the brand (keeps /Rachid Chabane/ green)
  heroEyebrow: string; // role/location kicker (owner-tunable)
  heroLine: string; // the one-line statement (rendered as the page <h1>)
  heroSub: string; // supporting paragraph (also reused as <meta description>)
  heroCta: string; // primary CTA label → /[lang]/blog/
  heroCtaAlt: string; // secondary (ghost) CTA label → /[lang]/work/
  systemLabel: string; // autonomous-status panel header — "Autonome" / "Autonomous"
  statWritings: string; // stat-panel label — "Écrits" / "Writings"
  statLanguages: string; // stat-panel label — "Langues" / "Languages"
  updatedLabel: string; // stat-panel label — "Mis à jour" / "Updated"
  latestTitle: string; // "Derniers articles" / "Latest articles"
  latestAll: string; // "Tout voir" / "See all" → /[lang]/blog/
  projectsTitle: string; // "Projets" / "Projects"
  projectsAll: string; // "Voir le portfolio" / "View the portfolio" → /[lang]/work/
}

export const HOME: Record<Locale, HomeStrings> = {
  fr: {
    metaTitle: 'Rachid Chabane · Ingénieur IA',
    heroEyebrow: 'Ingénieur IA · Lille',
    heroLine:
      'J’écris sur l’ingénierie de l’IA de pointe, et c’est un agent autonome qui rédige ce site.',
    heroSub:
      'Évaluations, agents outillés, garde-fous. Un carnet tenu et publié par un agent, sous revue humaine.',
    heroCta: 'Lire les écrits',
    heroCtaAlt: 'Le portfolio',
    systemLabel: 'Autonome',
    statWritings: 'Écrits',
    statLanguages: 'Langues',
    updatedLabel: 'Mis à jour',
    latestTitle: 'Derniers articles',
    latestAll: 'Tout voir',
    projectsTitle: 'Projets',
    projectsAll: 'Voir le portfolio',
  },
  en: {
    metaTitle: 'Rachid Chabane · AI engineer',
    heroEyebrow: 'AI engineer · Lille',
    heroLine:
      'I write about cutting-edge AI engineering, and this very site is written by an autonomous AI agent.',
    heroSub:
      'Evaluations, tool-using agents, guardrails. A notebook kept and published by an agent, under human review.',
    heroCta: 'Read the writing',
    heroCtaAlt: 'The portfolio',
    systemLabel: 'Autonomous',
    statWritings: 'Writings',
    statLanguages: 'Languages',
    updatedLabel: 'Updated',
    latestTitle: 'Latest articles',
    latestAll: 'See all',
    projectsTitle: 'Projects',
    projectsAll: 'View the portfolio',
  },
};

export function homeStrings(lang: Locale): HomeStrings {
  return HOME[lang];
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
 * S11 — 404 Not Found page copy. Localized headline, body, and the three CTAs
 * the page offers a lost reader: home, the blog index, and search (`ctaSearch`,
 * the S11 search affordance — shipped, pointing at the localized search page).
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
 * About (S8) copy. Sibling table to ARTICLE_DETAIL / NOT_FOUND. The tagline + bio
 * are REAL first-person copy, grounded in the owner's public résumé (no fabricated
 * facts); the how-it-works note is REAL too, describing the autonomous pipeline (a
 * P2 credibility asset, no secrets), lifted verbatim from the design `T`
 * (about.jsx). `howLbl` intentionally matches ARTICLE_DETAIL.maintained. The bio
 * deliberately does NOT re-narrate the pipeline mechanics; that is the
 * how-it-works box's job, the section right below it.
 */
export interface AboutStrings {
  metaDesc: string; // <meta name="description"> (site-level, safe)
  eyebrow: string; // mono eyebrow
  title: string; // h1
  tagline: string; // one-line role/field strap under the h1
  bioH: string; // "Bio"
  bioP1: string; // bio paragraph 1 (identity + day work + the applied-AI thread)
  bioP2: string; // bio paragraph 2 (open source + research + this site; the thread)
  contactH: string; // "Contact"
  contactPh: string; // hint shown as the value of any future owner-fill row
  howH: string; // "Comment ce site fonctionne" / "How this site works"
  howLbl: string; // "maintenu par l’agent" / "agent-maintained"
  howText: string; // REAL credibility paragraph (verbatim from about.jsx)
}

export const ABOUT: Record<Locale, AboutStrings> = {
  fr: {
    metaDesc:
      'À propos de Rachid Chabane et de ce carnet d’ingénierie IA maintenu de façon autonome.',
    eyebrow: 'Rachid Chabane',
    title: 'À propos',
    tagline:
      'Ingénieur logiciel à l’intersection du cloud et de l’IA appliquée, du besoin métier à la production. Basé à Lille.',
    bioH: 'Bio',
    bioP1:
      'Je suis Rachid Chabane, ingénieur full-stack et cloud basé à Lille. Le jour, je livre des services Java et Spring Boot sur Google Cloud, de bout en bout : du recueil du besoin métier à l’infrastructure, la CI/CD et l’astreinte en production. En parallèle, je conçois des systèmes d’IA agentique sur la stack Claude : orchestration multi-agents, outils MCP, récupération d’information et le context engineering qui garde un agent fiable sur la durée.',
    bioP2:
      'Ce versant de mon travail est publié en open source, dont un serveur MCP et une marketplace de plugins pour Claude Code, et prend aussi la forme de plateformes privées, parmi lesquelles un moteur de recherche autonome à l’origine de deux preprints avec DOI. Ce carnet est l’un de ces systèmes, écrit et maintenu par un agent plutôt que par moi. Le fil reste le même partout : bâtir des systèmes autonomes, et les rendre assez fiables pour les laisser tourner seuls.',
    contactH: 'Contact',
    contactPh: 'à compléter',
    howH: 'Comment ce site fonctionne',
    howLbl: 'maintenu par l’agent',
    howText:
      'Ce carnet n’a pas de rédacteur humain au quotidien. Un agent explore la littérature et les dépôts, rédige chaque note en français et en anglais, vérifie ses affirmations contre des sources citées, puis publie, sans intervention humaine dans la boucle. Les erreurs restent possibles ; chaque page expose ses sources pour qu’on puisse la contredire.',
  },
  en: {
    metaDesc:
      'About Rachid Chabane and this autonomously maintained AI engineering notebook.',
    eyebrow: 'Rachid Chabane',
    title: 'About',
    tagline:
      'Software engineer working where cloud meets applied AI, from business requirements to production. Based in Lille, France.',
    bioH: 'Bio',
    bioP1:
      'I’m Rachid Chabane, a full-stack and cloud engineer based in Lille. By day I ship Java and Spring Boot services on Google Cloud, owning the path from business requirements through infrastructure, CI/CD, and on-call production. Outside that work I build agentic-AI systems on the Claude stack: multi-agent orchestration, MCP tools, retrieval, and the context engineering that keeps long-running agents reliable.',
    bioP2:
      'That side of my work ships as open source, including a published MCP server and a Claude Code plugin marketplace, and as larger private platforms, among them an autonomous research engine behind two preprints with DOIs. This notebook is another of those systems, written and maintained by an agent rather than by me. The thread across all of it is the same: building autonomous systems, and making them reliable enough to leave running.',
    contactH: 'Contact',
    contactPh: 'owner-filled',
    howH: 'How this site works',
    howLbl: 'agent-maintained',
    howText:
      'This notebook has no day-to-day human editor. An agent surveys the literature and repositories, drafts each note in French and English, checks its claims against cited sources, then publishes, with no human in the loop. Errors remain possible; every page exposes its sources so it can be challenged.',
  },
};

export function aboutStrings(lang: Locale): AboutStrings {
  return ABOUT[lang];
}

/**
 * Contact destinations (S8). Locale-neutral: hrefs and proper-noun labels are the
 * same in FR/EN. All three are verifiably-public and live: GitHub (repo remote),
 * LinkedIn (public profile), and email. Publishing the email + LinkedIn is the
 * owner's decision, made by populating them from the public résumé (the privacy
 * gate noted in CLAUDE.md #3 / FR-D3 / NFR-6). The page promotes any entry with a
 * non-null href to a live <a>; any href:null entry degrades to a non-interactive
 * owner-fill row. No backend form (W-2).
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
  {
    icon: 'mail',
    label: 'Email',
    value: 'rachid.chabane59@gmail.com',
    href: 'mailto:rachid.chabane59@gmail.com',
  },
  {
    icon: 'github',
    label: 'GitHub',
    value: 'RachidChabane',
    href: 'https://github.com/RachidChabane',
  },
  {
    icon: 'linkedin',
    label: 'LinkedIn',
    value: 'rachid-chabane',
    href: 'https://www.linkedin.com/in/rachid-chabane-35a2a420a',
  },
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
  difficultyAria: string; // stars aria template on runtime rows (= DIFFICULTY.aria; duplication accepted, see AVATAR note)
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
    difficultyAria: 'Difficulté : {n} sur 5',
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
    difficultyAria: 'Difficulty: {n} out of 5',
  },
};

export function searchStrings(lang: Locale): SearchStrings {
  return SEARCH[lang];
}

/**
 * Avatar overlay (S10) copy. Dedicated table — sibling to SEARCH, kept out of
 * ChromeStrings per this file's header. Powers the always-present non-figurative
 * agent panel (task 20). Strings lifted verbatim from the design `T`
 * (avatar-overlay.jsx). `title`/`open` intentionally equal `chrome.avatarAria`:
 * the launcher uses `chrome(lang).avatarAria`, the panel head uses
 * `avatarStrings(lang).title` — the duplication is accepted (parity tests check
 * only non-empty + key-set match). Typographic apostrophes (U+2019 ’) and the
 * ellipsis (U+2026 …) need no escaping (Prettier-stable, INV-9 safe).
 */
export interface AvatarStrings {
  title: string; // panel head title (= chrome.avatarAria)
  subtitle: string; // panel head sub-line
  placeholder: string; // input placeholder
  inputLabel: string; // input aria-label
  thinking: string; // thinking-row label
  refuseTag: string; // out-of-scope chip
  sourceLbl: string; // citation label
  diagramProv: string; // diagram provenance note (assistant-drawn, not retrieved)
  copy: string; // code-card copy button label
  copied: string; // code-card copy confirmation label
  open: string; // launcher aria fallback (= chrome.avatarAria)
  close: string; // close button aria-label
  send: string; // send button aria-label
  expand: string; // enter full-screen view (button aria-label)
  collapse: string; // leave full-screen view (button aria-label)
  hint: string; // first-visit nudge bubble copy (invites a question)
  hintDismiss: string; // hint-bubble dismiss button aria-label
  error: string; // network-failure line (generic, localized, no internals)
  unavailable: string; // temporary-outage line with a {date} comeback placeholder (reason never disclosed)
}

export const AVATAR: Record<Locale, AvatarStrings> = {
  fr: {
    title: 'Demander à l’agent',
    subtitle: 'répond à partir du site, avec sources',
    placeholder: 'Posez une question sur ce site…',
    inputLabel: 'Question pour l’agent',
    thinking: 'recherche dans le site…',
    refuseTag: 'hors périmètre',
    sourceLbl: 'Source',
    diagramProv: 'Schéma tracé par l’agent à partir des sources ci-dessus',
    copy: 'Copier',
    copied: 'Copié',
    open: 'Demander à l’agent',
    close: 'Fermer',
    send: 'Envoyer',
    expand: 'Afficher en plein écran',
    collapse: 'Quitter le plein écran',
    hint: 'Une question sur Rachid ou sur ce site ? Demandez-moi.',
    hintDismiss: 'Masquer cette suggestion',
    error: 'Une erreur est survenue. Réessayez.',
    unavailable:
      'L’assistant est temporairement indisponible. Retour prévu le {date}.',
  },
  en: {
    title: 'Ask the agent',
    subtitle: 'answers from the site, with sources',
    placeholder: 'Ask a question about this site…',
    inputLabel: 'Question for the agent',
    thinking: 'searching the site…',
    refuseTag: 'out of scope',
    sourceLbl: 'Source',
    diagramProv: 'Diagram drawn by the assistant from the sources above',
    copy: 'Copy',
    copied: 'Copied',
    open: 'Ask the agent',
    close: 'Close',
    send: 'Send',
    expand: 'Show full screen',
    collapse: 'Exit full screen',
    hint: 'Curious about Rachid or this site? Ask me.',
    hintDismiss: 'Dismiss this hint',
    error: 'Something went wrong. Try again.',
    unavailable:
      'The assistant is temporarily unavailable. It will be back on {date}.',
  },
};

export function avatarStrings(lang: Locale): AvatarStrings {
  return AVATAR[lang];
}

/**
 * Knowledge graph (the /[lang]/graph/ page + KnowledgeGraph island) copy.
 * Dedicated table — sibling to SEARCH, kept out of ChromeStrings per this file's
 * header. The island needs a handful of strings at runtime (counts, the citation
 * lead-in); they ride the island's JSON payload server-side — copy never lives
 * in JS. `{n}` count templates mirror TAGS/SEARCH + formatCount. The four theme
 * labels name the cluster colors (CONCEPT_THEMES in src/content/schemas.ts).
 */
export interface GraphStrings {
  metaDesc: string; // <meta name="description">
  eyebrow: string; // mono kicker
  title: string; // <h1>
  intro: string; // one-line explainer under the title
  hint: string; // interaction hint (zoom / pan / click)
  searchLabel: string; // search input aria-label
  searchPlaceholder: string; // search input placeholder
  searchEmpty: string; // a11y live-region line when no concept matches
  filterAria: string; // theme chip-rail group aria-label
  themeAll: string; // "all themes" chip
  themeAgenticAi: string; // cluster label — agentic-ai
  themeMlFundamentals: string; // cluster label — ml-fundamentals
  themeInfraTooling: string; // cluster label — infra-tooling
  themeEvalsQuality: string; // cluster label — evals-quality
  legendNew: string; // "new" highlight legend (latest reindex cohort)
  panelAria: string; // side panel aria-label
  panelClose: string; // close button aria-label
  articlesH: string; // panel heading — citing articles
  relatedH: string; // panel heading — related concepts
  citedIn: string; // tooltip lead-in before the citing-article titles
  countOne: string; // "{n} article"
  countMany: string; // "{n} articles"
  nodeAria: string; // node aria template: "{label}, {theme}, {n}" (+ count tail)
  empty: string; // empty-store state (no concepts yet)
  zoomIn: string; // zoom-in control aria-label
  zoomOut: string; // zoom-out control aria-label
  zoomFit: string; // fit-view control aria-label
  zoomFitLabel: string; // fit-view control visible label — "Cadrer" / "Fit"
  statConcepts: string; // atlas ledger label — "concepts"
  statLinks: string; // atlas ledger label — "liens" / "links"
}

export const GRAPH: Record<Locale, GraphStrings> = {
  fr: {
    metaDesc:
      'Carte interactive des concepts d’IA couverts par ce carnet : définitions, liens entre notions et articles sources.',
    eyebrow: 'Atlas',
    title: 'Graphe de connaissances',
    intro:
      'Tous les concepts couverts par le carnet, reliés entre eux. Chaque nœud cite ses articles sources.',
    hint: 'Molette pour zoomer, glisser pour déplacer, cliquer un concept pour le détail.',
    searchLabel: 'Rechercher un concept',
    searchPlaceholder: 'Rechercher un concept…',
    searchEmpty: 'Aucun concept ne correspond.',
    filterAria: 'Filtrer par thème',
    themeAll: 'Tous',
    themeAgenticAi: 'IA agentique',
    themeMlFundamentals: 'Fondamentaux ML',
    themeInfraTooling: 'Infra et outillage',
    themeEvalsQuality: 'Évals et qualité',
    legendNew: 'Nouveau',
    panelAria: 'Détail du concept',
    panelClose: 'Fermer le panneau',
    articlesH: 'Articles',
    relatedH: 'Concepts liés',
    citedIn: 'Cité dans',
    countOne: '{n} article',
    countMany: '{n} articles',
    nodeAria: '{label}, {theme}',
    empty: 'Le graphe se remplit au fil des publications.',
    zoomIn: 'Zoomer',
    zoomOut: 'Dézoomer',
    zoomFit: 'Cadrer la vue',
    zoomFitLabel: 'Cadrer',
    statConcepts: 'concepts',
    statLinks: 'liens',
  },
  en: {
    metaDesc:
      'Interactive map of the AI concepts this notebook covers: definitions, links between ideas, and the source articles.',
    eyebrow: 'Atlas',
    title: 'Knowledge graph',
    intro:
      'Every concept the notebook covers, linked together. Each node cites its source articles.',
    hint: 'Scroll to zoom, drag to pan, click a concept for detail.',
    searchLabel: 'Search concepts',
    searchPlaceholder: 'Search concepts…',
    searchEmpty: 'No concept matches.',
    filterAria: 'Filter by theme',
    themeAll: 'All',
    themeAgenticAi: 'Agentic AI',
    themeMlFundamentals: 'ML fundamentals',
    themeInfraTooling: 'Infra & tooling',
    themeEvalsQuality: 'Evals & quality',
    legendNew: 'New',
    panelAria: 'Concept detail',
    panelClose: 'Close panel',
    articlesH: 'Articles',
    relatedH: 'Related concepts',
    citedIn: 'Cited in',
    countOne: '{n} article',
    countMany: '{n} articles',
    nodeAria: '{label}, {theme}',
    empty: 'The graph fills in as articles publish.',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    zoomFit: 'Fit view',
    zoomFitLabel: 'Fit',
    statConcepts: 'concepts',
    statLinks: 'links',
  },
};

export function graphStrings(lang: Locale): GraphStrings {
  return GRAPH[lang];
}

/**
 * Radar (the /[lang]/radar/ surface) copy. Dedicated tables — siblings to the other
 * *_INDEX / *_DETAIL tables, kept out of ChromeStrings per this file's header. Radar
 * is the short-dated AI-engineering release/spec/tool feed; its copy mirrors the
 * Articles tone (no marketing chrome). The `·` / `→` are typographic punctuation,
 * not emoji (INV-9 safe). FR apostrophes use U+2019 ’ (file convention).
 */
export interface RadarIndexStrings {
  eyebrow: string; // mono kicker — "Veille" / "Radar"
  title: string; // <h1> — "Radar"
  intro: string; // one-line explainer under the title
  countSuffix: string; // follows the count: "brèves · du plus récent" / "briefs · newest first"
  empty: string; // empty-state line
}

export const RADAR_INDEX: Record<Locale, RadarIndexStrings> = {
  fr: {
    eyebrow: 'Veille',
    title: 'Radar',
    intro:
      'Ce qui vient de sortir en ingénierie de l’IA : specs, modèles, outils. Brèves datées, sourcées, avec schéma, code et impact pour une équipe.',
    countSuffix: 'brèves · du plus récent',
    empty: 'Aucune brève pour le moment.',
  },
  en: {
    eyebrow: 'Radar',
    title: 'Radar',
    intro:
      'What just shipped in AI engineering: specs, models, tools. Dated, sourced briefs, each with a schema, code, and what it means for an engineering team.',
    countSuffix: 'briefs · newest first',
    empty: 'No briefs yet.',
  },
};

export function radarIndexStrings(lang: Locale): RadarIndexStrings {
  return RADAR_INDEX[lang];
}

export interface RadarDetailStrings {
  back: string; // index back-link — "Tout le radar" / "All radar"
  maintained: string; // eyebrow tail (= ARTICLE_DETAIL.maintained)
  sourcesH: string; // "Sources"
  bilingualNote: string; // "FR / EN"
  onThisPage: string; // contents-rail label
  copyLink: string; // per-heading copy-permalink button aria-label
  copyCode: string; // copy-code-block button aria-label/text
  copied: string; // transient "copied" confirmation
}

export const RADAR_DETAIL: Record<Locale, RadarDetailStrings> = {
  fr: {
    back: 'Tout le radar',
    maintained: 'maintenu par l’agent',
    sourcesH: 'Sources',
    bilingualNote: 'FR / EN',
    onThisPage: 'Sur cette page',
    copyLink: 'Copier le lien vers cette section',
    copyCode: 'Copier le code',
    copied: 'Copié',
  },
  en: {
    back: 'All radar',
    maintained: 'agent-maintained',
    sourcesH: 'Sources',
    bilingualNote: 'FR / EN',
    onThisPage: 'On this page',
    copyLink: 'Copy link to this section',
    copyCode: 'Copy code',
    copied: 'Copied',
  },
};

export function radarDetailStrings(lang: Locale): RadarDetailStrings {
  return RADAR_DETAIL[lang];
}

/**
 * Localized labels for the radar `kind` (the news TYPE, rendered in the eyebrow and
 * as the list-row kind tag). Keyed by the RADAR_KINDS enum in content/schemas.ts.
 * CSS-uppercases them where shown as an eyebrow.
 */
export const RADAR_KIND_LABEL: Record<Locale, Record<RadarKind, string>> = {
  fr: {
    'spec-change': 'Évolution de spec',
    release: 'Sortie',
    tool: 'Outil',
    benchmark: 'Benchmark',
    security: 'Sécurité',
    research: 'Recherche',
  },
  en: {
    'spec-change': 'Spec change',
    release: 'Release',
    tool: 'Tool',
    benchmark: 'Benchmark',
    security: 'Security',
    research: 'Research',
  },
};

export function radarKindLabel(kind: RadarKind, lang: Locale): string {
  return RADAR_KIND_LABEL[lang][kind];
}
