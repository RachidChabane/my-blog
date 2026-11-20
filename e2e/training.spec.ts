import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * The training game, end to end, on a phone (full screen) and a desktop (inline), in
 * French and English. The suite runs with reduced motion, so every line waits for a tap.
 */

const PHONE = { width: 360, height: 690 };
const DESKTOP = { width: 1280, height: 800 };
const SAVE_KEY = 'cca-training-v1';
const SKIP = new Set([
  'back',
  'sheets',
  'reset',
  'cines',
  'help',
  'skip',
  'flee',
  'glose',
  'bag',
  'guard',
  'verve',
  'no',
]);

type Save = Record<string, unknown>;
const save = (extra: Save = {}): Save => ({
  v: 1,
  freed: [],
  review: {},
  xp: 0,
  beaten: [],
  perks: { pv: 0, ink: 0 },
  known: {},
  sound: false,
  soundAsked: true,
  taught: true,
  seen: ['intro'],
  ...extra,
});

async function openGame(
  page: Page,
  lang: 'fr' | 'en',
  stored: Save | null
): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(
    ([key, value]) => {
      if (value && !sessionStorage.getItem('seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    [SAVE_KEY, stored ? JSON.stringify(stored) : '']
  );
  await page.goto(`/${lang}/training/`);
  await page.locator('#tg-play').click();
  await expect(page.locator('#zone button').first()).toBeVisible();
  return errors;
}

/** A tap right after the previous one is ignored by design (no double taps), so menu taps wait. */
async function tap(page: Page, k: string): Promise<void> {
  await page.waitForTimeout(300);
  await page.locator(`#zone [data-k="${k}"]`).first().click();
}

const keys = (page: Page) =>
  page
    .locator('#zone button[data-k]')
    .evaluateAll((bs) =>
      bs.map(
        (b) =>
          (b as HTMLElement).dataset.k +
          (b.getAttribute('aria-disabled') ? '!' : '')
      )
    );

/** The right option of the question on screen, read from the server-rendered sheets. */
async function rightOption(page: Page): Promise<string> {
  const stem = await page.locator('#dlg-txt').evaluate((e) => {
    const c = e.cloneNode(true) as HTMLElement;
    c.querySelector('.lvl')?.remove();
    return c.textContent ?? '';
  });
  return page.evaluate((s) => {
    const norm = (x: string) => x.replace(/[\s\u202f\u00a0]+/g, ' ').trim();
    for (const d of document.querySelectorAll('.tg-sheet'))
      if (norm(d.querySelector('.tg-stem')?.textContent ?? '') === norm(s))
        return norm(d.querySelector('.tg-ok .tg-opt')?.textContent ?? '');
    return '';
  }, stem);
}

async function answer(page: Page, right: boolean): Promise<void> {
  const want = await rightOption(page);
  expect(want).not.toBe('');
  const opts = page.locator('#zone button.ans:not(.gone)');
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const t = (await opts.nth(i).locator('.t').textContent()) ?? '';
    if ((t.replace(/[\s\u202f\u00a0]+/g, ' ').trim() === want) === right) {
      await page.waitForTimeout(300);
      await opts.nth(i).click();
      return;
    }
  }
  throw new Error(`no ${right ? 'right' : 'wrong'} option shown`);
}

/** Taps through lines and menus until `done` holds; fights use `weapon` and answer right. */
async function playUntil(
  page: Page,
  done: (ks: string[]) => boolean | Promise<boolean>,
  weapon = 'exam',
  max = 400
): Promise<string[]> {
  for (let i = 0; i < max; i++) {
    const ks = await keys(page);
    if (await done(ks)) return ks;
    const go = page.locator('#go:not([aria-disabled])');
    if (await go.count()) {
      await go.click({ timeout: 3000 }).catch(() => {});
      continue;
    }
    if (ks.some((k) => /^o\d$/.test(k))) {
      await answer(page, true);
      continue;
    }
    if (ks.includes(weapon)) {
      await tap(page, weapon);
      continue;
    }
    const pick = ks.find((k) => !k.endsWith('!') && !SKIP.has(k));
    if (pick) {
      await tap(page, pick).catch(() => {});
      continue;
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`not reached; menu: ${(await keys(page)).join(',')}`);
}

async function checkLayout(page: Page): Promise<void> {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(over).toBeLessThanOrEqual(0);
  const small = await page.locator('#tg-host').evaluate((host) => {
    const root = host.shadowRoot as ShadowRoot;
    const bad: string[] = [];
    root.querySelectorAll('button').forEach((b) => {
      const r = b.getBoundingClientRect();
      if (
        r.width &&
        r.height &&
        !b.closest('.foe') &&
        (r.width < 44 || r.height < 44)
      )
        bad.push(`${b.id || b.dataset.k} ${r.width}x${r.height}`);
    });
    root.querySelectorAll('*').forEach((el) => {
      if (!(el instanceof HTMLElement) || !el.offsetParent) return;
      const own = [...el.childNodes].some(
        (n) => n.nodeType === 3 && (n.textContent ?? '').trim()
      );
      if (own && parseFloat(getComputedStyle(el).fontSize) < 14)
        bad.push(`text ${el.className} ${getComputedStyle(el).fontSize}`);
    });
    return bad;
  });
  expect(small).toEqual([]);
}

/** One fight from the chapter's first door to its chest, with only `weapon`. */
async function winFirstFight(page: Page, weapon: string): Promise<void> {
  await playUntil(page, (ks) => ks.includes(weapon), weapon);
  await checkLayout(page);
  await playUntil(
    page,
    (ks) => ks.some((k) => k.startsWith('item:') || k.startsWith('boon:')),
    weapon
  );
  await expect(page.locator('#chest.open')).toBeVisible();
}

test.describe('training game', () => {
  test.setTimeout(240_000);

  test('phone, French: intro skipped, a Duel fight, a mistake, the chest, save and resume', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    const errors = await openGame(page, 'fr', null);
    const host = page.locator('#tg-host');
    await expect(host).toHaveClass(/is-overlay/);
    await expect(page.locator('html')).toHaveClass(/tg-locked/);
    await expect(page.locator('#zone [data-k="skip"]')).toBeVisible();
    await tap(page, 'skip');
    await playUntil(page, (ks) => ks.includes('start'));
    await tap(page, 'start');
    await playUntil(page, (ks) => ks.includes('enter'));
    await checkLayout(page);
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('duel'), 'duel');
    await tap(page, 'duel');
    await expect(page.locator('#zone button.ans')).toHaveCount(2);
    await answer(page, false);
    await expect(page.locator('#zone .choice.wrong')).toBeVisible();
    await expect(page.locator('#dlg-txt .verdict.ko')).toBeVisible();
    await winFirstFight(page, 'duel');
    const stored = await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) ?? '{}'),
      SAVE_KEY
    );
    expect(stored.freed.length).toBeGreaterThan(0);
    expect(Object.keys(stored.review)).toHaveLength(1);
    // closing must not reload the page: a marker set on this document survives
    await page.evaluate(() => {
      document.documentElement.dataset.alive = '1';
    });
    await page.locator('#quit').click();
    await expect(host).toBeHidden();
    await expect(page.locator('html')).not.toHaveClass(/tg-locked/);
    await page.waitForTimeout(400);
    await expect(page.locator('html')).toHaveAttribute('data-alive', '1');
    await expect(page.locator('#tg-progress')).toContainText(
      `${stored.freed.length} / 300`
    );
    // the phone's back button closes the game the same way
    await page.locator('#tg-play').click();
    await expect(host).toBeVisible();
    await page.goBack();
    await expect(host).toBeHidden();
    await page.waitForTimeout(400);
    await expect(page.locator('html')).toHaveAttribute('data-alive', '1');
    await expect(page).toHaveURL(/\/fr\/training\/$/);
    await page.reload();
    await expect(page.locator('#tg-progress')).toContainText(
      `${stored.freed.length} / 300`
    );
    await expect(
      page.locator('.tg-sheet .tg-review:not([hidden])')
    ).toHaveCount(1);
    expect(errors).toEqual([]);
  });

  test('desktop, English: inline console, a Trident fight', async ({
    page,
  }) => {
    await page.setViewportSize(DESKTOP);
    const errors = await openGame(page, 'en', save());
    await expect(page.locator('#tg-host')).not.toHaveClass(/is-overlay/);
    await expect(page.locator('#where-t')).toHaveText('The Stolen Cards');
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('trident'), 'trident');
    await tap(page, 'trident');
    await expect(page.locator('#zone button.ans')).toHaveCount(3);
    await tap(page, 'back');
    await winFirstFight(page, 'trident');
    await checkLayout(page);
    expect(errors).toEqual([]);
  });

  test('phone, English: an Exam fight and the sheets panel', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    const errors = await openGame(page, 'en', save());
    await tap(page, 'sheets');
    const panel = page.locator('#tg-sheets');
    await expect(panel).toHaveClass(/is-panel/);
    await page.locator('#tg-q').fill('MCP');
    await expect(page.locator('.tg-sheet:visible').first()).toBeVisible();
    await page.locator('#tg-sheets-close').click();
    await expect(panel).not.toHaveClass(/is-panel/);
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('exam'));
    await tap(page, 'exam');
    await expect(page.locator('#zone button.ans')).toHaveCount(4);
    await tap(page, 'back');
    await winFirstFight(page, 'exam');
    expect(errors).toEqual([]);
  });

  test('desktop, French: an area attack hits both heroes', async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const domains = await page.request
      .get('/fr/training/')
      .then((r) => r.text())
      .then((html) => [
        ...new Set(
          [...html.matchAll(/data-domain="([a-z_]+)"/g)].map((m) => m[1])
        ),
      ]);
    const errors = await openGame(
      page,
      'fr',
      save({ beaten: domains.slice(0, -1) })
    );
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('exam'));
    await expect(page.locator('.foe .intent.area')).toBeVisible();
    await tap(page, 'guard');
    await expect
      .poll(async () => {
        const go = page.locator('#go:not([aria-disabled])');
        const text = (await page.locator('#dlg-txt').textContent()) ?? '';
        if (!/vous touche tous les deux/.test(text) && (await go.count()))
          await go.click({ timeout: 3000 }).catch(() => {});
        return text;
      })
      .toMatch(/vous touche tous les deux/);
    expect(errors).toEqual([]);
  });

  test('phone: Play is on the first screen and each certification shows its date and score', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/fr/training/');
    const play = (await page.locator('#tg-play').boundingBox())!;
    expect(play.y + play.height).toBeLessThanOrEqual(PHONE.height);
    const pro = page.locator('table.certs tbody tr').first();
    await expect(pro).toContainText('15 octobre 2026');
    await expect(pro).toContainText('925/1000');
    await expect(page.locator('table.certs tbody tr').nth(1)).toContainText(
      '4 juillet 2026'
    );
    for (const cell of await pro.locator('td:not(:empty)').all()) {
      const box = (await cell.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(PHONE.width);
    }
    // the tables come before the 300 sheets
    const exam = (await page.locator('#exam').boundingBox())!;
    const sheets = (await page.locator('#tg-sheets').boundingBox())!;
    expect(exam.y).toBeLessThan(sheets.y);
  });

  test('every question is in the page, folded, in the page language', async ({
    request,
  }) => {
    for (const lang of ['fr', 'en']) {
      const html = await (await request.get(`/${lang}/training/`)).text();
      expect(html.match(/<details class="tg-sheet/g)).toHaveLength(300);
      expect(html).not.toMatch(/<details class="tg-sheet[^>]* open/);
      expect(html.match(/class="tg-ok"/g)).toHaveLength(300);
    }
  });
});
