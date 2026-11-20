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

/** A wall monitor showing a line graph; dark when unlit. */
function graphScreen(
  x: number,
  y: number,
  w: number,
  h: number,
  lit = true
): string {
  const frame = R(x - 3, y - 3, w + 6, h + 6, V('line'));
  if (!lit) return frame + R(x, y, w, h, V('s-shadow'));
  const pts = Array.from(
    { length: 6 },
    (_, i) =>
      `${x + 4 + (i * (w - 8)) / 5},${y + h - 6 - (((i + x) * 7) % (h - 12))}`
  ).join(' ');
  return (
    frame +
    R(x, y, w, h, V('s-screen')) +
    R(x + 4, y + h - 5, w - 8, 1, V('s-ink-soft')) +
    `<polyline points="${pts}" fill="none" stroke="${V('s-glow')}" stroke-width="2"/>`
  );
}
/** A round dial with its needle at `deg` degrees from straight up. */
function dial(cx: number, cy: number, r: number, deg: number): string {
  const a = (deg * Math.PI) / 180;
  return (
    `<circle cx="${cx}" cy="${cy}" r="${r + 3}" fill="${V('s-metal-d')}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${V('s-paper')}"/>` +
    `<path d="M${cx - r * 0.7} ${cy + r * 0.7}A${r * 0.8} ${r * 0.8} 0 0 1 ${cx} ${cy - r * 0.8}" fill="none" stroke="${V('s-led')}" stroke-width="2"/>` +
    `<path d="M${cx} ${cy - r * 0.8}A${r * 0.8} ${r * 0.8} 0 0 1 ${cx + r * 0.7} ${cy + r * 0.7}" fill="none" stroke="${V('s-stamp')}" stroke-width="2"/>` +
    `<path d="M${cx} ${cy}L${cx + Math.sin(a) * r * 0.75} ${cy - Math.cos(a) * r * 0.75}" stroke="${V('line')}" stroke-width="2.4"/>`
  );
}
/** A shipping crate, stamped once it has cleared release. */
function crate(x: number, y: number, stamped: boolean): string {
  return (
    R(x, y, 34, 28, V('s-wood-d')) +
    R(x + 3, y + 3, 28, 22, V('s-wood')) +
    `<path d="M${x + 3} ${y + 3}L${x + 31} ${y + 25}" stroke="${V('s-wood-d')}" stroke-width="3"/>` +
    (stamped ? R(x + 18, y + 6, 10, 8, V('s-stamp')) : '')
  );
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
  integration_reliability: [
    () =>
      room(
        V('s-wall-4'),
        [30, 120, 210]
          .map(
            (x, i) =>
              screen(x, 48, 64, 40, 2) +
              `<text x="${x + 32}" y="84" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="${V('s-led')}">${['A07', 'B12', 'C03'][i]}</text>`
          )
          .join('') +
          R(10, 126, 380, 10, V('s-wood')) +
          R(16, 136, 368, 46, V('s-wood-d')) +
          [70, 160, 250]
            .map(
              (x) =>
                R(x, 140, 26, 16, V('s-paper')) +
                R(x + 4, 144, 18, 2, V('s-ink-soft'))
            )
            .join('') +
          R(330, 104, 22, 22, V('s-metal-d')) +
          R(334, 96, 14, 10, V('s-paper')),
        null
      ),
    () =>
      room(
        V('s-wall-4'),
        R(130, 40, 140, 64, V('line')) +
          R(136, 46, 128, 52, V('s-screen')) +
          `<text x="200" y="86" text-anchor="middle" font-family="monospace" font-size="36" font-weight="700" fill="${V('s-led')}">042</text>` +
          [30, 110, 190, 270, 350]
            .map(
              (x) =>
                R(x, 126, 6, 56, V('s-brass')) +
                R(x - 4, 178, 14, 4, V('s-brass-d')) +
                `<circle cx="${x + 3}" cy="126" r="5" fill="${V('s-brass')}"/>`
            )
            .join('') +
          `<path d="M33 134q40 18 80 0t80 0 80 0 80 0" stroke="${V('s-stamp')}" stroke-width="4" fill="none"/>` +
          R(40, 60, 46, 60, V('s-paper')) +
          R(46, 68, 34, 4, V('s-ink-soft')) +
          R(46, 78, 26, 4, V('s-ink-soft')) +
          R(46, 88, 30, 4, V('s-ink-soft')),
        null
      ),
    (restored) =>
      room(
        V('s-wall-4'),
        R(84, 36, 232, 136, V('s-metal-d')) +
          R(90, 42, 220, 124, V('s-screen')) +
          [58, 78, 98, 118, 138, 158]
            .map((y, i) => {
              const calm = restored || i === 4;
              const d = calm
                ? `M120 ${y - 4}H300`
                : `M120 ${y - 4}` +
                  Array.from(
                    { length: 9 },
                    (_, k) =>
                      `L${140 + k * 20} ${y - 4 + (k % 2 ? -6 : 6) * (((k + i) % 3) + 1) * 0.5}`
                  ).join('');
              return (
                `<rect class="${calm ? '' : 'blink'}" x="98" y="${y - 8}" width="8" height="8" fill="${calm ? V('s-led') : V('s-stamp')}"/>` +
                `<path d="${d}" fill="none" stroke="${calm ? V('s-led') : V('s-stamp')}" stroke-width="2"/>`
              );
            })
            .join('') +
          banner(30, V('b6-cloud'), restored) +
          banner(330, V('b6-cloud'), restored),
        null
      ),
  ],
  agent_architecture: [
    () =>
      room(
        V('s-wall-3'),
        [10, 150]
          .map(
            (x) =>
              desk(x, 100) +
              screen(x + 30, 110, 40, 26, 2) +
              R(x + 46, 136, 8, 4, V('s-metal-d'))
          )
          .join('') +
          desk(290, 100) +
          screen(320, 110, 40, 26, 2) +
          plant(262),
        [300, 40]
      ),
    () =>
      room(
        V('s-wall-3'),
        Array.from(
          { length: 5 },
          (_, i) =>
            R(6 + i * 78, 96, 74, 86, V('s-shade-d')) +
            R(10 + i * 78, 100, 66, 82, V('s-shade')) +
            R(14 + i * 78, 140, 58, 6, V('s-wood')) +
            screen(28 + i * 78, 112, 30, 22, 1)
        ).join('') +
          lamp(120, 30) +
          lamp(280, 30),
        null
      ),
    (restored) => {
      const boxes = [
        [110, 52],
        [230, 52],
        [170, 100],
        [110, 140],
        [230, 140],
      ].map(([x, y], i) =>
        restored ? [x, y] : [x + ((i * 23) % 30) - 12, y + ((i * 17) % 20) - 8]
      );
      const links = [
        [0, 2],
        [1, 2],
        [2, 3],
        [2, 4],
        [0, 1],
      ];
      return room(
        V('s-wall-3'),
        R(90, 36, 220, 140, V('s-paper')) +
          R(84, 30, 232, 8, V('s-wood')) +
          links
            .map(([a, b], i) => {
              const [ax, ay] = boxes[a];
              const [bx, by] = boxes[b];
              return restored
                ? `<path d="M${ax + 20} ${ay + 10}L${bx + 20} ${by + 10}" stroke="${V('s-ink-soft')}" stroke-width="3"/>`
                : `<path d="M${ax + 20} ${ay + 10}C${ax + 90 - i * 30} ${ay - 30} ${bx - 60 + i * 20} ${by + 50} ${bx + 20} ${by + 10}" fill="none" stroke="${V('b7-body')}" stroke-width="3"/>`;
            })
            .join('') +
          boxes
            .map(
              ([x, y]) =>
                R(x, y, 40, 20, V('s-book-b')) +
                R(x + 6, y + 8, 28, 3, V('s-paper'))
            )
            .join('') +
          banner(30, V('b7-body'), restored) +
          banner(330, V('b7-body'), restored),
        null
      );
    },
  ],
  observability: [
    () =>
      room(
        V('s-wall-1'),
        [20, 108, 196]
          .map((x) => graphScreen(x, 44, 76, 46) + graphScreen(x, 100, 76, 40))
          .join('') +
          desk(40, 220) +
          R(110, 128, 36, 12, V('s-metal-d')) +
          R(170, 128, 36, 12, V('s-metal-d')),
        [306, 46]
      ),
    () =>
      room(
        V('s-wall-1'),
        [14, 144, 274]
          .map(
            (x, p) =>
              R(x - 3, 41, 118, 116, V('line')) +
              R(x, 44, 112, 110, V('s-screen')) +
              Array.from({ length: 12 }, (_, i) =>
                R(
                  x + 6,
                  50 + i * 8.6,
                  20 + (((i + p) * 37) % 80),
                  3,
                  (i + p) % 7 === 3
                    ? V('s-stamp')
                    : (i + p) % 3
                      ? V('s-glow')
                      : V('s-led')
                )
              ).join('')
          )
          .join(''),
        null
      ),
    (restored) =>
      room(
        V('s-wall-1'),
        [96, 168, 240]
          .map(
            (x, i) =>
              graphScreen(x, 44, 60, 44, restored || i === 1) +
              graphScreen(x, 100, 60, 44, restored)
          )
          .join('') +
          (restored
            ? ''
            : `<rect class="blink" x="176" y="52" width="44" height="28" fill="${V('s-shadow')}"/>`) +
          `<rect x="0" y="0" width="400" height="240" fill="${V('boss-shade')}" opacity="${restored ? 0 : 0.35}"/>` +
          banner(30, V('b8-hood'), restored) +
          banner(330, V('b8-hood'), restored),
        null
      ),
  ],
  evaluation: [
    () =>
      room(
        V('s-wall-5'),
        desk(30, 200) +
          R(50, 128, 160, 12, V('s-wood-d')) +
          ['s-book-a', 's-book-b', 's-book-c', 's-book-d', 's-led', 's-glow']
            .map(
              (c, i) =>
                R(58 + i * 24, 92, 12, 36, V('s-paper')) +
                R(
                  58 + i * 24,
                  92 + ((i * 11) % 20),
                  12,
                  36 - ((i * 11) % 20),
                  V(c)
                ) +
                `<path d="M${64 + i * 24} 104l3 4-3 4-3-4z" fill="${V('s-paper')}"/>`
            )
            .join('') +
          cabinet(300, 106, 64, 2),
        [296, 40]
      ),
    () =>
      room(
        V('s-wall-5'),
        Array.from(
          { length: 5 },
          (_, i) =>
            cabinet(14 + i * 76, 60, 68, 4, 's-metal') +
            Array.from({ length: 4 }, (_, k) =>
              R(14 + i * 76 + 22, 68 + k * 26, 24, 6, V('s-paper'))
            ).join('')
        ).join('') + R(0, 50, SW, 6, V('s-metal-d')),
        null
      ),
    (restored) =>
      room(
        V('s-wall-5'),
        R(84, 34, 232, 140, V('s-metal-d')) +
          R(90, 40, 220, 128, V('s-screen')) +
          [0, 1, 2, 3, 4]
            .map(
              (i) =>
                R(100, 52 + i * 22, 14, 14, V('s-paper')) +
                R(
                  122,
                  54 + i * 22,
                  restored ? 150 : 40 + ((i * 67) % 150),
                  10,
                  V(['s-led', 's-glow', 'b9-ruler', 's-book-a', 's-book-d'][i])
                )
            )
            .join('') +
          (restored
            ? ''
            : `<path d="M290 150l10-14 10 14M300 136v24" stroke="${V('s-stamp')}" stroke-width="3" fill="none"/>`) +
          banner(30, V('b9-body'), restored) +
          banner(330, V('b9-body'), restored),
        null
      ),
  ],
  guardrails_security: [
    () =>
      room(
        V('s-wall-2'),
        R(20, 66, 110, 116, V('s-metal-d')) +
          R(26, 72, 98, 110, V('s-metal')) +
          R(34, 82, 82, 40, V('s-window')) +
          R(30, 128, 90, 6, V('s-wood')) +
          R(146, 96, 16, 86, V('s-metal-d')) +
          R(162, 116, 220, 12, V('s-paper')) +
          [0, 1, 2, 3, 4, 5]
            .map((i) => R(172 + i * 36, 116, 18, 12, V('s-stamp')))
            .join('') +
          R(132, 132, 12, 20, V('s-screen')) +
          `<rect class="blink" x="135" y="136" width="6" height="4" fill="${V('s-led')}"/>` +
          R(135, 144, 6, 4, V('s-paper')),
        [300, 40]
      ),
    () =>
      room(
        V('s-wall-2'),
        door(30, true) +
          door(330, false) +
          R(140, 44, 120, 14, V('s-metal-d')) +
          R(140, 44, 16, 138, V('s-metal-d')) +
          R(244, 44, 16, 138, V('s-metal-d')) +
          R(186, 34, 28, 10, V('s-metal')) +
          `<rect class="blink" x="194" y="36" width="12" height="6" fill="${V('s-led')}"/>` +
          [76, 100, 124, 148]
            .map(
              (y) =>
                `<path d="M158 ${y}H242" stroke="${V('s-glow')}" stroke-width="2" stroke-dasharray="6 4" opacity=".8"/>`
            )
            .join(''),
        null
      ),
    (restored) =>
      room(
        V('s-wall-2'),
        R(120, 48, 160, 132, V('s-metal-d')) +
          R(130, 58, 140, 112, V('s-shadow')) +
          [0, 1, 2]
            .map((r) =>
              [0, 1, 2, 3, 4]
                .map((k) =>
                  restored || (r + k) % 3 === 0
                    ? `<g transform="translate(${146 + k * 26} ${72 + r * 32})"><circle r="5" fill="none" stroke="${V('s-brass')}" stroke-width="3"/><path d="M0 5v12M0 13h4M0 17h3" stroke="${V('s-brass')}" stroke-width="3"/></g>`
                    : ''
                )
                .join('')
            )
            .join('') +
          (restored
            ? R(130, 58, 140, 112, V('s-metal')) +
              `<circle cx="200" cy="114" r="24" fill="none" stroke="${V('s-metal-d')}" stroke-width="6"/>` +
              `<path d="M200 90v48M176 114h48" stroke="${V('s-metal-d')}" stroke-width="5"/>` +
              R(252, 104, 10, 20, V('s-brass'))
            : `<path d="M280 48l60 -12v156l-60 -12z" fill="${V('s-metal')}"/>` +
              `<g transform="translate(70 196) rotate(30)"><circle r="5" fill="none" stroke="${V('s-brass')}" stroke-width="3"/><path d="M0 5v12" stroke="${V('s-brass')}" stroke-width="3"/></g>`) +
          banner(30, V('b10-coat'), restored),
        null
      ),
  ],
  debugging_incidents: [
    () =>
      room(
        V('s-wall-4'),
        R(20, 146, 150, 14, V('s-shade')) +
          R(20, 140, 40, 10, V('s-paper')) +
          R(60, 142, 110, 12, V('s-book-b')) +
          R(24, 160, 6, 22, V('s-metal-d')) +
          R(160, 160, 6, 22, V('s-metal-d')) +
          `<circle cx="200" cy="70" r="24" fill="${V('s-metal-d')}"/><circle cx="200" cy="70" r="20" fill="${V('s-paper')}"/>` +
          `<path d="M200 70V54M200 70H212" stroke="${V('line')}" stroke-width="3"/>` +
          R(280, 130, 100, 8, V('s-wood')) +
          R(286, 138, 88, 44, V('s-wood-d')) +
          R(300, 84, 44, 46, V('s-metal-d')) +
          R(306, 90, 32, 10, V('s-screen')) +
          R(312, 110, 20, 18, V('s-paper')) +
          R(314, 120, 16, 8, V('el-cafe')) +
          `<path class="steam" d="M318 106q-3 -4 0 -8M326 106q-3 -4 0 -8" stroke="${V('s-paper')}" stroke-width="2" fill="none"/>`,
        null
      ),
    () =>
      room(
        V('s-wall-4'),
        R(20, 38, 360, 124, V('s-metal-d')) +
          Array.from({ length: 32 }, (_, i) => {
            const c = (i * 7) % 5;
            return `<rect class="${c === 0 ? 'blink' : ''}" x="${28 + (i % 8) * 44}" y="${46 + Math.floor(i / 8) * 28}" width="38" height="22" fill="${c < 2 ? V('s-stamp') : c < 4 ? V('s-book-c') : V('s-led')}"/>`;
          }).join(''),
        null
      ),
    (restored) =>
      room(
        V('s-wall-4'),
        R(190, 26, 20, 10, V('s-metal-d')) +
          `<circle class="${restored ? '' : 'blink'}" cx="200" cy="44" r="10" fill="${restored ? V('s-led') : V('b11-beacon')}"/>` +
          graphScreen(140, 64, 120, 54, true) +
          R(50, 140, 300, 10, V('s-wood')) +
          R(60, 150, 280, 4, V('s-wood-d')) +
          R(70, 150, 8, 32, V('s-wood-d')) +
          R(322, 150, 8, 32, V('s-wood-d')) +
          [96, 160, 224, 288]
            .map((x) => R(x, 124, 22, 16, V('s-shade-d')))
            .join('') +
          `<rect x="0" y="0" width="400" height="240" fill="${restored ? V('s-led') : V('b11-beacon')}" opacity=".12"/>` +
          banner(20, V('b11-case'), restored) +
          banner(336, V('b11-case'), restored),
        null
      ),
  ],
  fleet_operations: [
    () =>
      room(
        V('s-wall-3'),
        R(0, 34, SW, 10, V('s-book-c')) +
          Array.from(
            { length: 20 },
            (_, i) =>
              `<path d="M${i * 20} 44l10 -10h8l-10 10z" fill="${V('line')}"/>`
          ).join('') +
          [16, 112, 208, 304]
            .map(
              (x) =>
                R(x, 150, 76, 6, V('s-metal-d')) +
                R(x + 6, 156, 4, 26, V('s-metal-d')) +
                R(x + 66, 156, 4, 26, V('s-metal-d')) +
                R(x + 24, 120, 28, 26, V('s-metal')) +
                R(x + 36, 110, 2, 10, V('s-metal-d')) +
                R(x + 34, 106, 6, 4, V('s-led')) +
                R(x + 29, 128, 5, 5, V('s-screen')) +
                R(x + 42, 128, 5, 5, V('s-screen')) +
                R(x + 32, 146, 12, 4, V('s-metal-d'))
            )
            .join('') +
          lamp(100, 50) +
          lamp(300, 50),
        null
      ),
    () =>
      room(
        V('s-wall-3'),
        R(0, 148, SW, 12, V('s-metal-d')) +
          Array.from(
            { length: 13 },
            (_, i) =>
              `<circle cx="${10 + i * 32}" cy="166" r="6" fill="${V('s-metal')}"/>`
          ).join('') +
          R(0, 172, SW, 4, V('s-metal-d')) +
          [30, 130, 230, 330]
            .map(
              (x, i) =>
                R(x, 120, 40, 28, V('s-wood')) +
                R(x + 16, 120, 8, 28, V('s-paper')) +
                `<circle cx="${x + 20}" cy="80" r="12" fill="${i === 2 ? V('s-stamp') : V('s-led')}"/>` +
                (i === 2
                  ? `<path d="M${x + 14} 74l12 12M${x + 26} 74l-12 12" stroke="${V('s-paper')}" stroke-width="3"/>`
                  : `<path d="M${x + 13} 80l5 5 9-10" stroke="${V('s-paper')}" stroke-width="3" fill="none"/>`) +
                R(x + 19, 92, 2, 28, V('s-metal-d'))
            )
            .join(''),
        null
      ),
    (restored) =>
      room(
        V('s-wall-3'),
        R(116, 36, 168, 146, V('s-metal-d')) +
          R(124, 44, 152, 138, V('s-metal')) +
          [0, 1, 2, 3, 4, 5, 6, 7]
            .map((i) => R(124, 54 + i * 16, 152, 2, V('s-metal-d')))
            .join('') +
          R(124, 44, 152, 8, V('s-book-c')) +
          (restored
            ? crate(20, 154, true) +
              crate(56, 154, true) +
              crate(38, 126, true) +
              crate(310, 154, true) +
              crate(346, 154, true) +
              crate(328, 126, true)
            : `<g transform="rotate(-12 60 170)">${crate(40, 156, false)}</g>` +
              crate(150, 160, false) +
              `<g transform="rotate(18 330 160)">${crate(310, 146, false)}</g>` +
              `<g transform="rotate(-6 250 180)">${crate(232, 166, false)}</g>`) +
          banner(30, V('b12-a'), restored) +
          banner(330, V('b12-b'), restored),
        null
      ),
  ],
  cost_latency: [
    () =>
      room(
        V('s-wall-2'),
        [
          [60, 70, 20],
          [130, 70, 230],
          [200, 70, 70],
          [60, 130, 300],
          [130, 130, 40],
          [200, 130, 110],
        ]
          .map(([x, y, d]) => dial(x, y, 24, d))
          .join('') +
          R(250, 60, 10, 122, V('s-pipe')) +
          R(250, 60, 30, 10, V('s-pipe')),
        [300, 40]
      ),
    () =>
      room(
        V('s-wall-2'),
        [44, 96, 148]
          .map(
            (y) =>
              R(10, y + 30, 380, 6, V('s-wood')) +
              Array.from(
                { length: 11 },
                (_, i) =>
                  R(18 + i * 34, y, 28, 30, V('s-wood-d')) +
                  R(22 + i * 34, y + 8, 20, 10, V('s-paper')) +
                  R(25 + i * 34, y + 12, 14, 2, V('s-ink-soft'))
              ).join('')
          )
          .join(''),
        null
      ),
    (restored) =>
      room(
        V('s-wall-2'),
        R(150, 32, 100, 16, V('s-metal-d')) +
          R(144, 36, 6, 8, V('s-metal')) +
          R(250, 36, 6, 8, V('s-metal')) +
          (restored
            ? `<path d="M164 48H236V84l-6 6-6-6-6 6-6-6-6 6-6-6-6 6-6-6-6 6-6-6-6 6-6-6Z" fill="${V('s-paper')}"/>` +
              [56, 64, 72]
                .map((y) => R(172, y, 56, 3, V('s-ink-soft')))
                .join('')
            : R(164, 48, 72, 134, V('s-paper')) +
              `<path d="M164 182q-20 18 -80 14q60 -4 80 -14z" fill="${V('s-paper')}"/>` +
              `<path d="M236 182c30 10 60 4 80 14h-80z" fill="${V('s-paper')}"/>` +
              Array.from({ length: 14 }, (_, i) =>
                R(172, 56 + i * 9, 30 + ((i * 13) % 26), 3, V('s-ink-soft'))
              ).join('') +
              R(172, 172, 56, 4, V('s-stamp'))) +
          desk(20, 100) +
          R(40, 112, 50, 28, V('b13-case')) +
          R(46, 116, 38, 10, V('b13-lcd')) +
          banner(330, V('b13-case'), restored),
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
