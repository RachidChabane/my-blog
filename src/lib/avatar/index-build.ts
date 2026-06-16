// Server-only: do not import in client-side islands.
//
// The deploy-time avatar index builder (task 18): a filesystem loader for the
// published corpus + the incremental, hash-keyed `buildIndex` core. Reuses
// unchanged slugs' embeddings, re-embeds changed ones, drops stale ones — and
// sorts deterministically so "build twice = deep-equal". Uses node:* + the
// pinned content schemas + the pure chunker. RELATIVE imports only (tsx/vitest
// ignore the `@/` alias in script-driven code).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { localePath } from '../../i18n/index';
import type { Locale } from '../../i18n/index';
import {
  articleFrontmatterSchema,
  projectFrontmatterSchema,
  knowledgeFrontmatterSchema,
} from '../../content/schemas';
import { CHUNKER_VERSION, chunkDocument } from './chunk';
import type { ChunkSeed } from './chunk';
import type { Embedder, IndexArtifact, IndexChunk } from './contracts';

/** Mirrors astro.config.mjs `site` default so baked citation origins never drift. */
const DEFAULT_SITE_URL = 'https://rachid-chabane.com';

export type SourceKind = 'article' | 'project' | 'knowledge';

/** One published source variant, normalized to the chunker's inputs. */
export interface SourceDoc {
  kind: SourceKind;
  slug: string;
  lang: Locale;
  /** article.title | project.name */
  title: string;
  /** project.summary | '' for articles */
  summary: string;
  /** frontmatter-stripped markdown */
  body: string;
  /** absolute canonical page URL, no fragment */
  pageUrl: string;
}

export interface LoadOptions {
  /** Defaults to <repo>/src/content (resolved from import.meta.url). */
  contentRoot?: string;
  /** Defaults to process.env.SITE_URL ?? DEFAULT_SITE_URL. */
  siteUrl?: string;
}

export interface BuildStats {
  embeddedSlugs: string[];
  reusedSlugs: string[];
  droppedSlugs: string[];
  embeddedChunks: number;
  reusedChunks: number;
  totalChunks: number;
}

export interface BuildResult {
  artifact: IndexArtifact;
  stats: BuildStats;
}

export interface BuildInput {
  sources: SourceDoc[];
  embedder: Embedder;
  prior?: IndexArtifact | null;
  /** Injected (script: new Date().toISOString(); tests: a literal). */
  generatedAt: string;
}

/** Read one flat content subdir's `*.md` files (sorted). Missing dir → []. */
function readMarkdownDir(dir: string): { path: string; raw: string }[] {
  if (!existsSync(dir)) return [];
  // Non-recursive: articles/ and projects/ are flat (mirrors the live tree and
  // avoids the Node Dirent.path/parentPath wrinkle of a recursive read).
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort()
    .map((name) => {
      const path = join(dir, name);
      return { path, raw: readFileSync(path, 'utf8') };
    });
}

/**
 * Load every PUBLISHED article + project + knowledge doc as a SourceDoc. Scoped
 * to `articles/`, `projects/`, and `knowledge/` only — never the whole content
 * tree (which holds test fixtures + tags). `knowledge/` is an avatar-only source
 * (the agent's bio + how-the-site-works grounding); it is NOT an Astro collection,
 * so it never renders a page — its chunks cite an existing page (sourcePath, e.g.
 * the About page). Frontmatter is parsed with gray-matter and validated with the
 * PINNED Zod schemas; an invalid file throws (mirrors Astro's build-time
 * fail-loud). Drafts are excluded — the public-safety filter (the artifact is
 * served publicly; NFR-6/FR-D3). Returned sorted by slug for determinism.
 */
export function loadPublishedSources(opts: LoadOptions = {}): SourceDoc[] {
  const contentRoot =
    opts.contentRoot ??
    join(dirname(fileURLToPath(import.meta.url)), '../../content');
  const siteUrl = opts.siteUrl ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;

  const docs: SourceDoc[] = [];

  for (const { path, raw } of readMarkdownDir(join(contentRoot, 'articles'))) {
    const { data, content } = matter(raw);
    const parsed = articleFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid article frontmatter in ${path}: ${parsed.error.message}`
      );
    }
    const fm = parsed.data;
    if (fm.publishState !== 'published') continue;
    docs.push({
      kind: 'article',
      slug: fm.slug,
      lang: fm.lang,
      title: fm.title,
      summary: '',
      body: content,
      pageUrl: new URL(localePath(fm.lang, `blog/${fm.slug}`), siteUrl).href,
    });
  }

  for (const { path, raw } of readMarkdownDir(join(contentRoot, 'projects'))) {
    const { data, content } = matter(raw);
    const parsed = projectFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid project frontmatter in ${path}: ${parsed.error.message}`
      );
    }
    const fm = parsed.data;
    if (fm.publishState !== 'published') continue;
    docs.push({
      kind: 'project',
      slug: fm.slug,
      lang: fm.lang,
      title: fm.name,
      summary: fm.summary,
      body: content,
      pageUrl: new URL(localePath(fm.lang, `work/${fm.slug}`), siteUrl).href,
    });
  }

  for (const { path, raw } of readMarkdownDir(join(contentRoot, 'knowledge'))) {
    const { data, content } = matter(raw);
    const parsed = knowledgeFrontmatterSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(
        `Invalid knowledge frontmatter in ${path}: ${parsed.error.message}`
      );
    }
    const fm = parsed.data;
    if (fm.publishState !== 'published') continue;
    docs.push({
      kind: 'knowledge',
      slug: fm.slug,
      lang: fm.lang,
      title: fm.title,
      summary: '',
      body: content,
      // No own page: the citation points at an existing page (e.g. About) that
      // genuinely carries this material, resolved through the SAME localePath the
      // article/project citations use.
      pageUrl: new URL(localePath(fm.lang, fm.sourcePath), siteUrl).href,
    });
  }

  return docs.sort((a, b) => a.slug.localeCompare(b.slug));
}

/**
 * Per-slug content hash — the incremental-reindex key. Covers EXACTLY the chunk
 * inputs (title + summary + body) plus CHUNKER_VERSION, so a chunker logic bump
 * forces a full re-embed even when the source text is unchanged. We compute our
 * own hash rather than reuse the article frontmatter `contentHash` field
 * because (a) projects have no such field, and (b) the index hash must track the
 * chunker's actual inputs. Exported — task 21's reindex reuses it.
 */
export function contentHashOf(doc: SourceDoc): string {
  return createHash('sha256')
    .update(`${CHUNKER_VERSION}\n${doc.title}\n${doc.summary}\n${doc.body}`)
    .digest('hex');
}

/** Extract the trailing `#${ordinal}` from a chunk id for deterministic sort. */
function ordinalOf(id: string): number {
  const tail = id.split('#').pop();
  const n = tail === undefined ? NaN : Number(tail);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Build the index artifact incrementally from `sources`.
 *
 * Reuse rule: a slug whose content hash is unchanged from a usable prior keeps
 * its prior chunks (and their embeddings) verbatim — no re-embed. Only changed
 * or new slugs are embedded, in a SINGLE batched `embed()` call. Stale slugs
 * (in prior, absent now) are dropped. The final chunk list is sorted by
 * (slug asc, ordinal asc) so the artifact is identical regardless of which
 * chunks took the reuse path — guaranteeing "build twice = deep-equal".
 */
export async function buildIndex(input: BuildInput): Promise<BuildResult> {
  const { sources, embedder, prior, generatedAt } = input;

  // 1. Duplicate-slug guard — slug is the GLOBAL sourceHashes/citation key.
  const seenSlugs = new Set<string>();
  for (const doc of sources) {
    if (seenSlugs.has(doc.slug)) {
      throw new Error(
        `buildIndex: duplicate slug "${doc.slug}" — slugs must be globally unique across articles + projects + knowledge.`
      );
    }
    seenSlugs.add(doc.slug);
  }

  // 2. A prior is reusable only if its shape + embedder identity still match;
  //    any change invalidates all reuse (the vectors would be incomparable).
  const priorUsable =
    !!prior &&
    prior.version === 1 &&
    prior.embeddingModel === embedder.model &&
    prior.dimensions === embedder.dimensions;
  // Capture the non-null prior fields once (sidesteps TS narrowing on the bool).
  const priorHashes: Record<string, string> =
    priorUsable && prior ? prior.sourceHashes : {};
  const priorBySlug = new Map<string, IndexChunk[]>();
  if (priorUsable && prior) {
    for (const chunk of prior.chunks) {
      const list = priorBySlug.get(chunk.slug);
      if (list) list.push(chunk);
      else priorBySlug.set(chunk.slug, [chunk]);
    }
  }

  // 3. Walk sources: reuse unchanged slugs, queue changed/new ones for embedding.
  const sourceHashes: Record<string, string> = {};
  const reused: IndexChunk[] = [];
  const toEmbed: ChunkSeed[] = [];
  const embeddedSlugs: string[] = [];
  const reusedSlugs: string[] = [];
  let reusedChunks = 0;

  for (const doc of sources) {
    const hash = contentHashOf(doc);
    sourceHashes[doc.slug] = hash;

    const priorChunks = priorBySlug.get(doc.slug);
    if (priorChunks && priorHashes[doc.slug] === hash) {
      reused.push(...priorChunks); // preserve embeddings verbatim
      reusedChunks += priorChunks.length;
      reusedSlugs.push(doc.slug);
    } else {
      toEmbed.push(...chunkDocument(doc));
      embeddedSlugs.push(doc.slug);
    }
  }

  // 4. Batch-embed all queued seeds in ONE order-preserving call; zip vectors back.
  const embedded: IndexChunk[] = [];
  if (toEmbed.length > 0) {
    const vectors = await embedder.embed(toEmbed.map((s) => s.text));
    if (vectors.length !== toEmbed.length) {
      throw new Error(
        `buildIndex: embedder returned ${vectors.length} vectors for ${toEmbed.length} texts.`
      );
    }
    for (let i = 0; i < toEmbed.length; i++) {
      const embedding = vectors[i];
      if (embedding.length !== embedder.dimensions) {
        throw new Error(
          `buildIndex: embedding length ${embedding.length} != dimensions ${embedder.dimensions} for chunk ${toEmbed[i].id}.`
        );
      }
      embedded.push({ ...toEmbed[i], embedding });
    }
  }

  // 5. Stale slugs: present in prior, absent now → implicitly deleted.
  const currentSlugs = new Set(sources.map((d) => d.slug));
  const droppedSlugs = Object.keys(prior?.sourceHashes ?? {}).filter(
    (slug) => !currentSlugs.has(slug)
  );

  // 6. Combine + deterministic sort (slug asc, ordinal asc).
  const chunks = [...reused, ...embedded].sort((a, b) =>
    a.slug !== b.slug
      ? a.slug.localeCompare(b.slug)
      : ordinalOf(a.id) - ordinalOf(b.id)
  );

  const artifact: IndexArtifact = {
    version: 1,
    embeddingModel: embedder.model,
    dimensions: embedder.dimensions,
    generatedAt,
    sourceHashes,
    chunks,
  };

  const stats: BuildStats = {
    embeddedSlugs,
    reusedSlugs,
    droppedSlugs,
    embeddedChunks: embedded.length,
    reusedChunks,
    totalChunks: chunks.length,
  };

  return { artifact, stats };
}
