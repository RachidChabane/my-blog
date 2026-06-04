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

export const articleFrontmatterSchema = z.object({
  translationKey: z.string().min(1),
  lang: z.enum(['fr', 'en']),
  slug: z.string().min(1),
  title: z.string().min(1),
  publishDate: z.string().regex(/^\d{2}-\d{2}-\d{4}$/),
  tags: z.array(z.string().min(1)).min(1),
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
});

export const tagSchema = z.object({
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

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
