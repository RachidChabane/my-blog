import { describe, it, expect } from 'vitest';
import {
  CHROME,
  NAV_ITEMS,
  chrome,
  ARTICLE_DETAIL,
  articleDetailStrings,
  PORTFOLIO_INDEX,
  portfolioIndexStrings,
} from '@/i18n/ui';
import { LOCALES } from '@/i18n/index';

// Property escape + `u` flag — NOT a control-char range, so this satisfies
// eslint `no-control-regex`. Use Emoji_Presentation (NOT Extended_Pictographic):
// the latter false-positives on ©/® (the footer's legitimate copyright symbol),
// while Emoji_Presentation flags only default-emoji-presentation characters.
const EMOJI = /\p{Emoji_Presentation}/u;

describe('chrome string table (CHROME)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(CHROME.fr).sort()).toEqual(
      Object.keys(CHROME.en).sort()
    );
  });

  it('every chrome string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(CHROME[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('localizes the primary nav labels', () => {
    expect(CHROME.fr.navArticles).toBe('Articles');
    expect(CHROME.fr.navWork).toBe('Projets');
    expect(CHROME.fr.navAbout).toBe('À propos');
    expect(CHROME.en.navArticles).toBe('Articles');
    expect(CHROME.en.navWork).toBe('Projects');
    expect(CHROME.en.navAbout).toBe('About');
  });

  it('carries the autonomous-maintenance credit verbatim (design-sourced)', () => {
    expect(CHROME.fr.footerCredit).toBe('écrit et maintenu de façon autonome');
    expect(CHROME.en.footerCredit).toBe('written and maintained autonomously');
  });

  it('keeps "theme" in EN themeToggleAria (guards the e2e /theme/i locator)', () => {
    expect(CHROME.en.themeToggleAria.toLowerCase()).toContain('theme');
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(CHROME[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('chrome(lang) returns the locale record', () => {
    expect(chrome('fr')).toBe(CHROME.fr);
    expect(chrome('en')).toBe(CHROME.en);
  });
});

describe('article-detail string table (ARTICLE_DETAIL)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(ARTICLE_DETAIL.fr).sort()).toEqual(
      Object.keys(ARTICLE_DETAIL.en).sort()
    );
  });

  it('every detail string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ARTICLE_DETAIL[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ARTICLE_DETAIL[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('articleDetailStrings(lang) returns the locale record', () => {
    expect(articleDetailStrings('fr')).toBe(ARTICLE_DETAIL.fr);
    expect(articleDetailStrings('en')).toBe(ARTICLE_DETAIL.en);
  });
});

describe('NAV_ITEMS', () => {
  it('maps three localized labels to shared route slugs', () => {
    expect(NAV_ITEMS).toHaveLength(3);
    expect(NAV_ITEMS.map((it) => it.path)).toEqual(['blog', 'work', 'about']);
  });

  it('every nav key resolves to a chrome string in both locales', () => {
    for (const item of NAV_ITEMS) {
      expect(typeof CHROME.fr[item.key]).toBe('string');
      expect(typeof CHROME.en[item.key]).toBe('string');
    }
  });
});

describe('portfolio-index string table (PORTFOLIO_INDEX)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(PORTFOLIO_INDEX.fr).sort()).toEqual(
      Object.keys(PORTFOLIO_INDEX.en).sort()
    );
  });

  it('every portfolio string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(PORTFOLIO_INDEX[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(PORTFOLIO_INDEX[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('carries the design-sourced eyebrow/title copy verbatim', () => {
    expect(PORTFOLIO_INDEX.fr.title).toBe('Projets');
    expect(PORTFOLIO_INDEX.en.title).toBe('Projects');
    expect(PORTFOLIO_INDEX.fr.eyebrow).toBe('Travaux');
    expect(PORTFOLIO_INDEX.en.eyebrow).toBe('Work');
  });

  it('portfolioIndexStrings(lang) returns the locale record', () => {
    expect(portfolioIndexStrings('fr')).toBe(PORTFOLIO_INDEX.fr);
    expect(portfolioIndexStrings('en')).toBe(PORTFOLIO_INDEX.en);
  });
});
