/**
 * rehype-citations — inline `[sN]` markers become clickable citations.
 *
 *   ...one shared Claude per channel [s2].
 *
 * becomes  ...one shared Claude per channel
 *            <a class="rc-cite" href="#source-2" data-cite="2"
 *               aria-label="Source 2">2</a>.
 *
 * The visible brackets are supplied by CSS (Prose.astro keys off `.rc-cite`,
 * mirroring the avatar dock's `.rc-md-cite`), so the anchor text is the bare
 * number and the marker reads as `[2]`, linking to the matching card in the
 * Sources list (`#source-N`, where N is the 1-based source order the pipeline
 * also uses for `sN`). Both the article DOSSIER and the radar brief render their
 * body through this same pipeline, so one plugin fixes citations on both.
 *
 * Dependency-free (a tiny local hast walker instead of unist-util-visit, matching
 * remark-callouts) so it adds no npm install. Text inside `code`, `pre`, and
 * existing `a` elements is left untouched: a `[s1]` shown in a code sample is
 * literal, and a marker already inside a link is never double-wrapped. A marker
 * whose number has no matching source still links to `#source-N`; the gates keep
 * the corpus free of dangling citations, and an unresolved anchor is inert, not
 * broken.
 */

const CITE = /\[s(\d+)\]/g;
// Subtrees whose text must stay literal (code samples, raw blocks, nested links).
const SKIP = new Set(['code', 'pre', 'a']);

/** Split a text value into text + citation-anchor hast nodes, or null if no `[sN]`. */
function linkify(value) {
  CITE.lastIndex = 0;
  if (!CITE.test(value)) return null;
  CITE.lastIndex = 0;
  const out = [];
  let last = 0;
  let m;
  while ((m = CITE.exec(value)) !== null) {
    if (m.index > last) {
      out.push({ type: 'text', value: value.slice(last, m.index) });
    }
    const n = m[1];
    out.push({
      type: 'element',
      tagName: 'a',
      properties: {
        className: ['rc-cite'],
        href: `#source-${n}`,
        'data-cite': n,
        'aria-label': `Source ${n}`,
      },
      children: [{ type: 'text', value: n }],
    });
    last = m.index + m[0].length;
  }
  if (last < value.length) out.push({ type: 'text', value: value.slice(last) });
  return out;
}

/** Walk a hast element/root, rewriting `[sN]` text nodes (skipping code/pre/a). */
function walk(node) {
  if (!node.children || node.children.length === 0) return;
  const next = [];
  for (const child of node.children) {
    if (child.type === 'text') {
      const repl = linkify(child.value);
      if (repl) {
        next.push(...repl);
        continue;
      }
      next.push(child);
    } else if (child.type === 'element' && SKIP.has(child.tagName)) {
      next.push(child); // do not descend — keep the marker literal / un-nested
    } else {
      walk(child);
      next.push(child);
    }
  }
  node.children = next;
}

export default function rehypeCitations() {
  return (tree) => {
    walk(tree);
  };
}
