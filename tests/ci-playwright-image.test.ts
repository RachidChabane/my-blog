import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

/** The e2e job runs in a Playwright image; its browsers only fit one release. */
describe('CI Playwright image', () => {
  it('carries the Playwright version of the lockfile', () => {
    const lock = readFileSync('pnpm-lock.yaml', 'utf8');
    const ci = readFileSync('.github/workflows/ci.yml', 'utf8');
    const locked = lock.match(/'@playwright\/test@(\d+\.\d+\.\d+)'/)?.[1];
    const image = ci.match(
      /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-/
    )?.[1];
    expect(locked).toBeDefined();
    expect(image).toBe(locked);
  });
});
