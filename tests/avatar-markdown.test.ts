// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  renderBlock,
  renderInline,
  splitBlocks,
  StreamingMarkdown,
  type MarkdownOptions,
} from '@/lib/avatar/markdown';

// The avatar streams lightweight Markdown; this renderer turns it into SAFE DOM
// (textContent / createElement only — never a markup sink). These tests lock both
// the formatting behaviour AND the inert-rendering posture the red-team specs rely
// on: adversarial HTML in the stream must render as literal text, never live markup.

// Same allow-list the island uses (lib/avatar/protocol clients): http(s) absolute or
// a single-leading-slash same-origin relative path; everything else is rejected.
const isSafeHref = (u: string): boolean =>
  /^https?:/i.test(u) || /^\/(?!\/)/.test(u);

const opts: MarkdownOptions = { isSafeHref };

const inlineHTML = (text: string, o: MarkdownOptions = opts): string => {
  const p = document.createElement('p');
  renderInline(text, p, o);
  return p.innerHTML;
};

describe('renderInline — emphasis, code, links', () => {
  it('renders bold and italic', () => {
    expect(inlineHTML('a **bold** b')).toBe('a <strong>bold</strong> b');
    expect(inlineHTML('a *em* b')).toBe('a <em>em</em> b');
  });

  it('renders inline code verbatim (no nested parsing)', () => {
    expect(inlineHTML('use `a **b**` here')).toBe(
      'use <code class="rc-md-code">a **b**</code> here'
    );
  });

  it('links only safe URLs; unsafe schemes fall back to literal text', () => {
    expect(inlineHTML('see [docs](/en/blog/x/)')).toBe(
      'see <a class="rc-md-link" href="/en/blog/x/" rel="nofollow noopener">docs</a>'
    );
    // javascript: scheme is rejected — the whole construct stays literal.
    const out = inlineHTML('[x](javascript:alert(1))');
    expect(out).not.toContain('<a');
    expect(out).toContain('[x](javascript:alert(1))');
  });

  it('does not treat underscores inside words as emphasis', () => {
    // window.__pwned must not become <strong>/<em> — the red-team payload shape.
    const out = inlineHTML('call window.__pwned=1 and other.__thing=2');
    expect(out).not.toContain('<strong>');
    expect(out).not.toContain('<em>');
    expect(out).toContain('window.__pwned=1');
  });

  it('treats _underscore_ emphasis only at word boundaries', () => {
    expect(inlineHTML('an _emph_ word')).toBe('an <em>emph</em> word');
  });
});

describe('renderInline — citation markers', () => {
  it('renders [n] as an inert superscript when no citation map is given', () => {
    const out = inlineHTML('grounded [2] here');
    expect(out).toBe('grounded <sup class="rc-md-cite">2</sup> here');
  });

  it('links [n] to its source (in a new tab) when the map yields a safe URL', () => {
    const out = inlineHTML('grounded [1] here', {
      isSafeHref,
      citationHref: (n) => (n === 1 ? '/en/blog/x/' : null),
    });
    // Opens in a new tab (target=_blank + hardened rel) so following the footnote
    // never discards the conversation.
    expect(out).toBe(
      'grounded <sup class="rc-md-cite"><a href="/en/blog/x/" target="_blank" rel="noopener noreferrer">1</a></sup> here'
    );
  });

  it('keeps [label](url) as a link, not a citation', () => {
    expect(inlineHTML('[1](/en/blog/x/)')).toContain('<a');
  });

  it('sets an aria-label on the [n] marker link (names the source for SR users)', () => {
    const out = inlineHTML('grounded [1] here', {
      isSafeHref,
      citationHref: () => '/en/blog/x/',
      citationLabel: (n) => (n === 1 ? 'Hybrid RAG article' : null),
    });
    expect(out).toContain('aria-label="Hybrid RAG article"');
  });
});

describe('renderInline / renderBlock — XSS inert rendering (M-12 / NFR-7)', () => {
  it('renders raw HTML tokens as literal text, injecting no element', () => {
    const host = document.createElement('div');
    const payload =
      '<img src=x onerror="window.__pwned=1"><script>window.__pwned=1</script>';
    host.appendChild(renderBlock(payload, opts));
    // No real elements parsed out of the payload.
    expect(host.querySelectorAll('img').length).toBe(0);
    expect(host.querySelectorAll('script').length).toBe(0);
    // The markup survives as text.
    expect(host.textContent).toContain('<img');
    expect(host.textContent).toContain('<script>');
  });

  it('never sets an href for a data: URI link', () => {
    expect(inlineHTML('[x](data:text/html,<script>1</script>)')).not.toContain(
      'href'
    );
  });
});

describe('renderBlock — block types', () => {
  it('renders a paragraph', () => {
    expect(renderBlock('hello world', opts).outerHTML).toBe(
      '<p class="rc-md-p">hello world</p>'
    );
  });

  it('renders an unordered list', () => {
    const el = renderBlock('- one\n- two', opts);
    expect(el.tagName).toBe('UL');
    expect(el.querySelectorAll('li').length).toBe(2);
    expect(el.querySelectorAll('li')[0].textContent).toBe('one');
  });

  it('renders an ordered list', () => {
    const el = renderBlock('1. a\n2. b', opts);
    expect(el.tagName).toBe('OL');
    expect(el.querySelectorAll('li').length).toBe(2);
  });

  it('renders a blockquote', () => {
    const el = renderBlock('> quoted', opts);
    expect(el.tagName).toBe('BLOCKQUOTE');
    expect(el.textContent).toBe('quoted');
  });

  it('renders an ATX heading as a bold paragraph (no document-outline heading)', () => {
    const el = renderBlock('## Title', opts);
    expect(el.tagName).toBe('P');
    expect(el.className).toContain('rc-md-h');
    expect(el.textContent).toBe('Title');
  });
});

describe('splitBlocks', () => {
  it('splits on blank lines and trims', () => {
    expect(splitBlocks('a\n\nb\n\n\nc')).toEqual(['a', 'b', 'c']);
  });
  it('drops empty/whitespace-only blocks', () => {
    expect(splitBlocks('a\n\n   \n\nb')).toEqual(['a', 'b']);
  });
});

describe('StreamingMarkdown — incremental reconciliation', () => {
  let container: HTMLElement;
  beforeEach(() => {
    container = document.createElement('div');
  });

  it('renders a single growing paragraph as one stable element', () => {
    const md = new StreamingMarkdown(container, opts);
    md.push('He ');
    const first = container.firstElementChild;
    md.push('documents a hybrid RAG system.');
    // Same element node persisted across tokens (no re-mount / re-animation).
    expect(container.children.length).toBe(1);
    expect(container.firstElementChild).toBe(first);
    expect(container.textContent).toBe('He documents a hybrid RAG system.');
  });

  it('appends a new block element when a blank line arrives', () => {
    const md = new StreamingMarkdown(container, opts);
    md.push('First paragraph.');
    md.push('\n\nSecond');
    md.push(' paragraph.');
    expect(container.querySelectorAll('p').length).toBe(2);
    expect(container.children[0].textContent).toBe('First paragraph.');
    expect(container.children[1].textContent).toBe('Second paragraph.');
  });

  it('finalizes a prior block even when one token both extends and breaks it', () => {
    const md = new StreamingMarkdown(container, opts);
    md.push('foo');
    md.push('bar\n\nbaz'); // extends block 0 to "foobar" AND opens block 1
    const ps = container.querySelectorAll('p');
    expect(ps.length).toBe(2);
    expect(ps[0].textContent).toBe('foobar');
    expect(ps[1].textContent).toBe('baz');
  });

  it('marks new blocks with the entrance class', () => {
    const md = new StreamingMarkdown(container, opts);
    md.push('one\n\ntwo');
    for (const p of container.querySelectorAll('p')) {
      expect(p.classList.contains('rc-md-in')).toBe(true);
    }
  });

  it('keeps the entrance class when a block grows in place across tokens', () => {
    // Regression: an in-place update must NOT clobber rc-md-in (which would cancel
    // the reveal animation mid-flight for a block that streams over several tokens).
    const md = new StreamingMarkdown(container, opts);
    md.push('Hello');
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains('rc-md-in')).toBe(true);
    md.push(' world'); // same tag → updated in place
    expect(container.firstElementChild).toBe(el); // same node, no remount
    expect(el.classList.contains('rc-md-in')).toBe(true); // class preserved
    expect(el.textContent).toBe('Hello world');
  });

  it('keeps the entrance class when a block changes tag mid-stream', () => {
    const md = new StreamingMarkdown(container, opts);
    md.push('1'); // a paragraph "1"
    expect(container.firstElementChild?.tagName).toBe('P');
    md.push('. first item'); // becomes an ordered list
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe('OL');
    expect(el.classList.contains('rc-md-in')).toBe(true);
  });
});
