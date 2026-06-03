/**
 * Deterministic first-paint theme control for the full-site/a11y specs (task 29).
 * Not a `*.spec`/`*.test` file ⇒ not collected by Playwright (shared code only).
 *
 * DARK: seed `localStorage['rc-theme']` BEFORE `goto` — Base.astro's inline init
 * script reads it on first paint and applies `[data-theme="dark"]` with no flash
 * (proven in e2e/theme.spec.ts). The stored value wins over the OS preference, so
 * a dark CI runner cannot perturb a dark assertion.
 * LIGHT: callers pin `colorScheme: 'light'` via `test.use(...)` (as theme.spec /
 * shell.spec do) so a dark runner pref cannot flip the light default (plan R10).
 */
import type { Page } from '@playwright/test';

export type Theme = 'light' | 'dark';

/** Seed the persisted theme so the first paint renders `theme` deterministically. */
export async function forceTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('rc-theme', t);
    } catch {
      /* storage may be unavailable in some contexts — ignore */
    }
  }, theme);
}
