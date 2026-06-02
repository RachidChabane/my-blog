import { test, expect, type Route } from '@playwright/test';

// S10 avatar overlay (task 20). The endpoint is a Cloudflare Pages Function —
// absent from the static `pnpm preview` server — so every streaming test
// INTERCEPTS POST /api/avatar/query and fulfils a hand-written SSE stream (the
// same `event: …\ndata: …\n\n` frames the real endpoint emits). Selectors are
// class/role/data-attr based and language-robust (project convention). The two
// required flows are: a grounded answer with the CITATION BEFORE the prose, and
// the honest "I don't know" refusal (no citation, no fabrication).

const frame = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const fulfillSSE = (route: Route, body: string) =>
  route.fulfill({ status: 200, contentType: 'text/event-stream', body });

// Grounded EN stream: sources (1 citation) → two token deltas → done.
const GROUNDED_EN =
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
  frame('token', { text: 'Yes. ' }) +
  frame('token', { text: 'He documents a hybrid RAG system.' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

// Grounded stream carrying one SAFE citation URL plus two UNSAFE ones (a
// `javascript:` scheme and a protocol-relative `//host`). Exercises isSafeHref's
// rejection path (D5/R3): unsafe URLs must render as text with NO href.
const GROUNDED_EN_MIXED =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Safe citation',
        sourceUrl: '/en/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'en',
      },
      {
        n: 2,
        title: 'Script scheme',
        sourceUrl: 'javascript:alert(1)',
        headingAnchor: '',
        slug: 'x',
        lang: 'en',
      },
      {
        n: 3,
        title: 'Protocol relative',
        sourceUrl: '//evil.example/x',
        headingAnchor: '',
        slug: 'y',
        lang: 'en',
      },
    ],
  }) +
  frame('token', { text: 'Grounded.' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

// Refusal stream. The message is reused by both the mock and the assertion so the
// "prose equals the streamed message (no fabrication)" check cannot drift. ASCII
// only — avoids the typographic-apostrophe matching trap.
const IDK_MSG = 'I do not know — that information is not in the site content.';
const IDK_EN =
  frame('idk', { message: IDK_MSG, suggestions: [] }) +
  frame('done', { finishReason: 'idk', topSimilarity: 0.1, threshold: 0.25 });

// Grounded FR stream (bilingual parity).
const GROUNDED_FR =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'RAG hybride : la fusion de rang réciproque en pratique',
        sourceUrl: '/fr/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'fr',
      },
    ],
  }) +
  frame('token', { text: 'Oui. ' }) +
  frame('token', { text: 'Il décrit un système RAG hybride.' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

test.describe('S10 avatar overlay', () => {
  test('launcher present, opens the panel, focuses the input', async ({
    page,
  }) => {
    await page.goto('/en/');
    const launcher = page.locator('[data-avatar-slot]');
    const panel = page.locator('[data-avatar-panel]');
    await expect(launcher).toBeVisible();
    await expect(panel).toBeHidden();

    await launcher.click();
    await expect(panel).toBeVisible();
    await expect(launcher).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('[data-avatar-input]')).toBeFocused();
  });

  test('grounded answer renders the citation BEFORE the prose', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, GROUNDED_EN)
    );
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('Has Rachid built a RAG system?');
    await input.press('Enter');

    const panel = page.locator('[data-avatar-panel]');
    // The citation row IS the anchor (not an <a> descendant).
    await expect(
      panel.locator('a.rc-cite__row[href*="/blog/hybrid-rag-retrieval"]')
    ).toBeVisible();
    await expect(panel.locator('.rc-cite__title')).toContainText('Hybrid RAG');
    await expect(panel.locator('.rc-ans__prose')).toContainText(
      'hybrid RAG system'
    );

    // Citation precedes prose in DOM order (layout-independent).
    const citeBeforeProse = await page.evaluate(() => {
      const cite = document.querySelector('.rc-ans .rc-cite');
      const prose = document.querySelector('.rc-ans .rc-ans__prose');
      if (!cite || !prose) return false;
      return Boolean(
        cite.compareDocumentPosition(prose) & Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
    expect(citeBeforeProse).toBe(true);
  });

  test('unsafe citation URLs render as text with no href (D5/R3)', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, GROUNDED_EN_MIXED)
    );
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('Has Rachid built a RAG system?');
    await input.press('Enter');

    const ans = page.locator('[data-avatar-panel] .rc-ans');
    // All three citations render as rows...
    await expect(ans.locator('a.rc-cite__row')).toHaveCount(3);
    // ...but only the safe one is linked (the unsafe schemes get no href).
    await expect(ans.locator('a.rc-cite__row[href]')).toHaveCount(1);
    await expect(ans.locator('a.rc-cite__row[href]')).toHaveAttribute(
      'href',
      '/en/blog/hybrid-rag-retrieval/'
    );
  });

  test('"I don\'t know" shows the refusal — no citation, no fabrication', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, IDK_EN)
    );
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('What is his phone number?');
    await input.press('Enter');

    const panel = page.locator('[data-avatar-panel]');
    await expect(panel.locator('.rc-ans--refuse')).toBeVisible();
    await expect(panel.locator('.rc-refuse-tag')).toContainText('out of scope');
    // The prose equals the streamed message verbatim (nothing fabricated).
    await expect(panel.locator('.rc-ans--refuse .rc-ans__prose')).toHaveText(
      IDK_MSG
    );
    // A refusal carries no citation.
    await expect(panel.locator('.rc-cite')).toHaveCount(0);
  });

  test('thinking state shows synchronously, then resolves to the answer', async ({
    page,
  }) => {
    // Delay fulfilment so the synchronous thinking transition is observable.
    await page.route('**/api/avatar/query', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await fulfillSSE(route, GROUNDED_EN);
    });
    await page.goto('/en/');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('Has Rachid built a RAG system?');
    await input.press('Enter');

    const panel = page.locator('[data-avatar-panel]');
    // Set synchronously on submit, before the (delayed) fetch resolves.
    await expect(panel).toHaveAttribute('data-state', 'thinking');
    await expect(panel.locator('[data-avatar-thinking]')).toBeVisible();

    // After fulfilment: thinking row gone, answer present, no longer thinking.
    await expect(panel.locator('[data-avatar-thinking]')).toHaveCount(0);
    await expect(panel.locator('.rc-ans')).toBeVisible();
    await expect(panel).not.toHaveAttribute('data-state', 'thinking');
  });

  test('Escape and click-outside close the panel', async ({ page }) => {
    await page.goto('/en/');
    const launcher = page.locator('[data-avatar-slot]');
    const panel = page.locator('[data-avatar-panel]');

    await launcher.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(launcher).toBeFocused();

    // Reopen, then click outside the dock (the page heading — non-navigating).
    await launcher.click();
    await expect(panel).toBeVisible();
    await page.locator('main h1').click();
    await expect(panel).toBeHidden();
  });

  test('FR parity: localized panel title and the POST carries lang=fr', async ({
    page,
  }) => {
    let postBody = '';
    await page.route('**/api/avatar/query', (route) => {
      postBody = route.request().postData() ?? '';
      return fulfillSSE(route, GROUNDED_FR);
    });
    await page.goto('/fr/');
    const panel = page.locator('[data-avatar-panel]');
    await page.locator('[data-avatar-slot]').click();
    // `.` matches the U+2019 apostrophe — sidesteps the typographic-quote trap.
    await expect(panel.locator('.rc-ava__title')).toHaveText(
      /^Demander à l.agent$/
    );

    const input = page.locator('[data-avatar-input]');
    await input.fill('Rachid a-t-il construit un système RAG ?');
    await input.press('Enter');
    await expect(panel.locator('.rc-ans__prose')).toContainText(
      'système RAG hybride'
    );
    expect(postBody).toContain('"lang":"fr"');
  });
});
