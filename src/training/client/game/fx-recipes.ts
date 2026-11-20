/**
 * What every action of a fight looks like, as data: how the one acting moves, what
 * travels to the target and how, and what the impact shows. One recipe per action id,
 * so no two actions share an animation; fx.ts plays them.
 */
import type { BossKey, MoveKey, TypeKey } from '../../domain/foes';
import { MOVES } from '../../domain/foes';
import type { MemberKey, SkillKey } from '../../domain/party';
import type { ItemKey, PowerKey } from '../../domain/rules';
import type { PropKey } from './art';

export type Motion =
  | 'lunge'
  | 'hop'
  | 'spin'
  | 'squash'
  | 'glow'
  | 'slide'
  | 'rise'
  | 'wobble'
  | 'stomp'
  | 'dash'
  | 'sway'
  | 'puff'
  | 'whirl'
  | 'flicker'
  | 'loom'
  | 'pulse'
  | 'drip'
  | 'none';

export type Path =
  | 'line'
  | 'arc'
  | 'high'
  | 'low'
  | 'zig'
  | 'drop'
  | 'boomerang';

export type Carrier =
  | { kind: 'fly'; prop: PropKey; path: Path; spin?: number; count?: number }
  | { kind: 'beam'; style: 'zig' | 'line' | 'dash' | 'noise'; color: string }
  | { kind: 'wave'; color: string; prop?: PropKey }
  | { kind: 'rain'; prop: PropKey; count: number }
  | { kind: 'sweep'; color: string }
  | { kind: 'rings'; color: string; count: number }
  | { kind: 'none' };

export type Glyph =
  | PropKey
  | 'dot'
  | 'spark'
  | 'z'
  | 'plus'
  | 'star'
  | 'bubble'
  | 'flame'
  | 'shard'
  | 'bang';

export interface Impact {
  burst?: { glyph: Glyph; color: string; n: number };
  stamp?: string;
  tint?: string;
  shake?: number;
  orbit?: Glyph;
  bubble?: string;
}

export interface Recipe {
  actor: Motion;
  carrier: Carrier;
  impact: Impact;
}

const c = (t: string) => `var(--${t})`;
const INK = c('el-encre');
const PAPER = c('el-papier');
const COFFEE = c('el-cafe');
const CURRENT = c('el-courant');

/* ---------- the party ---------- */
export const PARTY_RECIPES: Record<
  | `atk:${MemberKey}`
  | `skill:${SkillKey}`
  | `power:${PowerKey}`
  | `item:${ItemKey}`
  | 'guard',
  Recipe
> = {
  'atk:hero': {
    actor: 'lunge',
    carrier: { kind: 'fly', prop: 'quill', path: 'arc', spin: 1 },
    impact: { burst: { glyph: 'drop', color: INK, n: 7 }, shake: 4 },
  },
  'atk:vigie': {
    actor: 'glow',
    carrier: { kind: 'rings', color: CURRENT, count: 3 },
    impact: { burst: { glyph: 'spark', color: CURRENT, n: 6 }, shake: 3 },
  },
  'atk:navette': {
    actor: 'dash',
    carrier: { kind: 'fly', prop: 'plane', path: 'low', spin: 0 },
    impact: { burst: { glyph: 'sheet', color: PAPER, n: 5 }, shake: 5 },
  },
  'atk:moka': {
    actor: 'hop',
    carrier: { kind: 'fly', prop: 'cup', path: 'high', spin: 0.5 },
    impact: { burst: { glyph: 'bubble', color: COFFEE, n: 8 }, shake: 3 },
  },
  'atk:tampon': {
    actor: 'stomp',
    carrier: { kind: 'fly', prop: 'stamp', path: 'drop' },
    impact: { stamp: 'stampHit', shake: 8 },
  },
  'atk:arrosoir': {
    actor: 'sway',
    carrier: { kind: 'beam', style: 'dash', color: COFFEE },
    impact: { burst: { glyph: 'drop', color: COFFEE, n: 6 }, shake: 2 },
  },
  'skill:coulure': {
    actor: 'rise',
    carrier: { kind: 'rain', prop: 'drop', count: 6 },
    impact: {
      burst: { glyph: 'bubble', color: c('st-poison'), n: 6 },
      tint: c('st-poison'),
    },
  },
  'skill:relecture': {
    actor: 'glow',
    carrier: { kind: 'rain', prop: 'sheet', count: 3 },
    impact: { burst: { glyph: 'plus', color: c('ok'), n: 5 } },
  },
  'skill:balayage': {
    actor: 'glow',
    carrier: { kind: 'sweep', color: CURRENT },
    impact: { burst: { glyph: 'dot', color: CURRENT, n: 3 } },
  },
  'skill:brouillage': {
    actor: 'wobble',
    carrier: { kind: 'beam', style: 'noise', color: CURRENT },
    impact: { stamp: 'mute', tint: c('st-silence') },
  },
  'skill:decharge': {
    actor: 'rise',
    carrier: { kind: 'beam', style: 'zig', color: CURRENT },
    impact: { orbit: 'star', tint: CURRENT, shake: 10 },
  },
  'skill:espresso': {
    actor: 'hop',
    carrier: { kind: 'fly', prop: 'cup', path: 'arc', spin: 0 },
    impact: { burst: { glyph: 'steam', color: COFFEE, n: 4 } },
  },
  'skill:tournee': {
    actor: 'spin',
    carrier: { kind: 'rain', prop: 'cup', count: 4 },
    impact: { burst: { glyph: 'plus', color: COFFEE, n: 6 } },
  },
  'skill:ebouillanter': {
    actor: 'lunge',
    carrier: { kind: 'beam', style: 'line', color: COFFEE },
    impact: { burst: { glyph: 'flame', color: c('st-burn'), n: 7 }, shake: 5 },
  },
  'skill:provoc': {
    actor: 'stomp',
    carrier: { kind: 'rings', color: c('hurt'), count: 2 },
    impact: { burst: { glyph: 'bang', color: c('hurt'), n: 3 } },
  },
  'skill:visa': {
    actor: 'hop',
    carrier: { kind: 'fly', prop: 'stamp', path: 'high' },
    impact: { stamp: 'visa', bubble: PAPER },
  },
  'skill:refuse': {
    actor: 'stomp',
    carrier: { kind: 'fly', prop: 'stamp', path: 'drop', spin: 0.25 },
    impact: {
      stamp: 'refused',
      burst: { glyph: 'shard', color: PAPER, n: 6 },
      shake: 10,
    },
  },
  'skill:courtcircuit': {
    actor: 'spin',
    carrier: { kind: 'beam', style: 'zig', color: c('hurt') },
    impact: {
      burst: { glyph: 'spark', color: CURRENT, n: 10 },
      tint: CURRENT,
      shake: 6,
    },
  },
  'skill:allerretour': {
    actor: 'dash',
    carrier: { kind: 'fly', prop: 'plane', path: 'boomerang', count: 2 },
    impact: { burst: { glyph: 'spark', color: PAPER, n: 4 }, shake: 4 },
  },
  'skill:bouture': {
    actor: 'sway',
    carrier: { kind: 'rain', prop: 'leaf', count: 5 },
    impact: { burst: { glyph: 'leaf', color: c('s-leaf'), n: 4 } },
  },
  'skill:desherbage': {
    actor: 'squash',
    carrier: { kind: 'wave', color: c('s-leaf'), prop: 'leaf' },
    impact: {
      burst: { glyph: 'leaf', color: c('s-leaf'), n: 8 },
      tint: c('s-leaf'),
    },
  },
  'skill:rempotage': {
    actor: 'rise',
    carrier: { kind: 'fly', prop: 'pot', path: 'high' },
    impact: {
      burst: { glyph: 'plus', color: c('s-leaf'), n: 8 },
      bubble: c('s-leaf'),
    },
  },
  'power:hint': {
    actor: 'none',
    carrier: { kind: 'fly', prop: 'lens', path: 'high' },
    impact: { burst: { glyph: 'star', color: c('gold'), n: 4 } },
  },
  'power:echo': {
    actor: 'none',
    carrier: { kind: 'rings', color: c('hat'), count: 4 },
    impact: { burst: { glyph: 'dot', color: c('hat'), n: 6 } },
  },
  'power:balm': {
    actor: 'none',
    carrier: { kind: 'rain', prop: 'drop', count: 8 },
    impact: { burst: { glyph: 'plus', color: c('hat'), n: 4 }, tint: c('hat') },
  },
  'power:blot': {
    actor: 'none',
    carrier: { kind: 'wave', color: c('s-book-b'), prop: 'blotter' },
    impact: { burst: { glyph: 'dot', color: c('s-book-b'), n: 8 } },
  },
  'item:cafe': {
    actor: 'none',
    carrier: { kind: 'fly', prop: 'cup', path: 'low', spin: 0.5 },
    impact: { burst: { glyph: 'plus', color: c('ok'), n: 6 } },
  },
  'item:gomme': {
    actor: 'none',
    carrier: { kind: 'fly', prop: 'eraser', path: 'zig' },
    impact: { burst: { glyph: 'dot', color: c('k-straw-band'), n: 5 } },
  },
  'item:buvard': {
    actor: 'none',
    carrier: { kind: 'fly', prop: 'blotter', path: 'drop' },
    impact: { burst: { glyph: 'bubble', color: c('s-book-b'), n: 5 } },
  },
  'item:reboot': {
    actor: 'none',
    carrier: { kind: 'fly', prop: 'power', path: 'high' },
    impact: {
      burst: { glyph: 'spark', color: c('ok'), n: 8 },
      bubble: c('ok'),
    },
  },
  guard: {
    actor: 'squash',
    carrier: { kind: 'none' },
    impact: { bubble: c('pip') },
  },
};

/* ---------- enemies: each kind throws its own thing, each move moves it its own way ---------- */
type Kind = TypeKey | BossKey;
const KIND_MOTION: Record<Kind, Motion> = {
  grib: 'wobble',
  fau: 'slide',
  mask: 'sway',
  spam: 'hop',
  cut: 'spin',
  deca: 'puff',
  pil: 'dash',
  din: 'stomp',
  kettle: 'squash',
  loop: 'whirl',
  dispatcher: 'flicker',
  allowall: 'loom',
  offschema: 'pulse',
  leak: 'drip',
};
const KIND_PROP: Record<Kind, PropKey> = {
  grib: 'blob',
  fau: 'fake',
  mask: 'mask',
  spam: 'envelope',
  cut: 'scissors',
  deca: 'cup',
  pil: 'hand',
  din: 'note',
  kettle: 'steam',
  loop: 'loop',
  dispatcher: 'plug',
  allowall: 'key',
  offschema: 'scroll',
  leak: 'wave',
};
const MOVE_PATH: Record<MoveKey, Path> = {
  hit: 'line',
  charge: 'line',
  big: 'high',
  area: 'low',
  smudge: 'arc',
  silence: 'zig',
  poison: 'arc',
  sleep: 'high',
  burn: 'low',
  steal: 'boomerang',
  mend: 'high',
  shield: 'line',
  fog: 'low',
  shuffle: 'zig',
  allow: 'line',
  shift: 'line',
  overflow: 'drop',
  spill: 'drop',
};
const MOVE_IMPACT: Record<MoveKey, Impact> = {
  hit: { burst: { glyph: 'star', color: c('hurt'), n: 5 }, shake: 4 },
  charge: { orbit: 'spark' },
  big: {
    burst: { glyph: 'star', color: c('hurt'), n: 9 },
    shake: 12,
    tint: c('hurt'),
  },
  area: { burst: { glyph: 'dot', color: c('hurt'), n: 6 }, shake: 6 },
  smudge: { burst: { glyph: 'drop', color: INK, n: 6 }, stamp: 'smudge' },
  silence: {
    stamp: 'mute',
    burst: { glyph: 'dot', color: c('st-silence'), n: 4 },
  },
  poison: {
    burst: { glyph: 'bubble', color: c('st-poison'), n: 7 },
    tint: c('st-poison'),
  },
  sleep: {
    burst: { glyph: 'z', color: c('st-sleep'), n: 4 },
    tint: c('st-sleep'),
  },
  burn: {
    burst: { glyph: 'flame', color: c('st-burn'), n: 8 },
    tint: c('st-burn'),
  },
  steal: { burst: { glyph: 'bang', color: c('gold'), n: 3 } },
  mend: { burst: { glyph: 'plus', color: c('hp'), n: 5 } },
  shield: { bubble: c('blade') },
  fog: { tint: c('fog') },
  shuffle: { burst: { glyph: 'sheet', color: PAPER, n: 6 }, shake: 3 },
  allow: { stamp: 'allow', bubble: c('gold') },
  shift: { burst: { glyph: 'spark', color: c('gold'), n: 8 }, tint: c('gold') },
  overflow: {
    burst: { glyph: 'z', color: c('b5-puddle'), n: 6 },
    tint: c('b5-puddle'),
  },
  spill: {
    burst: { glyph: 'bubble', color: c('b5-puddle'), n: 9 },
    tint: c('st-poison'),
    shake: 5,
  },
};

/** The recipe of an enemy's move. Moves that reach the whole party travel as a wave. */
export function moveRecipe(kind: string, move: MoveKey): Recipe {
  const k = kind as Kind;
  const prop = KIND_PROP[k] ?? 'blob';
  const reach = MOVES[move].reach;
  const carrier: Carrier =
    reach === 'all'
      ? { kind: 'wave', color: c('hurt'), prop }
      : reach === 'self' || reach === 'field'
        ? move === 'fog'
          ? { kind: 'wave', color: c('fog') }
          : { kind: 'rings', color: c('gold'), count: 2 }
        : { kind: 'fly', prop, path: MOVE_PATH[move] };
  return {
    actor: KIND_MOTION[k] ?? 'wobble',
    carrier,
    impact: MOVE_IMPACT[move],
  };
}

export const COUNTER_RECIPE: Recipe = {
  actor: 'lunge',
  carrier: { kind: 'none' },
  impact: { burst: { glyph: 'bang', color: c('hurt'), n: 4 }, shake: 6 },
};

/** The recipe of any action id. */
export function recipeOf(key: string): Recipe | null {
  if (key in PARTY_RECIPES)
    return PARTY_RECIPES[key as keyof typeof PARTY_RECIPES];
  if (key === 'counter') return COUNTER_RECIPE;
  if (key.startsWith('move:')) {
    const [, kind, move] = key.split(':');
    return moveRecipe(kind, move as MoveKey);
  }
  return null;
}

/** A recipe's identity, to check that no two actions look alike. */
export const recipeSignature = (r: Recipe): string => JSON.stringify(r);
