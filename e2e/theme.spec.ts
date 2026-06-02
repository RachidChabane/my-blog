import { test, expect } from '@playwright/test';

test.describe('theme toggle', () => {
  // Pin the system preference for the WHOLE suite: the "defaults to light" and
  // "persists across reloads" tests toggle from the default state and assume a
  // light start, so they must not depend on the CI runner's prefers-color-scheme.
  // The stored-dark test below overrides this via its own stored value.
  test.use({ colorScheme: 'light' });

  test('defaults to light, then toggles to dark', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page
      .locator('header')
      .getByRole('button', { name: /theme/i })
      .click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('persists the choice across reloads', async ({ page }) => {
    await page.goto('/en/');
    await page
      .locator('header')
      .getByRole('button', { name: /theme/i })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const stored = await page.evaluate(() => localStorage.getItem('rc-theme'));
    expect(stored).toBe('dark');
  });

  test('applies a stored dark theme on first paint (no flash)', async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem('rc-theme', 'dark'));
    await page.goto('/en/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('toggle exposes an accessible name', async ({ page }) => {
    await page.goto('/en/');
    await expect(
      page.locator('header').getByRole('button', { name: /theme/i })
    ).toBeVisible();
  });
});
