import type { Book } from './engine';
import type { Perks, WeaponKey } from './rules';
import { RULES, WEAPON_KEYS } from './rules';
import type { DamageKind } from './rules';

/** One save for both languages: question ids are the same in French and English. */
export const SAVE_KEY = 'cca-training-v1';
export const SAVE_VERSION = 1;

export type KnownMap = Record<string, Partial<Record<WeaponKey, DamageKind>>>;

export interface SaveData {
  v: number;
  /** Ids of the sheets answered right at least once. */
  freed: string[];
  /** Sheets missed recently, with the number of right answers still needed. */
  review: Record<string, number>;
  xp: number;
  /** Domain keys whose boss is beaten. */
  beaten: string[];
  perks: Perks;
  /** Weaknesses and resistances the player has discovered, per enemy kind. */
  known: KnownMap;
  sound: boolean;
  soundAsked: boolean;
  taught: boolean;
  /** Cinematics already shown, so they can be replayed from the title screen. */
  seen: string[];
}

export function emptySave(): SaveData {
  return {
    v: SAVE_VERSION,
    freed: [],
    review: {},
    xp: 0,
    beaten: [],
    perks: { pv: 0, ink: 0 },
    known: {},
    sound: false,
    soundAsked: false,
    taught: false,
    seen: [],
  };
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
const DAMAGE_KINDS: readonly string[] = ['crit', 'resist'];

/**
 * Reads a stored save. Anything unreadable falls back to an empty save; ids that are not
 * in the current bank are dropped, so a rewritten bank never shows phantom progress.
 */
export function parseSave(
  raw: string | null,
  ids: ReadonlySet<string>,
  domains: ReadonlySet<string>
): SaveData {
  const base = emptySave();
  if (!raw) return base;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return base;
  }
  if (!isRecord(data) || data.v !== SAVE_VERSION) return base;
  const review: Record<string, number> = {};
  if (isRecord(data.review))
    for (const [id, n] of Object.entries(data.review))
      if (ids.has(id) && count(n) > 0) review[id] = count(n);
  const known: KnownMap = {};
  if (isRecord(data.known))
    for (const [kind, map] of Object.entries(data.known)) {
      if (!isRecord(map)) continue;
      const entry: Partial<Record<WeaponKey, DamageKind>> = {};
      for (const w of WEAPON_KEYS) {
        const v = map[w];
        if (typeof v === 'string' && DAMAGE_KINDS.includes(v))
          entry[w] = v as DamageKind;
      }
      known[kind] = entry;
    }
  const perks = isRecord(data.perks) ? data.perks : {};
  return {
    v: SAVE_VERSION,
    freed: strings(data.freed).filter((id) => ids.has(id)),
    review,
    xp: count(data.xp),
    beaten: strings(data.beaten).filter((d) => domains.has(d)),
    perks: { pv: count(perks.pv, 10), ink: count(perks.ink, 10) },
    known,
    sound: data.sound === true,
    soundAsked: data.soundAsked === true,
    taught: data.taught === true,
    seen: strings(data.seen),
  };
}

export const serializeSave = (s: SaveData): string => JSON.stringify(s);

/** The engine's view of a save: every change is written through `persist`. */
export function bookFor(save: SaveData, persist: () => void): Book {
  return {
    freed: () => new Set(save.freed),
    free(id) {
      if (save.freed.includes(id)) return;
      save.freed.push(id);
      persist();
    },
    known: (k) => save.known[k] ?? {},
    know(k, w, kind) {
      const m = (save.known[k] = save.known[k] ?? {});
      if (m[w]) return false;
      m[w] = kind;
      persist();
      return true;
    },
    reviewSet: () => save.review,
    review(id, right) {
      const r = save.review;
      if (right) {
        if (r[id] && --r[id] <= 0) delete r[id];
      } else r[id] = RULES.reviewNeeds;
      persist();
    },
  };
}
