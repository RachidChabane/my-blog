import type { Campaign } from './campaign';
import { recruitsOfBeaten } from './campaign';
import type { Book } from './engine';
import type { AllyKey } from './party';
import { ALLY_KEYS, LINEUP_SIZE } from './party';
import type { Perks } from './rules';
import { RULES } from './rules';

/** One save for both languages: question ids are the same in French and English. */
export const SAVE_KEY = 'cca-training-v2';
/**
 * Where the first version of the game kept its save, for its one campaign. It is read
 * once, when there is no save under SAVE_KEY yet, and left as it was.
 */
export const SAVE_KEY_V1 = 'cca-training-v1';
export const SAVE_VERSION = 2;
const V1 = 1;

export const SPEEDS = ['normal', 'fast'] as const;
export type Speed = (typeof SPEEDS)[number];

/** What the player has done in one campaign. */
export interface Progress {
  /** Ids of the sheets answered right at least once. */
  freed: string[];
  /** Sheets missed recently, with the number of right answers still needed. */
  review: Record<string, number>;
  xp: number;
  /** Domain keys whose boss is beaten. */
  beaten: string[];
  perks: Perks;
  /** Kinds of enemy whose element the player has found out. */
  known: string[];
  /** Allies met so far, and the two who fight next to you. */
  recruits: AllyKey[];
  lineup: AllyKey[];
  /** Cinematics already shown, so they can be replayed from the title screen. */
  seen: string[];
  /** Defeats per domain since its chapter was last won: Glose's notes help the next go. */
  defeats: Record<string, number>;
}

export interface SaveData {
  v: number;
  sound: boolean;
  soundAsked: boolean;
  taught: boolean;
  speed: Speed;
  /** Progress per campaign key. */
  campaigns: Record<string, Progress>;
}

/** A campaign the save can read progress for: its rules and the ids of its bank. */
export interface Shelf {
  readonly camp: Campaign;
  readonly ids: { has(id: string): boolean };
}

export function emptyProgress(): Progress {
  return {
    freed: [],
    review: {},
    xp: 0,
    beaten: [],
    perks: { pv: 0, ink: 0 },
    known: [],
    recruits: [],
    lineup: [],
    seen: [],
    defeats: {},
  };
}

export function emptySave(): SaveData {
  return {
    v: SAVE_VERSION,
    sound: false,
    soundAsked: false,
    taught: false,
    speed: 'normal',
    campaigns: {},
  };
}

/** A campaign's progress, created empty the first time it is asked for. */
export function progressOf(save: SaveData, key: string): Progress {
  return (save.campaigns[key] ??= emptyProgress());
}

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const strings = (x: unknown): string[] =>
  Array.isArray(x)
    ? [...new Set(x.filter((s): s is string => typeof s === 'string'))]
    : [];
const count = (x: unknown, max = Infinity): number =>
  typeof x === 'number' && Number.isFinite(x) && x >= 0
    ? Math.min(max, Math.floor(x))
    : 0;
const allies = (x: unknown): AllyKey[] =>
  strings(x).filter((k): k is AllyKey =>
    (ALLY_KEYS as readonly string[]).includes(k)
  );
const counts = (
  x: unknown,
  keep: (k: string) => boolean,
  max = Infinity
): Record<string, number> => {
  const out: Record<string, number> = {};
  if (isRecord(x))
    for (const [k, n] of Object.entries(x))
      if (keep(k) && count(n) > 0) out[k] = count(n, max);
  return out;
};

/**
 * One campaign's progress. Ids that are not in the campaign's bank and domains that are
 * not among its chapters are dropped, so a rewritten bank never shows phantom progress.
 */
function parseProgress(data: Record<string, unknown>, shelf: Shelf): Progress {
  const domains = new Set(shelf.camp.chapters.map((c) => c.domain));
  const perks = isRecord(data.perks) ? data.perks : {};
  const recruits = allies(data.recruits);
  return {
    freed: strings(data.freed).filter((id) => shelf.ids.has(id)),
    review: counts(data.review, (id) => shelf.ids.has(id)),
    xp: count(data.xp),
    beaten: strings(data.beaten).filter((d) => domains.has(d)),
    perks: {
      pv: count(perks.pv, RULES.maxPerks),
      ink: count(perks.ink, RULES.maxPerks),
    },
    known: strings(data.known),
    recruits,
    lineup: allies(data.lineup)
      .filter((k) => recruits.includes(k))
      .slice(0, LINEUP_SIZE),
    seen: strings(data.seen),
    defeats: counts(data.defeats, (d) => domains.has(d), 99),
  };
}

/**
 * A first-version save: one campaign (`legacy`), no party, discoveries kept per weapon
 * (not read here). Its sheets, review marks, level, perks and won chapters carry over
 * into that campaign; the allies of the chapters already won join at once. When the page
 * reading it plays another campaign, the ids are kept as stored and checked against the
 * legacy campaign's bank the next time its own page reads them.
 */
function fromV1(
  data: Record<string, unknown>,
  legacy: Campaign,
  shelves: readonly Shelf[]
): SaveData {
  const shelf = shelves.find((s) => s.camp.key === legacy.key) ?? {
    camp: legacy,
    ids: { has: () => true },
  };
  const p = parseProgress(
    { ...data, known: [], recruits: [], lineup: [] },
    shelf
  );
  p.recruits = recruitsOfBeaten(
    legacy,
    p.beaten.map((d) => legacy.chapters.findIndex((c) => c.domain === d))
  );
  p.lineup = p.recruits.slice(-LINEUP_SIZE);
  return {
    ...emptySave(),
    sound: data.sound === true,
    soundAsked: data.soundAsked === true,
    taught: data.taught === true,
    campaigns: { [legacy.key]: p },
  };
}

const readJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Whether a stored save is one this build reads: nothing stored, or a first-version or
 * current-version save. A save that is not (a newer version, damaged data) must never be
 * written over, so the progress it holds is not lost.
 */
export function readable(raw: string | null): boolean {
  if (raw === null) return true;
  const data = readJson(raw);
  return isRecord(data) && (data.v === V1 || data.v === SAVE_VERSION);
}

/**
 * Reads a stored save, of this version or of the first one. `shelves` are the campaigns
 * this page can check ids for; `legacy` is the campaign the first version played.
 * Progress kept for a campaign this page does not know is carried over untouched.
 * Anything unreadable gives an empty save (see `readable`).
 */
export function parseSave(
  raw: string | null,
  shelves: readonly Shelf[],
  legacy: Campaign
): SaveData {
  const base = emptySave();
  if (!raw || !readable(raw)) return base;
  const data = readJson(raw) as Record<string, unknown>;
  if (data.v === V1) return fromV1(data, legacy, shelves);
  const campaigns: Record<string, Progress> = {};
  if (isRecord(data.campaigns))
    for (const [key, p] of Object.entries(data.campaigns)) {
      if (!isRecord(p)) continue;
      const shelf = shelves.find((s) => s.camp.key === key);
      campaigns[key] = shelf ? parseProgress(p, shelf) : (p as never);
    }
  return {
    v: SAVE_VERSION,
    sound: data.sound === true,
    soundAsked: data.soundAsked === true,
    taught: data.taught === true,
    speed: data.speed === 'fast' ? 'fast' : 'normal',
    campaigns,
  };
}

/** Where the save to play with is stored: this version's key, or the first version's. */
export const storedSave = (read: (key: string) => string | null) =>
  read(SAVE_KEY) ?? read(SAVE_KEY_V1);

/** The save to play with: this version's, or the first version's migrated. */
export function loadSave(
  read: (key: string) => string | null,
  shelves: readonly Shelf[],
  legacy: Campaign
): SaveData {
  return parseSave(storedSave(read), shelves, legacy);
}

export const serializeSave = (s: SaveData): string => JSON.stringify(s);

/** The engine's view of a campaign's progress: every change is written through `persist`. */
export function bookFor(p: Progress, persist: () => void): Book {
  return {
    freed: () => new Set(p.freed),
    free(id) {
      if (p.freed.includes(id)) return;
      p.freed.push(id);
      persist();
    },
    knows: (k) => p.known.includes(k),
    learn(k) {
      if (p.known.includes(k)) return false;
      p.known.push(k);
      persist();
      return true;
    },
    reviewSet: () => p.review,
    review(id, right) {
      const r = p.review;
      if (right) {
        if (r[id] && --r[id] <= 0) delete r[id];
      } else r[id] = RULES.reviewNeeds;
      persist();
    },
  };
}
