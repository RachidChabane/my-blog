// Server-only: do not import in client-side islands.
//
// Generic Reciprocal Rank Fusion. Dependency-free; knows nothing about chunks.

/** Standard RRF damping constant (Cormack et al. 2009). */
export const DEFAULT_RRF_K = 60;

/** One fused result: the original item plus its accumulated fusion score. */
export interface FusedItem<T> {
  key: string;
  item: T;
  score: number;
}

/**
 * Fuse N ranked lists (each ordered best-first) into one ranking.
 *
 *   score(d) = Σ_lists 1 / (k + rank_in_list(d))   (rank is 0-based)
 *
 * Items present in only some lists are still included (a missing leg adds 0).
 * Deterministic tie-break: higher score first, then `key` ascending — so the
 * order never depends on V8 sort stability or insertion order.
 *
 * @param rankedLists  Each inner array is one leg, ordered best-first.
 * @param getKey       Stable identity for an item (legs share the same items).
 * @param k            Damping constant; must be > 0.
 * @throws if `k <= 0`.
 */
export function reciprocalRankFusion<T>(
  rankedLists: readonly T[][],
  getKey: (item: T) => string,
  k: number = DEFAULT_RRF_K
): FusedItem<T>[] {
  if (k <= 0) {
    throw new Error('reciprocalRankFusion: k must be > 0');
  }

  const byKey = new Map<string, FusedItem<T>>();
  for (const list of rankedLists) {
    for (let rank = 0; rank < list.length; rank++) {
      const item = list[rank];
      const key = getKey(item);
      const contribution = 1 / (k + rank);
      const existing = byKey.get(key);
      if (existing) {
        existing.score += contribution;
      } else {
        // Keep the first-seen item reference (legs carry the same item per key).
        byKey.set(key, { key, item, score: contribution });
      }
    }
  }

  return [...byKey.values()].sort(
    (a, b) => b.score - a.score || a.key.localeCompare(b.key)
  );
}
