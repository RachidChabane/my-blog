// Server-only: do not import in client-side islands.
//
// Deterministic fakes + a fixture corpus so the retrieval lib tests run with NO
// secret and NO network. Deliberate simplifications (documented loudly):
//
//   - FakeEmbedder is a single-slot token-hash bag-of-words: it measures TOKEN
//     OVERLAP, not meaning. It is MONOLINGUAL — "retrieval" and "récupération"
//     are orthogonal to it. The real multilingual embedder (OQ-5) maps them
//     close. THEREFORE no fixture/test may expect a FR query to match an EN
//     chunk; cross-lingual behaviour is validated only at the post-secret step.
//   - Because token-hash cosine ≈ token overlap ≈ the BM25 signal, the fake
//     COLLAPSES the two legs — under it the vector and lexical legs measure
//     nearly the same thing. A green fake suite is NOT proof of production
//     retrieval quality; it locks the mechanics (RRF order, the cosine gate,
//     the LLM-never-called-below-threshold guarantee), not cross-lingual recall.
//
// Fully deterministic: no Date.now(), no Math.random(). Fixture generatedAt is a
// literal; the embedder is a pure function of token text.

import type {
  Embedder,
  IndexArtifact,
  IndexChunk,
  LLMProvider,
  LlmRequest,
  Reranker,
  ScoredChunk,
} from './contracts';
import { tokenize } from './lexical';

/** FNV-1a 32-bit hash — a small deterministic string hash. */
function fnv1a(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Deterministic token-hash bag-of-words embedder. Each token bumps one slot
 * (`fnv1a(token) % D`); the vector is then L2-normalized, so two texts sharing
 * tokens get high cosine and disjoint vocabularies get ~0. `D` is large (default
 * 256) so hash collisions stay rare and on-/off-topic separate with headroom.
 */
export class FakeEmbedder implements Embedder {
  readonly model: string;
  readonly dimensions: number;

  constructor(dimensions = 256) {
    this.dimensions = dimensions;
    this.model = `fake-hash-${dimensions}`;
  }

  private vectorize(text: string): number[] {
    const vec: number[] = new Array<number>(this.dimensions).fill(0);
    for (const token of tokenize(text)) {
      vec[fnv1a(token) % this.dimensions] += 1;
    }
    let norm = 0;
    for (const v of vec) norm += v * v;
    norm = Math.sqrt(norm);
    if (norm === 0) return vec; // empty text → zero vector; cosine() yields 0
    return vec.map((v) => v / norm);
  }

  embed(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map((t) => this.vectorize(t)));
  }

  embedQuery(text: string): Promise<number[]> {
    return Promise.resolve(this.vectorize(text));
  }
}

/**
 * Deterministic reranker: re-scores each candidate by query/chunk token-overlap
 * count, sorts descending (then by chunk.id), and truncates to `topK`. Lets a
 * test assert a predictable reorder. The canonical "no rerank" config is simply
 * omitting `deps.reranker`, so no separate disabled impl is needed.
 */
export class FakeReranker implements Reranker {
  readonly model = 'fake-overlap-reranker';

  rerank(
    query: string,
    candidates: ScoredChunk[],
    topK: number
  ): Promise<ScoredChunk[]> {
    const queryTokens = new Set(tokenize(query));
    const rescored: ScoredChunk[] = candidates.map((c) => {
      const chunkTokens = new Set(tokenize(c.chunk.text));
      let overlap = 0;
      for (const t of queryTokens) if (chunkTokens.has(t)) overlap += 1;
      return { chunk: c.chunk, score: overlap };
    });
    rescored.sort(
      (a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id)
    );
    return Promise.resolve(rescored.slice(0, topK));
  }
}

/**
 * Streaming synthesis fake. `stream()` is an async generator: its body — and the
 * `callCount` increment — only runs when the consumer ITERATES it. That is the
 * NFR-4 spy: the endpoint pattern never iterates on the refusal branch, so a
 * test can assert `callCount === 0` below threshold and `=== 1` when grounded.
 */
export class FakeLLMProvider implements LLMProvider {
  readonly model = 'fake-llm';
  callCount = 0;

  async *stream(request: LlmRequest): AsyncIterable<string> {
    this.callCount += 1;
    // Citation-first canned answer, assembled from the request.
    yield '[1] ';
    for (const message of request.messages) {
      if (message.role === 'user') {
        yield `Answer grounded in the retrieved context for: ${message.content}`;
      }
    }
    yield '\n\nSee the cited sources above.';
  }

  reset(): void {
    this.callCount = 0;
  }
}

/**
 * The seed chunks (text is the source of truth; embeddings are derived by the
 * fake embedder in `buildFixtureArtifact`). Three lexically DISJOINT topics so
 * cosine separates cleanly; each topic is single-language (no cross-lingual
 * expectations — see the FakeEmbedder note). Chunks are short (2-3 sentences) so
 * on-topic cosine stays well above the threshold.
 */
export const FIXTURE_CHUNK_SEEDS: ReadonlyArray<Omit<IndexChunk, 'embedding'>> =
  [
    // Topic A (EN): hybrid RAG retrieval.
    {
      id: 'hybrid-rag-retrieval#intro#0',
      slug: 'hybrid-rag-retrieval',
      lang: 'en',
      sourceUrl: 'https://rachidchabane.example/en/blog/hybrid-rag-retrieval/',
      headingAnchor: '',
      title: 'Hybrid RAG retrieval',
      text: 'Hybrid retrieval combines a lexical BM25 leg with dense vector embeddings. An optional reranking step refines the top candidates before synthesis.',
    },
    {
      id: 'hybrid-rag-retrieval#fusion#1',
      slug: 'hybrid-rag-retrieval',
      lang: 'en',
      sourceUrl:
        'https://rachidchabane.example/en/blog/hybrid-rag-retrieval/#fusion',
      headingAnchor: 'fusion',
      title: 'Reciprocal rank fusion',
      text: 'Reciprocal rank fusion assigns each document a score from its rank in every list. Dense embeddings capture semantic similarity that keyword search misses.',
    },
    // Topic B (EN): Astro on Cloudflare Pages.
    {
      id: 'astro-cloudflare-deploy#intro#0',
      slug: 'astro-cloudflare-deploy',
      lang: 'en',
      sourceUrl:
        'https://rachidchabane.example/en/blog/astro-cloudflare-deploy/',
      headingAnchor: '',
      title: 'Deploying Astro to Cloudflare',
      text: 'Astro builds static HTML pages at compile time. Deploying to Cloudflare Pages serves the site from a global edge network with zero servers.',
    },
    {
      id: 'astro-cloudflare-deploy#islands#1',
      slug: 'astro-cloudflare-deploy',
      lang: 'en',
      sourceUrl:
        'https://rachidchabane.example/en/blog/astro-cloudflare-deploy/#islands',
      headingAnchor: 'islands',
      title: 'Astro islands',
      text: 'Astro islands hydrate only the interactive components. The static shell ships no client javascript, keeping pages fast on the edge.',
    },
    // Topic C (FR): suivi de course à pied.
    {
      id: 'suivi-course-a-pied#intro#0',
      slug: 'suivi-course-a-pied',
      lang: 'fr',
      sourceUrl: 'https://rachidchabane.example/fr/blog/suivi-course-a-pied/',
      headingAnchor: '',
      title: 'Suivi de course à pied',
      text: "Le suivi de course à pied enregistre la distance, l'allure et la fréquence cardiaque. Un graphique hebdomadaire montre la progression.",
    },
    {
      id: 'suivi-course-a-pied#objectifs#1',
      slug: 'suivi-course-a-pied',
      lang: 'fr',
      sourceUrl:
        'https://rachidchabane.example/fr/blog/suivi-course-a-pied/#objectifs',
      headingAnchor: 'objectifs',
      title: 'Objectifs',
      text: "L'application fixe des objectifs de distance et de vitesse. Les séances fractionnées améliorent l'endurance.",
    },
  ];

/**
 * Build a complete IndexArtifact from the seed chunks by running the embedder
 * over each chunk's text (mirrors the real builder, task 18, so embeddings
 * always match `dimensions`). `generatedAt` is a literal for determinism.
 */
export async function buildFixtureArtifact(
  embedder: Embedder = new FakeEmbedder()
): Promise<IndexArtifact> {
  const embeddings = await embedder.embed(
    FIXTURE_CHUNK_SEEDS.map((s) => s.text)
  );
  const chunks: IndexChunk[] = FIXTURE_CHUNK_SEEDS.map((seed, i) => ({
    ...seed,
    embedding: embeddings[i],
  }));
  const sourceHashes: Record<string, string> = {};
  for (const seed of FIXTURE_CHUNK_SEEDS) {
    sourceHashes[seed.slug] = `fixturehash-${seed.slug}`;
  }
  return {
    version: 1,
    embeddingModel: embedder.model,
    dimensions: embedder.dimensions,
    generatedAt: '2026-06-02T00:00:00.000Z',
    sourceHashes,
    chunks,
  };
}
