import { describe, it, expect } from 'vitest';
import remarkCallouts from '../src/lib/remark-callouts.mjs';

// Minimal mdast/vfile shapes — enough to drive the plugin's blockquote walker
// and label lookup without pulling the full @types/mdast tree.
interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
}
interface VFileish {
  data?: { astro?: { frontmatter?: { lang?: string } } };
}

// A single blockquote whose lead text opens with the `[!TYPE]` marker — exactly
// the shape Astro's markdown pipeline hands the plugin.
function run(markerType: string, lang?: string): MdNode {
  const tree: MdNode = {
    type: 'root',
    children: [
      {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: `[!${markerType}]\nBody.` }],
          },
        ],
      },
    ],
  };
  const file: VFileish = lang
    ? { data: { astro: { frontmatter: { lang } } } }
    : {};
  remarkCallouts()(tree, file);
  return tree.children![0];
}

const labelOf = (bq: MdNode): string =>
  bq.children![0].children![0].value as string;
const classOf = (bq: MdNode): string[] =>
  bq.data!.hProperties!.className as string[];
const calloutOf = (bq: MdNode): string =>
  bq.data!.hProperties!['data-callout'] as string;

describe('remark-callouts label localization', () => {
  it('French articles read ATTENTION, not CAUTION', () => {
    const bq = run('CAUTION', 'fr');
    expect(labelOf(bq)).toBe('ATTENTION');
  });

  it('English articles keep the English label', () => {
    expect(labelOf(run('CAUTION', 'en'))).toBe('CAUTION');
  });

  it('localizes the full French taxonomy', () => {
    expect(labelOf(run('TIP', 'fr'))).toBe('CONSEIL');
    expect(labelOf(run('WARNING', 'fr'))).toBe('AVERTISSEMENT');
    expect(labelOf(run('IMPORTANT', 'fr'))).toBe('IMPORTANT');
    expect(labelOf(run('NOTE', 'fr'))).toBe('NOTE');
    expect(labelOf(run('CONFIRMED', 'fr'))).toBe('CONFIRMÉ');
    expect(labelOf(run('INFERRED', 'fr'))).toBe('INFÉRÉ');
  });

  it('aliases localize their label but keep the canonical CSS key', () => {
    const bq = run('PITFALL', 'fr');
    expect(labelOf(bq)).toBe('ATTENTION'); // pitfall → caution label
    expect(classOf(bq)).toContain('cl--caution');
    expect(calloutOf(bq)).toBe('caution');
  });

  it('the data-callout key + CSS class are language-agnostic (only the word changes)', () => {
    for (const lang of ['fr', 'en']) {
      const bq = run('CAUTION', lang);
      expect(calloutOf(bq)).toBe('caution');
      expect(classOf(bq)).toEqual(['cl', 'cl--caution']);
    }
  });

  it('falls back to English when lang frontmatter is absent or unrecognized', () => {
    expect(labelOf(run('CAUTION'))).toBe('CAUTION'); // no vfile frontmatter
    expect(labelOf(run('CAUTION', 'de'))).toBe('CAUTION'); // unknown locale
  });
});

// Run the plugin over an arbitrary single-blockquote tree built from one raw
// text value — the exact node markdown produces when callout lines are merged.
function runBlockquote(text: string, lang = 'fr'): MdNode {
  const tree: MdNode = {
    type: 'root',
    children: [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: text }] },
        ],
      },
    ],
  };
  remarkCallouts()(tree, { data: { astro: { frontmatter: { lang } } } });
  return tree;
}

const bodyOf = (bq: MdNode): string =>
  (bq.children![1]?.children ?? []).map((n) => n.value ?? '').join('');

describe('remark-callouts merged-pair recovery (missing blank line)', () => {
  // Regression: a CONFIRMED callout run together with the following INFERRED
  // callout — no blank line between them — used to swallow the second marker as
  // literal text inside the first card. It must split back into a verdict pair.
  it('splits a soft-break-merged CONFIRMED/INFERRED into a paired aside', () => {
    const tree = runBlockquote(
      "[!CONFIRMED]\nUne taxonomie a relevé 0 à 37 outils [s4].\n[!INFERRED]\nD'après mon expérience, deux lignes voisines."
    );
    expect(tree.children).toHaveLength(1);
    const pair = tree.children![0];
    expect(classOf(pair)).toContain('cl-pair');
    const [confirmed, inferred] = pair.children!;
    expect(calloutOf(confirmed)).toBe('confirmed');
    expect(calloutOf(inferred)).toBe('inferred');
    // The second marker must NOT leak into the first card's body.
    expect(bodyOf(confirmed)).toBe(
      'Une taxonomie a relevé 0 à 37 outils [s4].'
    );
    expect(bodyOf(confirmed)).not.toContain('[!INFERRED]');
    expect(bodyOf(inferred)).toBe(
      "D'après mon expérience, deux lignes voisines."
    );
  });

  it('also splits when separated only by a blank quote line (two paragraphs)', () => {
    const tree: MdNode = {
      type: 'root',
      children: [
        {
          type: 'blockquote',
          children: [
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!CONFIRMED]\nConfirmé.' }],
            },
            {
              type: 'paragraph',
              children: [{ type: 'text', value: '[!INFERRED]\nInféré.' }],
            },
          ],
        },
      ],
    };
    remarkCallouts()(tree, {
      data: { astro: { frontmatter: { lang: 'fr' } } },
    });
    expect(tree.children).toHaveLength(1);
    expect(classOf(tree.children![0])).toContain('cl-pair');
  });

  it('leaves a single callout and a plain quote untouched', () => {
    const single = runBlockquote('[!TIP]\nUn conseil.');
    expect(single.children).toHaveLength(1);
    expect(calloutOf(single.children![0])).toBe('tip');

    const plain = runBlockquote('Une citation ordinaire.');
    expect(plain.children![0].type).toBe('blockquote');
    expect(plain.children![0].data?.hProperties).toBeUndefined();
  });
});
