import { test, expect } from '@playwright/test';

// S2 — Article index. Selectors use CLASSES (language-robust). Forward-referenced
// links (article <slug> pages → task 8, tag <slug> pages → task 9) are asserted by
// href and NEVER clicked — same convention as e2e/shell.spec.ts. Navigation stays
// within task-7 routes (/fr/blog/ ⇄ /fr/blog/2/, /en/blog/), which exist.

test.describe('S2 list renders', () => {
  test('FR: newest-first, 5 items, per-item meta/dek/title-link', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');
    await expect(page.locator('h1')).toHaveText('Articles');

    const rows = page.locator('article.rc-arow');
    await expect(rows).toHaveCount(5);

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

  test('EN: parallel list, English titles, /en/ title-link hrefs', async ({
    page,
  }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('h1')).toHaveText('Articles');
    await expect(page.locator('article.rc-arow')).toHaveCount(5);
    await expect(
      page.locator('article.rc-arow .rc-arow__title a').first()
    ).toHaveAttribute('href', /^\/en\/blog\/.+\/$/);
    await expect(
      page.getByText('Hybrid RAG: reciprocal rank fusion in practice')
    ).toBeVisible();
  });
});

test.describe('pagination', () => {
  test('FR: page-2 link, disabled edges, disjoint pages union to 8', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');

    const pager = page.locator('nav.rc-pager');
    await expect(pager).toBeVisible();
    // numbered page-2 link (distinct from the "next" edge that shares the href)
    await expect(
      pager.locator('a.rc-pager__btn:not(.rc-pager__edge)[href="/fr/blog/2/"]')
    ).toHaveCount(1);
    // prev edge disabled on page 1 → a <span>, never a dead <a>
    await expect(
      pager.locator('span.rc-pager__edge[aria-disabled="true"]')
    ).toHaveCount(1);
    await expect(pager.locator('a.rc-pager__edge')).toHaveCount(1); // only "next" is a link

    const titlesP1 = (
      await page.locator('article.rc-arow .rc-arow__title a').allInnerTexts()
    ).map((t) => t.trim());
    expect(titlesP1).toHaveLength(5);

    await page.goto('/fr/blog/2/');
    await expect(page.locator('article.rc-arow')).toHaveCount(3);
    // next edge disabled on the last page; numbered page-1 link points home to /fr/blog/
    await expect(
      page.locator('nav.rc-pager span.rc-pager__edge[aria-disabled="true"]')
    ).toHaveCount(1);
    await expect(
      page.locator(
        'nav.rc-pager a.rc-pager__btn:not(.rc-pager__edge)[href="/fr/blog/"]'
      )
    ).toHaveCount(1);

    const titlesP2 = (
      await page.locator('article.rc-arow .rc-arow__title a').allInnerTexts()
    ).map((t) => t.trim());
    expect(titlesP2).toHaveLength(3);

    // p1 and p2 are disjoint and together cover the 8 published posts
    const set1 = new Set(titlesP1);
    const set2 = new Set(titlesP2);
    for (const t of set2) expect(set1.has(t)).toBe(false);
    expect(new Set([...set1, ...set2]).size).toBe(8);
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
