import { test, expect, type Route, type Page } from '@playwright/test';

// Avatar red-team — client renders adversarial server output INERTLY (M-12, NFR-7).
// The endpoint is a Cloudflare Pages Function (absent from `pnpm preview`), so —
// exactly like e2e/avatar.spec.ts — every test INTERCEPTS POST /api/avatar/query
// and fulfils a hand-written SSE stream of hostile frames. These are PURE LOCKS:
// task 20 already renders via textContent / createTextNode (never a markup sink)
// and link-allowlists citation URLs via isSafeHref, so we expect ZERO client
// changes. A needed client change would be a FINDING, not a fix here. ASCII-only.

const frame = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

const fulfillSSE = (route: Route, body: string) =>
  route.fulfill({ status: 200, contentType: 'text/event-stream', body });

// A grounded stream whose token deltas are XSS payloads (HTML must render as text).
const XSS_TOKENS =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Safe source',
        sourceUrl: '/en/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'en',
      },
    ],
  }) +
  frame('token', { text: '<img src=x onerror="window.__pwned=1">' }) +
  frame('token', { text: '<script>window.__pwned=1</script>' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

// A sources frame mixing a markup-bearing title + two unsafe schemes + one safe URL.
const XSS_CITATIONS =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: '<b>boom</b>',
        sourceUrl: 'javascript:window.__pwned=1',
        headingAnchor: '',
        slug: 'x',
        lang: 'en',
      },
      {
        n: 2,
        title: 'Data URI',
        sourceUrl: 'data:text/html,<script>1</script>',
        headingAnchor: '',
        slug: 'y',
        lang: 'en',
      },
      {
        n: 3,
        title: 'Safe source',
        sourceUrl: '/en/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'en',
      },
    ],
  }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

// A refusal whose message carries an XSS payload (must render as text, no citation).
const XSS_REFUSAL =
  frame('idk', {
    message: '<img src=x onerror="window.__pwned=1"> not found',
    suggestions: [],
  }) +
  frame('done', { finishReason: 'idk', topSimilarity: 0.1, threshold: 0.25 });

const ask = async (page: Page, question: string): Promise<void> => {
  await page.locator('[data-avatar-slot]').click();
  const input = page.locator('[data-avatar-input]');
  await input.fill(question);
  await input.press('Enter');
};

test.describe('S10 avatar red-team — adversarial output renders inertly', () => {
  test('E2E-RT-1 [LOCK]: token HTML renders as text, no img/script element, no script run', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, XSS_TOKENS)
    );
    await page.goto('/en/');
    await ask(page, 'tell me something');

    const panel = page.locator('[data-avatar-panel]');
    // The markup is present only as literal text in the prose.
    await expect(panel.locator('.rc-ans__prose')).toContainText('<img');
    await expect(panel.locator('.rc-ans__prose')).toContainText('<script>');
    // No element was parsed out of the payload, and the onerror never ran.
    await expect(panel.locator('img')).toHaveCount(0);
    await expect(panel.locator('script')).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as { __pwned?: unknown }).__pwned)
    ).toBeFalsy();
  });

  test('E2E-RT-2 [LOCK]: citation title HTML is text; only the safe URL is linked', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, XSS_CITATIONS)
    );
    await page.goto('/en/');
    await ask(page, 'list sources');

    const panel = page.locator('[data-avatar-panel]');
    const titles = panel.locator('.rc-cite__title');
    await expect(titles).toHaveCount(3);
    // The markup-bearing title renders as literal text, not a real <b> element.
    await expect(panel.locator('.rc-cite__title b')).toHaveCount(0);
    expect(await titles.first().textContent()).toContain('<b>');
    // Only the safe same-origin URL is linked; javascript: and data: get no href.
    const linked = panel.locator('a.rc-cite__row[href]');
    await expect(linked).toHaveCount(1);
    await expect(linked).toHaveAttribute(
      'href',
      '/en/blog/hybrid-rag-retrieval/'
    );
    expect(
      await page.evaluate(() => (window as { __pwned?: unknown }).__pwned)
    ).toBeFalsy();
  });

  test('E2E-RT-3 [LOCK]: refusal message HTML renders as text, no element, no citation', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, XSS_REFUSAL)
    );
    await page.goto('/en/');
    await ask(page, 'what is his phone number');

    const panel = page.locator('[data-avatar-panel]');
    const refuseProse = panel.locator('.rc-ans--refuse .rc-ans__prose');
    await expect(refuseProse).toContainText('<img');
    await expect(panel.locator('img')).toHaveCount(0);
    // A refusal carries no citation.
    await expect(panel.locator('.rc-cite')).toHaveCount(0);
    expect(
      await page.evaluate(() => (window as { __pwned?: unknown }).__pwned)
    ).toBeFalsy();
  });
});
