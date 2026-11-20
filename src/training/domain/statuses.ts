/**
 * Statuses, for both sides. A status is a number of the bearer's own turns left; the
 * shield also keeps a number of points. What each one does is data here, read by the
 * combat engine; names and explanations live in i18n/copy.ts under the same keys.
 */
export const STATUS_KEYS = [
  'poison',
  'burn',
  'sleep',
  'stun',
  'silence',
  'smudge',
  'guard',
  'shield',
  'regen',
  'taunt',
  'steady',
  'traced',
  'clock',
] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];
export type Statuses = Partial<Record<StatusKey, number>>;

/** When the bearer's counter goes down: at the start of its turn, or at the end. */
type Clock = 'start' | 'end';

export interface StatusRule {
  /** Harmful to the bearer: cured by cleansing, counted by the "no dead turn" rule. */
  readonly bad: boolean;
  readonly clock: Clock;
  /** The bearer loses its turn while the status lasts. */
  readonly skips?: boolean;
  /** Share of the bearer's maximum health lost (negative: regained) when its turn starts. */
  readonly tick?: number;
  /** Ends as soon as the bearer is hit by an attack. */
  readonly wakesOnHit?: boolean;
  /** Turns it lasts when applied without another figure. */
  readonly turns: number;
}

export const STATUS: Record<StatusKey, StatusRule> = {
  poison: { bad: true, clock: 'start', tick: 0.08, turns: 3 },
  burn: { bad: true, clock: 'start', tick: 0.05, turns: 2 },
  sleep: { bad: true, clock: 'start', skips: true, wakesOnHit: true, turns: 2 },
  stun: { bad: true, clock: 'start', skips: true, turns: 1 },
  silence: { bad: true, clock: 'end', turns: 2 },
  smudge: { bad: true, clock: 'end', turns: 2 },
  guard: { bad: false, clock: 'start', turns: 1 },
  shield: { bad: false, clock: 'start', turns: 3 },
  regen: { bad: false, clock: 'start', tick: -0.1, turns: 3 },
  taunt: { bad: false, clock: 'end', turns: 2 },
  steady: { bad: false, clock: 'end', turns: 2 },
  /* an enemy out of sight is traced, for these turns: its moves show and it takes full damage */
  traced: { bad: false, clock: 'end', turns: 2 },
  /* a countdown run by its bearer: turns left before it times out, set by its phase */
  clock: { bad: false, clock: 'end', turns: 0 },
};

/** A burnt bearer deals this share of its damage. */
export const BURN_FACTOR = 0.5;
/** A guarding bearer takes this share of the damage. */
export const GUARD_FACTOR = 0.5;
/** Health lost or regained by one tick: a share of the maximum, never less than 2. */
export const tickAmount = (k: StatusKey, max: number): number =>
  Math.max(2, Math.ceil(Math.abs(STATUS[k].tick ?? 0) * max));

/** Statuses that take the bearer's turn away. */
export const SKIPPING: readonly StatusKey[] = STATUS_KEYS.filter(
  (k) => STATUS[k].skips
);
export const BAD: readonly StatusKey[] = STATUS_KEYS.filter(
  (k) => STATUS[k].bad
);
