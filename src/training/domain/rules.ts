/**
 * The rules of the game that are not about who fights: question formats, levels,
 * resources, Glose's powers, items and chest boons. Names and lines live in
 * i18n/copy.ts, keyed by the identifiers defined here.
 */

/** A format is how a question is faced: how many options are shown, and what a right answer is worth. */
export const FORMAT_KEYS = ['duel', 'trident', 'exam'] as const;
export type FormatKey = (typeof FORMAT_KEYS)[number];

export interface Format {
  readonly options: number;
  /** Multiplies the attacker's strength. */
  readonly power: number;
  /** Tokens a right answer brings back. */
  readonly tokens: number;
  readonly xp: number;
}

export const FORMATS: Record<FormatKey, Format> = {
  duel: { options: 2, power: 2, tokens: 0, xp: 4 },
  trident: { options: 3, power: 3, tokens: 1, xp: 5 },
  exam: { options: 4, power: 4, tokens: 2, xp: 6 },
};

export const RULES = {
  /** Tokens: the party's shared resource for skills and Glose's powers. */
  tokens: 4,
  tokensMax: 6,
  tokensCap: 10,
  tokensAfterStep: 2,
  tokensGuard: 1,
  cafeTokens: 3,
  /** Share of every member's maximum health the café gives back. */
  cafeHeal: 0.5,
  /** Share of maximum health given back after each room. */
  restHeal: 0.15,
  /** A member down at the end of a room gets back up with this share of health. */
  getUp: 0.25,
  perkPv: 3,
  maxPerks: 10,
  boonPv: 4,
  /** The first right answer of a fight with the Élan boon. */
  boonFocus: 1.5,
  maxItems: 4,
  eliteHp: 1.4,
  eliteAtk: 1.2,
  eliteXp: 1.5,
  xpBoss: 20,
  reviewNeeds: 2,
  /** Glose's Echo: share of the damage that also reaches every other enemy. */
  echoShare: 0.5,
  baumeHeal: 0.3,
  cafeItem: 0.5,
  rebootHp: 0.5,
  fogTurns: 2,
  stealTokens: 2,
  /** Combo: each right answer in a row adds this share of XP. */
  comboXp: 0.25,
} as const;

export const FIGHTS_PER_CHAPTER = 4;

export const LEVELS = [
  0, 60, 150, 280, 450, 660, 900, 1200, 1550, 1950, 2400, 2900, 3450, 4050,
  4700,
];

export function levelOf(xp: number): number {
  let l = 1;
  LEVELS.forEach((v, i) => {
    if (xp >= v) l = i + 1;
  });
  return l;
}

export interface Perks {
  pv: number;
  ink: number;
}
export const NO_PERKS: Perks = { pv: 0, ink: 0 };
export const maxTokensOf = (perks: Perks = NO_PERKS): number =>
  Math.min(RULES.tokensCap, RULES.tokensMax + perks.ink);

/* ---------- Glose, the mentor: powers paid in tokens, used without spending a turn ---------- */
export const POWER_COST = { hint: 1, echo: 2, balm: 3, blot: 2 } as const;
export type PowerKey = keyof typeof POWER_COST;
export const POWER_KEYS = Object.keys(POWER_COST) as PowerKey[];

/* ---------- the bag: items used without spending a turn ---------- */
export const ITEM_KEYS = ['cafe', 'gomme', 'buvard', 'reboot'] as const;
export type ItemKey = (typeof ITEM_KEYS)[number];

export const BOON_KEYS = ['ink', 'crit', 'pv'] as const;
export type BoonKey = (typeof BOON_KEYS)[number];
