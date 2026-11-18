// Server-only: do not import in client-side islands.
// A question asked under a text is answered from the whole text, not from the
// few passages that happen to resemble the question: "sum it up" has no passage
// that resembles it.

import type { Candidate, IndexChunk } from './contracts';

/** Ceiling on the text handed to the model for one scoped question (characters). */
export const WHOLE_TEXT_MAX_CHARS = 24_000;

/**
 * The chunks of one text, in reading order, as synthesis candidates. Stops before
 * the chunk that would pass `maxChars`, so a text is never cut mid-passage.
 */
export function wholeTextCandidates(
  chunks: IndexChunk[],
  similarity: number,
  maxChars = WHOLE_TEXT_MAX_CHARS
): Candidate[] {
  const out: Candidate[] = [];
  let used = 0;
  for (const chunk of chunks) {
    if (out.length > 0 && used + chunk.text.length > maxChars) break;
    used += chunk.text.length;
    out.push({
      chunk,
      vectorSimilarity: similarity,
      lexicalScore: 0,
      fusedScore: 0,
      rerankScore: null,
    });
  }
  return out;
}
