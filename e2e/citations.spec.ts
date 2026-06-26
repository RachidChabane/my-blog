import { test, expect } from '@playwright/test';

// Inline [sN] markers must render as clickable citations (rehype-citations),
// not as the literal text "[s1]". Regression guard for the reported radar bug
// where citations showed as "[s1][s2]" instead of links. Same body pipeline
// serves the article DOSSIER and the radar brief, so both are checked.

const PAGES = [
  { name: 'radar brief', url: '/en/radar/claude-tag-slack-ai-teammate/' },
  { name: 'article', url: '/en/blog/glm-5-2-where-you-run-it/' },
];

for (const p of PAGES) {
  test.describe(`citations — ${p.name}`, () => {
    test('renders [sN] as a link to its source card, with no literal "[s1]" left', async ({
      page,
    }) => {
      await page.goto(p.url);
      const body = page.locator('.rc-article__body');

      // the first citation is a real anchor to #source-1
      const cite = body.locator('a.rc-cite[href="#source-1"]').first();
      await expect(cite).toBeVisible();
      await expect(cite).toHaveText('1'); // bare number; CSS supplies [brackets]

      // the literal marker text is gone from the rendered body
      await expect(body).not.toContainText('[s1]');

      // and its target card exists
      await expect(page.locator('#source-1.rc-source')).toHaveCount(1);

      // clicking the citation lands on the source card
      await cite.click();
      await expect(page).toHaveURL(new RegExp('#source-1$'));
      await expect(page.locator('#source-1')).toBeInViewport();
    });
  });
}
