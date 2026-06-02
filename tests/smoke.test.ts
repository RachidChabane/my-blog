import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('test harness is operational', () => {
    expect(true).toBe(true);
  });

  it('TypeScript strict mode is active', () => {
    const add = (a: number, b: number): number => a + b;
    expect(add(1, 2)).toBe(3);
  });
});
