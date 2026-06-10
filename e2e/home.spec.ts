import { test, expect } from '@playwright/test';

// S1 — Home / hub. Selectors use CLASSES (language-robust). Forward-referenced
// links (article <slug> → task 8, project <slug> → task 13) are asserted by href
// and NEVER clicked — same convention as blog-index / work-index specs. The two
// block heads share a class, so each is scoped by the descendant only its block
// owns (.rc-arows vs .rc-projgrid) to avoid strict-mode multi-match. The 3 + 3
// counts come from HOME_LATEST_COUNT / HOME_TEASER_COUNT and the seeds (≥3
// published articles and projects per locale).

test.describe('S1 home renders', () => {
  test('FR: hero + latest(3) + teaser(3), newest-first, see-all links', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await expect(page).toHaveURL('/fr/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');

    // one h1 (the hero owns it); the restrained typographic line is visible
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1.rc-hero__line')).toBeVisible();
    // the sole filled button is the primary CTA → the blog index
    await expect(
      page.locator('a.rc-btn--primary[href="/fr/blog/"]')
    ).toBeVisible();

    // latest block — scoped by .rc-arows (the teaser block lacks it)
    const latest = page.locator('.rc-block', {
      has: page.locator('.rc-arows'),
    });
    await expect(latest.locator('h2.rc-block__title')).toHaveText(
      'Derniers articles'
    );
    await expect(
      latest.locator('a.rc-teaser-all[href="/fr/blog/"]')
    ).toBeVisible();
    const rows = page.locator('.rc-arows article.rc-arow');
    await expect(rows).toHaveCount(3);
    // the latest row is a valid article link (exact ordering is covered by unit tests)
    const firstRow = rows.first().locator('.rc-arow__title a');
    await expect(firstRow).toHaveAttribute('href', /^\/fr\/blog\/.+\/$/);

    // teaser block — scoped by .rc-projgrid
    const teaser = page.locator('.rc-block', {
      has: page.locator('.rc-projgrid'),
    });
    await expect(teaser.locator('h2.rc-block__title')).toHaveText('Projets');
    await expect(
      teaser.locator('a.rc-teaser-all[href="/fr/work/"]')
    ).toBeVisible();
    const cards = page.locator('article.rc-proj');
    await expect(cards).toHaveCount(3);
    await expect(cards.first().locator('.rc-proj__title a')).toHaveAttribute(
      'href',
      /^\/fr\/work\/.+\/$/
    );
  });

  test('EN: parallel home, English titles, /en/ hrefs, counts 3 + 3', async ({
    page,
  }) => {
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1.rc-hero__line')).toBeVisible();
    await expect(
      page.locator('a.rc-btn--primary[href="/en/blog/"]')
    ).toBeVisible();

    const latest = page.locator('.rc-block', {
      has: page.locator('.rc-arows'),
    });
    await expect(latest.locator('h2.rc-block__title')).toHaveText(
      'Latest articles'
    );
    const rows = page.locator('.rc-arows article.rc-arow');
    await expect(rows).toHaveCount(3);
    const firstRow = rows.first().locator('.rc-arow__title a');
    await expect(firstRow).toHaveAttribute('href', /^\/en\/blog\/.+\/$/);

    const teaser = page.locator('.rc-block', {
      has: page.locator('.rc-projgrid'),
    });
    await expect(teaser.locator('h2.rc-block__title')).toHaveText('Projects');
    const cards = page.locator('article.rc-proj');
    await expect(cards).toHaveCount(3);
    await expect(cards.first().locator('.rc-proj__title a')).toHaveAttribute(
      'href',
      /^\/en\/work\/.+\/$/
    );
  });
});

test.describe('no SaaS tropes (task constraint)', () => {
  test('no form, no email input, non-figurative hero (no img)', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await expect(page.locator('main form')).toHaveCount(0);
    await expect(page.locator('main input[type="email"]')).toHaveCount(0);
    await expect(page.locator('.rc-hero img')).toHaveCount(0);
  });
});

test.describe('language switch on the home (decision #6)', () => {
  test('FR home → EN switcher falls back to /en/ (NFR-11)', async ({
    page,
  }) => {
    await page.goto('/fr/');
    // No slugMap on the home → switcher bounces to /en/, never a dead end.
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      '/en/'
    );
  });

  test('EN home → FR switcher falls back to /fr/ (NFR-11)', async ({
    page,
  }) => {
    await page.goto('/en/');
    await expect(page.locator('header a[lang="fr"]')).toHaveAttribute(
      'href',
      '/fr/'
    );
  });
});
