/**
 * Ground-truth site surface for the full-site e2e crawl (task 29). DATA ONLY — no
 * Playwright import, so it is collected by neither vitest (`exclude: e2e/**`) nor
 * Playwright (its `testMatch` ignores non-`*.spec`/`*.test` files). Slugs are
 * pinned to the PUBLISHED seeds and were verified against `find dist -name
 * '*.html'` at implement time (60 localized routes = 30 per lang). The
 * integration test (`tests/integration.test.ts`) independently re-derives the
 * published slug set from the `.md` corpus, so a future content drift fails THAT
 * test loudly — the intended cross-check (plan §5.1 risk note).
 */

export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/**
 * One representative route per screen TYPE, per lang. `name` labels the test row.
 * Used by the a11y matrix and perf spec (a per-type sample, not the full crawl).
 */
export interface Template {
  name: string;
  fr: string;
  en: string;
}

export const TEMPLATES: Template[] = [
  { name: 'home', fr: '/fr/', en: '/en/' },
  { name: 'blog-index', fr: '/fr/blog/', en: '/en/blog/' },
  {
    name: 'article',
    fr: '/fr/blog/rag-hybride-fusion-rang-reciproque/',
    en: '/en/blog/hybrid-rag-reciprocal-rank-fusion/',
  },
  { name: 'work-index', fr: '/fr/work/', en: '/en/work/' },
  {
    name: 'work-detail',
    fr: '/fr/work/coffre-secrets-mcp/',
    en: '/en/work/mcp-secrets-vault/',
  },
  { name: 'about', fr: '/fr/about/', en: '/en/about/' },
  { name: 'search', fr: '/fr/search/', en: '/en/search/' },
  { name: 'tags-dir', fr: '/fr/tags/', en: '/en/tags/' },
  { name: 'tag-detail', fr: '/fr/tags/rag/', en: '/en/tags/rag/' },
  { name: 'not-found', fr: '/fr/404/', en: '/en/404/' },
];

/** Published article slugs per lang (matches dist/<lang>/blog/<slug>/). */
export const ARTICLE_SLUGS: Record<Lang, readonly string[]> = {
  fr: [
    'decouper-sur-larbre-syntaxique',
    'evaluer-agent-outille',
    'garde-fous-publication-fact-checking',
    'orchestrer-agents-code-deterministes',
    'quantifier-modele-ouvert',
    'rag-hybride-fusion-rang-reciproque',
    'servir-llm-open-source-production',
    'votre-fenetre-de-contexte-est-un-plafond',
  ],
  en: [
    'chunk-on-the-syntax-tree-or-not',
    'deterministic-coding-agent-workflows',
    'evaluating-tool-using-agent',
    'hybrid-rag-reciprocal-rank-fusion',
    'publication-guardrails-fact-checking',
    'quantizing-open-model',
    'serving-oss-llm-production',
    'your-context-window-is-a-ceiling',
  ],
};

/** Published project slugs per lang (matches dist/<lang>/work/<slug>/). */
export const WORK_SLUGS: Record<Lang, readonly string[]> = {
  fr: [
    'atelier-marketplace-plugins',
    'bayan-plateforme-rag',
    'claude-plan-execute-fr',
    'coffre-secrets-mcp',
    'moteur-ijtihad',
    'plateforme-ia-sterna',
    'suivi-athletique',
  ],
  en: [
    'atelier-plugin-marketplace',
    'athletic-tracker',
    'bayan-rag-platform',
    'claude-plan-execute',
    'ijtihad-engine',
    'mcp-secrets-vault',
    'sterna-ai-platform',
  ],
};

/** Curated tag vocabulary — same slug set in both langs (route is /<lang>/tags/<slug>/). */
export const TAG_SLUGS = [
  'agents',
  'rag',
  'agentic-coding',
  'evaluation',
  'llm-oss',
  'retrieval',
  'qualite',
] as const;

/**
 * All localized routes for `lang`, in a stable order:
 * home, blog index, articles, work index, works, about, search, tags directory,
 * tag details, 404. The non-localized root `/` redirect stub and the bare `/404`
 * are intentionally EXCLUDED (plan §1/§5.5): the root is a meta-refresh stub with
 * no `<h1>`, and the bare 404 duplicates the localized ones.
 *
 * NOTE: the blog index is now a SINGLE page grouped by category — `/blog/2/` no
 * longer builds (paginate() was removed when the index gained category sections),
 * so the former `blog page 2` route is gone from this crawl (and from TEMPLATES).
 */
export function allRoutes(lang: Lang): string[] {
  const at = (path: string): string => `/${lang}/${path}`;
  return [
    at(''),
    at('blog/'),
    ...ARTICLE_SLUGS[lang].map((s) => at(`blog/${s}/`)),
    at('work/'),
    ...WORK_SLUGS[lang].map((s) => at(`work/${s}/`)),
    at('about/'),
    at('search/'),
    at('tags/'),
    ...TAG_SLUGS.map((s) => at(`tags/${s}/`)),
    at('404/'),
  ];
}
