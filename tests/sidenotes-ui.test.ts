import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static-source guards for the grounded-citation sidenotes (engagement Option B), mirroring
// avatar-ui.test.ts: the XSS posture (no markup sink), tokens-only stylesheet, and no-emoji /
// non-figurative rules. No runtime gate enforces these, so they are pinned here. The DOM
// BEHAVIOUR is covered separately in tests/sidenotes.test.ts (happy-dom).
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(`${root}/${rel}`, 'utf8');

const EMOJI = /\p{Emoji_Presentation}/u; // see ui.test.ts (not Extended_Pictographic)

const island = read('src/components/ProvenanceSidenotes.astro');
const module = read('src/lib/avatar/sidenotes.ts');
const css = read('src/styles/sidenotes.css');

describe('sidenotes — INV-9 (no emoji)', () => {
  for (const [name, src] of [
    ['ProvenanceSidenotes.astro', island],
    ['sidenotes.ts', module],
    ['sidenotes.css', css],
  ] as const) {
    it(`${name}: contains no emoji`, () => {
      expect(EMOJI.test(src)).toBe(false);
    });
  }
});

describe('sidenotes — XSS posture (no markup sink)', () => {
  for (const [name, src] of [
    ['ProvenanceSidenotes.astro', island],
    ['sidenotes.ts', module],
  ] as const) {
    it(`${name}: uses neither innerHTML nor set:html`, () => {
      expect(src).not.toContain('innerHTML');
      expect(src).not.toContain('set:html');
      expect(src).not.toContain('outerHTML');
      expect(src).not.toContain('insertAdjacentHTML');
    });
  }

  it('the module sinks text via textContent / createTextNode only', () => {
    expect(module).toMatch(/textContent|createTextNode/);
  });
});

describe('sidenotes — non-figurative (D-007)', () => {
  it('ProvenanceSidenotes.astro renders no figure', () => {
    expect(island).not.toMatch(/<img/);
    expect(island).not.toMatch(/\bface\b/i);
  });
});

describe('sidenotes.css — tokens only', () => {
  it('is non-empty and hard-codes no color literal', () => {
    expect(css.trim().length).toBeGreaterThan(0);
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(css).not.toMatch(/\brgb\(/);
    expect(css).not.toMatch(/\bhsl\(/);
  });
});

describe('sidenotes — anchored on [sN] tokens (the stable contract)', () => {
  it('the module matches the pinned [sN] citation shape', () => {
    // Producer/consumer agreement: source ids are 's' + digits, cited [sN]
    // (pipeline grounding gate _CITATION_RE). Keep this in sync with that shape.
    expect(module).toContain('\\[(s\\d+)\\]');
  });
});
