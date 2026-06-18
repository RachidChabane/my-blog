/**
 * remark-callouts — GitHub-style alert blockquotes → PRESSWORK callouts.
 *
 *   > [!NOTE]
 *   > Needle-in-a-haystack is not inference retrieval.
 *
 * becomes  <aside class="cl cl--note" data-callout="note" role="note">
 *            <p class="cl__label">NOTE</p>
 *            <p>Needle-in-a-haystack is not inference retrieval.</p>
 *          </aside>
 *
 * All visuals (notched label tab, semantic left rule, registration corners) are
 * pure CSS in Prose.astro keyed off .cl / .cl--<type> — this plugin only rewrites
 * the mdast → hast node. Dependency-free (a tiny local blockquote walker instead
 * of unist-util-visit) so it adds no npm install. Authors opt in per blockquote;
 * a plain `>` quote with no `[!TYPE]` marker is untouched (still a pull-quote).
 *
 * Taxonomy (label hue lives in tokens.css; the LABEL/body TEXT stays --fg ink so
 * a callout is never an unreadable colored word):
 *   note · info → Slate   tip → Pine   important → Ember (max emphasis, not alarm)
 *   warning → Amber   caution · pitfall → Crimson (danger)
 *   confirmed → Pine ✓   inferred → Crimson ≈   (the epistemic pair)
 *
 * The displayed LABEL is localized to the article's language (the `lang`
 * frontmatter Astro exposes on the vfile) so a French article reads ATTENTION,
 * not CAUTION. Only the visible word changes — the data-callout key, the CSS
 * class, and the icon stay language-agnostic. Falls back to English when the
 * frontmatter carries no recognized `lang` (e.g. a doc outside the article/
 * project collections).
 */

// canonical type → displayed label, per locale. Aliases (info, pitfall) fold
// onto a canonical CSS key via ALIAS but keep their own display label here.
const LABELS = {
  en: {
    note: 'NOTE',
    info: 'NOTE',
    tip: 'TIP',
    important: 'IMPORTANT',
    warning: 'WARNING',
    caution: 'CAUTION',
    pitfall: 'CAUTION',
    confirmed: 'CONFIRMED',
    inferred: 'INFERRED',
  },
  fr: {
    note: 'NOTE',
    info: 'NOTE',
    tip: 'CONSEIL',
    important: 'IMPORTANT',
    warning: 'AVERTISSEMENT',
    caution: 'ATTENTION',
    pitfall: 'ATTENTION',
    confirmed: 'CONFIRMÉ',
    inferred: 'INFÉRÉ',
  },
};
const ALIAS = { info: 'note', pitfall: 'caution' };
const MARKER = /^\[!(\w+)\][ \t]*\r?\n?/;
// Every recognized marker key, language-agnostic (the EN table holds them all).
const KNOWN = new Set(Object.keys(LABELS.en));
// A marker that begins a *new* line inside a paragraph: the signature of two
// callouts an author ran together without the required blank line, e.g.
//   > [!CONFIRMED]
//   > …text…
//   > [!INFERRED]      ← no blank `>` line above, so markdown merges both into
//   > …text…             one blockquote and this marker leaks as literal text.
const EMBEDDED_MARKER = /\r?\n\[!(\w+)\]/;

/** Call `fn` on every blockquote node in the tree (depth-first, dependency-free). */
function eachBlockquote(node, fn) {
  if (!node || typeof node !== 'object' || !Array.isArray(node.children))
    return;
  for (const child of node.children) {
    if (child && child.type === 'blockquote') fn(child);
    eachBlockquote(child, fn);
  }
}

/** The known marker type a paragraph leads with (e.g. 'inferred'), or null. */
function leadMarker(para) {
  const first = para && para.type === 'paragraph' && para.children?.[0];
  if (!first || first.type !== 'text') return null;
  const m = first.value.match(MARKER);
  const raw = m && m[1].toLowerCase();
  return raw && KNOWN.has(raw) ? raw : null;
}

/**
 * Split one paragraph into several at every embedded `\n[!TYPE]` boundary, so a
 * run-together pair of callouts becomes the separate paragraphs it should have
 * been. Non-text inline nodes (links, emphasis) after a boundary follow into the
 * new paragraph. Returns the original (single-element) array when nothing splits.
 */
function explodeParagraph(para) {
  const groups = [[]];
  for (const node of para.children) {
    if (node.type !== 'text') {
      groups[groups.length - 1].push(node);
      continue;
    }
    let value = node.value;
    let m;
    while (
      (m = value.match(EMBEDDED_MARKER)) &&
      KNOWN.has(m[1].toLowerCase())
    ) {
      const before = value.slice(0, m.index); // text up to (not incl.) the newline
      if (before)
        groups[groups.length - 1].push({ type: 'text', value: before });
      groups.push([]); // new line-starting marker → new paragraph
      value = value.slice(m.index).replace(/^\r?\n/, ''); // drop the leading newline
    }
    if (value) groups[groups.length - 1].push({ type: 'text', value });
  }
  if (groups.length === 1) return [para];
  return groups
    .filter((children) => children.length)
    .map((children, i) => ({
      type: 'paragraph',
      // keep the source paragraph's hint data on the first slice only
      ...(i === 0 && para.data ? { data: para.data } : {}),
      children,
    }));
}

/**
 * Pre-pass: rewrite each blockquote's parent so a blockquote that secretly holds
 * two (or more) callouts — markers run together without a blank line — becomes
 * the separate sibling blockquotes markdown would have produced with the blank
 * line present. After this, the normal one-marker-per-blockquote conversion and
 * the CONFIRMED/INFERRED pair sweep both see well-formed input.
 */
function splitMergedCallouts(node) {
  if (!node || typeof node !== 'object' || !Array.isArray(node.children))
    return;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type !== 'blockquote') {
      splitMergedCallouts(child);
      continue;
    }
    // 1. Break soft-break-merged markers out into their own paragraphs.
    const paras = child.children.flatMap((c) =>
      c.type === 'paragraph' ? explodeParagraph(c) : [c]
    );
    // 2. Group paragraphs, starting a fresh group at each leading marker, so each
    //    group is one callout's worth of content.
    const groups = [];
    for (const para of paras) {
      if (!groups.length || leadMarker(para)) groups.push([para]);
      else groups[groups.length - 1].push(para);
    }
    if (groups.length <= 1) {
      splitMergedCallouts(child);
      continue;
    }
    const split = groups.map((children) => ({ type: 'blockquote', children }));
    node.children.splice(i, 1, ...split);
    i += split.length - 1;
    for (const bq of split) splitMergedCallouts(bq);
  }
}

/** The callout type stamped onto a converted node, or null. */
function calloutKey(node) {
  return node?.data?.hProperties?.['data-callout'] ?? null;
}

export default function remarkCallouts() {
  return (tree, file) => {
    // Astro exposes the source frontmatter on the vfile; pick the matching label
    // set so a French article reads ATTENTION/CONSEIL, an English one CAUTION/TIP.
    const lang = file?.data?.astro?.frontmatter?.lang;
    const labels = LABELS[lang] ?? LABELS.en;
    // Forgive a missing blank line between two callouts: split a blockquote that
    // merged them before the marker conversion below ever runs.
    splitMergedCallouts(tree);
    eachBlockquote(tree, (bq) => {
      const firstPara = bq.children && bq.children[0];
      if (!firstPara || firstPara.type !== 'paragraph') return;
      const firstText = firstPara.children && firstPara.children[0];
      if (!firstText || firstText.type !== 'text') return;

      const m = firstText.value.match(MARKER);
      if (!m) return;
      const raw = m[1].toLowerCase();
      const label = labels[raw];
      if (!label) return; // unknown marker → leave as an ordinary blockquote
      const key = ALIAS[raw] || raw;

      // Strip the "[!TYPE]" marker (and its trailing newline) from the lead text.
      firstText.value = firstText.value.slice(m[0].length);
      // If the marker stood alone on its line, drop the now-empty text node and a
      // leading hard break so the body starts clean.
      if (firstText.value === '') {
        firstPara.children.shift();
        if (firstPara.children[0] && firstPara.children[0].type === 'break') {
          firstPara.children.shift();
        }
        // a marker-only first paragraph with no remaining content is removed
        if (firstPara.children.length === 0) bq.children.shift();
      }

      bq.data = bq.data || {};
      bq.data.hName = 'aside';
      bq.data.hProperties = {
        className: ['cl', `cl--${key}`],
        'data-callout': key,
        role: 'note',
      };

      // Prepend the label as its own element so CSS can render the icon + tag.
      bq.children.unshift({
        type: 'paragraph',
        data: { hName: 'p', hProperties: { className: ['cl__label'] } },
        children: [{ type: 'text', value: label }],
      });
    });

    // Second pass: a top-level [!CONFIRMED] immediately followed by [!INFERRED]
    // (or the reverse) becomes a side-by-side verdict PAIR — the reference's dual
    // cards. Callouts are top-level blocks, so a single non-recursive sweep over
    // the root children is enough (and avoids re-wrapping an already-wrapped pair).
    const ch = tree.children;
    for (let i = 0; i < ch.length - 1; i++) {
      const a = calloutKey(ch[i]);
      const b = calloutKey(ch[i + 1]);
      const isPair =
        (a === 'confirmed' && b === 'inferred') ||
        (a === 'inferred' && b === 'confirmed');
      if (!isPair) continue;
      // Reuse the `blockquote` type (a recognized mdast→hast container); data.hName
      // rewrites it to a <div class="cl-pair">.
      ch.splice(i, 2, {
        type: 'blockquote',
        data: { hName: 'div', hProperties: { className: ['cl-pair'] } },
        children: [ch[i], ch[i + 1]],
      });
    }
  };
}
