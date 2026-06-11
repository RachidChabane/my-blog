import { test, expect } from '@playwright/test';

// Scroll-reveal (src/lib/reveal.ts + the .js-reveal rules in global.css). The rest
// of the suite runs under reducedMotion:'reduce' (playwright.config.ts), which
// disables the reveal entirely; this spec opts back into motion to cover BOTH
// progressive-enhancement branches:
//   1. motion ok      → content starts hidden, then gains `.is-in` on scroll-in.
//   2. reduced motion → content is always visible (hidden state never applies).
// Both branches must end with the content visible — the reveal must never be able
// to strand content invisible.

test.describe('scroll-reveal — motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('FR home: js hook set, below-fold cards reveal on scroll', async ({
    page,
  }) => {
    await page.goto('/fr/');

    // The inline head script tags <html> synchronously.
    await expect(page.locator('html')).toHaveClass(/js-reveal/);

    // The project teaser cards carry data-reveal and sit below the fold.
    const cards = page.locator('article.rc-proj[data-reveal]');
    await expect(cards.first()).toBeAttached();

    // Scroll the last card into view; the observer must add `.is-in`.
    const last = cards.last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/is-in/, { timeout: 5000 });

    // Revealed = fully opaque (the transition has resolved to opacity 1).
    await expect
      .poll(async () => last.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');
  });
});

test.describe('scroll-reveal — reduced motion', () => {
  // Inherits the global reducedMotion:'reduce'. Content must be visible without
  // ever needing the `.is-in` class — the hidden state is gated out entirely.
  test('FR home: reveal content is fully opaque from the start', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const card = page.locator('article.rc-proj[data-reveal]').last();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect
      .poll(async () => card.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');
  });
});
