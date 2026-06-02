import { test, expect } from '@playwright/test';

// S6 — Portfolio index. Selectors use CLASSES (language-robust). Detail links
// (/[lang]/work/<slug>/ → task 13) are forward-referenced: asserted by href and
// NEVER clicked — same convention as blog-index.spec.ts (tag links dangled until
// task 9). Navigation stays within task-12 routes (/fr/work/, /en/work/), which
// exist. Which cards are "live" and hover-accent behaviour are visual nuances
// (unit-tested via isLiveStatus, Playwright-MCP for hover) — NOT pinned here.

test.describe('S6 portfolio renders', () => {
  test('FR: 7 cards, title-link → detail href, per-card status/chips/desc', async ({
    page,
  }) => {
    await page.goto('/fr/work/');
    await expect(page.locator('h1')).toHaveText('Projets');

    const cards = page.locator('article.rc-proj');
    await expect(cards).toHaveCount(7);

    // the title is the SOLE link; href points at the (task-13) detail route
    const firstTitle = cards.first().locator('.rc-proj__title a');
    await expect(firstTitle).toHaveAttribute('href', /^\/fr\/work\/.+\/$/);

    // a known localized FR slug is present (FR/EN slugs differ)
    await expect(
      page.locator('a[href="/fr/work/bayan-plateforme-rag/"]')
    ).toHaveCount(1);

    // per-card anatomy on the first card: status text, ≥1 stack chip, a dek
    const first = cards.first();
    await expect(first.locator('.rc-pstatus')).toBeVisible();
    expect(
      await first.locator('.rc-proj__chips .rc-tag').count()
    ).toBeGreaterThanOrEqual(1);
    await expect(first.locator('.rc-proj__desc')).toBeVisible();
  });

  test('EN: parallel grid, English h1, /en/ detail hrefs', async ({ page }) => {
    await page.goto('/en/work/');
    await expect(page.locator('h1')).toHaveText('Projects');
    await expect(page.locator('article.rc-proj')).toHaveCount(7);
    await expect(
      page.locator('article.rc-proj .rc-proj__title a').first()
    ).toHaveAttribute('href', /^\/en\/work\/.+\/$/);
    await expect(
      page.locator('a[href="/en/work/bayan-rag-platform/"]')
    ).toHaveCount(1);
  });
});

test.describe('card anatomy (locks the three deltas)', () => {
  test('FR: exactly one title-link per card, no chip links, decorative span CTA', async ({
    page,
  }) => {
    await page.goto('/fr/work/');

    // exactly one title-link per card (the sole <a>) — guards against rendering
    // external links[] or chip links as anchors
    await expect(page.locator('article.rc-proj .rc-proj__title a')).toHaveCount(
      7
    );

    // stack chips are <span>, not links — there are no stack-tag pages
    await expect(page.locator('article.rc-proj .rc-proj__chips a')).toHaveCount(
      0
    );

    // the "Voir →" affordance is a decorative <span>, never an <a>
    await expect(
      page.locator('article.rc-proj span.rc-proj__link')
    ).toHaveCount(7);
    await expect(page.locator('article.rc-proj a.rc-proj__link')).toHaveCount(
      0
    );
  });
});

test.describe('language switch on a section index (decision #6)', () => {
  test('FR /work/ → EN switcher falls back to the localized home', async ({
    page,
  }) => {
    await page.goto('/fr/work/');
    // No slugMap on the index → switcher bounces to /en/ (home), never a dead end.
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });
});
