import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('root redirects to /en/', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en\//);
  });

  test('English home page renders', async ({ page }) => {
    await page.goto('/en/');
    await expect(page).toHaveTitle(/Rachid Chabane/);
    await expect(page.locator('h1')).toContainText('Rachid Chabane');
    await expect(page.locator('main')).toBeVisible();
  });
});
