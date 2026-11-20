/** Screens around the fights: title, map, a chapter's rooms and doors, café, chest, tally, level-up. */
import {
  afterStep,
  applyReward,
  fightXp,
  genChest,
  genDoors,
  newRun,
  restAtCafe,
} from '../../domain/engine';
import type { DoorKey, Reward, Run } from '../../domain/engine';
import { sheetLabel } from '../../domain/bank';
import {
  CHAPTERS,
  FIGHTS_PER_CHAPTER,
  RULES,
  levelOf,
  maxHpOf,
  maxInkOf,
} from '../../domain/rules';
import { chapterCopy } from '../../i18n/copy';
import { G, $, esc, reduced, wait } from './state';
import {
  Zone,
  blip,
  bubbleAt,
  choose,
  openHowto,
  renderStatus,
  say,
  sayOne,
  setScene,
  setStep,
  setTurn,
  setWhere,
  showLine,
  stripHtml,
} from './ui';
import {
  cafeSvg,
  chestSvg,
  crownSvg,
  doorSvg,
  foeSvg,
  gloseBack,
  gloseSvg,
  heroBack,
  heroSvg,
  icon24,
  svg,
  R,
} from './art';
import { placeOfStep, placeSvg, timeOfStep, titleSet } from './sets';
import { battle } from './battle';
import { playCine, replayMenu } from './cine';

const go = (label: string) => `${esc(label)} ${icon24('arrow')}`;
const total = () => G.qById.size;
const freedIn = (domain: string) => {
  const f = new Set(G.host.save.freed);
  return (G.ctx.bank[domain] ?? []).filter((id) => f.has(id)).length;
};
const chapterOpen = (i: number) =>
  i === 0 || G.host.save.beaten.includes(CHAPTERS[i - 1].domain);

/* ---------- title ---------- */
export async function titleScreen(): Promise<void> {
  const c = G.c;
  const save = G.host.save;
  G.run = null;
  G.F = null;
  G.screen = 'title';
  setScene(titleSet(), { time: 'night' });
  setWhere(c.game, '');
  $('layer').innerHTML =
    `<div class="title-wrap"><h1>${esc(c.game)}</h1></div>` +
    `<div class="title-art" aria-hidden="true"><span class="shade">${foeSvg('grib')}</span>${gloseSvg()}${heroSvg()}<span class="shade">${foeSvg('din')}</span></div>`;
  renderStatus();
  if (!save.seen.includes('intro')) {
    await playCine('intro');
    return titleScreen();
  }
  showLine(
    esc(save.freed.length || save.xp ? c.lines.titleBack : c.lines.titleNew),
    'glose'
  );
  if (!save.soundAsked) {
    const k = await choose({
      kind: 'sound',
      label: c.labels.sound,
      layout: 'c2',
      items: [
        { k: 'yes', cls: 'primary', label: c.labels.yes },
        { k: 'no', cls: 'primary', label: c.labels.no },
      ],
    });
    save.sound = k === 'yes';
    save.soundAsked = true;
    G.host.persist();
    renderToggles();
    blip('ok');
  }
  for (;;) {
    const k = await choose({
      kind: 'title',
      items: [
        {
          k: 'start',
          cls: 'primary',
          html: go(
            save.freed.length || save.xp ? c.actions.cont : c.actions.start
          ),
        },
      ],
      secondary: [
        { k: 'sheets', html: `${icon24('sheets')}${esc(c.actions.sheets)}` },
        { k: 'cines', html: `${icon24('film')}${esc(c.actions.cines)}` },
        { k: 'help', html: `${icon24('help')}${esc(c.actions.howto)}` },
      ],
    });
    if (k === 'start') return mapScreen();
    if (k === 'sheets') G.host.openSheets();
    if (k === 'cines') {
      await replayMenu();
      return titleScreen();
    }
    if (k === 'help') openHowto();
  }
}

export function renderToggles(): void {
  $('snd').setAttribute('aria-pressed', String(!!G.host.save.sound));
}

/* ---------- map: the building in cross-section, one room per exam domain ---------- */
const lockSvg = () =>
  svg(
    R(3, 7, 10, 8, 'var(--ink-2)') +
      `<path d="M5 7 V4 a3 3 0 0 1 6 0 V7" fill="none" stroke="var(--ink-2)" stroke-width="1.6"/>`,
    '0 0 16 16'
  );

export async function mapScreen(): Promise<void> {
  const c = G.c;
  const save = G.host.save;
  G.run = null;
  G.F = null;
  G.screen = 'map';
  G.host.refresh();
  setScene('', { time: '' });
  setWhere(c.game, esc(c.titles[levelOf(save.xp) - 1]));
  renderStatus();
  let sel = CHAPTERS.findIndex(
    (ch, i) => chapterOpen(i) && !save.beaten.includes(ch.domain)
  );
  if (sel < 0) sel = 0;
  $('layer').innerHTML = `<div class="bldg">${CHAPTERS.map((ch, i) => {
    const open = chapterOpen(i);
    const beaten = save.beaten.includes(ch.domain);
    const f = freedIn(ch.domain);
    const tot = (G.ctx.bank[ch.domain] ?? []).length;
    const cc = chapterCopy(c, i);
    return (
      `<button type="button" class="room${open ? '' : ' locked'}" data-room="${i}" aria-label="${esc(c.lines.roomAria(i + 1, cc.domain, f, tot, !open))}">${placeSvg(ch.domain, 0)}` +
      (beaten
        ? `<span class="crown" aria-hidden="true">${crownSvg()}</span>`
        : !open
          ? `<span class="lock" aria-hidden="true">${lockSvg()}</span>`
          : '') +
      `<span class="lab"><b><span class="no">${i + 1}</span><span class="nm">${esc(cc.short)}</span></b><span class="p"><span class="hb"><i style="width:${tot ? (f / tot) * 100 : 0}%"></i></span>${f}/${tot}</span></span></button>`
    );
  }).join(
    ''
  )}<div class="room total" aria-hidden="true"><span class="lab"><b>${save.freed.length}/${total()}</b><span class="p">${esc(c.titles[levelOf(save.xp) - 1])}</span></span></div></div>`;
  const all = save.beaten.length === CHAPTERS.length;
  const lineFor = (i: number) => {
    const cc = chapterCopy(c, i);
    return `<b>${esc(c.status.chapterTag(i + 1))} · ${esc(cc.domain)}</b>. ${esc(c.lines.mapAt(cc.short, freedIn(CHAPTERS[i].domain), (G.ctx.bank[CHAPTERS[i].domain] ?? []).length))}`;
  };
  showLine(
    all
      ? esc(c.lines.mapAll)
      : !save.freed.length && !save.xp
        ? esc(c.lines.mapFirst)
        : lineFor(sel),
    'glose'
  );
  const enter = {
    k: 'enter',
    cls: 'primary',
    html: '',
    why: c.actions.lockedWhy,
    dis: false,
  };
  const select = (i: number, speak: boolean) => {
    sel = i;
    enter.dis = !chapterOpen(i);
    G.root
      .querySelectorAll<HTMLElement>('.room[data-room]')
      .forEach((r) => r.classList.toggle('sel', Number(r.dataset.room) === i));
    const b = $('zone').querySelector<HTMLElement>('[data-k="enter"]');
    if (!b) return;
    const open = chapterOpen(i);
    b.innerHTML = open
      ? go(c.actions.enter(chapterCopy(c, i).short))
      : esc(c.actions.locked(chapterCopy(c, i - 1).boss.name));
    if (open) b.removeAttribute('aria-disabled');
    else b.setAttribute('aria-disabled', 'true');
    if (speak) showLine(lineFor(i), 'glose');
  };
  $('layer').onclick = (e) => {
    const r = (e.target as HTMLElement).closest<HTMLElement>(
      '.room[data-room]'
    );
    if (!r) return;
    e.stopPropagation();
    const i = Number(r.dataset.room);
    select(i, true);
    blip('move');
    if (!chapterOpen(i))
      bubbleAt(
        r.querySelector('.lab'),
        c.lines.lockedTip(chapterCopy(c, i - 1).boss.name),
        'tip'
      );
  };
  for (;;) {
    const p = choose({
      kind: 'map',
      items: [enter],
      secondary: [
        { k: 'sheets', html: `${icon24('sheets')}${esc(c.actions.sheets)}` },
        { k: 'reset', html: `${icon24('reset')}${esc(c.actions.reset)}` },
      ],
      onKey: (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
        select(
          (sel + (e.key === 'ArrowRight' ? 1 : CHAPTERS.length - 1)) %
            CHAPTERS.length,
          true
        );
        return true;
      },
    });
    select(sel, false);
    const k = await p;
    if (k === 'enter') {
      $('layer').onclick = null;
      return startChapter(sel);
    }
    if (k === 'sheets') G.host.openSheets();
    if (k === 'reset') {
      const r = await choose({
        kind: 'confirm',
        label: c.labels.confirmReset,
        layout: 'c2',
        items: [
          { k: 'yes', label: c.labels.resetYes },
          { k: 'no', label: c.labels.resetNo, back: true },
        ],
      });
      if (r === 'yes') {
        const fresh = G.host.reset();
        fresh.soundAsked = true;
        fresh.seen = ['intro'];
        G.host.persist();
        return mapScreen();
      }
    }
  }
}

/* ---------- a chapter: places, doors, rooms and fights ---------- */
export function partyHtml(): string {
  return `<div class="party"><div class="actor hero">${heroBack()}<span class="sts" id="sts-hero"></span></div><div class="actor glose">${gloseBack()}<span class="sts" id="sts-glose"></span></div></div>`;
}
export function chapterChrome(): void {
  const r = G.run;
  if (!r) return;
  const cc = chapterCopy(G.c, r.ch);
  setWhere(
    cc.short,
    `${stripHtml()}<span>${r.step === FIGHTS_PER_CHAPTER ? esc(G.c.status.bossStep) : `${r.step + 1}/5`}</span>`
  );
  renderStatus();
}
/** The set of the run's current step: place and time of day. */
export function setForStep(
  r: Run,
  restored = false
): { html: string; time: string } {
  return {
    html: placeSvg(CHAPTERS[r.ch].domain, placeOfStep(r.step), restored),
    time: timeOfStep(r.step, restored),
  };
}
async function startChapter(i: number): Promise<void> {
  G.run = newRun(i, G.rng, G.host.save.perks);
  await playCine(`chapter-${i}`);
  return chapterLoop();
}

/** The heroes walk out to the right; the next place fades in; they walk in from the left. */
async function walkTo(r: Run): Promise<void> {
  const party = $('layer').querySelector('.party');
  if (party && !reduced()) {
    party.classList.add('walk-out');
    await wait(520);
  }
  const s = setForStep(r);
  setScene(s.html, { time: s.time });
  $('layer').innerHTML = partyHtml();
  const p2 = $('layer').querySelector('.party');
  if (p2 && !reduced()) {
    p2.classList.add('walk-in');
    await wait(560);
    p2.classList.remove('walk-in');
  }
}

let lastPlace = -1;
async function chapterLoop(): Promise<void> {
  const c = G.c;
  for (;;) {
    const r = G.run as Run;
    const cc = chapterCopy(c, r.ch);
    G.screen = 'doors';
    G.F = null;
    const place = placeOfStep(r.step);
    if (r.first || lastPlace === -1) {
      const s = setForStep(r);
      setScene(s.html, { time: s.time });
      $('layer').innerHTML = partyHtml();
    } else await walkTo(r);
    lastPlace = place;
    chapterChrome();
    $('layer').insertAdjacentHTML(
      'beforeend',
      `<span class="place">${esc(cc.places[place])}</span>`
    );
    const lines: Parameters<typeof say> = [];
    if (r.first) {
      lines.push({ who: 'glose', text: cc.intro, wait: true });
      r.first = false;
    } else if (refill.ink || refill.hp)
      lines.push({ who: 'glose', text: c.lines.refill(refill.ink, refill.hp) });
    refill = { ink: 0, hp: 0 };
    const doors = genDoors(r, G.rng);
    if (doors[0] === 'boss')
      lines.push({
        who: 'glose',
        text: c.lines.bossDoor(cc.boss.name),
        wait: true,
      });
    await say(...lines);
    let door: DoorKey = doors[0];
    if (doors.length > 1 || door === 'boss') {
      $('layer').insertAdjacentHTML(
        'afterbegin',
        `<div class="doors-art" aria-hidden="true">${doors.map((d) => `<span class="door-${d}">${doorSvg(d)}</span>`).join('')}</div>`
      );
      showLine(
        esc(doors.length > 1 ? c.lines.twoDoors : c.lines.bossWaits),
        'glose'
      );
      door = (await choose({
        kind: 'doors',
        label: doors.length > 1 ? c.labels.whichDoor : '',
        layout: doors.length > 1 ? 'c2' : 'list',
        items: doors.map((d) => ({
          k: d,
          cls: doors.length > 1 ? 'door' : 'primary',
          html:
            doors.length > 1
              ? `${doorSvg(d)}<span>${esc(c.doors[d].name)}<span class="d">${esc(c.doors[d].text)}</span></span>`
              : go(c.actions.faceBoss),
        })),
      })) as DoorKey;
      const chosen = $('layer').querySelector(`.door-${door}`);
      chosen?.classList.add('opening');
      await wait(420);
    }
    r.elite = door === 'elite';
    if (door === 'cafe') {
      await cafe();
      r.step++;
      continue;
    }
    if (door === 'coffre') {
      await chest(false);
      stepDone(r);
      continue;
    }
    const out = await battle();
    if (out === 'flee') return mapScreen();
    if (out === 'lose') {
      await defeat();
      return mapScreen();
    }
    await victory();
    if (r.step === FIGHTS_PER_CHAPTER) {
      lastPlace = -1;
      return afterBoss(r);
    }
    await chest(r.elite);
    stepDone(r);
  }
}
/** What the last rest gave back, told when the next place opens. */
let refill = { ink: 0, hp: 0 };
function stepDone(r: Run): void {
  r.step++;
  refill = afterStep(r);
}

/** The boss room changes once the boss is down: lights back on, dawn in the window. */
async function afterBoss(r: Run): Promise<void> {
  const c = G.c;
  const save = G.host.save;
  const ch = CHAPTERS[r.ch];
  const firstWin = !save.beaten.includes(ch.domain);
  if (firstWin) {
    save.beaten.push(ch.domain);
    G.host.persist();
  }
  await playCine(`fall-${r.ch}`);
  const s = setForStep(r, true);
  setScene(s.html, { time: s.time });
  $('layer').innerHTML = partyHtml();
  void anim($('layer').querySelector('.party'), 'cheer', 500);
  const nxt = CHAPTERS[r.ch + 1];
  const allDone = save.beaten.length === CHAPTERS.length;
  await say({
    who: 'glose',
    text:
      nxt && !allDone
        ? c.lines.chapterWon(chapterCopy(c, r.ch + 1).short)
        : c.lines.allWon,
    wait: true,
  });
  if (allDone && firstWin) await playCine('ending');
  return mapScreen();
}
function anim(el: Element | null, cls: string, ms: number): Promise<void> {
  if (!el) return wait(0);
  el.classList.add(cls);
  return wait(ms).then(() => el.classList.remove(cls));
}

async function cafe(): Promise<void> {
  const r = G.run as Run;
  const c = G.c;
  G.screen = 'cafe';
  const s = setForStep(r);
  setScene(s.html, { time: s.time, cls: 'warm' });
  $('layer').innerHTML =
    partyHtml() +
    `<div class="center-art cafe" aria-hidden="true">${cafeSvg()}</div>`;
  const got = restAtCafe(r);
  renderStatus();
  await say(
    { who: 'moka', text: c.lines.cafe },
    { who: 'glose', text: c.lines.cafeGlose(got.hp, got.ink), wait: true }
  );
}

async function chest(rich: boolean): Promise<void> {
  const r = G.run as Run;
  const c = G.c;
  G.F = null;
  G.screen = 'chest';
  const s = setForStep(r);
  setScene(s.html, { time: s.time });
  $('layer').innerHTML =
    partyHtml() +
    `<div class="center-art chest" id="chest" aria-hidden="true">${chestSvg(false)}</div>`;
  chapterChrome();
  const box = $('chest');
  await wait(300);
  box.classList.add('rattle');
  await wait(450);
  box.classList.remove('rattle');
  box.innerHTML = chestSvg(true);
  box.classList.add('open');
  blip('chest');
  showLine(esc(rich ? c.lines.chestRich : c.lines.chestPlain), 'glose');
  const opts = genChest(r, rich, G.rng);
  const info = (o: Reward) => {
    const [kind, k] = o.split(':');
    return kind === 'item' ? c.items[k as 'cafe'] : c.boons[k as 'ink'];
  };
  const k = (await choose({
    kind: 'chest',
    label: c.labels.chest,
    layout: opts.length > 2 ? 'list' : 'c2',
    items: opts.map((o) => ({
      k: o,
      cls: 'reward',
      html: `${o.startsWith('item') ? icon24('sac') : icon24('verve')}<span>${esc(info(o).name)}<span class="d">${esc(info(o).text)}</span></span>`,
    })),
  })) as Reward;
  applyReward(r, k);
  renderStatus();
  await say(c.lines.took(info(k).name));
}

/* ---------- after a fight: the tally, cards that flip one by one ---------- */
async function tally(won: boolean): Promise<void> {
  const F = G.F;
  const r = G.run;
  if (!F || !r) return;
  const c = G.c;
  const save = G.host.save;
  G.screen = 'results';
  const xp = fightXp(F, won);
  const s = setForStep(r);
  setScene(s.html, { time: s.time });
  setTurn(null);
  setStep(
    won ? (F.isBoss ? c.labels.bossDown : c.labels.victory) : c.labels.retreat
  );
  const cards = F.freedHere.map((id) => G.qById.get(id)).filter((q) => !!q);
  $('layer').innerHTML =
    `<div class="wcards">${cards.map((q, i) => `<div class="wcard back" data-i="${i}">${esc(sheetLabel(q.id))}</div>`).join('')}</div>` +
    partyHtml();
  renderStatus();
  if (!cards.length) await say({ text: c.lines.tallyNone, wait: true });
  for (let i = 0; i < cards.length; i++) {
    const card = $('layer').querySelector(
      `.wcard[data-i="${i}"]`
    ) as HTMLElement;
    card.classList.remove('back');
    card.classList.add('flip', 'cur');
    card.insertAdjacentHTML(
      'beforeend',
      `<span class="st">${esc(c.sheets.freed)}</span>`
    );
    blip('free');
    const q = cards[i];
    await sayOne({
      wait: true,
      html: c.lines.tallyCard(esc(sheetLabel(q.id)), esc(q.options[q.answer])),
    });
    card.classList.remove('cur');
  }
  const before = levelOf(save.xp);
  save.xp += xp;
  G.host.persist();
  await sayOne({ text: c.lines.tallySum(cards.length, xp) });
  if (levelOf(save.xp) > before) await levelUp(levelOf(save.xp));
  G.host.refresh();
  Zone.idle();
}
async function levelUp(l: number): Promise<void> {
  const c = G.c;
  const save = G.host.save;
  const r = G.run;
  G.screen = 'levelup';
  blip('level');
  $('fx').insertAdjacentHTML(
    'beforeend',
    `<div class="fanfare"><span class="sparks" aria-hidden="true">${'<i></i>'.repeat(8)}</span><b>${esc(c.lines.levelName(l))}</b><span>${esc(c.titles[l - 1])}</span></div>`
  );
  showLine(esc(c.lines.levelUp(l, c.titles[l - 1])), 'glose');
  const capped = maxHpOf(save.perks) >= RULES.hpCap;
  const inkCapped = maxInkOf(save.perks) >= RULES.inkCap;
  const k = (await choose({
    kind: 'levelup',
    label: c.labels.progress,
    layout: 'c2',
    items: [
      {
        k: 'pv',
        html: `${esc(c.lines.perkPv(RULES.perkPv))}<span class="d">${esc(c.lines.perkPvText)}</span>`,
        dis: capped,
        why: c.lines.perkCapped,
      },
      {
        k: 'ink',
        html: `${esc(c.lines.perkInk)}<span class="d">${esc(c.lines.perkInkText)}</span>`,
        dis: inkCapped,
        why: c.lines.perkCapped,
      },
    ],
  })) as 'pv' | 'ink';
  save.perks[k]++;
  G.host.persist();
  if (r) {
    if (k === 'pv') {
      const m = Math.min(RULES.hpCap, r.maxHp + RULES.perkPv);
      r.hp += m - r.maxHp;
      r.maxHp = m;
    } else {
      r.maxInk++;
      r.ink++;
    }
  }
  $('fx').querySelector('.fanfare')?.remove();
  renderStatus();
}
async function victory(): Promise<void> {
  await wait(300);
  await tally(true);
}
async function defeat(): Promise<void> {
  await say(G.c.lines.defeat, {
    who: 'glose',
    text: G.c.lines.defeatGlose,
    wait: true,
  });
  await tally(false);
}
