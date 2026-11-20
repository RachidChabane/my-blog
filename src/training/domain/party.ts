/**
 * The party: you, and the office Clawds who join along the adventure. Each has an
 * element, a role, skills paid in tokens and a passive. Glose is the mentor: he stays
 * out of the line-up and lends his powers (rules.ts).
 */
import type { Element } from './elements';
import type { FormatKey, Perks } from './rules';
import { NO_PERKS, RULES } from './rules';
import type { StatusKey } from './statuses';

export const MEMBER_KEYS = [
  'hero',
  'vigie',
  'moka',
  'tampon',
  'navette',
  'arrosoir',
] as const;
export type MemberKey = (typeof MEMBER_KEYS)[number];
export type AllyKey = Exclude<MemberKey, 'hero'>;

export type Role =
  | 'balance'
  | 'control'
  | 'heal'
  | 'defence'
  | 'speed'
  | 'support';

export const SKILL_KEYS = [
  'coulure',
  'relecture',
  'balayage',
  'brouillage',
  'decharge',
  'espresso',
  'tournee',
  'ebouillanter',
  'provoc',
  'visa',
  'refuse',
  'courtcircuit',
  'allerretour',
  'bouture',
  'desherbage',
  'rempotage',
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export type PassiveKey =
  | 'diligent'
  | 'radar'
  | 'pause'
  | 'paperwork'
  | 'delivery'
  | 'greenThumb';

/**
 * Who a skill reaches. `ally` and `down` are chosen by the game (the most hurt member,
 * the member who is down), so a skill never needs a third tap.
 */
export type SkillTarget = 'foe' | 'foes' | 'self' | 'ally' | 'party' | 'down';

export interface SkillRule {
  readonly cost: number;
  readonly target: SkillTarget;
  /** Offensive skills ask a question in this format and hit with its power. */
  readonly format?: FormatKey;
  /** Number of hits of an offensive skill, each with the format's power times `share`. */
  readonly hits?: number;
  readonly share?: number;
  /** Status put on the target(s): on a right answer for an offensive skill. */
  readonly status?: readonly [StatusKey, number];
  /** Health given back, as a share of the target's maximum. */
  readonly heal?: number;
  /** Shield points, as a share of the caster's maximum health. */
  readonly shield?: number;
  readonly cleanse?: boolean;
  readonly reveal?: boolean;
  /** Breaks the target's shield before the hit. */
  readonly breaks?: boolean;
  readonly clearsFog?: boolean;
  /** Health a member who is down gets back up with, as a share of the maximum. */
  readonly revive?: number;
  /** Also puts the caster on guard. */
  readonly guard?: boolean;
}

export const SKILLS: Record<SkillKey, SkillRule> = {
  coulure: {
    cost: 2,
    target: 'foe',
    format: 'trident',
    status: ['poison', 3],
  },
  relecture: { cost: 2, target: 'self', heal: 0.35, cleanse: true },
  balayage: { cost: 1, target: 'foes', reveal: true },
  brouillage: {
    cost: 2,
    target: 'foe',
    format: 'trident',
    share: 0.5,
    status: ['silence', 2],
  },
  decharge: { cost: 3, target: 'foe', format: 'exam', status: ['stun', 1] },
  espresso: { cost: 2, target: 'ally', heal: 0.4, cleanse: true },
  tournee: { cost: 4, target: 'party', heal: 0.25, status: ['regen', 3] },
  ebouillanter: {
    cost: 2,
    target: 'foe',
    format: 'trident',
    status: ['burn', 2],
  },
  provoc: { cost: 1, target: 'self', status: ['taunt', 2], guard: true },
  visa: { cost: 2, target: 'ally', shield: 0.4 },
  refuse: { cost: 2, target: 'foe', format: 'exam', breaks: true },
  courtcircuit: { cost: 3, target: 'foes', format: 'trident', share: 0.6 },
  allerretour: { cost: 2, target: 'foe', format: 'exam', hits: 2, share: 0.6 },
  bouture: { cost: 2, target: 'party', status: ['regen', 3] },
  desherbage: { cost: 2, target: 'party', cleanse: true, clearsFog: true },
  rempotage: { cost: 4, target: 'down', revive: 0.5 },
};

export interface MemberRules {
  readonly el: Element;
  readonly role: Role;
  readonly hp: number;
  readonly hpUp: number;
  readonly atk: number;
  readonly atkUp: number;
  readonly skills: readonly SkillKey[];
  readonly passive: PassiveKey;
}

export const MEMBERS: Record<MemberKey, MemberRules> = {
  hero: {
    el: 'encre',
    role: 'balance',
    hp: 32,
    hpUp: 4,
    atk: 4,
    atkUp: 0.5,
    skills: ['coulure', 'relecture'],
    passive: 'diligent',
  },
  vigie: {
    el: 'courant',
    role: 'control',
    hp: 26,
    hpUp: 3,
    atk: 4,
    atkUp: 0.5,
    skills: ['balayage', 'brouillage', 'decharge'],
    passive: 'radar',
  },
  moka: {
    el: 'cafe',
    role: 'heal',
    hp: 28,
    hpUp: 3,
    atk: 3,
    atkUp: 0.4,
    skills: ['espresso', 'tournee', 'ebouillanter'],
    passive: 'pause',
  },
  tampon: {
    el: 'papier',
    role: 'defence',
    hp: 40,
    hpUp: 5,
    atk: 3,
    atkUp: 0.4,
    skills: ['provoc', 'visa', 'refuse'],
    passive: 'paperwork',
  },
  navette: {
    el: 'courant',
    role: 'speed',
    hp: 24,
    hpUp: 3,
    atk: 5,
    atkUp: 0.6,
    skills: ['courtcircuit', 'allerretour'],
    passive: 'delivery',
  },
  arrosoir: {
    el: 'cafe',
    role: 'support',
    hp: 30,
    hpUp: 3,
    atk: 3,
    atkUp: 0.4,
    skills: ['bouture', 'desherbage', 'rempotage'],
    passive: 'greenThumb',
  },
};

/** Passive figures. */
export const PASSIVE = {
  diligentTokens: 1,
  pauseHeal: 0.1,
  paperworkCut: 2,
  greenThumbHeal: 2,
} as const;

/** Allies in the line-up next to you. */
export const LINEUP_SIZE = 2;

/**
 * The allies, in the order they are met along a campaign; campaign.ts spreads them
 * over its chapters.
 */
export const ALLY_KEYS: readonly AllyKey[] = [
  'vigie',
  'navette',
  'moka',
  'tampon',
  'arrosoir',
];

/** The line-up after a new ally joins: the newcomer takes the place of the oldest. */
export function lineupWith(lineup: readonly AllyKey[], k: AllyKey): AllyKey[] {
  if (lineup.includes(k)) return [...lineup];
  const next = [...lineup, k];
  return next.slice(Math.max(0, next.length - LINEUP_SIZE));
}

export interface Stats {
  max: number;
  atk: number;
}
export function statsOf(
  k: MemberKey,
  level: number,
  perks: Perks = NO_PERKS
): Stats {
  const m = MEMBERS[k];
  return {
    max: m.hp + m.hpUp * (level - 1) + RULES.perkPv * perks.pv,
    atk: Math.floor(m.atk + m.atkUp * (level - 1)),
  };
}
