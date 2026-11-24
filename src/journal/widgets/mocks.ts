/** Three wordless page mock-ups for the first-glance test, drawn as SVG. */

type Shape = [
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  r?: number,
];

interface Mock {
  id: string;
  background: string;
  shapes: Shape[];
}

const VIEW_W = 160;
const VIEW_H = 100;

const calm: Mock = {
  id: 'calm',
  background: '#fffdf8',
  shapes: [
    [12, 9, 14, 4, '#171b2b', 1],
    [118, 9, 9, 3, '#c9cdda', 1],
    [131, 9, 9, 3, '#c9cdda', 1],
    [144, 9, 5, 3, '#c9cdda', 1],
    [12, 30, 62, 9, '#171b2b', 1],
    [12, 43, 48, 9, '#171b2b', 1],
    [12, 60, 58, 2.5, '#9aa3bd', 1],
    [12, 66, 50, 2.5, '#9aa3bd', 1],
    [12, 77, 26, 9, '#1f3fd1', 4],
    [92, 26, 56, 60, '#f3eee2', 4],
    [104, 40, 32, 32, '#f2c230', 16],
  ],
};

const busyColors = [
  '#ff00c8',
  '#00e5ff',
  '#b6ff00',
  '#ff2a00',
  '#7a00ff',
  '#ffe600',
];
const busy: Mock = {
  id: 'busy',
  background: '#ffff3b',
  shapes: [
    [0, 0, 160, 11, '#ff2a00'],
    [2, 2, 30, 7, '#00e5ff'],
    [36, 1, 50, 9, '#b6ff00'],
    [90, 3, 68, 5, '#7a00ff'],
    [0, 13, 160, 6, '#171b2b'],
    ...Array.from(
      { length: 24 },
      (_, i): Shape => [
        3 + (i % 8) * 19.5,
        22 + Math.floor(i / 8) * 21,
        17,
        18,
        busyColors[(i * 5 + Math.floor(i / 8)) % busyColors.length] ??
          '#ff00c8',
      ]
    ),
    ...Array.from(
      { length: 24 },
      (_, i): Shape => [
        5 + (i % 8) * 19.5,
        33 + Math.floor(i / 8) * 21,
        13,
        2,
        '#171b2b',
      ]
    ),
    [0, 86, 160, 14, '#ff00c8'],
    [4, 89, 40, 8, '#ffe600'],
    [50, 88, 106, 3, '#171b2b'],
    [50, 93, 80, 3, '#171b2b'],
  ],
};

const plain: Mock = {
  id: 'plain',
  background: '#d6d6d6',
  shapes: [
    [6, 6, 148, 3, '#6f6f6f'],
    ...Array.from(
      { length: 19 },
      (_, i): Shape => [6, 14 + i * 4.4, i % 5 === 4 ? 90 : 148, 2.2, '#8a8a8a']
    ),
  ],
};

function draw(mock: Mock): string {
  const shapes = mock.shapes
    .map(
      ([x, y, w, h, fill, r = 0]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`
    )
    .join('');
  return (
    `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
    `<rect width="${VIEW_W}" height="${VIEW_H}" fill="${mock.background}"/>${shapes}</svg>`
  );
}

/** A grey checker that wipes the afterimage of the screen just shown. */
export const MASK: string =
  `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">` +
  Array.from({ length: 160 }, (_, i) => {
    const col = i % 16;
    const row = Math.floor(i / 16);
    const fill = (col + row) % 2 ? '#8d8d8d' : '#b9b9b9';
    return `<rect x="${col * 10}" y="${row * 10}" width="10" height="10" fill="${fill}"/>`;
  }).join('') +
  '</svg>';

export const MOCK_SCREENS: string[] = [calm, busy, plain].map(draw);
