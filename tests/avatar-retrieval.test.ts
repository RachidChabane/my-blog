import { describe, it, expect, beforeAll } from 'vitest';
import type {
  IndexArtifact,
  LlmRequest,
  Reranker,
  ScoredChunk,
} from '@/lib/avatar/contracts';
import { tokenize, Bm25Index } from '@/lib/avatar/lexical';
import {
  cosineSimilarity,
  InMemoryVectorStore,
} from '@/lib/avatar/vector-store';
import { reciprocalRankFusion } from '@/lib/avatar/rrf';
import { retrieve, createRetriever } from '@/lib/avatar/retrieval';
import {
  applyThreshold,
  DEFAULT_MAX_NEAR_MISSES,
} from '@/lib/avatar/threshold';
import {
  FakeEmbedder,
  FakeReranker,
  FakeLLMProvider,
  buildFixtureArtifact,
  FIXTURE_CHUNK_SEEDS,
} from '@/lib/avatar/fakes';

// Queries calibrated against the fake embedder (see fakes.ts). Topic A is EN.
const ON_TOPIC_A = 'hybrid retrieval embeddings reranking';
const TOPIC_A_SLUG = 'hybrid-rag-retrieval';
const OFF_TOPIC = 'zzz quantum knitting saxophone';
const DEFAULT_LEG_TOP_K = 30; // retrieve()'s default legTopK

interface ExplicitDeps {
  embedder: FakeEmbedder;
  vectorStore: InMemoryVectorStore;
  lexical: Bm25Index;
}

/**
 * A reranker that disagrees with fusion: it ranks chunks by an explicit
 * preferred-id list (others fall to the end by id). Used by the S1 case to prove
 * `retrieve()` reranks the WIDER fused pool — a chunk this reranker promotes from
 * fused-rank > topK can only reach the output if it was in the pool.
 */
class FixedOrderReranker implements Reranker {
  readonly model = 'fixed-order-test-reranker';
  constructor(private readonly preferred: readonly string[]) {}

  rerank(
    _query: string,
    candidates: ScoredChunk[],
    topK: number
  ): Promise<ScoredChunk[]> {
    const rankOf = (cid: string): number => {
      const i = this.preferred.indexOf(cid);
      return i === -1 ? Number.MAX_SAFE_INTEGER : i;
    };
    const ordered = [...candidates].sort(
      (a, b) =>
        rankOf(a.chunk.id) - rankOf(b.chunk.id) ||
        a.chunk.id.localeCompare(b.chunk.id)
    );
    return Promise.resolve(
      ordered.slice(0, topK).map((c, i) => ({
        chunk: c.chunk,
        score: ordered.length - i,
      }))
    );
  }
}

// ---------------------------------------------------------------------------
// Group A — tokenize
// ---------------------------------------------------------------------------
describe('tokenize', () => {
  it('lowercases and splits on punctuation/whitespace', () => {
    expect(tokenize('Astro, Cloudflare!  Pages')).toEqual([
      'astro',
      'cloudflare',
      'pages',
    ]);
  });

  it('folds diacritics (NFD + strip combining marks)', () => {
    const tokens = tokenize('Modèle Récupération');
    expect(tokens).toContain('modele');
    expect(tokens).toContain('recuperation');
  });

  it('drops empty tokens from leading/trailing/double separators', () => {
    expect(tokenize('  --foo,,bar--  ')).toEqual(['foo', 'bar']);
    expect(tokenize('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Group B — cosineSimilarity
// ---------------------------------------------------------------------------
describe('cosineSimilarity', () => {
  it('identical vectors → 1', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it('orthogonal vectors → 0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it('opposite vectors → -1', () => {
    expect(cosineSimilarity([1, 2], [-1, -2])).toBeCloseTo(-1, 10);
  });

  it('zero-magnitude vector → 0 (not NaN)', () => {
    const s = cosineSimilarity([0, 0, 0], [1, 2, 3]);
    expect(s).toBe(0);
    expect(Number.isNaN(s)).toBe(false);
  });

  it('length mismatch → throws', () => {
    expect(() => cosineSimilarity([1, 2], [1, 2, 3])).toThrow(
      /length mismatch/
    );
  });
});

// ---------------------------------------------------------------------------
// Group C — reciprocalRankFusion (RRF ordering)
// ---------------------------------------------------------------------------
describe('reciprocalRankFusion', () => {
  const id = (s: string): string => s;

  it('consensus beats a single first-place (B, C, A, D)', () => {
    const fused = reciprocalRankFusion(
      [
        ['A', 'B', 'C'],
        ['B', 'C', 'D'],
      ],
      id,
      60
    );
    expect(fused.map((f) => f.key)).toEqual(['B', 'C', 'A', 'D']);
  });

  it('includes an item present in only one list', () => {
    const fused = reciprocalRankFusion(
      [
        ['A', 'B', 'C'],
        ['B', 'C', 'D'],
      ],
      id,
      60
    );
    expect(fused.map((f) => f.key)).toContain('D');
  });

  it('smaller k widens the rank-1 vs rank-2 score gap (monotonic emphasis)', () => {
    const lists: string[][] = [
      ['A', 'B', 'C'],
      ['B', 'C', 'D'],
    ];
    const big = reciprocalRankFusion(lists, id, 60);
    const small = reciprocalRankFusion(lists, id, 1);
    const gap = (f: { score: number }[]): number => f[0].score - f[1].score;
    expect(gap(small)).toBeGreaterThan(gap(big));
  });

  it('breaks ties deterministically by key ascending', () => {
    // Symmetric lists → X and Y earn identical fused scores.
    const fused = reciprocalRankFusion(
      [
        ['X', 'Y'],
        ['Y', 'X'],
      ],
      id,
      60
    );
    expect(fused.map((f) => f.key)).toEqual(['X', 'Y']);
    expect(fused[0].score).toBeCloseTo(fused[1].score, 12);
  });

  it('empty input → []; k <= 0 → throws', () => {
    expect(reciprocalRankFusion([], id)).toEqual([]);
    expect(() => reciprocalRankFusion([['A']], id, 0)).toThrow();
    expect(() => reciprocalRankFusion([['A']], id, -5)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Groups D & E share a fixture artifact + explicit deps (so the vector-store
// handle is in scope for case 15 — see review C3).
// ---------------------------------------------------------------------------
describe('hybrid retrieve + threshold (fakes)', () => {
  let embedder: FakeEmbedder;
  let artifact: IndexArtifact;
  let deps: ExplicitDeps;

  beforeAll(async () => {
    embedder = new FakeEmbedder();
    artifact = await buildFixtureArtifact(embedder);
    deps = {
      embedder,
      vectorStore: new InMemoryVectorStore(
        artifact.chunks,
        artifact.dimensions
      ),
      lexical: new Bm25Index(artifact.chunks),
    };
  });

  // -- Group D — retrieve --------------------------------------------------
  it('14: on-topic query ranks a Topic A chunk first with evidence attached', async () => {
    const result = await retrieve(ON_TOPIC_A, deps);
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].chunk.slug).toBe(TOPIC_A_SLUG);
    expect(result.candidates[0].vectorSimilarity).toBeGreaterThan(0);
    expect(typeof result.candidates[0].fusedScore).toBe('number');
  });

  it('15: topSimilarity equals the vector leg #1 cosine (captured pre-truncation)', async () => {
    const qVec = await embedder.embedQuery(ON_TOPIC_A);
    const legResults = await deps.vectorStore.search(qVec, DEFAULT_LEG_TOP_K);
    const result = await retrieve(ON_TOPIC_A, deps);
    expect(result.topSimilarity).toBe(legResults[0].score);
  });

  it('16: a reranker sets the order and a non-null rerankScore; without it, fused order + null', async () => {
    const withRerank = await retrieve(ON_TOPIC_A, {
      ...deps,
      reranker: new FakeReranker(),
    });
    expect(withRerank.candidates[0].chunk.slug).toBe(TOPIC_A_SLUG);
    expect(withRerank.candidates.every((c) => c.rerankScore !== null)).toBe(
      true
    );

    const noRerank = await retrieve(ON_TOPIC_A, deps);
    expect(noRerank.candidates[0].chunk.slug).toBe(TOPIC_A_SLUG);
    expect(noRerank.candidates.every((c) => c.rerankScore === null)).toBe(true);
  });

  it('S1: a reranker promotes a chunk from beyond topK using the WIDER fused pool', async () => {
    // No-rerank top-2 is [A1, A2]; astro#intro#0 is fused-rank 2 (outside top-2).
    const promoted = 'astro-cloudflare-deploy#intro#0';
    const baseline = await retrieve(ON_TOPIC_A, deps, { topK: 2 });
    expect(baseline.candidates.map((c) => c.chunk.id)).not.toContain(promoted);

    const reranker = new FixedOrderReranker([promoted]);
    const result = await retrieve(
      ON_TOPIC_A,
      { ...deps, reranker },
      { topK: 2 }
    );
    expect(result.candidates).toHaveLength(2);
    expect(result.candidates[0].chunk.id).toBe(promoted);
    // fusedScore is preserved from the FULL fused list, not just the top-k.
    expect(result.candidates[0].fusedScore).toBeGreaterThan(0);
    expect(result.candidates[0].rerankScore).not.toBeNull();
  });

  it('17: empty-corpus artifact → no candidates, topSimilarity 0, idk', async () => {
    const emptyDeps: ExplicitDeps = {
      embedder,
      vectorStore: new InMemoryVectorStore([], embedder.dimensions),
      lexical: new Bm25Index([]),
    };
    const result = await retrieve('anything at all', emptyDeps);
    expect(result.candidates).toEqual([]);
    expect(result.topSimilarity).toBe(0);
    const outcome = applyThreshold(result);
    expect(outcome.kind).toBe('idk');
    if (outcome.kind === 'idk') expect(outcome.nearMisses).toEqual([]);
  });

  // -- Group E — threshold gate -------------------------------------------
  it('18: on-topic query → grounded with Topic A first', async () => {
    const outcome = applyThreshold(await retrieve(ON_TOPIC_A, deps));
    expect(outcome.kind).toBe('grounded');
    if (outcome.kind === 'grounded') {
      expect(outcome.chunks.length).toBeGreaterThan(0);
      expect(outcome.chunks[0].chunk.slug).toBe(TOPIC_A_SLUG);
    }
  });

  it('19: off-topic/nonsense query → idk with capped near-misses', async () => {
    const outcome = applyThreshold(await retrieve(OFF_TOPIC, deps));
    expect(outcome.kind).toBe('idk');
    if (outcome.kind === 'idk') {
      expect(outcome.nearMisses.length).toBeLessThanOrEqual(
        DEFAULT_MAX_NEAR_MISSES
      );
    }
  });

  it('20: NFR-4 — the LLM is never invoked below threshold, and once when grounded', async () => {
    const runGuarded = async (query: string): Promise<number> => {
      const llm = new FakeLLMProvider();
      const outcome = applyThreshold(await retrieve(query, deps));
      const out: string[] = [];
      if (outcome.kind === 'grounded') {
        const req: LlmRequest = {
          system: 'Answer only from the cited context.',
          messages: [{ role: 'user', content: query }],
        };
        for await (const part of llm.stream(req)) out.push(part);
        expect(out.length).toBeGreaterThan(0);
      }
      return llm.callCount;
    };
    expect(await runGuarded(OFF_TOPIC)).toBe(0);
    expect(await runGuarded(ON_TOPIC_A)).toBe(1);
  });

  it('21: boundary is exactly >= and keyed on cosine (derived from observed topSimilarity)', async () => {
    const result = await retrieve(ON_TOPIC_A, deps);
    const s = result.topSimilarity;
    expect(applyThreshold(result, { threshold: s - 0.01 }).kind).toBe(
      'grounded'
    );
    expect(applyThreshold(result, { threshold: s }).kind).toBe('grounded'); // >= boundary
    expect(applyThreshold(result, { threshold: s + 0.01 }).kind).toBe('idk');
  });

  it('22: near-misses are ordered by vectorSimilarity desc and capped at maxNearMisses', async () => {
    const result = await retrieve(OFF_TOPIC, deps);
    const outcome = applyThreshold(result, { threshold: 1, maxNearMisses: 2 });
    expect(outcome.kind).toBe('idk');
    if (outcome.kind === 'idk') {
      expect(outcome.nearMisses.length).toBeLessThanOrEqual(2);
      for (let i = 1; i < outcome.nearMisses.length; i++) {
        expect(
          outcome.nearMisses[i - 1].vectorSimilarity
        ).toBeGreaterThanOrEqual(outcome.nearMisses[i].vectorSimilarity);
      }
    }
  });

  // -- createRetriever wiring smoke + dimension guard (C5) -----------------
  it('createRetriever wires a working retriever over the artifact', async () => {
    const retriever = createRetriever(artifact, { embedder });
    const outcome = applyThreshold(await retriever.retrieve(ON_TOPIC_A));
    expect(outcome.kind).toBe('grounded');
  });

  it('createRetriever throws up front on an embedder/artifact dimension mismatch', () => {
    expect(() =>
      createRetriever(artifact, { embedder: new FakeEmbedder(64) })
    ).toThrow(/dimensions/);
  });
});

// ---------------------------------------------------------------------------
// Group F — artifact / fixtures sanity
// ---------------------------------------------------------------------------
describe('fixture artifact', () => {
  let artifact: IndexArtifact;

  beforeAll(async () => {
    artifact = await buildFixtureArtifact();
  });

  it('23: every chunk embedding length equals artifact.dimensions', () => {
    for (const chunk of artifact.chunks) {
      expect(chunk.embedding.length).toBe(artifact.dimensions);
    }
  });

  it('24: sourceHashes covers every distinct slug; version 1; both langs present', () => {
    expect(artifact.version).toBe(1);
    const slugs = new Set(artifact.chunks.map((c) => c.slug));
    for (const slug of slugs) {
      expect(artifact.sourceHashes[slug]).toBeDefined();
    }
    const langs = new Set(FIXTURE_CHUNK_SEEDS.map((s) => s.lang));
    expect(langs.has('fr')).toBe(true);
    expect(langs.has('en')).toBe(true);
  });
});
