/**
 * Characters and props, drawn in the pixel language of clawd() in src/office/draw.ts.
 * Every colour is a theme token of game.css, so both themes come from one drawing.
 */
import type { Element } from '../../domain/elements';
import type { BossKey, MoveKey, TypeKey } from '../../domain/foes';
import type { MemberKey } from '../../domain/party';
import type { DoorKey } from '../../domain/run';
import type { StatusKey } from '../../domain/statuses';

export const R = (x: number, y: number, w: number, h: number, f: string) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/>`;
export const svg = (inner: string, vb = '-1 -8 18 20') =>
  `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">${inner}</svg>`;
const V = (t: string) => `var(--${t})`;

/* ---------- the heroes ---------- */
interface BodyOpts {
  body?: string;
  beard?: boolean;
  wizard?: boolean;
  glasses?: boolean;
}
function clawdBody({
  body = V('c-body'),
  beard = false,
  wizard = false,
  glasses = false,
}: BodyOpts = {}): string {
  const K = V('c-ink');
  let s =
    R(2, 1, 12, 8, body) +
    R(0, 4, 2, 2, body) +
    R(14, 4, 2, 2, body) +
    R(5, 3, 1, 2, K) +
    R(10, 3, 1, 2, K);
  s += `<g class="legs">${R(3, 9, 1, 2, body) + R(5, 9, 1, 2, body)}</g><g class="legs b">${R(10, 9, 1, 2, body) + R(12, 9, 1, 2, body)}</g>`;
  if (beard) s += R(3.5, 5.6, 9, 3.4, V('beard')) + R(5, 9, 6, 1.6, V('beard'));
  if (glasses)
    s += `<g fill="none" stroke="${K}" stroke-width="0.4"><circle cx="5.5" cy="4" r="1.5"/><circle cx="10.5" cy="4" r="1.5"/><path d="M7 4H9"/></g>`;
  if (wizard) s += hat();
  return s;
}
const hat = () =>
  `<g class="hat"><path d="M2.5 1.2L8.6 -6.4L13.5 1.2Z" fill="${V('hat')}"/>${R(1, 0.6, 14, 1, V('hat'))}` +
  `<path d="M8.4 -2.6l.5 1 1.1.1-.8.8.2 1.1-1-.6-1 .6.2-1.1-.8-.8 1.1-.1z" fill="${V('star')}"/></g>`;

export const gloseSvg = () =>
  svg(clawdBody({ beard: true, wizard: true, glasses: true }));
export const heroSvg = () =>
  svg(
    clawdBody() +
      R(1, -0.6, 14, 1.6, V('scarf')) +
      R(12, 1, 2, 4, V('scarf')) +
      R(9, 6, 6, 4, V('satchel')) +
      R(9, 6, 6, 1, V('c-ink')) +
      `<path d="M3 -0.6 L6 -3.6 L6.8 -3 L4.4 -0.6Z" fill="${V('paper')}" stroke="${V('c-ink')}" stroke-width=".3"/>`
  );
const backBody = () =>
  R(2, 1, 12, 8, V('c-body')) +
  R(0, 4, 2, 2, V('c-body')) +
  R(14, 4, 2, 2, V('c-body')) +
  `<g class="legs">${R(3, 9, 1, 2, V('c-body')) + R(5, 9, 1, 2, V('c-body'))}</g><g class="legs b">${R(10, 9, 1, 2, V('c-body')) + R(12, 9, 1, 2, V('c-body'))}</g>`;
/** The party seen from behind, facing the enemies. */
export const heroBack = () =>
  svg(
    backBody() +
      R(1, 0, 14, 2, V('scarf')) +
      R(4, 2, 2, 4, V('scarf')) +
      `<path d="M3 2L13 8" stroke="${V('satchel')}" stroke-width="1.2"/>` +
      R(11, 6, 4, 3, V('satchel'))
  );
export const gloseBack = () =>
  svg(
    backBody() + R(1, 5, 2, 4, V('beard')) + R(13, 5, 2, 4, V('beard')) + hat()
  );
export const mokaSvg = () =>
  svg(
    clawdBody({ body: V('s-book-b') }) +
      R(3, 6, 10, 4, V('s-paper')) +
      R(4, 6, 8, 1, V('s-stamp')) +
      R(14, 2, 3, 3, V('s-paper')) +
      R(17, 3, 1, 1, V('s-paper')) +
      `<path class="steam" d="M15 1q-1-1 0-2M16.4 1q-1-1 0-2" stroke="${V('s-paper')}" stroke-width=".5" fill="none"/>`,
    '-1 -8 20 20'
  );
export const crownSvg = (fill = V('boss-crown')) =>
  `<svg viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg"><path d="M2 14 L2 5 L6 9 L10 2 L14 9 L18 5 L18 14 Z" fill="${fill}" stroke="${V('line')}" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

/* ---------- the six evil Clawd types ---------- */
function foeInner(type: TypeKey): string {
  const E = V('en-eye');
  const K = V('en-pupil');
  const xEyes = (c: string) =>
    `<g stroke="${c}" stroke-width=".7" stroke-linecap="square"><path d="M4.4 2.6l2.2 2.2M6.6 2.6l-2.2 2.2M9.4 2.6l2.2 2.2M11.6 2.6l-2.2 2.2"/></g>`;
  const c = (t: string) => V(`en-${t}`);
  switch (type) {
    case 'grib':
      return (
        R(2, 1, 12, 8, c('grib')) +
        R(0, 4, 2, 2, c('grib')) +
        R(14, 3, 2, 2, c('grib')) +
        R(3, 9, 1, 3, c('grib')) +
        R(6, 9, 1, 2, c('grib')) +
        R(9, 9, 1, 4, c('grib')) +
        R(12, 9, 1, 2, c('grib')) +
        R(9, 12.6, 2, 1, c('grib')) +
        xEyes(E) +
        `<path d="M3 7 q1.2 -1.6 2.4 0 t2.4 0 t2.4 0 t2.4 0" fill="none" stroke="${c('grib-2')}" stroke-width=".7"/>` +
        `<path d="M15 4 L17.2 -1.4" stroke="${E}" stroke-width=".9"/><path d="M17.2 -1.4 L17.6 -2.6" stroke="${c('grib-2')}" stroke-width=".9"/>`
      );
    case 'fau':
      return (
        R(2, 1, 12, 8, c('fau')) +
        R(0, 5, 2, 2, c('fau')) +
        R(14, 4, 2, 2, c('fau')) +
        R(4, 9, 1, 2, c('fau')) +
        R(11, 9, 1, 2, c('fau')) +
        R(4, -3, 8, 4, K) +
        R(2.5, 0.4, 11, 1, K) +
        R(4, -1, 8, 0.8, c('fau-2')) +
        R(5, 3, 1, 2, E) +
        `<circle cx="10.5" cy="4" r="1.7" fill="${E}" stroke="${V('blade')}" stroke-width=".5"/>` +
        R(10.2, 3.4, 0.8, 1.2, K) +
        `<path d="M12 5.6 L12.6 9" stroke="${V('blade')}" stroke-width=".3"/>` +
        `<path d="M4.4 6.6 q1.8 -1 3.6 0 q1.8 -1 3.6 0 q-1.8 1.6 -3.6 .2 q-1.8 1.4 -3.6 -.2Z" fill="${K}"/>` +
        `<path d="M16 4 q2 -4 0.6 -8 q-1.4 3 -.6 8Z" fill="${c('fau-2')}"/>`
      );
    case 'cut':
      return (
        R(2, 2, 12, 7, c('cut')) +
        R(4, 9, 1, 2, c('cut')) +
        R(11, 9, 1, 2, c('cut')) +
        `<path d="M4.2 3.4 L6.8 4.4 L6.8 5 L4.2 4.6Z M11.8 3.4 L9.2 4.4 L9.2 5 L11.8 4.6Z" fill="${E}"/>` +
        `<g fill="none" stroke="${V('blade')}" stroke-width=".8"><circle cx="-0.6" cy="7" r="1"/><circle cx="1" cy="8.2" r="1"/><circle cx="16.6" cy="7" r="1"/><circle cx="15" cy="8.2" r="1"/></g>` +
        `<path d="M0 6.2 L-2.6 0.4 L0.4 5.6Z M1.4 7.4 L1.2 0 L2 6.8Z M16 6.2 L18.6 0.4 L15.6 5.6Z M14.6 7.4 L14.8 0 L14 6.8Z" fill="${V('blade')}"/>` +
        `<path d="M3 9.6 q-3 2 -1 3.6" fill="none" stroke="${V('gold')}" stroke-width=".5"/>` +
        R(6.5, 6.6, 3, 0.8, c('cut-2'))
      );
    case 'mask':
      return (
        R(2, 1, 12, 8, c('mask')) +
        R(0, 4, 2, 2, c('mask')) +
        R(14, 4, 2, 2, c('mask')) +
        R(3, 9, 1, 2, c('mask')) +
        R(5, 9, 1, 2, c('mask')) +
        R(10, 9, 1, 2, c('mask')) +
        R(12, 9, 1, 2, c('mask')) +
        `<path d="M1.6 2.2 Q8 0.6 14.4 2.2 L14 5.4 Q11.5 6.8 8 5.2 Q4.5 6.8 2 5.4Z" fill="${c('mask-face')}"/>` +
        `<path d="M4 3.6 L6.8 3.2 L6.2 4.4Z M12 3.6 L9.2 3.2 L9.8 4.4Z" fill="${K}"/>` +
        `<path d="M14.4 2.6 q2 .6 2.4 3 M14.4 3 q1.4 1.4 1 3.6" fill="none" stroke="${c('mask-2')}" stroke-width=".5"/>` +
        `<path d="M5.4 7.4 q2.6 1.2 5.2 0" fill="none" stroke="${c('mask-face')}" stroke-width=".5"/>`
      );
    case 'pil':
      return (
        `<path d="M2 1 H14 V9 L12.6 8 L11.2 9.4 L9.6 8.2 L8 9.4 L6.4 8.2 L4.8 9.4 L3.4 8 L2 9Z" fill="${c('pil')}"/>` +
        R(0, 4, 2, 2, c('pil')) +
        R(14, 4, 2, 2, c('pil')) +
        R(4, 9, 1, 2, c('pil')) +
        R(11, 9, 1, 2, c('pil')) +
        R(2, 2.4, 12, 1.8, c('mask-2')) +
        R(4.6, 2.8, 1.6, 1, E) +
        R(9.8, 2.8, 1.6, 1, E) +
        R(5, 3, 0.8, 0.8, K) +
        R(10.2, 3, 0.8, 0.8, K) +
        `<path d="M14 2.4 l2.4 -1 l-.4 1.6Z" fill="${c('mask-2')}"/>` +
        `<path d="M-2 5 q-1 4 1.6 5 q3 0 2.4 -4Z" fill="${c('pil-2')}"/>` +
        `<path d="M-1.6 4.6 l1.4 -2.4 l1.6 .6 l-.6 2.4Z" fill="${V('scrap')}" stroke="${K}" stroke-width=".2"/>`
      );
    case 'din':
      return (
        R(2, 2, 12, 7, c('din')) +
        R(0, 4, 2, 3, c('din')) +
        R(14, 4, 2, 3, c('din')) +
        R(4, 9, 1, 2, c('din')) +
        R(11, 9, 1, 2, c('din')) +
        R(4, 3, 2, 1, E) +
        R(10, 3, 2, 1, E) +
        R(5, 5, 6, 3, K) +
        R(6, 5, 1, 1, E) +
        R(9, 5, 1, 1, E) +
        R(6.5, 7, 3, 1, c('din-2')) +
        `<g class="waves" fill="none" stroke="${c('din-2')}" stroke-width=".8"><path d="M17 3q2 2.5 0 5M19 1.5q3 4 0 8"/><path d="M-1 3q-2 2.5 0 5M-3 1.5q-3 4 0 8"/></g>`
      );
    case 'spam':
      return (
        R(2, 1, 12, 8, c('spam')) +
        R(0, 4, 2, 2, c('spam')) +
        R(14, 4, 2, 2, c('spam')) +
        R(4, 9, 1, 2, c('spam')) +
        R(7, 9, 1, 2, c('spam')) +
        R(11, 9, 1, 2, c('spam')) +
        `<path d="M2 1.2 L8 6 L14 1.2" fill="none" stroke="${c('spam-2')}" stroke-width=".8"/>` +
        R(4.4, 3, 1.4, 1.4, E) +
        R(10.2, 3, 1.4, 1.4, E) +
        R(4.8, 3.4, 0.7, 0.7, K) +
        R(10.6, 3.4, 0.7, 0.7, K) +
        `<circle cx="14.6" cy="0.4" r="2" fill="${V('hurt')}" stroke="${V('en-rim')}" stroke-width=".3"/>` +
        R(14.3, -0.9, 0.6, 1.6, E) +
        R(14.3, 1.1, 0.6, 0.5, E) +
        `<path d="M-2.6 -1.4h3.6v2.4h-3.6z M-2.6 -1.4l1.8 1.3 1.8-1.3" fill="${V('scrap')}" stroke="${c('spam-2')}" stroke-width=".3"/>`
      );
    case 'deca':
      return (
        R(2, 2, 12, 7, c('deca')) +
        R(2, 1, 12, 1, c('deca-2')) +
        `<path d="M14 3.4h2.2a1.6 1.6 0 0 1 0 3.2H14" fill="none" stroke="${c('deca')}" stroke-width="1.1"/>` +
        R(0, 5, 2, 2, c('deca')) +
        R(4, 9, 1, 2, c('deca')) +
        R(11, 9, 1, 2, c('deca')) +
        R(4.2, 4.4, 2.4, 0.6, E) +
        R(9.4, 4.4, 2.4, 0.6, E) +
        R(6.4, 6.6, 3.2, 0.8, K) +
        `<path class="steam" d="M5 0q-1-1.2 0-2.4M8 0q-1-1.2 0-2.4M11 0q-1-1.2 0-2.4" fill="none" stroke="${c('deca-2')}" stroke-width=".5"/>` +
        `<g fill="${E}" font-weight="800" font-size="2.4"><text x="15" y="-1.6">z</text><text x="17" y="-3.4" font-size="1.8">z</text></g>`
      );
    case 'kettle':
      return (
        `<path d="M2 9 Q1 3 4 2 H12 Q15 3 14 9 Z" fill="${c('kettle')}"/>` +
        R(6.5, 0.4, 3, 1.6, c('kettle-2')) +
        R(7.4, -0.6, 1.2, 1, K) +
        `<path d="M14 5 L18 2.6 L18.4 3.6 L14.6 7" fill="${c('kettle')}"/>` +
        `<path d="M1 4 q-2.4 2.4 0 4.6" fill="none" stroke="${c('kettle-2')}" stroke-width=".9"/>` +
        R(4, 9, 1, 2, c('kettle')) +
        R(11, 9, 1, 2, c('kettle')) +
        `<path d="M4.4 3.6 L6.8 4.4 L6.8 5 L4.4 4.6Z M11.6 3.6 L9.2 4.4 L9.2 5 L11.6 4.6Z" fill="${E}"/>` +
        R(6, 6.4, 4, 0.8, K) +
        `<path class="steam" d="M18.6 1.6q1.4-1.4 0-2.8q-1.4-1.4 0-2.8" fill="none" stroke="${V('scrap')}" stroke-width=".6"/>`
      );
  }
}
export function foeSvg(type: TypeKey): string {
  return svg(foeInner(type), '-4 -4 24 18');
}

/* ---------- five bosses, one per exam domain ---------- */
const BOSS_ART: Record<BossKey, () => string> = {
  // The Endless Loop: a ring-shaped body chasing its own arrow
  loop: () =>
    `<circle cx="10" cy="9" r="7.5" fill="none" stroke="${V('b1-body')}" stroke-width="4"/>` +
    `<path d="M15 2.5L19 1.5L17.6 5.6Z" fill="${V('b1-body')}"/>` +
    R(-1, 7, 3, 2, V('b1-body')) +
    R(18, 9, 3, 2, V('b1-body')) +
    R(3, 15, 2, 4, V('b1-body')) +
    R(14, 15, 2, 4, V('b1-body')) +
    R(6.5, 7, 2, 2.4, V('en-eye')) +
    R(11.5, 7, 2, 2.4, V('en-eye')) +
    R(7, 7.6, 1, 1.4, V('en-pupil')) +
    R(12, 7.6, 1, 1.4, V('en-pupil')) +
    `<path d="M8 12.4q2 1.4 4 0" stroke="${V('en-eye')}" stroke-width=".6" fill="none"/>` +
    `<path class="spin" d="M10 4.5a4.5 4.5 0 1 1 -4.5 4.5" stroke="${V('b1-trace')}" stroke-width=".8" fill="none"/>`,
  // The Allow-All: a grinning doorman, padlock sprung open, a ring of every key
  allowall: () =>
    R(3, 3, 14, 13, V('b2-coat')) +
    R(1, 7, 2, 5, V('b2-coat')) +
    R(17, 7, 2, 5, V('b2-coat')) +
    R(5, 16, 3, 3, V('b2-coat')) +
    R(12, 16, 3, 3, V('b2-coat')) +
    R(5, 4.6, 10, 5.4, V('b2-face')) +
    R(4, 1, 12, 2.4, V('b2-cap')) +
    R(3, 3, 14, 1, V('en-pupil')) +
    R(9, 1.4, 2, 1.2, V('boss-crown')) +
    R(6.5, 5.6, 2, 2, V('en-eye')) +
    R(11.5, 5.6, 2, 2, V('en-eye')) +
    R(7.2, 6.2, 1, 1, V('en-pupil')) +
    R(12.2, 6.2, 1, 1, V('en-pupil')) +
    `<path d="M7 8.2q3 2 6 0" stroke="${V('en-pupil')}" stroke-width=".7" fill="none"/>` +
    R(7.5, 11.4, 5, 4, V('boss-crown')) +
    `<path d="M8.6 11.4V9.6a1.6 1.6 0 0 1 3.2 0V8.8" stroke="${V('blade')}" stroke-width=".8" fill="none"/>` +
    R(9.6, 12.6, 0.8, 1.6, V('en-pupil')) +
    `<circle cx="20.4" cy="13" r="2" stroke="${V('s-brass')}" stroke-width=".6" fill="none"/>` +
    R(19.4, 14.6, 0.6, 3, V('s-brass')) +
    R(20.6, 14.8, 0.6, 3.4, V('s-brass')) +
    R(21.8, 14.4, 0.6, 2.6, V('s-brass')) +
    R(19.2, 17.2, 1.2, 0.6, V('s-brass')) +
    R(20.4, 17.8, 1.2, 0.6, V('s-brass')),
  // Sir Off-Schema: a robed scholar under a teetering tower of prose, spiral eyes
  offschema: () =>
    R(3, 4, 14, 12, V('b3-robe')) +
    R(1, 8, 2, 4, V('b3-robe')) +
    R(17, 8, 2, 4, V('b3-robe')) +
    R(4, 16, 3, 3, V('b3-robe')) +
    R(13, 16, 3, 3, V('b3-robe')) +
    R(5, 6, 10, 5, V('b3-face')) +
    `<g fill="none" stroke="${V('en-pupil')}" stroke-width=".6"><path d="M7 8.5a1 1 0 1 1 1 1a1.6 1.6 0 1 1 -1.6 -1.6"/><path d="M12 8.5a1 1 0 1 1 1 1a1.6 1.6 0 1 1 -1.6 -1.6"/></g>` +
    R(2, 3, 16, 1.4, V('en-pupil')) +
    R(6, 1, 8, 2, V('en-pupil')) +
    R(5, -2, 10, 3, V('s-book-a')) +
    R(7, -5, 8, 3, V('s-book-c')) +
    R(4, -8, 11, 3, V('s-book-b')) +
    R(8, -10, 6, 2, V('s-book-d')) +
    R(8, 12, 4, 4, V('b3-face')) +
    `<path d="M-2 10l2 -2M-2 8l2 2M21 12l1.6 -1.6M21 10.4l1.6 1.6" stroke="${V('b3-face')}" stroke-width=".6"/>`,
  // The Blind Dispatcher: a switchboard operator, blindfolded, plug in hand
  dispatcher: () =>
    R(3, 4, 14, 12, V('b4-robe')) +
    R(1, 9, 2, 4, V('b4-robe')) +
    R(17, 7, 2, 4, V('b4-robe')) +
    R(5, 16, 3, 3, V('b4-robe')) +
    R(12, 16, 3, 3, V('b4-robe')) +
    R(4, 1, 12, 3, V('b4-hair')) +
    R(3.5, 6, 13, 2.2, V('b4-band')) +
    R(16, 6.4, 3, 1, V('b4-band')) +
    R(17.4, 7.2, 2, 1, V('b4-band')) +
    `<path d="M8 11q2 -1 4 0" stroke="${V('en-eye')}" stroke-width=".6" fill="none"/>` +
    `<path d="M3 4a7 5 0 0 1 14 0" stroke="${V('s-metal-d')}" stroke-width=".9" fill="none"/>` +
    R(2, 4, 2, 3, V('s-metal')) +
    `<path d="M3 7q0 3 3 3.4" stroke="${V('s-metal-d')}" stroke-width=".5" fill="none"/>` +
    R(5.6, 10, 1.4, 1, V('s-metal')) +
    `<path d="M18 8q4 0 4.6 -4" stroke="${V('s-cable')}" stroke-width="1" fill="none"/>` +
    R(21.4, 0.6, 2.6, 3, V('s-metal')) +
    R(21.8, -0.6, 0.6, 1.2, V('s-brass')) +
    R(23, -0.6, 0.6, 1.2, V('s-brass')),
  // The Memory Leak: a leaking tank with a valve and a spreading puddle
  leak: () =>
    `<ellipse cx="10" cy="18.6" rx="10" ry="1.6" fill="${V('b5-puddle')}"/>` +
    R(3, 2, 14, 15, V('b5-tank')) +
    R(3, 6, 14, 1, V('s-metal-d')) +
    R(3, 12, 14, 1, V('s-metal-d')) +
    R(6, 3.6, 2.4, 2, V('en-eye')) +
    R(11.6, 3.6, 2.4, 2, V('en-eye')) +
    R(7, 4, 1, 1.4, V('en-pupil')) +
    R(12.6, 4, 1, 1.4, V('en-pupil')) +
    R(9, -1, 2, 3, V('s-pipe')) +
    R(6, -2, 8, 1.4, V('b5-valve')) +
    R(17, 8, 4, 2, V('s-pipe')) +
    R(-1, 9, 4, 2, V('s-pipe')) +
    `<path class="drip" d="M20.6 10.4q.8 1.6 0 2.2q-.8-.6 0-2.2z" fill="${V('b5-puddle')}"/><path d="M6 17v1.6M14 17v1.4" stroke="${V('b5-puddle')}" stroke-width="1"/>`,
};
const BOSS_COLOR: Record<BossKey, string> = {
  loop: 'b1-body',
  allowall: 'b2-coat',
  offschema: 'b3-robe',
  dispatcher: 'b4-robe',
  leak: 'b5-tank',
};
export const bossSvg = (k: BossKey) => svg(BOSS_ART[k](), '-5 -11 30 32');
export const bossColor = (k: BossKey) => V(BOSS_COLOR[k]);

/* ---------- interface icons ---------- */
const ICON = {
  glose:
    '<path d="M4 20L12 3L20 20Z" fill="currentColor"/><path d="M12 8l1 2 2 .2-1.5 1.4.4 2.2-1.9-1-1.9 1 .4-2.2L9 10.2l2-.2z" fill="var(--star)"/>',
  garde:
    '<path d="M12 2L20 5V11C20 16 16.5 20 12 22C7.5 20 4 16 4 11V5Z" fill="currentColor"/>',
  sac: '<path d="M7 8h10l2 13H5Z" fill="currentColor"/><path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" stroke-width="2" fill="none"/>',
  boon: '<path d="M12 2C14 7 19 9 17 15A5 5 0 0 1 7 15C6 11 9 10 9 6C11 8 12 6 12 2Z" fill="currentColor"/>',
  skills:
    '<path d="M12 2l2.5 6.5L21 9l-5 4.5L17.5 21 12 17l-5.5 4L8 13.5 3 9l6.5-.5z" fill="currentColor"/>',
  team: '<circle cx="8" cy="8" r="3.5" fill="currentColor"/><circle cx="16" cy="8" r="3.5" fill="currentColor"/><path d="M2 20c0-4 3-7 6-7s6 3 6 7zM10 20c0-4 3-7 6-7s6 3 6 7z" fill="currentColor"/>',
  options:
    '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4M4 4l3 3M17 17l3 3M4 20l3-3M17 7l3-3" stroke="currentColor" stroke-width="2.4"/>',
  token: '<path d="M12 2l8 10-8 10-8-10z" fill="currentColor"/>',
  fuir: '<path d="M10 4l-8 8 8 8v-5h12V9H10z" fill="currentColor"/>',
  back: '<path d="M10 4l-8 8 8 8v-5h12V9H10z" fill="currentColor"/>',
  sheets:
    '<path d="M6 3h11a2 2 0 0 1 2 2v16H8a2 2 0 0 1-2-2Z" fill="currentColor"/><path d="M3 6v14a2 2 0 0 0 2 2h11" stroke="currentColor" stroke-width="2" fill="none"/><path d="M9 8h7M9 12h7M9 16h4" stroke="var(--zone)" stroke-width="2"/>',
  reset:
    '<path d="M12 4a8 8 0 1 1-8 8h3a5 5 0 1 0 5-5v3L7 5l5-5z" fill="currentColor"/>',
  arrow: '<path d="M4 10h11V5l7 7-7 7v-5H4z" fill="currentColor"/>',
  film: '<path d="M3 5h18v14H3z" fill="currentColor"/><path d="M5 7h2M5 11h2M5 15h2M17 7h2M17 11h2M17 15h2" stroke="var(--zone)" stroke-width="2"/><path d="M10 9l5 3-5 3z" fill="var(--zone)"/>',
  skip: '<path d="M3 5l9 7-9 7zM12 5l9 7-9 7z" fill="currentColor"/>',
  close:
    '<path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="3" stroke-linecap="square" fill="none"/>',
  help: '<path d="M9 9a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.9V15" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="square"/><rect x="10.6" y="17.4" width="2.8" height="2.8" fill="currentColor"/>',
};
export type IconKey = keyof typeof ICON;
export const icon24 = (k: IconKey) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

/* ---------- doors: a framed plank door with an emblem plate ---------- */
const EMBLEM: Record<DoorKey, string> = {
  combat:
    R(11, 9, 2, 8, V('blade')) +
    R(9, 15, 6, 1.4, V('s-brass')) +
    R(11.3, 16.4, 1.4, 2, V('s-wood-d')),
  elite: `<path d="M8 17V11l2 2 2-4 2 4 2-2v6z" fill="${V('boss-crown')}"/>`,
  cafe:
    R(9, 12, 5, 5, V('s-paper')) +
    R(14, 13, 1.6, 2.4, V('s-paper')) +
    R(9, 12, 5, 1, V('s-wood-d')) +
    `<path class="steam" d="M10.4 11q-1 -1 0 -2M12.6 11q-1 -1 0 -2" stroke="${V('s-paper')}" stroke-width=".6" fill="none"/>`,
  coffre:
    R(8.5, 12.5, 7, 5, V('s-wood')) +
    R(8.5, 11, 7, 2, V('s-wood-d')) +
    R(11.4, 12.4, 1.2, 2, V('s-brass')),
  boss:
    `<path d="M8 17V11l2 2 2-4 2 4 2-2v6z" fill="${V('boss-crown')}"/>` +
    R(8, 17, 8, 1, V('s-stamp')),
};
const DOOR_LEAF: Record<DoorKey, string> = {
  combat: V('s-wood'),
  elite: V('door-elite'),
  cafe: V('door-cafe'),
  coffre: V('s-wood'),
  boss: V('door-boss'),
};
export function doorSvg(k: DoorKey): string {
  const leaf = DOOR_LEAF[k];
  return (
    `<svg viewBox="0 0 24 28" aria-hidden="true" shape-rendering="crispEdges">` +
    R(1, 1, 22, 27, V('line')) +
    R(2, 2, 20, 26, V('s-wood-d')) +
    R(4, 4, 16, 24, leaf) +
    R(8, 4, 0.8, 24, V('door-grain')) +
    R(15.2, 4, 0.8, 24, V('door-grain')) +
    R(4, 4, 16, 1, V('door-grain')) +
    R(17, 18, 2, 2, V('s-brass')) +
    R(7, 8, 10, 11, V('door-plate')) +
    R(7, 8, 10, 1, V('line')) +
    EMBLEM[k] +
    `</svg>`
  );
}

/* ---------- the chest: closed, lid lifting, open with light inside ---------- */
const chestBody = () =>
  R(3, 26, 26, 1.6, V('s-shadow')) +
  R(2, 13, 28, 14, V('line')) +
  R(3, 14, 26, 12, V('s-wood')) +
  R(3, 18, 26, 1, V('s-wood-d')) +
  R(3, 22, 26, 1, V('s-wood-d')) +
  R(6, 14, 3, 12, V('s-brass')) +
  R(23, 14, 3, 12, V('s-brass')) +
  R(6, 25, 3, 1, V('s-brass-d')) +
  R(23, 25, 3, 1, V('s-brass-d'));
const closedLid = () =>
  `<g class="lid">` +
  R(2, 5, 28, 9, V('line')) +
  R(6, 3, 20, 2, V('line')) +
  R(3, 6, 26, 7, V('s-wood-d')) +
  R(7, 4, 18, 2, V('s-wood-d')) +
  R(3, 6, 26, 1, V('s-wood')) +
  R(6, 4, 3, 9, V('s-brass')) +
  R(23, 4, 3, 9, V('s-brass')) +
  R(3, 12, 26, 1, V('s-brass-d')) +
  `</g>` +
  R(13.5, 11, 5, 6, V('line')) +
  R(14, 11.5, 4, 5, V('s-brass')) +
  R(15.5, 13, 1, 2, V('line'));
const openLid = () =>
  R(2, 0, 28, 8, V('line')) +
  R(3, 1, 26, 6, V('s-wood-d')) +
  R(4, 2, 24, 4, V('chest-in')) +
  R(6, 0, 3, 8, V('s-brass')) +
  R(23, 0, 3, 8, V('s-brass')) +
  R(2, 8, 28, 6, V('line')) +
  R(3, 9, 26, 4, V('chest-in')) +
  R(6, 10, 4, 3, V('gold')) +
  R(11, 8, 5, 5, V('s-paper')) +
  R(12, 9, 3, 0.8, V('s-ink-soft')) +
  R(12, 10.6, 2, 0.8, V('s-ink-soft')) +
  R(17, 9, 5, 4, V('s-paper')) +
  R(18, 10, 3, 0.8, V('s-ink-soft')) +
  R(23, 10, 3, 3, V('gold')) +
  R(13.5, 13, 5, 3, V('s-brass'));
export function chestSvg(open: boolean): string {
  const glow = open
    ? `<defs><radialGradient id="cg" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="var(--chest-glow)" stop-opacity=".95"/><stop offset="1" stop-color="var(--chest-glow)" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse class="cglow" cx="16" cy="9" rx="17" ry="10" fill="url(#cg)"/>` +
      [5, 11, 16, 21, 27]
        .map(
          (x, i) =>
            `<rect class="spark s${i}" x="${x}" y="${6 - (i % 2) * 2}" width="1.4" height="1.4" fill="${V('gold')}"/>`
        )
        .join('')
    : '';
  return `<svg viewBox="-2 -6 36 34" aria-hidden="true" shape-rendering="crispEdges">${glow}${chestBody()}${open ? openLid() : closedLid()}</svg>`;
}

/** Moka's counter, for the café room. */
export function cafeSvg(): string {
  return (
    `<svg viewBox="0 0 60 40" aria-hidden="true" shape-rendering="crispEdges">` +
    `<g transform="translate(20 1) scale(1.3)">${mokaSvg().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>` +
    R(0, 24, 60, 3, V('line')) +
    R(1, 25, 58, 2, V('s-wood')) +
    R(2, 27, 56, 12, V('s-wood-d')) +
    R(2, 31, 56, 1, V('s-wood')) +
    [8, 44]
      .map(
        (x) =>
          R(x, 18, 7, 6, V('s-paper')) +
          R(x + 7, 19, 2, 3, V('s-paper')) +
          R(x, 18, 7, 1.4, V('s-wood-d')) +
          `<path class="steam" d="M${x + 2} 16q-1.4 -1.4 0 -3M${x + 5} 16q-1.4 -1.4 0 -3" stroke="${V('s-paper')}" stroke-width=".8" fill="none"/>`
      )
      .join('') +
    `</svg>`
  );
}

/* ---------- the office Clawds who join: drawn with their wear from src/office/draw.ts ---------- */
type Ally = Exclude<MemberKey, 'hero'>;
const WEAR_FRONT: Record<Ally, () => string> = {
  vigie: () =>
    R(2.5, 0.2, 11, 0.8, V('c-ink')) +
    R(1.2, 2, 1.3, 2.6, V('c-ink')) +
    R(13.5, 2, 1.3, 2.6, V('c-ink')) +
    R(13.6, 5, 0.5, 1.6, V('c-ink')) +
    R(11.6, 6.3, 2.5, 0.5, V('c-ink')),
  navette: () =>
    R(2.5, -0.3, 11, 1.5, V('k-cap')) + R(11, 0.5, 5, 0.8, V('k-cap')),
  moka: () =>
    R(4.5, 5.6, 7, 3.4, V('k-apron')) + R(4.5, 5.2, 7, 0.5, V('k-navy')),
  tampon: () =>
    `<rect x="2" y="2.1" width="12" height="1" fill="${V('k-visor')}" opacity="0.9"/>` +
    R(2, 1, 12, 0.7, V('k-visor-d')),
  arrosoir: () =>
    R(0.5, 0.2, 15, 0.9, V('k-straw')) +
    R(4, -1.4, 8, 1.7, V('k-straw')) +
    R(4, -0.2, 8, 0.5, V('k-straw-band')),
};
const WEAR_BACK: Record<Ally, () => string> = {
  vigie: () =>
    R(2.5, 0.2, 11, 0.8, V('c-ink')) +
    R(1.2, 2, 1.3, 2.6, V('c-ink')) +
    R(13.5, 2, 1.3, 2.6, V('c-ink')),
  navette: () =>
    R(2.5, -0.3, 11, 1.8, V('k-cap')) + R(7, 1.4, 2, 0.8, V('k-cap')),
  moka: () =>
    R(2, 5.2, 12, 0.5, V('k-navy')) +
    R(6.6, 4.6, 1.2, 1.6, V('k-apron')) +
    R(8.2, 4.6, 1.2, 1.6, V('k-apron')),
  tampon: () => R(2, 1.6, 12, 0.7, V('k-visor-d')),
  arrosoir: () =>
    R(0.5, 0.2, 15, 0.9, V('k-straw')) +
    R(4, -1.4, 8, 1.7, V('k-straw')) +
    R(4, -0.2, 8, 0.5, V('k-straw-band')),
};
/** A member seen from the front: in the dialogue box and the cinematics. */
export function castSvg(k: MemberKey, held = ''): string {
  if (k === 'hero') return heroSvg();
  return svg(clawdBody() + WEAR_FRONT[k]() + held);
}
/** A member seen from behind, facing the enemies. */
export function castBack(k: MemberKey): string {
  if (k === 'hero') return heroBack();
  return svg(backBody() + WEAR_BACK[k]());
}
/** A sheet held overhead, as the office draws it. */
export const heldSheet = (line = V('s-book-b')) =>
  R(4.5, -4.6, 7, 5, V('s-paper')) +
  R(5.4, -3.6, 5.2, 0.5, line) +
  R(5.4, -2.5, 4.2, 0.4, V('s-ink-soft'));
/** Tampon's stamp, raised. */
export const heldStamp = () =>
  R(13, -3, 3, 4, V('s-wood')) + R(12, 1, 5, 1.6, V('s-stamp'));
/** Arrosoir's watering can. */
export const heldCan = () =>
  R(14, 4, 4, 3, V('k-can')) +
  `<path d="M18 4.6 L20.6 2.4" stroke="${V('k-can')}" stroke-width=".9"/>`;

/* ---------- elements, statuses and moves: small icons drawn in one ink ---------- */
const EL_ICON: Record<Element, string> = {
  encre: '<path d="M12 2C12 2 5 11 5 15a7 7 0 0 0 14 0C19 11 12 2 12 2z"/>',
  papier:
    '<path d="M5 2h10l5 5v15H5z"/><path d="M15 2v5h5" fill="var(--el-fold, #0003)"/>',
  cafe: '<path d="M4 9h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 11h2a2.5 2.5 0 0 1 0 5h-2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 7q-1.5-2 0-4M12 7q-1.5-2 0-4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  courant: '<path d="M14 1L4 14h7l-2 9 11-14h-7z"/>',
};
export const elIcon = (el: Element, cls = '') =>
  `<svg class="el el-${el} ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">${EL_ICON[el]}</svg>`;

const ST_ICON: Record<StatusKey, string> = {
  poison:
    '<circle cx="8" cy="9" r="5"/><circle cx="4" cy="3" r="1.6"/><circle cx="11" cy="2.4" r="1.2"/>',
  burn: '<path d="M8 1c1 3 5 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 1 2 0-3 0-5 1-7z"/>',
  sleep:
    '<path d="M2 3h6L2 11h6M9 2h5l-5 6h5" fill="none" stroke="currentColor" stroke-width="2"/>',
  stun: '<path d="M4 1l1 2 2 .3-1.5 1.4.4 2.1L4 5.8 2.1 6.8l.4-2.1L1 3.3 3 3zM12 7l1 2 2 .3-1.5 1.4.4 2.1L12 11.8l-1.9 1 .4-2.1L9 9.3 11 9z"/>',
  silence:
    '<path d="M2 3h12v8H7l-3 3v-3H2z"/><path d="M3 13L14 2" stroke="var(--chip-bg, #fff)" stroke-width="2"/>',
  smudge: '<path d="M8 2c3 0 6 2 6 5s-2 3-3 5-3 3-5 2-4-3-4-6 3-6 6-6z"/>',
  guard:
    '<path d="M8 1l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V3z" fill="none" stroke="currentColor" stroke-width="2"/>',
  shield: '<path d="M8 1l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V3z"/>',
  regen:
    '<path d="M8 15V7M8 9C8 5 11 3 14 3c0 3-2 6-6 6zM8 11C8 8 6 6 2 6c0 3 2 5 6 5z"/>',
  taunt:
    '<rect x="6.5" y="1" width="3" height="9"/><rect x="6.5" y="12" width="3" height="3"/>',
  steady:
    '<path d="M8 1v12M3 9c0 3 2 5 5 5s5-2 5-5M5 4h6" fill="none" stroke="currentColor" stroke-width="2"/>',
};
export const stIcon = (s: StatusKey) =>
  `<svg class="sti" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">${ST_ICON[s]}</svg>`;

const MOVE_ICON: Record<MoveKey | 'stun' | 'sleep-state', string> = {
  hit: '<path d="M8 1l2 4 5-1-3 4 3 4-5-1-2 4-2-4-5 1 3-4-3-4 5 1z"/>',
  big: '<path d="M8 0l2.4 4.4 5.6-1.2-3.6 4.8 3.6 4.8-5.6-1.2L8 16l-2.4-4.4L0 12.8l3.6-4.8L0 3.2l5.6 1.2z"/>',
  charge: '<path d="M8 1l6 7h-4v7H6V8H2z"/>',
  area: '<path d="M0 11q2-4 4 0t4 0 4 0 4 0v3H0z"/><path d="M0 6q2-4 4 0t4 0 4 0 4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  smudge: ST_ICON.smudge,
  silence: ST_ICON.silence,
  poison: ST_ICON.poison,
  sleep: ST_ICON.sleep,
  burn: ST_ICON.burn,
  steal:
    '<path d="M3 6h10l1 9H2z"/><path d="M5 6V4a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="1.6"/>',
  mend: '<rect x="6" y="1" width="4" height="14"/><rect x="1" y="6" width="14" height="4"/>',
  shield: ST_ICON.shield,
  fog: '<path d="M1 5h10M4 9h11M1 13h9" stroke="currentColor" stroke-width="2.4" fill="none"/>',
  shuffle:
    '<path d="M1 4h4l6 8h4M1 12h4l6-8h4" fill="none" stroke="currentColor" stroke-width="2"/>',
  allow:
    '<path d="M2 8l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6"/>',
  shift: '<path d="M8 1a7 7 0 1 0 7 7h-3a4 4 0 1 1-4-4V7l5-4-5-3z"/>',
  overflow: '<path d="M1 10q3-3 7 0t7 0v5H1z"/><path d="M4 1h8v6H4z"/>',
  spill:
    '<path d="M4 1h8l-1 5H5z"/><path d="M8 7c0 0-4 4-4 6a4 4 0 0 0 8 0c0-2-4-6-4-6z"/>',
  stun: ST_ICON.stun,
  'sleep-state': ST_ICON.sleep,
};
export const moveIcon = (k: keyof typeof MOVE_ICON) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">${MOVE_ICON[k]}</svg>`;

/* ---------- props the animations throw around ---------- */
export const PROPS = {
  quill: `<path d="M2 22L14 10C18 4 22 2 22 2S20 8 14 12L4 22Z" fill="${V('s-paper')}" stroke="${V('line')}" stroke-width="1.5"/>`,
  drop: `<path d="M12 2C12 2 5 11 5 15a7 7 0 0 0 14 0C19 11 12 2 12 2z" fill="${V('el-encre')}"/>`,
  sheet: `<path d="M5 2h10l5 5v15H5z" fill="${V('s-paper')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M8 10h8M8 14h8M8 18h5" stroke="${V('s-ink-soft')}" stroke-width="1.4"/>`,
  plane: `<path d="M2 12L22 3 14 21 11 13z" fill="${V('s-paper')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M11 13L22 3" stroke="${V('line')}" stroke-width="1"/>`,
  cup: `<path d="M4 9h13v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" fill="${V('s-paper')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M5 11h11" stroke="${V('el-cafe')}" stroke-width="2"/><path d="M17 11h2a2.5 2.5 0 0 1 0 5h-2" fill="none" stroke="${V('line')}" stroke-width="1.6"/>`,
  bolt: `<path d="M14 1L4 14h7l-2 9 11-14h-7z" fill="${V('el-courant')}" stroke="${V('line')}" stroke-width="1"/>`,
  stamp: `<rect x="3" y="15" width="18" height="6" fill="${V('s-stamp')}" stroke="${V('line')}" stroke-width="1.5"/><rect x="9" y="4" width="6" height="11" fill="${V('s-wood')}" stroke="${V('line')}" stroke-width="1.5"/>`,
  leaf: `<path d="M3 21C3 9 11 3 21 3c0 10-6 18-18 18z" fill="${V('s-leaf')}" stroke="${V('line')}" stroke-width="1.2"/>`,
  envelope: `<rect x="2" y="5" width="20" height="14" fill="${V('s-paper')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M2 5l10 8 10-8" fill="none" stroke="${V('en-spam')}" stroke-width="1.6"/>`,
  scissors: `<circle cx="6" cy="18" r="3" fill="none" stroke="${V('blade')}" stroke-width="2"/><circle cx="18" cy="18" r="3" fill="none" stroke="${V('blade')}" stroke-width="2"/><path d="M8 16L20 2M16 16L4 2" stroke="${V('blade')}" stroke-width="2.4"/>`,
  note: `<path d="M9 18V4l11-2v14" fill="none" stroke="${V('en-din-2')}" stroke-width="2"/><circle cx="6" cy="18" r="3" fill="${V('en-din-2')}"/><circle cx="17" cy="16" r="3" fill="${V('en-din-2')}"/>`,
  steam: `<path d="M8 22q-4-5 0-10t0-10M15 22q-4-5 0-10t0-10" fill="none" stroke="${V('s-paper')}" stroke-width="2.4" stroke-linecap="round"/>`,
  hand: `<path d="M6 22V10a2 2 0 0 1 4 0V4a2 2 0 0 1 4 0v6-4a2 2 0 0 1 4 0v10c0 4-3 6-6 6z" fill="${V('en-pil-2')}" stroke="${V('line')}" stroke-width="1.2"/>`,
  mask: `<path d="M2 6Q12 2 22 6L21 14Q17 18 12 14Q7 18 3 14Z" fill="${V('en-mask-face')}" stroke="${V('line')}" stroke-width="1.2"/>`,
  fake: `<path d="M5 2h14v20H5z" fill="${V('s-paper')}" stroke="${V('en-fau-2')}" stroke-width="1.6"/><path d="M8 8h8M8 12h8" stroke="${V('en-fau-2')}" stroke-width="1.4"/><circle cx="15" cy="17" r="2.6" fill="${V('hurt')}"/>`,
  blob: `<path d="M12 3c5 0 9 3 9 8s-3 5-5 8-5 3-8 2-6-4-6-8 4-10 10-10z" fill="${V('el-encre')}"/>`,
  pot: `<path d="M5 12h14l-2 10H7z" fill="${V('s-pot')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M12 12V5M12 8c0-3 3-4 6-4 0 3-3 4-6 4zM12 9c0-2-2-3-5-3 0 2 2 3 5 3z" fill="${V('s-leaf')}" stroke="${V('s-leaf')}" stroke-width="1.4"/>`,
  eraser: `<path d="M3 15l9-9 8 8-6 6H8z" fill="${V('k-straw-band')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M8 20l-5-5 4-4 9 9" fill="${V('s-paper')}"/>`,
  blotter: `<path d="M3 10h18v6H3z" fill="${V('s-book-b')}" stroke="${V('line')}" stroke-width="1.4"/><rect x="9" y="4" width="6" height="6" fill="${V('s-wood')}"/>`,
  power: `<circle cx="12" cy="13" r="8" fill="none" stroke="${V('ok')}" stroke-width="3"/><path d="M12 2v10" stroke="${V('ok')}" stroke-width="3"/>`,
  lens: `<circle cx="10" cy="10" r="6" fill="none" stroke="${V('gold')}" stroke-width="2.6"/><path d="M14.5 14.5L21 21" stroke="${V('gold')}" stroke-width="3"/>`,
  plug: `<rect x="6" y="8" width="12" height="9" fill="${V('s-metal')}" stroke="${V('line')}" stroke-width="1.4"/><path d="M9 8V3M15 8V3M12 17v6" stroke="${V('s-brass')}" stroke-width="2"/>`,
  key: `<circle cx="7" cy="12" r="4" fill="none" stroke="${V('s-brass')}" stroke-width="2.4"/><path d="M11 12h11M18 12v4M21 12v3" stroke="${V('s-brass')}" stroke-width="2.4"/>`,
  loop: `<path d="M4 12a8 8 0 1 0 8-8" fill="none" stroke="${V('b1-trace')}" stroke-width="3"/><path d="M12 0l5 4-5 4z" fill="${V('b1-trace')}"/>`,
  scroll: `<path d="M5 3h12v18H5z" fill="${V('b3-face')}" stroke="${V('line')}" stroke-width="1.2"/><path d="M7 7h8M7 10h8M7 13h6M7 16h8" stroke="${V('s-ink-soft')}" stroke-width="1.2"/>`,
  wave: `<path d="M1 14q3-6 6 0t6 0 6 0 4 0" fill="none" stroke="${V('b5-puddle')}" stroke-width="3"/>`,
} as const;
export type PropKey = keyof typeof PROPS;
export const propSvg = (k: PropKey) =>
  `<svg viewBox="0 0 24 24" aria-hidden="true">${PROPS[k]}</svg>`;
