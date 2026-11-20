/**
 * Combat engine: rules only, no DOM, no wording. It mutates the run and the fight and
 * returns events; the presenter animates and narrates them in the player's language,
 * one beat at a time. Progress goes through the Book port, so tests run the same rules
 * in memory. Damage comes from one function, `blow`, used both for what a card
 * promises and for what lands.
 */
import type { Affinity, Element } from './elements';
import { AFFINITY_FACTOR, ELEMENTS, affinity } from './elements';
import type { MoveKey, TypeKey } from './foes';
import type { Campaign, ChapterRules } from './campaign';
import { BOSS_SLEEP, MOVES, PACK_HP, SPECIAL_MOVES, TYPES } from './foes';
import type { AllyKey, MemberKey, SkillKey } from './party';
import { MEMBERS, PASSIVE, SKILLS, statsOf } from './party';
import type { Rng } from './random';
import { shuffle } from './random';
import type { BoonKey, FormatKey, ItemKey, Perks, PowerKey } from './rules';
import {
  FIGHTS_PER_CHAPTER,
  FORMATS,
  POWER_COST,
  RULES,
  maxTokensOf,
} from './rules';
import type { StatusKey, Statuses } from './statuses';
import {
  BAD,
  BURN_FACTOR,
  GUARD_FACTOR,
  SKIPPING,
  STATUS,
  tickAmount,
} from './statuses';

/* ---------- ports ---------- */
export interface Book {
  freed(): ReadonlySet<string>;
  /** Called only for a sheet the player answered right. */
  free(id: string): void;
  reviewSet(): Readonly<Record<string, number>>;
  review(id: string, right: boolean): void;
  /** Whether the player has already found out this kind of enemy's element. */
  knows(kind: string): boolean;
  /** Records it; true the first time. */
  learn(kind: string): boolean;
}

export interface Ctx {
  readonly rng: Rng;
  readonly book: Book;
  /** Question ids of each domain. */
  readonly bank: Readonly<Record<string, readonly string[]>>;
}

/* ---------- who fights ---------- */
export interface Unit {
  el: Element;
  hp: number;
  max: number;
  atk: number;
  st: Statuses;
  /** Points of damage the shield still absorbs. */
  shield: number;
}
export interface Member extends Unit {
  key: MemberKey;
}
export type FoeKind = TypeKey | 'boss';
export interface Intent {
  move: MoveKey;
  /** Members a move that reaches one (or a few) will hit. */
  targets: MemberKey[];
}
export interface Foe extends Unit {
  uid: number;
  kind: FoeKind;
  /** The chapter the enemy belongs to: its strength, and a boss's phases. */
  chapter: ChapterRules;
  boss: boolean;
  elite: boolean;
  dead: boolean;
  phase: number;
  pi: number;
  intent: Intent | null;
  taunts: boolean;
}

export interface Run {
  camp: Campaign;
  /** The chapter's index in the campaign. */
  ch: number;
  step: number;
  level: number;
  perks: Perks;
  /** Everyone met so far, with health that carries from room to room. */
  party: Partial<Record<MemberKey, Member>>;
  lineup: AllyKey[];
  tokens: number;
  maxTokens: number;
  items: ItemKey[];
  boons: Partial<Record<BoonKey, true>>;
  elite: boolean;
  /** Sheets already put in play in this run, drawn last. */
  used: Set<string>;
  first: boolean;
}

export interface Fight {
  ch: number;
  step: number;
  isBoss: boolean;
  elite: boolean;
  foes: Foe[];
  /** The members in battle, in turn order. */
  order: MemberKey[];
  round: number;
  /** Turns of fog left on the field: no Duel while it lasts. */
  fog: number;
  asked: Set<string>;
  freedHere: string[];
  xp: number;
  combo: number;
  /** Glose's Echo waits for the next right answer. */
  echo: boolean;
  /** Wrong options to strike at the next question. */
  strike: number;
  /** The next question's options move while it is read. */
  mixNext: boolean;
  focusUsed: boolean;
  /** Enemies whose element was found out in this fight. */
  revealed: Set<number>;
}

/* ---------- events ---------- */
export type Ref =
  | { side: 'party'; key: MemberKey }
  | { side: 'foe'; uid: number };
export const memberRef = (key: MemberKey): Ref => ({ side: 'party', key });
export const foeRef = (uid: number): Ref => ({ side: 'foe', uid });

/** What is being done: the id every animation, sound and name is keyed by. */
export type ActKey =
  | `atk:${MemberKey}`
  | `skill:${SkillKey}`
  | `power:${PowerKey}`
  | `item:${ItemKey}`
  | 'guard'
  | `move:${string}`
  | 'counter';

export type StatusChange = 'on' | 'expire' | 'wake' | 'resist' | 'cure';
export type HitCause = 'hit' | 'counter' | 'echo' | 'poison' | 'burn';

export type Ev =
  | { k: 'act'; who: Ref; act: ActKey }
  | { k: 'fx'; act: ActKey; from: Ref; to: Ref[] }
  | {
      k: 'dmg';
      to: Ref;
      d: number;
      absorbed: number;
      /** Shield points the target keeps after this hit. */
      shield: number;
      before: number;
      after: number;
      aff: Affinity;
      cause: HitCause;
    }
  | {
      k: 'heal';
      to: Ref;
      n: number;
      before: number;
      after: number;
      cause: 'skill' | 'regen' | 'item' | 'power' | 'mend' | 'passive';
    }
  | { k: 'status'; to: Ref; s: StatusKey; turns: number; change: StatusChange }
  | { k: 'shield'; to: Ref; points: number; change: 'on' | 'break' | 'expire' }
  | { k: 'skip'; who: Ref; why: 'sleep' | 'stun' }
  | { k: 'down'; who: Ref }
  | { k: 'up'; who: Ref; hp: number }
  | { k: 'reveal'; uid: number; el: Element; how: 'hit' | 'scan' | 'radar' }
  | { k: 'phase'; uid: number; phase: number }
  | { k: 'summon'; uid: number }
  | { k: 'fog'; turns: number }
  | { k: 'tokens'; before: number; after: number }
  | { k: 'steal'; from: MemberKey; item: ItemKey | null; tokens: number }
  | { k: 'miss'; who: Ref; sheet: string }
  | { k: 'free'; who: Ref; sheet: string; xp: number }
  | { k: 'combo'; n: number }
  | { k: 'mix' }
  | { k: 'shift'; uid: number; el: Element }
  | { k: 'fizzle'; uid: number; move: MoveKey }
  | { k: 'strike'; n: number }
  | { k: 'echo' };

/* ---------- reading the state ---------- */
export const alive = (F: Fight): Foe[] => F.foes.filter((e) => !e.dead);
export const foeBy = (F: Fight, uid: number): Foe | undefined =>
  F.foes.find((e) => e.uid === uid);
export const memberOf = (run: Run, k: MemberKey): Member =>
  run.party[k] as Member;
/** Members of the fight still standing, in turn order. */
export const standing = (F: Fight, run: Run): Member[] =>
  F.order.map((k) => memberOf(run, k)).filter((m) => m.hp > 0);
const skipping = (u: Unit) => SKIPPING.some((s) => (u.st[s] ?? 0) > 0);
/** Members who can still take a turn: standing, awake, not stunned. */
export const able = (F: Fight, run: Run): Member[] =>
  standing(F, run).filter((m) => !skipping(m));

/** While a taunting enemy stands next to others, only taunting enemies can be targeted. */
export function targetable(F: Fight): Foe[] {
  const a = alive(F);
  const t = a.filter((e) => e.taunts || (e.st.taunt ?? 0) > 0);
  return t.length && a.length > t.length ? t : a;
}
export const shielded = (F: Fight, e: Foe): boolean =>
  !e.dead && !targetable(F).includes(e);
/** Key under which a discovered element is kept: per enemy type, per boss. */
export const knowKey = (e: Foe): string =>
  e.kind === 'boss' ? `boss:${e.chapter.domain}` : e.kind;
export const isKnown = (ctx: Ctx, F: Fight, e: Foe): boolean =>
  F.revealed.has(e.uid) || ctx.book.knows(knowKey(e));
/** The Duel needs a clear field. */
export const formatBlocked = (F: Fight, f: FormatKey): boolean =>
  F.fog > 0 && f === 'duel';
/** The id of an enemy's move, for its animation, sound and name: per type, per boss. */
export const moveAct = (e: Foe, m: MoveKey): ActKey =>
  `move:${e.kind === 'boss' ? e.chapter.boss.key : e.kind}:${m}`;

/* ---------- damage: one function for the promise and the blow ---------- */
export interface Blow {
  d: number;
  aff: Affinity;
}
const cutOf = (to: Unit): number =>
  'key' in to && (to as Member).key === 'tampon' ? PASSIVE.paperworkCut : 0;

/**
 * Damage of one blow: strength x power x element, halved when the attacker burns or the
 * target guards, minus Tampon's paperwork. Deterministic, never below 1.
 */
export function blow(
  atk: number,
  power: number,
  el: Element,
  from: Unit,
  to: Unit
): Blow {
  const aff = affinity(el, to.el);
  let x = atk * power * AFFINITY_FACTOR[aff];
  if (from.st.burn) x *= BURN_FACTOR;
  if (to.st.guard) x *= GUARD_FACTOR;
  return { d: Math.max(1, Math.floor(x) - cutOf(to)), aff };
}

/** Power of a member's blow: the format's, times the skill's share and the Élan boon. */
function memberPower(F: Fight, run: Run, f: FormatKey, share = 1): number {
  const focus = run.boons.crit && !F.focusUsed ? RULES.boonFocus : 1;
  return FORMATS[f].power * share * focus;
}

export interface Preview {
  /** Damage per hit, per target. */
  hits: { uid: number; d: number }[];
  /** Null while the target's element is unknown: the figure is then the neutral one. */
  aff: Affinity | null;
}

/** What an attack or offensive skill will do, as the card shows it before the question. */
export function preview(
  ctx: Ctx,
  F: Fight,
  run: Run,
  key: MemberKey,
  act: { format: FormatKey; skill?: SkillKey },
  uid: number
): Preview {
  const m = memberOf(run, key);
  const s = act.skill ? SKILLS[act.skill] : null;
  const targets = s?.target === 'foes' ? targetable(F) : [foeBy(F, uid) as Foe];
  const power = memberPower(F, run, act.format, s?.share ?? 1);
  const first = targets[0];
  const known = targets.every((e) => isKnown(ctx, F, e));
  const hits = targets.flatMap((e) => {
    const b = blow(m.atk, power, m.el, m, known ? e : neutralTwin(m.el, e));
    return Array.from({ length: s?.hits ?? 1 }, () => ({ uid: e.uid, d: b.d }));
  });
  return {
    hits,
    aff: known ? blow(m.atk, power, m.el, m, first).aff : null,
  };
}
/** A copy of the target with an element neutral to the attacker, to price an unknown. */
function neutralTwin(el: Element, e: Foe): Unit {
  const n = ELEMENTS.find((x) => affinity(el, x) === 'neutral') as Element;
  return { ...e, el: n };
}

/* ---------- applying blows, heals and statuses ---------- */
function refOf(u: Member | Foe): Ref {
  return 'key' in u ? memberRef(u.key) : foeRef(u.uid);
}

function hurt(
  ctx: Ctx,
  F: Fight,
  run: Run,
  u: Member | Foe,
  b: Blow,
  cause: HitCause,
  ev: Ev[]
): void {
  const before = u.hp;
  const absorbed = Math.min(u.shield, b.d);
  u.shield -= absorbed;
  u.hp = Math.max(0, u.hp - (b.d - absorbed));
  ev.push({
    k: 'dmg',
    to: refOf(u),
    d: b.d,
    absorbed,
    shield: u.shield,
    before,
    after: u.hp,
    aff: b.aff,
    cause,
  });
  if (absorbed && u.shield <= 0) {
    delete u.st.shield;
    ev.push({ k: 'shield', to: refOf(u), points: 0, change: 'break' });
  }
  const struck = cause === 'hit' || cause === 'counter' || cause === 'echo';
  if (struck && u.st.sleep && u.hp > 0) {
    delete u.st.sleep;
    ev.push({
      k: 'status',
      to: refOf(u),
      s: 'sleep',
      turns: 0,
      change: 'wake',
    });
  }
  if (u.hp <= 0) {
    fall(u, ev);
    if ('key' in u) keepOneAble(F, run, ev);
  } else if ('uid' in u) checkPhase(ctx, F, run, u, ev);
}

function fall(u: Member | Foe, ev: Ev[]): void {
  u.st = {};
  u.shield = 0;
  if ('uid' in u) u.dead = true;
  ev.push({ k: 'down', who: refOf(u) });
}

/**
 * No dead turn: when the last member able to act falls, the noise wakes the others, so
 * the party always has someone to play.
 */
function keepOneAble(F: Fight, run: Run, ev: Ev[]): void {
  if (able(F, run).length || !standing(F, run).length) return;
  for (const m of standing(F, run))
    for (const s of SKIPPING)
      if (m.st[s]) {
        delete m.st[s];
        ev.push({
          k: 'status',
          to: memberRef(m.key),
          s,
          turns: 0,
          change: 'wake',
        });
      }
}

function heal(
  u: Unit,
  n: number,
  cause: Extract<Ev, { k: 'heal' }>['cause'],
  ev: Ev[],
  ref: Ref
): void {
  if (u.hp <= 0) return;
  const before = u.hp;
  u.hp = Math.min(u.max, u.hp + n);
  ev.push({ k: 'heal', to: ref, n: u.hp - before, before, after: u.hp, cause });
}

/** A skip-status never takes the last member who can still act. */
function applyStatus(
  F: Fight,
  run: Run,
  u: Member | Foe,
  s: StatusKey,
  turns: number,
  ev: Ev[]
): void {
  const ref = refOf(u);
  if (u.hp <= 0) return;
  if (STATUS[s].skips) {
    if ('key' in u) {
      const others = able(F, run).filter((m) => m.key !== u.key);
      if (!others.length) {
        ev.push({ k: 'status', to: ref, s, turns: 0, change: 'resist' });
        return;
      }
    }
    if (s === 'stun' && (u.st.steady ?? 0) > 0) {
      ev.push({ k: 'status', to: ref, s, turns: 0, change: 'resist' });
      return;
    }
    if (s === 'sleep' && 'boss' in u && u.boss) turns = BOSS_SLEEP;
  }
  u.st[s] = Math.max(u.st[s] ?? 0, turns);
  ev.push({ k: 'status', to: ref, s, turns: u.st[s] as number, change: 'on' });
  if (s === 'taunt' && 'key' in u) retarget(F, run);
}

function cleanse(u: Unit, ref: Ref, ev: Ev[]): void {
  for (const s of BAD)
    if (u.st[s]) {
      delete u.st[s];
      ev.push({ k: 'status', to: ref, s, turns: 0, change: 'cure' });
    }
}

function giveShield(u: Unit, points: number, ref: Ref, ev: Ev[]): void {
  u.shield = Math.max(u.shield, points);
  u.st.shield = STATUS.shield.turns;
  ev.push({ k: 'shield', to: ref, points: u.shield, change: 'on' });
}

function tokens(run: Run, delta: number, ev: Ev[]): void {
  const before = run.tokens;
  run.tokens = Math.max(0, Math.min(run.maxTokens, run.tokens + delta));
  if (run.tokens !== before)
    ev.push({ k: 'tokens', before, after: run.tokens });
}

/* ---------- phases and summons ---------- */
export const phaseOf = (e: Foe) =>
  e.boss ? e.chapter.boss.phases[e.phase] : null;

let uidCounter = 0;
function makeFoe(
  kind: FoeKind,
  C: ChapterRules,
  o: { pack?: boolean; elite?: boolean } = {}
): Foe {
  if (kind === 'boss') {
    const B = C.boss;
    return {
      uid: ++uidCounter,
      kind,
      chapter: C,
      boss: true,
      elite: false,
      dead: false,
      el: B.phases[0].el,
      hp: B.hp,
      max: B.hp,
      atk: C.atk * B.atk * 1.3,
      st: {},
      shield: 0,
      phase: 0,
      pi: 0,
      intent: null,
      taunts: false,
    };
  }
  const T = TYPES[kind];
  const hp = Math.round(
    C.hp * T.hp * (o.pack ? PACK_HP : 1) * (o.elite ? RULES.eliteHp : 1)
  );
  return {
    uid: ++uidCounter,
    kind,
    chapter: C,
    boss: false,
    elite: !!o.elite,
    dead: false,
    el: T.el,
    hp,
    max: hp,
    atk: C.atk * T.atk * (o.elite ? RULES.eliteAtk : 1),
    st: {},
    shield: 0,
    phase: 0,
    pi: 0,
    intent: null,
    taunts: !!T.taunts,
  };
}

function checkPhase(ctx: Ctx, F: Fight, run: Run, e: Foe, ev: Ev[]): void {
  if (!e.boss) return;
  const phases = e.chapter.boss.phases;
  let next = e.phase;
  while (next + 1 < phases.length && e.hp <= e.max * phases[next + 1].from)
    next++;
  if (next === e.phase) return;
  e.phase = next;
  e.pi = 0;
  const P = phases[next];
  if (P.el !== e.el) e.el = P.el;
  ev.push({ k: 'phase', uid: e.uid, phase: next });
  if (P.fog) {
    F.fog = RULES.fogTurns + 1;
    ev.push({ k: 'fog', turns: F.fog });
  }
  for (const t of P.summon ?? []) {
    const add = makeFoe(t, e.chapter, { pack: true });
    F.foes.push(add);
    planIntent(ctx, F, run, add);
    if (isKnownKind(ctx, add)) F.revealed.add(add.uid);
    ev.push({ k: 'summon', uid: add.uid });
  }
  planIntent(ctx, F, run, e);
}
const isKnownKind = (ctx: Ctx, e: Foe) => ctx.book.knows(knowKey(e));

/* ---------- intents: what each enemy announces for its next turn ---------- */
function patternOf(e: Foe): readonly MoveKey[] {
  const P = phaseOf(e);
  return P ? P.pattern : TYPES[e.kind as TypeKey].pattern;
}
function pickTargets(F: Fight, run: Run, ctx: Ctx, n = 1): MemberKey[] {
  const up = standing(F, run);
  const taunting = up.filter((m) => (m.st.taunt ?? 0) > 0);
  if (taunting.length && n === 1) return [taunting[0].key];
  return shuffle(up, ctx.rng)
    .slice(0, n)
    .map((m) => m.key);
}
export function planIntent(ctx: Ctx, F: Fight, run: Run, e: Foe): void {
  const p = patternOf(e);
  const move = p[e.pi % p.length];
  e.pi++;
  const M = MOVES[move];
  e.intent = {
    move,
    targets: M.reach === 'one' ? pickTargets(F, run, ctx, M.count ?? 1) : [],
  };
}
/** A member who starts taunting draws every single-target move. */
function retarget(F: Fight, run: Run): void {
  const t = standing(F, run).find((m) => (m.st.taunt ?? 0) > 0);
  if (!t) return;
  for (const e of alive(F))
    if (
      e.intent &&
      MOVES[e.intent.move].reach === 'one' &&
      !MOVES[e.intent.move].count
    )
      e.intent.targets = [t.key];
}

/** Damage an enemy's announced move would deal to one member, as its tag shows it. */
export function intentDamage(run: Run, e: Foe, k: MemberKey): number {
  const move = e.intent?.move;
  if (!move) return 0;
  const M = MOVES[e.st.silence && SPECIAL_MOVES.has(move) ? 'hit' : move];
  const m = memberOf(run, k);
  if (!M.power || !m || m.hp <= 0) return 0;
  return blow(e.atk, M.power, e.el, e, m).d;
}
/** Times the move is made this turn. */
export const actionsOf = (e: Foe): number => phaseOf(e)?.actions ?? 1;

/* ---------- making a fight ---------- */
export function makeFight(ctx: Ctx, run: Run): Fight {
  const isBoss = run.step === FIGHTS_PER_CHAPTER;
  const C = run.camp.chapters[run.ch];
  const comp: readonly FoeKind[] = isBoss ? ['boss'] : C.steps[run.step];
  const elite = !isBoss && run.elite;
  const foes = comp.map((t) => makeFoe(t, C, { pack: comp.length > 1, elite }));
  const order = (['hero', ...run.lineup] as MemberKey[]).filter(
    (k) => !!run.party[k]
  );
  const F: Fight = {
    ch: run.ch,
    step: run.step,
    isBoss,
    elite,
    foes,
    order,
    round: 0,
    fog: 0,
    asked: new Set(),
    freedHere: [],
    xp: 0,
    combo: 0,
    echo: false,
    strike: 0,
    mixNext: false,
    focusUsed: false,
    revealed: new Set(),
  };
  for (const k of F.order) memberOf(run, k).st = {};
  foes.forEach((e) => planIntent(ctx, F, run, e));
  return F;
}

/** Vigie's radar: every enemy's element is shown when the fight starts. */
export function openingReveals(ctx: Ctx, F: Fight): Ev[] {
  const ev: Ev[] = [];
  const radar = F.order.some((k) => MEMBERS[k].passive === 'radar');
  for (const e of alive(F)) {
    if (isKnown(ctx, F, e)) {
      F.revealed.add(e.uid);
      continue;
    }
    if (!radar) continue;
    F.revealed.add(e.uid);
    ctx.book.learn(knowKey(e));
    ev.push({ k: 'reveal', uid: e.uid, el: e.el, how: 'radar' });
  }
  return ev;
}

/* ---------- the questions ---------- */
/** Sheets to review come first, then the ones never freed, then the rest; fresh ones before reused ones. */
export function pickSheets(
  ctx: Ctx,
  domain: string,
  n: number,
  used: Set<string>,
  busy: ReadonlySet<string> = new Set()
): string[] {
  const freed = ctx.book.freed();
  const rev = ctx.book.reviewSet();
  const rank = (id: string) =>
    (rev[id] ? 0 : freed.has(id) ? 2 : 1) + (used.has(id) ? 3 : 0);
  const pool = shuffle(
    (ctx.bank[domain] ?? []).filter((id) => !busy.has(id)),
    ctx.rng
  ).sort((a, b) => rank(a) - rank(b));
  return pool.slice(0, n).map((id) => {
    used.add(id);
    return id;
  });
}
/** The sheet the next question is about: never one already asked in this fight. */
export function nextSheet(ctx: Ctx, F: Fight, run: Run): string {
  const domain = run.camp.chapters[F.ch].domain;
  const [id] = pickSheets(ctx, domain, 1, run.used, F.asked);
  return id ?? pickSheets(ctx, domain, 1, run.used)[0];
}

/* ---------- turns ---------- */
/** Start of a unit's turn: guard and shield wear off, poison, burn and regeneration tick, sleep and stun skip. */
function turnStart(
  ctx: Ctx,
  F: Fight,
  run: Run,
  u: Member | Foe,
  ev: Ev[]
): boolean {
  const ref = refOf(u);
  if (u.st.guard) delete u.st.guard;
  if (u.st.shield && --u.st.shield <= 0) {
    delete u.st.shield;
    if (u.shield > 0)
      ev.push({ k: 'shield', to: ref, points: 0, change: 'expire' });
    u.shield = 0;
  }
  for (const s of ['poison', 'burn', 'regen'] as const) {
    if (!u.st[s] || u.hp <= 0) continue;
    const n = tickAmount(s, u.max);
    if (s === 'regen') heal(u, n, 'regen', ev, ref);
    else hurt(ctx, F, run, u, { d: n, aff: 'neutral' }, s, ev);
    if (u.st[s] !== undefined && --(u.st[s] as number) <= 0) {
      delete u.st[s];
      if (u.hp > 0)
        ev.push({ k: 'status', to: ref, s, turns: 0, change: 'expire' });
    }
  }
  if (u.hp <= 0) return false;
  if (u.st.sleep) {
    ev.push({ k: 'skip', who: ref, why: 'sleep' });
    if (--u.st.sleep <= 0) {
      delete u.st.sleep;
      ev.push({ k: 'status', to: ref, s: 'sleep', turns: 0, change: 'expire' });
    }
    return false;
  }
  if (u.st.stun) {
    delete u.st.stun;
    u.st.steady = STATUS.steady.turns;
    ev.push({ k: 'skip', who: ref, why: 'stun' });
    return false;
  }
  return true;
}
function turnEnd(u: Member | Foe, ev: Ev[]): void {
  for (const s of ['silence', 'smudge', 'taunt', 'steady'] as const)
    if (u.st[s] && --(u.st[s] as number) <= 0) {
      delete u.st[s];
      if (s !== 'steady' && u.hp > 0)
        ev.push({ k: 'status', to: refOf(u), s, turns: 0, change: 'expire' });
    }
}

/** A new round: Arrosoir's green thumb gives every standing member a little health. */
export function roundStart(F: Fight, run: Run): Ev[] {
  F.round++;
  const ev: Ev[] = [];
  if (standing(F, run).some((m) => MEMBERS[m.key].passive === 'greenThumb'))
    for (const m of standing(F, run))
      if (m.hp < m.max)
        heal(m, PASSIVE.greenThumbHeal, 'passive', ev, memberRef(m.key));
  return ev;
}

/** The start of a member's turn; `can` is false when the member cannot act. */
export function memberTurn(
  ctx: Ctx,
  F: Fight,
  run: Run,
  k: MemberKey
): { can: boolean; ev: Ev[] } {
  const m = memberOf(run, k);
  const ev: Ev[] = [];
  if (m.hp <= 0) return { can: false, ev };
  return { can: turnStart(ctx, F, run, m, ev), ev };
}
export function memberDone(run: Run, k: MemberKey): Ev[] {
  const ev: Ev[] = [];
  turnEnd(memberOf(run, k), ev);
  return ev;
}

/* ---------- what a member can do ---------- */
export type Action =
  | { kind: 'attack'; format: FormatKey; target: number }
  | { kind: 'skill'; skill: SkillKey; target: number; format?: FormatKey }
  | { kind: 'guard' };
export interface Answer {
  sheet: string;
  right: boolean;
}

export type SkillBlock =
  | 'tokens'
  | 'silence'
  | 'nobody'
  | 'full'
  | 'clean'
  | 'known';
const hurtMost = (ms: Member[]) =>
  ms.filter((m) => m.hp > 0).sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
const badCount = (u: Unit) => BAD.filter((s) => u.st[s]).length;

/** Who an ally-target skill or item reaches: the most hurt, the most afflicted, or the one who is down. */
export function allyTarget(
  F: Fight,
  run: Run,
  how: 'hurt' | 'afflicted' | 'down'
): Member | undefined {
  const ms = F.order.map((k) => memberOf(run, k));
  if (how === 'down') return ms.find((m) => m.hp <= 0);
  if (how === 'afflicted')
    return ms
      .filter((m) => m.hp > 0 && badCount(m) > 0)
      .sort((a, b) => badCount(b) - badCount(a))[0];
  return hurtMost(ms);
}

export function skillBlock(
  F: Fight,
  run: Run,
  k: MemberKey,
  s: SkillKey
): SkillBlock | null {
  const m = memberOf(run, k);
  const S = SKILLS[s];
  if (m.st.silence) return 'silence';
  if (run.tokens < S.cost) return 'tokens';
  const party = standing(F, run);
  if (S.target === 'down' && !allyTarget(F, run, 'down')) return 'nobody';
  if (S.reveal && alive(F).every((e) => F.revealed.has(e.uid))) return 'known';
  if (S.heal && !S.status) {
    const t = S.target === 'self' ? m : allyTarget(F, run, 'hurt');
    if (!t || (t.hp >= t.max && !(S.cleanse && badCount(t)))) return 'full';
  }
  if (S.cleanse && !S.heal) {
    if (!party.some((x) => badCount(x)) && !(S.clearsFog && F.fog))
      return 'clean';
  }
  if (S.target === 'party' && S.heal && party.every((x) => x.hp >= x.max))
    return 'full';
  return null;
}

/**
 * A member's action. Offensive actions take the answer to their question: a right answer
 * frees the sheet and lands the blow, a wrong one puts the sheet up for review and the
 * enemy hits back.
 */
export function act(
  ctx: Ctx,
  F: Fight,
  run: Run,
  k: MemberKey,
  a: Action,
  answer?: Answer
): Ev[] {
  const ev: Ev[] = [];
  const m = memberOf(run, k);
  const who = memberRef(k);
  if (a.kind === 'guard') {
    ev.push(
      { k: 'act', who, act: 'guard' },
      { k: 'fx', act: 'guard', from: who, to: [who] }
    );
    m.st.guard = 1;
    ev.push({ k: 'status', to: who, s: 'guard', turns: 1, change: 'on' });
    tokens(run, RULES.tokensGuard, ev);
    return ev;
  }
  const skill = a.kind === 'skill' ? a.skill : null;
  const S = skill ? SKILLS[skill] : null;
  const act: ActKey = skill ? `skill:${skill}` : `atk:${k}`;
  ev.push({ k: 'act', who, act });
  if (S) tokens(run, -S.cost, ev);
  if (skill && S && !S.format) {
    support(F, run, m, skill, ev);
    return ev;
  }
  const format = S?.format ?? (a.kind === 'attack' ? a.format : 'trident');
  const target = foeBy(F, a.target);
  if (!target || target.dead || !answer) return ev;
  if (!answer.right) {
    miss(ctx, F, run, m, target, answer.sheet, ev);
    return ev;
  }
  const targets = S?.target === 'foes' ? targetable(F) : [target];
  ev.push({ k: 'fx', act, from: who, to: targets.map((e) => foeRef(e.uid)) });
  const power = memberPower(F, run, format, S?.share ?? 1);
  F.focusUsed = true;
  let first = 0;
  for (const e of targets) {
    if (S?.breaks && e.shield > 0) {
      e.shield = 0;
      delete e.st.shield;
      ev.push({ k: 'shield', to: foeRef(e.uid), points: 0, change: 'break' });
    }
    for (let h = 0; h < (S?.hits ?? 1) && !e.dead; h++) {
      const b = blow(m.atk, power, m.el, m, e);
      if (!first) first = b.d;
      hurt(ctx, F, run, e, b, 'hit', ev);
      if (b.aff !== 'neutral' && !F.revealed.has(e.uid)) {
        F.revealed.add(e.uid);
        ctx.book.learn(knowKey(e));
        ev.push({ k: 'reveal', uid: e.uid, el: e.el, how: 'hit' });
      }
    }
    if (S?.status && !e.dead)
      applyStatus(F, run, e, S.status[0], S.status[1], ev);
  }
  if (F.echo) {
    F.echo = false;
    const others = alive(F).filter((x) => !targets.includes(x));
    if (others.length) {
      ev.push({ k: 'echo' });
      ev.push({
        k: 'fx',
        act: 'power:echo',
        from: foeRef(target.uid),
        to: others.map((x) => foeRef(x.uid)),
      });
      for (const x of others)
        hurt(
          ctx,
          F,
          run,
          x,
          {
            d: Math.max(1, Math.floor(first * RULES.echoShare)),
            aff: 'neutral',
          },
          'echo',
          ev
        );
    }
  }
  free(ctx, F, run, m, format, answer.sheet, ev);
  return ev;
}

function free(
  ctx: Ctx,
  F: Fight,
  run: Run,
  m: Member,
  format: FormatKey,
  sheet: string,
  ev: Ev[]
): void {
  F.asked.add(sheet);
  ctx.book.free(sheet);
  ctx.book.review(sheet, true);
  if (!F.freedHere.includes(sheet)) F.freedHere.push(sheet);
  F.combo++;
  const xp = Math.max(
    1,
    Math.round(
      FORMATS[format].xp *
        (1 + RULES.comboXp * (F.combo - 1)) *
        run.camp.xpShare
    )
  );
  F.xp += xp;
  ev.push({ k: 'free', who: memberRef(m.key), sheet, xp });
  if (F.combo >= 2) ev.push({ k: 'combo', n: F.combo });
  const extra =
    MEMBERS[m.key].passive === 'diligent' && format === 'exam'
      ? PASSIVE.diligentTokens
      : 0;
  tokens(run, FORMATS[format].tokens + extra, ev);
}

function miss(
  ctx: Ctx,
  F: Fight,
  run: Run,
  m: Member,
  e: Foe,
  sheet: string,
  ev: Ev[]
): void {
  F.asked.add(sheet);
  F.combo = 0;
  ctx.book.review(sheet, false);
  ev.push({ k: 'miss', who: memberRef(m.key), sheet });
  if (skipping(e)) return;
  ev.push(
    { k: 'act', who: foeRef(e.uid), act: 'counter' },
    { k: 'fx', act: 'counter', from: foeRef(e.uid), to: [memberRef(m.key)] }
  );
  hurt(ctx, F, run, m, blow(e.atk, COUNTER_POWER, e.el, e, m), 'counter', ev);
}
/** Strength of the blow an enemy answers a wrong answer with. */
export const COUNTER_POWER = 0.8;

function support(F: Fight, run: Run, m: Member, s: SkillKey, ev: Ev[]): void {
  const S = SKILLS[s];
  const act: ActKey = `skill:${s}`;
  const from = memberRef(m.key);
  const party = standing(F, run);
  const targets: Member[] =
    S.target === 'self'
      ? [m]
      : S.target === 'party'
        ? party
        : S.target === 'down'
          ? [allyTarget(F, run, 'down')].filter((x): x is Member => !!x)
          : S.target === 'ally'
            ? [allyTarget(F, run, 'hurt')].filter((x): x is Member => !!x)
            : [];
  if (S.reveal) {
    ev.push({ k: 'fx', act, from, to: alive(F).map((e) => foeRef(e.uid)) });
    for (const e of alive(F))
      if (!F.revealed.has(e.uid)) {
        F.revealed.add(e.uid);
        ev.push({ k: 'reveal', uid: e.uid, el: e.el, how: 'scan' });
      }
    return;
  }
  ev.push({ k: 'fx', act, from, to: targets.map((t) => memberRef(t.key)) });
  for (const t of targets) {
    const ref = memberRef(t.key);
    if (S.revive && t.hp <= 0) {
      t.hp = Math.max(1, Math.round(t.max * S.revive));
      ev.push({ k: 'up', who: ref, hp: t.hp });
      continue;
    }
    if (S.heal) heal(t, Math.round(t.max * S.heal), 'skill', ev, ref);
    if (S.cleanse) cleanse(t, ref, ev);
    if (S.shield) giveShield(t, Math.round(m.max * S.shield), ref, ev);
    if (S.status) applyStatus(F, run, t, S.status[0], S.status[1], ev);
  }
  if (S.guard) {
    m.st.guard = 1;
    ev.push({ k: 'status', to: from, s: 'guard', turns: 1, change: 'on' });
  }
  if (S.clearsFog && F.fog) {
    F.fog = 0;
    ev.push({ k: 'fog', turns: 0 });
  }
}

/* ---------- Glose's powers and the bag: no turn spent ---------- */
export type FreeBlock = 'tokens' | 'full' | 'clean' | 'echo' | 'nobody';

export function powerBlock(F: Fight, run: Run, k: PowerKey): FreeBlock | null {
  if (run.tokens < POWER_COST[k]) return 'tokens';
  if (k === 'balm' && standing(F, run).every((m) => m.hp >= m.max))
    return 'full';
  if (k === 'blot' && !F.fog && !standing(F, run).some((m) => badCount(m)))
    return 'clean';
  if (k === 'echo' && F.echo) return 'echo';
  return null;
}

export function usePower(F: Fight, run: Run, k: PowerKey): Ev[] {
  if (powerBlock(F, run, k)) return [];
  const ev: Ev[] = [];
  const act: ActKey = `power:${k}`;
  const glose = memberRef('hero');
  ev.push({ k: 'act', who: glose, act });
  tokens(run, -POWER_COST[k], ev);
  const party = standing(F, run);
  ev.push({
    k: 'fx',
    act,
    from: glose,
    to: party.map((m) => memberRef(m.key)),
  });
  if (k === 'hint') {
    F.strike++;
    ev.push({ k: 'strike', n: F.strike });
  } else if (k === 'echo') {
    F.echo = true;
    ev.push({ k: 'echo' });
  } else if (k === 'balm') {
    for (const m of party)
      heal(
        m,
        Math.round(m.max * RULES.baumeHeal),
        'power',
        ev,
        memberRef(m.key)
      );
  } else {
    for (const m of party) cleanse(m, memberRef(m.key), ev);
    if (F.fog) {
      F.fog = 0;
      ev.push({ k: 'fog', turns: 0 });
    }
  }
  return ev;
}

export function itemBlock(F: Fight, run: Run, k: ItemKey): FreeBlock | null {
  if (k === 'cafe' && standing(F, run).every((m) => m.hp >= m.max))
    return 'full';
  if (k === 'buvard' && !allyTarget(F, run, 'afflicted')) return 'clean';
  if (k === 'reboot' && !allyTarget(F, run, 'down')) return 'nobody';
  return null;
}

/** Who an item will reach, so its card can name them. */
export function itemTarget(F: Fight, run: Run, k: ItemKey): Member | undefined {
  if (k === 'cafe') return allyTarget(F, run, 'hurt');
  if (k === 'buvard') return allyTarget(F, run, 'afflicted');
  if (k === 'reboot') return allyTarget(F, run, 'down');
  return undefined;
}
/** Who a support skill will reach, so its card can name them. */
export function skillTarget(
  F: Fight,
  run: Run,
  k: MemberKey,
  s: SkillKey
): Member | undefined {
  const S = SKILLS[s];
  if (S.target === 'self') return memberOf(run, k);
  if (S.target === 'ally') return allyTarget(F, run, 'hurt');
  if (S.target === 'down') return allyTarget(F, run, 'down');
  return undefined;
}

export function useItem(F: Fight, run: Run, k: ItemKey): Ev[] {
  const at = run.items.indexOf(k);
  if (at < 0 || itemBlock(F, run, k)) return [];
  run.items.splice(at, 1);
  const ev: Ev[] = [];
  const act: ActKey = `item:${k}`;
  const t = itemTarget(F, run, k);
  ev.push({ k: 'act', who: memberRef('hero'), act });
  ev.push({
    k: 'fx',
    act,
    from: memberRef('hero'),
    to: t ? [memberRef(t.key)] : [],
  });
  if (k === 'gomme') {
    F.strike++;
    ev.push({ k: 'strike', n: F.strike });
  } else if (t && k === 'cafe')
    heal(t, Math.round(t.max * RULES.cafeItem), 'item', ev, memberRef(t.key));
  else if (t && k === 'buvard') cleanse(t, memberRef(t.key), ev);
  else if (t && k === 'reboot') {
    t.hp = Math.max(1, Math.round(t.max * RULES.rebootHp));
    ev.push({ k: 'up', who: memberRef(t.key), hp: t.hp });
  }
  return ev;
}

/* ---------- the enemies' side ---------- */
export function foeTurn(ctx: Ctx, F: Fight, run: Run, e: Foe): Ev[] {
  const ev: Ev[] = [];
  if (e.dead || !standing(F, run).length) return ev;
  if (!turnStart(ctx, F, run, e, ev) || e.dead) {
    if (!e.dead) turnEnd(e, ev);
    return ev;
  }
  const times = actionsOf(e);
  for (let i = 0; i < times && !e.dead && standing(F, run).length; i++)
    doMove(ctx, F, run, e, ev);
  turnEnd(e, ev);
  return ev;
}

function doMove(ctx: Ctx, F: Fight, run: Run, e: Foe, ev: Ev[]): void {
  let move = e.intent?.move ?? 'hit';
  if (e.st.silence && SPECIAL_MOVES.has(move)) {
    ev.push({ k: 'fizzle', uid: e.uid, move });
    move = 'hit';
  }
  const M = MOVES[move];
  const act = moveAct(e, move);
  const from = foeRef(e.uid);
  ev.push({ k: 'act', who: from, act });
  if (M.reach === 'one' || M.reach === 'all') {
    const up = standing(F, run);
    let targets: Member[];
    if (M.reach === 'all') targets = up;
    else {
      const planned = (e.intent?.targets ?? [])
        .map((k) => memberOf(run, k))
        .filter((m) => m && m.hp > 0);
      const n = M.count ?? 1;
      targets = planned.length
        ? planned.slice(0, n)
        : pickTargets(F, run, ctx, n).map((k) => memberOf(run, k));
    }
    ev.push({ k: 'fx', act, from, to: targets.map((t) => memberRef(t.key)) });
    for (const t of targets) {
      if (t.hp <= 0) continue;
      if (M.power)
        hurt(ctx, F, run, t, blow(e.atk, M.power, e.el, e, t), 'hit', ev);
      if (M.status && t.hp > 0)
        applyStatus(F, run, t, M.status[0], M.status[1], ev);
      if (move === 'steal' && t.hp > 0) steal(run, t, ev);
    }
    if (move === 'shuffle') {
      F.mixNext = true;
      ev.push({ k: 'mix' });
    }
    return;
  }
  if (M.reach === 'self') {
    ev.push({ k: 'fx', act, from, to: [from] });
    if (M.shield) giveShield(e, Math.round(e.max * M.shield), from, ev);
    if (move === 'allow') cleanse(e, from, ev);
    if (move === 'shift') {
      const i = ELEMENTS.indexOf(e.el);
      e.el = ELEMENTS[(i + 1) % ELEMENTS.length];
      ev.push({ k: 'shift', uid: e.uid, el: e.el });
    }
    return;
  }
  if (M.reach === 'ally') {
    const t = alive(F)
      .filter((x) => x.hp < x.max)
      .sort((a, b) => a.hp / a.max - b.hp / b.max)[0];
    ev.push({ k: 'fx', act, from, to: t ? [foeRef(t.uid)] : [from] });
    if (t)
      heal(t, Math.round(t.max * (M.heal ?? 0)), 'mend', ev, foeRef(t.uid));
    return;
  }
  ev.push({ k: 'fx', act, from, to: [] });
  F.fog = RULES.fogTurns + 1;
  ev.push({ k: 'fog', turns: RULES.fogTurns });
}

function steal(run: Run, t: Member, ev: Ev[]): void {
  const item = run.items.pop() ?? null;
  if (item) {
    ev.push({ k: 'steal', from: t.key, item, tokens: 0 });
    return;
  }
  const n = Math.min(run.tokens, RULES.stealTokens);
  if (!n) return;
  const before = run.tokens;
  run.tokens -= n;
  ev.push({ k: 'steal', from: t.key, item: null, tokens: n });
  ev.push({ k: 'tokens', before, after: run.tokens });
}

/** End of a round: the fog thins, every enemy announces its next move. */
export function roundEnd(ctx: Ctx, F: Fight, run: Run): Ev[] {
  const ev: Ev[] = [];
  if (F.fog && --F.fog <= 0) {
    F.fog = 0;
    ev.push({ k: 'fog', turns: 0 });
  }
  alive(F).forEach((e) => planIntent(ctx, F, run, e));
  return ev;
}

export function outcome(F: Fight, run: Run): 'win' | 'lose' | null {
  if (!alive(F).length) return 'win';
  if (!standing(F, run).length) return 'lose';
  return null;
}

/** XP a fight is worth once it ends. */
export const fightXp = (F: Fight, run: Run, won: boolean): number =>
  Math.round(F.xp * (F.elite ? RULES.eliteXp : 1)) +
  (won && F.isBoss ? Math.round(RULES.xpBoss * run.camp.xpShare) : 0);

/** A member's figures at a level: health keeps the damage already taken. */
export function setLevel(run: Run, level: number): void {
  run.level = level;
  for (const m of Object.values(run.party)) {
    if (!m) continue;
    const s = statsOf(m.key, level, run.perks);
    const bonus = run.boons.pv ? RULES.boonPv : 0;
    const max = s.max + bonus;
    if (m.hp > 0) m.hp = Math.max(1, m.hp + (max - m.max));
    m.max = max;
    m.atk = s.atk;
  }
  run.maxTokens = maxTokensOf(run.perks) + (run.boons.ink ? 1 : 0);
  run.tokens = Math.min(run.tokens, run.maxTokens);
}
