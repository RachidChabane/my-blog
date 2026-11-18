import { test, expect } from '@playwright/test';

/**
 * Deterministic performance proxies: what a first visit downloads and how soon
 * the main content paints. The 3D office must cost nothing until it is opened.
 */
const LCP_BUDGET_MS = 2500;
const SCRIPT_COUNT_BUDGET = 2;
const HOME_HTML_BUDGET_BYTES = 200_000;

test.describe('perf budgets', () => {
  test('the home page paints its main content within the LCP budget', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const lcp = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            resolve(entries[entries.length - 1].startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        })
    );
    expect(lcp).toBeLessThan(LCP_BUDGET_MS);
  });

  test('a first visit stays within the script budget and loads nothing of the 3D office', async ({
    page,
  }) => {
    const scripts: string[] = [];
    const world: string[] = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (req.resourceType() === 'script') scripts.push(url.pathname);
      if (url.pathname.startsWith('/world/')) world.push(url.pathname);
    });
    await page.goto('/fr/');
    await page.waitForLoadState('networkidle');
    expect(scripts.length).toBeLessThanOrEqual(SCRIPT_COUNT_BUDGET);
    expect(world).toEqual([]);
  });

  test('every request of a first visit stays on the site', async ({ page }) => {
    const foreign: string[] = [];
    page.on('request', (req) => {
      const url = new URL(req.url());
      if (url.protocol.startsWith('http') && url.host !== 'localhost:4321')
        foreign.push(url.href);
    });
    await page.goto('/fr/blog/');
    await page.waitForLoadState('networkidle');
    expect(foreign).toEqual([]);
  });

  test('the home document stays light', async ({ request }) => {
    const body = await (await request.get('/fr/')).body();
    expect(body.byteLength).toBeLessThan(HOME_HTML_BUDGET_BYTES);
  });
});
