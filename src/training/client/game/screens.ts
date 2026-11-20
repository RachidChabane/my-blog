/**
 * Screens around the fights: title, options, map, a chapter's rooms and doors, the
 * recruits and the line-up, café, chest, tally and level-up.
 */
import { fightXp, setLevel } from '../../domain/engine';
import type { Run } from '../../domain/engine';
import type { AllyKey } from '../../domain/party';
import {
  ALLY_KEYS,
  LINEUP_SIZE,
  MEMBERS,
  lineupWith,
} from '../../domain/party';
import { recruitAt } from '../../domain/campaign';
import {
  FIGHTS_PER_CHAPTER,
  RULES,
  levelOf,
  maxTokensOf,
} from '../../domain/rules';
import type { ItemKey } from '../../domain/rules';
import {
  afterStep,
  applyReward,
  assistOf,
  delivery,
  genChest,
  genDoors,
  join,
  newRun,
  restAtCafe,
  setLineup,
} from '../../domain/run';
import type { DoorKey, Reward } from '../../domain/run';
import type { Speed } from '../../domain/save';
import { SPEEDS } from '../../domain/save';
import { sheetLabel } from '../../domain/bank';
import { chapterCopy } from '../../i18n/copy';
import { G, $, chapters, domainOf, esc, reduced, wait } from './state';
import {
  Zone,
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
  castSvg,
  chestSvg,
  crownSvg,
  doorSvg,
  elIcon,
  foeSvg,
  gloseSvg,
  heroSvg,
  icon24,
  svg,
  R,
} from './art';
import { memberName, partyHtml } from './hud';
import { placeOfStep, placeSvg, timeOfStep, titleSet } from './sets';
import { battle } from './battle';
import { playCine, replayMenu } from './cine';
import { blip } from './sound';

const go = (label: string) => `${esc(label)} ${icon24('arrow')}`;
const total = () => G.qById.size;
const freedIn = (domain: string) => {
  const f = new Set(G.host.progress.freed);
  return (G.ctx.bank[domain] ?? []).filter((id) => f.has(id)).length;
};
const chapterOpen = (i: number) =>
  i === 0 || G.host.progress.beaten.includes(chapters()[i - 1].domain);

/* ---------- title ---------- */
export async function titleScreen(): Promise<void> {
  const c = G.c;
  const save = G.host.save;
  const prog = G.host.progress;
  G.run = null;
  G.F = null;
  G.screen = 'title';
  setScene(titleSet(), { time: 'night' });
  setWhere(c.page.game, '');
  $('layer').innerHTML =
    `<div class="title-wrap"><h1>${esc(c.page.game)}</h1></div>` +
    `<div class="title-art" aria-hidden="true"><span class="shade">${foeSvg('grib')}</span>${gloseSvg()}${heroSvg()}<span class="shade">${foeSvg('din')}</span></div>`;
  renderStatus();
  if (!prog.seen.includes('intro')) {
    await playCine('intro');
    return titleScreen();
  }
  showLine(
    esc(prog.freed.length || prog.xp ? c.lines.titleBack : c.lines.titleNew),
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
            prog.freed.length || prog.xp ? c.actions.cont : c.actions.start
          ),
        },
      ],
      secondary: [
        { k: 'sheets', html: `${icon24('sheets')}${esc(c.actions.sheets)}` },
        { k: 'cines', html: `${icon24('film')}${esc(c.actions.cines)}` },
        { k: 'options', html: `${icon24('options')}${esc(c.actions.options)}` },
        { k: 'help', html: `${icon24('help')}${esc(c.actions.howto)}` },
      ],
    });
    if (k === 'start') return mapScreen();
    if (k === 'sheets') G.host.openSheets();
    if (k === 'cines') {
      await replayMenu();
      return titleScreen();
    }
    if (k === 'options') await optionsMenu();
    if (k === 'help') openHowto();
  }
}

export function renderToggles(): void {
  $('snd').setAttribute('aria-pressed', String(!!G.host.save.sound));
  G.root
    .querySelectorAll<HTMLElement>('[data-speed]')
    .forEach((b) =>
      b.setAttribute(
        'aria-pressed',
        String(b.dataset.speed === G.host.save.speed)
      )
    );
}

export function setSpeed(s: Speed): void {
  G.host.save.speed = s;
  G.host.persist();
  renderToggles();
}

/** The options: fight speed, saved with the progress. */
async function optionsMenu(): Promise<void> {
  const c = G.c;
  for (;;) {
    showLine(esc(c.labels.speedHelp), 'glose');
    const k = await choose({
      kind: 'options',
      label: c.labels.speed,
      back: true,
      layout: 'c2',
      items: SPEEDS.map((s) => ({
        k: `speed:${s}`,
        cls: `primary${G.host.save.speed === s ? ' on' : ''}`,
        html: `${esc(c.labels.speeds[s])}${G.host.save.speed === s ? ' ✓' : ''}`,
      })),
    });
    if (k === 'back') return;
    setSpeed(k.slice(6) as Speed);
  }
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
  const prog = G.host.progress;
  G.run = null;
  G.F = null;
  G.screen = 'map';
  /* allies who joined before this version of the game get their scene once */
  const missed = ALLY_KEYS.filter(
    (k) => prog.recruits.includes(k) && !prog.seen.includes(`join-${k}`)
  );
  if (missed.length) {
    for (const k of missed) await playCine(`join-${k}`);
    return mapScreen();
  }
  G.host.refresh();
  setScene('', { time: '' });
  setWhere(c.page.game, esc(c.titles[levelOf(prog.xp) - 1]));
  renderStatus();
  let sel = chapters().findIndex(
    (ch, i) => chapterOpen(i) && !prog.beaten.includes(ch.domain)
  );
  if (sel < 0) sel = 0;
  $('layer').innerHTML = `<div class="bldg">${chapters()
    .map((ch, i) => {
      const open = chapterOpen(i);
      const beaten = prog.beaten.includes(ch.domain);
      const f = freedIn(ch.domain);
      const tot = (G.ctx.bank[ch.domain] ?? []).length;
      const cc = chapterCopy(c, domainOf(i));
      return (
        `<button type="button" class="room${open ? '' : ' locked'}" data-room="${i}" aria-label="${esc(c.lines.roomAria(i + 1, cc.domain, f, tot, !open))}">${placeSvg(ch.domain, 0)}` +
        (beaten
          ? `<span class="crown" aria-hidden="true">${crownSvg()}</span>`
          : !open
            ? `<span class="lock" aria-hidden="true">${lockSvg()}</span>`
            : '') +
        `<span class="lab"><b><span class="no">${i + 1}</span><span class="nm">${esc(cc.short)}</span></b><span class="p"><span class="hb"><i style="width:${tot ? (f / tot) * 100 : 0}%"></i></span>${f}/${tot}</span></span></button>`
      );
    })
    .join(
      ''
    )}<div class="room total" aria-hidden="true"><span class="lab"><b>${prog.freed.length}/${total()}</b><span class="p">${esc(c.titles[levelOf(prog.xp) - 1])}</span></span></div></div>`;
  const all = prog.beaten.length === chapters().length;
  const lineFor = (i: number) => {
    const cc = chapterCopy(c, domainOf(i));
    return `<b>${esc(c.status.chapterTag(i + 1))} · ${esc(cc.domain)}</b>. ${esc(c.lines.mapAt(cc.short, freedIn(chapters()[i].domain), (G.ctx.bank[chapters()[i].domain] ?? []).length))}`;
  };
  showLine(
    all
      ? esc(c.lines.mapAll)
      : !prog.freed.length && !prog.xp
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
      ? go(c.actions.enter(chapterCopy(c, domainOf(i)).short))
      : esc(c.actions.locked(chapterCopy(c, domainOf(i - 1)).boss.name));
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
        c.lines.lockedTip(chapterCopy(c, domainOf(i - 1)).boss.name),
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
          (sel + (e.key === 'ArrowRight' ? 1 : chapters().length - 1)) %
            chapters().length,
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
        G.host.reset();
        G.host.progress.seen = ['intro'];
        G.host.persist();
        return mapScreen();
      }
    }
  }
}

/* ---------- a chapter: places, doors, recruits, rooms and fights ---------- */
export function chapterChrome(): void {
  const r = G.run;
  if (!r) return;
  const cc = chapterCopy(G.c, domainOf(r.ch));
  setWhere(
    cc.short,
    `${stripHtml()}<span>${r.step === FIGHTS_PER_CHAPTER ? esc(G.c.status.bossStep) : `${r.step + 1}/${FIGHTS_PER_CHAPTER + 1}`}</span>`
  );
  renderStatus();
}
/** The set of the run's current step: place and time of day. */
export function setForStep(
  r: Run,
  restored = false
): { html: string; time: string } {
  return {
    html: placeSvg(chapters()[r.ch].domain, placeOfStep(r.step), restored),
    time: timeOfStep(r.step, restored),
  };
}
const inParty = (r: Run) => ['hero' as const, ...r.lineup];

async function startChapter(i: number): Promise<void> {
  const prog = G.host.progress;
  const domain = chapters()[i].domain;
  G.run = newRun(G.host.campaign, i, {
    level: levelOf(prog.xp),
    perks: prog.perks,
    recruits: prog.recruits,
    lineup: prog.lineup,
    defeats: prog.defeats[domain] ?? 0,
  });
  await playCine(`chapter-${i}`);
  const assist = assistOf(prog.defeats[domain]);
  if (assist)
    await say({ who: 'glose', text: G.c.lines.notes(assist), wait: true });
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
  $('layer').innerHTML = partyHtml(inParty(r));
  const p2 = $('layer').querySelector('.party');
  if (p2 && !reduced()) {
    p2.classList.add('walk-in');
    await wait(560);
    p2.classList.remove('walk-in');
  }
}

/** An ally met in this room joins: their scene, then the line-up if it is full. */
async function recruit(r: Run, k: AllyKey): Promise<void> {
  const prog = G.host.progress;
  await playCine(`join-${k}`);
  blip('join');
  await say({ who: k, text: G.c.members[k].hello });
  if (!prog.recruits.includes(k)) prog.recruits.push(k);
  join(r, k);
  if (!r.lineup.includes(k)) {
    setLineup(r, lineupWith(r.lineup, k));
    await say({
      who: 'glose',
      text: G.c.lines.lineupFull(memberName(k)),
      wait: true,
    });
    await teamScreen(r, k);
  }
  prog.lineup = [...r.lineup];
  G.host.persist();
  if (prog.recruits.length === 1)
    await say({ who: 'glose', text: G.c.lines.teachParty, wait: true });
}

/** The line-up: pick the two allies who fight next to you. */
async function teamScreen(r: Run, focus?: AllyKey): Promise<void> {
  const c = G.c;
  const prog = G.host.progress;
  const allies = prog.recruits.filter((k) => r.party[k]);
  let pick = [...r.lineup];
  for (;;) {
    $('layer').innerHTML =
      partyHtml(['hero', ...pick]) +
      `<div class="team-art" aria-hidden="true">${allies.map((k) => `<span class="${pick.includes(k) ? 'on' : ''}">${castSvg(k)}</span>`).join('')}</div>`;
    renderStatus();
    showLine(
      esc(c.lines.teamAt(pick.map(memberName).join(', ') || '…')),
      'glose'
    );
    const need = Math.min(LINEUP_SIZE, allies.length);
    const k = await choose({
      kind: 'team',
      label: c.labels.teamPick,
      layout: 'list team',
      focus,
      items: [
        ...allies.map((a) => ({
          k: `ally:${a}`,
          cls: `ally${pick.includes(a) ? ' on' : ''}`,
          html: `<span class="af">${castSvg(a)}</span><span class="an"><b>${esc(memberName(a))}</b> ${elIcon(MEMBERS[a].el, 'mini')}${esc(c.elements[MEMBERS[a].el].name)} · ${esc(c.roles[MEMBERS[a].role])}<span class="d">${esc(c.passives[MEMBERS[a].passive].name)} : ${esc(c.passives[MEMBERS[a].passive].text)}</span></span>`,
        })),
        {
          k: 'done',
          cls: 'primary',
          html: go(c.labels.teamDone),
          dis: pick.length !== need,
          why: c.labels.teamPick,
        },
      ],
    });
    if (k === 'done') break;
    const a = k.slice(5) as AllyKey;
    pick = pick.includes(a)
      ? pick.filter((x) => x !== a)
      : [...pick, a].slice(-LINEUP_SIZE);
    focus = a;
  }
  setLineup(r, pick);
  prog.lineup = [...r.lineup];
  G.host.persist();
}

let lastPlace = -1;
async function chapterLoop(): Promise<void> {
  const c = G.c;
  const prog = G.host.progress;
  for (;;) {
    const r = G.run as Run;
    const cc = chapterCopy(c, domainOf(r.ch));
    G.screen = 'doors';
    G.F = null;
    const place = placeOfStep(r.step);
    if (r.first || lastPlace === -1) {
      const s = setForStep(r);
      setScene(s.html, { time: s.time });
      $('layer').innerHTML = partyHtml(inParty(r));
    } else await walkTo(r);
    lastPlace = place;
    chapterChrome();
    const newcomer = recruitAt(r.camp, r.ch, r.step);
    if (newcomer && !prog.recruits.includes(newcomer)) {
      await recruit(r, newcomer);
      const s = setForStep(r);
      setScene(s.html, { time: s.time });
      $('layer').innerHTML = partyHtml(inParty(r));
      chapterChrome();
    }
    $('layer').insertAdjacentHTML(
      'beforeend',
      `<span class="place">${esc(cc.places[place])}</span>`
    );
    const lines: Parameters<typeof say> = [];
    if (r.first) {
      lines.push({ who: 'glose', text: cc.intro, wait: true });
      r.first = false;
    } else if (refill.tokens || refill.hp)
      lines.push({
        who: 'glose',
        text: c.lines.refill(refill.tokens, refill.hp),
      });
    refill = { tokens: 0, hp: 0 };
    const doors = genDoors(r, G.rng);
    if (doors[0] === 'boss')
      lines.push({
        who: 'glose',
        text: c.lines.bossDoor(cc.boss.name),
        wait: true,
      });
    await say(...lines);
    let door: DoorKey;
    for (;;) {
      $('layer').querySelector('.doors-art')?.remove();
      $('layer').insertAdjacentHTML(
        'afterbegin',
        `<div class="doors-art" aria-hidden="true">${doors.map((d) => `<span class="door-${d}">${doorSvg(d)}</span>`).join('')}</div>`
      );
      showLine(
        esc(doors.length > 1 ? c.lines.twoDoors : c.lines.bossWaits),
        'glose'
      );
      const team = prog.recruits.length > LINEUP_SIZE;
      const pick = await choose({
        kind: 'doors',
        label: doors.length > 1 ? c.labels.whichDoor : '',
        layout: doors.length > 1 ? 'c2' : 'list',
        items: doors.map((d) => ({
          k: d,
          cls: doors.length > 1 ? 'door' : 'primary',
          html:
            doors.length > 1
              ? `${doorSvg(d)}<span>${esc(c.doors[d].name)}<span class="d">${esc(c.doors[d].text)}</span></span>`
              : go(d === 'boss' ? c.actions.faceBoss : c.doors[d].name),
        })),
        secondary: team
          ? [{ k: 'team', html: `${icon24('team')}${esc(c.actions.team)}` }]
          : undefined,
      });
      if (pick === 'team') {
        await teamScreen(r);
        $('layer').innerHTML = partyHtml(inParty(r));
        chapterChrome();
        continue;
      }
      door = pick as DoorKey;
      break;
    }
    const chosen = $('layer').querySelector(`.door-${door}`);
    chosen?.classList.add('opening');
    await wait(420);
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
      const d = chapters()[r.ch].domain;
      prog.defeats[d] = (prog.defeats[d] ?? 0) + 1;
      G.host.persist();
      return mapScreen();
    }
    await victory();
    if (r.step === FIGHTS_PER_CHAPTER) {
      lastPlace = -1;
      return afterBoss(r);
    }
    const brought = delivery(r, G.rng);
    if (brought)
      await say({
        who: 'navette',
        text: c.lines.delivery(c.items[brought].name),
      });
    await chest(r.elite);
    stepDone(r);
  }
}
/** What the last rest gave back, told when the next place opens. */
let refill = { tokens: 0, hp: 0 };
function stepDone(r: Run): void {
  r.step++;
  refill = afterStep(r);
}

/** The boss room changes once the boss is down: lights back on, dawn in the window. */
async function afterBoss(r: Run): Promise<void> {
  const c = G.c;
  const prog = G.host.progress;
  const ch = chapters()[r.ch];
  const firstWin = !prog.beaten.includes(ch.domain);
  if (firstWin) prog.beaten.push(ch.domain);
  delete prog.defeats[ch.domain];
  G.host.persist();
  await playCine(`fall-${r.ch}`);
  const s = setForStep(r, true);
  setScene(s.html, { time: s.time });
  $('layer').innerHTML = partyHtml(inParty(r));
  void anim($('layer').querySelector('.party'), 'cheer', 500);
  const nxt = chapters()[r.ch + 1];
  const allDone = prog.beaten.length === chapters().length;
  await say({
    who: 'glose',
    text:
      nxt && !allDone
        ? c.lines.chapterWon(chapterCopy(c, domainOf(r.ch + 1)).short)
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
    partyHtml(inParty(r)) +
    `<div class="center-art cafe" aria-hidden="true">${cafeSvg()}</div>`;
  const got = restAtCafe(r);
  renderStatus();
  await say(
    { who: 'moka', text: c.lines.cafe },
    { who: 'glose', text: c.lines.cafeGlose(got.hp, got.tokens), wait: true }
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
    partyHtml(inParty(r)) +
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
    return kind === 'item' ? c.items[k as ItemKey] : c.boons[k as 'ink'];
  };
  const k = (await choose({
    kind: 'chest',
    label: c.labels.chest,
    layout: opts.length > 2 ? 'list' : 'c2',
    items: opts.map((o) => ({
      k: o,
      cls: 'reward',
      html: `${o.startsWith('item') ? icon24('sac') : icon24('boon')}<span>${esc(info(o).name)}<span class="d">${esc(info(o).text)}</span></span>`,
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
  const prog = G.host.progress;
  G.screen = 'results';
  const xp = fightXp(F, r, won);
  const s = setForStep(r);
  setScene(s.html, { time: s.time });
  setTurn(null);
  setStep(
    won ? (F.isBoss ? c.labels.bossDown : c.labels.victory) : c.labels.retreat
  );
  const cards = F.freedHere.map((id) => G.qById.get(id)).filter((q) => !!q);
  $('layer').innerHTML =
    `<div class="wcards">${cards.map((q, i) => `<div class="wcard back" data-i="${i}">${esc(sheetLabel(q.id))}</div>`).join('')}</div>` +
    partyHtml(inParty(r));
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
      `<span class="st">${esc(c.page.sheets.freed)}</span>`
    );
    blip('free');
    const q = cards[i];
    await sayOne({
      wait: true,
      html: c.lines.tallyCard(esc(sheetLabel(q.id)), esc(q.options[q.answer])),
    });
    card.classList.remove('cur');
  }
  const before = levelOf(prog.xp);
  prog.xp += xp;
  G.host.persist();
  await sayOne({ text: c.lines.tallySum(cards.length, xp) });
  const after = levelOf(prog.xp);
  for (let l = before + 1; l <= after; l++) await levelUp(l);
  G.host.refresh();
  Zone.idle();
}
async function levelUp(l: number): Promise<void> {
  const c = G.c;
  const prog = G.host.progress;
  const r = G.run;
  G.screen = 'levelup';
  blip('level');
  $('fx').insertAdjacentHTML(
    'beforeend',
    `<div class="fanfare"><span class="sparks" aria-hidden="true">${'<i></i>'.repeat(8)}</span><b>${esc(c.lines.levelName(l))}</b><span>${esc(c.titles[l - 1])}</span></div>`
  );
  showLine(esc(c.lines.levelUp(l, c.titles[l - 1])), 'glose');
  const pvCapped = prog.perks.pv >= RULES.maxPerks;
  const inkCapped = maxTokensOf(prog.perks) >= RULES.tokensCap;
  const k = (await choose({
    kind: 'levelup',
    label: c.labels.progress,
    layout: 'c2',
    items: [
      {
        k: 'pv',
        html: `${esc(c.lines.perkPv(RULES.perkPv))}<span class="d">${esc(c.lines.perkPvText)}</span>`,
        dis: pvCapped,
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
  prog.perks[k]++;
  G.host.persist();
  if (r) {
    r.perks = prog.perks;
    setLevel(r, l);
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
