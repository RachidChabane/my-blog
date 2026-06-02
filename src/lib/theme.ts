/**
 * Theme state — light/dark via [data-theme] on <html>.
 * `resolveTheme` is pure (unit-tested); DOM wrappers are exercised in e2e.
 */
export type Theme = 'light' | 'dark';

export const STORAGE_KEY = 'rc-theme';

/** Resolve the effective theme from a (possibly invalid) stored value + system preference. */
export function resolveTheme(
  stored: string | null,
  systemPrefersDark: boolean
): Theme {
  if (stored === 'light' || stored === 'dark') return stored;
  return systemPrefersDark ? 'dark' : 'light';
}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getCurrentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark'
    ? 'dark'
    : 'light';
}

/** Apply to the DOM and persist the choice. */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — stays in-memory for this session */
  }
}

/** Resolve + apply on load (used by the island; mirrors the inline init). */
export function initTheme(): Theme {
  const theme = resolveTheme(readStored(), systemPrefersDark());
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

/** Flip the current theme; returns the new value. */
export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/**
 * No-flash init script — injected verbatim into <head> as
 * `<script is:inline set:html={themeInitScript}>`. Must be self-contained
 * (inline scripts can't import); STORAGE_KEY is interpolated so the key
 * stays single-sourced with the rest of this module.
 */
export const themeInitScript =
  `(function(){try{var k=${JSON.stringify(STORAGE_KEY)};` +
  `var s=localStorage.getItem(k);` +
  `var t=(s==='light'||s==='dark')?s:` +
  `(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');` +
  `document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
