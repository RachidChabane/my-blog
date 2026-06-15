import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(`${root}/src/styles/tokens.css`, 'utf8');

describe('design tokens contract', () => {
  it('wires the accent scale to one warm Clay ink (DOSSIER)', () => {
    // The overhaul replaces the vestigial iris-violet scale with a single warm
    // Clay accent, tuned per theme (light = AA-small safe; dark = soft/bright).
    expect(css).not.toMatch(/--iris-/);
    expect(css).toMatch(/--clay-light:\s*#a8492a/i);
    expect(css).toMatch(/--clay-dark:\s*#e2966a/i);
  });

  it('wires --accent to Clay in both registers', () => {
    expect(css).toMatch(/--accent:\s*var\(--clay-light\)/);
    expect(css).toMatch(/--accent:\s*var\(--clay-dark\)/);
  });

  it('defines the core semantic tokens', () => {
    for (const t of [
      '--bg',
      '--fg',
      '--surface',
      '--border',
      '--accent',
      '--accent-ring',
      '--shadow-md',
    ]) {
      expect(css).toContain(t);
    }
  });

  it('ships light and dark registers via [data-theme] with color-scheme', () => {
    expect(css).toMatch(/\[data-theme=['"]light['"]\]/);
    expect(css).toMatch(/\[data-theme=['"]dark['"]\]/);
    expect(css).toContain('color-scheme: light');
    expect(css).toContain('color-scheme: dark');
  });

  it('keeps the prefers-reduced-motion guard', () => {
    expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('declares the three brand families', () => {
    // Quote-tolerant (['"]): mirrors the [data-theme=…] / url() regexes below and
    // stays green regardless of quote style. (The repo's .prettierrc sets
    // singleQuote:true and Prettier keeps CSS single quotes, so single survives format.)
    expect(css).toMatch(/--font-display:\s*['"]Fraunces['"]/);
    expect(css).toMatch(/--font-body:\s*['"]Inter['"]/);
    expect(css).toMatch(/--font-mono:\s*['"]JetBrains Mono['"]/);
  });

  it('@font-face uses absolute /fonts/ URLs and every referenced TTF exists', () => {
    const urls = [...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map(
      (m) => m[2]
    );
    expect(urls.length).toBeGreaterThanOrEqual(5);
    for (const u of urls) {
      expect(u.startsWith('/fonts/')).toBe(true);
      expect(existsSync(`${root}/public${u}`)).toBe(true);
    }
  });

  it('exposes the space / radius / motion scales', () => {
    for (const t of [
      '--sp-4',
      '--radius',
      '--radius-pill',
      '--ease-soft',
      '--dur-hover',
    ]) {
      expect(css).toContain(t);
    }
  });
});
