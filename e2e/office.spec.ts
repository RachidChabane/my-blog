import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import {
  FRIEZE_ORDER,
  ROOM_SECTIONS,
  SECTION_ORDER,
} from '../src/office/sections';

/**
 * The office site, end to end: every kind of page renders its content as HTML,
 * navigation and reading aids work, and the 3D world opens and closes over it.
 */

const PHONE = { width: 390, height: 780 };
const SMALL_PHONE = { width: 360, height: 690 };
/** Smallest comfortable touch target, in CSS pixels. */
const TOUCH = 44;

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

  test('home shows every stand and the newest article', async ({ page }) => {
    await page.goto('/fr/');
    await expect(page.locator('#pano a')).toHaveCount(FRIEZE_ORDER.length);
    await expect(page.locator('#pano a[href="/fr/training/"]')).toHaveCount(1);
    await expect(page.locator('.lead h2 a')).toBeVisible();
    await page.locator('.lead h2 a').click();
    await expect(page.locator('article.sheet.text h1')).toBeVisible();
  });

  for (const section of SECTION_ORDER) {
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

  test('the writer thinks until the first words, then types on its laptop while they come', async ({
    page,
  }) => {
    const frame = (event: string, data: object) =>
      `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    // The page reads the answer from a stream it controls step by step.
    await page.addInitScript(() => {
      const steps: ((chunk: string | null) => void)[] = [];
      const answer = window as unknown as { feed: (c: string | null) => void };
      answer.feed = (chunk) => steps.shift()?.(chunk);
      const real = window.fetch.bind(window);
      window.fetch = (input, init) => {
        if (!String(input).includes('/api/avatar/query'))
          return real(input, init);
        const enc = new TextEncoder();
        const body = new ReadableStream<Uint8Array>({
          pull: (controller) =>
            new Promise<void>((next) => {
              steps.push((chunk) => {
                if (chunk === null) controller.close();
                else controller.enqueue(enc.encode(chunk));
                next();
              });
            }),
        });
        return Promise.resolve(new Response(body, { status: 200 }));
      };
    });
    const href = await firstHref(page, '/fr/blog/');
    await page.goto(href);
    await page.fill('#qaInput', 'De quoi parle ce texte ?');
    await page.keyboard.press('Enter');
    const answer = page.locator('#log p.cl');
    const writer = page.locator('.ask .who svg');
    await expect(page.locator('.ask svg')).toHaveCount(1);
    await expect(writer).toHaveAttribute('data-pose', 'ponder');
    await expect(answer).toHaveAttribute('aria-busy', 'true');
    await expect(answer.locator('.dots')).toBeVisible();
    await expect(writer.locator('.laptop .open')).toBeHidden();
    const feed = (chunk: string | null) =>
      page.evaluate(
        (c) =>
          (window as unknown as { feed: (c: string | null) => void }).feed(c),
        chunk
      );
    await feed(frame('sources', { citations: [] }));
    await expect(writer).toHaveAttribute('data-pose', 'ponder');
    await feed(frame('token', { text: 'Bonjour, ' }));
    await expect(answer).toHaveText('Bonjour, ');
    // The suite runs with reduced motion: the writer goes straight to its laptop.
    await expect(writer).toHaveAttribute('data-pose', 'type-a');
    await expect(writer.locator('.laptop .open')).toBeVisible();
    await feed(frame('token', { text: 'voici.' }));
    await feed(frame('done', { finishReason: 'grounded' }));
    await feed(null);
    await expect(answer).toHaveText('Bonjour, voici.');
    await expect(answer).not.toHaveAttribute('aria-busy');
    await expect(writer).toHaveAttribute('data-pose', '');
    await expect(writer.locator('.laptop .open')).toBeHidden();
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
    await expect(page.locator('#tabs a')).toHaveCount(ROOM_SECTIONS.length);
    await expect(page.locator('#tabs a[data-k="blog"]')).toHaveAttribute(
      'aria-current',
      'page'
    );
    await page.locator('#tabs a[data-k="work"]').click();
    await expect(page).toHaveURL(/\/fr\/work\/$/);
    await noSideScroll(page);
  });

  test('the stand in view stays lit when the last touch still hovers another stand', async ({
    browser,
    baseURL,
  }) => {
    // a touch screen: the browser reports that nothing can hover
    const context = await browser.newContext({
      viewport: PHONE,
      hasTouch: true,
      isMobile: true,
      baseURL,
    });
    const page = await context.newPage();
    await page.goto('/fr/');
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector: '#pano .rm',
    });
    await cdp.send('CSS.forcePseudoState', {
      nodeId,
      forcedPseudoClasses: ['hover'],
    });
    await page.locator('#pano').evaluate((el) => {
      el.scrollLeft = el.scrollWidth / 2;
    });
    const lit = page.locator('#pano .rm.on');
    await expect(lit).toHaveCount(1);
    await expect(page.locator('#pano .rm').first()).not.toHaveClass(/\bon\b/);
    await expect(lit.locator('.dim')).toHaveCSS('opacity', '0');
    await context.close();
  });

  test('the training stand offers Play, which opens the page with the game started', async ({
    page,
  }) => {
    await page.goto('/fr/');
    await page.locator('#pano').evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    const play = page.locator('a.playlink');
    await expect(play).toBeVisible();
    await play.click();
    await expect(page).toHaveURL(/\/fr\/training\/$/);
    await expect(page.locator('#tg-host')).toBeVisible();
    await expect(page.locator('a.playlink')).toBeHidden();
  });

  test('dots under the home drawing follow the stand in view', async ({
    page,
  }) => {
    await page.goto('/fr/');
    const dots = page.locator('#pano .dots i');
    await expect(dots).toHaveCount(FRIEZE_ORDER.length);
    await expect(page.locator('#pano .dots')).toBeVisible();
    await expect(dots.nth(0)).toHaveClass('on');
    await page.locator('#pano').evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect(dots.last()).toHaveClass('on');
    await expect(dots.nth(0)).not.toHaveClass('on');
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

async function trainingTables(page: Page): Promise<void> {
  const certs = page.locator('table.certs');
  await expect(certs.locator('tbody tr')).toHaveCount(3);
  await expect(certs.locator('tbody th[scope="row"]')).toHaveCount(3);
  await expect(certs.locator('thead th[scope="col"]')).toHaveCount(5);
  await expect(
    certs.locator('tbody th', {
      hasText: 'Claude Certified Architect - Foundations',
    })
  ).toHaveCount(1);
  await expect(certs.locator('a[href^="https://www.credly.com/"]')).toHaveCount(
    2
  );
  await expect(certs.locator('tbody td', { hasText: '975/990' })).toHaveCount(
    1
  );
  const exam = page.locator('table.domains');
  await expect(exam.locator('tbody th[scope="row"]')).toHaveCount(5);
  await expect(exam.locator('tfoot td').last()).toHaveText('300');
  await expect(page.locator('.drill .format')).toContainText('120');
  await expect(page.locator('.drill .format')).toContainText('720');
}

test.describe('training', () => {
  for (const lang of ['fr', 'en'] as const) {
    test(`${lang}: the page lists the certifications and the exam domains`, async ({
      page,
    }) => {
      const res = await page.goto(`/${lang}/training/`);
      expect(res?.status()).toBe(200);
      await expect(page.locator('.room h1')).toHaveText(
        lang === 'fr' ? 'Entraînement' : 'Training'
      );
      await expect(page.locator('.signs a[data-k="training"]')).toHaveAttribute(
        'aria-current',
        'page'
      );
      await expect(page.locator('link[hreflang="fr"]')).toHaveAttribute(
        'href',
        /\/fr\/training\/$/
      );
      await trainingTables(page);
      await expect(
        page.locator('.drill tbody th', {
          hasText:
            lang === 'fr'
              ? 'Gestion du contexte et fiabilité'
              : 'Context Management & Reliability',
        })
      ).toHaveCount(1);
      await noSideScroll(page);
    });

    test(`${lang}: on a small phone the tables fit or scroll in their own frame`, async ({
      page,
    }) => {
      await page.setViewportSize(SMALL_PHONE);
      await page.goto(`/${lang}/training/`);
      await trainingTables(page);
      await noSideScroll(page);
      for (const frame of await page.locator('.drill .tablewrap').all()) {
        const box = await frame.boundingBox();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(SMALL_PHONE.width);
      }
    });
  }
});

test.describe('phone bar at 360 px', () => {
  test.use({ viewport: SMALL_PHONE });

  for (const lang of ['fr', 'en'] as const) {
    test(`${lang}: every tab is a whole touch target and the courier carries the current one`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/training/`);
      // labels are measured in the site's own face, not in the fallback shown while it loads
      await page.evaluate(() => document.fonts.ready);
      const tabs = page.locator('#tabs a');
      await expect(tabs).toHaveCount(ROOM_SECTIONS.length);
      const boxes = [];
      for (const tab of await tabs.all()) {
        const cell = (await tab.boundingBox())!;
        const label = (await tab.locator('span').boundingBox())!;
        expect(cell.width).toBeGreaterThanOrEqual(TOUCH);
        expect(cell.height).toBeGreaterThanOrEqual(TOUCH);
        expect(label.x).toBeGreaterThanOrEqual(cell.x - 0.5);
        expect(label.x + label.width).toBeLessThanOrEqual(
          cell.x + cell.width + 0.5
        );
        boxes.push(cell);
      }
      for (let i = 1; i < boxes.length; i++)
        expect(boxes[i].x).toBeGreaterThanOrEqual(
          boxes[i - 1].x + boxes[i - 1].width - 0.5
        );
      const current = page.locator('#tabs a[data-k="training"]');
      await expect(current).toHaveAttribute('aria-current', 'page');
      const cell = (await current.boundingBox())!;
      const runner = (await page.locator('#runner').boundingBox())!;
      expect(
        Math.abs(runner.x + runner.width / 2 - (cell.x + cell.width / 2))
      ).toBeLessThan(4);
      await noSideScroll(page);
    });
  }

  test('the last stand of the drawing is the training one, reached by swiping', async ({
    page,
  }) => {
    await page.goto('/en/');
    const dots = page.locator('#pano .dots i');
    await expect(dots).toHaveCount(FRIEZE_ORDER.length);
    await page.locator('#pano').evaluate((el) => {
      el.scrollLeft = el.scrollWidth;
    });
    await expect(dots.last()).toHaveClass('on');
    await expect(page.locator('#pano .rm').last()).toHaveClass(/\bon\b/);
    await expect(page.locator('#tabs a[data-k="training"]')).toHaveAttribute(
      'aria-current',
      'page'
    );
    await trainingTables(page);
    await expect(page.locator('#main .game')).toHaveCount(0);
    await expect(page).toHaveURL(/\/en\/$/);
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

  test('the training door leads to the training page', async ({ page }) => {
    test.skip(!!process.env.CI, 'needs hardware rendering');
    test.setTimeout(120_000);
    const html = page.locator('html');
    await page.goto('/fr/training/');
    await page.locator('#door').click();
    await expect(html).toHaveClass(/in3d/, { timeout: 60_000 });
    await expect(html).not.toHaveClass(/cine/, { timeout: 30_000 });
    await page.locator('#flat').click();
    await expect(html).not.toHaveClass(/in3d/, { timeout: 30_000 });
    await expect(page).toHaveURL(/\/fr\/training\/$/);
    await expect(page.locator('.room h1')).toHaveText('Entraînement');
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

test.describe('going from one section to the next', () => {
  async function arrive(page: Page, href: string): Promise<string[]> {
    // The page slides only once it has drawn and the slide that brought it is over.
    await page.evaluate(async () => {
      await (window as { __passage?: ViewTransition | null }).__passage
        ?.finished;
      await new Promise((drawn) =>
        requestAnimationFrame(() => requestAnimationFrame(drawn))
      );
    });
    await page.locator(`a.sign[href="${href}"]`).click();
    await page.waitForURL(`**${href}`);
    return page.evaluate(() => {
      const seen = (window as { __passage?: ViewTransition | null }).__passage;
      return seen ? [...seen.types] : ['none'];
    });
  }

  test('the room slides the way the signs are ordered', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'cross-document view transitions');
    test.skip(!!process.env.CI, 'the CI browser runs no page transition');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      addEventListener('pagereveal', (e) => {
        (window as { __passage?: ViewTransition | null }).__passage =
          e.viewTransition;
      });
    });
    await page.goto('/fr/radar/');
    expect(await arrive(page, '/fr/work/')).toEqual(['forward']);
    expect(await arrive(page, '/fr/blog/')).toEqual(['back']);
  });

  test('the ceiling and the floor stay while the room changes', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/fr/radar/');
    const kept = await page.evaluate(() =>
      ['.top', '#floor', '#main'].map(
        (q) => getComputedStyle(document.querySelector(q)!).viewTransitionName
      )
    );
    expect(kept).toEqual(['top', 'floor', 'room']);
    const asked = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .filter((rule) => rule instanceof CSSMediaRule)
        .some(
          (rule) =>
            matchMedia(rule.conditionText).matches &&
            Array.from(rule.cssRules).some((r) =>
              r.cssText.startsWith('@view-transition')
            )
        )
    );
    expect(asked).toBe(true);
  });

  test('a visitor who asked for less motion gets a plain page change', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'cross-document view transitions');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.addInitScript(() => {
      addEventListener('pagereveal', (e) => {
        (window as { __passage?: ViewTransition | null }).__passage =
          e.viewTransition;
      });
    });
    await page.goto('/fr/radar/');
    expect(await arrive(page, '/fr/work/')).toEqual(['none']);
  });

  test('pages of the site are prepared when a visitor points at them', async ({
    page,
  }) => {
    await page.goto('/fr/training/');
    const rules = JSON.parse(
      (await page
        .locator('script[type="speculationrules"]')
        .textContent()) as string
    );
    expect(rules.prerender[0].eagerness).toBe('moderate');
    const play = page.locator('a[href$="#play"]').first();
    await expect(play).toHaveCount(1);
    const skipped = rules.prerender[0].where.and
      .map(
        (c: { not?: { selector_matches?: string } }) => c.not?.selector_matches
      )
      .find(Boolean) as string;
    expect(await play.evaluate((a, sel) => a.matches(sel), skipped)).toBe(true);
  });
});
