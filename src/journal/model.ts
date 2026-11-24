/** The arithmetic behind the journal's interactive figures. Pure: no DOM, no I/O. */

/**
 * Share of the usability problems found by `users` people when one person finds a
 * share `perUser` of them (Nielsen and Landauer, 1993): 1 - (1 - L)^n.
 */
export function shareFound(perUser: number, users: number): number {
  return 1 - (1 - perUser) ** users;
}

/** Changes still waiting for a review at the end of each day, from day 1 to `days`. */
export function reviewBacklog(
  producedPerDay: number,
  reviewedPerDay: number,
  days: number
): number[] {
  const growth = Math.max(0, producedPerDay - reviewedPerDay);
  return Array.from({ length: days }, (_, day) => growth * (day + 1));
}

/** How far apart two ratings may be and still count as the same opinion. */
export const SAME_OPINION_GAP = 1;

/** How many of the paired ratings stayed within SAME_OPINION_GAP of each other. */
export function sameOpinionCount(first: number[], second: number[]): number {
  return first.filter(
    (rating, i) => Math.abs(rating - (second[i] ?? NaN)) <= SAME_OPINION_GAP
  ).length;
}

/** A repeatable source of numbers in [0, 1) (mulberry32), so a draw can be replayed. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/** One number in [0, 1) per person and per problem: the person meets it when it is below L. */
export function drawTrials(
  people: number,
  problems: number,
  random: () => number
): number[][] {
  return Array.from({ length: people }, () =>
    Array.from({ length: problems }, random)
  );
}

/** Whether a trial counts as a problem met, for a person who meets a share `perUser`. */
export function isMet(trial: number, perUser: number): boolean {
  return trial < perUser;
}

/** For each problem, whether at least one of the first `people` people met it. */
export function problemsMet(
  trials: number[][],
  perUser: number,
  people: number
): boolean[] {
  const tested = trials.slice(0, people);
  const problems = trials[0]?.length ?? 0;
  return Array.from({ length: problems }, (_, problem) =>
    tested.some((person) => isMet(person[problem] ?? 1, perUser))
  );
}
