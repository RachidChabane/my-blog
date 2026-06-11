import { z } from 'zod';

const httpUrl = z
  .string()
  .url()
  .refine((url) => /^https?:\/\//i.test(url), {
    message: 'URL must use http or https',
  });

const sourceSchema = z.object({
  label: z.string().min(1),
  url: httpUrl,
  date: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
});

const linkSchema = z.object({
  label: z.string().min(1),
  url: httpUrl,
});

// Optional project enrichment (S7 richer detail pages). All fields are OPTIONAL so
// existing generated projects stay valid; gen-portfolio.ts authors them from the
// project's own body (no fabrication). `metrics` -> stat cards; `highlights` -> a
// key-points list; `architecture` -> the layered ArchitectureDiagram (a top-to-bottom
// flow of labelled layers, each holding component nodes).
const metricSchema = z.object({
  value: z.string().min(1), // "11", "100%", "156"
  label: z.string().min(1), // "domain apps", "citation recall"
});
const architectureLayerSchema = z.object({
  label: z.string().min(1), // "Frontend", "Retrieval", "Storage"
  nodes: z.array(z.string().min(1)).min(1), // component names
});
const architectureSchema = z.object({
  caption: z.string().min(1).optional(),
  layers: z.array(architectureLayerSchema).min(2),
});

export const articleFrontmatterSchema = z.object({
  translationKey: z.string().min(1),
  lang: z.enum(['fr', 'en']),
  slug: z.string().min(1),
  title: z.string().min(1),
  publishDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
  tags: z.array(z.string().min(1)).min(1),
  category: z
    .enum(['essays', 'explainers', 'briefings', 'lessons'])
    .default('explainers'),
  // 1-5 against the single fixed rubric (pipeline/difficulty_rubric.md, the one
  // source of truth). Required on every article; FR/EN pairs carry the SAME value.
  difficulty: z.number().int().min(1).max(5),
  sources: z.array(sourceSchema).min(2),
  contentHash: z.string().min(1),
  publishState: z.enum(['published', 'draft']),
});

export const projectFrontmatterSchema = z.object({
  translationKey: z.string().min(1),
  lang: z.enum(['fr', 'en']),
  slug: z.string().min(1),
  name: z.string().min(1),
  summary: z.string().min(1),
  stack: z.array(z.string().min(1)),
  status: z.string().min(1),
  links: z.array(linkSchema),
  relatedArticles: z.array(z.string()).optional(),
  derivedFrom: z.string().optional(),
  publishState: z.enum(['published', 'draft']),
  // optional enrichment (richer S7 pages) — see the schemas above
  year: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  highlights: z.array(z.string().min(1)).min(1).optional(),
  metrics: z.array(metricSchema).min(1).optional(),
  architecture: architectureSchema.optional(),
});

export const tagSchema = z.object({
  slug: z.string().min(1),
  label: z.object({
    fr: z.string().min(1),
    en: z.string().min(1),
  }),
});

export const categorySchema = z.object({
  slug: z.string().min(1),
  label: z.object({
    fr: z.string().min(1),
    en: z.string().min(1),
  }),
});

// Per-language grounded-citation provenance sidecar (Option B). One file per published
// article (`<slug>.<lang>.json`), written by the pipeline's publish stage from the
// claim->source map. Keyed per CITED source so each entry matches an [sN] marker in the
// body; `span` (offsets into `excerpt`) is present only when unambiguous.
const excerptSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

const provenanceCitationSchema = z.object({
  sourceId: z.string().regex(/^s\d+$/),
  label: z.string().min(1),
  url: httpUrl,
  excerpt: z.string().min(1),
  span: excerptSpanSchema.optional(),
});

export const provenanceSchema = z.object({
  slug: z.string().min(1),
  lang: z.enum(['fr', 'en']),
  translationKey: z.string().min(1),
  citations: z.array(provenanceCitationSchema).min(1),
});

/**
 * Knowledge-graph concept store (src/content/concepts/index.json). One CANONICAL
 * record per AI concept extracted from the blog's content: the definition is
 * write-once (the pipeline's concepts CLI refuses to overwrite it -- consistency
 * over regeneration), `articles` carries the citing translationKeys (the graph's
 * citations are first-class), `related` names sibling concept ids (typed edges on
 * top of the computed article co-occurrence), and `theme` drives cluster color.
 * `addedOn` (DD-MM-YYYY) lets the graph highlight the newest concepts.
 */
export const CONCEPT_THEMES = [
  'agentic-ai',
  'ml-fundamentals',
  'infra-tooling',
  'evals-quality',
] as const;

export const conceptSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  label: z.object({
    fr: z.string().min(1),
    en: z.string().min(1),
  }),
  definition: z.object({
    fr: z.string().min(1),
    en: z.string().min(1),
  }),
  theme: z.enum(CONCEPT_THEMES),
  aliases: z.array(z.string().min(1)).default([]),
  related: z.array(z.string().min(1)).default([]),
  articles: z.array(z.string().min(1)).min(1),
  addedOn: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type ConceptTheme = (typeof CONCEPT_THEMES)[number];
