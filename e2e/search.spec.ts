import { test, expect } from '@playwright/test';

// S9 search (FR-A5). The Pagefind index is built by `pnpm build` (the webServer
// command), so it exists for every run. Selectors are class/role-based and
// language-robust (project convention). Query terms are pinned to the seed
// corpus: EN "quantizing" → quantizing-open-model; FR "rag" → fr/blog posts only.
// `?q=` deep links sidestep the 160 ms input debounce for determinism; one typing
// test still exercises the input handler. Deliberately NEVER asserts on tags
// (search rows reproduce meta+title+dek, not the S2 tag chips — see plan §1.4).
//
// Pagefind loads a wasm bundle on the first query; the cold compile+fetch+search
// can run a few seconds, so the result-bearing assertions get a generous timeout
// (the idle/empty-query checks need no index and use the default).
const SEARCH_TIMEOUT = 15_000;

test.describe('S9 search — page + island', () => {
  test('FR: page renders, role=search input, idle state shown', async ({
    page,
  }) => {
    await page.goto('/fr/search/');
    await expect(page.locator('h1')).toHaveText('Recherche');
    await expect(
      page.locator('form[role="search"] input[type="search"]')
    ).toBeVisible();
    await expect(page.locator('[data-search-idle]')).toBeVisible();
    await expect(page.locator('[data-search-results]')).toBeHidden();
  });

  test('EN deep-link ?q= returns the known fixture article', async ({
    page,
  }) => {
    await page.goto('/en/search/?q=quantizing');
    const results = page.locator('[data-search-results]');
    await expect(
      results.locator('a[href*="/en/blog/quantizing-open-model"]')
    ).toBeVisible({ timeout: SEARCH_TIMEOUT });
    await expect(results.locator('article.rc-arow')).not.toHaveCount(0);
    await expect(page.locator('[data-search-idle]')).toBeHidden();
  });

  test('FR results are language-scoped (no /en/ leakage)', async ({ page }) => {
    await page.goto('/fr/search/?q=rag');
    const links = page.locator('[data-search-results] .rc-arow__title a');
    await expect(links.first()).toBeVisible({ timeout: SEARCH_TIMEOUT });
    const hrefs = await links.evaluateAll((els) =>
      els.map((e) => e.getAttribute('href'))
    );
    for (const href of hrefs) expect(href).toMatch(/^\/fr\/blog\/.+/);
  });

  test('empty query → idle; no-match → "No results"', async ({ page }) => {
    await page.goto('/en/search/');
    await expect(page.locator('[data-search-idle]')).toBeVisible(); // the empty-query state
    await page.locator('[data-search-input]').fill('zzqxnotarealword');
    await expect(page.locator('[data-search-empty]')).toBeVisible({
      timeout: SEARCH_TIMEOUT,
    });
    await expect(page.locator('[data-search-empty]')).toHaveText('No results');
    await expect(page.locator('[data-search-results]')).toBeHidden();
  });

  test('typing into the input updates results (island handler)', async ({
    page,
  }) => {
    await page.goto('/en/search/');
    await page.locator('[data-search-input]').fill('quantizing');
    await expect(
      page.locator(
        '[data-search-results] a[href*="/en/blog/quantizing-open-model"]'
      )
    ).toBeVisible({ timeout: SEARCH_TIMEOUT });
  });

  test('masthead trigger navigates to /[lang]/search/', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('header a[data-search-trigger]')).toHaveAttribute(
      'href',
      '/en/search/'
    );
    await page.locator('header [data-search-trigger]').click();
    await expect(page).toHaveURL('/en/search/');
  });
});
