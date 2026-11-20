/**
 * A run: one go at a chapter of a campaign, from its first room to its boss. The party's health,
 * tokens and bag carry from room to room; between rooms come doors, chests and the café.
 */
import type { Campaign } from './campaign';
import type { Member, Run } from './engine';
import { setLevel } from './engine';
import type { AllyKey, MemberKey } from './party';
import { LINEUP_SIZE, MEMBERS, PASSIVE, statsOf } from './party';
import type { Rng } from './random';
import { pickOne, shuffle } from './random';
import type { BoonKey, ItemKey, Perks } from './rules';
import {
  BOON_KEYS,
  FIGHTS_PER_CHAPTER,
  ITEM_KEYS,
  NO_PERKS,
  RULES,
  maxTokensOf,
} from './rules';

function member(k: MemberKey, level: number, perks: Perks): Member {
  const s = statsOf(k, level, perks);
  return {
    key: k,
    el: MEMBERS[k].el,
    hp: s.max,
    max: s.max,
    atk: s.atk,
    st: {},
    shield: 0,
  };
}

export interface RunStart {
  level: number;
  perks?: Perks;
  recruits?: readonly AllyKey[];
  lineup?: readonly AllyKey[];
  /** Defeats in this chapter since it was last won: Glose's notes help the next go. */
  defeats?: number;
}

/** Glose's notes after a defeat: an extra coffee and token per defeat, up to this many. */
export const MAX_ASSIST = 3;
export const assistOf = (defeats = 0): number =>
  Math.min(MAX_ASSIST, Math.max(0, defeats));

export function newRun(camp: Campaign, ch: number, o: RunStart): Run {
  const perks = o.perks ?? NO_PERKS;
  const party: Run['party'] = { hero: member('hero', o.level, perks) };
  for (const k of o.recruits ?? []) party[k] = member(k, o.level, perks);
  const max = maxTokensOf(perks);
  const assist = assistOf(o.defeats);
  return {
    camp,
    ch,
    step: 0,
    level: o.level,
    perks,
    party,
    lineup: (o.lineup ?? []).filter((k) => party[k]).slice(0, LINEUP_SIZE),
    tokens: Math.min(max, RULES.tokens + assist),
    maxTokens: max,
    items: ['cafe', ...Array.from({ length: assist }, () => 'cafe' as const)],
    boons: {},
    elite: false,
    used: new Set(),
    first: true,
  };
}

/** An ally joins the run, at full health; the line-up takes them if a place is free. */
export function join(run: Run, k: AllyKey): void {
  if (run.party[k]) return;
  run.party[k] = member(k, run.level, run.perks);
  if (run.lineup.length < LINEUP_SIZE) run.lineup.push(k);
}

export function setLineup(run: Run, lineup: readonly AllyKey[]): void {
  run.lineup = lineup.filter((k) => run.party[k]).slice(0, LINEUP_SIZE);
}

const everyone = (run: Run): Member[] =>
  Object.values(run.party).filter((m): m is Member => !!m);

/* ---------- doors ---------- */
export type DoorKey = 'combat' | 'elite' | 'cafe' | 'coffre' | 'boss';

/** One of the two doors always leads to a fight. */
export function genDoors(run: Run, rng: Rng): DoorKey[] {
  if (run.step === 0) return ['combat'];
  if (run.step === FIGHTS_PER_CHAPTER) return ['boss'];
  const fight: DoorKey = rng() < 0.5 ? 'combat' : 'elite';
  const other = shuffle(
    (['combat', 'elite', 'cafe', 'coffre'] as DoorKey[]).filter(
      (d) => d !== fight
    ),
    rng
  )[0];
  return shuffle([fight, other], rng);
}

/* ---------- chests ---------- */
export type Reward = `item:${ItemKey}` | `boon:${BoonKey}`;

export function genChest(run: Run, rich: boolean, rng: Rng): Reward[] {
  const pool: Reward[] = [
    ...ITEM_KEYS.map((k) => `item:${k}` as const),
    ...BOON_KEYS.filter((k) => !run.boons[k]).map((k) => `boon:${k}` as const),
  ];
  return shuffle(pool, rng).slice(0, rich ? 3 : 2);
}

export function addItem(run: Run, k: ItemKey): void {
  if (run.items.length >= RULES.maxItems) run.items.shift();
  run.items.push(k);
}

export function applyReward(run: Run, r: Reward): void {
  const [kind, k] = r.split(':');
  if (kind === 'item') {
    addItem(run, k as ItemKey);
    return;
  }
  run.boons[k as BoonKey] = true;
  setLevel(run, run.level);
  if (k === 'ink') run.tokens++;
}

/* ---------- rest ---------- */
function healShare(m: Member, share: number): number {
  if (m.hp <= 0) return 0;
  const before = m.hp;
  m.hp = Math.min(m.max, m.hp + Math.round(m.max * share));
  return m.hp - before;
}

/** Moka's café: half of everyone's health and a few tokens back. */
export function restAtCafe(run: Run): { hp: number; tokens: number } {
  let hp = 0;
  for (const m of everyone(run)) {
    if (m.hp <= 0) m.hp = 1;
    hp += healShare(m, RULES.cafeHeal);
  }
  const t = run.tokens;
  run.tokens = Math.min(run.maxTokens, run.tokens + RULES.cafeTokens);
  return { hp, tokens: run.tokens - t };
}

/**
 * After each room: a little health and tokens back, statuses gone, and anyone down gets
 * back up. Moka's coffee break adds to the health.
 */
export function afterStep(run: Run): { tokens: number; hp: number } {
  const moka = run.party.moka && run.party.moka.hp > 0;
  const share = RULES.restHeal + (moka ? PASSIVE.pauseHeal : 0);
  let hp = 0;
  for (const m of everyone(run)) {
    m.st = {};
    m.shield = 0;
    if (m.hp <= 0) m.hp = Math.max(1, Math.round(m.max * RULES.getUp));
    hp += healShare(m, share);
  }
  const t = run.tokens;
  run.tokens = Math.min(run.maxTokens, run.tokens + RULES.tokensAfterStep);
  return { tokens: run.tokens - t, hp };
}

/** Navette's delivery: one item after each fight won, when the bag has room. */
export function delivery(run: Run, rng: Rng): ItemKey | null {
  const inFight = ['hero', ...run.lineup] as MemberKey[];
  if (!inFight.includes('navette') || run.items.length >= RULES.maxItems)
    return null;
  const k = pickOne(ITEM_KEYS, rng);
  run.items.push(k);
  return k;
}
