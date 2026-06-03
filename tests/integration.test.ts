/**
 * Whole-system integration invariants (task 29). UNIQUE VALUE over the per-unit
 * suites: these run against the REAL seed corpus (src/content/articles +
 * projects + tags), which inline-fixture unit tests and browser e2e can't assert,
 * plus a minimal avatar NFR-4 pipeline lock. Pure Node + vitest (no browser).
 *
 * Frontmatter is read RAW with gray-matter and cast to the pinned frontmatter
 * types — NOT Zod-validated here (the build already validates via schemas.ts).
 * These structural invariants are a cheap, fast-feedback cross-check on the raw
 * corpus, independent of the build. Reuses the pure helpers from @/lib/content.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type {
  ArticleFrontmatter,
  ProjectFrontmatter,
  Tag,
} from '@/content/schemas';
import type { Locale } from '@/i18n/index';
import type { ArticleEntryLike, ProjectEntryLike } from '@/lib/content';
import {
  getPublishedArticles,
  buildSlugMap,
  unknownArticleTags,
  getPublishedProjects,
  getRelatedArticles,
} from '@/lib/content';

// Avatar pipeline (compose exactly as the endpoint does — fakes only, no secrets).
import {
  FakeEmbedder,
  FakeLLMProvider,
  buildFixtureArtifact,
} from '@/lib/avatar/fakes';
import { createRetriever } from '@/lib/avatar/retrieval';
import { parseSSE } from '@/lib/avatar/protocol';
import { handleAvatarQuery } from '../functions/api/avatar/query';
import type { AvatarRetriever } from '../functions/api/avatar/query';

const LOCALES: Locale[] = ['fr', 'en'];

const contentPath = (p: string): string =>
  fileURLToPath(new URL(`../src/content/${p}`, import.meta.url));

/** Read a flat content subdir's *.md (sorted) → raw {id, body, data}. */
function readMd(sub: string): { id: string; body: string; data: unknown }[] {
  const dir = contentPath(sub);
  return readdirSync(dir)
    .filter((n) => n.endsWith('.md'))
    .sort()
    .map((name) => {
      const { data, content } = matter(readFileSync(`${dir}/${name}`, 'utf8'));
      return { id: name.replace(/\.md$/, ''), body: content, data };
    });
}

function loadArticles(): ArticleEntryLike[] {
  return readMd('articles').map((e) => ({
    id: e.id,
    body: e.body,
    data: e.data as ArticleFrontmatter,
  }));
}

function loadProjects(): ProjectEntryLike[] {
  return readMd('projects').map((e) => ({
    id: e.id,
    data: e.data as ProjectFrontmatter,
  }));
}

const TAGS = JSON.parse(
  readFileSync(contentPath('tags/index.json'), 'utf8')
) as Tag[];

let articles: ArticleEntryLike[];
let projects: ProjectEntryLike[];

beforeAll(() => {
  articles = loadArticles();
  projects = loadProjects();
});

/** Published `lang` codes carrying `key`, sorted — generic over article/project. */
function publishedLangs(
  entries: {
    data: { translationKey: string; lang: string; publishState: string };
  }[],
  key: string
): string[] {
  return entries
    .filter(
      (e) =>
        e.data.translationKey === key && e.data.publishState === 'published'
    )
    .map((e) => e.data.lang)
    .sort();
}

const publishedKeys = (
  entries: { data: { translationKey: string; publishState: string } }[]
): string[] => [
  ...new Set(
    entries
      .filter((e) => e.data.publishState === 'published')
      .map((e) => e.data.translationKey)
  ),
];

describe('corpus invariants (real seeds)', () => {
  // A. Bilingual parity (INV-1 / NFR-11 backbone): the data proof behind
  // "switcher never dead-ends" that browser e2e only spot-checks.
  it('A: every published article translationKey is published in BOTH fr and en', () => {
    expect(publishedKeys(articles).length).toBeGreaterThan(0);
    for (const key of publishedKeys(articles)) {
      // buildSlugMap only includes PUBLISHED counterparts per lang.
      expect(Object.keys(buildSlugMap(articles, key)).sort()).toEqual([
        'en',
        'fr',
      ]);
    }
  });

  it('A: every published project translationKey is published in BOTH fr and en', () => {
    expect(publishedKeys(projects).length).toBeGreaterThan(0);
    for (const key of publishedKeys(projects)) {
      expect(publishedLangs(projects, key)).toEqual(['en', 'fr']);
    }
  });

  // B. Tag-vocabulary closure: no orphan tag → no dangling chip / build throw.
  it('B: every published-article tag is in the curated vocabulary (both langs)', () => {
    for (const lang of LOCALES) {
      expect(unknownArticleTags(articles, TAGS, lang)).toEqual([]);
    }
  });

  // C. Sources present + http(s). Partly redundant with build-time Zod
  // (sources.min(2) + ^https?:// in schemas.ts) — kept as a cheap raw-frontmatter
  // cross-check; not expected to catch anything a successful build wouldn't.
  it('C: every published article has >=2 sources, all http(s) URLs', () => {
    for (const lang of LOCALES) {
      for (const a of getPublishedArticles(articles, lang)) {
        expect(a.data.sources.length).toBeGreaterThanOrEqual(2);
        for (const s of a.data.sources) {
          expect(s.url).toMatch(/^https?:\/\//);
        }
      }
    }
  });

  // D. Slug uniqueness per lang (route-collision guard).
  it('D: no two published articles (resp. projects) share a slug within a lang', () => {
    for (const lang of LOCALES) {
      const aSlugs = getPublishedArticles(articles, lang).map(
        (e) => e.data.slug
      );
      expect(new Set(aSlugs).size).toBe(aSlugs.length);
      const pSlugs = getPublishedProjects(projects, lang).map(
        (e) => e.data.slug
      );
      expect(new Set(pSlugs).size).toBe(pSlugs.length);
    }
  });

  // E. relatedArticles resolve (INV-3). getRelatedArticles DROPS unresolved keys
  // silently, so assert by LENGTH (a non-empty check would pass a partial resolve).
  it('E: every project relatedArticles key resolves to a published article in BOTH langs', () => {
    let exercised = 0;
    for (const lang of LOCALES) {
      for (const p of getPublishedProjects(projects, lang)) {
        const keys = p.data.relatedArticles;
        if (!keys || keys.length === 0) continue;
        exercised += 1;
        expect(getRelatedArticles(articles, keys, lang)).toHaveLength(
          keys.length
        );
      }
    }
    // Non-vacuous: at least one project (mcp-secrets-vault) carries relatedArticles.
    expect(exercised).toBeGreaterThan(0);
  });
});

// F. Avatar pipeline NFR-4 lock (minimal). Canonical, exhaustive coverage lives in
// tests/avatar-endpoint.test.ts; this is the whole-system NFR-4 smoke. The fake
// embedder is MONOLINGUAL — query and target chunk must share a language; never
// expect a FR query to match an EN chunk here (memory select-dedup-fake-embedder).
const ON_TOPIC_A = 'hybrid retrieval embeddings reranking';
const OFF_TOPIC = 'zzz quantum knitting saxophone';

async function drain(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let out = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    out += dec.decode(value, { stream: true });
  }
  return out;
}

const post = (body: unknown): Request =>
  new Request('https://x/api/avatar/query', {
    method: 'POST',
    body: JSON.stringify(body),
  });

describe('avatar NFR-4 pipeline lock', () => {
  let retriever: AvatarRetriever;

  beforeAll(async () => {
    const embedder = new FakeEmbedder();
    const artifact = await buildFixtureArtifact(embedder);
    retriever = createRetriever(artifact, { embedder });
  });

  it('grounded: on-topic → sources-first, >=1 token, done grounded, synthesis called once', async () => {
    const llm = new FakeLLMProvider();
    const res = await handleAvatarQuery(
      post({ query: ON_TOPIC_A, lang: 'en' }),
      { retriever, llm }
    );
    expect(res.status).toBe(200);
    const frames = parseSSE(await drain(res));
    const sources = frames.find((f) => f.event === 'sources')?.data as
      | { citations: unknown[] }
      | undefined;
    expect(sources?.citations.length).toBeGreaterThan(0);
    expect(frames.some((f) => f.event === 'token')).toBe(true);
    const done = frames.find((f) => f.event === 'done')?.data as {
      finishReason: string;
    };
    expect(done.finishReason).toBe('grounded');
    expect(llm.callCount).toBe(1);
  });

  it('idk: off-topic → idk frame, NO sources/token, done idk, synthesis NOT called (threshold short-circuits)', async () => {
    const llm = new FakeLLMProvider();
    const res = await handleAvatarQuery(
      post({ query: OFF_TOPIC, lang: 'en' }),
      { retriever, llm }
    );
    expect(res.status).toBe(200);
    const frames = parseSSE(await drain(res));
    expect(frames.some((f) => f.event === 'idk')).toBe(true);
    expect(frames.some((f) => f.event === 'sources')).toBe(false);
    expect(frames.some((f) => f.event === 'token')).toBe(false);
    const done = frames.find((f) => f.event === 'done')?.data as {
      finishReason: string;
    };
    expect(done.finishReason).toBe('idk');
    // The threshold gate MUST short-circuit BEFORE the synthesis LLM (NFR-4).
    expect(llm.callCount).toBe(0);
  });
});
