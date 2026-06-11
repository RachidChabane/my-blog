import { describe, it, expect } from 'vitest';
import {
  articleFrontmatterSchema,
  projectFrontmatterSchema,
  tagSchema,
} from '@/content/schemas';
import {
  ARTICLE_FR,
  ARTICLE_EN,
  PROJECT_FR,
  PROJECT_EN,
  TAG_FIXTURE,
} from '@/content/fixtures/index';

describe('articleFrontmatterSchema', () => {
  it('1. valid FR fixture parses', () => {
    const result = articleFrontmatterSchema.safeParse(ARTICLE_FR);
    expect(result.success).toBe(true);
  });

  it('2. valid EN fixture parses', () => {
    const result = articleFrontmatterSchema.safeParse(ARTICLE_EN);
    expect(result.success).toBe(true);
  });

  it('3. missing required field fails', () => {
    const rest = Object.fromEntries(
      Object.entries(ARTICLE_FR).filter(([k]) => k !== 'translationKey')
    );
    const result = articleFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('4. wrong lang value fails', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      lang: 'de',
    });
    expect(result.success).toBe(false);
  });

  it('5. invalid publishDate format (ISO) fails', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      publishDate: '2026-06-01',
    });
    expect(result.success).toBe(false);
  });

  it('6. empty tags array fails', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      tags: [],
    });
    expect(result.success).toBe(false);
  });

  it('7. only one source fails', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      sources: [ARTICLE_FR.sources[0]],
    });
    expect(result.success).toBe(false);
  });

  it('7b. difficulty is required and must be an integer 1-5', () => {
    const noDifficulty = Object.fromEntries(
      Object.entries(ARTICLE_FR).filter(([k]) => k !== 'difficulty')
    );
    expect(articleFrontmatterSchema.safeParse(noDifficulty).success).toBe(
      false
    );
    for (const bad of [0, 6, 2.5, '3']) {
      expect(
        articleFrontmatterSchema.safeParse({ ...ARTICLE_FR, difficulty: bad })
          .success,
        `difficulty=${String(bad)}`
      ).toBe(false);
    }
    for (const ok of [1, 3, 5]) {
      expect(
        articleFrontmatterSchema.safeParse({ ...ARTICLE_FR, difficulty: ok })
          .success
      ).toBe(true);
    }
  });

  it('7c. lessons is a valid category', () => {
    expect(
      articleFrontmatterSchema.safeParse({ ...ARTICLE_FR, category: 'lessons' })
        .success
    ).toBe(true);
  });

  it('8. invalid source URL fails', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      sources: [
        { ...ARTICLE_FR.sources[0], url: 'not-a-url' },
        ARTICLE_FR.sources[1],
      ],
    });
    expect(result.success).toBe(false);
  });

  it('9. both publishState values accepted', () => {
    expect(
      articleFrontmatterSchema.safeParse({
        ...ARTICLE_FR,
        publishState: 'published',
      }).success
    ).toBe(true);
    expect(
      articleFrontmatterSchema.safeParse({
        ...ARTICLE_FR,
        publishState: 'draft',
      }).success
    ).toBe(true);
  });

  it('10. extra fields are stripped', () => {
    const result = articleFrontmatterSchema.safeParse({
      ...ARTICLE_FR,
      unexpectedKey: 'some-value',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('unexpectedKey' in result.data).toBe(false);
    }
  });
});

describe('projectFrontmatterSchema', () => {
  it('11. valid FR fixture parses', () => {
    const result = projectFrontmatterSchema.safeParse(PROJECT_FR);
    expect(result.success).toBe(true);
  });

  it('12. valid EN fixture parses', () => {
    const result = projectFrontmatterSchema.safeParse(PROJECT_EN);
    expect(result.success).toBe(true);
  });

  it('13. optional fields absent parses successfully', () => {
    const rest = Object.fromEntries(
      Object.entries(PROJECT_FR).filter(
        ([k]) => k !== 'relatedArticles' && k !== 'derivedFrom'
      )
    );
    const result = projectFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(true);
  });

  it('14. non-http link URL (ftp) fails', () => {
    const result = projectFrontmatterSchema.safeParse({
      ...PROJECT_FR,
      links: [{ label: 'Repo', url: 'ftp://example.com/path' }],
    });
    expect(result.success).toBe(false);
  });

  it('15. missing required field (name) fails', () => {
    const rest = Object.fromEntries(
      Object.entries(PROJECT_FR).filter(([k]) => k !== 'name')
    );
    const result = projectFrontmatterSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

describe('tagSchema', () => {
  it('16. valid tag parses', () => {
    const result = tagSchema.safeParse(TAG_FIXTURE);
    expect(result.success).toBe(true);
  });

  it('17. missing label.en fails', () => {
    const result = tagSchema.safeParse({
      slug: 'agents-ia',
      label: { fr: 'Agents IA' },
    });
    expect(result.success).toBe(false);
  });

  it('18. empty slug fails', () => {
    const result = tagSchema.safeParse({ ...TAG_FIXTURE, slug: '' });
    expect(result.success).toBe(false);
  });
});

describe('translationKey pairing', () => {
  it('19. FR and EN article share translationKey', () => {
    expect(ARTICLE_FR.translationKey).toBe(ARTICLE_EN.translationKey);
  });

  it('20. FR and EN article have distinct slugs', () => {
    expect(ARTICLE_FR.slug).not.toBe(ARTICLE_EN.slug);
  });

  it('21. FR and EN article have correct lang values', () => {
    expect(ARTICLE_FR.lang).toBe('fr');
    expect(ARTICLE_EN.lang).toBe('en');
  });

  it('22. FR and EN project share translationKey', () => {
    expect(PROJECT_FR.translationKey).toBe(PROJECT_EN.translationKey);
  });
});
