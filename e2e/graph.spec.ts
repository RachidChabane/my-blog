import { test, expect } from '@playwright/test';

// Knowledge graph — /[lang]/graph/. The island lays nodes out deterministically
// (golden-angle seeding, no randomness), so node presence/labels are stable.
// Selectors use classes/data-attrs (language-robust); copy assertions stay
// per-locale where they pin the strings table.

test.describe('graph page renders', () => {
  test('FR: title, controls, and a populated SVG map', async ({ page }) => {
    await page.goto('/fr/graph/');
    await expect(page.locator('h1')).toHaveText('Graphe de connaissances');
    await expect(page.locator('[data-graph-search]')).toBeVisible();
    // theme chips: all + the four clusters
    await expect(page.locator('[data-graph-filters] [data-theme]')).toHaveCount(
      5
    );
    // the backfilled store renders a real map (>= 20 concept nodes)
    const nodes = page.locator('.rc-gnode');
    expect(await nodes.count()).toBeGreaterThanOrEqual(20);
    expect(await page.locator('.rc-gedge').count()).toBeGreaterThan(10);
  });

  test('EN: parallel page exists with the localized title', async ({
    page,
  }) => {
    await page.goto('/en/graph/');
    await expect(page.locator('h1')).toHaveText('Knowledge graph');
    expect(await page.locator('.rc-gnode').count()).toBeGreaterThanOrEqual(20);
  });
});

test.describe('node interactions', () => {
  test('click opens the side panel: definition, citing articles, related chips', async ({
    page,
  }) => {
    await page.goto('/en/graph/');
    const rag = page.locator('.rc-gnode[data-id="rag"]');
    await rag.waitFor();
    // settle the entrance animation before clicking a moving target
    await page.waitForTimeout(1800);
    await rag.click({ force: true });

    const panel = page.locator('[data-graph-panel]');
    await expect(panel).toBeVisible();
    await expect(panel.locator('[data-panel-title]')).toHaveText('RAG');
    await expect(panel.locator('[data-panel-def]')).toContainText(/retriev/i);
    // citations are first-class: at least one citing-article link, into /en/blog/
    const links = panel.locator('[data-panel-articles] a');
    expect(await links.count()).toBeGreaterThanOrEqual(1);
    await expect(links.first()).toHaveAttribute('href', /^\/en\/blog\//);
    // related chips present (the curated edges)
    expect(
      await panel.locator('[data-panel-related] button').count()
    ).toBeGreaterThan(0);
    // close button dismisses
    await panel.locator('[data-panel-close]').click();
    await expect(panel).toBeHidden();
  });

  test('keyboard: a node is focusable and Enter opens the panel', async ({
    page,
  }) => {
    await page.goto('/en/graph/');
    await page.waitForTimeout(1800);
    const node = page.locator('.rc-gnode[data-id="embeddings"]');
    await node.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-graph-panel]')).toBeVisible();
    await expect(
      page.locator('[data-graph-panel] [data-panel-title]')
    ).toHaveText('Embeddings');
  });
});

test.describe('search and theme filter', () => {
  test('search dims non-matching nodes and focuses the match', async ({
    page,
  }) => {
    await page.goto('/en/graph/');
    await page.waitForTimeout(1800);
    await page.locator('[data-graph-search]').fill('quantization');
    await page.waitForTimeout(400); // debounce
    // the matching node is highlighted, an unrelated one is dimmed
    await expect(page.locator('.rc-gnode[data-id="quantization"]')).toHaveClass(
      /is-focus/
    );
    await expect(page.locator('.rc-gnode[data-id="rag"]')).toHaveClass(
      /is-dim/
    );
  });

  test('theme filter dims other clusters', async ({ page }) => {
    await page.goto('/en/graph/');
    await page.waitForTimeout(1800);
    await page.locator('[data-theme="evals-quality"]').click();
    await expect(
      page.locator('.rc-gnode[data-id="fact-checking"]')
    ).not.toHaveClass(/is-dim/);
    await expect(page.locator('.rc-gnode[data-id="rag"]')).toHaveClass(
      /is-dim/
    );
    await expect(page.locator('[data-theme="evals-quality"]')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

test.describe('masthead reaches the graph', () => {
  test('the nav link lands here from the home page', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('header nav a[href="/en/graph/"]').click();
    await expect(page).toHaveURL(/\/en\/graph\/$/);
    await expect(page.locator('h1')).toHaveText('Knowledge graph');
  });
});
