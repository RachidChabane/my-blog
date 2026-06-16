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
