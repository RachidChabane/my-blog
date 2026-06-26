import { describe, it, expect } from 'vitest';
import rehypeCitations from '../src/lib/rehype-citations.mjs';

// Minimal hast shapes — enough to drive the plugin's text walker without pulling
// the full @types/hast tree. The plugin mutates the tree in place.
interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const text = (value: string): HastNode => ({ type: 'text', value });
const el = (tagName: string, children: HastNode[]): HastNode => ({
  type: 'element',
  tagName,
  properties: {},
  children,
});

function run(root: HastNode): HastNode {
  rehypeCitations()(root);
  return root;
}

const cites = (node: HastNode): HastNode[] => {
  const out: HastNode[] = [];
  const walk = (n: HastNode): void => {
    if (
      n.type === 'element' &&
      n.tagName === 'a' &&
      (n.properties?.className as string[] | undefined)?.includes('rc-cite')
    ) {
      out.push(n);
    }
    n.children?.forEach(walk);
  };
  walk(node);
  return out;
};

describe('rehype-citations — inline [sN] -> source-card links', () => {
  it('rewrites a single [sN] marker into an anchor to #source-N', () => {
    const tree = run({
      type: 'root',
      children: [el('p', [text('one shared Claude [s2].')])],
    });
    const c = cites(tree);
    expect(c).toHaveLength(1);
    expect(c[0].properties).toMatchObject({
      className: ['rc-cite'],
      href: '#source-2',
      'data-cite': '2',
      'aria-label': 'Source 2',
    });
    // node text is the bare number; CSS supplies the [brackets]
    expect(c[0].children?.[0]).toEqual({ type: 'text', value: '2' });
  });

  it('handles adjacent markers [s1][s2] as two separate links', () => {
    const tree = run({
      type: 'root',
      children: [el('p', [text('both ends [s1][s2] of the loop')])],
    });
    const c = cites(tree);
    expect(c.map((n) => n.properties?.href)).toEqual([
      '#source-1',
      '#source-2',
    ]);
    // surrounding prose is preserved
    const p = tree.children![0];
    expect(p.children![0]).toEqual({ type: 'text', value: 'both ends ' });
    expect(p.children![p.children!.length - 1]).toEqual({
      type: 'text',
      value: ' of the loop',
    });
  });

  it('leaves [sN] inside code / pre / existing links untouched', () => {
    const tree = run({
      type: 'root',
      children: [
        el('p', [el('code', [text('grep [s1]')])]),
        el('pre', [text('[s2]')]),
        el('a', [text('see [s3]')]),
      ],
    });
    expect(cites(tree)).toHaveLength(0);
  });

  it('is a no-op for prose with no markers', () => {
    const before = el('p', [text('no citations here')]);
    const tree = run({ type: 'root', children: [before] });
    expect(tree.children![0].children![0]).toEqual({
      type: 'text',
      value: 'no citations here',
    });
  });
});
