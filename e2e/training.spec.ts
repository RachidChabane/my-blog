import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** The second exam's bank, as the page must render it. */
const bankOf = (exam: string) =>
  JSON.parse(
    readFileSync(`src/training/data/exams/${exam}/questions.json`, 'utf8')
  ) as {
    id: string;
    stem: Record<string, string>;
    options: Record<string, string[]>;
    answer: number;
  }[];
/** The longest stem and the longest set of options of both banks, in one language. */
const longest = (lang: 'fr' | 'en') => {
  const all = [...bankOf('foundations'), ...bankOf('developer-professional')];
  const by = (f: (q: (typeof all)[number]) => number) =>
    all.reduce((a, q) => (f(q) > f(a) ? q : a));
  return {
    stem: by((q) => q.stem[lang].length).stem[lang],
    options: by((q) => q.options[lang].join('').length).options[lang],
  };
};

/** Every stem of each bank, in one language. */
const stemsOf = (lang: 'fr' | 'en') =>
  ['foundations', 'developer-professional'].map((exam) =>
    bankOf(exam).map((q) => q.stem[lang])
  );
/** Room a phone 640 px tall may scroll a typical question by: one line. */
const ONE_LINE = 24;

/**
 * A typical question reads at once: for each bank, the median of the heights its stems
 * need fits the question box on a 690 px phone and on a desktop, and needs at most one
 * line of scrolling below that.
 */
async function checkMedianFits(page: Page, lang: 'fr' | 'en'): Promise<void> {
  const over = await page.locator('#tg-host').evaluate((host, banks) => {
    const r = host.shadowRoot as ShadowRoot;
    const d = r.getElementById('dialog') as HTMLElement;
    const t = r.getElementById('dlg-txt') as HTMLElement;
    const keep = t.innerHTML;
    const lvl = t.querySelector('.lvl')?.outerHTML ?? '';
    const out = banks.map((stems) => {
      const need = stems
        .map((stem) => {
          t.innerHTML = lvl + stem;
          return d.scrollHeight;
        })
        .sort((a, b) => a - b);
      return need[Math.floor(need.length / 2)] - d.clientHeight;
    });
    t.innerHTML = keep;
    d.dispatchEvent(new Event('scroll'));
    return out;
  }, stemsOf(lang));
  const allowed = page.viewportSize()!.height >= 690 ? 0 : ONE_LINE;
  for (const o of over) expect(o).toBeLessThanOrEqual(allowed);
}

/**
 * The answer step with the longest stem and options of both banks put in its place:
 * the arena stays on screen, the dialogue box keeps its size and says there is more,
 * the last option can be scrolled to, and the layout rules hold. The question on
 * screen is put back afterwards.
 */
async function checkLongest(page: Page, lang: 'fr' | 'en'): Promise<void> {
  const L = longest(lang);
  const before = await page.locator('#tg-host').evaluate((host, L) => {
    const r = host.shadowRoot as ShadowRoot;
    const d = r.getElementById('dialog') as HTMLElement;
    const t = r.getElementById('dlg-txt') as HTMLElement;
    const h = d.getBoundingClientRect().height;
    const keep = {
      txt: t.innerHTML,
      opts: [...r.querySelectorAll('#zone button.ans .t')].map(
        (e) => e.innerHTML
      ),
    };
    t.innerHTML = (t.querySelector('.lvl')?.outerHTML ?? '') + L.stem;
    r.querySelectorAll('#zone button.ans .t').forEach((e, i) => {
      e.textContent = L.options[i % L.options.length];
    });
    d.dispatchEvent(new Event('scroll'));
    (window as unknown as { tgKeep: typeof keep }).tgKeep = keep;
    return h;
  }, L);
  const state = await page.locator('#tg-host').evaluate((host) => {
    const r = host.shadowRoot as ShadowRoot;
    const box = (sel: string) =>
      r.querySelector(sel)?.getBoundingClientRect() ?? new DOMRect();
    const d = r.getElementById('dialog') as HTMLElement;
    const z = r.getElementById('zone') as HTMLElement;
    const last = [...z.querySelectorAll('button.ans')].pop() as HTMLElement;
    z.scrollTop = z.scrollHeight;
    const lb = last.getBoundingClientRect();
    const zb = z.getBoundingClientRect();
    return {
      dialog: d.getBoundingClientRect().height,
      more:
        !(r.getElementById('dlg-more') as HTMLElement).hidden ===
        d.scrollHeight > d.clientHeight + 8,
      scene: box('#scene').height,
      target: box('.foe.sel .art svg').height,
      party: r.querySelectorAll('.party .actor').length,
      lastShown: lb.bottom <= zb.bottom + 1 && lb.top >= zb.top - 1,
      inView: zb.bottom <= innerHeight + 1,
    };
  });
  expect(state.dialog).toBeCloseTo(before, 0);
  expect(state.more).toBe(true);
  expect(state.scene).toBeGreaterThanOrEqual(120);
  expect(state.target).toBeGreaterThan(30);
  expect(state.party).toBeGreaterThan(0);
  expect(state.lastShown).toBe(true);
  expect(state.inView).toBe(true);
  await checkLayout(page);
  await page.locator('#tg-host').evaluate((host) => {
    const r = host.shadowRoot as ShadowRoot;
    const keep = (
      window as unknown as { tgKeep: { txt: string; opts: string[] } }
    ).tgKeep;
    (r.getElementById('dlg-txt') as HTMLElement).innerHTML = keep.txt;
    r.querySelectorAll('#zone button.ans .t').forEach((e, i) => {
      e.innerHTML = keep.opts[i];
    });
    (r.getElementById('zone') as HTMLElement).scrollTop = 0;
  });
}

const devBank: {
  id: string;
  stem: Record<string, string>;
  options: Record<string, string[]>;
  answer: number;
}[] = JSON.parse(
  readFileSync(
    'src/training/data/exams/developer-professional/questions.json',
    'utf8'
  )
);

/**
 * The training game, end to end, on a phone (full screen) and a desktop (inline), in
 * French and English. The suite runs with reduced motion, so every line waits for a tap.
 */

const PHONE = { width: 360, height: 690 };
const DESKTOP = { width: 1280, height: 800 };
const SAVE_KEY = 'cca-training-v2';
const SAVE_KEY_V1 = 'cca-training-v1';
/** Menu keys that never move the story on: playUntil leaves them alone. */
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
  'skills',
  'team',
  'options',
  'no',
]);

/** The campaign the training page plays, as its progress is keyed in the save. */
const CAMPAIGN = 'CCAR-F';
/** The second exam: its campaign key, its page and the size of its bank. */
const DEV = 'developer-professional';
const DEV_PATH = 'training/developer-professional/';
const DEV_SHEETS = 172;
const SETTINGS = ['sound', 'soundAsked', 'taught', 'speed'];

type Save = Record<string, unknown>;
/** A save of this version: the settings, and the progress of one campaign. */
const save = (extra: Save = {}, campaign = CAMPAIGN): Save => {
  const pick = (keep: boolean) =>
    Object.fromEntries(
      Object.entries(extra).filter(([k]) => SETTINGS.includes(k) === keep)
    );
  return {
    v: 2,
    sound: false,
    soundAsked: true,
    taught: true,
    speed: 'normal',
    ...pick(true),
    campaigns: {
      [campaign]: {
        freed: [],
        review: {},
        xp: 0,
        beaten: [],
        perks: { pv: 0, ink: 0 },
        known: [],
        recruits: [],
        lineup: [],
        seen: ['intro'],
        defeats: {},
        ...pick(false),
      },
    },
  };
};
/** The first version's save, as the game stored it before the party existed. */
const v1 = (extra: Save = {}): Save => ({
  v: 1,
  freed: ['aa-063'],
  review: { 'aa-068': 2, 'aa-014': 2 },
  xp: 8,
  beaten: [],
  perks: { pv: 0, ink: 0 },
  known: { grib: { duel: 'crit' } },
  sound: false,
  soundAsked: true,
  taught: true,
  seen: ['intro', 'chapter-0'],
  ...extra,
});
/** Fixed time, so the game's random draws are the same on every run. */
const NOW = 1795170000000;

async function openGame(
  page: Page,
  lang: 'fr' | 'en',
  stored: Save | null,
  key = SAVE_KEY,
  path = 'training/'
): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.addInitScript(
    ([key, value, now]) => {
      let tick = 0;
      Date.now = () => Number(now) + tick++;
      if (value && !sessionStorage.getItem('seeded')) {
        localStorage.setItem(key, value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    [key, stored ? JSON.stringify(stored) : '', String(NOW)]
  );
  await page.goto(`/${lang}/${path}`);
  await page.locator('#tg-play').click();
  await expect(page.locator('#zone button').first()).toBeVisible();
  return errors;
}

/** How long a tap waits for its button: a menu read just before can be replaced by then. */
const TAP_TIMEOUT = 5000;
/** A tap right after the previous one is ignored by design (no double taps), so menu taps wait. */
async function tap(page: Page, k: string): Promise<void> {
  await page.waitForTimeout(300);
  await page
    .locator(`#zone [data-k="${k}"]`)
    .first()
    .click({ timeout: TAP_TIMEOUT });
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
      await tap(page, weapon).catch(() => {});
      continue;
    }
    if (ks.includes('done')) {
      await tap(page, 'done').catch(() => {});
      continue;
    }
    const pick = ks.find(
      (k) => !k.endsWith('!') && !SKIP.has(k) && !k.startsWith('ally:')
    );
    if (pick) {
      await tap(page, pick).catch(() => {});
      continue;
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`not reached; menu: ${(await keys(page)).join(',')}`);
}

/** The stored save, its settings and one campaign's progress side by side. */
const stored2 = (page: Page, campaign = CAMPAIGN) =>
  page.evaluate(
    ([k, camp]) => {
      const s = JSON.parse(localStorage.getItem(k) ?? '{}');
      return { ...s, ...(s.campaigns?.[camp] ?? {}) };
    },
    [SAVE_KEY, campaign]
  );
/** Taps Continue until `done` holds. */
async function tapUntil(
  page: Page,
  done: () => Promise<boolean>,
  max = 200
): Promise<void> {
  for (let i = 0; i < max; i++) {
    if (await done()) return;
    const go = page.locator('#go:not([aria-disabled])');
    if (await go.count()) await go.click({ timeout: 3000 }).catch(() => {});
    else await page.waitForTimeout(100);
  }
  throw new Error('not reached');
}
const dlg = (page: Page) => page.locator('#dlg-txt');

/** The doors a room can offer. */
const DOOR_KEYS = ['combat', 'elite', 'cafe', 'coffre'];
/** Share of an enemy's sprite its plate or intent may cover. */
const MAX_COVER = 0.1;

async function checkLayout(page: Page): Promise<void> {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(over).toBeLessThanOrEqual(0);
  const small = await page.locator('#tg-host').evaluate((host, MAX_COVER) => {
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
      // a line of text that does not fit its box is cut off
      const cs = getComputedStyle(el);
      if (
        own &&
        cs.overflowX !== 'visible' &&
        cs.overflowX !== 'auto' &&
        cs.overflowX !== 'scroll' &&
        el.scrollWidth > el.clientWidth + 1
      )
        bad.push(`text clipped: ${el.textContent?.trim().slice(0, 40)}`);
    });
    // content stays inside its party chip and its choice card
    const inside = (outer: Element, sel: string, what: string) => {
      const ob = outer.getBoundingClientRect();
      outer.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (
          r.left < ob.left - 1 ||
          r.right > ob.right + 1 ||
          r.top < ob.top - 1 ||
          r.bottom > ob.bottom + 1
        )
          bad.push(`${what} ${(outer as HTMLElement).dataset.k} spills`);
      });
    };
    root.querySelectorAll('.pc').forEach((pc) => inside(pc, '*', 'chip'));
    root
      .querySelectorAll('#zone .choice')
      .forEach((ch) => inside(ch, '*', 'card'));
    // enemies: plates and intents leave the sprite visible; a boss is the biggest thing
    const area = (r: DOMRect) => r.width * r.height;
    const over = (a: DOMRect, b: DOMRect) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    const boss = !!root.querySelector('#scene.boss-fight');
    /* the answer step keeps a compact arena: the boss is smaller there, still recognisable */
    const answering = !!root.querySelector('#console.answering');
    const minBoss = answering ? 72 : innerHeight >= 690 ? 110 : 90;
    /* the sprite as drawn: its box scaled to the viewBox, centred */
    const drawn = (svg: SVGSVGElement): DOMRect => {
      const r = svg.getBoundingClientRect();
      const vb = svg.viewBox.baseVal;
      if (!vb || !vb.width) return r;
      const k = Math.min(r.width / vb.width, r.height / vb.height);
      const w = vb.width * k;
      const h = vb.height * k;
      return new DOMRect(
        r.left + (r.width - w) / 2,
        r.top + (r.height - h) / 2,
        w,
        h
      );
    };
    root.querySelectorAll('.foe:not(.gone)').forEach((f) => {
      const svg = f.querySelector<SVGSVGElement>('.art svg');
      const art = svg ? drawn(svg) : null;
      if (!art || !art.width) return;
      for (const part of ['.plate', '.intent']) {
        const r = f.querySelector(part)?.getBoundingClientRect();
        if (r && over(art, r) > area(art) * MAX_COVER)
          bad.push(`${part} covers the sprite`);
      }
      if (boss && f.classList.contains('boss') && art.height < minBoss)
        bad.push(`boss sprite ${Math.round(art.height)}px`);
    });
    // the action zone shows all of its content, or scrolls to it
    const zone = root.getElementById('zone') as HTMLElement;
    const scrolls = ['auto', 'scroll'].includes(
      getComputedStyle(zone).overflowY
    );
    if (!scrolls && zone.scrollHeight > zone.clientHeight + 1)
      bad.push(`zone clipped by ${zone.scrollHeight - zone.clientHeight}px`);
    const zb = zone.getBoundingClientRect();
    zone.querySelectorAll('.choice').forEach((c) => {
      const r = c.getBoundingClientRect();
      if (!scrolls && r.height && r.bottom > zb.bottom + 1)
        bad.push(`${(c as HTMLElement).dataset.k} below the zone`);
    });
    return bad;
  }, MAX_COVER);
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
    const reward = (await keys(page)).find((k) => /^(item|boon):/.test(k));
    await tap(page, reward as string);
    await playUntil(
      page,
      (ks) => ks.filter((k) => DOOR_KEYS.includes(k)).length === 2
    );
    await checkLayout(page);
    const stored = await stored2(page);
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

  test('desktop, French: an area attack hits the whole party', async ({
    page,
  }) => {
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
      save({
        beaten: domains.slice(0, -1),
        recruits: ['vigie', 'navette', 'moka', 'tampon'],
        lineup: ['moka', 'tampon'],
        seen: [
          'intro',
          'join-vigie',
          'join-navette',
          'join-moka',
          'join-tampon',
        ],
      })
    );
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('exam'));
    await expect(page.locator('.foe .intent.area')).toBeVisible();
    await expect(page.locator('.pc')).toHaveCount(3);
    await tap(page, 'guard');
    await playUntil(
      page,
      async () => (await page.locator('.pc .pvn.delta.hurt').count()) === 3,
      'none'
    );
    await expect(dlg(page)).toContainText('Onde');
    // three members each showing "old → new" on a phone strip
    await page.setViewportSize(PHONE);
    await checkLayout(page);
    expect(errors).toEqual([]);
  });

  test('phone, French: a weakness, a skill paid in tokens, a status that ticks and expires', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    const errors = await openGame(page, 'fr', save({ known: ['grib'] }));
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(page, (ks) => ks.includes('exam'), 'none');
    const foe = page.locator('.foe').first();
    await expect(foe.locator('.pvn')).toHaveText('40/40');
    await expect(page.locator('#zone [data-k="exam"] .tag')).toHaveText('×2');
    await expect(page.locator('.tok b')).toHaveText('4');
    await tap(page, 'skills');
    const coulure = page.locator('#zone [data-k="coulure"]');
    await expect(coulure.locator('.fig')).toContainText('−24');
    await checkLayout(page);
    await tap(page, 'coulure');
    await expect(page.locator('#zone button.ans')).toHaveCount(3);
    await answer(page, true);
    await tapUntil(page, async () =>
      /40 → 16/.test((await foe.locator('.pvn').textContent()) ?? '')
    );
    await expect(dlg(page)).toContainText('(40 → 16)');
    await expect(foe.locator('.chip.st-poison b')).toHaveText('3');
    await tapUntil(
      page,
      async () => (await page.locator('#zone [data-k="guard"]').count()) > 0
    );
    await expect(page.locator('.tok b')).toHaveText('3');
    await tap(page, 'guard');
    await expect(page.locator('.pc .chip.st-guard')).toBeVisible();
    await tapUntil(
      page,
      async () => (await foe.locator('.chip.st-poison b').textContent()) === '2'
    );
    await tapUntil(
      page,
      async () => (await page.locator('#zone [data-k="guard"]').count()) > 0
    );
    await expect(page.locator('.pc .chip.st-guard')).toHaveCount(0);
    const poisoned = async () =>
      (await foe.locator('.chip.st-poison').count()) > 0;
    for (let i = 0; i < 2 && (await poisoned()); i++) {
      await tap(page, 'guard');
      await expect(page.locator('#zone [data-k="guard"]')).toHaveCount(0);
      await tapUntil(
        page,
        async () =>
          (await page.locator('#zone [data-k="guard"]').count()) > 0 ||
          !(await poisoned())
      );
    }
    await expect(foe.locator('.chip.st-poison')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('phone, English: an ally joins in a scene of their own and takes a turn', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    const errors = await openGame(page, 'en', save());
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(
      page,
      async () =>
        (await page.locator('#scene[data-cine="join-vigie"]').count()) > 0
    );
    await expect(dlg(page)).toContainText('Vigie');
    await playUntil(
      page,
      async (ks) =>
        ks.includes('exam') &&
        /Vigie/.test((await page.locator('#banner').textContent()) ?? '')
    );
    await expect(page.locator('.pc')).toHaveCount(2);
    await expect(page.locator('.pc.acting')).toHaveAttribute('data-k', 'vigie');
    await tap(page, 'skills');
    await expect(page.locator('#zone .choice.skill')).toHaveCount(3);
    await checkLayout(page);
    await tap(page, 'back');
    await tap(page, 'exam');
    await answer(page, true);
    await tapUntil(page, async () =>
      /Vigie · Ping/.test((await dlg(page).textContent()) ?? '')
    );
    expect((await stored2(page)).recruits).toEqual(['vigie']);
    expect(errors).toEqual([]);
  });

  test('phone, French: the first boss changes phase', async ({ page }) => {
    test.setTimeout(420_000);
    await page.setViewportSize(PHONE);
    const errors = await openGame(
      page,
      'fr',
      save({ xp: 300, perks: { pv: 2, ink: 1 } })
    );
    await playUntil(page, (ks) => ks.includes('enter'));
    await tap(page, 'enter');
    await playUntil(
      page,
      async (ks) =>
        ks.includes('exam') &&
        (await page.locator('#scene.boss-fight').count()) > 0,
      'exam',
      1500
    );
    await checkLayout(page);
    await page.setViewportSize({ width: 360, height: 640 });
    await checkLayout(page);
    await page.setViewportSize(PHONE);
    await playUntil(
      page,
      async () => (await page.locator('#scene[data-phase="1"]').count()) > 0,
      'exam',
      1500
    );
    await expect(dlg(page)).toContainText('deux actions par tour');
    expect(errors).toEqual([]);
  });

  test('phone, French: an old save is migrated, played and resumed', async ({
    page,
  }) => {
    await page.setViewportSize(PHONE);
    const domains = await page.request
      .get('/fr/training/')
      .then((r) => r.text())
      .then((html) => [
        ...new Set(
          [...html.matchAll(/data-domain="([a-z_]+)"/g)].map((m) => m[1])
        ),
      ]);
    const old = v1({ beaten: [domains[0]], xp: 160, perks: { pv: 1, ink: 0 } });
    const errors = await openGame(page, 'fr', old, SAVE_KEY_V1);
    await playUntil(page, (ks) => ks.includes('start'));
    await tap(page, 'start');
    await playUntil(
      page,
      async () =>
        (await page.locator('#scene[data-cine="join-vigie"]').count()) > 0
    );
    await playUntil(page, (ks) => ks.includes('enter'));
    const stored = await stored2(page);
    expect(stored.v).toBe(2);
    expect(stored.freed).toEqual(['aa-063']);
    expect(stored.review).toEqual({ 'aa-068': 2, 'aa-014': 2 });
    expect(stored.xp).toBe(160);
    expect(stored.recruits).toEqual(['vigie']);
    expect(stored.seen).toContain('join-vigie');
    const first = await page.evaluate(
      (k) => JSON.parse(localStorage.getItem(k) ?? '{}'),
      SAVE_KEY_V1
    );
    expect(first).toEqual(old);
    await page.locator('#quit').click();
    await page.reload();
    await expect(page.locator('#tg-progress')).toContainText('1 / 300');
    await expect(
      page.locator('.tg-sheet .tg-review:not([hidden])')
    ).toHaveCount(2);
    expect(errors).toEqual([]);
  });

  test.describe('with motion', () => {
    test.use({ contextOptions: { reducedMotion: 'no-preference' } });

    /** The next line that moves on by itself: its text and how long it stays, per character. */
    const nextAutoLine = async (page: Page, not = '') => {
      const h = await page.waitForFunction(
        (prev) => {
          const r = document.querySelector('#tg-host')?.shadowRoot;
          const d = r?.querySelector<HTMLElement>('#dialog');
          const t = r?.querySelector('#dlg-txt')?.textContent ?? '';
          if (!d?.classList.contains('auto') || t === prev) return null;
          return { t, dur: parseFloat(d.style.getPropertyValue('--dur')) };
        },
        not,
        { polling: 50, timeout: 60_000 }
      );
      const v = (await h.jsonValue()) as { t: string; dur: number };
      return { ...v, share: v.dur / (1600 + 60 * v.t.length) };
    };

    test('phone, French: health and statuses change on screen only when the hit lands', async ({
      page,
    }) => {
      await page.setViewportSize(PHONE);
      const errors = await openGame(page, 'fr', save({ known: ['grib'] }));
      await tap(page, 'start');
      await page.locator('#zone [data-k="enter"]').waitFor();
      await tap(page, 'enter');
      await tap(page, 'skip');
      await playUntil(page, (ks) => ks.includes('skills'), 'none');
      const foe = page.locator('.foe').first();
      await expect(foe.locator('.pvn')).toHaveText('40/40');
      await tap(page, 'skills');
      await tap(page, 'coulure');
      await answer(page, true);
      // the plate as it is drawn, sampled until the hit shows "old → new"; the
      // answer's explanation waits for Continue, every other line moves on by itself
      const seen: string[] = [];
      for (let i = 0; i < 600; i++) {
        const s = await page.locator('#tg-host').evaluate((host) => {
          const r = host.shadowRoot as ShadowRoot;
          const f = r.querySelector('.foe');
          const pvn = f?.querySelector('.pvn')?.textContent ?? '';
          const chip = f?.querySelector('.chip.st-poison') ? '+poison' : '';
          const go = r.querySelector<HTMLElement>('#go:not([aria-disabled])');
          if (go && r.querySelector('#dlg-txt .verdict')) go.click();
          return pvn + chip;
        });
        seen.push(s);
        if (s.includes('→')) break;
        await page.waitForTimeout(40);
      }
      expect(seen[seen.length - 1]).toContain('→');
      const before = seen.slice(0, -1);
      expect(before.length).toBeGreaterThan(5);
      expect(new Set(before)).toEqual(new Set(['40/40']));
      expect(errors).toEqual([]);
    });

    test('phone, French: the fast speed is saved and shortens every pause', async ({
      page,
    }) => {
      await page.setViewportSize(PHONE);
      const errors = await openGame(page, 'fr', save());
      await tap(page, 'start');
      await page.locator('#zone [data-k="enter"]').waitFor();
      await tap(page, 'enter');
      await tap(page, 'skip');
      const auto = () => page.locator('#dialog.auto').count();
      await playUntil(page, async () => (await auto()) > 0, 'none');
      const normal = await nextAutoLine(page);
      expect(normal.share).toBeCloseTo(1, 1);
      await page.locator('#help').click();
      await page.locator('[data-speed="fast"]').click();
      await page.locator('#howto-close').click();
      expect((await stored2(page)).speed).toBe('fast');
      await playUntil(
        page,
        async () =>
          (await auto()) > 0 && (await dlg(page).textContent()) !== normal.t,
        'guard'
      );
      const quick = await nextAutoLine(page, normal.t);
      expect(quick.share).toBeCloseTo(0.7, 1);
      expect(errors).toEqual([]);
    });
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

  for (const size of [PHONE, { width: 360, height: 640 }, DESKTOP])
    for (const lang of ['fr', 'en'] as const)
      test(`${size.width}x${size.height}, ${lang}: the arena stays on screen while the longest question is asked`, async ({
        page,
      }) => {
        await page.setViewportSize(size);
        const errors = await openGame(page, lang, save());
        await playUntil(page, (ks) => ks.includes('enter'));
        await tap(page, 'enter');
        await playUntil(page, (ks) => ks.includes('exam'), 'none');
        await tap(page, 'exam');
        await expect(page.locator('#zone button.ans')).toHaveCount(4);
        await expect(page.locator('#scene')).toBeVisible();
        await expect(page.locator('.foe.sel')).toBeVisible();
        await checkMedianFits(page, lang);
        await checkLongest(page, lang);
        await answer(page, true);
        await tapUntil(
          page,
          async () => (await page.locator('.foe .pvn.delta').count()) > 0
        );
        await expect(page.locator('#scene')).toBeVisible();
        expect(errors).toEqual([]);
      });

  test.describe('the second exam', () => {
    /** The domains of an exam's page, in chapter order. */
    const domainsOf = (page: Page, path: string) =>
      page.request
        .get(`/fr/${path}`)
        .then((r) => r.text())
        .then((html) => [
          ...new Set(
            [...html.matchAll(/data-domain="([a-z_]+)"/g)].map((m) => m[1])
          ),
        ]);

    for (const size of [PHONE, { width: 360, height: 640 }])
      for (const lang of ['fr', 'en'] as const)
        test(`${size.width}x${size.height}, ${lang}: each exam page shows the switcher and Play on the first screen, and the switcher works both ways`, async ({
          page,
        }) => {
          await page.setViewportSize(size);
          await page.goto(`/${lang}/training/`);
          const sw = page.locator('nav.tg-switch');
          const first = async () => {
            for (const el of [sw, page.locator('#tg-play')]) {
              const b = (await el.boundingBox())!;
              expect(b.y + b.height).toBeLessThanOrEqual(size.height);
              expect(b.x + b.width).toBeLessThanOrEqual(size.width);
            }
            for (const a of await sw.locator('a').all()) {
              const b = (await a.boundingBox())!;
              expect(b.height).toBeGreaterThanOrEqual(44);
            }
          };
          await first();
          await expect(sw.locator('a[aria-current="page"]')).toHaveText(
            'Architect - Foundations'
          );
          await expect(page.locator('table.certs')).toHaveCount(1);
          await sw
            .locator('a', { hasText: 'Developer - Professional' })
            .click();
          await expect(page).toHaveURL(new RegExp(`/${lang}/${DEV_PATH}$`));
          await first();
          await expect(sw.locator('a[aria-current="page"]')).toHaveText(
            'Developer - Professional'
          );
          await expect(page.locator('#tg-progress')).toContainText(
            `0 / ${DEV_SHEETS}`
          );
          await expect(page.locator('table.certs')).toHaveCount(0);
          await expect(page.locator('#exam')).toHaveText(
            'Claude Certified Developer - Professional'
          );
          await expect(page.locator('table.domains thead th')).toHaveCount(2);
          await expect(page.locator('table.domains tbody tr')).toHaveCount(8);
          const over = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth
          );
          expect(over).toBeLessThanOrEqual(0);
          await sw.locator('a', { hasText: 'Architect - Foundations' }).click();
          await expect(page).toHaveURL(new RegExp(`/${lang}/training/$`));
          await expect(page.locator('#tg-progress')).toContainText('/ 300');
        });

    test('every question of the second bank is in its page, folded, in the page language', async ({
      request,
    }) => {
      const norm = (x: string) =>
        x
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
      for (const lang of ['fr', 'en'] as const) {
        const html = norm(
          await (await request.get(`/${lang}/${DEV_PATH}`)).text()
        );
        expect(html.match(/<details class="tg-sheet/g)).toHaveLength(
          devBank.length
        );
        expect(html).not.toMatch(/<details class="tg-sheet[^>]* open/);
        for (const q of devBank) {
          expect(html, q.id).toContain(`data-id="${q.id}"`);
          expect(html, q.id).toContain(q.stem[lang]);
          expect(html, q.id).toContain(q.options[lang][q.answer]);
        }
        const foundations = await (
          await request.get(`/${lang}/training/`)
        ).text();
        expect(foundations).not.toContain(`data-id="${devBank[0].id}"`);
      }
    });

    test('phone, English: a fight in the second campaign, its progress kept apart from the first', async ({
      page,
    }) => {
      await page.setViewportSize(PHONE);
      const foundations = save({ freed: ['aa-001'], xp: 12 }).campaigns as Save;
      const both = { ...save({}, DEV), campaigns: { ...foundations } };
      const errors = await openGame(page, 'en', both, SAVE_KEY, DEV_PATH);
      await expect(dlg(page)).toContainText(`${DEV_SHEETS}`);
      await playUntil(page, (ks) => ks.includes('start'));
      await tap(page, 'start');
      await playUntil(page, (ks) => ks.includes('enter'));
      await expect(page.locator('#zone [data-k="enter"]')).toContainText(
        'Integration'
      );
      await checkLayout(page);
      await tap(page, 'enter');
      await winFirstFight(page, 'trident');
      const dev = await stored2(page, DEV);
      expect(dev.freed.length).toBeGreaterThan(0);
      expect(dev.freed.every((id: string) => id.startsWith('dp-'))).toBe(true);
      const kept = await stored2(page, CAMPAIGN);
      expect(kept.freed).toEqual(['aa-001']);
      expect(kept.xp).toBe(12);
      await page.locator('#quit').click();
      await expect(page.locator('#tg-progress')).toContainText(
        `${dev.freed.length} / ${DEV_SHEETS}`
      );
      await page.goto('/en/training/');
      await expect(page.locator('#tg-progress')).toContainText('1 / 300');
      await expect(page.locator('#tg-play-label')).toHaveText('Resume');
      expect(errors).toEqual([]);
    });

    test('phone, French: the Untraced goes off the radar, and a 4-option answer traces it', async ({
      page,
    }) => {
      test.setTimeout(420_000);
      await page.setViewportSize(PHONE);
      const domains = await domainsOf(page, DEV_PATH);
      const ch = domains.indexOf('observability');
      const errors = await openGame(
        page,
        'fr',
        save(
          {
            beaten: domains.slice(0, ch),
            xp: 900,
            perks: { pv: 3, ink: 2 },
            recruits: ['vigie', 'navette'],
            lineup: ['vigie', 'navette'],
            seen: ['intro', 'join-vigie', 'join-navette'],
          },
          DEV
        ),
        SAVE_KEY,
        DEV_PATH
      );
      await playUntil(page, (ks) => ks.includes('enter'));
      await tap(page, 'enter');
      await playUntil(
        page,
        async (ks) =>
          ks.includes('exam') &&
          (await page.locator('#scene.boss-fight').count()) > 0,
        'exam',
        1500
      );
      await checkLayout(page);
      await page.setViewportSize({ width: 360, height: 640 });
      await checkLayout(page);
      await page.setViewportSize(PHONE);
      await playUntil(
        page,
        async () => (await page.locator('.foe.boss.dark').count()) > 0,
        'trident',
        1500
      );
      await expect(page.locator('.foe.boss .intent.i-hidden')).toBeVisible();
      await checkLayout(page);
      await playUntil(
        page,
        async () =>
          (await page.locator('.foe.boss .chip.st-traced').count()) > 0,
        'exam',
        1500
      );
      await expect(page.locator('.foe.boss.dark')).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  });
});
