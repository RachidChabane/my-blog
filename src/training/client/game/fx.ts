/**
 * The animations of a fight, drawn in the scene's effect layer with the Web Animations
 * API: a recipe per action (fx-recipes.ts), and the small effects of hits, statuses and
 * phases. Under reduced motion every effect becomes a still badge that stays on the
 * target until the next action, so nothing is only shown in motion.
 */
import type { Element as El } from '../../domain/elements';
import type { StatusKey } from '../../domain/statuses';
import { elIcon, propSvg, stIcon } from './art';
import type { PropKey } from './art';
import type { Carrier, Glyph, Impact, Motion, Path } from './fx-recipes';
import { recipeOf } from './fx-recipes';
import { blip } from './sound';
import { G, $, beat, esc, pace, reduced } from './state';

export interface Pt {
  x: number;
  y: number;
  w: number;
  h: number;
}
export function ptOf(el: Element): Pt {
  const sc = $('scene').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left - sc.left + r.width / 2,
    y: r.top - sc.top + r.height / 2,
    w: r.width,
    h: r.height,
  };
}
const layer = () => $('fx');
/** Sizes of what flies and what bursts on impact, in pixels: big enough to follow on a phone. */
const PROP_SIZE = 44;
const BIT_SIZE = 20;
const BURST_REACH = 34;
const sceneBox = () => $('scene').getBoundingClientRect();

function put(
  html: string,
  cls: string,
  at: { x: number; y: number },
  size = 30
): HTMLElement {
  const d = document.createElement('div');
  d.className = `fxp ${cls}`;
  d.innerHTML = html;
  d.style.width = `${size}px`;
  d.style.height = `${size}px`;
  d.style.left = `${at.x - size / 2}px`;
  d.style.top = `${at.y - size / 2}px`;
  layer().appendChild(d);
  return d;
}
function animate(
  el: Element,
  frames: Keyframe[],
  ms: number,
  easing = 'ease-out'
): Promise<void> {
  if (G.hurry) return Promise.resolve();
  const a = el.animate(frames, {
    duration: pace(ms),
    easing,
    fill: 'forwards',
  });
  return a.finished.then(
    () => undefined,
    () => undefined
  );
}
const gone = (el: Element, after = 0): void => {
  setTimeout(() => el.remove(), pace(after));
};

/* ---------- glyphs: the small things a burst scatters ---------- */
const GLYPH: Record<Exclude<Glyph, PropKey>, (color: string) => string> = {
  dot: (c) =>
    `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="${c}"/></svg>`,
  spark: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M5 0l1.4 3.6L10 5 6.4 6.4 5 10 3.6 6.4 0 5l3.6-1.4z" fill="${c}"/></svg>`,
  z: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M1 1h8L1 9h8" fill="none" stroke="${c}" stroke-width="2"/></svg>`,
  plus: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M4 0h2v4h4v2H6v4H4V6H0V4h4z" fill="${c}"/></svg>`,
  star: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M5 0l1.5 3.2L10 3.6 7.4 6l.7 3.6L5 7.8 1.9 9.6 2.6 6 0 3.6l3.5-.4z" fill="${c}"/></svg>`,
  bubble: (c) =>
    `<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.6" fill="none" stroke="${c}" stroke-width="1.6"/></svg>`,
  flame: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M5 0c1 2 4 3 3 6a3 3 0 0 1-6 0c0-1 1-2 1-3 1 1 1 1 1 1 0-2 0-3 1-4z" fill="${c}"/></svg>`,
  shard: (c) =>
    `<svg viewBox="0 0 10 10"><path d="M1 9L4 1l5 4z" fill="${c}"/></svg>`,
  bang: (c) =>
    `<svg viewBox="0 0 10 10"><rect x="4" y="0" width="2.4" height="6.4" fill="${c}"/><rect x="4" y="7.6" width="2.4" height="2.4" fill="${c}"/></svg>`,
};
const glyphHtml = (g: Glyph, color: string) =>
  g in GLYPH ? GLYPH[g as keyof typeof GLYPH](color) : propSvg(g as PropKey);

/* ---------- the one acting: how they move ---------- */
function motionFrames(m: Motion, dx: number, dy: number): Keyframe[] {
  const t = (x: number, y: number, extra = '') => ({
    transform: `translate(${x}px, ${y}px) ${extra}`,
  });
  const n = Math.hypot(dx, dy) || 1;
  const ux = (dx / n) * 18;
  const uy = (dy / n) * 18;
  switch (m) {
    case 'lunge':
      return [t(0, 0), t(-ux * 0.3, -uy * 0.3), t(ux, uy), t(0, 0)];
    case 'hop':
      return [t(0, 0), t(0, -16), t(0, 0), t(0, -6), t(0, 0)];
    case 'spin':
      return [
        t(0, 0, 'rotate(0)'),
        t(0, -6, 'rotate(180deg)'),
        t(0, 0, 'rotate(360deg)'),
      ];
    case 'squash':
      return [
        t(0, 0, 'scale(1,1)'),
        t(0, 4, 'scale(1.25,.7)'),
        t(0, -4, 'scale(.85,1.2)'),
        t(0, 0, 'scale(1,1)'),
      ];
    case 'glow':
      return [
        { filter: 'none' },
        { filter: 'drop-shadow(0 0 8px var(--gold)) brightness(1.3)' },
        { filter: 'none' },
      ];
    case 'slide':
      return [t(0, 0), t(-14, 2), t(ux * 1.2, uy), t(0, 0)];
    case 'rise':
      return [
        t(0, 0),
        t(0, -12, 'scale(1.1)'),
        t(0, -12, 'scale(1.1)'),
        t(0, 0),
      ];
    case 'wobble':
      return [
        t(0, 0, 'rotate(0)'),
        t(0, 0, 'rotate(-12deg)'),
        t(0, 0, 'rotate(12deg)'),
        t(ux, uy, 'rotate(0)'),
        t(0, 0),
      ];
    case 'stomp':
      return [t(0, 0), t(0, -20), t(0, 4, 'scale(1.2,.8)'), t(0, 0)];
    case 'dash':
      return [t(0, 0), t(ux * 3, uy * 3, 'skewX(-12deg)'), t(0, 0)];
    case 'sway':
      return [
        t(0, 0, 'rotate(0)'),
        t(-6, 0, 'rotate(-8deg)'),
        t(6, 0, 'rotate(8deg)'),
        t(0, 0, 'rotate(0)'),
      ];
    case 'puff':
      return [
        t(0, 0, 'scale(1)'),
        t(0, 0, 'scale(1.18)'),
        t(0, 0, 'scale(.92)'),
        t(0, 0, 'scale(1)'),
      ];
    case 'whirl':
      return [
        t(0, 0, 'rotate(0)'),
        t(0, 0, 'rotate(-360deg) scale(1.1)'),
        t(0, 0, 'rotate(-720deg)'),
      ];
    case 'flicker':
      return [
        { opacity: 1 },
        { opacity: 0.2 },
        { opacity: 1 },
        { opacity: 0.3 },
        { opacity: 1 },
      ];
    case 'loom':
      return [t(0, 0, 'scale(1)'), t(0, 6, 'scale(1.3)'), t(0, 0, 'scale(1)')];
    case 'pulse':
      return [
        { filter: 'none', transform: 'scale(1)' },
        { filter: 'hue-rotate(120deg)', transform: 'scale(1.08)' },
        { filter: 'none', transform: 'scale(1)' },
      ];
    case 'drip':
      return [
        t(0, 0, 'scale(1,1)'),
        t(0, 6, 'scale(1.1,.85)'),
        t(0, -2, 'scale(.95,1.08)'),
        t(0, 0, 'scale(1,1)'),
      ];
    default:
      return [t(0, 0)];
  }
}
function moveActor(el: Element, m: Motion, to: Pt | null): Promise<void> {
  if (m === 'none') return Promise.resolve();
  const p = ptOf(el);
  const dx = to ? to.x - p.x : 0;
  const dy = to ? to.y - p.y : -1;
  return animate(el, motionFrames(m, dx, dy), 480, 'ease-in-out');
}

/* ---------- what travels ---------- */
function pathPoints(a: Pt, b: Pt, path: Path): { x: number; y: number }[] {
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  switch (path) {
    case 'arc':
      return [a, { x: mid.x, y: Math.min(a.y, b.y) - 50 }, b];
    case 'high':
      return [a, { x: a.x, y: a.y - 70 }, { x: b.x, y: b.y - 80 }, b];
    case 'low':
      return [a, { x: mid.x, y: Math.max(a.y, b.y) + 10 }, b];
    case 'zig':
      return [
        a,
        { x: mid.x - 20, y: mid.y - 24 },
        { x: mid.x + 20, y: mid.y + 20 },
        b,
      ];
    case 'drop':
      return [{ x: b.x, y: b.y - 120 }, { x: b.x, y: b.y - 40 }, b];
    case 'boomerang':
      return [a, b, { x: mid.x, y: mid.y - 30 }, b, a];
    default:
      return [a, b];
  }
}
async function fly(
  prop: PropKey,
  a: Pt,
  b: Pt,
  path: Path,
  spin = 0,
  count = 1
): Promise<void> {
  for (let i = 0; i < count; i++) {
    const pts = pathPoints(a, b, path);
    const el = put(propSvg(prop), 'fly', pts[0], PROP_SIZE);
    await animate(
      el,
      pts.map((p, k) => ({
        transform: `translate(${p.x - pts[0].x}px, ${p.y - pts[0].y}px) rotate(${spin * 360 * (k / (pts.length - 1))}deg)`,
      })),
      path === 'boomerang' ? 1000 : 720,
      'ease-in'
    );
    gone(el, 120);
  }
}
async function beam(a: Pt, b: Pt, style: string, color: string): Promise<void> {
  const box = sceneBox();
  let d = `M${a.x} ${a.y}`;
  const steps = 7;
  for (let i = 1; i <= steps; i++) {
    const x = a.x + ((b.x - a.x) * i) / steps;
    const y = a.y + ((b.y - a.y) * i) / steps;
    const off =
      style === 'zig' || style === 'noise'
        ? (i % 2 ? 10 : -10) * (i < steps ? 1 : 0)
        : 0;
    d += ` L${x + off} ${y - off}`;
  }
  const dash = style === 'dash' ? ' stroke-dasharray="6 6"' : '';
  const svg = document.createElement('div');
  svg.className = 'fxp beam';
  svg.innerHTML = `<svg viewBox="0 0 ${box.width} ${box.height}" width="${box.width}" height="${box.height}"><path d="${d}" fill="none" stroke="${color}" stroke-width="${style === 'noise' ? 6 : 4}" stroke-linecap="round"${dash}/></svg>`;
  svg.style.left = '0';
  svg.style.top = '0';
  layer().appendChild(svg);
  const path = svg.querySelector('path') as SVGPathElement;
  const len = path.getTotalLength?.() ?? 300;
  if (!dash) {
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
  }
  await animate(
    path,
    [{ strokeDashoffset: `${dash ? 60 : len}` }, { strokeDashoffset: '0' }],
    420,
    'linear'
  );
  if (style === 'noise')
    await animate(
      svg,
      [{ opacity: 1 }, { opacity: 0.3 }, { opacity: 1 }, { opacity: 0.2 }],
      300
    );
  gone(svg, 260);
}
async function rain(prop: PropKey, over: Pt[], count: number): Promise<void> {
  const all = over.flatMap((t) =>
    Array.from({ length: count }, (_, i) => {
      const x = t.x + (i - (count - 1) / 2) * (t.w / Math.max(2, count));
      const el = put(propSvg(prop), 'fly', { x, y: t.y - t.h / 2 - 60 }, 22);
      return animate(
        el,
        [
          { transform: 'translateY(0)', opacity: 0 },
          { transform: 'translateY(20px)', opacity: 1, offset: 0.3 },
          { transform: `translateY(${60 + t.h / 2}px)`, opacity: 0.9 },
        ],
        700 + i * 60,
        'ease-in'
      ).then(() => gone(el));
    })
  );
  await Promise.all(all);
}
async function wave(
  from: Pt,
  over: Pt[],
  color: string,
  prop?: PropKey
): Promise<void> {
  const box = sceneBox();
  const top = Math.min(...over.map((t) => t.y - t.h / 2)) - 10;
  const bottom = Math.max(...over.map((t) => t.y + t.h / 2)) + 10;
  const el = document.createElement('div');
  el.className = 'fxp wavefx';
  el.style.left = '0';
  el.style.top = `${top}px`;
  el.style.width = `${box.width}px`;
  el.style.height = `${bottom - top}px`;
  el.style.setProperty('--wc', color);
  if (prop)
    el.innerHTML = Array.from({ length: 4 }, () => propSvg(prop)).join('');
  layer().appendChild(el);
  const dir = from.x < box.width / 2 ? 1 : -1;
  await animate(
    el,
    [
      { transform: `translateX(${-dir * box.width}px)`, opacity: 0.2 },
      { transform: 'translateX(0)', opacity: 0.9 },
      { transform: `translateX(${dir * box.width * 0.4}px)`, opacity: 0 },
    ],
    760,
    'ease-out'
  );
  gone(el);
}
async function sweep(color: string): Promise<void> {
  const box = sceneBox();
  const el = document.createElement('div');
  el.className = 'fxp sweepfx';
  el.style.setProperty('--wc', color);
  el.style.height = `${box.height}px`;
  layer().appendChild(el);
  await animate(
    el,
    [
      { transform: 'translateX(-40px)' },
      { transform: `translateX(${box.width + 40}px)` },
    ],
    900,
    'linear'
  );
  gone(el);
}
async function rings(
  at: Pt,
  color: string,
  count: number,
  to?: Pt
): Promise<void> {
  const target = to ?? at;
  await Promise.all(
    Array.from({ length: count }, (_, i) => {
      const el = put('', 'ring', at, 20);
      el.style.borderColor = color;
      return new Promise<void>((r) => setTimeout(r, pace(i * 120))).then(() =>
        animate(
          el,
          [
            { transform: 'translate(0,0) scale(.4)', opacity: 1 },
            {
              transform: `translate(${target.x - at.x}px, ${target.y - at.y}px) scale(3)`,
              opacity: 0,
            },
          ],
          620
        ).then(() => gone(el))
      );
    })
  );
}

async function carry(cr: Carrier, a: Pt, to: Pt[]): Promise<void> {
  const first = to[0] ?? a;
  switch (cr.kind) {
    case 'fly':
      await Promise.all(
        to.map((b) => fly(cr.prop, a, b, cr.path, cr.spin ?? 0, cr.count ?? 1))
      );
      return;
    case 'beam':
      await Promise.all(to.map((b) => beam(a, b, cr.style, cr.color)));
      return;
    case 'rain':
      await rain(cr.prop, to.length ? to : [a], cr.count);
      return;
    case 'wave':
      await wave(a, to.length ? to : [a], cr.color, cr.prop);
      return;
    case 'sweep':
      await sweep(cr.color);
      return;
    case 'rings':
      await rings(a, cr.color, cr.count, first);
      return;
    default:
      return;
  }
}

/* ---------- the impact ---------- */
function burst(at: Pt, glyph: Glyph, color: string, n: number): Promise<void> {
  return Promise.all(
    Array.from({ length: n }, (_, i) => {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const r = BURST_REACH + (i % 3) * 14;
      const el = put(
        glyphHtml(glyph, color),
        'bit',
        at,
        glyph === 'z' ? BIT_SIZE + 4 : BIT_SIZE
      );
      return animate(
        el,
        [
          { transform: 'translate(0,0) scale(.6)', opacity: 1 },
          {
            transform: `translate(${Math.cos(ang) * r}px, ${Math.sin(ang) * r - (glyph === 'z' || glyph === 'bubble' ? 20 : 0)}px) scale(1)`,
            opacity: 0,
          },
        ],
        780
      ).then(() => gone(el));
    })
  ).then(() => undefined);
}
function shake(el: Element, amp: number): Promise<void> {
  return animate(
    el,
    [0, -1, 1, -0.6, 0.6, 0].map((k) => ({
      transform: `translateX(${k * amp}px)`,
    })),
    320,
    'linear'
  );
}
async function stampWord(at: Pt, key: string): Promise<void> {
  const el = put(
    `<span>${esc(G.c.stamps[key] ?? key)}</span>`,
    'stampword',
    { x: at.x, y: at.y - 6 },
    1
  );
  await animate(
    el,
    [
      {
        transform: 'translate(-50%,-50%) scale(2.2) rotate(-14deg)',
        opacity: 0,
      },
      {
        transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)',
        opacity: 1,
        offset: 0.35,
      },
      {
        transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)',
        opacity: 1,
        offset: 0.85,
      },
      { transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity: 0 },
    ],
    900
  );
  gone(el);
}
function tint(color: string): Promise<void> {
  const el = document.createElement('div');
  el.className = 'fxp tintfx';
  el.style.background = color;
  layer().appendChild(el);
  return animate(
    el,
    [{ opacity: 0 }, { opacity: 0.35 }, { opacity: 0 }],
    520
  ).then(() => {
    gone(el);
  });
}
function orbit(at: Pt, glyph: Glyph): Promise<void> {
  return Promise.all(
    [0, 1, 2].map((i) => {
      const el = put(
        glyphHtml(glyph, 'var(--gold)'),
        'bit',
        { x: at.x, y: at.y - at.h / 2 },
        14
      );
      return animate(
        el,
        Array.from({ length: 9 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + (i * Math.PI * 2) / 3;
          return {
            transform: `translate(${Math.cos(a) * 20}px, ${Math.sin(a) * 7}px)`,
          };
        }),
        900,
        'linear'
      ).then(() => gone(el));
    })
  ).then(() => undefined);
}
function bubbleOn(at: Pt, color: string): Promise<void> {
  const el = put('', 'shieldfx', at, Math.max(at.w, at.h) + 12);
  el.style.borderColor = color;
  return animate(
    el,
    [
      { transform: 'scale(.3)', opacity: 0 },
      { transform: 'scale(1.05)', opacity: 0.9 },
      { transform: 'scale(1)', opacity: 0 },
    ],
    700
  ).then(() => {
    gone(el);
  });
}

async function strike(im: Impact, targets: Element[]): Promise<void> {
  const jobs: Promise<void>[] = [];
  for (const t of targets) {
    const p = ptOf(t);
    if (im.burst)
      jobs.push(burst(p, im.burst.glyph, im.burst.color, im.burst.n));
    if (im.shake) jobs.push(shake(t, im.shake));
    if (im.stamp) jobs.push(stampWord(p, im.stamp));
    if (im.orbit) jobs.push(orbit(p, im.orbit));
    if (im.bubble) jobs.push(bubbleOn(p, im.bubble));
  }
  if (im.tint) jobs.push(tint(im.tint));
  await Promise.all(jobs);
}

/* ---------- still badges, under reduced motion ---------- */
export function clearStills(): void {
  layer()
    .querySelectorAll('.still')
    .forEach((n) => n.remove());
}
/** Badges never cover an enemy's name and health, and stay inside the scene. */
const STILL_MARGIN = 4;
function still(html: string, at: Pt, cls = ''): void {
  const el = document.createElement('div');
  el.className = `still ${cls}`;
  el.innerHTML = html;
  layer().appendChild(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const sc = sceneBox();
  const plates = [...G.root.querySelectorAll('.foe .plate')].map((p) => {
    const r = p.getBoundingClientRect();
    return {
      l: r.left - sc.left,
      r: r.right - sc.left,
      t: r.top - sc.top,
      b: r.bottom - sc.top,
    };
  });
  let left = at.x - w / 2;
  for (const p of plates)
    if (at.x < p.l && left + w > p.l - STILL_MARGIN)
      left = p.l - STILL_MARGIN - w;
  left = Math.min(Math.max(STILL_MARGIN, left), sc.width - w - STILL_MARGIN);
  /* the badge's bottom edge: above the target, else over its lower half, else its middle */
  const bottoms = [at.y - at.h / 2, at.y + at.h / 2, at.y + h / 2].map((b) =>
    Math.min(Math.max(h + STILL_MARGIN, b), sc.height - STILL_MARGIN)
  );
  const clear = (b: number) =>
    !plates.some((p) => left < p.r && left + w > p.l && b - h < p.b && b > p.t);
  const bottom = bottoms.find(clear) ?? bottoms[0];
  el.style.left = `${left}px`;
  el.style.top = `${bottom}px`;
}
const carrierProp = (cr: Carrier): PropKey | null =>
  cr.kind === 'fly' || cr.kind === 'rain'
    ? cr.prop
    : cr.kind === 'wave'
      ? (cr.prop ?? null)
      : null;

/**
 * Plays the animation of an action, from the one acting to its targets, with its sound.
 * Under reduced motion, a still badge naming the action stays on each target instead.
 */
export async function playAct(
  key: string,
  label: string,
  from: Element | null,
  to: Element[]
): Promise<void> {
  const r = recipeOf(key);
  if (!r) return;
  blip(key);
  if (reduced()) {
    const prop = carrierProp(r.carrier);
    const icon = prop ? propSvg(prop) : '';
    for (const t of to.length ? to : from ? [from] : [])
      still(`${icon}<b>${esc(label)}</b>`, ptOf(t), 'act');
    return;
  }
  const box = sceneBox();
  const a = from
    ? ptOf(from)
    : { x: box.width / 2, y: box.height - 10, w: 0, h: 0 };
  const tps = to.map(ptOf);
  const mover = from
    ? moveActor(from, r.actor, tps[0] ?? null)
    : Promise.resolve();
  await beat(120);
  await carry(r.carrier, a, tps);
  await strike(r.impact, to);
  await mover;
}

/* ---------- effects of the results ---------- */
/** A number that pops over a target and drifts up; it stays put under reduced motion. */
export function popNumber(on: Element, text: string, cls: string): void {
  const p = ptOf(on);
  const el = document.createElement('div');
  el.className = `pop ${cls}${reduced() ? ' still' : ''}`;
  el.textContent = text;
  el.style.left = `${p.x}px`;
  el.style.top = `${Math.max(16, p.y - p.h / 2 - 4)}px`;
  layer().appendChild(el);
  if (!reduced()) {
    void animate(
      el,
      [
        { transform: 'translate(-50%,0) scale(.5)', opacity: 0 },
        {
          transform: 'translate(-50%,-10px) scale(1.25)',
          opacity: 1,
          offset: 0.2,
        },
        {
          transform: 'translate(-50%,-18px) scale(1)',
          opacity: 1,
          offset: 0.8,
        },
        { transform: 'translate(-50%,-26px) scale(1)', opacity: 0 },
      ],
      1700
    ).then(() => el.remove());
  }
}
/** "Weak!" or "Resisted": a call-out stamped on the target. */
export function callout(on: Element, kind: 'weak' | 'resist' | 'miss'): void {
  const p = ptOf(on);
  blip(kind === 'weak' ? 'weak' : 'resist');
  if (reduced()) {
    still(
      `<b>${esc(G.c.stamps[kind])}</b>`,
      { ...p, y: p.y + p.h / 2 + 18, h: 0 },
      `call ${kind}`
    );
    return;
  }
  void stampWord({ ...p, y: p.y + p.h / 4 }, kind).then(() => undefined);
}
const STATUS_GLYPH: Partial<Record<StatusKey, Glyph>> = {
  poison: 'bubble',
  burn: 'flame',
  regen: 'leaf',
  sleep: 'z',
  stun: 'star',
};
/** A status taking effect, ticking, or ending on a target. */
export async function statusFx(
  on: Element,
  s: StatusKey,
  change: 'on' | 'tick' | 'off'
): Promise<void> {
  const p = ptOf(on);
  if (reduced()) {
    still(stIcon(s), { ...p, y: p.y - 12 }, `st st-${s} ${change}`);
    return;
  }
  const g = STATUS_GLYPH[s];
  if (change === 'off') {
    const el = put(stIcon(s), `stfx st-${s}`, { x: p.x, y: p.y - p.h / 2 }, 22);
    await animate(
      el,
      [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(1.8)' },
      ],
      520
    );
    gone(el);
    return;
  }
  if (s === 'stun') await orbit(p, 'star');
  else if (g)
    await burst(p, g, `var(--st-${s}, var(--gold))`, change === 'tick' ? 5 : 7);
  const el = put(
    stIcon(s),
    `stfx st-${s}`,
    { x: p.x, y: p.y - p.h / 2 - 6 },
    24
  );
  await animate(
    el,
    [
      { transform: 'translateY(8px) scale(.4)', opacity: 0 },
      { transform: 'translateY(0) scale(1.15)', opacity: 1 },
      { transform: 'translateY(-6px) scale(1)', opacity: 0 },
    ],
    640
  );
  gone(el);
}
export async function shieldFx(
  on: Element,
  change: 'on' | 'break' | 'expire'
): Promise<void> {
  const p = ptOf(on);
  if (reduced()) {
    still(stIcon('shield'), { ...p, y: p.y - 12 }, `st st-shield ${change}`);
    return;
  }
  if (change === 'on') await bubbleOn(p, 'var(--blade)');
  else await burst(p, 'shard', 'var(--blade)', change === 'break' ? 8 : 4);
}
export async function revealFx(on: Element, el: El): Promise<void> {
  const p = ptOf(on);
  if (reduced()) {
    still(elIcon(el), { ...p, y: p.y + p.h / 2 }, `reveal el-${el}`);
    return;
  }
  const n = put(elIcon(el), `revealfx el-${el}`, { x: p.x, y: p.y }, 34);
  await animate(
    n,
    [
      { transform: 'rotateY(90deg) scale(.6)', opacity: 0 },
      { transform: 'rotateY(0) scale(1.3)', opacity: 1 },
      { transform: 'translateY(30px) scale(.6)', opacity: 0 },
    ],
    900
  );
  gone(n);
}
/** A boss's phase change: the screen flashes, the boss swells, the room shakes. */
export async function phaseFx(on: Element): Promise<void> {
  blip('boom');
  if (reduced()) {
    still(`<b>${esc(G.c.stamps.phase)}</b>`, ptOf(on), 'call phase');
    return;
  }
  await Promise.all([
    tint('var(--hurt)'),
    animate(
      on,
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.35)', filter: 'brightness(1.6)', offset: 0.3 },
        { transform: 'scale(1.2)', filter: 'brightness(1.3)', offset: 0.6 },
        { transform: 'scale(1)' },
      ],
      1600
    ),
    shake($('scene'), 12).then(() => shake($('scene'), 8)),
    stampWord(ptOf(on), 'phase'),
  ]);
}
export async function downFx(on: Element): Promise<void> {
  if (reduced()) return;
  await animate(
    on,
    [
      { transform: 'none', opacity: 1 },
      { transform: 'translateY(10px) rotate(-90deg) scale(.8)', opacity: 0.35 },
    ],
    700,
    'ease-in'
  );
}
export async function upFx(on: Element): Promise<void> {
  if (reduced()) return;
  await Promise.all([
    animate(
      on,
      [
        {
          transform: 'translateY(10px) rotate(-90deg) scale(.8)',
          opacity: 0.35,
        },
        { transform: 'none', opacity: 1 },
      ],
      700
    ),
    burst(ptOf(on), 'spark', 'var(--ok)', 8),
  ]);
}
export async function fogFx(on: boolean): Promise<void> {
  $('scene').classList.toggle('fogged', on);
  if (reduced() || !on) return;
  await tint('var(--fog)');
}
export async function stealFx(from: Element, to: Element): Promise<void> {
  if (reduced()) return;
  await fly('hand', ptOf(from), ptOf(to), 'boomerang');
}
export async function missFx(on: Element): Promise<void> {
  callout(on, 'miss');
  if (!reduced()) await shake(on, 6);
}
export async function walkIn(on: Element): Promise<void> {
  if (reduced()) return;
  await animate(
    on,
    [
      { transform: 'translateX(120px)', opacity: 0 },
      { transform: 'none', opacity: 1 },
    ],
    700
  );
}
