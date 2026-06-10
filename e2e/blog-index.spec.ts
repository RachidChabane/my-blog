import { test, expect } from '@playwright/test';

// S2 — Article index. Selectors use CLASSES (language-robust). Forward-referenced
// links (article <slug> pages → task 8, tag <slug> pages → task 9) are asserted by
// href and NEVER clicked — same convention as e2e/shell.spec.ts.
//
// The index is now a SINGLE page that renders ALL published articles grouped by the
// 3-way `category` taxonomy (Essays / Explainers / Briefings), one <section> + <h2>
// per non-empty category, in CATEGORY_ORDER. Pagination was removed (category groups
// don't compose with page boundaries), so `/blog/2/` no longer exists. The 8 seed
// articles all default to `explainers`, so today the index shows ONE section
// ("Explainers" / "Décryptages") with all 8 rows.

test.describe('S2 list renders', () => {
  test('FR: newest-first, all 8 items grouped by category, per-item meta/dek/title-link', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');
    await expect(page.locator('h1')).toHaveText('Articles');

    // Category section heading (vocab label, FR). The seed corpus is all-explainers.
    await expect(
      page.getByRole('heading', { level: 2, name: 'Décryptages' })
    ).toBeVisible();

    const rows = page.locator('article.rc-arow');
    await expect(rows).toHaveCount(8);

    // newest-first: the 30-05-2026 post leads
    const firstTitle = rows.first().locator('.rc-arow__title a');
    await expect(firstTitle).toHaveText(
      'Orchestrer des agents de code avec des workflows déterministes'
    );
    await expect(firstTitle).toHaveAttribute('href', /^\/fr\/blog\/.+\/$/);

    // per-item: date (DD-MM-YYYY) + reading-time in the meta, plus a dek
    const first = rows.first();
    await expect(first.locator('.rc-meta')).toContainText(/\d{2}-\d{2}-\d{4}/);
    await expect(first.locator('.rc-meta')).toContainText(/\d+ min/);
    await expect(first.locator('.rc-arow__dek')).toBeVisible();
  });

  test('EN: parallel list, English titles, /en/ title-link hrefs, category heading', async ({
    page,
  }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('h1')).toHaveText('Articles');
    // Category section heading (vocab label, EN).
    await expect(
      page.getByRole('heading', { level: 2, name: 'Explainers' })
    ).toBeVisible();
    await expect(page.locator('article.rc-arow')).toHaveCount(8);
    await expect(
      page.locator('article.rc-arow .rc-arow__title a').first()
    ).toHaveAttribute('href', /^\/en\/blog\/.+\/$/);
    await expect(
      page.getByText('Hybrid RAG: reciprocal rank fusion in practice')
    ).toBeVisible();
  });
});

test.describe('category grouping (single page, no pagination)', () => {
  test('FR: all 8 published posts on one page, no pager, no duplicates', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');

    // No pagination control any more — the single page carries every published post.
    await expect(page.locator('nav.rc-pager')).toHaveCount(0);

    const titles = (
      await page.locator('article.rc-arow .rc-arow__title a').allInnerTexts()
    ).map((t) => t.trim());
    expect(titles).toHaveLength(8);
    // No article is rendered twice across the grouped sections.
    expect(new Set(titles).size).toBe(8);

    // The count meta reflects the full corpus, not a page slice.
    await expect(page.locator('.rc-pagehd__meta')).toContainText('8');
  });

  test('headings precede their rows in CATEGORY_ORDER (essays → explainers → briefings)', async ({
    page,
  }) => {
    await page.goto('/en/blog/');
    // Each category <section> is a region named by its <h2>; the first article row
    // appears AFTER the (single, seed-corpus) "Explainers" heading in DOM order.
    const headingThenRow = await page.evaluate(() => {
      const h2 = document.querySelector('.rc-catsec__title');
      const row = document.querySelector('article.rc-arow');
      if (!h2 || !row) return false;
      return Boolean(
        h2.compareDocumentPosition(row) & Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
    expect(headingThenRow).toBe(true);
  });
});

test.describe('tag filter (chips → S5)', () => {
  test('FR: "All" active, per-tag chips link to /fr/tags/ (href-only)', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');

    const rail = page.locator('[data-tag-rail][role="group"]');
    await expect(rail).toBeVisible();

    // "Tous" is the active chip and points back to the index
    const allChip = rail.locator('a.rc-chip.is-on');
    await expect(allChip).toHaveText('Tous');
    await expect(allChip).toHaveAttribute('href', '/fr/blog/');
    await expect(allChip).toHaveAttribute('aria-current', 'true');

    // per-tag chips are LINKS to the (task-9) tag pages — assert hrefs, never click
    for (const slug of [
      'agents',
      'rag',
      'agentic-coding',
      'evaluation',
      'llm-oss',
      'retrieval',
      'qualite',
    ]) {
      await expect(
        rail.locator(`a.rc-chip[href="/fr/tags/${slug}/"]`)
      ).toBeVisible();
    }

    // an article row's tag is also a link into /fr/tags/
    await expect(
      page.locator('article.rc-arow .rc-arow__tags a').first()
    ).toHaveAttribute('href', /^\/fr\/tags\/.+\/$/);
  });

  test('EN reuse smoke: chip rail links to /en/tags/', async ({ page }) => {
    await page.goto('/en/blog/');
    await expect(
      page.locator('[data-tag-rail] a.rc-chip[href="/en/tags/agents/"]')
    ).toBeVisible();
  });
});

test.describe('language switch on a section index (decision #6)', () => {
  test('FR /blog/ → EN switcher falls back to the localized home', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');
    // No slugMap on the index → switcher bounces to /en/ (home), never a dead end.
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });
});
