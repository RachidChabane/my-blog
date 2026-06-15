import { test, expect } from '@playwright/test';
import { frame, routeAvatar } from './helpers/avatar-sse';
import { structuralScan } from './helpers/axe';

// Agent-chat enhancements: (1) the streamed answer renders Markdown (bold, lists,
// inline citation markers) instead of raw syntax; (2) injected elements carry the
// progressive-reveal entrance hooks (.rc-in / .rc-md-in); (3) a full-screen reading
// view, modeled on the gallery lightbox — a scrim + a large centered surface, with
// Escape / scrim-click stepping back to the docked panel. The endpoint is absent
// from `pnpm preview`, so the streaming flows INTERCEPT POST /api/avatar/query.

// Prose with **bold**, an inline [1] citation marker, then (blank line) a list.
const MD_STREAM =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Hybrid RAG: reciprocal rank fusion in practice',
        sourceUrl: '/en/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'en',
      },
    ],
  }) +
  frame('token', { text: 'It uses **reciprocal rank fusion** [1].' }) +
  frame('token', { text: '\n\n' }) +
  frame('token', { text: '- a dense leg\n- a lexical leg' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

async function ask(page: import('@playwright/test').Page, q: string) {
  await page.goto('/en/');
  await page.locator('[data-avatar-slot]').click();
  const input = page.locator('[data-avatar-input]');
  await input.fill(q);
  await input.press('Enter');
}

test.describe('agent chat — Markdown rendering', () => {
  test('renders bold, a list, and an inline citation marker (no raw syntax)', async ({
    page,
  }) => {
    await routeAvatar(page, MD_STREAM);
    await ask(page, 'How does retrieval work?');

    const prose = page.locator('[data-avatar-panel] .rc-ans__prose');
    await expect(prose).toBeVisible();

    // Bold renders as a real <strong>, not literal asterisks.
    await expect(prose.locator('strong')).toHaveText('reciprocal rank fusion');
    await expect(prose).not.toContainText('**');

    // The list renders as <ul><li> items.
    await expect(prose.locator('ul.rc-md-list > li')).toHaveCount(2);
    await expect(prose.locator('ul.rc-md-list > li').first()).toHaveText(
      'a dense leg'
    );

    // The [1] marker renders as a citation superscript linking back to the source
    // (through the SAME safe-href allow-list as the citation rows).
    const cite = prose.locator('sup.rc-md-cite');
    await expect(cite).toHaveCount(1);
    await expect(
      cite.locator('a[href="/en/blog/hybrid-rag-retrieval/"]')
    ).toHaveCount(1);
    // The marker link names its source for screen readers (the bare "1" + CSS
    // brackets would otherwise announce as just "link 1").
    await expect(cite.locator('a')).toHaveAttribute(
      'aria-label',
      'Hybrid RAG: reciprocal rank fusion in practice'
    );

    // Still exactly one prose run, and the answer is axe-clean.
    await expect(page.locator('.rc-ans .rc-ans__prose')).toHaveCount(1);
    const { violations } = await structuralScan(page).analyze();
    expect(violations).toEqual([]);
  });

  test('injected answer elements carry the progressive-reveal hooks', async ({
    page,
  }) => {
    await routeAvatar(page, MD_STREAM);
    await ask(page, 'How does retrieval work?');

    // The citation row uses the staggered-entrance hook...
    await expect(page.locator('.rc-cite__row.rc-in')).toHaveCount(1);
    // ...and every streamed Markdown block uses the block-reveal hook.
    const blocks = page.locator('[data-avatar-panel] .rc-ans__prose > *');
    await expect(blocks).toHaveCount(2); // a paragraph + the list
    for (let i = 0; i < 2; i++) {
      await expect(blocks.nth(i)).toHaveClass(/rc-md-in/);
    }
  });
});

test.describe('agent chat — full-screen view', () => {
  test('toggles full screen, drops the scrim, and swaps the control state', async ({
    page,
  }) => {
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();

    const root = page.locator('[data-avatar-root]');
    const panel = page.locator('[data-avatar-panel]');
    const scrim = page.locator('[data-avatar-scrim]');
    const fs = page.locator('[data-avatar-fs]');

    await expect(panel).toBeVisible();
    await expect(scrim).toBeHidden();
    await expect(fs).toHaveAttribute('aria-pressed', 'false');
    // Docked = non-modal dialog (the page stays interactive behind it).
    await expect(panel).toHaveAttribute('aria-modal', 'false');

    // Enter full screen.
    await fs.click();
    await expect(root).toHaveAttribute('data-fullscreen', '');
    await expect(scrim).toBeVisible();
    await expect(fs).toHaveAttribute('aria-pressed', 'true');
    await expect(fs).toHaveAttribute('aria-label', 'Exit full screen');
    // Full screen = a true modal over the scrim.
    await expect(panel).toHaveAttribute('aria-modal', 'true');
    await expect(panel).toBeVisible();

    // The toggle collapses back to the docked panel (panel stays open).
    await fs.click();
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
    await expect(scrim).toBeHidden();
    await expect(fs).toHaveAttribute('aria-pressed', 'false');
    await expect(panel).toHaveAttribute('aria-modal', 'false');
    await expect(panel).toBeVisible();
  });

  test('Escape and a scrim click step back from full screen (not close)', async ({
    page,
  }) => {
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();

    const root = page.locator('[data-avatar-root]');
    const panel = page.locator('[data-avatar-panel]');
    const scrim = page.locator('[data-avatar-scrim]');
    const fs = page.locator('[data-avatar-fs]');

    // Escape steps back one level: full screen → docked (panel stays open) and
    // restores focus to the toggle (modal-dismiss contract).
    await fs.click();
    await expect(root).toHaveAttribute('data-fullscreen', '');
    await page.keyboard.press('Escape');
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
    await expect(panel).toBeVisible();
    await expect(fs).toBeFocused();
    // A second Escape now closes the docked panel.
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();

    // Reopen, go full screen, click the exposed scrim corner → back to docked,
    // focus restored to the toggle.
    await page.locator('[data-avatar-slot]').click();
    await fs.click();
    await expect(root).toHaveAttribute('data-fullscreen', '');
    await scrim.click({ position: { x: 6, y: 6 } });
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
    await expect(panel).toBeVisible();
    await expect(fs).toBeFocused();
  });

  test('closing the panel resets full screen for the next open', async ({
    page,
  }) => {
    await page.goto('/en/');
    const launcher = page.locator('[data-avatar-slot]');
    const root = page.locator('[data-avatar-root]');
    const scrim = page.locator('[data-avatar-scrim]');

    await launcher.click();
    await page.locator('[data-avatar-fs]').click();
    await expect(root).toHaveAttribute('data-fullscreen', '');

    // Close via the header close button (the corner launcher is hidden in full
    // screen); reopening must be docked again.
    await page.locator('[data-avatar-close]').click();
    await expect(page.locator('[data-avatar-panel]')).toBeHidden();
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
    await expect(scrim).toBeHidden();

    await launcher.click();
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
  });
});
