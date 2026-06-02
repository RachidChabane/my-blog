import { test, expect } from '@playwright/test';

// S3 — Article reading surface. Targets the enriched hybrid-rag pair (the design
// reference). Selectors use CLASSES/roles (language-robust). The language switch
// is asserted on the masthead (`header a[lang=…]`) like blog-index.spec.ts. Both
// FR and EN article pages exist (task 8), so the switch is exercised live.

const EN = '/en/blog/hybrid-rag-reciprocal-rank-fusion/';
const FR = '/fr/blog/rag-hybride-fusion-rang-reciproque/';
const EN_TITLE = 'Hybrid RAG: reciprocal rank fusion in practice';
const FR_TITLE = 'RAG hybride : la fusion de rang réciproque en pratique';

test.describe('S3 article renders', () => {
  test('EN: title, meta row (date + reading time)', async ({ page }) => {
    await page.goto(EN);
    await expect(page.locator('h1.rc-article__title')).toHaveText(EN_TITLE);

    const meta = page.locator('.rc-article .rc-meta');
    await expect(meta).toContainText(/\d{2}-\d{2}-\d{4}/); // publish date
    await expect(meta).toContainText(/\d+ min/); // reading time
  });

  test('rich body: code block + pull-quote render', async ({ page }) => {
    await page.goto(EN);
    const code = page.locator('.rc-article__body pre code');
    await expect(code).toBeVisible();
    await expect(code).toContainText('rrf'); // the RRF python snippet
    await expect(page.locator('.rc-article__body blockquote')).toBeVisible();
  });
});

test.describe('sources resolve and open out', () => {
  test('EN: two sources, external links with safe rel', async ({ page }) => {
    await page.goto(EN);

    const rows = page.locator('section.rc-sources .rc-source');
    await expect(rows).toHaveCount(2);

    const links = page.locator('section.rc-sources .rc-source__title a');
    const first = links.nth(0);
    await expect(first).toHaveAttribute('target', '_blank');
    await expect(first).toHaveAttribute('rel', /noopener/);
    await expect(first).toHaveAttribute(
      'href',
      'https://www.pinecone.io/learn/hybrid-search-intro/'
    );
    await expect(links.nth(1)).toHaveAttribute(
      'href',
      'https://arxiv.org/abs/2210.03629'
    );
  });
});

test.describe('prev / next by shared tag', () => {
  test('EN: one prev card (RAG tag-mate), no next', async ({ page }) => {
    await page.goto(EN);

    await expect(page.locator('nav.rc-pn')).toBeVisible();
    // nearest older RAG-mate (skips non-sharers) — deterministic for this post.
    await expect(page.locator('a.rc-pn__card--prev')).toHaveAttribute(
      'href',
      '/en/blog/indexing-code-ast-retrieval/'
    );
    // the only newer post shares no tag → no next card.
    await expect(page.locator('a.rc-pn__card--next')).toHaveCount(0);
  });
});

test.describe('language switch lands on the parallel translation', () => {
  test('EN ⇄ FR round-trips on the same article', async ({ page }) => {
    await page.goto(EN);

    // masthead FR link points at the parallel FR slug (not the home fallback).
    const toFr = page.locator('header a[lang="fr"]');
    await expect(toFr).toHaveAttribute('href', FR);

    await toFr.click();
    await expect(page.locator('h1.rc-article__title')).toHaveText(FR_TITLE);

    // and back: the FR page's EN link returns to the parallel EN slug.
    await expect(page.locator('header a[lang="en"]')).toHaveAttribute(
      'href',
      EN
    );
  });
});
