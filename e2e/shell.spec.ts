import { test, expect } from '@playwright/test';

// The navigation shell defines navigation ahead of the pages it targets. Nav +
// RSS links are LIVE anchors to routes later tasks build; here we assert their
// href VALUES (and never click them), and only navigate /fr/ ⇄ /en/, which exist.

test.describe('masthead — landmarks, wordmark, nav', () => {
  test('FR: header visible; wordmark→/fr/; nav links resolve to canonical routes', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await expect(page.locator('header')).toBeVisible();

    // Specific wordmark locator: a bare `header a[aria-label]` would also match
    // the two switcher links (which carry aria-labels) and trip strict mode.
    const wordmark = page.locator('header a.masthead__wordmark');
    await expect(wordmark).toBeVisible();
    await expect(wordmark).toHaveAttribute('href', '/fr/');

    await expect(page.locator('header nav a[href="/fr/blog/"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/fr/work/"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/fr/about/"]')).toBeVisible();
  });

  test('EN: wordmark→/en/; nav links are the /en/ parallels', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('header a.masthead__wordmark')).toHaveAttribute(
      'href',
      '/en/'
    );
    await expect(page.locator('header nav a[href="/en/blog/"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/work/"]')).toBeVisible();
    await expect(page.locator('header nav a[href="/en/about/"]')).toBeVisible();
  });
});

test.describe('search affordance (inert in task 6)', () => {
  test('FR: present in the masthead with an accessible name', async ({ page }) => {
    await page.goto('/fr/');
    const search = page.locator('header [data-search-trigger]');
    await expect(search).toBeVisible();
    await expect(search).toHaveAccessibleName('Rechercher');
  });

  test('EN: localized accessible name', async ({ page }) => {
    await page.goto('/en/');
    const search = page.locator('header [data-search-trigger]');
    await expect(search).toBeVisible();
    await expect(search).toHaveAccessibleName('Search');
  });
});

test.describe('language switch (masthead) — navigates, never dead-ends', () => {
  test('FR → EN and back, with aria-current on the active locale', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await expect(page.locator('header a[lang="fr"]')).toHaveAttribute(
      'aria-current',
      'true'
    );

    await page.locator('header a[lang="en"]').click();
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'aria-current',
      'true'
    );

    await page.locator('header a[lang="fr"]').click();
    await expect(page).toHaveURL('/fr/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });
});

test.describe('theme toggle (masthead) flips and persists', () => {
  // Pin the system preference so the light→dark assertion is CI-pref-independent.
  test.use({ colorScheme: 'light' });

  test('EN: click → dark, survives reload, persisted to localStorage', async ({
    page,
  }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    // Two .theme-toggle render (masthead + footer); scope to the masthead one.
    await page.locator('header .theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    const stored = await page.evaluate(() => localStorage.getItem('rc-theme'));
    expect(stored).toBe('dark');
  });
});

test.describe('footer', () => {
  test('FR: RSS link, autonomous-maintenance credit, language-switch mirror', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('a[href="/fr/rss.xml"]')).toBeVisible();
    await expect(footer).toContainText('écrit et maintenu de façon autonome');
    // The footer mirror is the second a[lang] set that necessitated scoping the
    // i18n/theme specs to `header`.
    await expect(footer.locator('a[lang="en"]')).toHaveCount(1);
  });

  test('EN: localized credit text', async ({ page }) => {
    await page.goto('/en/');
    await expect(page.locator('footer')).toContainText(
      'written and maintained autonomously'
    );
  });
});

test.describe('avatar launcher slot — present on every route', () => {
  test('visible fixed-corner on /fr/ and /en/', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page.locator('[data-avatar-slot]')).toBeVisible();
    await page.goto('/en/');
    await expect(page.locator('[data-avatar-slot]')).toBeVisible();
  });
});

test.describe('skip link', () => {
  test('first Tab focuses the skip-link to #main', async ({ page }) => {
    await page.goto('/fr/');
    await page.keyboard.press('Tab');
    const skip = page.locator('a.skip-link');
    await expect(skip).toBeFocused();
    await expect(skip).toHaveAttribute('href', '#main');
  });
});
