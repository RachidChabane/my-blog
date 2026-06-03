/**
 * axe-core (WCAG) scan builders for the a11y spec (task 29). `@axe-core/playwright`
 * is pinned EXACT (no `^`) so an axe-core rule bump can't silently widen a frozen
 * blocking gate (plan Decision C). Not a `*.spec`/`*.test` file ⇒ not collected.
 *
 * Two scan flavors (plan Decision B):
 *  - structuralScan — every WCAG 2 A/AA rule EXCEPT color-contrast (landmarks via
 *    role locators in the spec, since landmark rules are best-practice-tagged).
 *  - contrastScan  — color-contrast ONLY, excluding intentional de-emphasis
 *    microcopy, asserting AA on the remaining load-bearing text.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** WCAG 2 A + AA. (Many landmark rules are `best-practice`-tagged ⇒ asserted
 *  explicitly with role locators in a11y.spec.ts, not via these tags.) */
export const AXE_TAGS = ['wcag2a', 'wcag2aa'] as const;

/**
 * Intentional de-emphasized microcopy below AA on `--fg-subtle` (~3.2:1). This
 * list was REBUILT from an empirical color-contrast scan (a11y.spec.ts pre-step,
 * Decision B / review I2): scan without the list, read the actual violating
 * `target` selectors, classify each (pure de-emphasis → exclude; primary /
 * interactive text → real finding, recorded in plan §8/R2, NOT silently excluded).
 * Excluded ONLY from the color-contrast probe; the structural scan still covers
 * these nodes. `--fg-subtle = var(--ink-400)` light / `var(--graphite-400)` dark —
 * one token nudge would clear all sites at once, but that is a design call the
 * monitoring instance owns, not a test-task change.
 */
export const INTENTIONAL_LOW_CONTRAST: string[] = [
  '.t-eyebrow',
  '.rc-meta',
  '.rc-proj__n',
  '.rc-projd__meta',
  '.rc-ph',
  '.rc-contact__row.is-placeholder',
  '.rc-source__meta',
  '.rc-pn__dir',
];

/** Structural scan: every WCAG 2 A/AA rule except color-contrast. */
export function structuralScan(page: Page): AxeBuilder {
  return new AxeBuilder({ page })
    .withTags([...AXE_TAGS])
    .disableRules(['color-contrast']);
}

/**
 * Primary-text contrast scan: color-contrast ONLY, excluding intentional
 * microcopy. Uses `.withRules([...])` (NOT `.withTags(...).options({runOnly})`,
 * whose trailing options() would override the tag-set runOnly and make withTags
 * dead/misleading — plan §5.4).
 */
export function contrastScan(page: Page): AxeBuilder {
  let b = new AxeBuilder({ page }).withRules(['color-contrast']);
  for (const sel of INTENTIONAL_LOW_CONTRAST) b = b.exclude(sel);
  return b;
}
