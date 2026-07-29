import { describe, it, expect, beforeAll } from 'vitest';
import type { IndexArtifact } from '@/lib/avatar/contracts';
import { FakeEmbedder, buildFixtureArtifact } from '@/lib/avatar/fakes';
import { createRetriever } from '@/lib/avatar/retrieval';
import type { RetrieveOptions } from '@/lib/avatar/retrieval';
import { cosineSimilarity } from '@/lib/avatar/vector-store';
import { applyThreshold } from '@/lib/avatar/threshold';
import { validateQueryRequest } from '@/lib/avatar/guard';
import { handleAvatarQuery } from '../functions/api/avatar/query';
import type { AvatarRetriever } from '../functions/api/avatar/query';
import type { RetrievalResult } from '@/lib/avatar/contracts';
import { FakeLLMProvider } from '@/lib/avatar/fakes';

// Option 4: per-article scoping (scopeSlug) + the topSimilarity gate-correctness fix.
const ON_TOPIC_A = 'hybrid retrieval embeddings reranking'; // calibrated to Topic A (EN)
const TOPIC_A = 'hybrid-rag-retrieval';
const TOPIC_B = 'astro-cloudflare-deploy';

const post = (body: unknown): Request =>
  new Request('https://x/api/avatar/query', {
    method: 'POST',
    body: JSON.stringify(body),
  });

let embedder: FakeEmbedder;
let artifact: IndexArtifact;
let retriever: ReturnType<typeof createRetriever>;

beforeAll(async () => {
  embedder = new FakeEmbedder();
  artifact = await buildFixtureArtifact(embedder);
  retriever = createRetriever(artifact, { embedder });
});

describe('guard — scopeSlug validation', () => {
  it('accepts a well-formed slug and carries it through', () => {
    const v = validateQueryRequest({ query: 'hi', scopeSlug: TOPIC_A });
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.scopeSlug).toBe(TOPIC_A);
  });

  it('omits scopeSlug when absent (corpus-wide)', () => {
    const v = validateQueryRequest({ query: 'hi' });
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.scopeSlug).toBeUndefined();
  });

  it('rejects malformed slugs with 400', () => {
    for (const bad of [
      'Has Caps',
      'with space',
      '-leading',
      'trailing-',
      'a/b',
      'under_score',
      'x'.repeat(200),
    ]) {
      const v = validateQueryRequest({ query: 'hi', scopeSlug: bad });
      expect(v.ok, bad).toBe(false);
    }
  });
});

describe('retrieval — scope filter restricts to one article', () => {
  it('scoped on-topic query returns only the scoped slug, grounded', async () => {
    const r = await retriever.retrieve(ON_TOPIC_A, { scopeSlug: TOPIC_A });
    expect(r.candidates.length).toBeGreaterThan(0);
    expect(r.candidates.every((c) => c.chunk.slug === TOPIC_A)).toBe(true);
    expect(applyThreshold(r).kind).toBe('grounded');
  });

  it('scoping to a slug with no chunks → topSimilarity 0 → honest refusal', async () => {
    const r = await retriever.retrieve(ON_TOPIC_A, {
      scopeSlug: 'no-such-article',
    });
    expect(r.candidates).toEqual([]);
    expect(r.topSimilarity).toBe(0);
    expect(applyThreshold(r).kind).toBe('idk');
  });

  it('unscoped behavior is unchanged (corpus-wide, Topic A first)', async () => {
    const r = await retriever.retrieve(ON_TOPIC_A);
    expect(applyThreshold(r).kind).toBe('grounded');
    expect(r.candidates[0].chunk.slug).toBe(TOPIC_A);
  });
});

describe('retrieval — gate-correctness fix (topSimilarity over the SCOPED subset)', () => {
  it('the scoped gate signal is the in-scope max cosine, not the global max', async () => {
    const qVec = await embedder.embedQuery(ON_TOPIC_A);
    const topicBMax = Math.max(
      ...artifact.chunks
        .filter((c) => c.slug === TOPIC_B)
        .map((c) => cosineSimilarity(qVec, c.embedding))
    );

    const unscoped = await retriever.retrieve(ON_TOPIC_A); // global max = Topic A
    const scopedB = await retriever.retrieve(ON_TOPIC_A, {
      scopeSlug: TOPIC_B,
    });

    // The gate signal under scope is Topic B's max cosine — NOT the global (Topic A) max.
    // Without the fix, topSimilarity would stay the global max and a Topic-B-scoped query
    // would dishonestly pass the gate on an out-of-scope chunk.
    expect(scopedB.topSimilarity).toBeCloseTo(topicBMax, 5);
    expect(scopedB.topSimilarity).toBeLessThan(unscoped.topSimilarity);
    expect(scopedB.candidates.every((c) => c.chunk.slug === TOPIC_B)).toBe(
      true
    );
  });
});

// REGRESSION (the "avatar stopped answering on most articles" bug). The scoped path
// used to pull a corpus-wide top-k and filter it by slug afterwards. That is exact only
// while the corpus fits inside the pull; past it, a scoped article's chunks stop making
// the global cut, `topSimilarity` collapses to a weak leftover chunk (or to 0), and the
// gate refuses on-article questions. These lock the pre-filter: the scoped result must
// be the ARTICLE's top-k, and must not vary with how big the rest of the corpus is.
describe('retrieval — scoping is a pre-filter, not a post-filter', () => {
  const TARGET = 'target-article';
  const QUERY = 'alpha beta gamma';

  /** Target chunks share ONE query token; every filler matches all three, so the
   *  fillers own the corpus-wide ranking and crowd the target out of any global top-k. */
  async function buildCrowdedArtifact(
    fillerCount: number
  ): Promise<IndexArtifact> {
    const emb = new FakeEmbedder();
    const seeds = [
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `${TARGET}#s${i}#${i}`,
        slug: TARGET,
        lang: 'en' as const,
        sourceUrl: `https://x/en/blog/${TARGET}/`,
        headingAnchor: `s${i}`,
        title: 'Target article',
        text: `alpha delta${i} epsilon${i}`,
      })),
      ...Array.from({ length: fillerCount }, (_, i) => ({
        id: `filler-${i}#s#0`,
        slug: `filler-${i}`,
        lang: 'en' as const,
        sourceUrl: `https://x/en/blog/filler-${i}/`,
        headingAnchor: 's',
        title: `Filler ${i}`,
        text: 'alpha beta gamma',
      })),
    ];
    const embeddings = await emb.embed(seeds.map((s) => s.text));
    return {
      version: 1,
      chunks: seeds.map((s, i) => ({ ...s, embedding: embeddings[i] })),
      dimensions: emb.dimensions,
      embeddingModel: emb.model,
      generatedAt: '2026-01-01T00:00:00.000Z',
      sourceHashes: Object.fromEntries(
        seeds.map((s) => [s.slug, `sha256:${s.slug}`])
      ),
    };
  }

  it('a corpus far wider than the leg pull still grounds an on-article query', async () => {
    const emb = new FakeEmbedder();
    // 400 fillers >> the default leg pull (30) and >> the old scoped pull (100).
    const artifact = await buildCrowdedArtifact(400);
    const r = await createRetriever(artifact, { embedder: emb }).retrieve(
      QUERY,
      { scopeSlug: TARGET }
    );

    const qVec = await emb.embedQuery(QUERY);
    const trueMax = Math.max(
      ...artifact.chunks
        .filter((c) => c.slug === TARGET)
        .map((c) => cosineSimilarity(qVec, c.embedding))
    );

    expect(r.candidates.length).toBeGreaterThan(0);
    expect(r.candidates.every((c) => c.chunk.slug === TARGET)).toBe(true);
    // The article's OWN best chunk reaches the gate — not a leftover that survived a
    // global cut, and not nothing. Under the old post-filter this was 0.
    expect(r.topSimilarity).toBeCloseTo(trueMax, 5);
    expect(applyThreshold(r).kind).toBe('grounded');
  });

  it('the scoped gate signal is independent of corpus size', async () => {
    const emb = new FakeEmbedder();
    const [small, large] = await Promise.all([
      buildCrowdedArtifact(5),
      buildCrowdedArtifact(500),
    ]);
    const scoped = (a: IndexArtifact): Promise<RetrievalResult> =>
      createRetriever(a, { embedder: emb }).retrieve(QUERY, {
        scopeSlug: TARGET,
      });
    const [rSmall, rLarge] = await Promise.all([scoped(small), scoped(large)]);
    expect(rLarge.topSimilarity).toBeCloseTo(rSmall.topSimilarity, 10);
    expect(rLarge.candidates.map((c) => c.chunk.id)).toEqual(
      rSmall.candidates.map((c) => c.chunk.id)
    );
  });
});

describe('handler — threads scopeSlug into retrieve, gated by the guard', () => {
  class Recorder implements AvatarRetriever {
    lastOpts: RetrieveOptions | undefined = undefined;
    called = false;
    retrieve(query: string, opts?: RetrieveOptions): Promise<RetrievalResult> {
      this.called = true;
      this.lastOpts = opts;
      return Promise.resolve({ query, candidates: [], topSimilarity: 0 });
    }
  }

  it('passes a valid scopeSlug through to retrieve opts', async () => {
    const rec = new Recorder();
    await handleAvatarQuery(post({ query: ON_TOPIC_A, scopeSlug: TOPIC_A }), {
      retriever: rec,
      llm: new FakeLLMProvider(),
    });
    expect(rec.lastOpts?.scopeSlug).toBe(TOPIC_A);
  });

  it('leaves opts corpus-wide when no scopeSlug is sent', async () => {
    const rec = new Recorder();
    await handleAvatarQuery(post({ query: ON_TOPIC_A }), {
      retriever: rec,
      llm: new FakeLLMProvider(),
    });
    expect(rec.lastOpts?.scopeSlug).toBeUndefined();
  });

  it('rejects an invalid scopeSlug with 400 before retrieval runs', async () => {
    const rec = new Recorder();
    const res = await handleAvatarQuery(
      post({ query: ON_TOPIC_A, scopeSlug: 'BAD SLUG' }),
      { retriever: rec, llm: new FakeLLMProvider() }
    );
    expect(res.status).toBe(400);
    expect(rec.called).toBe(false);
  });
});
