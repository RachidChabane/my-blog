import { test, expect } from '@playwright/test';

test.describe('S11 — 404 Not Found', () => {
  for (const lang of ['fr', 'en'] as const) {
    test.describe(`${lang.toUpperCase()}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${lang}/404`);
      });

      test('renders localized 404 eyebrow', async ({ page }) => {
        await expect(page.locator('.not-found__code')).toContainText('404');
      });

      test('renders localized headline (non-English for FR)', async ({
        page,
      }) => {
        const headline = page.locator('.not-found__headline');
        if (lang === 'fr') {
          await expect(headline).toContainText('introuvable');
        } else {
          await expect(headline).toContainText('not found');
        }
      });

      // Scope recovery-CTA assertions to the page's own nav: the masthead
      // (rendered via Base) also links to /blog/ and /search/, so an unscoped
      // a[href] locator matches 2 elements → Playwright strict-mode failure.
      test('home CTA links to localized index', async ({ page }) => {
        await expect(
          page.locator(`.not-found__nav a[href="/${lang}/"]`)
        ).toBeVisible();
      });

      test('blog CTA links to localized blog index', async ({ page }) => {
        await expect(
          page.locator(`.not-found__nav a[href="/${lang}/blog/"]`)
        ).toBeVisible();
      });

      test('search CTA links to localized search page', async ({ page }) => {
        await expect(
          page.locator(`.not-found__nav a[href="/${lang}/search/"]`)
        ).toBeVisible();
      });
    });
  }
});
