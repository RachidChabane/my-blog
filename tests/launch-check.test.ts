import { describe, expect, it } from 'vitest';

import {
  checkCloudflareConfig,
  checkPerfA11yBudgets,
  checkPerLanguageQualityGates,
  checkRedTeamSuite,
  checkSecretScan,
  testSecretPattern,
  validateWranglerText,
} from '../scripts/launch-check';

describe('checkRedTeamSuite', () => {
  it('passes against the actual repo', async () => {
    const result = await checkRedTeamSuite();
    expect(result.pass, result.message).toBe(true);
  });

  it('reports all RT groups in the pass message', async () => {
    const result = await checkRedTeamSuite();
    expect(result.message).toContain('RT-A');
    expect(result.message).toContain('RT-H');
  });
});

describe('checkPerLanguageQualityGates', () => {
  it('passes against the actual repo', async () => {
    const result = await checkPerLanguageQualityGates();
    expect(result.pass, result.message).toBe(true);
  });

  it('mentions 6 invariant entries in the pass message', async () => {
    const result = await checkPerLanguageQualityGates();
    expect(result.message).toContain('6');
  });
});

describe('testSecretPattern', () => {
  it('matches a bare AKIA key', () => {
    expect(testSecretPattern('AKIA1234567890ABCDEF')).not.toBeNull();
  });

  it('matches an AWS key with surrounding text', () => {
    expect(
      testSecretPattern('AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF')
    ).not.toBeNull();
  });

  it('does not match an .example-style placeholder', () => {
    expect(testSecretPattern('OPENROUTER_API_KEY=sk-or-REPLACE')).toBeNull();
  });

  it('does not match a redacted test stub', () => {
    expect(testSecretPattern('sk-REDACTED-not-a-key')).toBeNull();
  });

  it('matches a PEM private-key header', () => {
    expect(testSecretPattern('-----BEGIN RSA PRIVATE KEY-----')).not.toBeNull();
  });

  it('does not match benign content', () => {
    expect(
      testSecretPattern('const apiBase = "https://openrouter.ai/api/v1"')
    ).toBeNull();
  });
});

describe('checkSecretScan', () => {
  it('passes against the actual repo (no real secrets)', async () => {
    const result = await checkSecretScan();
    expect(result.pass, result.message).toBe(true);
  });
});

describe('checkPerfA11yBudgets', () => {
  it('passes against the actual repo', async () => {
    const result = await checkPerfA11yBudgets();
    expect(result.pass, result.message).toBe(true);
  });

  it('mentions the expected spec files in the pass message', async () => {
    const result = await checkPerfA11yBudgets();
    expect(result.message).toContain('perf.spec.ts');
    expect(result.message).toContain('a11y.spec.ts');
  });
});

describe('validateWranglerText', () => {
  const VALID = `name = "my-blog"\ncompatibility_date = "2025-09-01"\npages_build_output_dir = "dist"\n`;

  it('returns no errors for valid wrangler config', () => {
    expect(validateWranglerText(VALID)).toHaveLength(0);
  });

  it('reports missing pages_build_output_dir', () => {
    const bad = VALID.replace('pages_build_output_dir = "dist"', '');
    const errors = validateWranglerText(bad);
    expect(errors.some((e) => e.includes('pages_build_output_dir'))).toBe(true);
  });

  it('reports missing name', () => {
    const bad = VALID.replace('name = "my-blog"', '');
    const errors = validateWranglerText(bad);
    expect(errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('reports missing compatibility_date', () => {
    const bad = VALID.replace('compatibility_date = "2025-09-01"', '');
    const errors = validateWranglerText(bad);
    expect(errors.some((e) => e.includes('compatibility_date'))).toBe(true);
  });
});

describe('checkCloudflareConfig', () => {
  it('passes against the actual repo', async () => {
    const result = await checkCloudflareConfig();
    expect(result.pass, result.message).toBe(true);
  });

  it('mentions key files in the pass message', async () => {
    const result = await checkCloudflareConfig();
    expect(result.message).toContain('wrangler.toml');
    expect(result.message).toContain('.env.example');
  });
});
