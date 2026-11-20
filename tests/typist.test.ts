import { describe, expect, it } from 'vitest';
import {
  MIN_TYPING_MS,
  PUT_AWAY,
  TAKE_OUT,
  TYPE_LOOP,
  typist,
} from '@/office/typist';
import type { Pose } from '@/office/typist';

/** A clock the test advances: each wait resolves when the test says so. */
function stage(still = false) {
  const shown: Pose[] = [];
  const waits: (() => void)[] = [];
  const actor = typist(
    (pose) => shown.push(pose),
    still,
    () => new Promise<void>((next) => waits.push(next))
  );
  const tick = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      await Promise.resolve();
      waits.shift()?.();
      await Promise.resolve();
      await Promise.resolve();
    }
  };
  return { actor, shown, tick };
}

const poses = (steps: readonly (readonly [Pose, number])[]) =>
  steps.map(([pose]) => pose);
const loopsFor = (ms: number) =>
  Math.ceil(ms / TYPE_LOOP.reduce((sum, [, t]) => sum + t, 0));

describe('a Clawd answering at its laptop', () => {
  it('thinks until the first words, then takes the laptop out and types', async () => {
    const { actor, shown, tick } = stage();
    actor.think();
    expect(shown).toEqual(['ponder']);
    actor.write();
    await tick(TAKE_OUT.length + TYPE_LOOP.length);
    expect(shown).toEqual([
      'ponder',
      ...poses(TAKE_OUT),
      ...poses(TYPE_LOOP),
      'type-a',
    ]);
  });

  it('keeps typing while the answer comes, then puts the laptop away and rests', async () => {
    const { actor, shown, tick } = stage();
    actor.think();
    actor.write();
    const loops = loopsFor(MIN_TYPING_MS) + 2;
    await tick(TAKE_OUT.length + loops * TYPE_LOOP.length - 1);
    actor.rest();
    await tick(1 + PUT_AWAY.length);
    expect(shown.slice(-PUT_AWAY.length - 1)).toEqual([...poses(PUT_AWAY), '']);
    expect(shown.filter((p) => p === 'type-a')).toHaveLength(loops);
  });

  it('types for a moment even when the answer came at once', async () => {
    const { actor, shown, tick } = stage();
    actor.write();
    actor.rest();
    const loops = loopsFor(MIN_TYPING_MS);
    await tick(TAKE_OUT.length + loops * TYPE_LOOP.length + PUT_AWAY.length);
    expect(shown.filter((p) => p === 'type-c')).toHaveLength(loops);
    expect(shown.at(-1)).toBe('');
  });

  it('goes back to thinking when a new question came while it put the laptop away', async () => {
    const { actor, shown, tick } = stage();
    actor.write();
    actor.rest();
    const total =
      TAKE_OUT.length +
      loopsFor(MIN_TYPING_MS) * TYPE_LOOP.length +
      PUT_AWAY.length;
    await tick(total - 1);
    actor.think();
    await tick(1);
    expect(shown.at(-1)).toBe('ponder');
  });

  it('rests at once when no answer comes', () => {
    const { actor, shown } = stage();
    actor.think();
    actor.rest();
    expect(shown).toEqual(['ponder', '']);
  });

  it('holds one typing pose for a visitor who asked for less motion', async () => {
    const { actor, shown, tick } = stage(true);
    actor.think();
    actor.write();
    await tick(3);
    actor.rest();
    await tick(1);
    expect(shown).toEqual(['ponder', 'type-a', '']);
  });
});
