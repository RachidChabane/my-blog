/**
 * src/lib/search-relevance.ts — pure relevance gate for Pagefind results.
 *
 * Pagefind also matches an indexed word that is a PREFIX OF THE QUERY, so any
 * one-letter token in the corpus (an author initial, a `-q` CLI flag, a
 * list marker) makes every query that starts with that letter "match" the page:
 * `zzqxnotarealword` hits the page that contains "Z.". Such a hit highlights a
 * word that shares only a sliver of what was typed. A stemmed hit stays close to
 * the typed term (`benchmarks` → "benchmark", `quantizing` → "quantization"), so
 * the gate keeps it: the highlighted word must share a leading run of at least
 * MIN_SHARED_PREFIX_RATIO of the typed term's letters.
 *
 * PURE by design (no DOM, no Pagefind import) so vitest exercises it directly;
 * the search island is the only caller.
 */

/** Share of the typed term's length that a highlighted word must start with. */
export const MIN_SHARED_PREFIX_RATIO = 0.6;

const MARK_PATTERN = /<mark>(.*?)<\/mark>/g;
const NON_WORD_PATTERN = /[^\p{L}\p{N}]/gu;

const normalize = (text: string): string =>
  text.toLowerCase().replace(NON_WORD_PATTERN, '');

const termsOf = (query: string): string[] =>
  query.split(/\s+/).map(normalize).filter(Boolean);

const markedWordsOf = (excerpt: string): string[] =>
  [...excerpt.matchAll(MARK_PATTERN)]
    .map((m) => normalize(m[1]))
    .filter(Boolean);

const sharedPrefixLength = (a: string, b: string): number => {
  let length = 0;
  while (length < a.length && length < b.length && a[length] === b[length]) {
    length += 1;
  }
  return length;
};

const coversTerm = (word: string, term: string): boolean =>
  sharedPrefixLength(word, term) >= term.length * MIN_SHARED_PREFIX_RATIO;

/**
 * True when the excerpt's highlighted words genuinely match a typed term.
 * An excerpt with no highlight (the hit lies outside the body text) is kept.
 */
export function isRelevantExcerpt(query: string, excerpt: string): boolean {
  const words = markedWordsOf(excerpt);
  if (words.length === 0) return true;
  const terms = termsOf(query);
  return words.some((word) => terms.some((term) => coversTerm(word, term)));
}
