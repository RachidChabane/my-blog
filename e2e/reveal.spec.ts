import { test, expect } from '@playwright/test';

// Scroll-reveal (src/lib/reveal.ts + the .js-reveal rules in global.css). The rest
// of the suite runs under reducedMotion:'reduce' (playwright.config.ts), which
// disables the reveal entirely; this spec opts back into motion to cover BOTH
// progressive-enhancement branches:
//   1. motion ok      → content starts hidden, gains `.is-in` on scroll-in, THEN the
//      reveal hook is released so the element hovers with its own transition.
//   2. reduced motion → the observer is skipped; content is always visible and no
//      inline delay is ever written.
// Both branches must end with the content visible — the reveal must never strand
// content invisible, nor clobber a component's own hover transition.

test.describe('scroll-reveal — motion enabled', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('FR home: below-fold cards reveal on scroll, then revert to their own transition', async ({
    page,
  }) => {
    await page.goto('/fr/');

    // The inline head script tags <html> synchronously.
    await expect(page.locator('html')).toHaveClass(/js-reveal/);

    // The project teaser cards sit below the fold → not yet revealed.
    const last = page.locator('article.rc-proj').last();
    await expect(last).toBeAttached();
    await expect(last).not.toHaveClass(/is-in/);
    await expect
      .poll(async () => last.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('0');

    // Scroll it into view → the observer reveals it.
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveClass(/is-in/, { timeout: 5000 });
    await expect
      .poll(async () => last.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');

    // Regression guard: after revealing, the reveal hook is RELEASED (data-reveal +
    // inline delay removed) so the card reverts to its OWN hover transition
    // (box-shadow/border/transform at 160ms), not the reveal's opacity/transform.
    await expect
      .poll(async () => last.evaluate((el) => el.hasAttribute('data-reveal')))
      .toBe(false);
    await expect
      .poll(async () =>
        last.evaluate((el) => getComputedStyle(el).transitionProperty)
      )
      .toContain('box-shadow');
    await expect
      .poll(async () => last.evaluate((el) => el.style.transitionDelay))
      .toBe('');
  });
});

test.describe('scroll-reveal — reduced motion', () => {
  // Inherits the global reducedMotion:'reduce'. The observer is skipped entirely:
  // content is visible, never gains `.is-in`, and no inline delay is written.
  test('FR home: content is fully opaque with no reveal machinery applied', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const card = page.locator('article.rc-proj').last();
    await card.scrollIntoViewIfNeeded();
    await expect(card).toBeVisible();
    await expect
      .poll(async () => card.evaluate((el) => getComputedStyle(el).opacity))
      .toBe('1');
    await expect(card).not.toHaveClass(/is-in/);
    await expect
      .poll(async () => card.evaluate((el) => el.style.transitionDelay))
      .toBe('');
  });
});
