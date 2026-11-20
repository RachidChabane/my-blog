/**
 * The evil Clawds and their bosses: element, strength, the moves they cycle through,
 * and the order in which a campaign introduces them.
 */
import type { Element } from './elements';
import type { StatusKey } from './statuses';

/* ---------- moves: what an enemy announces, then does on its turn ---------- */
export const MOVE_KEYS = [
  'hit',
  'charge',
  'big',
  'area',
  'smudge',
  'silence',
  'poison',
  'sleep',
  'burn',
  'steal',
  'mend',
  'shield',
  'fog',
  'shuffle',
  'allow',
  'shift',
  'overflow',
  'spill',
] as const;
export type MoveKey = (typeof MOVE_KEYS)[number];

/** Who a move reaches: one member, the whole party, the enemy itself, its most hurt ally, the field. */
export type MoveReach = 'one' | 'all' | 'self' | 'ally' | 'field';

export interface MoveRule {
  readonly reach: MoveReach;
  /** Multiplies the enemy's strength; absent for moves that deal no damage. */
  readonly power?: number;
  readonly status?: readonly [StatusKey, number];
  /** Health given back to the enemy's side, as a share of the maximum. */
  readonly heal?: number;
  /** Shield points, as a share of the maximum. */
  readonly shield?: number;
  /** How many members it reaches when it is not everyone. */
  readonly count?: number;
}

export const MOVES: Record<MoveKey, MoveRule> = {
  hit: { reach: 'one', power: 1 },
  charge: { reach: 'self' },
  big: { reach: 'one', power: 2.2 },
  area: { reach: 'all', power: 0.6 },
  smudge: { reach: 'one', power: 0.6, status: ['smudge', 2] },
  silence: { reach: 'one', power: 0.5, status: ['silence', 2] },
  poison: { reach: 'one', power: 0.5, status: ['poison', 3] },
  sleep: { reach: 'one', status: ['sleep', 2] },
  burn: { reach: 'all', power: 0.4, status: ['burn', 2] },
  steal: { reach: 'one', power: 0.5 },
  mend: { reach: 'ally', heal: 0.25 },
  shield: { reach: 'self', shield: 0.25 },
  fog: { reach: 'field' },
  shuffle: { reach: 'one', power: 0.7 },
  allow: { reach: 'self', shield: 0.12 },
  shift: { reach: 'self' },
  overflow: { reach: 'one', status: ['sleep', 2], count: 2 },
  spill: { reach: 'all', power: 0.4, status: ['poison', 3] },
};

/** Moves a silenced enemy cannot use: it falls back to a plain hit. */
export const SPECIAL_MOVES: ReadonlySet<MoveKey> = new Set([
  'smudge',
  'silence',
  'poison',
  'sleep',
  'burn',
  'steal',
  'mend',
  'shield',
  'fog',
  'shuffle',
  'allow',
  'shift',
  'overflow',
  'spill',
]);

/* ---------- the nine kinds of evil Clawd ---------- */
export const TYPE_KEYS = [
  'grib',
  'fau',
  'mask',
  'spam',
  'cut',
  'deca',
  'pil',
  'din',
  'kettle',
] as const;
export type TypeKey = (typeof TYPE_KEYS)[number];

export interface TypeRules {
  readonly el: Element;
  /** Health and strength, relative to the chapter's baseline. */
  readonly hp: number;
  readonly atk: number;
  readonly pattern: readonly MoveKey[];
  /** Protects the others: while it stands, only it can be targeted. */
  readonly taunts?: boolean;
}

export const TYPES: Record<TypeKey, TypeRules> = {
  grib: {
    el: 'papier',
    hp: 1,
    atk: 1,
    pattern: ['hit', 'smudge', 'hit', 'mend'],
  },
  fau: {
    el: 'encre',
    hp: 1.1,
    atk: 1,
    pattern: ['hit', 'shield', 'charge', 'big'],
  },
  mask: {
    el: 'papier',
    hp: 1.2,
    atk: 0.9,
    pattern: ['hit', 'shield', 'hit'],
    taunts: true,
  },
  spam: {
    el: 'encre',
    hp: 0.9,
    atk: 1,
    pattern: ['poison', 'hit', 'area', 'poison'],
  },
  cut: {
    el: 'courant',
    hp: 1,
    atk: 1.1,
    pattern: ['hit', 'silence', 'charge', 'big'],
  },
  deca: {
    el: 'cafe',
    hp: 0.9,
    atk: 0.9,
    pattern: ['sleep', 'hit', 'mend', 'hit'],
  },
  pil: { el: 'papier', hp: 0.8, atk: 1, pattern: ['steal', 'hit', 'hit'] },
  din: {
    el: 'courant',
    hp: 1,
    atk: 0.9,
    pattern: ['area', 'fog', 'hit', 'area'],
  },
  kettle: {
    el: 'cafe',
    hp: 1.1,
    atk: 1.1,
    pattern: ['hit', 'charge', 'burn', 'hit'],
  },
};

/* ---------- bosses: a library of mechanics, one per boss, each with phases ---------- */
export interface Phase {
  /** The phase starts once health falls to this share of the maximum. */
  readonly from: number;
  readonly el: Element;
  readonly pattern: readonly MoveKey[];
  /** Moves per turn while the phase lasts. */
  readonly actions?: number;
  /** Enemies called in when the phase starts. */
  readonly summon?: readonly TypeKey[];
  /** The field effect set when the phase starts. */
  readonly fog?: boolean;
}

export const BOSS_KEYS = [
  'loop',
  'dispatcher',
  'allowall',
  'offschema',
  'leak',
] as const;
export type BossKey = (typeof BOSS_KEYS)[number];

export const BOSSES: Record<BossKey, readonly Phase[]> = {
  /* past half health it acts twice a turn until a stun breaks it */
  loop: [
    { from: 1, el: 'papier', pattern: ['hit', 'area', 'charge', 'big'] },
    {
      from: 0.5,
      el: 'papier',
      pattern: ['hit', 'hit', 'charge', 'big'],
      actions: 2,
    },
  ],
  /* silences, then calls in two tools that protect it */
  dispatcher: [
    {
      from: 1,
      el: 'encre',
      pattern: ['silence', 'hit', 'area', 'charge', 'big'],
    },
    {
      from: 0.5,
      el: 'encre',
      pattern: ['area', 'hit', 'silence', 'charge', 'big'],
      summon: ['mask', 'cut'],
    },
  ],
  /* past half health it grants itself a shield; a silence denies it */
  allowall: [
    { from: 1, el: 'courant', pattern: ['hit', 'area', 'charge', 'big'] },
    {
      from: 0.5,
      el: 'courant',
      pattern: ['allow', 'area', 'hit', 'charge', 'big'],
    },
  ],
  /* moves the options while you read, then changes element every other turn */
  offschema: [
    {
      from: 1,
      el: 'cafe',
      pattern: ['hit', 'shuffle', 'area', 'charge', 'big'],
    },
    {
      from: 0.5,
      el: 'cafe',
      pattern: ['shift', 'shuffle', 'area', 'shift', 'hit'],
    },
  ],
  /* steals, then overflows (sleep, fog), then spills (poison) */
  leak: [
    {
      from: 1,
      el: 'encre',
      pattern: ['steal', 'hit', 'area', 'charge', 'big'],
    },
    {
      from: 0.66,
      el: 'encre',
      pattern: ['overflow', 'hit', 'area', 'charge', 'big'],
      fog: true,
    },
    {
      from: 0.33,
      el: 'encre',
      pattern: ['spill', 'hit', 'charge', 'big', 'area'],
    },
  ],
};

/** Share of the curve's boss health a boss keeps for itself: summons carry the rest. */
export const BOSS_HP_SHARE: Record<BossKey, number> = {
  loop: 1,
  dispatcher: 0.8,
  allowall: 1,
  offschema: 1,
  leak: 1,
};

/**
 * The order in which the kinds of enemy are met across a campaign, whatever its length.
 * The taunter comes early so that later rooms can put it in front of the others.
 */
export const TYPE_ORDER: readonly TypeKey[] = [
  'grib',
  'fau',
  'mask',
  'spam',
  'cut',
  'deca',
  'pil',
  'din',
  'kettle',
];

/** Health of an enemy that fights with others, relative to one that fights alone. */
export const PACK_HP = 0.75;
/** Bosses wake up after this many turns of sleep, whatever put them to sleep. */
export const BOSS_SLEEP = 1;
