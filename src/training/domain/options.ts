import type { Rng } from './random';
import { shuffle } from './random';

/** What a weapon needs to know about a question: how many options, which one is right. */
export interface Answerable {
  readonly options: readonly string[];
  readonly answer: number;
}

/** The options a player sees: indices into the question's options, and where the right one sits. */
export interface Draw {
  readonly order: readonly number[];
  readonly correct: number;
}

/**
 * Draws `shown` options of a question: the right one always, the wrong ones at random,
 * in a random order. Called again for every attempt, so two attempts rarely look alike.
 */
export function drawOptions(q: Answerable, shown: number, rng: Rng): Draw {
  const total = q.options.length;
  if (q.answer < 0 || q.answer >= total)
    throw new RangeError(`answer ${q.answer} is outside ${total} options`);
  const count = Math.max(1, Math.min(shown, total));
  const wrong = shuffle(
    q.options.map((_, i) => i).filter((i) => i !== q.answer),
    rng
  ).slice(0, count - 1);
  const order = shuffle([q.answer, ...wrong], rng);
  return { order, correct: order.indexOf(q.answer) };
}
