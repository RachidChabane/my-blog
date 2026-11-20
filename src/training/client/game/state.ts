/** The running game's shared state and the small helpers every screen uses. */
import type { Question } from '../../domain/bank';
import type { ChapterRules } from '../../domain/campaign';
import type { Ctx, Fight, Run } from '../../domain/engine';
import type { Rng } from '../../domain/random';
import type { Copy } from '../../i18n/copy';
import type { GameHost } from '../host';

export interface GameState {
  root: ShadowRoot;
  host: GameHost;
  c: Copy;
  rng: Rng;
  ctx: Ctx;
  qById: Map<string, Question>;
  run: Run | null;
  F: Fight | null;
  screen: string;
  /** The targeted enemy in a fight. */
  sel: number | null;
  /** Set by a tap during an animation: the rest of that beat plays at once. */
  hurry: boolean;
}

export const G = {} as GameState;

/** The chapters of the campaign being played. */
export const chapters = (): readonly ChapterRules[] => G.host.campaign.chapters;
export const domainOf = (i: number): string => chapters()[i].domain;

export const $ = (id: string): HTMLElement =>
  G.root.getElementById(id) as HTMLElement;

export const reduced = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export const wait = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 30) : ms));

/** Share of every animation and pause kept at the fast speed. */
export const FAST_SHARE = 0.55;
/** Share of a line's reading time kept at the fast speed. */
export const FAST_READ = 0.7;
export const fast = (): boolean => G.host.save.speed === 'fast';
/** A duration at the chosen speed. */
export const pace = (ms: number): number => (fast() ? ms * FAST_SHARE : ms);

/**
 * One beat of an animation, at the chosen speed. A tap during it ends it at once: what it
 * showed stays on screen, and the line that follows is never cut.
 */
export function beat(ms: number): Promise<void> {
  if (G.hurry || reduced()) return wait(reduced() ? 30 : 0);
  return new Promise((res) => {
    const end = performance.now() + pace(ms);
    const tick = () => {
      if (G.hurry || performance.now() >= end) res();
      else setTimeout(tick, 30);
    };
    tick();
  });
}

export const esc = (s: string | number): string =>
  String(s).replace(
    /[&<>"']/g,
    (ch) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        ch
      ] as string
  );

/** French typography: a thin no-break space before high punctuation and inside quotes. */
export const typeset = (html: string): string =>
  G.c.lang === 'fr'
    ? html
        .replace(/« /g, '« ')
        .replace(/ »/g, ' »')
        .replace(/ ([:;?!])/g, ' $1')
    : html;
