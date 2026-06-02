import { describe, it, expect } from 'vitest';
import { resolveTheme, STORAGE_KEY, themeInitScript } from '@/lib/theme';

describe('resolveTheme', () => {
  it('honors a valid stored choice over the system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('falls back to the system preference when unset or invalid', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme('chartreuse', true)).toBe('dark');
    expect(resolveTheme('', false)).toBe('light');
  });
});

describe('themeInitScript (no-flash)', () => {
  it('single-sources the storage key and is self-contained', () => {
    expect(STORAGE_KEY).toBe('rc-theme');
    expect(themeInitScript).toContain(JSON.stringify(STORAGE_KEY));
    expect(themeInitScript).toContain("setAttribute('data-theme'");
    expect(themeInitScript).toContain('prefers-color-scheme: dark');
    expect(themeInitScript).not.toContain('import');
  });
});
