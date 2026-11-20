/**
 * The sets: three places per exam domain (a main room, an annex, the boss room), drawn in
 * the flat language of frieze() in src/office/draw.ts. Each has a window whose sky follows
 * the time of day set on the scene, so a chapter visibly moves from morning to night.
 */
import { R } from './art';

const V = (t: string) => `var(--${t})`;
const SW = 400;
const SH = 240;

function room(
  wall: string,
  inner: string,
  win: [number, number] | null = [292, 40]
): string {
  let s =
    R(0, 0, SW, 26, V('s-ceil')) +
    R(0, 26, SW, 4, V('s-beam')) +
    R(0, 30, SW, 150, wall) +
    R(0, 160, SW, 22, V('s-wains')) +
    R(0, 180, SW, 3, V('line')) +
    R(0, 183, SW, 57, V('s-floor'));
  for (let y = 198; y < SH; y += 16) s += R(0, y, SW, 1.2, V('s-floor-d'));
  for (let x = 20; x < SW; x += 70)
    s += R(x, 183 + ((x / 70) % 2 ? 0 : 15), 1.2, 15, V('s-floor-d'));
  if (win) s += windowAt(win[0], win[1]);
  return (
    s + inner + `<rect class="tint" x="0" y="0" width="${SW}" height="${SH}"/>`
  );
}
function windowAt(x: number, y: number): string {
  return (
    R(x - 3, y - 3, 70, 56, V('s-wood')) +
    R(x, y, 64, 50, 'var(--sky-now)') +
    `<circle class="orb" cx="${x + 46}" cy="${y + 16}" r="7" fill="var(--sky-orb)"/>` +
    R(x + 30, y, 4, 50, V('s-wood')) +
    R(x, y + 23, 64, 4, V('s-wood')) +
    R(x - 6, y + 50, 76, 5, V('s-wood-d'))
  );
}
function shelf(
  x: number,
  y: number,
  w: number,
  h: number,
  books = ['s-book-a', 's-book-b', 's-book-c', 's-book-d']
): string {
  let s =
    R(x, y, w, h, V('s-wood')) + R(x + 3, y + 3, w - 6, h - 6, V('s-wood-d'));
  for (let row = 0; row < Math.floor((h - 6) / 26); row++) {
    const by = y + 6 + row * 26;
    let bx = x + 5;
    let k = row;
    while (bx < x + w - 10) {
      const bw = 5 + ((k * 7) % 5);
      const bh = 16 + ((k * 3) % 6);
      s += R(bx, by + 20 - bh, bw, bh, V(books[k % books.length]));
      bx += bw + 1;
      k++;
    }
    s += R(x + 3, by + 20, w - 6, 3, V('s-wood'));
  }
  return s;
}
function lamp(x: number, y: number): string {
  return (
    R(x - 1, 0, 2, y, V('line')) +
    `<path d="M${x - 14} ${y + 12}L${x - 6} ${y}H${x + 6}L${x + 14} ${y + 12}Z" fill="${V('s-lamp')}"/>` +
    `<path class="glow" d="M${x - 14} ${y + 12}L${x - 40} ${y + 70}H${x + 40}L${x + 14} ${y + 12}Z" fill="${V('s-light')}"/>`
  );
}
function screen(x: number, y: number, w: number, h: number, lines = 3): string {
  let s =
    R(x - 3, y - 3, w + 6, h + 6, V('line')) + R(x, y, w, h, V('s-screen'));
  for (let i = 0; i < lines; i++)
    s += R(
      x + 6,
      y + 8 + i * 9,
      Math.max(8, w - 14 - ((i * 13) % 24)),
      3,
      i === lines - 1 ? V('s-led') : V('s-glow')
    );
  return s;
}
function desk(x: number, w = 90): string {
  return (
    R(x, 140, w, 8, V('s-wood')) +
    R(x + 6, 148, 6, 34, V('s-wood-d')) +
    R(x + w - 12, 148, 6, 34, V('s-wood-d'))
  );
}
function cabinet(
  x: number,
  y: number,
  w: number,
  rows: number,
  color = 's-metal'
): string {
  let s = R(x, y, w, rows * 26 + 6, V(`${color}-d`));
  for (let i = 0; i < rows; i++)
    s +=
      R(x + 4, y + 4 + i * 26, w - 8, 22, V(color)) +
      R(x + w / 2 - 6, y + 12 + i * 26, 12, 3, V(`${color}-d`));
  return s;
}
function door(x: number, lock = false, open = false): string {
  return (
    R(x - 4, 76, 48, 106, V('s-wood-d')) +
    (open
      ? R(x, 80, 40, 102, V('s-shadow')) +
        `<path d="M${x} 80l-14 8v86l14 8z" fill="${V('s-wood')}"/>`
      : R(x, 80, 40, 102, V('s-wood')) +
        R(x + 6, 86, 28, 40, V('s-wood-d')) +
        R(x + 30, 132, 5, 5, V('s-brass'))) +
    (lock
      ? R(x + 14, 120, 12, 10, V('s-brass')) +
        `<path d="M${x + 16} 120v-4a4 4 0 0 1 8 0v4" stroke="${V('s-metal-d')}" stroke-width="2" fill="none"/>`
      : '')
  );
}
function plant(x: number): string {
  return (
    R(x, 150, 22, 30, V('s-pot')) +
    `<path d="M${x + 11} 150c-14-18-6-34 0-40c6 6 14 22 0 40z" fill="${V('s-leaf')}"/>`
  );
}
function banner(x: number, color: string, torn: boolean): string {
  return torn
    ? R(x, 40, 4, 30, V('line')) +
        `<path d="M${x + 4} 40h36v18l-8 6-10-4-18 8z" fill="${color}" opacity=".55"/>`
    : R(x, 40, 4, 90, V('line')) +
        `<path d="M${x + 4} 40h36v70l-18-12-18 12z" fill="${color}"/>`;
}
function puddle(cx: number, w: number): string {
  return `<ellipse cx="${cx}" cy="200" rx="${w}" ry="10" fill="${V('b5-puddle')}" opacity=".85"/>`;
}

type Place = (restored: boolean) => string;
const KITS: Record<string, [Place, Place, Place]> = {
  agentic_architecture: [
    () =>
      room(
        V('s-wall-3'),
        screen(140, 46, 120, 78, 0) +
          `<g transform="translate(200 86)"><circle r="30" fill="none" stroke="${V('s-glow')}" stroke-width="2"/><circle r="18" fill="none" stroke="${V('s-glow')}" stroke-width="2"/><path class="sweep" d="M0 0L0 -30A30 30 0 0 1 21 -21Z" fill="${V('s-glow')}" opacity=".6"/><circle cx="-12" cy="8" r="3" fill="${V('s-led')}"/><circle cx="14" cy="12" r="3" fill="${V('s-led')}"/></g>` +
          desk(20) +
          screen(44, 112, 42, 26, 2) +
          desk(290) +
          plant(262),
        [300, 40]
      ),
    () =>
      room(
        V('s-wall-3'),
        R(24, 46, 150, 90, V('s-paper')) +
          [
            [40, 60],
            [100, 60],
            [70, 104],
          ]
            .map(([x, y]) => R(x, y, 44, 20, V('s-book-b')))
            .join('') +
          `<path d="M62 80v24M122 80l-20 24" stroke="${V('line')}" stroke-width="3"/>` +
          [200, 250]
            .map(
              (x) =>
                screen(x, 108, 34, 30, 2) +
                R(x + 12, 141, 10, 40, V('s-metal-d'))
            )
            .join('')
      ),
    (restored) =>
      room(
        V('s-wall-3'),
        `<circle cx="200" cy="96" r="54" fill="none" stroke="${restored ? V('s-led') : V('b1-body')}" stroke-width="10" stroke-dasharray="${restored ? '0' : '260 80'}"/>` +
          `<path d="M246 60l20 -4 -8 18z" fill="${restored ? V('s-led') : V('b1-body')}"/>` +
          banner(40, V('b1-body'), restored) +
          banner(330, V('b1-body'), restored),
        null
      ),
  ],
  claude_code: [
    () =>
      room(
        V('s-wall-5'),
        screen(120, 44, 160, 92, 5) +
          `<rect class="blink" x="138" y="122" width="8" height="8" fill="${V('s-led')}"/>` +
          desk(130, 140) +
          cabinet(24, 70, 64, 4) +
          [326, 346, 366]
            .map(
              (x) =>
                R(x, 60, 4, 10, V('s-metal-d')) +
                `<path d="M${x + 2} 70q6 6 0 10" stroke="${V('s-metal-d')}" stroke-width="3" fill="none"/>`
            )
            .join(''),
        null
      ),
    () =>
      room(
        V('s-wall-5'),
        door(30, true) + door(130, true) + door(230, true) + door(330, false),
        null
      ),
    (restored) =>
      room(
        V('s-wall-5'),
        `<circle cx="200" cy="110" r="64" fill="${V('s-metal-d')}"/><circle cx="200" cy="110" r="54" fill="${restored ? V('s-metal') : V('s-shadow')}"/>` +
          (restored
            ? `<path d="M170 110h60M200 80v60" stroke="${V('s-metal-d')}" stroke-width="8"/>` +
              R(186, 96, 28, 28, V('s-brass'))
            : `<path d="M264 60l44 -14v128l-44 -14z" fill="${V('s-metal')}"/>`) +
          banner(30, V('b2-coat'), restored),
        null
      ),
  ],
  prompt_engineering: [
    () =>
      room(
        V('s-wall-1'),
        shelf(18, 44, 92, 116) +
          shelf(140, 70, 60, 90) +
          lamp(200, 30) +
          R(150, 168, 40, 14, V('s-book-b')) +
          R(154, 160, 34, 8, V('s-book-c')),
        [296, 46]
      ),
    () =>
      room(
        V('s-wall-1'),
        shelf(10, 44, 70, 116) +
          shelf(320, 44, 70, 116) +
          R(170, 120, 60, 62, V('s-wood-d')) +
          `<path d="M150 120l50 -20 50 20z" fill="${V('s-wood')}"/>` +
          `<path d="M156 116l44 -14v-4l-44 14zM244 116l-44 -14v-4l44 14z" fill="${V('s-paper')}"/>` +
          `<text x="186" y="80" font-family="monospace" font-size="28" font-weight="700" fill="${V('s-paper')}">{ }</text>` +
          lamp(200, 24),
        null
      ),
    (restored) =>
      room(
        V('s-wall-1'),
        R(140, 36, 120, 146, V('s-paper')) +
          R(132, 30, 136, 10, V('s-wood')) +
          R(132, 176, 136, 10, V('s-wood')) +
          [50, 66, 82, 98, 114, 130, 146]
            .map((y, i) =>
              R(
                152 + (restored ? 0 : (i * 11) % 30),
                y,
                restored ? 96 : 50 + ((i * 17) % 40),
                4,
                V('s-ink-soft')
              )
            )
            .join('') +
          banner(40, V('b3-robe'), restored) +
          banner(330, V('b3-robe'), restored),
        null
      ),
  ],
  tool_design_mcp: [
    () =>
      room(
        V('s-wall-4'),
        R(0, 34, SW, 8, V('s-metal-d')) +
          R(0, 46, SW, 6, V('s-pipe')) +
          [24, 84, 300, 350]
            .map(
              (x, i) =>
                R(x, 66, 46, 116, V('s-metal-d')) +
                [76, 96, 116, 136, 156]
                  .map(
                    (y, k) =>
                      R(x + 4, y, 38, 14, V('s-metal')) +
                      `<rect class="${(i + k) % 3 ? '' : 'blink'}" x="${x + 34}" y="${y + 5}" width="4" height="4" fill="${V('s-led')}"/>`
                  )
                  .join('')
            )
            .join('') +
          `<path d="M70 182C120 172 180 190 230 180S300 186 330 182" stroke="${V('s-cable')}" stroke-width="5" fill="none"/>`,
        null
      ),
    () =>
      room(
        V('s-wall-4'),
        R(60, 50, 280, 110, V('s-metal-d')) +
          Array.from(
            { length: 24 },
            (_, i) =>
              `<circle cx="${86 + (i % 8) * 32}" cy="${72 + Math.floor(i / 8) * 32}" r="6" fill="${V('s-screen')}"/>`
          ).join('') +
          `<g fill="none" stroke-width="4"><path d="M86 72q40 60 96 32" stroke="${V('s-book-a')}"/><path d="M150 72q60 70 96 64" stroke="${V('s-book-c')}"/><path d="M214 104q40 -40 96 32" stroke="${V('s-led')}"/></g>`,
        null
      ),
    (restored) =>
      room(
        V('s-wall-4'),
        R(110, 40, 180, 140, V('s-wood')) +
          R(120, 50, 160, 90, V('s-metal-d')) +
          Array.from(
            { length: 15 },
            (_, i) =>
              `<rect x="${130 + (i % 5) * 30}" y="${60 + Math.floor(i / 5) * 26}" width="12" height="12" fill="${restored || i % 4 ? V('s-led') : V('s-stamp')}"/>`
          ).join('') +
          `<path d="M130 150q70 ${restored ? 0 : 30} 140 0" stroke="${V('s-cable')}" stroke-width="4" fill="none"/>` +
          banner(40, V('b4-robe'), restored) +
          banner(330, V('b4-robe'), restored),
        null
      ),
  ],
  context_management: [
    () =>
      room(
        V('s-wall-2'),
        R(30, 60, 70, 50, V('s-paper')) +
          R(36, 66, 58, 4, V('s-ink-soft')) +
          R(36, 76, 40, 4, V('s-ink-soft')) +
          cabinet(300, 70, 70, 4) +
          desk(130, 140) +
          R(150, 126, 18, 14, V('s-stamp')) +
          lamp(220, 40),
        [176, 46]
      ),
    () =>
      room(
        V('s-wall-2'),
        Array.from({ length: 7 }, (_, i) =>
          cabinet(10 + i * 56, 64, 50, 4, i > 4 ? 's-shade' : 's-metal')
        ).join('') + R(0, 52, SW, 6, V('s-wood')),
        null
      ),
    (restored) =>
      room(
        V('s-wall-2'),
        cabinet(30, 70, 60, 4) +
          cabinet(310, 70, 60, 4) +
          (restored ? '' : puddle(200, 160) + puddle(90, 50)) +
          R(150, 36, 100, 10, V('s-pipe')) +
          R(196, 46, 8, restored ? 20 : 40, V('s-pipe')) +
          (restored
            ? R(188, 66, 24, 8, V('s-brass'))
            : `<path class="drip" d="M200 90q4 8 0 11q-4 -3 0 -11z" fill="${V('b5-puddle')}"/>`),
        null
      ),
  ],
};

export const svgWrap = (inner: string, cls = '') =>
  `<svg class="setsvg ${cls}" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" shape-rendering="crispEdges">${inner}</svg>`;

export function placeSvg(
  domain: string,
  place: number,
  restored = false,
  cls = ''
): string {
  return svgWrap(KITS[domain][place](restored), cls);
}

/** Place of a step: the main room, then the annex, then the boss room. */
export const placeOfStep = (step: number): number =>
  step >= 4 ? 2 : step >= 2 ? 1 : 0;
/** Time of day of a step: morning to night, then dawn once the boss is down. */
export const timeOfStep = (step: number, restored = false): string =>
  restored
    ? 'dawn'
    : (['morning', 'day', 'day', 'dusk', 'night'][step] ?? 'night');

export function titleSet(): string {
  return svgWrap(
    room(
      V('s-wall-1'),
      shelf(10, 40, 80, 120) +
        shelf(310, 40, 80, 120) +
        R(150, 108, 100, 6, V('s-wood')) +
        lamp(200, 22),
      [168, 44]
    )
  );
}
