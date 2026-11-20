import exam from '../data/exam.json';

/**
 * The rules of the game, free of any wording: numbers, weapons, enemy types, chapters.
 * Names and lines live in i18n/copy.ts, keyed by the identifiers defined here.
 */

export const WEAPON_KEYS = ['duel', 'trident', 'exam'] as const;
export type WeaponKey = (typeof WEAPON_KEYS)[number];

/** A weapon is a way to face a question: how many options are shown, and what a right answer is worth. */
export interface Weapon {
  readonly options: number;
  readonly dmg: number;
  readonly verve: number;
  readonly xp: number;
}

export const WEAPONS: Record<WeaponKey, Weapon> = {
  duel: { options: 2, dmg: 1, verve: 2, xp: 8 },
  trident: { options: 3, dmg: 2, verve: 3, xp: 10 },
  exam: { options: 4, dmg: 3, verve: 4, xp: 12 },
};

export const RULES = {
  heroPv: 28,
  perkPv: 3,
  hpCap: 39,
  inkCap: 8,
  ink: 4,
  elitePv: 2,
  eliteXp: 1.5,
  cafeMoka: 12,
  cafe: 8,
  balm: 6,
  inkRefill: 2,
  restPv: 3,
  maxItems: 3,
  verveMax: 10,
  verveStreak: 1,
  verveDrain: 3,
  soloPv: 6,
  soloSheets: 3,
  packPv: 4,
  packSheets: 2,
  bossSheets: 6,
  summonSheets: 2,
  hit: 3,
  packHit: 2,
  big: 6,
  packBig: 4,
  counter: 2,
  bossHit: 3,
  bossBig: 7,
  statusTurns: 2,
  fogTurns: 2,
  heal: 2,
  echoDmg: 1,
  plumeDmg: 6,
  xpBoss: 30,
  reviewNeeds: 2,
  theftEvery: 3,
  theftVerve: 2,
} as const;

export const FIGHTS_PER_CHAPTER = 4;

export const POWER_COST = { hint: 1, echo: 2, balm: 2, blot: 1 } as const;
export type PowerKey = keyof typeof POWER_COST;
export const POWER_KEYS = Object.keys(POWER_COST) as PowerKey[];

export const ITEM_KEYS = ['cafe', 'gomme', 'tampon'] as const;
export type ItemKey = (typeof ITEM_KEYS)[number];
export const BOON_KEYS = ['ink', 'crit', 'pv'] as const;
export type BoonKey = (typeof BOON_KEYS)[number];
export const BOON_PV = 4;

export const LEVELS = [0, 60, 150, 280, 450, 660, 900, 1200, 1550, 1950];

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
export const maxHpOf = (perks: Perks = NO_PERKS): number =>
  Math.min(RULES.hpCap, RULES.heroPv + RULES.perkPv * perks.pv);
export const maxInkOf = (perks: Perks = NO_PERKS): number =>
  Math.min(RULES.inkCap, RULES.ink + perks.ink);

/* ---------- what enemies do on their turn ---------- */
export type IntentKey =
  | 'hit'
  | 'big'
  | 'charge'
  | 'ink'
  | 'gag'
  | 'tache'
  | 'back'
  | 'wave'
  | 'fog'
  | 'special';

/** Intents that strike both heroes or change the field: drawn and announced as area moves. */
export const AREA_INTENTS: ReadonlySet<IntentKey> = new Set(['wave', 'fog']);

export const TYPE_KEYS = ['grib', 'fau', 'cut', 'mask', 'pil', 'din'] as const;
export type TypeKey = (typeof TYPE_KEYS)[number];

export interface Traits {
  readonly weak: WeaponKey;
  readonly resist: WeaponKey;
}
export interface TypeRules extends Traits {
  readonly pattern: readonly IntentKey[];
  readonly packPattern?: readonly IntentKey[];
}

export const TYPES: Record<TypeKey, TypeRules> = {
  grib: {
    weak: 'duel',
    resist: 'exam',
    pattern: ['hit', 'tache', 'hit', 'back'],
    packPattern: ['tache', 'hit', 'tache', 'back'],
  },
  fau: {
    weak: 'exam',
    resist: 'duel',
    pattern: ['hit', 'ink', 'charge', 'big'],
  },
  cut: {
    weak: 'trident',
    resist: 'exam',
    pattern: ['hit', 'gag', 'hit', 'charge', 'big'],
  },
  mask: {
    weak: 'duel',
    resist: 'trident',
    pattern: ['back', 'hit', 'charge', 'big'],
  },
  pil: {
    weak: 'exam',
    resist: 'trident',
    pattern: ['ink', 'hit', 'back', 'hit'],
  },
  din: {
    weak: 'trident',
    resist: 'duel',
    pattern: ['wave', 'hit', 'fog', 'hit'],
    packPattern: ['fog', 'wave', 'hit', 'wave'],
  },
};

/* ---------- chapters: one per exam domain, in the exam's order ---------- */
export type BossSpecial = 'double' | 'flood' | 'shuffle' | 'silence' | 'steal';
export interface BossRules extends Traits {
  readonly special: BossSpecial;
  readonly pv: number;
}
export interface ChapterRules {
  readonly domain: string;
  readonly tier: number;
  /** The enemy types met in this chapter; the first fight is always `first`. */
  readonly first: TypeKey;
  readonly mix: readonly TypeKey[];
  readonly boss: BossRules;
}

type DomainRules = Pick<ChapterRules, 'first' | 'mix'> & {
  readonly boss: Omit<BossRules, 'pv'>;
};

/** What makes each domain's chapter its own: enemy mix and boss. */
const DOMAIN_RULES: Record<string, DomainRules> = {
  agentic_architecture: {
    first: 'grib',
    mix: ['grib', 'fau', 'cut', 'mask', 'pil'],
    boss: { special: 'double', weak: 'duel', resist: 'exam' },
  },
  claude_code: {
    first: 'cut',
    mix: ['cut', 'fau', 'grib', 'mask', 'din'],
    boss: { special: 'flood', weak: 'trident', resist: 'duel' },
  },
  prompt_engineering: {
    first: 'fau',
    mix: ['fau', 'grib', 'mask', 'pil', 'din'],
    boss: { special: 'shuffle', weak: 'trident', resist: 'duel' },
  },
  tool_design_mcp: {
    first: 'pil',
    mix: ['pil', 'cut', 'fau', 'mask', 'din'],
    boss: { special: 'silence', weak: 'exam', resist: 'trident' },
  },
  context_management: {
    first: 'din',
    mix: ['din', 'pil', 'mask', 'grib'],
    boss: { special: 'steal', weak: 'trident', resist: 'duel' },
  },
};

/** Difficulty climbs with the chapter's position, whatever the domain. */
const TIER_BY_POSITION = [0, 1, 1, 2, 2];
const BOSS_PV_BY_POSITION = [12, 13, 14, 15, 17];

/** One chapter per exam domain, in the order exam.json lists them. */
export const CHAPTERS: readonly ChapterRules[] = exam.domains.map((d, i) => {
  const r = DOMAIN_RULES[d.key];
  if (!r) throw new Error(`no chapter rules for domain ${d.key}`);
  const at = Math.min(i, TIER_BY_POSITION.length - 1);
  return {
    domain: d.key,
    tier: TIER_BY_POSITION[at],
    first: r.first,
    mix: r.mix,
    boss: { ...r.boss, pv: BOSS_PV_BY_POSITION[at] },
  };
});

export type DamageKind = '' | 'crit' | 'resist';

/** Damage of a right answer: doubled on the weakness, halved (at least 1) on the resistance. */
export function damageFor(
  traits: Traits,
  w: WeaponKey
): { d: number; kind: DamageKind } {
  const base = WEAPONS[w].dmg;
  if (traits.weak === w) return { d: base * 2, kind: 'crit' };
  if (traits.resist === w)
    return { d: Math.max(1, Math.floor(base / 2)), kind: 'resist' };
  return { d: base, kind: '' };
}
