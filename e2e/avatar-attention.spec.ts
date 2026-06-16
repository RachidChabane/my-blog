import { test, expect } from '@playwright/test';
import { structuralScan } from './helpers/axe';

// Agent-chat discoverability (T3): on a FIRST visit the dock arms a subtle launcher
// nudge ([data-attn]) and, shortly after load, reveals a hint bubble inviting a
// question. Both retire the moment the visitor engages the agent (opens the panel)
// or dismisses the hint, and the engagement persists (localStorage) so a returning
// reader is never nagged again. Reduced motion disables the MOTION but not the cue.

const EN_HINT = 'Curious about Rachid or this site? Ask me.';

const dock = (page: import('@playwright/test').Page) =>
  page.locator('[data-avatar-root]');
const hint = (page: import('@playwright/test').Page) =>
  page.locator('[data-avatar-hint]');
const panel = (page: import('@playwright/test').Page) =>
  page.locator('[data-avatar-panel]');

test.describe('agent chat — first-visit attention cue', () => {
  test('first visit arms the launcher nudge and reveals the localized hint', async ({
    page,
  }) => {
    await page.goto('/en/');
    // The nudge is armed synchronously on a genuine first visit...
    await expect(dock(page)).toHaveAttribute('data-attn', '');
    // ...and the hint bubble reveals shortly after load, carrying localized copy
    // (COPY NEVER LIVES IN JS — it is server-rendered from the i18n table).
    await expect(hint(page)).toBeVisible();
    await expect(hint(page).locator('.rc-hint__text')).toHaveText(EN_HINT);

    // The cue is axe-clean while on screen.
    const { violations } = await structuralScan(page).analyze();
    expect(violations).toEqual([]);
  });

  test('clicking the hint opens the panel and retires the cue', async ({
    page,
  }) => {
    await page.goto('/en/');
    await expect(hint(page)).toBeVisible();
    await hint(page).locator('.rc-hint__text').click();
    await expect(panel(page)).toBeVisible();
    await expect(dock(page)).not.toHaveAttribute('data-attn', '');
    await expect(hint(page)).toBeHidden();
  });

  test('dismissing the hint retires the cue without opening, and it stays gone', async ({
    page,
  }) => {
    await page.goto('/en/');
    await expect(hint(page)).toBeVisible();

    await page.locator('[data-avatar-hint-close]').click();
    await expect(hint(page)).toBeHidden();
    await expect(dock(page)).not.toHaveAttribute('data-attn', '');
    // Dismiss is not "open to chat": the panel stays closed.
    await expect(panel(page)).toBeHidden();

    // Engagement persists across a reload — neither the nudge nor the bubble return.
    await page.reload();
    await expect(dock(page)).not.toHaveAttribute('data-attn', '');
    await page.waitForTimeout(3600); // past the reveal delay
    await expect(hint(page)).toBeHidden();
  });

  test('a returning visitor (already engaged) sees no cue', async ({
    page,
  }) => {
    await page.goto('/en/');
    // Engage once via the corner launcher.
    await page.locator('[data-avatar-slot]').click();
    await expect(panel(page)).toBeVisible();

    await page.reload();
    await expect(dock(page)).not.toHaveAttribute('data-attn', '');
    await page.waitForTimeout(3600);
    await expect(hint(page)).toBeHidden();
  });
});
