import { describe, it, expect } from 'vitest';
import { projectFrontmatterSchema } from '@/content/schemas';
import {
  PORTFOLIO_PROJECTS,
  FLAGGED_TERMS,
  generateAll,
  buildFrontmatter,
  safetyCheck,
} from '../scripts/gen-portfolio';

const EXPECTED_PROJECT_COUNT = 7;

describe('generateAll()', () => {
  const files = generateAll();

  it('returns 2 files per project', () => {
    expect(files).toHaveLength(EXPECTED_PROJECT_COUNT * 2);
  });

  it('all filenames are unique', () => {
    const names = files.map(f => f.filename);
    expect(new Set(names).size).toBe(names.length);
  });

  it('each project has exactly one FR and one EN entry', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      const fr = files.filter(f => f.translationKey === entry.translationKey && f.lang === 'fr');
      const en = files.filter(f => f.translationKey === entry.translationKey && f.lang === 'en');
      expect(fr).toHaveLength(1);
      expect(en).toHaveLength(1);
    }
  });

  it('all filenames follow {translationKey}.{lang}.md pattern', () => {
    for (const file of files) {
      expect(file.filename).toBe(`${file.translationKey}.${file.lang}.md`);
    }
  });
});

describe('buildFrontmatter() schema validation', () => {
  it('all FR frontmatter objects validate against projectFrontmatterSchema', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      const fm = buildFrontmatter(entry, 'fr');
      const result = projectFrontmatterSchema.safeParse(fm);
      expect(result.success, `FR entry ${entry.translationKey} failed: ${JSON.stringify(result)}`).toBe(true);
    }
  });

  it('all EN frontmatter objects validate against projectFrontmatterSchema', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      const fm = buildFrontmatter(entry, 'en');
      const result = projectFrontmatterSchema.safeParse(fm);
      expect(result.success, `EN entry ${entry.translationKey} failed: ${JSON.stringify(result)}`).toBe(true);
    }
  });

  it('FR lang field is "fr"', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      expect(buildFrontmatter(entry, 'fr').lang).toBe('fr');
    }
  });

  it('EN lang field is "en"', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      expect(buildFrontmatter(entry, 'en').lang).toBe('en');
    }
  });

  it('FR and EN slugs are distinct within the same project', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      const frSlug = buildFrontmatter(entry, 'fr').slug;
      const enSlug = buildFrontmatter(entry, 'en').slug;
      expect(frSlug).not.toBe(enSlug);
    }
  });

  it('FR and EN share translationKey', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      expect(buildFrontmatter(entry, 'fr').translationKey).toBe(
        buildFrontmatter(entry, 'en').translationKey
      );
    }
  });

  it('all links use http or https', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      for (const link of entry.links) {
        expect(link.url).toMatch(/^https?:\/\//);
      }
    }
  });

  it('publishState is draft or published', () => {
    for (const entry of PORTFOLIO_PROJECTS) {
      expect(['draft', 'published']).toContain(entry.publishState);
    }
  });
});

describe('safetyCheck()', () => {
  it('returns empty array for clean content', () => {
    expect(safetyCheck('A clean description of a public project.')).toEqual([]);
  });

  it('detects a raw directory name (quality-gate-AI)', () => {
    const violations = safetyCheck('This project lives in quality-gate-AI directory.');
    expect(violations).toContain('quality-gate-AI');
  });

  it('detects a third-party name (Rose Torres)', () => {
    const violations = safetyCheck('Authored by Rose Torres.');
    expect(violations).toContain('Rose Torres');
  });

  it('detects secret-related file names (SCALEWAY_SECRETS_BACKUP)', () => {
    const violations = safetyCheck('See SCALEWAY_SECRETS_BACKUP.txt for credentials.');
    expect(violations).toContain('SCALEWAY_SECRETS_BACKUP');
  });

  it('returns multiple violations when multiple flagged terms appear', () => {
    const violations = safetyCheck('knowledge-master has Rose Torres data.');
    expect(violations.length).toBeGreaterThanOrEqual(2);
  });

  it('FLAGGED_TERMS covers at least the key private directory names', () => {
    const required = [
      'quality-gate-AI', 'knowledge-master', 'math-monster',
      'Rose Torres', 'Ikram Mameche', 'SCALEWAY_SECRETS_BACKUP',
    ];
    for (const term of required) {
      expect(FLAGGED_TERMS).toContain(term);
    }
  });
});

describe('no flagged terms in any generated file', () => {
  const files = generateAll();

  it('all generated content passes safetyCheck()', () => {
    for (const file of files) {
      const violations = safetyCheck(file.content);
      expect(
        violations,
        `${file.filename} contains flagged terms: ${violations.join(', ')}`
      ).toEqual([]);
    }
  });
});

describe('reproducibility', () => {
  it('generateAll() is idempotent (two calls return identical content)', () => {
    const run1 = generateAll();
    const run2 = generateAll();
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i]!.content).toBe(run2[i]!.content);
    }
  });
});
