/**
 * Sounds, synthesised with WebAudio: off until the player says yes, no file loaded.
 * Every action of a fight has its own short phrase (a timbre and a motif), keyed by
 * the same id as its animation and its name.
 */
import type { MoveKey, TypeKey } from '../../domain/foes';
import { G } from './state';

/** A phrase: a waveform, notes as [frequency, seconds], an optional slide and noise burst. */
export interface Phrase {
  wave: OscillatorType;
  notes: readonly (readonly [number, number])[];
  /** Each note glides to this factor of its frequency. */
  slide?: number;
  /** Seconds of filtered noise played with the first note. */
  noise?: number;
}

const P = (
  wave: OscillatorType,
  notes: readonly (readonly [number, number])[],
  o: { slide?: number; noise?: number } = {}
): Phrase => ({ wave, notes, ...o });

/* ---------- the interface's own blips ---------- */
const UI: Record<string, Phrase> = {
  ok: P('sine', [[660, 0.05]]),
  move: P('sine', [[520, 0.025]]),
  clank: P('square', [
    [330, 0.04],
    [311, 0.06],
  ]),
  free: P('sine', [
    [784, 0.06],
    [1046, 0.09],
  ]),
  level: P('triangle', [
    [523, 0.1],
    [659, 0.1],
    [784, 0.1],
    [1046, 0.2],
  ]),
  chest: P('triangle', [
    [392, 0.08],
    [523, 0.08],
    [659, 0.14],
  ]),
  boom: P(
    'triangle',
    [
      [98, 0.18],
      [73, 0.22],
    ],
    { noise: 0.2 }
  ),
  weak: P('square', [
    [880, 0.05],
    [1175, 0.08],
  ]),
  resist: P('square', [
    [220, 0.06],
    [196, 0.08],
  ]),
  tick: P(
    'sine',
    [
      [262, 0.08],
      [247, 0.1],
    ],
    { slide: 0.9 }
  ),
  hurt: P('triangle', [
    [196, 0.1],
    [147, 0.12],
  ]),
  heal: P('sine', [
    [523, 0.06],
    [784, 0.1],
  ]),
  join: P('triangle', [
    [392, 0.1],
    [523, 0.1],
    [659, 0.1],
    [784, 0.24],
  ]),
};

/* ---------- the party: one phrase per attack, skill, power and item ---------- */
const PARTY: Record<string, Phrase> = {
  'atk:hero': P(
    'triangle',
    [
      [523, 0.05],
      [392, 0.09],
    ],
    { slide: 0.8 }
  ),
  'atk:vigie': P('sine', [
    [1318, 0.04],
    [1318, 0.04],
    [1760, 0.06],
  ]),
  'atk:navette': P(
    'sawtooth',
    [
      [440, 0.03],
      [660, 0.03],
      [880, 0.05],
    ],
    { slide: 1.3 }
  ),
  'atk:moka': P('triangle', [[300, 0.14]], { slide: 0.6, noise: 0.12 }),
  'atk:tampon': P(
    'square',
    [
      [110, 0.06],
      [82, 0.08],
    ],
    { noise: 0.05 }
  ),
  'atk:arrosoir': P(
    'sine',
    [
      [700, 0.06],
      [600, 0.06],
      [500, 0.08],
    ],
    { noise: 0.08 }
  ),
  'skill:coulure': P(
    'sine',
    [
      [400, 0.08],
      [300, 0.08],
      [200, 0.12],
    ],
    { slide: 0.7 }
  ),
  'skill:relecture': P('triangle', [
    [587, 0.06],
    [698, 0.06],
    [880, 0.1],
  ]),
  'skill:balayage': P('sine', [[220, 0.5]], { slide: 4 }),
  'skill:brouillage': P(
    'sawtooth',
    [
      [150, 0.06],
      [160, 0.06],
      [150, 0.06],
    ],
    { noise: 0.2 }
  ),
  'skill:decharge': P(
    'sawtooth',
    [
      [1600, 0.04],
      [200, 0.18],
    ],
    { slide: 0.3, noise: 0.1 }
  ),
  'skill:espresso': P(
    'triangle',
    [
      [659, 0.06],
      [880, 0.06],
      [1046, 0.12],
    ],
    { noise: 0.06 }
  ),
  'skill:tournee': P('triangle', [
    [523, 0.08],
    [659, 0.08],
    [784, 0.08],
    [659, 0.08],
    [1046, 0.16],
  ]),
  'skill:ebouillanter': P('sawtooth', [[500, 0.24]], {
    slide: 1.8,
    noise: 0.2,
  }),
  'skill:provoc': P('square', [
    [988, 0.08],
    [988, 0.08],
  ]),
  'skill:visa': P(
    'square',
    [
      [196, 0.05],
      [392, 0.1],
    ],
    { noise: 0.04 }
  ),
  'skill:refuse': P(
    'square',
    [
      [150, 0.08],
      [100, 0.16],
    ],
    { noise: 0.1 }
  ),
  'skill:courtcircuit': P(
    'sawtooth',
    [
      [1200, 0.03],
      [300, 0.03],
      [1500, 0.03],
      [250, 0.05],
    ],
    { noise: 0.12 }
  ),
  'skill:allerretour': P(
    'sawtooth',
    [
      [500, 0.05],
      [900, 0.05],
      [500, 0.05],
      [900, 0.05],
    ],
    { slide: 1.4 }
  ),
  'skill:bouture': P(
    'sine',
    [
      [392, 0.08],
      [494, 0.08],
      [587, 0.14],
    ],
    { slide: 1.1 }
  ),
  'skill:desherbage': P(
    'triangle',
    [
      [330, 0.06],
      [440, 0.06],
    ],
    { noise: 0.14 }
  ),
  'skill:rempotage': P(
    'sine',
    [
      [262, 0.1],
      [392, 0.1],
      [523, 0.18],
    ],
    { slide: 1.05 }
  ),
  'power:hint': P('sine', [
    [1046, 0.05],
    [1318, 0.08],
  ]),
  'power:echo': P(
    'sine',
    [
      [660, 0.08],
      [660, 0.06],
      [660, 0.05],
    ],
    { slide: 0.9 }
  ),
  'power:balm': P('sine', [
    [440, 0.12],
    [554, 0.12],
    [659, 0.2],
  ]),
  'power:blot': P('triangle', [[600, 0.16]], { slide: 0.5, noise: 0.1 }),
  'item:cafe': P(
    'triangle',
    [
      [523, 0.05],
      [698, 0.1],
    ],
    { noise: 0.05 }
  ),
  'item:gomme': P('square', [
    [700, 0.03],
    [650, 0.03],
    [700, 0.03],
  ]),
  'item:buvard': P('sine', [[800, 0.14]], { slide: 0.6 }),
  'item:reboot': P('square', [
    [262, 0.06],
    [523, 0.06],
    [1046, 0.12],
  ]),
  guard: P('triangle', [
    [330, 0.06],
    [440, 0.1],
  ]),
  counter: P('square', [
    [180, 0.06],
    [120, 0.1],
  ]),
};

/* ---------- enemies: a timbre per kind, a motif per move ---------- */
/** A timbre per enemy kind, and per boss by the domain of its chapter. */
const TIMBRE: Record<TypeKey | string, { wave: OscillatorType; base: number }> =
  {
    grib: { wave: 'triangle', base: 196 },
    fau: { wave: 'square', base: 233 },
    mask: { wave: 'sine', base: 175 },
    spam: { wave: 'square', base: 311 },
    cut: { wave: 'sawtooth', base: 262 },
    deca: { wave: 'sine', base: 147 },
    pil: { wave: 'triangle', base: 277 },
    din: { wave: 'sawtooth', base: 131 },
    kettle: { wave: 'square', base: 349 },
    agentic_architecture: { wave: 'sawtooth', base: 110 },
    tool_design_mcp: { wave: 'square', base: 98 },
    claude_code: { wave: 'sawtooth', base: 123 },
    prompt_engineering: { wave: 'triangle', base: 92 },
    context_management: { wave: 'square', base: 82 },
    integration_reliability: { wave: 'sawtooth', base: 139 },
    agent_architecture: { wave: 'square', base: 117 },
    observability: { wave: 'sine', base: 87 },
    evaluation: { wave: 'triangle', base: 104 },
    guardrails_security: { wave: 'sawtooth', base: 156 },
    debugging_incidents: { wave: 'square', base: 185 },
    fleet_operations: { wave: 'triangle', base: 131 },
    cost_latency: { wave: 'sine', base: 165 },
  };
/** Each move's motif: intervals over the base, note length, slide, noise. */
const MOTIF: Record<
  MoveKey,
  { steps: number[]; len: number; slide?: number; noise?: number }
> = {
  hit: { steps: [1, 0.75], len: 0.08 },
  charge: { steps: [1, 1.12, 1.26, 1.41], len: 0.07 },
  big: { steps: [1.5, 0.5], len: 0.14, noise: 0.15 },
  area: { steps: [1, 1.5, 1, 1.5], len: 0.06, noise: 0.2 },
  smudge: { steps: [2, 1.8], len: 0.08, slide: 0.7 },
  silence: { steps: [3, 3], len: 0.05, noise: 0.08 },
  poison: { steps: [1.2, 1.1, 1], len: 0.1, slide: 0.9 },
  sleep: { steps: [2, 1.68, 1.5], len: 0.16 },
  burn: { steps: [1, 2], len: 0.16, slide: 1.5, noise: 0.2 },
  steal: { steps: [2.5, 3, 3.5], len: 0.04 },
  mend: { steps: [1, 1.25, 1.5], len: 0.08 },
  shield: { steps: [1, 2], len: 0.1 },
  fog: { steps: [0.5], len: 0.5, slide: 0.8, noise: 0.4 },
  shuffle: { steps: [1, 2, 1.5, 2.5, 1], len: 0.04 },
  allow: { steps: [1, 1.5, 2, 3], len: 0.06 },
  shift: { steps: [1, 1.19, 1.41, 1.68, 2], len: 0.05, slide: 1.2 },
  overflow: { steps: [2, 1.5, 1, 0.75], len: 0.12, noise: 0.3 },
  spill: { steps: [1.5, 1.2, 1, 0.8], len: 0.1, slide: 0.8, noise: 0.25 },
  unlog: { steps: [2, 1.5, 1, 0.5], len: 0.09, slide: 0.5 },
  refit: { steps: [1, 1.33, 1, 1.33], len: 0.07 },
  bill: { steps: [3, 2.5, 3], len: 0.05, noise: 0.05 },
  timeout: { steps: [2, 2, 2, 0.5], len: 0.11, noise: 0.35 },
};
export function movePhrase(kind: string, move: MoveKey): Phrase {
  const t = TIMBRE[kind as keyof typeof TIMBRE] ?? TIMBRE.grib;
  const m = MOTIF[move];
  return {
    wave: t.wave,
    notes: m.steps.map((s) => [t.base * s, m.len] as const),
    slide: m.slide,
    noise: m.noise,
  };
}

/** The phrase of an action id: a party action, an enemy move, or an interface blip. */
export function phraseOf(key: string): Phrase {
  if (PARTY[key]) return PARTY[key];
  if (key.startsWith('move:')) {
    const [, kind, move] = key.split(':');
    return movePhrase(kind, move as MoveKey);
  }
  return UI[key] ?? UI.ok;
}
let actx: AudioContext | null = null;
export function blip(key: string): void {
  if (!G.host.save.sound) return;
  try {
    actx = actx ?? new AudioContext();
    play(actx, phraseOf(key));
  } catch {
    /* audio unavailable */
  }
}

function play(ctx: AudioContext, p: Phrase): void {
  let t = ctx.currentTime + 0.01;
  if (p.noise) noise(ctx, t, p.noise);
  for (const [f, d] of p.notes) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = p.wave;
    o.frequency.setValueAtTime(f, t);
    if (p.slide) o.frequency.exponentialRampToValueAtTime(f * p.slide, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + d + 0.03);
    t += d * 0.9;
  }
}
function noise(ctx: AudioContext, t: number, d: number): void {
  const buf = ctx.createBuffer(
    1,
    Math.ceil(ctx.sampleRate * d),
    ctx.sampleRate
  );
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = 1200;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.02, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}
