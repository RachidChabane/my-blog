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

/** Call `fn` on every blockquote node in the tree (depth-first, dependency-free). */
function eachBlockquote(node, fn) {
  if (!node || typeof node !== 'object' || !Array.isArray(node.children))
    return;
  for (const child of node.children) {
    if (child && child.type === 'blockquote') fn(child);
    eachBlockquote(child, fn);
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
