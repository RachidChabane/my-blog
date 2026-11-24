import { describe, expect, it } from 'vitest';
import {
  SAME_OPINION_GAP,
  reviewBacklog,
  sameOpinionCount,
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
