import type { Locale } from '@/i18n/index';
import type { Question } from '../domain/bank';
import type { SaveData } from '../domain/save';

/** Below this width the game is an app: full screen, the sheets a panel over it. */
export const PHONE = '(max-width: 759px)';

/** What the page gives the game: the bank, the save, and the page-level controls. */
export interface GameHost {
  readonly lang: Locale;
  readonly questions: readonly Question[];
  readonly save: SaveData;
  persist(): void;
  /** Erases the save and returns the fresh one. */
  reset(): SaveData;
  /** Re-reads the save into the launch card and the sheets. */
  refresh(): void;
  openSheets(): void;
  sheetsOpen(): boolean;
  close(): void;
  isOverlay(): boolean;
}
