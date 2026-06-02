import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(`${root}/src/styles/tokens.css`, 'utf8');

describe('design tokens contract', () => {
  it('renamed the accent scale --ember-* → --iris-* (no vestigial ember)', () => {
    expect(css).not.toMatch(/--ember-/);
    expect(css).toMatch(/--iris-600:\s*#5b4be0/i);
    expect(css).toMatch(/--iris-400:\s*#7c6bff/i);
  });

  it('wires --accent to the iris scale in both registers', () => {
    expect(css).toMatch(/--accent:\s*var\(--iris-600\)/);
    expect(css).toMatch(/--accent:\s*var\(--iris-400\)/);
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
