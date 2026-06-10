import { describe, it, expect } from 'vitest';
import {
  CHROME,
  NAV_ITEMS,
  chrome,
  ARTICLE_DETAIL,
  articleDetailStrings,
  PROJECT_DETAIL,
  projectDetailStrings,
  PORTFOLIO_INDEX,
  portfolioIndexStrings,
  TAGS,
  tagStrings,
  NOT_FOUND,
  notFoundStrings,
  ABOUT,
  aboutStrings,
  CONTACTS,
  SEARCH,
  searchStrings,
  AVATAR,
  avatarStrings,
  HOME,
  homeStrings,
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

describe('project-detail string table (PROJECT_DETAIL)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(PROJECT_DETAIL.fr).sort()).toEqual(
      Object.keys(PROJECT_DETAIL.en).sort()
    );
  });

  it('every detail string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(PROJECT_DETAIL[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(PROJECT_DETAIL[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('localizes the two named depth-section headings (U+2019 in FR)', () => {
    expect(PROJECT_DETAIL.fr.hWhat).toBe('Ce que c’est');
    expect(PROJECT_DETAIL.fr.hEng).toBe('Ingénierie');
    expect(PROJECT_DETAIL.en.hWhat).toBe('What it is');
    expect(PROJECT_DETAIL.en.hEng).toBe('Engineering');
  });

  it('projectDetailStrings(lang) returns the locale record', () => {
    expect(projectDetailStrings('fr')).toBe(PROJECT_DETAIL.fr);
    expect(projectDetailStrings('en')).toBe(PROJECT_DETAIL.en);
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

describe('tag string table (TAGS)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(TAGS.fr).sort()).toEqual(Object.keys(TAGS.en).sort());
  });

  it('every tag string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(TAGS[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(TAGS[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('carries the directory title copy verbatim', () => {
    expect(TAGS.fr.dirTitle).toBe('Sujets');
    expect(TAGS.en.dirTitle).toBe('Topics');
  });

  it('count templates carry the {n} placeholder for formatCount to substitute', () => {
    for (const locale of LOCALES) {
      expect(TAGS[locale].countOne, `${locale}.countOne`).toContain('{n}');
      expect(TAGS[locale].countMany, `${locale}.countMany`).toContain('{n}');
    }
  });

  it('tagStrings(lang) returns the locale record', () => {
    expect(tagStrings('fr')).toBe(TAGS.fr);
    expect(tagStrings('en')).toBe(TAGS.en);
  });
});

describe('not-found string table (NOT_FOUND)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(NOT_FOUND.fr).sort()).toEqual(
      Object.keys(NOT_FOUND.en).sort()
    );
  });

  it('every not-found string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(NOT_FOUND[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(NOT_FOUND[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('carries the 404 eyebrow verbatim', () => {
    expect(NOT_FOUND.fr.eyebrow).toBe('404');
    expect(NOT_FOUND.en.eyebrow).toBe('404');
  });

  it('notFoundStrings(lang) returns the locale record', () => {
    expect(notFoundStrings('fr')).toBe(NOT_FOUND.fr);
    expect(notFoundStrings('en')).toBe(NOT_FOUND.en);
  });

  it('ctaSearch is non-empty in both locales', () => {
    expect(NOT_FOUND.fr.ctaSearch.length).toBeGreaterThan(0);
    expect(NOT_FOUND.en.ctaSearch.length).toBeGreaterThan(0);
  });
});

describe('about string table (ABOUT)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(ABOUT.fr).sort()).toEqual(Object.keys(ABOUT.en).sort());
  });

  it('every about string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ABOUT[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('localizes the how-it-works heading (design-sourced)', () => {
    expect(ABOUT.fr.howH).toBe('Comment ce site fonctionne');
    expect(ABOUT.en.howH).toBe('How this site works');
  });

  // Lock the e2e substrings to the source so the string + assertion cannot drift.
  it('how-it-works text carries the human-out-of-the-loop claim the e2e asserts', () => {
    expect(ABOUT.fr.howText).toContain('sans intervention humaine');
    expect(ABOUT.en.howText).toContain('no human in the loop');
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ABOUT[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  // Regression: the page once shipped bracketed owner-fill scaffolding
  // (e.g. "[short bio, first person, ...]"). Guard against a relapse.
  it('carries no leftover bracketed placeholder copy', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ABOUT[locale])) {
        expect(value, `${locale}.${key}`).not.toMatch(/[[\]]/);
      }
    }
  });

  // Standing owner directive: zero em-dashes (U+2014) site-wide.
  it('contains no em-dash (U+2014) in any string', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(ABOUT[locale])) {
        expect(value.includes('—'), `${locale}.${key}`).toBe(false);
      }
    }
  });

  it('aboutStrings(lang) returns the locale record', () => {
    expect(aboutStrings('fr')).toBe(ABOUT.fr);
    expect(aboutStrings('en')).toBe(ABOUT.en);
  });
});

describe('contact links (CONTACTS)', () => {
  it('ships GitHub as a real, verifiably-public link', () => {
    const gh = CONTACTS.find((c) => c.icon === 'github');
    expect(gh?.href).toBe('https://github.com/RachidChabane');
  });

  // The owner published email + LinkedIn from the public résumé (the privacy gate
  // in CLAUDE.md #3 / FR-D3 is the owner's call, now made): email is a mailto,
  // LinkedIn a public https profile. All rows are live links → the e2e
  // is-placeholder count is 0.
  it('ships email as a mailto and linkedin as a public https profile', () => {
    expect(CONTACTS.find((c) => c.icon === 'mail')?.href).toBe(
      'mailto:rachid.chabane59@gmail.com'
    );
    expect(CONTACTS.find((c) => c.icon === 'linkedin')?.href).toMatch(
      /^https:\/\/www\.linkedin\.com\/in\//
    );
  });

  it('every live href is https or mailto; every entry has a non-empty label', () => {
    for (const c of CONTACTS) {
      expect(c.label.trim().length).toBeGreaterThan(0);
      if (c.href) expect(c.href).toMatch(/^(https:\/\/|mailto:)/);
    }
  });

  it('contains no emoji in labels/values (INV-9)', () => {
    for (const c of CONTACTS) {
      expect(EMOJI.test(c.label)).toBe(false);
      if ('value' in c && c.value) expect(EMOJI.test(c.value)).toBe(false);
    }
  });
});

describe('search string table (SEARCH)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(SEARCH.fr).sort()).toEqual(
      Object.keys(SEARCH.en).sort()
    );
  });

  it('every search string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(SEARCH[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(SEARCH[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  it('count templates carry the {n} placeholder for the island to substitute', () => {
    for (const locale of LOCALES) {
      expect(SEARCH[locale].countOne, `${locale}.countOne`).toContain('{n}');
      expect(SEARCH[locale].countMany, `${locale}.countMany`).toContain('{n}');
    }
  });

  // The task names this string ("quiet empty state"); lock it to the source.
  it('carries the no-result empty-state copy verbatim', () => {
    expect(SEARCH.fr.empty).toBe('Aucun résultat');
    expect(SEARCH.en.empty).toBe('No results');
  });

  it('searchStrings(lang) returns the locale record', () => {
    expect(searchStrings('fr')).toBe(SEARCH.fr);
    expect(searchStrings('en')).toBe(SEARCH.en);
  });
});

describe('avatar string table (AVATAR)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(AVATAR.fr).sort()).toEqual(
      Object.keys(AVATAR.en).sort()
    );
  });

  it('every avatar string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(AVATAR[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(AVATAR[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  // Lock the out-of-scope chip + FR head title verbatim (the e2e specs assert
  // these exact strings; source + assertion cannot drift).
  it('carries the out-of-scope tag and FR title verbatim', () => {
    expect(AVATAR.fr.refuseTag).toBe('hors périmètre');
    expect(AVATAR.en.refuseTag).toBe('out of scope');
    expect(AVATAR.fr.title).toBe('Demander à l’agent');
  });

  it('avatarStrings(lang) returns the locale record', () => {
    expect(avatarStrings('fr')).toBe(AVATAR.fr);
    expect(avatarStrings('en')).toBe(AVATAR.en);
  });
});

describe('home string table (HOME)', () => {
  it('fr and en expose identical key sets (bilingual parity — NFR-11)', () => {
    expect(Object.keys(HOME.fr).sort()).toEqual(Object.keys(HOME.en).sort());
  });

  it('every home string is a non-empty string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(HOME[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('contains no emoji in any string (INV-9)', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(HOME[locale])) {
        expect(EMOJI.test(value), `${locale}.${key} = "${value}"`).toBe(false);
      }
    }
  });

  // Lock the e2e-asserted block titles + the branded metaTitle to the source so
  // the strings and the home.spec assertions cannot drift apart.
  it('carries the block titles verbatim and a branded metaTitle', () => {
    expect(HOME.fr.latestTitle).toBe('Derniers articles');
    expect(HOME.en.latestTitle).toBe('Latest articles');
    expect(HOME.fr.projectsTitle).toBe('Projets');
    expect(HOME.en.projectsTitle).toBe('Projects');
    expect(HOME.fr.metaTitle).toContain('Rachid Chabane');
    expect(HOME.en.metaTitle).toContain('Rachid Chabane');
  });

  it('homeStrings(lang) returns the locale record', () => {
    expect(homeStrings('fr')).toBe(HOME.fr);
    expect(homeStrings('en')).toBe(HOME.en);
  });
});
