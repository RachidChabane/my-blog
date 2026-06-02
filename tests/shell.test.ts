import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Static-source assertions (mirrors tokens.test.ts): guards INV-9 (no emoji) and
// the tokens-only convention deterministically, since no gate regex enforces them.
const root = fileURLToPath(new URL('..', import.meta.url));
const read = (rel: string): string => readFileSync(`${root}/${rel}`, 'utf8');

const CHROME_COMPONENTS = [
  'src/components/Masthead.astro',
  'src/components/Footer.astro',
  'src/components/LanguageSwitcher.astro',
  'src/components/SearchTrigger.astro',
  'src/components/AvatarLauncher.astro',
];

// See ui.test.ts for why Emoji_Presentation (not Extended_Pictographic).
const EMOJI = /\p{Emoji_Presentation}/u;

/** Concatenate the contents of every <style> block in an .astro source. */
function styleBlocks(src: string): string {
  return [...src.matchAll(/<style>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .join('\n');
}

describe('chrome components — INV-9 (no emoji) + tokens-only colors', () => {
  for (const path of CHROME_COMPONENTS) {
    const src = read(path);

    it(`${path}: contains no emoji`, () => {
      expect(EMOJI.test(src)).toBe(false);
    });

    it(`${path}: hard-codes no colors (tokens only)`, () => {
      const styles = styleBlocks(src);
      // Non-empty guard: an empty <style> would pass the no-hex checks vacuously.
      expect(styles.trim().length, 'expected a non-empty <style> block').toBeGreaterThan(0);
      expect(styles).not.toMatch(/#[0-9a-fA-F]{3,6}/); // no hex literal
      expect(styles).not.toMatch(/\brgb\(/); // no rgb()/rgba()
      expect(styles).not.toMatch(/\bhsl\(/); // no hsl()/hsla()
      // color-mix(in srgb, var(--accent) …) is allowed — it references a token.
    });
  }
});

describe('Masthead.astro — wordmark is a link, not a heading', () => {
  const src = read('src/components/Masthead.astro');

  it('renders the wordmark as <a class="masthead__wordmark" href={localePath(lang)}>', () => {
    expect(src).toContain('class="masthead__wordmark"');
    expect(src).toContain('href={localePath(lang)}');
  });

  it('contains no <h1> (preserves the single page-content h1)', () => {
    expect(src).not.toMatch(/<h1/);
  });

  it('composes the search trigger, language switcher and theme toggle', () => {
    expect(src).toContain('<SearchTrigger');
    expect(src).toContain('<LanguageSwitcher');
    expect(src).toContain('<ThemeToggle');
  });
});

describe('Footer.astro — RSS href avoids the localePath trailing-slash trap', () => {
  const src = read('src/components/Footer.astro');

  it('uses the raw `/${lang}/rss.xml` template (not /fr/rss.xml/)', () => {
    expect(src).toContain('`/${lang}/rss.xml`');
  });

  it("does not call localePath(lang, 'rss.xml')", () => {
    expect(src).not.toContain("localePath(lang, 'rss.xml')");
  });

  it('mirrors the language switcher and theme toggle', () => {
    expect(src).toContain('<LanguageSwitcher');
    expect(src).toContain('<ThemeToggle');
  });
});

describe('AvatarLauncher.astro — non-figurative inert slot (D-007)', () => {
  const src = read('src/components/AvatarLauncher.astro');

  it('is a labelled, inert lattice slot', () => {
    expect(src).toContain('data-avatar-slot');
    expect(src).toContain('aria-hidden');
    expect(src).toContain('avatar-mark__node');
  });

  it('renders no figure (no <img>, no "face", no rc-avatar element)', () => {
    expect(src).not.toMatch(/<img/);
    // Word-boundary: the figurative word "face", NOT the --surface token.
    expect(src).not.toMatch(/\bface\b/i);
    expect(src).not.toContain('rc-avatar');
  });
});

describe('Base.astro — composes the shell', () => {
  const src = read('src/layouts/Base.astro');

  it('imports Masthead, Footer and AvatarLauncher', () => {
    expect(src).toContain('Masthead');
    expect(src).toContain('Footer');
    expect(src).toContain('AvatarLauncher');
  });

  it('renders <main id="main"> reached by a skip-link', () => {
    expect(src).toMatch(/<main id="main"/);
    expect(src).toContain('class="skip-link"');
    expect(src).toContain('href="#main"');
  });
});
