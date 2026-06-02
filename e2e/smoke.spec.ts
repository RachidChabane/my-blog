import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('root redirects to a supported locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(fr|en)\//);
  });

  test('English home page renders', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveTitle(/Rachid Chabane/);
    await expect(page.locator('h1')).toContainText('Rachid Chabane');
    await expect(page.locator('main')).toBeVisible();
  });

  test('French home page renders at /fr/', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page).toHaveURL('/fr/');
    await expect(page).toHaveTitle(/Rachid Chabane/);
  });
});
