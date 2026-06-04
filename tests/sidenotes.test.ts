// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  attachSidenotes,
  isSafeHref,
  type ProvenanceCitation,
} from '@/lib/avatar/sidenotes';

const CITES: ProvenanceCitation[] = [
  {
    sourceId: 's1',
    label: 'Cormack 2009',
    url: 'https://cormack.example/rrf.pdf',
    excerpt: 'k = 60 was fixed during a pilot investigation.',
    span: { start: 0, end: 6 }, // "k = 60"
  },
  {
    sourceId: 's2',
    label: 'Elastic RRF',
    url: 'https://elastic.example/rrf',
    excerpt: 'rank_constant defaults to 60.',
  },
];

const body = (html: string): HTMLElement => {
  const root = document.createElement('div');
  root.className = 'rc-article__body';
  root.innerHTML = html; // test-only setup; the module itself never uses innerHTML
  document.body.append(root);
  return root;
};

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('isSafeHref', () => {
  it('accepts http(s) and single-slash paths, rejects protocol-relative + js', () => {
    expect(isSafeHref('https://x.example/a')).toBe(true);
    expect(isSafeHref('/en/blog/x/')).toBe(true);
    expect(isSafeHref('//evil.example/x')).toBe(false);
    expect(isSafeHref('javascript:alert(1)')).toBe(false);
  });
});

describe('attachSidenotes — marker creation', () => {
  it('replaces an in-map [sN] with a marker button + hidden note', () => {
    const root = body('<p>RRF pins one constant [s1] and ships.</p>');
    const n = attachSidenotes(root, CITES);
    expect(n).toBe(1);
    expect(root.textContent).not.toContain('[s1]'); // literal marker consumed
    const ref = root.querySelector<HTMLButtonElement>('.rc-sn__ref');
    expect(ref).toBeTruthy();
    expect(ref?.getAttribute('aria-expanded')).toBe('false');
    expect(ref?.getAttribute('aria-controls')).toBe(
      root.querySelector('.rc-sn__note')?.id
    );
    const note = root.querySelector<HTMLElement>('.rc-sn__note');
    expect(note?.hidden).toBe(true);
    expect(note?.getAttribute('role')).toBe('note');
  });

  it('emphasises the excerpt sub-span when present, whole excerpt otherwise', () => {
    const root = body('<p>a [s1] b [s2] c</p>');
    attachSidenotes(root, CITES);
    const notes = root.querySelectorAll('.rc-sn__note');
    // s1 has span {0,6} -> "k = 60" inside <strong>
    expect(notes[0].querySelector('strong')?.textContent).toBe('k = 60');
    expect(notes[0].textContent).toContain('was fixed during a pilot');
    // s2 has no span -> no <strong>, whole excerpt
    expect(notes[1].querySelector('strong')).toBeNull();
    expect(notes[1].textContent).toContain('rank_constant defaults to 60.');
  });

  it('links safe URLs as external <a>; the unsafe case renders text, no <a>', () => {
    const root = body('<p>x [s1] y</p>');
    attachSidenotes(root, [{ ...CITES[0], url: 'javascript:alert(1)' }]);
    const note = root.querySelector('.rc-sn__note');
    expect(note?.querySelector('a')).toBeNull(); // unsafe -> no link
    expect(note?.querySelector('.rc-sn__src')?.textContent).toBe(
      'Cormack 2009'
    );

    const root2 = body('<p>x [s2] y</p>');
    attachSidenotes(root2, CITES);
    const link = root2.querySelector<HTMLAnchorElement>('.rc-sn__src');
    expect(link?.tagName).toBe('A');
    expect(link?.getAttribute('href')).toBe('https://elastic.example/rrf');
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(link?.getAttribute('target')).toBe('_blank');
  });
});

describe('attachSidenotes — interaction + guards', () => {
  it('click toggles aria-expanded and the note visibility', () => {
    const root = body('<p>x [s1] y</p>');
    attachSidenotes(root, CITES);
    const ref = root.querySelector<HTMLButtonElement>('.rc-sn__ref')!;
    const note = root.querySelector<HTMLElement>('.rc-sn__note')!;
    ref.click();
    expect(ref.getAttribute('aria-expanded')).toBe('true');
    expect(note.hidden).toBe(false);
    ref.click();
    expect(ref.getAttribute('aria-expanded')).toBe('false');
    expect(note.hidden).toBe(true);
  });

  it('leaves a [sN] with no provenance entry as literal text', () => {
    const root = body('<p>known [s1] unknown [s9] end</p>');
    const n = attachSidenotes(root, CITES);
    expect(n).toBe(1);
    expect(root.textContent).toContain('[s9]'); // untouched
    expect(root.querySelectorAll('.rc-sn').length).toBe(1);
  });

  it('skips [sN] inside code/pre', () => {
    const root = body('<p>see <code>arr[s1]</code> and [s2] real</p>');
    attachSidenotes(root, CITES);
    expect(root.querySelector('code')?.textContent).toBe('arr[s1]'); // untouched
    expect(root.querySelectorAll('.rc-sn').length).toBe(1); // only the real [s2]
  });

  it('numbers markers sequentially by appearance', () => {
    const root = body('<p>[s2] then [s1] then [s2]</p>');
    attachSidenotes(root, CITES);
    const refs = [...root.querySelectorAll('.rc-sn__ref')].map(
      (r) => r.textContent
    );
    expect(refs).toEqual(['1', '2', '3']);
  });

  it('no-ops on empty citations and is idempotent', () => {
    const root = body('<p>x [s1] y</p>');
    expect(attachSidenotes(root, [])).toBe(0);
    expect(root.querySelector('.rc-sn')).toBeNull();
    expect(attachSidenotes(root, CITES)).toBe(1);
    expect(attachSidenotes(root, CITES)).toBe(0); // second call no-ops
    expect(root.querySelectorAll('.rc-sn').length).toBe(1);
  });
});
