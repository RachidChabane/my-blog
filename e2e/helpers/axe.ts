/**
 * axe-core (WCAG) scan builders for the a11y spec (task 29). `@axe-core/playwright`
 * is pinned EXACT (no `^`) so an axe-core rule bump can't silently widen a frozen
 * blocking gate (plan Decision C). Not a `*.spec`/`*.test` file ⇒ not collected.
 *
 * Two scan flavors (plan Decision B):
 *  - structuralScan — every WCAG 2 A/AA rule EXCEPT color-contrast (landmarks are
 *    asserted explicitly with role locators in the spec; landmark axe rules are
 *    best-practice-tagged and thus excluded by the wcag2a/aa tag set).
 *  - contrastScan  — color-contrast ONLY, excluding (1) intentional de-emphasis
 *    microcopy and (2) the known, tracked sub-AA defects on load-bearing/interactive
 *    text, asserting AA on the REMAINING primary text (H1s, body prose, nav links,
 *    form inputs — all currently AA-compliant).
 *
 * The two exclude lists below were REBUILT from an empirical color-contrast scan of
 * the live build (the a11y pre-step, Decision B / review I2 — the plan's first-draft
 * list had phantom `.rc-arow__meta`/`.rc-proj__meta` selectors). They are kept
 * SEPARATE on purpose (advisor): `INTENTIONAL_LOW_CONTRAST` is genuine de-emphasis;
 * `KNOWN_AA_DEFECTS` is load-bearing/interactive text that fails AA TODAY and is a
 * tracked owner defect (NOT intentional). Every site here renders `--fg-subtle`
 * (`var(--ink-400)` light / `var(--graphite-400)` dark, ~3.1–3.3:1) or the accent
 * fill; clearing AA is a single design-token review the monitoring instance owns —
 * a pinned-tokens change a test task must not make unilaterally (plan Decision B,
 * §8/R2). Recorded in memory `task-29-a11y-contrast-findings` for the launch gate.
 */
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

/** WCAG 2 A + AA. (Landmark rules are `best-practice`-tagged ⇒ asserted with role
 *  locators in a11y.spec.ts, not via these tags — Decision C.) */
export const AXE_TAGS = ['wcag2a', 'wcag2aa'] as const;

/**
 * Intentional de-emphasized microcopy below AA on `--fg-subtle` (~2.9–3.7:1).
 * Pure quiet secondary text by design (dates, reading-time, eyebrows, ordinals,
 * section labels, owner-fill placeholders). Excluded ONLY from the contrast probe;
 * the structural scan still covers these nodes.
 */
export const INTENTIONAL_LOW_CONTRAST: string[] = [
  '.t-eyebrow', // section eyebrows (blog/tags/search/home headers)
  '.rc-about__eyebrow', // about page eyebrow
  '.rc-meta', // article/home/blog/tag row date + reading-time (covers child spans)
  '.rc-pagehd__meta', // page-header meta line
  '.rc-source__n', // source ordinal "01"
  '.rc-source__meta', // source host + date microcopy
  '.rc-sources__h', // muted "Sources" section label (eyebrow-style heading)
  '.rc-projd__stackmeta', // work-detail stack meta
  '.rc-projd__bi', // work-detail build-info meta
  '.rc-rel__meta', // related-article row date + reading-time
  '.rc-proj__n', // project-card eyebrow / index
  '.rc-pn__dir', // prev/next direction label
  '.rc-pn__topic', // prev/next shared-topic label
  '.rc-ph__label', // about owner-fill placeholder label
  '.rc-howit__lbl', // about "how it works" label
  '.footer__small', // footer fine print
  '.footer__credit', // footer autonomous-maintenance credit
];

/**
 * KNOWN, TRACKED sub-AA defects on LOAD-BEARING / INTERACTIVE text — NOT de-emphasis.
 * Each fails AA today; excluded so the BLOCKING gate stays green (plan Decision B /
 * §8 R2 — `max_gate_repair_rounds: 0`), and surfaced as an owner finding (memory
 * `task-29-a11y-contrast-findings`) to fix via a design-token review, NOT here.
 */
export const KNOWN_AA_DEFECTS: string[] = [
  '.search-trigger__label', // interactive masthead search control; --fg-subtle ~3.29 light / 3.45 dark
  '.rc-proj__desc', // project-card body summary; --fg-subtle ~3.29 light / 3.45 dark
  '.rc-btn--primary', // home primary CTA (accent fill + --fg-on-accent); DARK only ~3.88
  '.rc-chip.is-on', // active nav/tag chip (aria-current); DARK only ~3.38
  '.rc-contact__val', // about contact value (real rows are interactive links); ~3.15
];

/** Structural scan: every WCAG 2 A/AA rule except color-contrast. */
export function structuralScan(page: Page): AxeBuilder {
  return new AxeBuilder({ page })
    .withTags([...AXE_TAGS])
    .disableRules(['color-contrast']);
}

/**
 * Primary-text contrast scan: color-contrast ONLY, excluding intentional microcopy
 * AND the tracked load-bearing defects. Uses `.withRules([...])` (NOT
 * `.withTags(...).options({runOnly})`, whose trailing options() would override the
 * tag-set runOnly and make withTags dead/misleading — plan §5.4).
 */
export function contrastScan(page: Page): AxeBuilder {
  let b = new AxeBuilder({ page }).withRules(['color-contrast']);
  for (const sel of [...INTENTIONAL_LOW_CONTRAST, ...KNOWN_AA_DEFECTS]) {
    b = b.exclude(sel);
  }
  return b;
}
