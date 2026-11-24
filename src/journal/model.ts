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
