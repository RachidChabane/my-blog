import { describe, expect, it } from 'vitest';
import {
  SAME_OPINION_GAP,
  drawTrials,
  isMet,
  problemsMet,
  reviewBacklog,
  sameOpinionCount,
  seededRandom,
  shareFound,
} from '../src/journal/model';

describe('shareFound', () => {
  it('gives 84% for five people who each find 31%, which Nielsen publishes as 85%', () => {
    expect(shareFound(0.31, 5)).toBeCloseTo(0.8436, 3);
  });

  it('is the single-person share for one person and grows with each one added', () => {
    expect(shareFound(0.31, 1)).toBeCloseTo(0.31, 10);
    expect(shareFound(0.31, 6)).toBeGreaterThan(shareFound(0.31, 5));
  });

  it('finds nothing with nobody and never passes everything', () => {
    expect(shareFound(0.31, 0)).toBe(0);
    expect(shareFound(0.5, 15)).toBeLessThan(1);
  });
});

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

describe('problemsMet', () => {
  const trials = [
    [0.1, 0.9, 0.4],
    [0.8, 0.9, 0.2],
  ];

  it('marks a problem as met when one of the people tested met it', () => {
    expect(problemsMet(trials, 0.31, 1)).toEqual([true, false, false]);
    expect(problemsMet(trials, 0.31, 2)).toEqual([true, false, true]);
  });

  it('meets nothing with nobody and more as each person meets more', () => {
    expect(problemsMet(trials, 0.31, 0)).toEqual([false, false, false]);
    expect(problemsMet(trials, 0.5, 1)).toEqual([true, false, true]);
  });

  it('comes close to the formula over many problems', () => {
    const many = drawTrials(5, 20000, seededRandom(1));
    const met = problemsMet(many, 0.31, 5).filter(Boolean).length / 20000;
    expect(met).toBeCloseTo(shareFound(0.31, 5), 2);
  });
});

describe('the draw shown first in the article', () => {
  it('meets 34 of 40 problems with five people at 31%', () => {
    const trials = drawTrials(15, 40, seededRandom(6));
    expect(problemsMet(trials, 0.31, 5).filter(Boolean)).toHaveLength(34);
  });

  it('counts a trial as met strictly below the share', () => {
    expect(isMet(0.31, 0.31)).toBe(false);
    expect(isMet(0.3099, 0.31)).toBe(true);
  });
});
