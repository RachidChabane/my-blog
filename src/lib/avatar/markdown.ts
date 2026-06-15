// Browser-only (uses `document`); never imported server-side. A small, dependency-
// free, SAFE Markdown renderer for the avatar's STREAMED prose.
//
// The model streams lightweight Markdown — paragraphs, ATX headings, bold/italic,
// inline code, ordered/unordered lists, blockquotes, links, and `[n]` citation
// markers. Fenced code/diagrams are stripped server-side into typed `artifact`
// frames (see lib/avatar/artifacts.ts), so this renderer never has to host a fence.
//
// EVERYTHING is built with document.createElement / textContent / createTextNode —
// there is NO markup sink (no innerHTML, no insertAdjacentHTML). Raw HTML in the
// stream (e.g. an injected `<script>` or `<img onerror>`) therefore renders as
// LITERAL TEXT, never as live markup (M-12 / NFR-7, locked by avatar-redteam). A
// link gets an href only when the caller's allow-list (isSafeHref) passes; a `[n]`
// marker links to its source only when the citation map yields a safe URL.

export interface MarkdownOptions {
  /** Allow-list gate for any href this renderer would set. */
  isSafeHref: (url: string) => boolean;
  /** Safe, ready-to-link URL for a `[n]` citation marker, or null to leave it inert. */
  citationHref?: (n: number) => string | null;
  /**
   * Accessible name for a `[n]` marker link (e.g. the cited source's title). The
   * visual brackets are CSS ::before/::after and the link text is the bare number,
   * which a screen reader would announce as just "1" — so we set an aria-label that
   * names the destination instead.
   */
  citationLabel?: (n: number) => string | null;
}

// ---- inline ----------------------------------------------------------------

const WORD = /\w/; // includes `_`, so underscore-emphasis stays out of words

/** A construct matched at the start of `s`: how many chars it ate + the node built. */
interface InlineMatch {
  consumed: number;
  node: Node;
}

/**
 * Try to match ONE inline construct anchored at the start of `s`. `prevChar` is the
 * character immediately before `s` in the source (''. at string start) — needed for
 * underscore word-boundary rules. Returns null when nothing matches here (the caller
 * then emits one literal char and re-scans), so the loop always makes progress.
 */
function matchInline(
  s: string,
  prevChar: string,
  opts: MarkdownOptions
): InlineMatch | null {
  // 1. inline code — verbatim, no nested parsing (so `**` inside code stays literal).
  const code = /^`([^`\n]+)`/.exec(s);
  if (code) {
    const el = document.createElement('code');
    el.className = 'rc-md-code';
    el.textContent = code[1];
    return { consumed: code[0].length, node: el };
  }

  // 2. link — `[label](url)`. Linked only if the URL passes the allow-list; otherwise
  //    the whole `[label](url)` renders as literal text (handled by returning null).
  const link = /^\[([^\]]*)\]\(([^)\s]+)\)/.exec(s);
  if (link) {
    if (opts.isSafeHref(link[2])) {
      const a = document.createElement('a');
      a.className = 'rc-md-link';
      a.href = link[2];
      a.rel = 'nofollow noopener';
      renderInline(link[1], a, opts);
      return { consumed: link[0].length, node: a };
    }
    // Unsafe scheme: keep the literal text so nothing is silently dropped.
    return { consumed: link[0].length, node: document.createTextNode(link[0]) };
  }

  // 3. citation marker — `[n]` NOT followed by `(` (that would be a link). Links to
  //    the cited source when the map yields a safe URL.
  const cite = /^\[(\d{1,3})\](?!\()/.exec(s);
  if (cite) {
    const n = Number(cite[1]);
    const sup = document.createElement('sup');
    sup.className = 'rc-md-cite';
    const href = opts.citationHref?.(n) ?? null;
    if (href && opts.isSafeHref(href)) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = cite[1];
      const label = opts.citationLabel?.(n) ?? null;
      if (label) a.setAttribute('aria-label', label); // names the source for SR users
      sup.append(a);
    } else {
      sup.textContent = cite[1];
    }
    return { consumed: cite[0].length, node: sup };
  }

  // 4. strong — `**…**` (asterisks: intraword allowed, CommonMark-style).
  const strongStar = /^\*\*(\S(?:[\s\S]*?\S)?)\*\*/.exec(s);
  if (strongStar) {
    const el = document.createElement('strong');
    renderInline(strongStar[1], el, opts);
    return { consumed: strongStar[0].length, node: el };
  }

  // 5. emphasis — `*…*`.
  const emStar = /^\*(\S(?:[\s\S]*?\S)?)\*/.exec(s);
  if (emStar) {
    const el = document.createElement('em');
    renderInline(emStar[1], el, opts);
    return { consumed: emStar[0].length, node: el };
  }

  // 6. strong — `__…__` (underscores: word-boundary gated, so `a__b__c` and
  //    `window.__pwned` never become emphasis).
  const strongUnder = /^__(\S(?:[\s\S]*?\S)?)__/.exec(s);
  if (
    strongUnder &&
    boundedByNonWord(prevChar, s[strongUnder[0].length] ?? '')
  ) {
    const el = document.createElement('strong');
    renderInline(strongUnder[1], el, opts);
    return { consumed: strongUnder[0].length, node: el };
  }

  // 7. emphasis — `_…_` (word-boundary gated).
  const emUnder = /^_(\S(?:[\s\S]*?\S)?)_/.exec(s);
  if (emUnder && boundedByNonWord(prevChar, s[emUnder[0].length] ?? '')) {
    const el = document.createElement('em');
    renderInline(emUnder[1], el, opts);
    return { consumed: emUnder[0].length, node: el };
  }

  return null;
}

/** Underscore emphasis is valid only when flanked by non-word chars (or string ends). */
function boundedByNonWord(prev: string, next: string): boolean {
  return (prev === '' || !WORD.test(prev)) && (next === '' || !WORD.test(next));
}

/** Render inline Markdown in `text` as child nodes of `parent` (append-only). */
export function renderInline(
  text: string,
  parent: Node,
  opts: MarkdownOptions
): void {
  let pending = '';
  const flush = (): void => {
    if (pending) {
      parent.appendChild(document.createTextNode(pending));
      pending = '';
    }
  };
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    // A construct can only start at one of these sentinels — cheap fast-path.
    if (ch === '`' || ch === '[' || ch === '*' || ch === '_') {
      const m = matchInline(text.slice(i), i > 0 ? text[i - 1] : '', opts);
      if (m) {
        flush();
        parent.appendChild(m.node);
        i += m.consumed;
        continue;
      }
    }
    pending += ch;
    i++;
  }
  flush();
}

// ---- blocks ----------------------------------------------------------------

const UL_ITEM = /^\s*[-*+]\s+(.*)$/;
const OL_ITEM = /^\s*(\d+)[.)]\s+(.*)$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;

/** Render ONE block of Markdown source (no surrounding blank lines) to an element. */
export function renderBlock(src: string, opts: MarkdownOptions): HTMLElement {
  const text = src.replace(/\s+$/, '');
  const lines = text.split('\n');
  const first = lines[0] ?? '';

  // Defensive code block — fences are normally stripped server-side, but if one
  // slips through, render it verbatim rather than as half-parsed prose.
  if (/^```/.test(first)) {
    const pre = document.createElement('pre');
    pre.className = 'rc-md-pre';
    const code = document.createElement('code');
    const body = lines
      .slice(1)
      .filter((l) => !/^```/.test(l))
      .join('\n');
    code.textContent = body;
    pre.appendChild(code);
    return pre;
  }

  if (UL_ITEM.test(first)) return renderList(lines, false, opts);
  if (OL_ITEM.test(first)) return renderList(lines, true, opts);

  if (QUOTE.test(first)) {
    const bq = document.createElement('blockquote');
    bq.className = 'rc-md-quote';
    const inner = lines
      .map((l) => {
        const m = QUOTE.exec(l);
        return m ? m[1] : l;
      })
      .join(' ');
    renderInline(inner, bq, opts);
    return bq;
  }

  const h = HEADING.exec(first);
  if (h && lines.length === 1) {
    // Rendered as a bold paragraph (not a real <h*>) so a chat answer never injects
    // headings into the page's document outline.
    const p = document.createElement('p');
    p.className = 'rc-md-p rc-md-h';
    renderInline(h[2], p, opts);
    return p;
  }

  // Paragraph — soft line breaks collapse to spaces (CommonMark default).
  const p = document.createElement('p');
  p.className = 'rc-md-p';
  renderInline(lines.join(' '), p, opts);
  return p;
}

function renderList(
  lines: string[],
  ordered: boolean,
  opts: MarkdownOptions
): HTMLElement {
  const list = document.createElement(ordered ? 'ol' : 'ul');
  list.className = 'rc-md-list';
  let li: HTMLElement | null = null;
  for (const line of lines) {
    const m = ordered ? OL_ITEM.exec(line) : UL_ITEM.exec(line);
    if (m) {
      li = document.createElement('li');
      renderInline(ordered ? m[2] : m[1], li, opts);
      list.appendChild(li);
    } else if (li && line.trim()) {
      // A wrapped continuation line of the current item.
      li.appendChild(document.createTextNode(' '));
      renderInline(line.trim(), li, opts);
    }
  }
  return list;
}

/**
 * Split accumulated raw text into block sources on blank-line boundaries. As the raw
 * text only ever GROWS (streaming append), every block but the last is immutable —
 * the property StreamingMarkdown relies on to keep finalized blocks stable.
 */
export function splitBlocks(raw: string): string[] {
  return raw
    .split(/\n{2,}/)
    .map((b) => b.replace(/^\n+/, '').replace(/\s+$/, ''))
    .filter((b) => b.length > 0);
}

// ---- streaming -------------------------------------------------------------

/**
 * Incremental Markdown renderer bound to a container element. Each push() appends the
 * new delta to an internal buffer and reconciles the container's block children:
 *   - a brand-new block is appended with the `.rc-md-in` entrance class (it animates
 *     in ONCE — the progressive reveal);
 *   - the still-growing last block is updated IN PLACE (its element node persists, so
 *     it never re-animates while tokens stream into it);
 *   - finalized (non-last) blocks are never touched again.
 */
export class StreamingMarkdown {
  private raw = '';
  private readonly els: HTMLElement[] = [];
  private readonly srcs: string[] = [];

  constructor(
    private readonly container: HTMLElement,
    private readonly opts: MarkdownOptions
  ) {}

  push(text: string): void {
    this.raw += text;
    this.render();
  }

  private render(): void {
    const blocks = splitBlocks(this.raw);
    for (let i = 0; i < blocks.length; i++) {
      if (i < this.els.length) {
        if (this.srcs[i] !== blocks[i]) {
          this.update(i, blocks[i]);
          this.srcs[i] = blocks[i];
        }
      } else {
        const el = renderBlock(blocks[i], this.opts);
        el.classList.add('rc-md-in');
        this.container.appendChild(el);
        this.els.push(el);
        this.srcs.push(blocks[i]);
      }
    }
  }

  /** Re-render an existing block. Same tag → swap children (element persists, no
   *  re-animation); tag changed (e.g. paragraph became a list) → replace the node. */
  private update(i: number, src: string): void {
    const fresh = renderBlock(src, this.opts);
    const cur = this.els[i];
    // Preserve the one-shot entrance class across in-place updates — a block that
    // grows over several tokens (or whose heading/list class flips while typing)
    // must KEEP rc-md-in, else its reveal animation is cancelled mid-flight.
    const reveal = cur.classList.contains('rc-md-in') ? ' rc-md-in' : '';
    if (fresh.tagName === cur.tagName) {
      cur.className = fresh.className + reveal;
      cur.replaceChildren(...Array.from(fresh.childNodes));
    } else {
      if (reveal) fresh.classList.add('rc-md-in');
      this.container.replaceChild(fresh, cur);
      this.els[i] = fresh;
    }
  }
}
