import { defineCollection } from 'astro:content';
import { glob, file } from 'astro/loaders';
import {
  articleFrontmatterSchema,
  projectFrontmatterSchema,
  tagSchema,
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
};
