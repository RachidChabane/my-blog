import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  localePath,
  switcherHref,
  parseAcceptLanguage,
} from '@/i18n/index';

describe('locale constants', () => {
  it('LOCALES contains fr and en', () => {
    expect(LOCALES).toContain('fr');
    expect(LOCALES).toContain('en');
  });

  it('DEFAULT_LOCALE is fr', () => {
    expect(DEFAULT_LOCALE).toBe('fr');
  });
});

describe('isValidLocale', () => {
  it('accepts supported locales', () => {
    expect(isValidLocale('fr')).toBe(true);
    expect(isValidLocale('en')).toBe(true);
  });

  it('rejects unsupported values', () => {
    expect(isValidLocale('de')).toBe(false);
    expect(isValidLocale('')).toBe(false);
    expect(isValidLocale('FR')).toBe(false);
  });
});

describe('localePath', () => {
  it('returns locale root with trailing slash', () => {
    expect(localePath('fr')).toBe('/fr/');
    expect(localePath('en')).toBe('/en/');
  });

  it('appends a sub-path under the locale root', () => {
    expect(localePath('en', 'blog/my-post')).toBe('/en/blog/my-post/');
    expect(localePath('fr', 'blog/mon-article')).toBe('/fr/blog/mon-article/');
  });

  it('strips a leading slash from the sub-path', () => {
    expect(localePath('en', '/blog/post')).toBe('/en/blog/post/');
  });

  it('strips a trailing slash from the sub-path', () => {
    expect(localePath('en', 'blog/post/')).toBe('/en/blog/post/');
  });
});

describe('switcherHref', () => {
  it('returns the localized index when no slug map is provided', () => {
    expect(switcherHref('fr')).toBe('/fr/');
    expect(switcherHref('en')).toBe('/en/');
  });

  it('returns the content URL when the target locale has a slug', () => {
    const slugMap = { fr: 'mon-article', en: 'my-article' };
    expect(switcherHref('en', slugMap)).toBe('/en/blog/my-article/');
    expect(switcherHref('fr', slugMap)).toBe('/fr/blog/mon-article/');
  });

  it('falls back to the localized index when target locale has no slug (NFR-11 never dead)', () => {
    const slugMap = { fr: 'mon-article' };
    expect(switcherHref('en', slugMap)).toBe('/en/');
  });

  it('falls back to index when slug map is empty', () => {
    expect(switcherHref('en', {})).toBe('/en/');
  });
});

describe('parseAcceptLanguage', () => {
  it('returns DEFAULT_LOCALE for an empty header', () => {
    expect(parseAcceptLanguage('')).toBe('fr');
  });

  it('detects French from fr-FR', () => {
    expect(parseAcceptLanguage('fr-FR,fr;q=0.9,en-US;q=0.8')).toBe('fr');
  });

  it('detects English from en-US', () => {
    expect(parseAcceptLanguage('en-US,en;q=0.9')).toBe('en');
  });

  it('respects q-values (picks the highest-priority supported locale)', () => {
    expect(parseAcceptLanguage('de;q=1.0,en;q=0.8,fr;q=0.7')).toBe('en');
  });

  it('falls back to DEFAULT_LOCALE when no supported locale matches', () => {
    expect(parseAcceptLanguage('de,ja')).toBe('fr');
  });

  it('handles bare locale tags without region subtag', () => {
    expect(parseAcceptLanguage('en')).toBe('en');
    expect(parseAcceptLanguage('fr')).toBe('fr');
  });
});
