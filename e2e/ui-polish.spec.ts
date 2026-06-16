import { test, expect } from '@playwright/test';
import { frame, routeAvatar } from './helpers/avatar-sse';

// UI-polish fixes. Selectors use classes/roles (language-robust). The chosen
// articles carry both a [!CAUTION] callout and six h2 sections, so one page
// exercises both the localized label and the contents-rail smooth scroll.
const EN = '/en/blog/chunk-on-the-syntax-tree-or-not/';
const FR = '/fr/blog/decouper-sur-larbre-syntaxique/';

// A grounded answer with THREE sources and inline [2]/[1] markers — mirrors the
// real production stream (absolute https sourceUrls). Proves distinct markers map
// to distinct sources (so a repeated "1" is the model citing one source, not a
// rendering bug) and that each marker is a real, new-tab link.
const MULTI_CITE =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Hybrid RAG: reciprocal rank fusion in practice',
        sourceUrl:
          'https://rachid-chabane.com/en/blog/hybrid-rag-reciprocal-rank-fusion/',
        headingAnchor: '',
        slug: 'hybrid-rag-reciprocal-rank-fusion',
        lang: 'en',
      },
      {
        n: 2,
        title: 'How the Ask-the-agent assistant works',
        sourceUrl: 'https://rachid-chabane.com/en/about/',
        headingAnchor: '',
        slug: 'how-the-agent-works',
        lang: 'en',
      },
    ],
  }) +
  frame('token', { text: 'It fuses a lexical and a dense leg [2]. ' }) +
  frame('token', { text: 'RRF merges the ranked lists [1].' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.64,
    threshold: 0.49,
  });

test.describe('callout labels localize to the article language', () => {
  test('FR caution reads ATTENTION, not the English word', async ({ page }) => {
    await page.goto(FR);
    const label = page.locator('.cl--caution .cl__label').first();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('ATTENTION');
    // the data-callout key stays language-agnostic (CSS/icon keyed off it)
    await expect(
      page.locator('[data-callout="caution"]').first()
    ).toBeVisible();
  });

  test('EN caution keeps the English label', async ({ page }) => {
    await page.goto(EN);
    const label = page.locator('.cl--caution .cl__label').first();
    await expect(label).toBeVisible();
    await expect(label).toHaveText('CAUTION');
  });
});

test.describe('contents-rail links scroll to their section', () => {
  test('FR: clicking a TOC link lands the section and updates the hash', async ({
    page,
  }) => {
    await page.goto(FR);
    // a mid-article section guarantees a real scroll (not already at the top)
    const link = page.locator('[data-toc-link]').nth(3);
    const id = await link.getAttribute('data-toc-link');
    expect(id).toBeTruthy();

    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));

    const target = page.locator(`#${id}`);
    await expect(target).toBeVisible();
    // scroll-margin-top:92px lands the heading just below the sticky masthead
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(-2);
    expect(box!.y).toBeLessThan(160);
  });
});

// The rest of the suite runs under reducedMotion:'reduce' (the FLIP is skipped),
// so this block opts back into motion to exercise the animated resize path and
// prove its scaffolding (the fixed-layer inline px + [data-flipping]/.rc-flipping
// hooks) is fully cleaned up — i.e. the resting boxes are byte-identical to before.
test.describe('avatar full-screen resize cleans up after each transit', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } });

  test('expands then collapses to the exact docked box, no leaked geometry', async ({
    page,
  }) => {
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();

    const root = page.locator('[data-avatar-root]');
    const panel = page.locator('[data-avatar-panel]');
    const fs = page.locator('[data-avatar-fs]');
    await expect(panel).toBeVisible();

    // Computed (layout) width: unaffected by the entrance transform, and equal to
    // the CSS resting box once the FLIP scaffolding is cleared.
    const layoutWidth = () =>
      panel.evaluate((el) => parseFloat(getComputedStyle(el).width));
    const settled = async () => {
      await expect(panel).not.toHaveAttribute('data-flipping');
      await expect(root).not.toHaveClass(/rc-flipping/);
    };

    const docked = await layoutWidth();

    await fs.click();
    await expect(root).toHaveAttribute('data-fullscreen', '');
    await settled();
    const full = await layoutWidth();
    expect(full).toBeGreaterThan(docked + 100); // ~980 vs ~412 at 1280px

    await fs.click();
    await expect(root).not.toHaveAttribute('data-fullscreen', '');
    await settled();
    const back = await layoutWidth();
    expect(Math.abs(back - docked)).toBeLessThanOrEqual(1);

    // no stale inline geometry left on the panel after the transit settles
    const style = (await panel.getAttribute('style')) ?? '';
    expect(style).not.toMatch(/(?:^|[;\s])(?:width|height|top|left)\s*:/);
  });
});

test.describe('inline citation markers are real, new-tab links', () => {
  test('each [n] links to its OWN source (in a new tab), distinct numbers → distinct sources', async ({
    page,
  }) => {
    await routeAvatar(page, MULTI_CITE);
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('How does hybrid retrieval work?');
    await input.press('Enter');

    const prose = page.locator('[data-avatar-panel] .rc-ans__prose');
    await expect(prose).toContainText('merges the ranked lists');

    const markers = prose.locator('sup.rc-md-cite');
    await expect(markers).toHaveCount(2);

    // [2] resolves to source #2 (the About/agent doc), [1] to source #1 — proving
    // the number is the model's real marker, not a stuck "1".
    const m2 = markers.nth(0).locator('a');
    const m1 = markers.nth(1).locator('a');
    await expect(m2).toHaveText('2');
    await expect(m2).toHaveAttribute(
      'href',
      'https://rachid-chabane.com/en/about/'
    );
    await expect(m1).toHaveText('1');
    await expect(m1).toHaveAttribute(
      'href',
      'https://rachid-chabane.com/en/blog/hybrid-rag-reciprocal-rank-fusion/'
    );

    // Both open in a new tab with a hardened opener (chat is never discarded).
    for (const m of [m1, m2]) {
      await expect(m).toHaveAttribute('target', '_blank');
      await expect(m).toHaveAttribute('rel', /noopener/);
    }
  });
});

test.describe('article carries a prominent TOP "Ask the agent" entry', () => {
  test('a featured card sits above the prose AND the quiet button remains below; the feature opens the panel scoped + pre-filled', async ({
    page,
  }) => {
    await page.goto(FR);

    // Two scoped triggers: the feature card (top) and the quiet button (end).
    const triggers = page.locator('[data-avatar-ask]');
    await expect(triggers).toHaveCount(2);

    const feature = page.locator('button.rc-askf');
    const quiet = page.locator('button.rc-ask__btn');
    await expect(feature).toBeVisible();
    await expect(quiet).toHaveCount(1);
    // The feature card carries the punchy "Demander à l'agent" label + the agent
    // lattice glyph, and is the FIRST trigger in the DOM (above the prose).
    await expect(feature).toContainText('Demander à l’agent');
    await expect(feature.locator('.rc-askf__mark')).toBeAttached();
    await expect(triggers.first()).toHaveClass(/rc-askf/);

    // The feature card sits ABOVE the quiet end-of-article button (top vs end).
    const featureY = (await feature.boundingBox())!.y;
    const quietY = (await quiet.boundingBox())!.y;
    expect(featureY).toBeLessThan(quietY);

    // Clicking it opens the panel, scopes to this article, and pre-fills the seed.
    const panel = page.locator('[data-avatar-panel]');
    await expect(panel).toBeHidden();
    await feature.click();
    await expect(panel).toBeVisible();
    const input = page.locator('[data-avatar-input]');
    await expect(input).toBeFocused();
    await expect(input).not.toHaveValue('');
  });
});
