import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static-source assertions (mirrors shell.test.ts): guards INV-9 (no emoji), the
// tokens-only convention, D-007 non-figurative, single-h1, link safety, and the
// no-backend-form rule (W-2) deterministically — no gate regex enforces them.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(`${root}/${rel}`, 'utf8');

// See ui.test.ts for why Emoji_Presentation (not Extended_Pictographic).
const EMOJI = /\p{Emoji_Presentation}/u;

/** Concatenate the contents of every <style> block in an .astro source. */
const styleBlocks = (src: string): string =>
  [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');

// ContactIcon.astro colors via currentColor → it has NO <style> block, so it is
// checked for emoji + no-hex (ALL_FILES) but NOT for a non-empty <style>.
const ALL_FILES = [
  'src/pages/[lang]/about.astro',
  'src/components/AvatarMark.astro',
  'src/components/ContactIcon.astro',
];
const STYLED_FILES = [
  'src/pages/[lang]/about.astro',
  'src/components/AvatarMark.astro',
];

describe('about surface — INV-9 (no emoji) + no hard-coded colors', () => {
  for (const path of ALL_FILES) {
    const src = read(path);
    it(`${path}: contains no emoji`, () => expect(EMOJI.test(src)).toBe(false));
    it(`${path}: hard-codes no hex color`, () =>
      expect(src).not.toMatch(/#[0-9a-fA-F]{3,6}/));
  }
});

describe('about surface — tokens-only <style> (styled files)', () => {
  for (const path of STYLED_FILES) {
    const styles = styleBlocks(read(path));
    it(`${path}: has a non-empty <style> with no rgb/hsl literal`, () => {
      expect(styles.trim().length).toBeGreaterThan(0);
      expect(styles).not.toMatch(/\brgb\(/);
      expect(styles).not.toMatch(/\bhsl\(/);
      // color-mix(in srgb, var(--accent) …) is allowed — it references a token.
    });
  }
});

describe('AvatarMark.astro + ContactIcon.astro — non-figurative (D-007)', () => {
  const mark = read('src/components/AvatarMark.astro');
  it('AvatarMark renders an abstract lattice, no figure', () => {
    expect(mark).not.toMatch(/<img/);
    expect(mark).not.toMatch(/\bface\b/i);
    expect(mark).not.toContain('rc-avatar');
    expect(mark).toContain('avatar-glyph__node');
    expect(mark).toContain('aria-hidden');
  });
  it('ContactIcon renders inline SVG icons (no <img>, no set:html)', () => {
    const ico = read('src/components/ContactIcon.astro');
    expect(ico).toContain('<svg');
    expect(ico).not.toMatch(/<img/);
    expect(ico).not.toContain('set:html');
    expect(ico).toContain('currentColor');
  });
});

describe('about.astro — structure, brand, link safety, no form (W-2)', () => {
  const src = read('src/pages/[lang]/about.astro');
  it('has exactly one h1 (one-heading-per-page contract)', () =>
    expect((src.match(/<h1/g) ?? []).length).toBe(1));
  it('renders the non-figurative AvatarMark, no <img>/face/rc-avatar', () => {
    expect(src).toContain('AvatarMark');
    expect(src).not.toMatch(/<img/);
    expect(src).not.toMatch(/\bface\b/i);
    expect(src).not.toContain('rc-avatar');
  });
  it('external contact links are rel-safe and open in a new tab', () => {
    expect(src).toContain('noopener noreferrer');
    expect(src).toContain("'_blank'");
  });
  it('embeds no backend contact form (W-2)', () =>
    expect(src).not.toMatch(/<form/i));
});
