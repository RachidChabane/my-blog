import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The office site, end to end: every kind of page renders its content as HTML,
 * navigation and reading aids work, and the 3D world opens and closes over it.
 */

const PHONE = { width: 390, height: 780 };

async function firstHref(page: Page, listUrl: string): Promise<string> {
  await page.goto(listUrl);
  const href = await page
    .locator('#list .rows a.t')
    .first()
    .getAttribute('href');
  expect(href).toBeTruthy();
  return href as string;
}

async function noSideScroll(page: Page): Promise<void> {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(over).toBeLessThanOrEqual(0);
}

test.describe('pages', () => {
  test('root sends the visitor to a locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/(fr|en)\/$/);
  });

  test('home shows the five stands and the newest article', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await expect(page.locator('#pano a')).toHaveCount(5);
    await expect(page.locator('.lead h2 a')).toBeVisible();
    await page.locator('.lead h2 a').click();
    await expect(page.locator('article.sheet.text h1')).toBeVisible();
  });

  for (const section of [
    'radar',
    'blog',
    'journal',
    'work',
    'library',
    'about',
  ]) {
    test(`${section} renders and marks its sign as current`, async ({
      page,
    }) => {
      const res = await page.goto(`/fr/${section}/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('.room h1')).toBeVisible();
      await expect(
        page.locator(`.signs a[data-k="${section}"]`)
      ).toHaveAttribute('aria-current', 'page');
      await noSideScroll(page);
    });
  }

  test('an article is plain HTML with sources and search-engine metadata', async ({
    page,
    request,
  }) => {
    const href = await firstHref(page, '/fr/blog/');
    const html = await (await request.get(href)).text();
    expect(html).toContain('<article class="sheet text"');
    expect(html).toContain('application/ld+json');
    expect(html).toMatch(
      /<link rel="canonical" href="https:\/\/[^"]+\/fr\/blog\//
    );
    expect(html).toMatch(/hreflang="en"/);
    await page.goto(href);
    await expect(page.locator('#sources ol li').first()).toBeVisible();
    await expect(page.locator('#toc a').first()).toBeVisible();
  });

  test('a citation opens the cited passage', async ({ page }) => {
    const href = await firstHref(page, '/fr/blog/');
    await page.goto(href);
    await page.locator('a.rc-cite').first().click();
    await expect(page.locator('.note')).toBeVisible();
    await page.locator('h1').click();
    await expect(page.locator('.note')).toHaveCount(0);
  });

  test('a project page has its own scene', async ({ page }) => {
    await page.goto('/fr/work/');
    await page.locator('a.folder').first().click();
    await expect(page.locator('.pscene.big > svg')).toBeVisible();
    await expect(page.locator('.phead h1')).toBeVisible();
  });

  test('about keeps the portrait', async ({ page }) => {
    await page.goto('/fr/about/');
    await expect(page.locator('.frame img')).toBeVisible();
    await expect(page.locator('.team figure')).not.toHaveCount(0);
  });

  test('an unknown address answers with the not-found page', async ({
    page,
  }) => {
    await page.goto('/fr/404/');
    await expect(page.locator('.lost h1')).toBeVisible();
    await expect(page.locator('.guards svg')).toHaveCount(2);
  });
});

test.describe('lists and library', () => {
  test('the search field narrows a list and says so when nothing matches', async ({
    page,
  }) => {
    await page.goto('/fr/radar/');
    const rows = page.locator('#list li:visible');
    const all = await rows.count();
    expect(all).toBeGreaterThan(3);
    const word = (await rows.first().locator('a.t').innerText()).split(' ')[0];
    await page.fill('#q', word);
    expect(await rows.count()).toBeLessThan(all);
    expect(await rows.count()).toBeGreaterThan(0);
    await page.fill('#q', 'zzzzqqqq');
    await expect(page.locator('#empty')).toBeVisible();
  });

  test('a kind filter keeps only that kind', async ({ page }) => {
    await page.goto('/fr/radar/');
    await page.locator('.tools button[data-k="security"]').click();
    const kinds = await page
      .locator('#list li:visible')
      .evaluateAll((els) => els.map((e) => e.getAttribute('data-k')));
    expect(kinds.length).toBeGreaterThan(0);
    expect(new Set(kinds)).toEqual(new Set(['security']));
  });

  test('Glose defines a word and follows a related one', async ({ page }) => {
    await page.goto('/fr/library/');
    await page.fill('#sageInput', 'rappel');
    await page.keyboard.press('Enter');
    const title = page.locator('#scrollBox .scroll h3');
    await expect(title).toBeVisible();
    const first = await title.innerText();
    await page.locator('#scrollBox .strands a').first().click();
    await expect(title).not.toHaveText(first);
  });

  test('an unknown word still gets an answer', async ({ page }) => {
    await page.goto('/fr/library/');
    await page.fill('#sageInput', 'zzzzqqqq');
    await page.keyboard.press('Enter');
    await expect(page.locator('#scrollBox .scroll h3')).toBeVisible();
    await expect(page.locator('#says')).toContainText('zzzzqqqq');
  });

  test('every definition is in the page for readers without scripts', async ({
    request,
  }) => {
    const html = await (await request.get('/en/library/')).text();
    expect((html.match(/<dt id="word-/g) ?? []).length).toBeGreaterThan(100);
  });
});

test.describe('language and theme', () => {
  test('the English site is in English and links back to French', async ({
    page,
  }) => {
    await page.goto('/en/blog/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.signs a[data-k="work"]')).toHaveText(
      'Projects'
    );
    await expect(page.locator('#lang')).toHaveText('EN');
    await page.locator('#lang').click();
    await expect(page).toHaveURL(/\/fr\/blog\/$/);
  });

  test('the lamp switches day and night and the choice survives a reload', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const before = await page.locator('html').getAttribute('data-theme');
    await page.locator('#lamp').click();
    const after = before === 'dark' ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveAttribute('data-theme', after);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', after);
  });
});

test.describe('agent', () => {
  test('a question shows the streamed answer', async ({ page }) => {
    await page.route('**/api/avatar/query', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body:
          'event: token\ndata: {"text":"Bonjour, "}\n\n' +
          'event: token\ndata: {"text":"voici."}\n\n' +
          'event: done\ndata: {"finishReason":"grounded","topSimilarity":0.6,"threshold":0.49}\n\n',
      })
    );
    const href = await firstHref(page, '/fr/blog/');
    await page.goto(href);
    await page.fill('#qaInput', 'De quoi parle ce texte ?');
    await page.keyboard.press('Enter');
    await expect(page.locator('#log .cl')).toHaveText('Bonjour, voici.');
  });

  test('when the day’s budget is spent the Clawd says so, then insists', async ({
    page,
  }) => {
    await page.route('**/api/avatar/query', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: '{}',
      })
    );
    const href = await firstHref(page, '/fr/blog/');
    await page.goto(href);
    for (let i = 0; i < 2; i++) {
      await page.fill('#qaInput', 'Une réponse ?');
      await page.keyboard.press('Enter');
    }
    const lines = page.locator('#log .cl');
    await expect(lines.nth(0)).toContainText('tokens');
    await expect(lines.nth(1)).not.toHaveText(await lines.nth(0).innerText());
  });
});

test.describe('phone', () => {
  test.use({ viewport: PHONE });

  test('sections are on the bottom bar and the courier stands on the current one', async ({
    page,
  }) => {
    await page.goto('/fr/blog/');
    await expect(page.locator('.signs')).toBeHidden();
    await expect(page.locator('#tabs a')).toHaveCount(5);
    await expect(page.locator('#tabs a[data-k="blog"]')).toHaveAttribute(
      'aria-current',
      'page'
    );
    await page.locator('#tabs a[data-k="work"]').click();
    await expect(page).toHaveURL(/\/fr\/work\/$/);
    await noSideScroll(page);
  });

  test('the drawer offers the text size only where there is a text to read', async ({
    page,
  }) => {
    await page.goto('/fr/radar/');
    await page.locator('#more').click();
    await expect(page.locator('#msheet')).toBeVisible();
    await expect(page.locator('#mText')).toBeHidden();
    const href = await firstHref(page, '/fr/blog/');
    await page.goto(href);
    await page.locator('#more').click();
    const size = () =>
      page.evaluate(() =>
        parseFloat(
          getComputedStyle(document.querySelector('#prose p')!).fontSize
        )
      );
    const before = await size();
    await page.locator('#mText [data-act="bigger"]').click();
    expect(await size()).toBeGreaterThan(before);
    await noSideScroll(page);
  });
});

test.describe('the 3D office', () => {
  test.use({ viewport: { width: 480, height: 320 } });

  test('loads on demand and starts over the page', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto('/fr/work/');
    await page.locator('#door').click();
    await expect(page.locator('html')).toHaveClass(/in3d/, { timeout: 90_000 });
    await expect(page.locator('#w3 canvas')).toBeVisible();
    expect(await page.evaluate(() => typeof window.World?.leave)).toBe(
      'function'
    );
  });

  test('comes back to the page of the nearest stand', async ({ page }) => {
    // The camera passage advances frame by frame. CI has no GPU and draws about
    // one frame per second, which puts the passage beyond any sane timeout.
    test.skip(!!process.env.CI, 'needs hardware rendering');
    test.setTimeout(120_000);
    const html = page.locator('html');
    await page.goto('/fr/work/');
    await page.locator('#door').click();
    await expect(html).toHaveClass(/in3d/, { timeout: 60_000 });
    await expect(html).not.toHaveClass(/cine/, { timeout: 30_000 });
    await page.locator('#flat').click();
    await expect(html).not.toHaveClass(/in3d/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/fr\/work\/$/);
    await expect(page.locator('.room h1')).toBeVisible();
  });

  test('its walls and sheets are fed by the site content', async ({
    request,
  }) => {
    const data = await (await request.get('/world/data.fr.json')).json();
    expect(data.radar.length).toBeGreaterThan(3);
    expect(data.articles[0].url).toMatch(/^\/fr\/blog\//);
    expect(data.projects.length).toBeGreaterThan(5);
    expect(data.words.length).toBeGreaterThan(100);
  });
});
