/**
 * The four zones of the console: top bar, scene, dialogue box (fixed height), action zone
 * (fixed height, exactly one thing to do). Plus input, speech bubbles and sound.
 */
import type { Foe } from '../../domain/engine';
import type { MemberKey } from '../../domain/party';
import { MEMBER_KEYS } from '../../domain/party';
import { FIGHTS_PER_CHAPTER, LEVELS, levelOf } from '../../domain/rules';
import { G, $, FAST_READ, esc, fast, reduced, typeset } from './state';
import { bossColor, castSvg, crownSvg, gloseSvg, icon24 } from './art';
import { foeArt, foeName, renderParty } from './hud';
import { blip } from './sound';

/* ---------- speakers ---------- */
export type Who = 'glose' | MemberKey | Foe | null | undefined;
const isMember = (w: unknown): w is MemberKey =>
  typeof w === 'string' && (MEMBER_KEYS as readonly string[]).includes(w);

interface Speaker {
  name: string;
  art: string;
  bg: string;
  ink: string;
}
function speakerOf(who: Who): Speaker | null {
  if (!who) return null;
  if (who === 'glose')
    return {
      name: G.c.glose,
      art: gloseSvg(),
      bg: 'var(--hat)',
      ink: 'var(--on-hat)',
    };
  if (isMember(who))
    return {
      name: G.c.members[who].name,
      art: castSvg(who),
      bg: `var(--m-${who})`,
      ink: 'var(--on-hat)',
    };
  if (who.kind === 'boss')
    return {
      name: foeName(who),
      art: foeArt(who),
      bg: bossColor(who.chapter.domain),
      ink: 'var(--on-hat)',
    };
  return {
    name: foeName(who),
    art: foeArt(who),
    bg: `var(--en-${who.kind})`,
    ink: 'var(--en-eye)',
  };
}

/* ---------- the dialogue box: one line at a time ---------- */
export interface Line {
  text?: string;
  html?: string;
  who?: Who;
  /** Waits for the player instead of moving on by itself. */
  wait?: boolean;
  bubble?: boolean;
}
const Dlg = {
  done: null as null | (() => void),
  timer: 0 as ReturnType<typeof setTimeout> | 0,
};
export const waiting = () => !!Dlg.done;

function setLine(l: Line): void {
  const sp = speakerOf(l.who);
  const el = $('dialog');
  el.classList.toggle('narr', !sp);
  $('dlg-who').textContent = sp ? sp.name : '';
  $('dlg-face').innerHTML = sp ? sp.art : '';
  if (sp) {
    $('dlg-who').style.setProperty('--tab-bg', sp.bg);
    $('dlg-who').style.setProperty('--tab-ink', sp.ink);
  }
  const txt = $('dlg-txt');
  txt.innerHTML = typeset(l.html ?? esc(l.text ?? ''));
  txt.classList.remove('line-pop');
  void txt.offsetWidth;
  txt.classList.add('line-pop');
  /* the box keeps its size: a long line is set smaller, and scrolls only if that is not enough */
  el.classList.remove('dense');
  el.scrollTop = 0;
  el.classList.toggle('dense', el.scrollHeight > el.clientHeight + 1);
  el.onscroll = showMore;
  showMore();
}
/** A line longer than the box shows a cue until it is scrolled to its end. */
function showMore(): void {
  const el = $('dialog');
  $('dlg-more').hidden = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
}
/* how long a line stays before it advances by itself: a pause to find it, then reading time */
const READ_BASE_MS = 1600;
const READ_MS_PER_CHAR = 60;
const READ_MAX_MS = 9000;
export const readingTime = (text: string) =>
  Math.min(READ_MAX_MS, READ_BASE_MS + READ_MS_PER_CHAR * text.length);
const lineDelay = (text: string) =>
  readingTime(text) * (fast() ? FAST_READ : 1);

export function sayOne(line: Line | string): Promise<void> {
  const l: Line = typeof line === 'string' ? { text: line } : line;
  return new Promise((res) => {
    clearTimeout(Dlg.timer);
    setLine(l);
    if (l.bubble !== false && l.who && (l.text ?? '').length <= 80)
      bubbleFor(l.who, l.text ?? '');
    G.hurry = false;
    const manual = l.wait || reduced();
    Dlg.done = () => {
      clearTimeout(Dlg.timer);
      Dlg.done = null;
      $('dialog').classList.remove('auto');
      res();
    };
    Zone.go();
    const el = $('dialog');
    el.classList.remove('auto');
    $('dlg-prog').style.width = '0';
    if (manual) return;
    const ms = lineDelay($('dlg-txt').textContent ?? '');
    el.style.setProperty('--dur', `${ms}ms`);
    void $('dlg-prog').offsetWidth;
    el.classList.add('auto');
    $('dlg-prog').style.width = '';
    Dlg.timer = setTimeout(() => Dlg.done?.(), ms);
  });
}
export async function say(
  ...lines: (Line | string | null | undefined | false)[]
): Promise<void> {
  for (const l of lines) if (l) await sayOne(l);
  Zone.idle();
}
export function advance(byPlayer: boolean): boolean {
  if (!Dlg.done) return false;
  if (byPlayer) Zone.lockUntil = performance.now() + 260;
  blip('move');
  Dlg.done();
  return true;
}
export function showLine(html: string, who?: Who): void {
  clearTimeout(Dlg.timer);
  Dlg.done = null;
  $('dialog').classList.remove('auto');
  setLine({ html, who });
}
/** Holds the dialogue on an explanation until Continue; the box keeps its height. */
export function holdLine(html: string, who: Who): Promise<void> {
  clearTimeout(Dlg.timer);
  setLine({ html, who });
  return new Promise((res) => {
    Dlg.done = () => {
      Dlg.done = null;
      res();
    };
  });
}
/* ---------- the action zone: exactly one thing to do, always in the same place ---------- */
export interface Item {
  k: string;
  html?: string;
  label?: string;
  cls?: string;
  dis?: boolean;
  why?: string;
  back?: boolean;
}
export interface Spec {
  kind?: string;
  label?: string;
  /** An icon set before the label: the element of the member whose turn it is. */
  labelIcon?: string;
  back?: boolean;
  layout?: string;
  items: Item[];
  secondary?: Item[];
  numbered?: boolean;
  grow?: boolean;
  step?: string | null;
  focus?: string;
  onKey?: (e: KeyboardEvent) => boolean;
}
interface MenuState {
  el: HTMLElement;
  kind: string;
  items: Item[];
  pick: (k: string) => void;
  onKey?: (e: KeyboardEvent) => boolean;
}
export let Menu: MenuState | null = null;
export const menuKind = () => Menu?.kind ?? '';
export const pickMenu = (k: string) => Menu?.pick(k);

export const Zone = {
  lockUntil: 0,
  go(): void {
    const z = $('zone');
    const g = G.root.getElementById('go');
    if (z.dataset.mode === 'go' && g && !g.hasAttribute('aria-disabled'))
      return;
    Menu = null;
    setStep(null);
    z.dataset.mode = 'go';
    z.classList.remove('grow');
    $('console').classList.remove('answering');
    $('dialog').style.height = '';
    z.onscroll = null;
    z.scrollTop = 0;
    z.innerHTML = goButton('');
    const go = $('go');
    go.onclick = (e) => {
      e.stopPropagation();
      if (!advance(true)) G.hurry = true;
    };
    if (gameHasFocus()) go.focus({ preventScroll: true });
  },
  idle(): void {
    if ($('zone').dataset.mode !== 'go') return;
    const g = G.root.getElementById('go');
    if (g) {
      g.setAttribute('aria-disabled', 'true');
      g.onclick = (e) => e.stopPropagation();
    }
  },
};
export const goButton = (cls: string) =>
  `<button class="go ${cls}" id="go" type="button">${esc(G.c.cont)} ${icon24('arrow')}<span class="key">${esc(G.c.enterKey)}</span></button>`;

export function gameHasFocus(): boolean {
  if (G.host.sheetsOpen()) return false;
  if (G.host.isOverlay()) return true;
  const a = document.activeElement;
  if (a && a !== document.body && a !== G.root.host) return false;
  const r = (G.root.host as HTMLElement).getBoundingClientRect();
  return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
}
function choiceHtml(it: Item, i: number, numbered?: boolean): string {
  const dis = it.dis ? ' aria-disabled="true"' : '';
  return `<button type="button" class="choice ${it.cls ?? ''}" data-k="${esc(it.k)}"${dis}>${numbered ? `<span class="k">${i + 1}</span>` : ''}${it.html ?? esc(it.label ?? '')}</button>`;
}
export function choose(spec: Spec): Promise<string> {
  Menu = null;
  G.hurry = false;
  const z = $('zone');
  z.dataset.mode = 'choose';
  z.classList.toggle('grow', !!spec.grow);
  $('console').classList.toggle('answering', !!spec.grow);
  $('dialog').style.height = '';
  const head =
    spec.label || spec.back
      ? `<div class="zhead"><span class="lbl">${spec.labelIcon ?? ''}${esc(spec.label ?? '')}</span>${spec.back ? `<button type="button" class="back-btn" data-k="back">${icon24('back')} ${esc(G.c.back)}</button>` : ''}</div>`
      : '';
  z.onscroll = null;
  z.innerHTML =
    head +
    `<div class="choices ${spec.layout ?? 'list'}">${spec.items.map((it, i) => choiceHtml(it, i, spec.numbered)).join('')}</div>` +
    (spec.secondary
      ? `<div class="row2 n${spec.secondary.length}">${spec.secondary.map((it, i) => choiceHtml(it, i)).join('')}</div>`
      : '') +
    `<p class="hint" id="hint" aria-live="polite"></p>`;
  setStep(spec.step ?? null);
  z.scrollTop = 0;
  const all: Item[] = [
    ...spec.items,
    ...(spec.secondary ?? []),
    ...(spec.back ? [{ k: 'back', back: true }] : []),
  ];
  return new Promise((res) => {
    const pick = (k: string) => {
      Menu = null;
      blip('ok');
      res(k);
    };
    const menu: MenuState = {
      el: z,
      kind: spec.kind ?? '',
      items: all,
      pick,
      onKey: spec.onKey,
    };
    Menu = menu;
    z.onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(
        'button[data-k]'
      );
      e.stopPropagation();
      if (!b || Menu !== menu) return;
      if (e.detail > 0 && performance.now() < Zone.lockUntil) return;
      const it = all.find((x) => x.k === b.dataset.k);
      if (!it) return;
      if (it.dis) {
        $('hint').textContent = it.why ?? '';
        blip('clank');
        return;
      }
      pick(it.k);
    };
    const first =
      (spec.focus &&
        z.querySelector<HTMLElement>(`[data-k="${CSS.escape(spec.focus)}"]`)) ||
      z.querySelector<HTMLElement>(
        '.choices button:not([aria-disabled="true"]):not(.gone)'
      ) ||
      z.querySelector<HTMLElement>('button:not(.gone)');
    if (first && gameHasFocus()) first.focus({ preventScroll: true });
  });
}
const zoneButtons = () =>
  [...$('zone').querySelectorAll<HTMLElement>('button[data-k]')].filter(
    (b) => !b.classList.contains('gone')
  );

/* ---------- the banner in the scene: whose turn, and what to do now ---------- */
let Turn: MemberKey | 'foe' | null = null;
let Step: string | null = null;
/** Whose turn the banner names: a member, the enemies, or nobody. */
export function setTurn(t: MemberKey | 'foe' | null): void {
  Turn = t;
  renderBanner();
}
export function setStep(s: string | null): void {
  Step = s;
  renderBanner();
}
function renderBanner(): void {
  const b = G.root.getElementById('banner');
  if (!b) return;
  if (!Turn) {
    b.innerHTML = Step ? `<span>${esc(Step)}</span>` : '';
    return;
  }
  b.innerHTML = `<b class="${Turn === 'foe' ? 'foe' : ''}">${esc(Turn === 'foe' ? G.c.labels.foeTurn : G.c.labels.turnOf(G.c.members[Turn].name))}</b>${Step && Turn !== 'foe' ? `<span>${esc(Step)}</span>` : ''}`;
}

/* ---------- input: one place for keys and taps ---------- */
function moveFocus(delta: number): void {
  const btns = zoneButtons();
  if (!btns.length) return;
  let i = btns.indexOf(G.root.activeElement as HTMLElement);
  i = i < 0 ? 0 : (i + delta + btns.length) % btns.length;
  btns[i].focus({ preventScroll: true });
  blip('move');
}
export function bindInput(): void {
  document.addEventListener('keydown', (e) => {
    if (
      !(G.root.host as HTMLElement).isConnected ||
      (G.root.host as HTMLElement).hidden
    )
      return;
    const howto = $('howto');
    if (!howto.hidden) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeHowto();
      }
      return;
    }
    const a = document.activeElement;
    const inGame =
      a === G.root.host || ((a === document.body || !a) && gameHasFocus());
    if (!inGame) return;
    if (Dlg.done) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        advance(true);
      }
      return;
    }
    if (!Menu) return;
    if (Menu.onKey && Menu.onKey(e)) {
      e.preventDefault();
      return;
    }
    if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      moveFocus(1);
      return;
    }
    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
      e.preventDefault();
      moveFocus(-1);
      return;
    }
    if (e.key === 'Escape') {
      const back = Menu.items.find((x) => x.back);
      if (back) {
        e.preventDefault();
        Menu.pick(back.k);
      }
      return;
    }
    if (/^[1-9]$/.test(e.key)) {
      const b = [
        ...$('zone').querySelectorAll<HTMLElement>('.choices button[data-k]'),
      ][+e.key - 1];
      if (b && !b.classList.contains('gone')) {
        e.preventDefault();
        b.click();
      }
    }
  });
  /* a tap anywhere in the game advances a waiting line, or plays the rest of an animation at once */
  $('console').addEventListener('click', (e) => {
    if (
      (e.target as HTMLElement).closest(
        '.sys, .intent, #howto, .zone, .foe, .room, .pc'
      )
    )
      return;
    if (!advance(true)) G.hurry = true;
  });
}

/* ---------- how to play ---------- */
let howtoBack: HTMLElement | null = null;
export function openHowto(): void {
  howtoBack = G.root.activeElement as HTMLElement | null;
  $('howto').hidden = false;
  $('howto-close').focus({ preventScroll: true });
}
export function closeHowto(): void {
  $('howto').hidden = true;
  if (howtoBack && howtoBack.isConnected)
    howtoBack.focus({ preventScroll: true });
}

/* ---------- top bar, status strip, scene ---------- */
export function setWhere(title: string, subHtml = ''): void {
  $('where-t').textContent = title;
  $('where-s').innerHTML = subHtml;
}
export function stripHtml(): string {
  const r = G.run;
  if (!r) return '';
  const c = G.c;
  let h = `<span class="steps" role="img" aria-label="${esc(c.status.step(Math.min(r.step + 1, FIGHTS_PER_CHAPTER + 1), FIGHTS_PER_CHAPTER + 1))}">`;
  for (let k = 0; k < FIGHTS_PER_CHAPTER; k++)
    h += `<i class="${k < r.step ? 'done' : k === r.step ? 'now' : ''}"></i>`;
  return (
    h +
    `${crownSvg(r.step === FIGHTS_PER_CHAPTER ? 'var(--boss-crown)' : 'var(--paper-3)')}</span>`
  );
}
export function renderStatus(acting: MemberKey | null = null): void {
  const r = G.run;
  const c = G.c;
  const prog = G.host.progress;
  if (r) {
    renderParty(G.F ? G.F.order : ['hero', ...r.lineup], r, acting);
    return;
  }
  const l = levelOf(prog.xp);
  const lo = LEVELS[l - 1];
  const hi = LEVELS[l] ?? lo;
  $('status').innerHTML =
    `<span class="g">${esc(c.status.level(l))}</span><span class="g grow"><span class="bar xp" role="img" aria-label="${esc(c.status.xpAria(prog.xp - lo, hi - lo))}"><i style="width:${hi > lo ? ((prog.xp - lo) / (hi - lo)) * 100 : 100}%"></i></span></span>` +
    `<span class="g">${esc(c.status.sheets(prog.freed.length, G.qById.size))}</span>`;
}

/** Replaces the set with a crossfade, so places and times of day change visibly. */
export function setScene(
  setHtml: string,
  { boss = false, cls = '', time = '' } = {}
): void {
  const set = $('set');
  const old = set.firstElementChild as HTMLElement | null;
  if (old && !reduced() && setHtml) {
    old.classList.add('leaving');
    set.insertAdjacentHTML('beforeend', setHtml);
    setTimeout(() => old.remove(), 520);
  } else set.innerHTML = setHtml;
  $('scene').className = `scene ${boss ? 'boss' : ''} ${cls}`;
  $('scene').dataset.time = time;
  $('layer').innerHTML = '';
  $('fx').innerHTML = '';
  setTurn(null);
}

/* ---------- speech bubbles attached to characters ---------- */
function anchorOf(who: Who): HTMLElement | null {
  const layer = $('layer');
  if (who === 'glose') return layer.querySelector('.actor.glose');
  if (isMember(who)) return layer.querySelector(`.actor[data-k="${who}"]`);
  if (who && typeof who === 'object')
    return layer.querySelector(`.foe[data-uid="${who.uid}"] .art`);
  return null;
}
export function bubbleAt(el: HTMLElement | null, text: string, cls = ''): void {
  if (!el || !text) return;
  const fx = $('fx');
  fx.querySelectorAll('.bubble').forEach((b) => b.remove());
  const sc = $('scene').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const b = document.createElement('div');
  b.className = `bubble ${cls}`;
  b.textContent = text;
  fx.appendChild(b);
  const bw = b.offsetWidth;
  const bh = b.offsetHeight;
  const cx = r.left - sc.left + r.width / 2;
  const left = Math.max(6, Math.min(sc.width - bw - 6, cx - bw / 2));
  const art = {
    l: r.left - sc.left,
    t: r.top - sc.top,
    r: r.right - sc.left,
    b: r.bottom - sc.top,
  };
  const blockers = [...$('layer').querySelectorAll('.foe:not(.gone), .actor')]
    .map((n) => n.getBoundingClientRect())
    .map((q) => ({
      l: q.left - sc.left,
      t: q.top - sc.top,
      r: q.right - sc.left,
      b: q.bottom - sc.top,
    }));
  blockers.push(art);
  const clear = (x: number, y: number) =>
    blockers.every(
      (o) => x + bw <= o.l || x >= o.r || y + bh <= o.t || y >= o.b
    );
  const fits = (x: number, y: number) =>
    x >= 6 &&
    y >= 46 &&
    x + bw <= sc.width - 6 &&
    y + bh <= sc.height - 6 &&
    clear(x, y);
  const cands: [number, number, string][] = [
    [left, art.t - bh - 12, 'up'],
    [art.r + 8, art.t, 'side'],
    [art.l - bw - 8, art.t, 'side'],
    [art.r + 8, 46, 'side'],
    [art.l - bw - 8, 46, 'side'],
    [art.r + 8, art.b - bh, 'side'],
  ];
  /* a remark with no clear spot is dropped; an explanation the player asked for still shows */
  const spot =
    cands.find(([x, y]) => fits(x, y)) ??
    (cls === 'tip'
      ? [
          left,
          Math.max(6, Math.min(sc.height - bh - 6, art.t - bh - 12)),
          'side',
        ]
      : null);
  if (!spot) {
    b.remove();
    return;
  }
  b.style.left = `${spot[0]}px`;
  b.style.top = `${spot[1]}px`;
  if (spot[2] === 'up')
    b.style.setProperty(
      '--tail',
      `${Math.max(10, Math.min(bw - 26, cx - left - 8))}px`
    );
  else b.classList.add('side');
  setTimeout(() => b.remove(), 2600);
}
const bubbleFor = (who: Who, text: string) => bubbleAt(anchorOf(who), text);
