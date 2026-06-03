import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static-source guards for the S1 home (mirrors about.test.ts): INV-9 (no emoji),
// tokens-only (no hard-coded hex), the task's "no gradient hero" rule, the single-
// h1 hierarchy, the non-figurative hero (D-007), and the no-email-modal/form
// constraint (W-2). No invariant-grep regex enforces these — these deterministic
// guards are load-bearing under the `tests` gate.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(`${root}/${rel}`, 'utf8');

// See ui.test.ts for why Emoji_Presentation (not Extended_Pictographic).
const EMOJI = /\p{Emoji_Presentation}/u;

/** Concatenate the contents of every <style> block in an .astro source. */
const styleBlocks = (src: string): string =>
  [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');

const FILES = ['src/pages/[lang]/index.astro', 'src/components/Hero.astro'];

describe('home surface — INV-9 (no emoji) + tokens-only (no hex) + no gradient', () => {
  for (const path of FILES) {
    const src = read(path);
    it(`${path}: contains no emoji`, () => expect(EMOJI.test(src)).toBe(false));
    it(`${path}: hard-codes no hex color`, () =>
      expect(src).not.toMatch(/#[0-9a-fA-F]{3,6}/));
    it(`${path}: has a non-empty <style> with no hex inside`, () => {
      const styles = styleBlocks(src);
      expect(styles.trim().length).toBeGreaterThan(0);
      expect(styles).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });
    it(`${path}: declares no gradient (no gradient hero)`, () =>
      expect(styleBlocks(src)).not.toMatch(/gradient/i));
  }
});

describe('Hero.astro — single h1, non-figurative (D-007)', () => {
  const src = read('src/components/Hero.astro');
  it('owns exactly one h1 (the one-line statement)', () =>
    expect((src.match(/<h1/g) ?? []).length).toBe(1));
  it('embeds no image (non-figurative hero)', () =>
    expect(src).not.toMatch(/<img/));
});

describe('index.astro — no second h1, no email modal/form (W-2)', () => {
  const src = read('src/pages/[lang]/index.astro');
  it('renders no h1 (the hero owns the single h1)', () =>
    expect((src.match(/<h1/g) ?? []).length).toBe(0));
  it('embeds no backend form (W-2 / task constraint)', () =>
    expect(src).not.toMatch(/<form/i));
  it('embeds no email input (no email-capture modal)', () =>
    expect(src).not.toMatch(/type="email"/));
});
