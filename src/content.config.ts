import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {
  articleFrontmatterSchema,
  projectFrontmatterSchema,
  tagSchema,
  provenanceSchema,
} from './content/schemas';

export const collections = {
  articles: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
    schema: articleFrontmatterSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: projectFrontmatterSchema,
  }),
  tags: defineCollection({
    loader: file('./src/content/tags/index.json'),
    schema: tagSchema,
  }),
  // Grounded-citation provenance sidecars (Option B), written by the publish stage.
  // Empty until the pipeline runs; the renderer no-ops for articles with no entry.
  provenance: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/provenance' }),
    schema: provenanceSchema,
  }),
};
