/**
 * A campaign: one certification played as an adventure, one chapter per exam domain.
 * A campaign is described by a small content table (its domains in exam order and the
 * boss mechanic of each); everything else (rooms, enemy strength, the order in which
 * kinds of enemy are met, where allies join) is derived from the chapter's progress
 * through the campaign, from 0 (first chapter) to 1 (last), so a campaign of any
 * length gets a complete adventure from the same curve.
 */
import type { BossKey, Phase, TypeKey } from './foes';
import { BOSSES, BOSS_HP_SHARE, TYPES, TYPE_ORDER } from './foes';
import type { AllyKey } from './party';
import { ALLY_KEYS } from './party';
import { FIGHTS_PER_CHAPTER } from './rules';

export interface CampaignSpec {
  /** Stable id, used as the key of the campaign's progress in the save. */
  readonly key: string;
  /** Domain keys, in exam order: one chapter each. */
  readonly domains: readonly string[];
  /** The boss mechanic of each domain's chapter. */
  readonly bosses: Readonly<Record<string, BossKey>>;
}

export interface BossRules {
  readonly key: BossKey;
  readonly hp: number;
  readonly atk: number;
  readonly phases: readonly Phase[];
}

export interface ChapterRules {
  readonly domain: string;
  /** The chapter's place in the campaign, from 0 (first) to 1 (last). */
  readonly progress: number;
  /** The enemies of the rooms before the boss. */
  readonly steps: readonly (readonly TypeKey[])[];
  /** Baseline health and strength of an enemy alone in this chapter. */
  readonly hp: number;
  readonly atk: number;
  readonly boss: BossRules;
}

export interface Join {
  readonly ch: number;
  readonly step: number;
}

export interface Campaign {
  readonly key: string;
  readonly chapters: readonly ChapterRules[];
  /** Where each ally is met: a chapter, and the room of that chapter. */
  readonly joins: Readonly<Record<AllyKey, Join>>;
  /** Share of XP each right answer and boss is worth (see xpShareFor). */
  readonly xpShare: number;
}

/* ---------- the difficulty curve, over progress through the campaign ---------- */
/**
 * Anchor values at evenly spaced progress points (0, 0.25, 0.5, 0.75, 1); a chapter
 * reads the curve where it stands, between two anchors.
 */
export const CURVE = {
  hp: [40, 58, 84, 114, 132],
  atk: [7, 10, 13.5, 17, 18.5],
  bossHp: [150, 190, 300, 440, 510],
  bossAtk: [1, 1, 1, 1.12, 1.15],
} as const;

export function curveAt(anchors: readonly number[], t: number): number {
  const x = Math.min(1, Math.max(0, t)) * (anchors.length - 1);
  const i = Math.min(anchors.length - 2, Math.floor(x));
  return anchors[i] + (anchors[i + 1] - anchors[i]) * (x - i);
}

const progressOf = (i: number, n: number) => (n > 1 ? i / (n - 1) : 1);

/** The level thresholds (rules.ts LEVELS) are paced for a campaign of this many chapters. */
export const LEVEL_PACE_CHAPTERS = 5;
/**
 * A longer campaign has more fights: each is worth less XP, so the player reaches the
 * same level at the same progress and the enemy curve keeps its bite.
 */
export const xpShareFor = (n: number): number =>
  Math.min(1, Math.sqrt(LEVEL_PACE_CHAPTERS / Math.max(1, n)));

/* ---------- which kinds of enemy each chapter meets ---------- */
/**
 * Every chapter but the last introduces the next kinds of enemy in TYPE_ORDER, spread
 * evenly; the last chapter only combines what came before.
 */
export function freshKinds(i: number, n: number): TypeKey[] {
  const teaching = Math.max(1, n - 1);
  const cut = (j: number) =>
    Math.min(TYPE_ORDER.length, Math.ceil((j * TYPE_ORDER.length) / teaching));
  return i >= teaching ? [] : TYPE_ORDER.slice(cut(i), cut(i + 1));
}

const isTaunter = (k: TypeKey) => !!TYPES[k].taunts;

/**
 * The rooms of a chapter: a new kind alone, then the new kinds together, then a new
 * kind beside an older one, then three at once with the taunter in front. A chapter
 * with nothing new combines the older kinds, two then three at a time.
 */
export function roomsFor(
  fresh: readonly TypeKey[],
  older: readonly TypeKey[]
): TypeKey[][] {
  const olds = [...older].reverse().filter((k) => !isTaunter(k));
  const taunter = [...fresh, ...older].find(isTaunter);
  if (!fresh.length) {
    const p = (j: number) => olds[j % olds.length];
    return [
      [p(0), p(1)],
      [p(2), p(3)],
      [...(taunter ? [taunter] : [p(5)]), p(4), p(6)],
      [p(0), p(2), p(1)],
    ];
  }
  const [a, b, c] = fresh;
  const plainNew = fresh.filter((k) => !isTaunter(k));
  /* three enemies, all different when enough kinds are known, else a second of a new one */
  const threeOf = (first: TypeKey[]) => {
    const out: TypeKey[] = [...first];
    for (const k of [...fresh, ...olds])
      if (out.length < 3 && !out.includes(k)) out.push(k);
    for (let j = 0; out.length < 3; j++)
      out.push(plainNew[j % plainNew.length] ?? a);
    return out;
  };
  return [
    [a],
    [a, b ?? olds[0] ?? a],
    [c ?? b ?? a, (b ? olds[0] : olds[1]) ?? olds[0] ?? a],
    threeOf(taunter ? [taunter] : plainNew.slice(0, 1)),
  ];
}

/* ---------- where allies join ---------- */
/**
 * Allies are met in ALLY_KEYS, spread evenly from the first chapter to the last,
 * in that chapter's second room (the first room of the last chapter, so the last ally
 * has time to fight). Allies falling in one chapter are met in the next free rooms,
 * the boss's room included.
 */
export function joinsFor(n: number): Record<AllyKey, Join> {
  const out = {} as Record<AllyKey, Join>;
  const taken = new Set<string>();
  const last = ALLY_KEYS.length - 1;
  ALLY_KEYS.forEach((k, j) => {
    const ch = Math.round((j * (n - 1)) / Math.max(1, last));
    const wanted = j === last && n > 1 ? 0 : 1;
    const rooms = FIGHTS_PER_CHAPTER + 1;
    const step =
      Array.from({ length: rooms }, (_, i) => (wanted + i) % rooms).find(
        (s) => !taken.has(`${ch}:${s}`)
      ) ?? wanted;
    taken.add(`${ch}:${step}`);
    out[k] = { ch, step };
  });
  return out;
}

export function buildCampaign(spec: CampaignSpec): Campaign {
  const n = spec.domains.length;
  const met: TypeKey[] = [];
  const chapters = spec.domains.map((domain, i): ChapterRules => {
    const key = spec.bosses[domain];
    if (!key) throw new Error(`campaign ${spec.key}: no boss for ${domain}`);
    const t = progressOf(i, n);
    const fresh = freshKinds(i, n);
    const steps = roomsFor(fresh, met);
    met.push(...fresh);
    return {
      domain,
      progress: t,
      steps,
      hp: Math.round(curveAt(CURVE.hp, t)),
      atk: curveAt(CURVE.atk, t),
      boss: {
        key,
        hp: Math.round(curveAt(CURVE.bossHp, t) * BOSS_HP_SHARE[key]),
        atk: curveAt(CURVE.bossAtk, t),
        phases: BOSSES[key],
      },
    };
  });
  return {
    key: spec.key,
    chapters,
    joins: joinsFor(n),
    xpShare: xpShareFor(n),
  };
}

/** The ally met at this room of this chapter, if any. */
export function recruitAt(
  camp: Campaign,
  ch: number,
  step: number
): AllyKey | null {
  return (
    ALLY_KEYS.find(
      (k) => camp.joins[k].ch === ch && camp.joins[k].step === step
    ) ?? null
  );
}

/** Allies met by the time the player reaches this room of this chapter. */
export const metBy = (camp: Campaign, ch: number, step = 0): AllyKey[] =>
  ALLY_KEYS.filter(
    (k) =>
      camp.joins[k].ch < ch ||
      (camp.joins[k].ch === ch && camp.joins[k].step <= step)
  );

/** Allies a player has met once every chapter in `beaten` is won. */
export const recruitsOfBeaten = (
  camp: Campaign,
  beaten: readonly number[]
): AllyKey[] => ALLY_KEYS.filter((k) => beaten.includes(camp.joins[k].ch));
