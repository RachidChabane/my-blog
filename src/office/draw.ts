/**
 * Build-time drawings of the office: the Clawd sprite, the frieze of stands and
 * one scene per project. Everything here returns an SVG string, so pages ship
 * the pictures as static markup.
 *
 * The sprite follows the mascot's own grid: body 12x8, eyes 1x2, arms 2x2, four
 * legs 1x2.
 */
import { SECTION_COLOR } from '@/office/sections';
import type { RoomKey } from '@/office/sections';

const BODY = '#D77757';
const INK = '#171B2B';
const NAVY = '#2B3154';
const NIGHTCAP = '#C9C2F0';
const LANTERN = '#F2C230';
const DRILL = '#A8367A';

export type Wear =
  | 'headset'
  | 'glasses'
  | 'beanie'
  | 'cap'
  | 'visor'
  | 'beret'
  | 'bow'
  | 'straw'
  | 'hardhat'
  | 'scarf'
  | 'apron'
  | 'brows'
  | 'beard'
  | 'wizard'
  | 'nightcap'
  | 'headband'
  | 'whistle';

export interface ClawdLook {
  wear?: Wear[];
  tint?: string;
  /** CSS classes that drive the idle animations (type, wave, walk, d2, d3). */
  cls?: string;
  /** Arms raised, nothing held. */
  up?: boolean;
  /** Colour of the first line of a sheet held overhead. */
  hold?: string;
  /** Eyes shut, with the small z of a nap drifting up. */
  asleep?: boolean;
  /** A lit lantern in the right hand. */
  lantern?: boolean;
  name?: string;
  /** Placement inside a parent SVG. */
  x?: number;
  y?: number;
  w?: number;
}

export interface Member {
  name: string;
  role: { fr: string; en: string };
  wear: Wear[];
  tint?: string;
}

export const TEAM: Member[] = [
  {
    name: 'Vigie',
    role: { fr: 'radar', en: 'radar' },
    wear: ['headset'],
  },
  {
    name: 'Écho',
    role: { fr: 'radar', en: 'radar' },
    wear: ['headset', 'scarf'],
    tint: '#2F8F86',
  },
  {
    name: 'Plume',
    role: { fr: 'rédaction', en: 'writing' },
    wear: ['glasses'],
  },
  {
    name: 'Virgule',
    role: { fr: 'rédaction', en: 'writing' },
    wear: ['beanie'],
    tint: '#C9C2F0',
  },
  {
    name: 'Brouillon',
    role: { fr: 'rédaction', en: 'writing' },
    wear: ['glasses'],
    tint: '#F2C230',
  },
  {
    name: 'Rature',
    role: { fr: 'rédaction', en: 'writing' },
    wear: ['cap'],
    tint: '#2F8F86',
  },
  { name: 'Tampon', role: { fr: 'tampon', en: 'stamp' }, wear: ['visor'] },
  {
    name: 'Visa',
    role: { fr: 'tampon', en: 'stamp' },
    wear: ['visor', 'glasses'],
  },
  {
    name: 'Navette',
    role: { fr: 'courrier', en: 'courier' },
    wear: ['cap'],
    tint: '#3F6FE0',
  },
  {
    name: 'Relais',
    role: { fr: 'courrier', en: 'courier' },
    wear: ['cap'],
    tint: '#3E9B6E',
  },
  {
    name: 'Estafette',
    role: { fr: 'courrier', en: 'courier' },
    wear: ['cap', 'scarf'],
    tint: '#D4472F',
  },
  {
    name: 'Classeur',
    role: { fr: 'archives', en: 'archives' },
    wear: ['bow', 'glasses'],
    tint: '#C9C2F0',
  },
  {
    name: 'Arrosoir',
    role: { fr: 'plantes', en: 'plants' },
    wear: ['straw'],
  },
  { name: 'Moka', role: { fr: 'café', en: 'coffee' }, wear: ['apron'] },
  { name: 'Balai', role: { fr: 'ménage', en: 'cleaning' }, wear: ['hardhat'] },
  { name: 'Cadre', role: { fr: 'galerie', en: 'gallery' }, wear: ['beret'] },
  {
    name: 'Cimaise',
    role: { fr: 'galerie', en: 'gallery' },
    wear: ['beret', 'bow'],
    tint: '#F7CFC6',
  },
  {
    name: 'Maquette',
    role: { fr: 'projets', en: 'projects' },
    wear: ['apron', 'cap'],
    tint: '#6C4BD8',
  },
  {
    name: 'Glose',
    role: { fr: 'bibliothèque', en: 'library' },
    wear: ['beard', 'wizard'],
  },
  {
    name: 'Chrono',
    role: { fr: 'entraînement', en: 'training' },
    wear: ['headband', 'whistle'],
    tint: DRILL,
  },
  {
    name: 'Verrou',
    role: { fr: 'garde', en: 'guard' },
    wear: ['brows', 'cap'],
    tint: NAVY,
  },
  {
    name: 'Cadenas',
    role: { fr: 'garde', en: 'guard' },
    wear: ['brows', 'cap'],
    tint: NAVY,
  },
];

export function rect(
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  cls?: string
): string {
  const c = cls ? ` class="${cls}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${c}/>`;
}

function esc(s: string): string {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
  );
}

export function clawd(look: ClawdLook = {}): string {
  const wear = look.wear ?? [];
  const tint = look.tint ?? NAVY;
  const has = (k: Wear) => wear.includes(k);
  const R = rect;
  let s =
    `<g class="la">${R(3, 9, 1, 2, BODY)}${R(10, 9, 1, 2, BODY)}</g>` +
    `<g class="lb">${R(5, 9, 1, 2, BODY)}${R(12, 9, 1, 2, BODY)}</g>` +
    R(2, 1, 12, 8, BODY);
  const armY = look.hold || look.up ? 1 : 4;
  s += `<g class="arm al">${R(0, armY, 2, 2, BODY)}</g><g class="arm ar">${R(14, armY, 2, 2, BODY)}</g>`;
  if (has('scarf')) s += R(2, 7, 12, 1.2, tint) + R(11, 8, 1.6, 2, tint);
  if (has('apron'))
    s += R(4.5, 5.6, 7, 3.4, '#FFFFFF') + R(4.5, 5.2, 7, 0.5, tint);
  s += look.asleep
    ? R(4.6, 4, 1.8, 0.6, INK) + R(9.6, 4, 1.8, 0.6, INK)
    : `<g class="eyes">${R(5, 3, 1, 2, INK)}${R(10, 3, 1, 2, INK)}</g>`;
  if (has('brows'))
    s += `<path class="face" d="M3.6 1.6L7 2.6V3.4L3.6 2.4ZM12.4 1.6L9 2.6V3.4L12.4 2.4Z" fill="${INK}"/>`;
  if (has('beard'))
    s +=
      `<g class="beard">${R(3.5, 5.6, 9, 3, '#FFFFFF')}${R(4.5, 8.6, 7, 3, '#FFFFFF')}` +
      `${R(5.5, 11.6, 5, 2.6, '#F1EEE6')}${R(6.5, 14.2, 3, 2, '#F1EEE6')}${R(7.4, 16.2, 1.2, 1.4, '#E6E1D5')}</g>` +
      `<g class="face" fill="none" stroke="${INK}" stroke-width="0.4"><circle cx="5.5" cy="4" r="1.5"/><circle cx="10.5" cy="4" r="1.5"/><path d="M7 4H9"/></g>`;
  if (has('wizard'))
    s +=
      `<g class="hat"><path d="M2.5 1.2L8.6 -6.4L13.5 1.2Z" fill="#6C4BD8"/>${R(1, 0.6, 14, 1, '#6C4BD8')}` +
      `<path d="M8.4 -2.6l.5 1 1.1.1-.8.8.2 1.1-1-.6-1 .6.2-1.1-.8-.8 1.1-.1z" fill="#F2C230"/></g>`;
  if (has('whistle'))
    s +=
      `<path d="M4.4 6.2L8 7.8L11.6 6.2" fill="none" stroke="#FFFFFF" stroke-width="0.4"/>` +
      R(7, 7.3, 2.2, 1.2, '#C9CDDA') +
      R(9.2, 7.5, 0.9, 0.7, '#9AA3BD');
  if (has('headband'))
    s +=
      R(2, 0.8, 12, 1.4, '#FFFFFF') +
      R(2, 1.3, 12, 0.4, tint) +
      R(13.4, 1.6, 1.6, 1.6, '#FFFFFF');
  if (has('glasses'))
    s += `<g class="face" fill="none" stroke="${INK}" stroke-width="0.45"><rect x="4" y="2.4" width="3" height="3.2"/><rect x="9" y="2.4" width="3" height="3.2"/><path d="M7 3.6H9"/></g>`;
  if (has('visor'))
    s +=
      `<rect x="2" y="2.1" width="12" height="1" fill="#3E9B6E" opacity="0.9"/>` +
      R(2, 1, 12, 0.7, '#1E4F55');
  if (has('headset'))
    s +=
      R(2.5, 0.2, 11, 0.8, INK) +
      R(1.2, 2, 1.3, 2.6, INK) +
      R(13.5, 2, 1.3, 2.6, INK) +
      R(13.6, 5, 0.5, 1.6, INK) +
      R(11.6, 6.3, 2.5, 0.5, INK);
  if (has('beanie'))
    s += R(3, -0.9, 10, 2, tint) + R(7, -2.1, 2, 1.3, '#FFFFFF');
  if (has('cap')) s += R(2.5, -0.3, 11, 1.5, tint) + R(11, 0.5, 5, 0.8, tint);
  if (has('beret'))
    s +=
      `<ellipse cx="8.4" cy="0.5" rx="5.6" ry="1.3" fill="${tint}"/>` +
      R(8, -1.3, 0.7, 1, tint);
  if (has('bow'))
    s += `<path d="M8 0.4L5.6 -1.2V2ZM8 0.4L10.4 -1.2V2Z" fill="#D4472F"/>`;
  if (has('straw'))
    s +=
      R(0.5, 0.2, 15, 0.9, '#F0DCBC') +
      R(4, -1.4, 8, 1.7, '#F0DCBC') +
      R(4, -0.2, 8, 0.5, '#D4472F');
  if (has('hardhat'))
    s += R(3, -1.2, 10, 2.2, '#F2C230') + R(2, 0.4, 12, 0.7, '#F2C230');
  if (has('nightcap'))
    s +=
      R(3, -0.7, 10, 1.8, NIGHTCAP) +
      `<path d="M4.6 -0.7L9.6 -4.2L14.4 -1.5L12.8 -0.7Z" fill="${NIGHTCAP}"/>` +
      R(13.6, -1.9, 1.7, 1.7, '#FFFFFF');
  if (look.lantern)
    s +=
      `<circle class="glow" cx="15.5" cy="8" r="3.4" fill="${LANTERN}" opacity="0.3"/>` +
      R(15.2, 5.6, 0.6, 1, INK) +
      R(14.3, 6.5, 2.4, 2.8, LANTERN) +
      R(14.1, 6.3, 2.8, 0.5, INK) +
      R(14.1, 9.2, 2.8, 0.5, INK);
  if (look.asleep)
    s +=
      `<g class="zz" fill="#FFFFFF" font-weight="800" aria-hidden="true">` +
      `<text x="11.6" y="0.4" font-size="2.6">z</text><text x="13.6" y="-1.7" font-size="2">z</text><text x="15.1" y="-3.4" font-size="1.5">z</text></g>`;
  if (look.hold)
    s +=
      R(4.5, -4.6, 7, 5, '#FFFFFF') +
      R(5.4, -3.6, 5.2, 0.5, look.hold) +
      R(5.4, -2.5, 4.2, 0.4, '#9AA3BD') +
      R(5.4, -1.6, 4.8, 0.4, '#9AA3BD');
  const top = has('wizard') ? -6.8 : -5.2;
  const vh = (has('beard') ? 18 : 11.2) - top;
  const pos =
    look.x === undefined || look.y === undefined || look.w === undefined
      ? ''
      : ` x="${look.x}" y="${look.y}" width="${look.w}" height="${(look.w * vh) / 18}"`;
  const label = look.name ? esc(look.name) : 'Clawd';
  const title = look.name ? `<title>${label}</title>` : '';
  return `<svg class="cl ${look.cls ?? ''}" viewBox="-1 ${top} 18 ${vh}"${pos} shape-rendering="crispEdges" role="img" aria-label="${label}">${title}${s}</svg>`;
}

/** A named member of the team, drawn with their own accessories. */
export function who(
  name: string,
  cls = '',
  extra: Partial<ClawdLook> = {}
): string {
  const m = TEAM.find((t) => t.name === name);
  if (!m) throw new Error(`unknown Clawd: ${name}`);
  return clawd({ wear: m.wear, tint: m.tint, name: m.name, cls, ...extra });
}

/** One Clawd at a stand: who, where along the room, how they are drawn. */
type Post = [name: string, x: number, cls: string, extra?: Partial<ClawdLook>];

/** Who stands at each desk by day, and who is left there at night. */
const SHIFTS: Record<RoomKey, { day: Post[]; night: Post[] }> = {
  radar: {
    day: [
      ['Vigie', 96, 'type'],
      ['Écho', 196, 'type d2'],
    ],
    night: [
      ['Vigie', 96, 'd3', { lantern: true }],
      ['Écho', 196, '', { asleep: true }],
    ],
  },
  blog: {
    day: [
      ['Plume', 74, 'type d3'],
      ['Virgule', 156, 'type'],
      ['Rature', 246, 'type d2'],
    ],
    night: [
      ['Plume', 74, 'type d3'],
      ['Virgule', 156, '', { asleep: true }],
      ['Rature', 246, '', { asleep: true, wear: ['nightcap'] }],
    ],
  },
  work: {
    day: [
      ['Maquette', 70, 'type d2'],
      ['Balai', 150, 'd3'],
    ],
    night: [
      ['Maquette', 70, '', { asleep: true }],
      ['Balai', 150, 'd3', { lantern: true }],
    ],
  },
  library: {
    day: [['Classeur', 84, 'd2', { hold: '#4F53D6' }]],
    night: [['Classeur', 84, '', { asleep: true }]],
  },
  journal: { day: [], night: [] },
  training: {
    day: [['Chrono', 246, 'd2']],
    night: [['Chrono', 246, 'd3', { lantern: true }]],
  },
};

/** What Glose wears once the lamps are low. */
const SAGE_NIGHT: Partial<ClawdLook> = { wear: ['beard', 'nightcap'] };

/** The crew behind a section's desk, day shift and night shift. */
export function crew(room: RoomKey): string {
  const line = (posts: Post[]) =>
    posts.map(([name, , cls, extra]) => who(name, cls, extra)).join('');
  const s = SHIFTS[room];
  return `<span class="when-day">${line(s.day)}</span><span class="when-night">${line(s.night)}</span>`;
}

export interface FriezeRoom {
  key: RoomKey;
  label: string;
  href: string;
  say: string;
  /** What the room says at night. */
  sayNight: string;
}

/** Width of one room of the frieze, in drawing units. */
const ROOM_W = 380;

/** The office in elevation: one room of ROOM_W units per section, each one a link. */
export function frieze(rooms: FriezeRoom[], ariaLabel: string): string {
  const W = ROOM_W;
  const span = W * rooms.length;
  const R = rect;
  const v = (t: string) => `var(--${t})`;
  let s =
    R(0, 0, span, 36, v('ceil')) +
    R(0, 46, span, 190, v('wall')) +
    R(0, 198, span, 38, v('wains')) +
    R(0, 232, span, 4, INK) +
    R(0, 236, span, 64, v('floor'));
  for (let y = 256; y < 300; y += 22) s += R(0, y, span, 1.5, v('floor-d'));
  for (let x = 30; x < span; x += 95) {
    const odd = (x / 95) % 2 !== 0;
    s +=
      R(x, 236 + (odd ? 0 : 22), 1.5, 22, v('floor-d')) +
      R(x + 47, 258 + (odd ? 22 : 0), 1.5, 20, v('floor-d'));
  }
  rooms.forEach((room, i) => {
    const x = i * W;
    const c = SECTION_COLOR[room.key];
    const k = room.key;
    s += '<g class="rm">';
    if (k !== 'library') s += R(x + 22, 62, W - 44, 136, c);
    s += R(x + W / 2 - 40, 10, 80, 5, '#FFFFFF');
    if (k === 'radar')
      s +=
        R(x + 150, 82, 120, 86, v('screen')) +
        `<g transform="translate(${x + 210} 125)"><circle r="34" fill="none" stroke="#7FB0FF" stroke-width="2"/><circle r="21" fill="none" stroke="#7FB0FF" stroke-width="2"/><circle r="8" fill="none" stroke="#7FB0FF" stroke-width="2"/><path class="sweep" d="M0 0L0 -34A34 34 0 0 1 24 -24Z" fill="${BODY}"/><circle cx="-14" cy="9" r="3" fill="#fff"/><circle cx="17" cy="14" r="3" fill="#fff"/></g>` +
        R(x + 70, 110, 5, 126, NAVY) +
        `<path d="M40 96A34 22 0 0 0 108 96Z" transform="translate(${x} 0) rotate(-18 74 96)" fill="#FFFFFF"/><circle cx="${x + 84}" cy="88" r="5" fill="${BODY}"/>`;
    if (k === 'blog') {
      s +=
        R(x + 60, 84, 190, 18, '#F7D873') +
        R(x + 44, 84, 16, 18, '#F7CFC6') +
        R(x + 58, 84, 6, 18, '#9AA3BD') +
        `<path d="M${x + 250} 84L${x + 284} 93L${x + 250} 102Z" fill="#F0DCBC"/><path d="M${x + 272} 89.8L${x + 284} 93L${x + 272} 96.2Z" fill="${INK}"/>`;
      [0, 1, 2].forEach((n) => {
        const sx = x + 96 + n * 62;
        s +=
          R(sx, 122, 46, 58, '#FFFFFF') +
          R(sx + 7, 131, 30, 4, INK) +
          R(sx + 7, 142, 32, 2, '#9AA3BD') +
          R(sx + 7, 149, 26, 2, '#9AA3BD') +
          R(sx + 7, 156, 30, 2, '#9AA3BD');
      });
    }
    if (k === 'work')
      s +=
        R(x + 46, 80, 120, 84, '#FFFFFF') +
        R(x + 58, 92, 60, 5, '#4F53D6') +
        R(x + 58, 104, 96, 3, '#9AA3BD') +
        R(x + 58, 113, 80, 3, '#9AA3BD') +
        `<path d="M${x + 62} 152L${x + 84} 130L${x + 104} 142L${x + 150} 122" fill="none" stroke="${BODY}" stroke-width="4"/>` +
        R(x + 200, 150, 44, 44, '#C99562') +
        R(x + 250, 162, 34, 32, '#F2C230') +
        R(x + 290, 140, 40, 54, NAVY) +
        R(x + 214, 120, 30, 30, '#BFE0FF') +
        R(x + 300, 150, 20, 4, '#FFFFFF');
    if (k === 'library') {
      s += R(x + 26, 62, W - 52, 174, NAVY);
      const spines = [
        BODY,
        '#F2C230',
        '#4F53D6',
        '#FFFFFF',
        '#3E9B6E',
        '#D4472F',
        '#C9C2F0',
        '#BFE0FF',
      ];
      for (let r = 0; r < 4; r++) {
        let bx = x + 34;
        for (let n = 0; bx < x + W - 44; n++) {
          const bw = 7 + ((n * 7 + r * 3) % 5) * 2;
          const bh = 26 + ((n * 5 + r) % 4) * 3;
          s += R(
            bx,
            70 + r * 42 + (38 - bh),
            bw,
            bh,
            spines[(n * 3 + r * 5) % 8]
          );
          bx += bw + 2;
        }
        s += R(x + 26, 108 + r * 42, W - 52, 4, INK);
      }
    }
    if (k === 'journal')
      s +=
        R(x + 52, 78, 96, 96, '#FFFFFF') +
        R(x + 58, 84, 84, 84, v('sky')) +
        `<circle cx="${x + 118}" cy="108" r="14" fill="${v('sun')}"/>` +
        `<g class="when-night"><circle cx="${x + 125}" cy="103" r="12" fill="${v('sky')}"/>` +
        `${R(x + 68, 94, 3, 3, '#FFFFFF')}${R(x + 84, 146, 2, 2, '#FFFFFF')}${R(x + 130, 152, 3, 3, '#FFFFFF')}${R(x + 72, 132, 2, 2, '#FFFFFF')}</g>` +
        R(x + 98, 84, 4, 84, '#FFFFFF') +
        R(x + 58, 124, 84, 4, '#FFFFFF') +
        R(x + 300, 150, 4, 54, INK) +
        `<path d="M${x + 280} 150L${x + 290} 128H${x + 314}L${x + 324} 150Z" fill="#F2C230"/>` +
        R(x + 200, 196, 44, 8, '#FFFFFF') +
        R(x + 204, 191, 36, 5, '#BFE0FF');
    if (k === 'training') {
      s +=
        R(x + 44, 76, 168, 100, '#C99562') +
        R(x + 50, 82, 156, 88, '#12343A') +
        R(x + 60, 92, 70, 5, '#FFFFFF') +
        R(x + 60, 103, 120, 3, '#9AA3BD') +
        ['A', 'B', 'C', 'D']
          .map(
            (l, n) =>
              `<circle cx="${x + 76 + n * 36}" cy="140" r="13" fill="${n === 2 ? '#F2C230' : 'none'}" stroke="#FFFFFF" stroke-width="2.5"/>` +
              `<text x="${x + 76 + n * 36}" y="145.5" text-anchor="middle" font-size="14" fill="${n === 2 ? INK : '#FFFFFF'}">${l}</text>`
          )
          .join('') +
        `<g transform="translate(${x + 292} 104)"><circle r="28" fill="#FFFFFF" stroke="${INK}" stroke-width="4"/>${R(-4, -38, 8, 8, INK)}<path class="sweep" d="M-1.5 0V-21H1.5V0Z" fill="${DRILL}"/><circle r="3" fill="${INK}"/></g>` +
        R(x + 150, 194, 44, 12, '#FFFFFF') +
        R(x + 154, 188, 36, 6, '#F3EEE2');
    }
    const stand = (posts: Post[], y: number) =>
      posts
        .map(
          ([name, px, cls, extra], n) =>
            `<g class="cw" style="animation-delay:-${n * 0.12}s">${who(name, cls, { x: x + px, y, w: 62, ...extra })}</g>`
        )
        .join('');
    const crewY = k === 'library' ? 196 : 154;
    s +=
      `<g class="when-day">${stand(SHIFTS[k].day, crewY)}</g>` +
      `<g class="when-night">${stand(SHIFTS[k].night, crewY)}</g>`;
    if (k === 'library')
      s +=
        R(x + 232, 222, 60, 14, BODY) +
        R(x + 236, 210, 52, 12, '#F2C230') +
        `<g class="sage when-day">${who('Glose', 'd3', { x: x + 224, y: 128, w: 78 })}</g>` +
        `<g class="sage when-night">${who('Glose', 'd3', { x: x + 224, y: 128, w: 78, ...SAGE_NIGHT })}</g>`;
    else
      s +=
        R(x + 48, 206, W - 96, 8, k === 'journal' ? '#C99562' : v('table')) +
        R(x + 60, 214, 7, 22, NAVY) +
        R(x + W - 67, 214, 7, 22, NAVY);
    s +=
      R(x + W / 2 - 62, 46, 2, 14, INK) +
      R(x + W / 2 + 60, 46, 2, 14, INK) +
      `<path class="spot" d="M${x + W / 2 - 40} 15H${x + W / 2 + 40}L${x + W - 30} 300H${x + 30}Z" fill="#FFF3C4"/>` +
      R(x, 46, W, 254, '#0B1220', 'dim');
    const bubble = (text: string, when: string) => {
      if (!text) return '';
      const bw = text.length * 7.6 + 30;
      const bx = x + W / 2 - bw / 2;
      return (
        `<g class="say ${when}"><rect x="${bx}" y="104" width="${bw}" height="32" rx="16" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>` +
        `<path d="M${x + W / 2 - 8} 135l8 12 8-12z" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/>` +
        `<rect x="${x + W / 2 - 10}" y="130" width="20" height="5" fill="#FFFFFF"/>` +
        `<text x="${x + W / 2}" y="125" text-anchor="middle" font-size="14" fill="${INK}">${esc(text)}</text></g>`
      );
    };
    s += bubble(room.say, 'when-day') + bubble(room.sayNight, 'when-night');
    s +=
      `<a href="${room.href}" aria-label="${esc(room.label)}"><rect class="hit" x="${x}" y="46" width="${W}" height="254"/>` +
      `<g class="sg"><rect x="${x + W / 2 - 74}" y="58" width="148" height="34" rx="4" fill="${v('pill')}"/>` +
      `<text x="${x + W / 2}" y="82" text-anchor="middle" font-size="20" fill="${v('pill-ink')}">${esc(room.label)}</text></g></a></g>`;
  });
  s += R(0, 36, span, 12, v('beam')) + R(0, 46, span, 3, v('beam-d'));
  for (let b = 0; b <= rooms.length; b++)
    s += R(Math.min(b * W, span - 10), 30, 10, 20, v('beam-d'));
  s +=
    `<g class="walker">${who('Navette', 'walk', { x: 0, y: 238, w: 58, hold: '#F2C230' })}</g>` +
    `<g class="walker b">${who('Estafette', 'walk d2', { x: 0, y: 244, w: 58, hold: '#4F53D6' })}</g>`;
  return `<svg viewBox="0 0 ${span} 300" style="--span:${span}" role="group" aria-label="${esc(ariaLabel)}">${s}</svg>`;
}

type Scene = [wall: string, draw: () => string];

const R = rect;
const dumbbell = (x: number, y: number) =>
  R(x, y + 6, 26, 5, '#C9CDDA') +
  R(x - 4, y, 7, 17, INK) +
  R(x + 23, y, 7, 17, INK);

/** One scene per project, keyed by the project's translation key. */
const SCENES: Record<string, Scene> = {
  'athletic-tracker': [
    NAVY,
    () =>
      `<path d="M20 44Q110 14 200 34T380 26T560 18T700 14" fill="none" stroke="#F2C230" stroke-width="4" opacity="0.9"/>` +
      `<g class="squat">${who('Brouillon', 'd2', { x: 70, y: 98, w: 112, up: true })}${R(44, 130, 164, 6, '#C9CDDA')}${R(40, 114, 12, 38, INK)}${R(27, 120, 11, 26, '#D4472F')}${R(200, 114, 12, 38, INK)}${R(214, 120, 11, 26, '#D4472F')}</g>` +
      who('Rature', 'd3', { x: 304, y: 98, w: 112 }) +
      `<g class="hop">${dumbbell(297, 146)}</g><g class="hop" style="animation-delay:-0.5s">${dumbbell(397, 146)}</g>` +
      `<g class="hop">${who('Virgule', '', { x: 540, y: 104, w: 100, up: true })}</g>` +
      `<circle class="blink" cx="528" cy="124" r="4" fill="#BFE0FF"/><circle class="blink" cx="652" cy="130" r="4" fill="#BFE0FF"/>` +
      dumbbell(660, 183) +
      dumbbell(246, 183),
  ],
  'cca-f-exam-trainer': [
    '#1E4F55',
    () =>
      R(60, 30, 300, 110, '#12343A') +
      R(60, 30, 300, 6, '#C99562') +
      R(60, 134, 300, 6, '#C99562') +
      ['A', 'B', 'C', 'D']
        .map(
          (l, i) =>
            `<circle cx="${110 + i * 66}" cy="86" r="22" fill="${i === 2 ? '#F2C230' : 'none'}" stroke="#FFFFFF" stroke-width="3"/><text x="${110 + i * 66}" y="94" text-anchor="middle" font-size="22" fill="${i === 2 ? INK : '#FFFFFF'}">${l}</text>`
        )
        .join('') +
      `<g transform="translate(470 80)"><circle r="38" fill="#FFFFFF" stroke="${INK}" stroke-width="5"/><path class="sweep" d="M-2 0V-28H2V0Z" fill="#D4472F"/></g>` +
      who('Plume', 'type', { x: 150, y: 104, w: 104 }) +
      R(120, 176, 170, 8, '#FFFFFF') +
      R(132, 184, 7, 16, NAVY) +
      R(272, 184, 7, 16, NAVY) +
      R(176, 168, 44, 8, '#FFFFFF') +
      who('Virgule', 'wave d2', { x: 420, y: 104, w: 104 }) +
      R(390, 176, 170, 8, '#FFFFFF') +
      R(402, 184, 7, 16, NAVY) +
      R(542, 184, 7, 16, NAVY),
  ],
  shallnot: [
    '#D4472F',
    () =>
      R(350, 96, 14, 104, INK) +
      [0, 1, 2, 3, 4, 5]
        .map((i) => R(364 + i * 40, 108, 40, 14, i % 2 ? '#FFFFFF' : INK))
        .join('') +
      `<circle class="blink" cx="357" cy="84" r="12" fill="#F2C230"/>` +
      who('Navette', 'walk', { x: 150, y: 96, w: 112, hold: '#D4472F' }) +
      who('Verrou', 'd2', { x: 430, y: 84, w: 124 }) +
      [0, 1, 2]
        .map(
          (i) =>
            R(620, 70 + i * 36, 60, 24, '#FFFFFF') +
            `<path d="M632 ${82 + i * 36}l6 6 12-12" fill="none" stroke="${i === 2 ? '#C9CDDA' : '#2E8B62'}" stroke-width="4"/>`
        )
        .join(''),
  ],
  musthold: [
    '#4F53D6',
    () =>
      [0, 1, 2, 3, 4]
        .map(
          (i) =>
            R(60 + i * 62, 60, 48, 60, '#FFFFFF') +
            (i === 3
              ? `<path d="M${74 + i * 62} 78l20 24m0-24l-20 24" stroke="#D4472F" stroke-width="5"/>`
              : `<path d="M${72 + i * 62} 92l8 8 16-18" fill="none" stroke="#2E8B62" stroke-width="5"/>`)
        )
        .join('') +
      who('Visa', 'd2', { x: 200, y: 100, w: 112 }) +
      `<circle cx="300" cy="140" r="20" fill="none" stroke="#FFFFFF" stroke-width="6"/><path d="M314 154l22 22" stroke="#FFFFFF" stroke-width="7"/>` +
      `<g class="hop">${R(430, 104, 54, 66, '#FFFFFF')}${R(438, 114, 38, 5, '#D4472F')}${R(438, 126, 30, 3, '#9AA3BD')}${R(438, 134, 34, 3, '#9AA3BD')}</g>` +
      `<path d="M400 136h-40m12-10l-12 10 12 10" fill="none" stroke="#FFFFFF" stroke-width="5"/>` +
      who('Rature', 'd3', { x: 540, y: 100, w: 112 }),
  ],
  'mcp-secrets-vault': [
    INK,
    () =>
      `<g transform="translate(360 104)"><circle r="92" fill="#9AA3BD"/><circle r="74" fill="#C9CDDA"/><g class="turn"><path d="M-4 -60h8v120h-8zM-60 -4h120v8h-120z" fill="${NAVY}"/><circle r="16" fill="#F2C230"/></g></g>` +
      who('Cadenas', 'd2', { x: 500, y: 88, w: 124 }) +
      who('Relais', 'd3', { x: 110, y: 100, w: 112 }) +
      `<rect x="122" y="150" width="88" height="12" fill="${NAVY}"/><circle cx="246" cy="150" r="9" fill="none" stroke="#F2C230" stroke-width="5"/>` +
      R(254, 148, 26, 5, '#F2C230') +
      R(272, 152, 4, 8, '#F2C230'),
  ],
  'claude-plan-execute': [
    '#F2C230',
    () =>
      R(50, 36, 190, 120, '#FFFFFF') +
      [0, 1, 2, 3]
        .map(
          (i) =>
            R(66, 54 + i * 24, 14, 14, INK) +
            R(90, 58 + i * 24, 120 - i * 14, 6, '#9AA3BD') +
            (i < 2
              ? `<path d="M68 ${61 + i * 24}l4 4 7-8" fill="none" stroke="#F2C230" stroke-width="3"/>`
              : '')
        )
        .join('') +
      who('Plume', 'wave d2', { x: 220, y: 100, w: 108 }) +
      `<path d="M350 120h70m-16-12l16 12-16 12" fill="none" stroke="${INK}" stroke-width="7"/>` +
      who('Balai', 'type', { x: 440, y: 100, w: 108 }) +
      R(560, 150, 70, 50, '#C99562') +
      R(560, 150, 70, 6, '#94663A') +
      R(590, 40, 100, 70, INK) +
      R(600, 52, 50, 4, '#55B98B') +
      R(600, 64, 70, 4, '#55B98B') +
      R(600, 76, 36, 4, '#55B98B') +
      `<rect class="blink" x="600" y="90" width="8" height="8" fill="#55B98B"/>`,
  ],
  'ijtihad-engine': [
    '#1F3FD1',
    () =>
      `<g fill="#FFFFFF" font-size="34" opacity="0.9"><text x="60" y="80">∑</text><text x="130" y="110">∫</text><text x="200" y="74">π</text><text x="560" y="84">≟</text><text x="630" y="120">∞</text></g>` +
      R(270, 30, 190, 110, '#12235E') +
      `<path d="M290 110l40-50 34 30 30-44 44 60" fill="none" stroke="#FFFFFF" stroke-width="4"/>` +
      who('Cadre', 'd2', { x: 130, y: 100, w: 112 }) +
      `<text class="blink" x="250" y="96" font-size="40" fill="#F2C230">?</text>` +
      who('Brouillon', 'type d3', { x: 470, y: 100, w: 112 }) +
      R(610, 170, 60, 8, '#FFFFFF') +
      R(614, 162, 52, 8, '#F3EEE2') +
      R(618, 154, 44, 8, '#FFFFFF'),
  ],
  'bayan-rag-platform': [
    '#7E4215',
    () =>
      [0, 1, 2]
        .map((i) => {
          const x = 60 + i * 220;
          const shelves = [0, 1, 2]
            .map(
              (r) =>
                [0, 1, 2, 3, 4, 5, 6]
                  .map((n) =>
                    R(
                      x + 22 + n * 17,
                      96 + r * 34 + (n % 3) * 2,
                      12,
                      26 - (n % 3) * 2,
                      [BODY, '#F2C230', '#FFFFFF', '#3E9B6E', '#C9C2F0'][
                        (n + r + i) % 5
                      ]
                    )
                  )
                  .join('') + R(x + 16, 122 + r * 34, 128, 4, '#C99562')
            )
            .join('');
          return `<path d="M${x} 200V90Q${x + 80} 0 ${x + 160} 90V200Z" fill="${NAVY}"/>${shelves}`;
        })
        .join('') +
      who('Classeur', 'd2', { x: 300, y: 100, w: 112 }) +
      R(232, 150, 64, 8, '#FFFFFF') +
      R(236, 142, 26, 10, '#F3EEE2') +
      R(266, 142, 26, 10, '#F3EEE2') +
      R(260, 158, 8, 42, '#C99562') +
      `<text x="560" y="70" font-size="44" fill="#F2C230">« »</text>`,
  ],
  'sterna-ai-platform': [
    '#BFE0FF',
    () =>
      (
        [
          [BODY, 'Plume'],
          ['#3E9B6E', 'Relais'],
          ['#4F53D6', 'Navette'],
        ] as const
      )
        .map((m, i) => {
          const x = 70 + i * 205;
          return (
            R(x, 34, 170, 166, '#FFFFFF') +
            R(x, 34, 170, 14, m[0]) +
            R(x + 14, 62, 110, 6, '#9AA3BD') +
            R(x + 14, 76, 130, 6, '#9AA3BD') +
            R(x + 14, 90, 80, 6, '#9AA3BD') +
            who(m[1], `type d${i + 1}`, { x: x + 36, y: 110, w: 98 })
          );
        })
        .join('') +
      `<g class="fly"><path d="M0 60q14-18 28-4q14-14 28 4q-14-6-28 6q-14-12-28-6z" fill="#FFFFFF" stroke="${INK}" stroke-width="2"/></g>`,
  ],
  atelier: [
    '#2F8F86',
    () =>
      [0, 1, 2, 3, 4, 5, 6, 7]
        .map((i) => R(120 + i * 60, 30, 60, 36, i % 2 ? '#FFFFFF' : '#D4472F'))
        .join('') +
      R(120, 66, 480, 6, INK) +
      R(120, 150, 480, 12, '#C99562') +
      R(130, 162, 10, 38, '#94663A') +
      R(580, 162, 10, 38, '#94663A') +
      (
        [
          ['#F2C230', 150],
          ['#4F53D6', 214],
          [BODY, 430],
          ['#C9C2F0', 494],
          ['#BFE0FF', 546],
        ] as const
      )
        .map((b) => R(b[1], 112, 44, 38, b[0]) + R(b[1] + 14, 124, 16, 5, INK))
        .join('') +
      who('Moka', 'wave d2', { x: 300, y: 74, w: 104 }) +
      who('Arrosoir', 'd3', { x: 40, y: 108, w: 100, hold: '#F2C230' }),
  ],
};

const DEFAULT_SCENE: Scene = [
  NAVY,
  () => who('Maquette', 'type', { x: 300, y: 100, w: 112 }),
];

/** The scene of a project, with its floor. `standalone` makes it a self-contained image. */
export function projectScene(
  key: string,
  label: string,
  standalone = false
): string {
  const [wall, draw] = SCENES[key] ?? DEFAULT_SCENE;
  const floor = standalone ? '#EBB65C' : 'var(--floor)';
  const skirt = standalone ? '#1E4F55' : 'var(--wains)';
  const ns = standalone
    ? ' xmlns="http://www.w3.org/2000/svg" width="720" height="240"'
    : '';
  return `<svg${ns} viewBox="0 0 720 240" role="img" aria-label="${esc(label)}">${R(0, 0, 720, 200, wall)}${draw()}${R(0, 200, 720, 40, floor)}${R(0, 200, 720, 4, skirt)}</svg>`;
}
