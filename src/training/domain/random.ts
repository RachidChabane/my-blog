/** A source of numbers in [0, 1). Injected everywhere so rules are reproducible in tests. */
export type Rng = () => number;

const MODULUS = 2147483647;
const MULTIPLIER = 16807;

/** Park-Miller generator: small, seedable, good enough for shuffling a deck of cards. */
export function seededRng(seed: number): Rng {
  let state = Math.abs(Math.floor(seed)) % MODULUS || 7;
  return () => {
    state = (state * MULTIPLIER) % MODULUS;
    return (state - 1) / (MODULUS - 1);
  };
}

export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pickOne<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}
