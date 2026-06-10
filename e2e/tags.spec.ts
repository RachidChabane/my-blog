import { test, expect } from '@playwright/test';

// S4 tag directory + S5 tag index. Both routes exist now, so directory → index is
// clicked (the task's headline e2e). Counts are pinned to the seed corpus
// (agents=3, qualite=1) and cross-check tagCounts (S4) against getArticlesByTag (S5).

test.describe('S4 tag directory', () => {
  test('FR: 7 curated topics with counts; agents shows 3', async ({ page }) => {
    await page.goto('/fr/tags/');
    await expect(page.locator('h1')).toHaveText('Sujets');
    await expect(page.locator('.rc-tagdir .rc-tagcard')).toHaveCount(7);
    const agents = page.locator(
      '.rc-tagdir .rc-tagcard[href="/fr/tags/agents/"]'
    );
    await expect(agents).toBeVisible();
    await expect(agents.locator('.rc-tagcard__count')).toHaveText('3');
  });

  test('EN: parallel directory, English h1, /en/ hrefs', async ({ page }) => {
    await page.goto('/en/tags/');
    await expect(page.locator('h1')).toHaveText('Topics');
    await expect(page.locator('.rc-tagdir .rc-tagcard')).toHaveCount(7);
    await expect(
      page.locator('.rc-tagcard[href="/en/tags/agents/"]')
    ).toBeVisible();
  });
});

test.describe('S4 → S5 navigation (the headline flow)', () => {
  test('FR: click "agents" → its tag index lists 3 articles, chip active, back-link to S4', async ({
    page,
  }) => {
    await page.goto('/fr/tags/');
    await page.locator('.rc-tagcard[href="/fr/tags/agents/"]').click();
    await expect(page).toHaveURL('/fr/tags/agents/');

    // h1 = the localized tag label
    await expect(page.locator('h1')).toHaveText('agents');
    // exactly 3 rows — cross-checks S4 count (tagCounts) vs S5 rows (getArticlesByTag)
    await expect(page.locator('article.rc-arow')).toHaveCount(3);
    // the chip rail marks THIS tag active (locks the TagChips activeSlug reuse)
    const onChip = page.locator('[data-tag-rail] a.rc-chip.is-on');
    await expect(onChip).toHaveText('agents');
    await expect(onChip).toHaveAttribute('href', '/fr/tags/agents/');
    // rows reuse the S2 item layout → title links into /fr/blog/
    await expect(
      page.locator('article.rc-arow .rc-arow__title a').first()
    ).toHaveAttribute('href', /^\/fr\/blog\/.+\/$/);
    // back-link returns to the directory
    await expect(page.locator('a.rc-back[href="/fr/tags/"]')).toBeVisible();
  });
});

test.describe('S5 tag index — scope + shared chip rail', () => {
  test('FR: qualite tag page lists its articles (plural count form)', async ({
    page,
  }) => {
    await page.goto('/fr/tags/qualite/');
    await expect(page.locator('h1')).toHaveText('qualité');
    const rows = page.locator('article.rc-arow');
    await expect(rows.first()).toBeVisible();
    const n = await rows.count();
    expect(n).toBeGreaterThanOrEqual(2);
    await expect(page.locator('.rc-pagehd__meta')).toHaveText(`${n} écrits`);
  });

  test('EN: the chip-rail "All" returns to the blog index (unfiltered), not a dead end', async ({
    page,
  }) => {
    await page.goto('/en/tags/rag/');
    // "All" is the chip pointing at the blog index (robust: locate by href, not text)
    await expect(
      page.locator('[data-tag-rail] a.rc-chip[href="/en/blog/"]')
    ).toBeVisible();
  });
});

test.describe('language switch on S4/S5 (no slugMap → home; guards the blog-hardcode 404)', () => {
  test('FR /tags/ → EN switcher falls back to /en/', async ({ page }) => {
    await page.goto('/fr/tags/');
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });

  test('FR /tags/agents/ → EN switcher falls back to /en/ (NOT /en/blog/agents/)', async ({
    page,
  }) => {
    await page.goto('/fr/tags/agents/');
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });
});
