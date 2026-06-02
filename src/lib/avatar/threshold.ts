// Server-only: do not import in client-side islands.
//
// The "I don't know" gate (NFR-4, FR-E2). Pure function. Imports ONLY contract
// types — never any provider or LLM. The endpoint (task 19) calls the LLM only
// on the `grounded` branch, so there is no code path here by which a
// below-threshold query can reach synthesis. That is the structural guarantee.
//
// CRITICAL: the gate keys on `result.topSimilarity` (the vector cosine of the
// corpus's best chunk, in [-1, 1] and comparable across queries) — NOT the RRF
// fused score. RRF scores are unbounded and relative to the candidate lists, so
// a nonsense query still yields a non-trivial top fused score; thresholding it
// would defeat NFR-4. Do not threshold the fused score.

import type { RetrievalResult, ThresholdOutcome } from './contracts';

/**
 * Default cosine cut-off. Calibrated so the fake embedder cleanly separates
 * on-topic (well above) from off-topic (well below) in tests. The REAL value is
 * tuned against the real multilingual embedder at M-10 / index build, and is
 * overridable per call (task 19 may source it from config/env).
 */
export const DEFAULT_SIMILARITY_THRESHOLD = 0.25;

/** Near-misses surfaced to the UI on refusal ("I don't know, but maybe these"). */
export const DEFAULT_MAX_NEAR_MISSES = 3;

export interface ThresholdOptions {
  /** Cosine cut-off. Default DEFAULT_SIMILARITY_THRESHOLD. */
  threshold?: number;
  /** Cap on returned near-misses. Default DEFAULT_MAX_NEAR_MISSES. */
  maxNearMisses?: number;
}

/**
 * Decide grounded vs refuse on the vector cosine signal (NOT the RRF score).
 *
 *   topSimilarity >= threshold → { kind: 'grounded', chunks }  (synthesis input)
 *   topSimilarity <  threshold → { kind: 'idk', nearMisses }   (LLM never invoked)
 *
 * The comparison is exactly `>=`. Pure; no side effects; no `await`.
 */
export function applyThreshold(
  result: RetrievalResult,
  opts?: ThresholdOptions
): ThresholdOutcome {
  const threshold = opts?.threshold ?? DEFAULT_SIMILARITY_THRESHOLD;
  const maxNearMisses = opts?.maxNearMisses ?? DEFAULT_MAX_NEAR_MISSES;
  const topSimilarity = result.topSimilarity;

  if (topSimilarity >= threshold) {
    return { kind: 'grounded', chunks: result.candidates, topSimilarity, threshold };
  }

  const nearMisses = [...result.candidates]
    .sort(
      (a, b) =>
        b.vectorSimilarity - a.vectorSimilarity ||
        a.chunk.id.localeCompare(b.chunk.id)
    )
    .slice(0, maxNearMisses);
  return { kind: 'idk', nearMisses, topSimilarity, threshold };
}
