/**
 * Avatar SSE intercept helpers for the full-site / a11y specs (task 29). The
 * avatar endpoint is a Cloudflare Pages Function — ABSENT from the static `pnpm
 * preview` server — so every avatar flow INTERCEPTS `POST /api/avatar/query` and
 * fulfils a hand-written SSE stream (the same `event: …\ndata: …\n\n` frames the
 * real endpoint emits). This is the established e2e/avatar.spec.ts pattern, copied
 * (not imported from the spec) into a shared helper so multiple specs reuse the
 * exact citation shapes and the same selectors keep matching (plan §5.3 / R3).
 *
 * Not a `*.spec`/`*.test` file ⇒ not collected by Playwright.
 */
import type { Page, Route } from '@playwright/test';

/** One SSE frame: `event: <name>\ndata: <json>\n\n`. */
export const frame = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

/** Fulfil the intercepted request with a complete SSE body (status 200). */
export const fulfillSSE = (route: Route, body: string): Promise<void> =>
  route.fulfill({ status: 200, contentType: 'text/event-stream', body });

/** Grounded EN stream: one citation → two token deltas → done grounded. */
export const GROUNDED_EN =
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

/** Grounded FR stream (bilingual parity). */
export const GROUNDED_FR =
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

/**
 * Refusal message — reused by both the mock and the assertion so the "prose equals
 * the streamed message (no fabrication)" check cannot drift. ASCII only (avoids the
 * typographic-apostrophe matching trap — see avatar.spec.ts).
 */
export const IDK_MSG =
  'I do not know — that information is not in the site content.';

/** Refusal EN stream: idk frame (no sources, no tokens) → done idk. */
export const IDK_EN =
  frame('idk', { message: IDK_MSG, suggestions: [] }) +
  frame('done', { finishReason: 'idk', topSimilarity: 0.1, threshold: 0.25 });

/** Route the avatar endpoint to a canned SSE body for the whole page. */
export async function routeAvatar(page: Page, body: string): Promise<void> {
  await page.route('**/api/avatar/query', (route) => fulfillSSE(route, body));
}
