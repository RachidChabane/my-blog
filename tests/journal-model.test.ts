import { describe, expect, it } from 'vitest';
import {
  SAME_OPINION_GAP,
  discoveries,
  drawTrials,
  isMet,
  reviewBacklog,
  sameOpinionCount,
  seededRandom,
} from '../src/journal/model';

describe('reviewBacklog', () => {
  it('grows by the daily gap between what is produced and what is reviewed', () => {
    expect(reviewBacklog(14, 8, 3)).toEqual([6, 12, 18]);
  });

  it('stays empty when reviews keep up or run ahead', () => {
    expect(reviewBacklog(8, 8, 3)).toEqual([0, 0, 0]);
    expect(reviewBacklog(5, 9, 2)).toEqual([0, 0]);
  });
});

describe('sameOpinionCount', () => {
  it('counts the ratings that moved by at most the allowed gap', () => {
    expect(SAME_OPINION_GAP).toBe(1);
    expect(sameOpinionCount([4, 1, 3], [5, 1, 5])).toBe(2);
  });

  it('does not count a rating with no second answer', () => {
    expect(sameOpinionCount([4, 2], [4])).toBe(1);
  });
});

describe('seededRandom', () => {
  it('replays the same numbers for the same seed and others for another seed', () => {
    const first = seededRandom(7);
    const replay = seededRandom(7);
    const other = seededRandom(8);
    const drawn = [first(), first(), first()];
    expect([replay(), replay(), replay()]).toEqual(drawn);
    expect([other(), other(), other()]).not.toEqual(drawn);
    expect(drawn.every((n) => n >= 0 && n < 1)).toBe(true);
  });
});

describe('the draw shown first in the article', () => {
  it('leaves 34 of 40 problems known after five people at 31%', () => {
    const trials = drawTrials(15, 40, seededRandom(6));
    const known = discoveries(trials, 0.31)
      .slice(0, 5)
      .reduce((sum, person) => sum + person.fresh, 0);
    expect(known).toBe(34);
  });

  it('counts a trial as met strictly below the share', () => {
    expect(isMet(0.31, 0.31)).toBe(false);
    expect(isMet(0.3099, 0.31)).toBe(true);
  });
});

describe('discoveries', () => {
  it('splits what each person met into new problems and ones already known', () => {
    const trials = [
      [0.1, 0.9, 0.2, 0.9],
      [0.1, 0.2, 0.9, 0.9],
      [0.1, 0.2, 0.2, 0.9],
    ];
    expect(discoveries(trials, 0.31)).toEqual([
      { fresh: 2, seen: 0 },
      { fresh: 1, seen: 1 },
      { fresh: 0, seen: 3 },
    ]);
  });
});
