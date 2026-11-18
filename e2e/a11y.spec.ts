import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Structural accessibility of each kind of page: WCAG 2 A and AA rules except
 * colour contrast, which the palette is checked for by eye in both themes.
 */
const PAGES = ['/fr/', '/fr/blog/', '/fr/library/', '/fr/work/', '/fr/about/'];

for (const url of PAGES) {
  test(`no structural accessibility violation on ${url}`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .disableRules(['color-contrast'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual(
      []
    );
  });
}

test('an article has no structural accessibility violation', async ({
  page,
}) => {
  await page.goto('/fr/blog/');
  await page.locator('#list .rows a.t').first().click();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(['color-contrast'])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual(
    []
  );
});
