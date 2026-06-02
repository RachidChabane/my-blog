import { test, expect } from '@playwright/test';

test.describe('root locale redirect', () => {
  test('/ redirects to a supported locale path', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(fr|en)\//);
  });
});

test.describe('French home page', () => {
  test('renders at /fr/', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page).toHaveURL('/fr/');
    await expect(page).toHaveTitle(/Rachid Chabane/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toContainText('Rachid Chabane');
  });
});

test.describe('English home page', () => {
  test('renders at /en/', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveURL('/en/');
    await expect(page).toHaveTitle(/Rachid Chabane/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toContainText('Rachid Chabane');
  });
});

test.describe('language switcher links', () => {
  test('/fr/ has a link to /en/ (never dead — NFR-11)', async ({ page }) => {
    await page.goto('/fr/');
    const enLink = page.locator('a[lang="en"]');
    await expect(enLink).toBeVisible();
    await expect(enLink).toHaveAttribute('href', '/en/');
  });

  test('/en/ has a link to /fr/ (never dead — NFR-11)', async ({ page }) => {
    await page.goto('/en/');
    const frLink = page.locator('a[lang="fr"]');
    await expect(frLink).toBeVisible();
    await expect(frLink).toHaveAttribute('href', '/fr/');
  });

  test('switcher link navigates to the other locale', async ({ page }) => {
    await page.goto('/fr/');
    await page.locator('a[lang="en"]').click();
    await expect(page).toHaveURL('/en/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('active locale link has aria-current', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page.locator('a[lang="fr"]')).toHaveAttribute(
      'aria-current',
      'true'
    );
    await expect(page.locator('a[lang="en"]')).not.toHaveAttribute(
      'aria-current'
    );
  });
});
