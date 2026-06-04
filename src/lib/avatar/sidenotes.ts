/**
 * Grounded-citation sidenotes (engagement Option B) -- pure, framework-free DOM logic.
 *
 * Given the rendered article body and the per-source provenance citations (written by the
 * pipeline's publish stage; see pipeline/stages/publish.py build_provenance and
 * src/content/schemas.ts provenanceSchema), this turns each `[sN]` inline marker already in
 * the prose into an interactive disclosure that reveals the EXACT source excerpt grounding
 * it, with the supporting sub-span emphasised when known.
 *
 * Design (matches the avatar island's posture):
 * - Anchors on the `[sN]` tokens (stable; the grounding gate guarantees they resolve), NOT
 *   on claim-sentence text (the humanize pass rewrites prose after the claim map is authored).
 * - textContent / DOM-node sinks ONLY -- never a raw-markup sink (XSS posture).
 * - Citation links pass an http(s)-or-same-origin allow-list (protocol-relative rejected).
 * - Skips `[sN]` inside <code>/<pre>/<a>/<button> so code samples are left untouched.
 * - Idempotent: a second call on the same root is a no-op.
 */

export interface ProvenanceCitation {
  sourceId: string; // 's' + digits, e.g. 's3'
  label: string;
  url: string;
  excerpt: string;
  span?: { start: number; end: number };
}

const CITATION_RE = /\[(s\d+)\]/g;
const SKIP_ANCESTORS = new Set(['CODE', 'PRE', 'A', 'BUTTON']);

/** http(s) absolute, or a single-leading-slash same-origin path. `//host` is rejected. */
export const isSafeHref = (u: string): boolean =>
  /^https?:/i.test(u) || /^\/(?!\/)/.test(u);

const inSkippedAncestor = (node: Node, root: Element): boolean => {
  let el = node.parentElement;
  while (el && el !== root) {
    if (SKIP_ANCESTORS.has(el.tagName)) return true;
    el = el.parentElement;
  }
  return false;
};

/** Build the excerpt body, emphasising `excerpt[start:end]` when a valid span is given. */
const buildExcerpt = (
  doc: Document,
  cite: ProvenanceCitation
): DocumentFragment => {
  const frag = doc.createDocumentFragment();
  const { excerpt, span } = cite;
  if (
    span &&
    Number.isInteger(span.start) &&
    Number.isInteger(span.end) &&
    span.start >= 0 &&
    span.end > span.start &&
    span.end <= excerpt.length
  ) {
    frag.append(doc.createTextNode(excerpt.slice(0, span.start)));
    const strong = doc.createElement('strong');
    strong.textContent = excerpt.slice(span.start, span.end);
    frag.append(strong);
    frag.append(doc.createTextNode(excerpt.slice(span.end)));
  } else {
    frag.append(doc.createTextNode(excerpt)); // whole excerpt stands
  }
  return frag;
};

/** Build one `<span class="rc-sn">` (marker button + hidden note) for a citation. */
const buildSidenote = (
  doc: Document,
  cite: ProvenanceCitation,
  ordinal: number
): HTMLElement => {
  const noteId = `rc-sn-note-${ordinal}`;
  const wrap = doc.createElement('span');
  wrap.className = 'rc-sn';
  wrap.dataset.sourceId = cite.sourceId;

  const ref = doc.createElement('button');
  ref.type = 'button';
  ref.className = 'rc-sn__ref';
  ref.textContent = String(ordinal);
  ref.setAttribute('aria-expanded', 'false');
  ref.setAttribute('aria-controls', noteId);
  ref.setAttribute('aria-label', `Source for this claim: ${cite.label}`);

  const note = doc.createElement('span');
  note.className = 'rc-sn__note';
  note.id = noteId;
  note.setAttribute('role', 'note');
  note.hidden = true;

  const excerpt = doc.createElement('span');
  excerpt.className = 'rc-sn__excerpt';
  excerpt.append(buildExcerpt(doc, cite));
  note.append(excerpt);

  if (isSafeHref(cite.url)) {
    const link = doc.createElement('a');
    link.className = 'rc-sn__src';
    link.href = cite.url;
    link.textContent = cite.label;
    if (/^https?:/i.test(cite.url)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    note.append(link);
  } else {
    const plain = doc.createElement('span'); // unsafe URL -> label as text, no link
    plain.className = 'rc-sn__src';
    plain.textContent = cite.label;
    note.append(plain);
  }

  ref.addEventListener('click', () => {
    const open = ref.getAttribute('aria-expanded') === 'true';
    ref.setAttribute('aria-expanded', open ? 'false' : 'true');
    note.hidden = open;
  });

  wrap.append(ref, note);
  return wrap;
};

/** Replace each in-map `[sN]` inside one text node with a sidenote element. */
const processTextNode = (
  textNode: Text,
  byId: Map<string, ProvenanceCitation>,
  nextOrdinal: () => number
): void => {
  const doc = textNode.ownerDocument;
  if (!doc) return;
  const text = textNode.nodeValue ?? '';
  CITATION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let cursor = 0;
  const frag = doc.createDocumentFragment();
  let replaced = false;
  while ((match = CITATION_RE.exec(text)) !== null) {
    const cite = byId.get(match[1]);
    if (!cite) continue; // a [sN] with no provenance entry stays as literal text
    frag.append(doc.createTextNode(text.slice(cursor, match.index)));
    frag.append(buildSidenote(doc, cite, nextOrdinal()));
    cursor = match.index + match[0].length;
    replaced = true;
  }
  if (!replaced) return;
  frag.append(doc.createTextNode(text.slice(cursor)));
  textNode.parentNode?.replaceChild(frag, textNode);
};

/**
 * Attach grounded-citation sidenotes to `root`. Returns the number of markers attached.
 * No-op (returns 0) when there are no citations, no `[sN]` markers, or it has already run.
 */
export const attachSidenotes = (
  root: HTMLElement,
  citations: ProvenanceCitation[]
): number => {
  if (!root || root.dataset.snReady === 'true') return 0;
  if (!citations || citations.length === 0) return 0;
  const byId = new Map(citations.map((c) => [c.sourceId, c]));
  const doc = root.ownerDocument;
  if (!doc) return 0;

  // Collect target text nodes first (mutating during the walk invalidates the walker).
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const targets: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const value = node.nodeValue ?? '';
    CITATION_RE.lastIndex = 0;
    if (CITATION_RE.test(value) && !inSkippedAncestor(node, root)) {
      targets.push(node as Text);
    }
  }

  let count = 0;
  const nextOrdinal = () => ++count;
  for (const textNode of targets) processTextNode(textNode, byId, nextOrdinal);
  if (count === 0) return 0;

  root.dataset.snReady = 'true';
  // Escape closes any open note (the marker buttons own click-toggle themselves).
  doc.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key !== 'Escape') return;
    for (const ref of root.querySelectorAll<HTMLButtonElement>(
      '.rc-sn__ref[aria-expanded="true"]'
    )) {
      ref.setAttribute('aria-expanded', 'false');
      const id = ref.getAttribute('aria-controls');
      const note = id ? doc.getElementById(id) : null;
      if (note) (note as HTMLElement).hidden = true;
    }
  });
  return count;
};
