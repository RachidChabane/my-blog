import { test, expect } from '@playwright/test';
import { frame, routeAvatar } from './helpers/avatar-sse';
import { structuralScan } from './helpers/axe';

// Avatar artifacts (Thread 2): the assistant can draw a layered diagram or a code
// card inline. The endpoint is absent from `pnpm preview`, so we INTERCEPT the SSE
// stream (same pattern as avatar.spec.ts) and hand-feed `artifact` frames. Two
// guarantees are load-bearing and verified here because the existing gates don't see
// this DOM: (1) artifact content is rendered INERT — a `<script>`/`<img onerror>` in a
// model-supplied title or node can never become live markup; (2) the new DOM is
// axe-clean (role=img diagram, copy button name, etc.).

const EVIL_TITLE = '<script>alert(1)</script>';
const EVIL_NODE = '"><img src=x onerror=alert(2)>';

const DIAGRAM_STREAM =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Multi-model platform',
        sourceUrl: '/en/work/multi-model-ai-platform/',
        headingAnchor: '',
        slug: 'multi-model-ai-platform',
        lang: 'en',
      },
    ],
  }) +
  frame('token', { text: 'The platform is layered [1]. ' }) +
  frame('artifact', {
    kind: 'diagram',
    title: EVIL_TITLE,
    caption: 'overview',
    layers: [
      { label: 'Frontend', nodes: ['React 19', EVIL_NODE] },
      { label: 'Backend', nodes: ['Django'] },
    ],
  }) +
  frame('token', { text: 'That maps the main layers.' }) +
  frame('done', {
    finishReason: 'grounded',
    topSimilarity: 0.7,
    threshold: 0.25,
  });

const CODE_STREAM =
  frame('sources', {
    citations: [
      {
        n: 1,
        title: 'Example',
        sourceUrl: '/en/blog/hybrid-rag-retrieval/',
        headingAnchor: '',
        slug: 'hybrid-rag-retrieval',
        lang: 'en',
      },
    ],
  }) +
  frame('artifact', {
    kind: 'code',
    lang: 'python',
    code: "print('hi')\n# <script>not-run()</script>",
  }) +
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

test.describe('avatar artifacts — diagram', () => {
  test('renders a layered diagram, inert against injected markup, axe-clean', async ({
    page,
  }) => {
    await routeAvatar(page, DIAGRAM_STREAM);
    await ask(page, 'Show the architecture of the platform');

    const fig = page.locator('.rc-art--diagram');
    await expect(fig).toBeVisible();

    // One labelled image unit (announced once, not node-by-node in the live region).
    await expect(fig).toHaveAttribute('role', 'img');
    expect((await fig.getAttribute('aria-label'))?.length ?? 0).toBeGreaterThan(
      0
    );

    // INERT: no script/img element was ever injected from the model strings.
    await expect(page.locator('[data-avatar-body] script')).toHaveCount(0);
    await expect(page.locator('[data-avatar-body] img')).toHaveCount(0);

    // The malicious title is present as LITERAL text, not parsed markup.
    await expect(fig.locator('.rc-art__title')).toHaveText(EVIL_TITLE);
    // The malicious node likewise renders as literal text.
    await expect(
      fig.locator('.rc-adia__node', { hasText: EVIL_NODE })
    ).toHaveCount(1);

    // Layers + provenance label rendered.
    await expect(fig.locator('.rc-adia__layer')).toHaveCount(2);
    await expect(fig.locator('.rc-art__prov')).toBeVisible();

    // Interleaving: prose run, diagram, prose run — two prose nodes around the figure.
    await expect(page.locator('.rc-ans .rc-ans__prose')).toHaveCount(2);

    const { violations } = await structuralScan(page).analyze();
    expect(violations).toEqual([]);
  });
});

test.describe('avatar artifacts — code card', () => {
  test('renders a plain code card with the source verbatim and a copy control', async ({
    page,
  }) => {
    await routeAvatar(page, CODE_STREAM);
    await ask(page, 'Show me the snippet');

    const card = page.locator('.rc-art--code');
    await expect(card).toBeVisible();
    await expect(card.locator('.rc-art__lang')).toHaveText('python');

    // Code is verbatim (incl. the inert <script> text) — no element injected.
    await expect(card.locator('pre code')).toHaveText(
      "print('hi')\n# <script>not-run()</script>"
    );
    await expect(page.locator('[data-avatar-body] script')).toHaveCount(0);

    const copy = card.locator('.rc-art__copy');
    await expect(copy).toBeVisible();
    await expect(copy).toHaveText('Copy');
    // Clicking must never throw, even when the clipboard is denied (the handler
    // catches it); the control stays usable.
    await copy.click();
    await expect(copy).toBeVisible();

    const { violations } = await structuralScan(page).analyze();
    expect(violations).toEqual([]);
  });
});
