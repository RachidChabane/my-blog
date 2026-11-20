/**
 * A Clawd answering a question: it thinks, takes a laptop out of its pocket, opens
 * it, sets it down and types for as long as the answer is being written, then shuts
 * the laptop and puts it away. The poses are drawn in office.css; this is their order.
 */
export type Pose =
  | ''
  | 'ponder'
  | 'reach'
  | 'lift'
  | 'open'
  | 'swing'
  | 'set'
  | 'settle'
  | 'jump'
  | 'type-a'
  | 'type-b'
  | 'type-c'
  | 'close'
  | 'hold'
  | 'pocket';

type Step = readonly [pose: Pose, ms: number];

export const TAKE_OUT: readonly Step[] = [
  ['reach', 400],
  ['lift', 135],
  ['open', 135],
  ['swing', 70],
  ['set', 135],
  ['settle', 70],
  ['jump', 70],
];
export const TYPE_LOOP: readonly Step[] = [
  ['type-a', 70],
  ['type-b', 70],
  ['type-c', 70],
];
export const PUT_AWAY: readonly Step[] = [
  ['close', 70],
  ['hold', 70],
  ['pocket', 200],
];
/** The laptop stays out at least this long, however fast the answer came. */
export const MIN_TYPING_MS = 1200;
/** How often a Clawd that does not move checks whether the answer is whole. */
const STILL_POLL_MS = 120;

export interface Typist {
  /** A question was sent and nothing has come back yet. */
  think(): void;
  /** The first words of the answer arrived. */
  write(): void;
  /** The answer is whole, or will not come. */
  rest(): void;
}

const sleep = (ms: number) => new Promise<void>((done) => setTimeout(done, ms));

/**
 * @param show draws a pose; '' is the Clawd at rest
 * @param still true for a visitor who asked for less motion: one typing pose, no sequence
 */
export function typist(
  show: (pose: Pose) => void,
  still = false,
  wait: (ms: number) => Promise<void> = sleep
): Typist {
  let answering = false;
  let acting = false;

  const play = async (steps: readonly Step[]): Promise<number> => {
    let spent = 0;
    for (const [pose, ms] of steps) {
      show(pose);
      await wait(ms);
      spent += ms;
    }
    return spent;
  };

  const act = async (): Promise<void> => {
    acting = true;
    if (still) {
      show('type-a');
      while (answering) await wait(STILL_POLL_MS);
    } else {
      await play(TAKE_OUT);
      let typed = 0;
      while (answering || typed < MIN_TYPING_MS) typed += await play(TYPE_LOOP);
      await play(PUT_AWAY);
    }
    acting = false;
    show(answering ? 'ponder' : '');
  };

  return {
    think() {
      answering = true;
      if (!acting) show('ponder');
    },
    write() {
      answering = true;
      if (!acting) void act();
    },
    rest() {
      answering = false;
      if (!acting) show('');
    },
  };
}
