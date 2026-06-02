import { describe, it, expect } from 'vitest';
import {
  getRequired,
  getOptional,
  ENV_KEYS,
  type EnvKey,
} from '../src/lib/env';

const FIXTURE: Record<string, string> = {
  OPENROUTER_API_KEY: 'sk-or-test-key',
  EMBEDDINGS_API_KEY: 'emb-test-key',
  CLOUDFLARE_API_TOKEN: 'cf-token-test',
  CLOUDFLARE_ACCOUNT_ID: 'cf-account-test',
};

describe('getRequired', () => {
  it('returns value when key is present', () => {
    expect(getRequired('OPENROUTER_API_KEY', FIXTURE)).toBe('sk-or-test-key');
  });

  it('throws when key is absent', () => {
    expect(() => getRequired('OPENROUTER_API_KEY', {})).toThrow();
  });

  it('throws when key is empty string', () => {
    expect(() =>
      getRequired('OPENROUTER_API_KEY', { OPENROUTER_API_KEY: '' })
    ).toThrow();
  });

  it('error message includes the key name', () => {
    expect(() => getRequired('EMBEDDINGS_API_KEY', {})).toThrow(
      'EMBEDDINGS_API_KEY'
    );
  });

  it('error message references .env.example', () => {
    expect(() => getRequired('CLOUDFLARE_API_TOKEN', {})).toThrow(
      '.env.example'
    );
  });
});

describe('getOptional', () => {
  it('returns value when key is present', () => {
    expect(getOptional('CLOUDFLARE_ACCOUNT_ID', FIXTURE)).toBe(
      'cf-account-test'
    );
  });

  it('returns undefined when key is absent', () => {
    expect(getOptional('OPENROUTER_API_KEY', {})).toBeUndefined();
  });

  it('returns undefined when key is empty string', () => {
    expect(
      getOptional('OPENROUTER_API_KEY', { OPENROUTER_API_KEY: '' })
    ).toBeUndefined();
  });
});

describe('ENV_KEYS', () => {
  it('is a non-empty readonly array', () => {
    expect(ENV_KEYS.length).toBeGreaterThan(0);
  });

  it('contains all four expected key names', () => {
    const expected: EnvKey[] = [
      'OPENROUTER_API_KEY',
      'EMBEDDINGS_API_KEY',
      'CLOUDFLARE_API_TOKEN',
      'CLOUDFLARE_ACCOUNT_ID',
    ];
    for (const key of expected) {
      expect(ENV_KEYS).toContain(key);
    }
  });
});
