/**
 * What a fight shows besides the animations: the enemies' cards (intent, statuses,
 * health, element), the party in the scene, and the party strip with each member's
 * health, statuses and the tokens. Health bars drain from the old value to the new one,
 * and "old → new" stays on the card until the next action starts.
 */
import type { Fight, Foe, Member, Ref, Run } from '../../domain/engine';
import {
  actionsOf,
  alive,
  intentDamage,
  isKnown,
  memberOf,
  shielded,
} from '../../domain/engine';
import { MOVES, SPECIAL_MOVES } from '../../domain/foes';
import type { MemberKey } from '../../domain/party';
import type { StatusKey, Statuses } from '../../domain/statuses';
import { STATUS_KEYS } from '../../domain/statuses';
import { chapterCopy } from '../../i18n/copy';
import {
  bossSvg,
  castBack,
  castSvg,
  elIcon,
  foeSvg,
  gloseBack,
  icon24,
  moveIcon,
  stIcon,
} from './art';
import { clearStills } from './fx';
import { G, $, esc } from './state';

/* ---------- what the screen shows: the state as of the last event played ---------- */
/**
 * The engine settles a whole action at once; the screen catches up event by event.
 * Health, statuses and shields are drawn from this view, which the event player
 * advances as each hit, heal or status is shown, and which is synced to the rules'
 * state once a sequence is over. A refresh in the middle of a sequence never shows
 * what has not been played yet.
 */
interface View {
  hp: number;
  st: Statuses;
  shield: number;
  /** An enemy's fall has been shown. */
  dead?: boolean;
}
const shown = new Map<string, View>();
const keyOf = (r: Ref): string =>
  r.side === 'foe' ? `f${r.uid}` : `m${r.key}`;
const unitKey = (u: Foe | Member): string =>
  'uid' in u ? `f${u.uid}` : `m${u.key}`;
const viewOf = (u: Foe | Member): View => shown.get(unitKey(u)) ?? u;

/** The screen catches up with the rules: everything played so far is shown. */
export function syncShown(F: Fight, run: Run): void {
  shown.clear();
  const units: (Foe | Member)[] = [
    ...F.foes,
    ...F.order.map((k) => memberOf(run, k)),
  ];
  for (const u of units)
    shown.set(unitKey(u), {
      hp: u.hp,
      st: { ...u.st },
      shield: u.shield,
      dead: 'uid' in u && u.dead,
    });
}
/* one event played: the screen shows its result for that fighter */
export function showHp(to: Ref, hp: number): void {
  const v = shown.get(keyOf(to));
  if (v) v.hp = hp;
}
export function showStatus(to: Ref, k: StatusKey, turns: number): void {
  const v = shown.get(keyOf(to));
  if (!v) return;
  if (turns > 0) v.st[k] = turns;
  else delete v.st[k];
}
export function showShield(to: Ref, points: number): void {
  const v = shown.get(keyOf(to));
  if (v) v.shield = points;
}
/** A fighter who enters mid-sequence (a summon) is shown as it arrives. */
export function showUnit(u: Foe | Member): void {
  shown.set(unitKey(u), { hp: u.hp, st: { ...u.st }, shield: u.shield });
}
/** A fighter's statuses as the screen shows them, one line each. */
export const statusLinesOf = (u: Foe | Member): string[] => {
  const v = viewOf(u);
  return statusLines(v.st, v.shield);
};
export function showDown(to: Ref): void {
  const v = shown.get(keyOf(to));
  if (v) v.dead = true;
}

/* ---------- names ---------- */
export const foeName = (e: Foe): string =>
  e.kind === 'boss'
    ? chapterCopy(G.c, e.chapter.domain).boss.name
    : G.c.types[e.kind].name;
export const foeArt = (e: Foe): string =>
  e.kind === 'boss' ? bossSvg(e.chapter.boss.key) : foeSvg(e.kind);
export const memberName = (k: MemberKey): string => G.c.members[k].name;
export const who = (k: MemberKey) => ({
  name: memberName(k),
  you: k === 'hero',
});

/* ---------- elements of the page ---------- */
export const foeEl = (uid: number) =>
  $('layer').querySelector<HTMLElement>(`.foe[data-uid="${uid}"]`);
export const foeArtEl = (uid: number) =>
  foeEl(uid)?.querySelector<HTMLElement>('.art') ?? null;
export const actorEl = (k: MemberKey) =>
  $('layer').querySelector<HTMLElement>(`.actor[data-k="${k}"]`);
export const cardEl = (k: MemberKey) =>
  $('status').querySelector<HTMLElement>(`.pc[data-k="${k}"]`);

/* ---------- status chips ---------- */
const SHOWN: readonly StatusKey[] = STATUS_KEYS.filter((s) => s !== 'steady');
function chips(st: Statuses, shield = 0): string {
  return SHOWN.filter((s) => (st[s] ?? 0) > 0)
    .map(
      (s) =>
        `<span class="chip st-${s}" title="${esc(G.c.statuses[s].name)}">${stIcon(s)}<b>${s === 'shield' ? shield : st[s]}</b></span>`
    )
    .join('');
}
export function statusLines(st: Statuses, shield = 0): string[] {
  return SHOWN.filter((s) => (st[s] ?? 0) > 0).map(
    (s) =>
      `${G.c.statuses[s].name} (${s === 'shield' ? shield : G.c.status.turns(st[s] as number)}) : ${G.c.statuses[s].help}`
  );
}

/* ---------- the enemies ---------- */
const idleOf = (e: Foe) => (e.kind === 'boss' ? 'idle-boss' : `idle-${e.kind}`);
export function foeCard(e: Foe): string {
  return (
    `<button type="button" class="foe${e.boss ? ' boss' : ''}" data-uid="${e.uid}" tabindex="-1"><span class="intent" tabindex="0" role="button"></span>` +
    `<span class="fsts"></span><span class="art ${idleOf(e)}">${foeArt(e)}</span>` +
    `<span class="plate"><span class="fname"></span><span class="frow"><span class="fel"></span><span class="hb"><i class="ghost"></i><i class="fill"></i></span></span><span class="pvn"></span></span><span class="shield-tag" hidden></span></button>`
  );
}

/** The figure a tag shows: damage to its target, or the move's name. */
function intentText(
  F: Fight,
  run: Run,
  e: Foe
): { icon: string; html: string } {
  if (e.st.sleep)
    return {
      icon: moveIcon('sleep-state'),
      html: esc(G.c.statuses.sleep.name),
    };
  if (e.st.stun)
    return { icon: moveIcon('stun'), html: esc(G.c.statuses.stun.name) };
  const m = e.intent?.move ?? 'hit';
  const mv = e.st.silence && SPECIAL_MOVES.has(m) ? 'hit' : m;
  const M = MOVES[mv];
  const times = actionsOf(e) > 1 ? ` ×${actionsOf(e)}` : '';
  if (M.power && M.reach === 'one') {
    const k = e.intent?.targets[0];
    const d = k ? intentDamage(run, e, k) : 0;
    return {
      icon: moveIcon(mv),
      html: `<b>${d}</b>${times}${k ? `<span class="tgt">${castSvg(k)}</span>` : ''}`,
    };
  }
  if (M.power && M.reach === 'all') {
    const most = Math.max(0, ...F.order.map((k) => intentDamage(run, e, k)));
    return {
      icon: moveIcon(mv),
      html: `<b>${most}</b>${times}<span class="tgt all">${icon24('team')}</span>`,
    };
  }
  const k = e.intent?.targets[0];
  return {
    icon: moveIcon(mv),
    html: `${esc(G.c.moves[mv].name)}${k && M.reach === 'one' ? `<span class="tgt">${castSvg(k)}</span>` : ''}`,
  };
}
/** The full explanation of an enemy's next move, read when its tag is tapped. */
export function intentHelp(F: Fight, run: Run, e: Foe): string {
  if (e.st.sleep) return G.c.statuses.sleep.help;
  if (e.st.stun) return G.c.statuses.stun.help;
  const m = e.intent?.move ?? 'hit';
  const mv = e.st.silence && SPECIAL_MOVES.has(m) ? 'hit' : m;
  const k = e.intent?.targets[0];
  const d = k
    ? intentDamage(run, e, k)
    : Math.max(0, ...F.order.map((x) => intentDamage(run, e, x)));
  const names = (e.intent?.targets ?? []).map(memberName).join(', ');
  return `${G.c.moves[mv].name}${actionsOf(e) > 1 ? ` ×${actionsOf(e)}` : ''} : ${G.c.moves[mv].help(d, names)}`;
}

export function updateFoes(
  F: Fight,
  run: Run,
  sel: number | null,
  targeting: boolean
): void {
  const box = $('layer').querySelector<HTMLElement>('.foes');
  if (!box) return;
  const n = String(alive(F).length || 1);
  /* a badge placed for the old line-up of enemies would land on the new one */
  if (box.dataset.n !== n) clearStills();
  box.dataset.n = n;
  for (const e of F.foes) {
    const el = foeEl(e.uid);
    if (!el) continue;
    el.classList.toggle(
      'gone',
      !!viewOf(e).dead && !el.classList.contains('dying')
    );
    const sh = shielded(F, e);
    el.classList.toggle('shielded', sh);
    el.classList.toggle('sel', !e.dead && sel === e.uid);
    el.classList.toggle('targeted', !e.dead && sel === e.uid && targeting);
    el.classList.toggle('asleep', !!viewOf(e).st.sleep);
    const it = el.querySelector('.intent') as HTMLElement;
    const t = intentText(F, run, e);
    it.className = `intent i-${e.intent?.move ?? 'hit'}${MOVES[e.intent?.move ?? 'hit'].reach === 'all' ? ' area' : ''}`;
    it.innerHTML = `${t.icon}<span>${t.html}</span>`;
    it.setAttribute('aria-label', intentHelp(F, run, e));
    (el.querySelector('.fname') as HTMLElement).textContent = foeName(e);
    const known = isKnown(G.ctx, F, e);
    (el.querySelector('.fel') as HTMLElement).innerHTML = known
      ? elIcon(e.el)
      : `<span class="unk">?</span>`;
    const v = viewOf(e);
    (el.querySelector('.fsts') as HTMLElement).innerHTML = chips(
      v.st,
      v.shield
    );
    const pvn = el.querySelector('.pvn') as HTMLElement;
    if (!pvn.classList.contains('delta')) pvn.textContent = `${v.hp}/${e.max}`;
    setBar(el.querySelector('.hb') as HTMLElement, v.hp, e.max);
    const tag = el.querySelector('.shield-tag') as HTMLElement;
    tag.hidden = !sh;
    tag.textContent = G.c.types.mask.name;
    el.setAttribute(
      'aria-label',
      G.c.status.foeAria(
        foeName(e),
        v.hp,
        e.max,
        known ? G.c.elements[e.el].name : G.c.status.unknownEl
      )
    );
  }
  const field = G.root.getElementById('field');
  if (field) {
    field.hidden = !F.fog;
    field.textContent = G.c.status.fog(F.fog);
  }
  $('scene').classList.toggle('fogged', F.fog > 0);
}

/* ---------- bars and "old → new" ---------- */
function setBar(hb: HTMLElement, hp: number, max: number): void {
  const w = `${Math.max(0, (hp / max) * 100)}%`;
  const fill = hb.querySelector('.fill') as HTMLElement;
  const ghost = hb.querySelector('.ghost') as HTMLElement;
  fill.style.width = w;
  if (parseFloat(ghost.style.width || '100') < parseFloat(w))
    ghost.style.width = w;
  else setTimeout(() => (ghost.style.width = w), 450);
  hb.classList.toggle('low', hp <= max / 4);
}
/** Shows "old → new" where a health figure is, until the next action starts. */
export function showDelta(
  where: HTMLElement | null,
  before: number,
  after: number,
  kind: 'hurt' | 'heal'
): void {
  const n = where?.querySelector<HTMLElement>('.pvn');
  if (!n) return;
  n.classList.add('delta', kind);
  n.textContent = `${before} → ${after}`;
}
export function clearDeltas(): void {
  G.root.querySelectorAll<HTMLElement>('.pvn.delta').forEach((n) => {
    n.classList.remove('delta', 'hurt', 'heal');
  });
}

/* ---------- the party: in the scene and in the strip ---------- */
export function partyHtml(keys: readonly MemberKey[]): string {
  return `<div class="party" data-n="${keys.length}">${keys
    .map((k) => `<div class="actor" data-k="${k}">${castBack(k)}</div>`)
    .join(
      ''
    )}<div class="actor glose" data-k="glose">${gloseBack()}</div></div>`;
}

export function renderParty(
  order: readonly MemberKey[],
  run: Run,
  acting: MemberKey | null
): void {
  const c = G.c;
  const cards = order
    .map((k) => {
      const m = memberOf(run, k);
      const v = viewOf(m);
      const down = v.hp <= 0;
      const old = cardEl(k)?.querySelector('.pvn.delta')?.outerHTML;
      const w = prevWidth(k, v.hp, m.max);
      return (
        `<button type="button" class="pc${k === acting ? ' acting' : ''}${down ? ' down' : ''}" data-k="${k}" aria-label="${esc(c.status.memberAria(memberName(k), v.hp, m.max, statusLines(v.st, v.shield).join(' ; ')))}">` +
        `<span class="pt"><span class="pf">${castSvg(k)}</span>${old ?? `<span class="pvn">${down ? esc(c.status.down) : `${v.hp}/${m.max}`}</span>`}</span>` +
        `<span class="hb"><i class="ghost" style="width:${w}"></i><i class="fill" style="width:${w}"></i></span>` +
        `<span class="pst">${elIcon(m.el, 'mini')}${chips(v.st, v.shield)}</span></button>`
      );
    })
    .join('');
  $('status').innerHTML =
    `<div class="pcs" data-n="${order.length}">${cards}</div>` +
    `<span class="tok" role="img" aria-label="${esc(c.status.tokensAria(run.tokens, run.maxTokens))}">${icon24('token')}<b>${run.tokens}</b><span>/${run.maxTokens}</span></span>`;
  for (const k of order) {
    const m = memberOf(run, k);
    const v = viewOf(m);
    const card = cardEl(k);
    if (card)
      requestAnimationFrame(() =>
        setBar(card.querySelector('.hb') as HTMLElement, v.hp, m.max)
      );
    const a = actorEl(k);
    if (a) {
      a.classList.toggle('acting', k === acting);
      a.classList.toggle('down', v.hp <= 0);
      a.classList.toggle('asleep', !!v.st.sleep);
    }
  }
}
/** The width each bar was last drawn at, so a redrawn strip drains from there. */
const lastWidth = new Map<MemberKey, string>();
function prevWidth(k: MemberKey, hp: number, max: number): string {
  const w = lastWidth.get(k) ?? `${(hp / max) * 100}%`;
  lastWidth.set(k, `${Math.max(0, (hp / max) * 100)}%`);
  return w;
}
export function resetPartyBars(): void {
  lastWidth.clear();
}
