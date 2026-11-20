import type { Locale } from '@/i18n/index';
import type { Question } from '../domain/bank';
import type { Campaign } from '../domain/campaign';
import type { Progress, SaveData } from '../domain/save';

/** Below this width the game is an app: full screen, the sheets a panel over it. */
export const PHONE = '(max-width: 759px)';

/** What the page gives the game: the bank, the save, and the page-level controls. */
export interface GameHost {
  readonly lang: Locale;
  readonly questions: readonly Question[];
  readonly campaign: Campaign;
  /** The settings, and every campaign's progress. */
  readonly save: SaveData;
  /** This campaign's progress, inside `save`. */
  readonly progress: Progress;
  persist(): void;
  /** Erases this campaign's progress, keeping the settings, and returns the save. */
  reset(): SaveData;
  /** Re-reads the save into the launch card and the sheets. */
  refresh(): void;
  openSheets(): void;
  sheetsOpen(): boolean;
  close(): void;
  isOverlay(): boolean;
}
