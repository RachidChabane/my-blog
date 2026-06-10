// Server-only: do not import in client-side islands.
//
// Pure, markdown-section-aware chunker for the avatar index builder (task 18).
// Turns one published source variant (frontmatter already stripped + validated)
// into IndexChunk seeds (everything except the embedding). No FS, no Astro, no
// Date/Math.random — fully deterministic, a pure function of its input.
//
// Heading anchors are produced with github-slugger, the SAME lib Astro's
// rehypeHeadingIds uses (transitive via @astrojs/markdown-remark), and a FRESH
// slugger per document (its dedup counters reset per page) — so the citation
// fragment matches the rendered <h_ id="…">. A mismatch only degrades a citation
// to a page-level link (graceful), never a build break.
//
// Parity VERIFIED (task 18 §8) against `astro build` output: headings
// "Hybrid Retrieval" / "Récupération du modèle" / "Code & Config" / "Test" /
// "Test" rendered ids hybrid-retrieval / récupération-du-modèle / code--config /
// test / test-1 — identical to new GithubSlugger().slug(text) in document order.

import GithubSlugger from 'github-slugger';
import type { IndexChunk } from './contracts';

/** Bump when chunking LOGIC changes; folded into the content hash (index-build)
 *  so a logic change forces a full re-embed even when source text is unchanged. */
export const CHUNKER_VERSION = 1;

/** Soft per-chunk size cap; longer sections are paragraph-split. */
export const MAX_CHUNK_CHARS = 1200;

/** A chunk without its embedding (the builder fills `embedding` after embed()). */
export type ChunkSeed = Omit<IndexChunk, 'embedding'>;

/** One published source variant (frontmatter already stripped + validated). */
export interface ChunkInput {
  slug: string;
  lang: 'fr' | 'en';
  /** Post title / project name → the lead chunk's title. */
  title: string;
  /** Project summary, prepended to the lead section; '' for articles. */
  summary: string;
  /** Markdown body (no frontmatter). */
  body: string;
  /** Absolute canonical page URL, NO fragment, e.g. https://site/en/blog/slug/ */
  pageUrl: string;
}

/**
 * Reduce markdown to retrieval-friendly plain text.
 *
 * - Drops fenced-code DELIMITER lines (``` / ~~~, optional lang tag) but KEEPS
 *   the code lines as text — identifiers are useful retrieval signal. (This
 *   differs from content.ts#excerpt, which strips code for reading-time. Kept
 *   self-contained here to avoid coupling the avatar lib to the article seam.)
 * - Strips inline markdown: images → '', `[text](url)` → `text`, inline `code`
 *   → `code`, emphasis `*`/`_` markers → '', leading heading/blockquote/list
 *   markers per line → ''.
 * - Collapses intra-line whitespace runs to one space (NEVER touching newlines),
 *   then collapses 3+ newlines to a single blank line so paragraph boundaries
 *   survive for the MAX_CHUNK_CHARS split.
 *
 * Regex hygiene: no control-char ranges; emits no emoji.
 */
function toPlainText(markdown: string): string {
  const out: string[] = [];
  for (const rawLine of markdown.split('\n')) {
    // Drop the fence delimiter itself; keep code content (handled as a normal line).
    if (/^\s*(```|~~~)/.test(rawLine)) continue;

    let line = rawLine;
    // Strip leading block markers, repeatedly (handles nesting like `> - item`).
    let prev: string;
    do {
      prev = line;
      line = line.replace(/^\s*(?:#{1,6}\s+|>\s?|[-*+]\s+|\d+\.\s+)/, '');
    } while (line !== prev);

    line = line
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images → ''
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // [text](url) → text
      .replace(/`([^`]*)`/g, '$1') // `code` → code
      .replace(/[*_]/g, '') // emphasis markers → ''
      .replace(/[ \t]+/g, ' ')
      .trim();

    out.push(line);
  }
  return out
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** A raw section: the lead (heading === null) or one `#…` heading block. */
interface RawSection {
  /** Raw heading markdown (capture after the `#`s), or null for the lead. */
  heading: string | null;
  /** Raw text block belonging to this section (excludes the heading line). */
  text: string;
}

/**
 * Split a markdown body into ordered sections, fence-aware: a `#{1,6} …` line
 * only starts a new section when NOT inside a ``` / ~~~ fence. Everything before
 * the first heading is the lead section (heading === null).
 */
function splitSections(body: string): RawSection[] {
  const sections: RawSection[] = [];
  let heading: string | null = null;
  let buf: string[] = [];
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      buf.push(line);
      continue;
    }
    const headingMatch = inFence ? null : /^#{1,6}\s+(.*)$/.exec(line);
    if (headingMatch) {
      sections.push({ heading, text: buf.join('\n') });
      heading = headingMatch[1];
      buf = [];
    } else {
      buf.push(line);
    }
  }
  sections.push({ heading, text: buf.join('\n') });
  return sections;
}

/** Accumulate paragraphs (blank-line separated) into pieces of ≤ `cap` chars.
 *  A single paragraph longer than `cap` becomes its own (oversized) piece. */
function splitByParagraph(text: string, cap: number): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const pieces: string[] = [];
  let buf = '';
  for (const para of paragraphs) {
    if (buf && buf.length + 2 + para.length > cap) {
      pieces.push(buf);
      buf = para;
    } else {
      buf = buf ? `${buf}\n\n${para}` : para;
    }
  }
  if (buf) pieces.push(buf);
  return pieces;
}

/**
 * Stateless convenience slugger (fresh instance → no cross-call dedup state).
 * Mirrors what `chunkDocument` does per heading, for tests/other callers.
 */
export function slugifyHeading(headingMarkdown: string): string {
  return new GithubSlugger().slug(toPlainText(headingMarkdown).trim());
}

const CHUNK_ID_MAX_BYTES = 64; // Cloudflare Vectorize vector-id + D1 chunks.id limit.

const byteLen = (s: string): number => new TextEncoder().encode(s).length;

/** Truncate `s` to at most `maxBytes` UTF-8 bytes, never splitting a character. */
function truncateToBytes(s: string, maxBytes: number): string {
  if (byteLen(s) <= maxBytes) return s;
  let out = '';
  for (const ch of s) {
    if (byteLen(out + ch) > maxBytes) break;
    out += ch;
  }
  return out;
}

/**
 * `${slug}#${anchor}#${ordinal}` capped at 64 bytes (the Vectorize vector-id / D1
 * chunks.id limit). The trailing `#${ordinal}` is ALWAYS preserved — it is parsed
 * downstream (ordinalOf / index-sink) and alone makes the id unique within a document
 * (chunkDocument's `ordinal` is a per-doc running counter) — so only the descriptive
 * `slug#anchor` prefix is truncated to fit. Short ids (the common case) pass through
 * verbatim, and the FULL anchor is still carried in sourceUrl/headingAnchor.
 */
function fitChunkId(slug: string, anchorSeg: string, ordinal: number): string {
  const suffix = `#${ordinal}`;
  const prefix = `${slug}#${anchorSeg}`;
  if (byteLen(`${prefix}${suffix}`) <= CHUNK_ID_MAX_BYTES)
    return `${prefix}${suffix}`;
  return `${truncateToBytes(prefix, CHUNK_ID_MAX_BYTES - byteLen(suffix))}${suffix}`;
}

/**
 * Chunk one source document into ordered ChunkSeeds. Lead section first
 * (project summary prepended), then each `#…` section in document order. A fresh
 * slugger per document gives per-page dedup parity with Astro; headings are
 * slugged in document order so `-1`/`-2` suffixes line up. Empty/whitespace
 * sections are skipped (no zero-text chunks); sections over MAX_CHUNK_CHARS are
 * paragraph-split, each piece sharing the section's anchor/title.
 */
export function chunkDocument(input: ChunkInput): ChunkSeed[] {
  const slugger = new GithubSlugger();
  const sections = splitSections(input.body);
  const seeds: ChunkSeed[] = [];
  let ordinal = 0;

  for (const section of sections) {
    let anchor = '';
    let title = input.title;
    let text: string;

    if (section.heading === null) {
      // Lead: prepend the project summary (present only for projects).
      const parts = [input.summary, section.text].filter((p) => p && p.trim());
      text = toPlainText(parts.join('\n\n'));
    } else {
      const plainHeading = toPlainText(section.heading).trim();
      anchor = slugger.slug(plainHeading); // consume in document order (dedup parity)
      title = plainHeading;
      text = toPlainText(section.text);
    }

    if (!text.trim()) continue; // skip empty/whitespace sections

    const pieces =
      text.length > MAX_CHUNK_CHARS
        ? splitByParagraph(text, MAX_CHUNK_CHARS)
        : [text];

    for (const piece of pieces) {
      const body = piece.trim();
      if (!body) continue;
      seeds.push({
        // `intro` placeholder for the anchorless lead; `ordinal` guarantees the
        // id is unique regardless. Matches the fixture's `…#intro#0` convention.
        id: fitChunkId(input.slug, anchor || 'intro', ordinal),
        slug: input.slug,
        lang: input.lang,
        sourceUrl: anchor ? `${input.pageUrl}#${anchor}` : input.pageUrl,
        headingAnchor: anchor,
        title,
        text: body,
      });
      ordinal += 1;
    }
  }
  return seeds;
}
