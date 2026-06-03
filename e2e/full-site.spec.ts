import { test, expect } from '@playwright/test';
import { allRoutes, LANGS } from './helpers/routes';
import { fulfillSSE, GROUNDED_EN, IDK_EN } from './helpers/avatar-sse';

/**
 * Task 29 — full-site cross-screen verification. Per-screen INTERNALS are already
 * covered by home/blog-index/article/work-detail/about/search/tags/404/theme/
 * i18n/shell/avatar specs (Decision D). This file adds ONLY what those can't:
 *   (a) an all-route smoke over every one of the 60 localized routes, with the
 *       switcher-never-dead-ends check (NFR-11) FOLDED INTO the same navigation;
 *   (b) cross-screen journeys (reading spine, mid-journey language switch, theme
 *       persistence across navigation, the avatar grounded+refusal flow).
 * It does NOT re-assert any single screen's content.
 *
 * The avatar endpoint is absent under `pnpm preview`, so its journey intercepts
 * POST /api/avatar/query and fulfils canned SSE (helpers/avatar-sse.ts) — never a
 * live call (R3). Pagefind's wasm cold-loads on first query → generous timeout (R4).
 */
const SEARCH_TIMEOUT = 15_000;

// ----------------------------------------------------------------- (a) smoke
const ROUTES = LANGS.flatMap((lang) =>
  allRoutes(lang).map((path) => ({ lang, path }))
);

test.describe('all-route smoke (60 localized routes)', () => {
  for (const { lang, path } of ROUTES) {
    test(`${path} — loads, one h1, lang=${lang}, switcher targets resolve`, async ({
      page,
    }) => {
      // Collect UNCAUGHT page exceptions only (NOT console.error — font/pagefind
      // noise would flake a strict check; R5). Registered before goto.
      const pageErrors: string[] = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));

      const res = await page.goto(path);
      expect(res?.status(), `HTTP status for ${path}`).toBeLessThan(400);

      await expect(page.locator('main#main')).toBeVisible();
      // Uniform across all 60 crawled routes (incl. localized 404s, whose
      // .not-found__headline is the sole h1). The excluded root `/` stub has h1=0.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);

      // Switcher reachability (NFR-11) folded in: read this route's masthead AND
      // footer-mirror language-switch hrefs, request.get each (no render), assert a
      // built 200 page. Self-contained per route ⇒ parallel-safe (Decision §5.5c).
      const hrefs = await page
        .locator('header a[lang], footer a[lang]')
        .evaluateAll((els) =>
          els
            .map((e) => e.getAttribute('href'))
            .filter((h): h is string => Boolean(h))
        );
      expect(hrefs.length, `switcher hrefs on ${path}`).toBeGreaterThan(0);
      for (const href of [...new Set(hrefs)]) {
        const r = await page.request.get(href);
        expect(r.status(), `switch target ${href} from ${path}`).toBeLessThan(
          400
        );
      }

      expect(pageErrors, `uncaught page errors on ${path}`).toEqual([]);
    });
  }
});

// -------------------------------------------------------------- (b) journeys
test.describe('cross-screen journeys', () => {
  // Pin light so the theme-persistence journey's light start is CI-pref-independent
  // (R10); harmless for the others.
  test.use({ colorScheme: 'light' });

  test('reading spine (EN): home → blog → article → work → detail → about → search', async ({
    page,
  }) => {
    await page.goto('/en/');
    // home → primary CTA → blog index
    await page.locator('a.rc-btn--primary[href="/en/blog/"]').click();
    await expect(page).toHaveURL('/en/blog/');

    // blog index → first article
    await page.locator('article.rc-arow .rc-arow__title a').first().click();
    await expect(page).toHaveURL(/^.*\/en\/blog\/.+\/$/);
    await expect(page.locator('.rc-article__body')).toBeVisible();

    // masthead nav → work index → first project detail
    await page.locator('header nav a[href="/en/work/"]').click();
    await expect(page).toHaveURL('/en/work/');
    await page.locator('article.rc-proj .rc-proj__title a').first().click();
    await expect(page.locator('h1.rc-projd__title')).toBeVisible();

    // masthead nav → about
    await page.locator('header nav a[href="/en/about/"]').click();
    await expect(page).toHaveURL('/en/about/');
    await expect(page.locator('h1')).toBeVisible();

    // masthead search affordance → search page → a real result
    await page.locator('header [data-search-trigger]').click();
    await expect(page).toHaveURL('/en/search/');
    await page.locator('[data-search-input]').fill('quantizing');
    await expect(
      page.locator(
        '[data-search-results] a[href*="/en/blog/quantizing-open-model"]'
      )
    ).toBeVisible({ timeout: SEARCH_TIMEOUT });
  });

  test('language switch mid-journey (EN article ↔ FR), never a dead end (NFR-11)', async ({
    page,
  }) => {
    await page.goto('/en/blog/hybrid-rag-reciprocal-rank-fusion/');
    // Article pages carry a slugMap ⇒ the switch lands on the FR counterpart.
    await page.locator('header a[lang="fr"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('h1')).toBeVisible(); // a real page, not a dead end

    // …and back to EN.
    await page.locator('header a[lang="en"]').click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('theme persists across real navigations (EN)', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');

    await page.locator('header .theme-toggle').click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // survives a real navigation (full page load re-applies from localStorage)…
    await page.locator('header nav a[href="/en/blog/"]').click();
    await expect(page).toHaveURL('/en/blog/');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // …and a second one.
    await page.locator('header nav a[href="/en/about/"]').click();
    await expect(page).toHaveURL('/en/about/');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    const stored = await page.evaluate(() => localStorage.getItem('rc-theme'));
    expect(stored).toBe('dark');
  });

  test('avatar journey (EN, SSE-intercepted): grounded answer then honest refusal', async ({
    page,
  }) => {
    // One route handler reads a mutable body so the SAME open panel serves first a
    // grounded answer, then a refusal (re-route without a reload).
    let avatarBody = GROUNDED_EN;
    await page.route('**/api/avatar/query', (route) =>
      fulfillSSE(route, avatarBody)
    );
    await page.goto('/en/');

    const panel = page.locator('[data-avatar-panel]');
    await page.locator('[data-avatar-slot]').click();
    const input = page.locator('[data-avatar-input]');
    await input.fill('Has Rachid built a RAG system?');
    await input.press('Enter');

    // Grounded: the citation row is visible and PRECEDES the prose in DOM order.
    await expect(
      panel.locator('a.rc-cite__row[href*="/blog/hybrid-rag-retrieval"]')
    ).toBeVisible();
    await expect(panel.locator('.rc-ans__prose')).toContainText(
      'hybrid RAG system'
    );
    const citeBeforeProse = await page.evaluate(() => {
      const cite = document.querySelector('.rc-ans .rc-cite');
      const prose = document.querySelector('.rc-ans .rc-ans__prose');
      if (!cite || !prose) return false;
      return Boolean(
        cite.compareDocumentPosition(prose) & Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
    expect(citeBeforeProse).toBe(true);

    // Refusal: re-route to the IDK stream, ask an out-of-scope question.
    avatarBody = IDK_EN;
    await input.fill('What is his phone number?');
    await input.press('Enter');
    const refusal = panel.locator('.rc-ans--refuse');
    await expect(refusal).toBeVisible();
    // The refusal entry itself carries NO citation (no fabricated source).
    await expect(refusal.locator('.rc-cite')).toHaveCount(0);
  });

  test('reading spine mirror (FR): home → blog → article', async ({ page }) => {
    await page.goto('/fr/');
    await page.locator('a.rc-btn--primary[href="/fr/blog/"]').click();
    await expect(page).toHaveURL('/fr/blog/');
    await page.locator('article.rc-arow .rc-arow__title a').first().click();
    await expect(page).toHaveURL(/^.*\/fr\/blog\/.+\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('.rc-article__body')).toBeVisible();
  });
});
