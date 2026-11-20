/** The running game's shared state and the small helpers every screen uses. */
import type { Question } from '../../domain/bank';
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
}

export const G = {} as GameState;

export const $ = (id: string): HTMLElement =>
  G.root.getElementById(id) as HTMLElement;

export const reduced = (): boolean =>
  matchMedia('(prefers-reduced-motion: reduce)').matches;

export const wait = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, reduced() ? Math.min(ms, 30) : ms));

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
