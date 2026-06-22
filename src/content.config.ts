import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {
  articleFrontmatterSchema,
  radarFrontmatterSchema,
  projectFrontmatterSchema,
  tagSchema,
  categorySchema,
  provenanceSchema,
  conceptSchema,
} from './content/schemas';

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: articleFrontmatterSchema,
  }),
  // Radar — short dated AI-engineering release/spec/tool briefs. Same `<slug>.<lang>.md`
  // bilingual layout as articles, written by the radar pipeline's publish stage. Empty
  // until the pipeline (or the seed batch) runs.
  radar: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/radar' }),
    schema: radarFrontmatterSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: projectFrontmatterSchema,
  }),
  tags: defineCollection({
    loader: file('./src/content/tags/index.json'),
    schema: tagSchema,
  }),
  categories: defineCollection({
    loader: file('./src/content/categories/index.json'),
    schema: categorySchema,
  }),
  // Grounded-citation provenance sidecars (Option B), written by the publish stage.
  // Empty until the pipeline runs; the renderer no-ops for articles with no entry.
  provenance: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/provenance' }),
    schema: provenanceSchema,
  }),
  // Knowledge-graph concept store: canonical bilingual definitions + article
  // citations, appended daily by the pipeline's publish stage (concepts CLI).
  concepts: defineCollection({
    loader: file('./src/content/concepts/index.json'),
    schema: conceptSchema,
  }),
};
