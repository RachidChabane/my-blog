import { describe, it, expect } from 'vitest';
import { buildGraph } from '@/lib/graph';
import type { ConceptEntryLike } from '@/lib/graph';
import type { ArticleEntryLike } from '@/lib/content';
import type { Concept } from '@/content/schemas';

/* -------------------------------------------------------------- fixtures */
function concept(over: Partial<Concept> & { id: string }): ConceptEntryLike {
  const data: Concept = {
    label: { fr: `${over.id}-fr`, en: `${over.id}-en` },
    definition: { fr: 'Définition.', en: 'Definition.' },
    theme: 'agentic-ai',
    aliases: [],
    related: [],
    articles: ['k1'],
    addedOn: '01-06-2026',
    ...over,
  } as Concept;
  return { id: data.id, data };
}

function article(
  over: Partial<ArticleEntryLike['data']> & { slug: string }
): ArticleEntryLike {
  return {
    id: over.slug,
    body: 'Lead paragraph.',
    data: {
      translationKey: 'k1',
      lang: 'fr',
      title: `T-${over.slug}`,
      publishDate: '01-06-2026',
      tags: ['agents'],
      category: 'explainers',
      difficulty: 3,
      sources: [
        { label: 'a', url: 'https://a.example', date: '01-01-2024' },
        { label: 'b', url: 'https://b.example', date: '01-01-2024' },
      ],
      contentHash: 'h',
      publishState: 'published',
      ...over,
    },
  };
}

const ARTICLES: ArticleEntryLike[] = [
  article({ slug: 'a-un', translationKey: 'k1' }),
  article({ slug: 'a-deux', translationKey: 'k2' }),
  article({ slug: 'draft-only', translationKey: 'k3', publishState: 'draft' }),
];

/* ---------------------------------------------------------------- nodes */
describe('buildGraph — nodes', () => {
  it('localizes label/definition and resolves citations to published hrefs', () => {
    const g = buildGraph(
      [concept({ id: 'rag', articles: ['k1', 'k2'] })],
      ARTICLES,
      'fr'
    );
    expect(g.nodes).toHaveLength(1);
    const n = g.nodes[0];
    expect(n.label).toBe('rag-fr');
    expect(n.occurrences).toBe(2);
    expect(n.articles.map((a) => a.href)).toEqual([
      '/fr/blog/a-un/',
      '/fr/blog/a-deux/',
    ]);
    expect(n.articles.map((a) => a.title)).toEqual(['T-a-un', 'T-a-deux']);
  });

  it('drops citations with no published article in the locale (INV-3), keeps the node', () => {
    const g = buildGraph(
      [concept({ id: 'rag', articles: ['k3', 'missing-key'] })],
      ARTICLES,
      'fr'
    );
    expect(g.nodes[0].articles).toEqual([]); // draft + unknown both dropped
    expect(g.nodes[0].occurrences).toBe(2); // size still counts the store's citations
  });

  it('flags only the latest addedOn cohort as new', () => {
    const g = buildGraph(
      [
        concept({ id: 'old', addedOn: '01-05-2026' }),
        concept({ id: 'fresh', addedOn: '10-06-2026' }),
        concept({ id: 'fresh-too', addedOn: '10-06-2026' }),
      ],
      ARTICLES,
      'en'
    );
    const byId = new Map(g.nodes.map((n) => [n.id, n]));
    expect(byId.get('old')!.isNew).toBe(false);
    expect(byId.get('fresh')!.isNew).toBe(true);
    expect(byId.get('fresh-too')!.isNew).toBe(true);
  });

  it('sorts nodes by id (deterministic builds)', () => {
    const g = buildGraph(
      [concept({ id: 'zeta' }), concept({ id: 'alpha' })],
      ARTICLES,
      'en'
    );
    expect(g.nodes.map((n) => n.id)).toEqual(['alpha', 'zeta']);
  });
});

/* ---------------------------------------------------------------- edges */
describe('buildGraph — edges', () => {
  it('builds undirected related edges, deduped across both directions', () => {
    const g = buildGraph(
      [
        concept({ id: 'a', related: ['b'] }),
        concept({ id: 'b', related: ['a'] }),
      ],
      ARTICLES,
      'en'
    );
    // a and b also share article k1 -> still ONE edge, curated kind wins
    expect(g.edges).toHaveLength(1);
    expect(g.edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      kind: 'related',
    });
  });

  it('derives co-occurrence edges weighted by shared-article count', () => {
    const g = buildGraph(
      [
        concept({ id: 'a', articles: ['k1', 'k2'] }),
        concept({ id: 'b', articles: ['k1', 'k2'] }),
        concept({ id: 'c', articles: ['k9'] }), // no overlap
      ],
      ARTICLES,
      'en'
    );
    expect(g.edges).toHaveLength(1);
    expect(g.edges[0]).toMatchObject({
      source: 'a',
      target: 'b',
      kind: 'cooccurrence',
      weight: 2,
    });
  });

  it('drops weight-1 co-occurrence (same-article cliques are noise, not structure)', () => {
    const g = buildGraph(
      [
        concept({ id: 'a', articles: ['k1'] }),
        concept({ id: 'b', articles: ['k1'] }), // share exactly ONE article
      ],
      ARTICLES,
      'en'
    );
    expect(g.edges).toEqual([]);
  });

  it('drops related ids that are not in the store (no dangling edge)', () => {
    const g = buildGraph(
      [concept({ id: 'a', related: ['ghost'], articles: ['k9'] })],
      ARTICLES,
      'en'
    );
    expect(g.edges).toEqual([]);
    expect(g.nodes[0].related).toEqual([]); // the panel never lists a dead chip
  });
});
