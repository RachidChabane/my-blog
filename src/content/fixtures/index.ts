import type { ArticleFrontmatter, ProjectFrontmatter, Tag } from '../schemas';

export const ARTICLE_FR: ArticleFrontmatter = {
  translationKey: 'test-ia-engineering-2026',
  lang: 'fr',
  slug: 'introduction-agents-ia',
  title: 'Introduction aux agents IA',
  publishDate: '01-06-2026',
  tags: ['agents-ia', 'llm'],
  category: 'explainers',
  difficulty: 3,
  sources: [
    {
      label: 'Anthropic — Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      date: '01-12-2024',
    },
    {
      label: 'arXiv — ReAct: Synergizing Reasoning and Acting',
      url: 'https://arxiv.org/abs/2210.03629',
      date: '06-10-2022',
    },
  ],
  contentHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f601',
  publishState: 'published',
};

export const ARTICLE_EN: ArticleFrontmatter = {
  translationKey: 'test-ia-engineering-2026',
  lang: 'en',
  slug: 'introduction-ai-agents',
  title: 'Introduction to AI Agents',
  publishDate: '01-06-2026',
  tags: ['agents-ia', 'llm'],
  category: 'explainers',
  difficulty: 3,
  sources: [
    {
      label: 'Anthropic — Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      date: '01-12-2024',
    },
    {
      label: 'arXiv — ReAct: Synergizing Reasoning and Acting',
      url: 'https://arxiv.org/abs/2210.03629',
      date: '06-10-2022',
    },
  ],
  contentHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f601',
  publishState: 'published',
};

export const PROJECT_FR: ProjectFrontmatter = {
  translationKey: 'test-rag-pipeline-2026',
  lang: 'fr',
  slug: 'pipeline-rag',
  name: 'Pipeline RAG',
  summary: 'Pipeline de récupération augmentée pour un blog bilingue.',
  stack: ['TypeScript', 'Cloudflare Workers', 'OpenRouter'],
  status: 'production',
  links: [{ label: 'Documentation', url: 'https://example.com/docs' }],
  relatedArticles: ['test-ia-engineering-2026'],
  publishState: 'published',
};

export const PROJECT_EN: ProjectFrontmatter = {
  translationKey: 'test-rag-pipeline-2026',
  lang: 'en',
  slug: 'rag-pipeline',
  name: 'RAG Pipeline',
  summary: 'Retrieval-augmented pipeline for a bilingual blog.',
  stack: ['TypeScript', 'Cloudflare Workers', 'OpenRouter'],
  status: 'production',
  links: [{ label: 'Documentation', url: 'https://example.com/docs' }],
  relatedArticles: ['test-ia-engineering-2026'],
  publishState: 'published',
};

export const TAG_FIXTURE: Tag = {
  slug: 'agents-ia',
  label: { fr: 'Agents IA', en: 'AI Agents' },
};
