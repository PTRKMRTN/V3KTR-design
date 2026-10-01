// Pixel icons for the site's "How it works" steps (site-v2 request, Patrick 2026-10-01: a trial; they ship only if they work).
// Drawn as ASCII on a 12x12 grid, one block per animatable part (<g id>), so the site can move parts with CSS.
// Each SVG as written is the REST frame: it must read on its own with motion off (prefers-reduced-motion).
//   node scripts/build-step-icons.mjs   → brand/icons/steps/{bring,depth,stack,out}.svg
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const OUT = fileURLToPath(new URL('../brand/icons/steps/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// '#' = a pixel. Rows run into a path of horizontal runs (one subpath per run).
const path = (rows) => rows.map((r, y) => {
  let d = '', x = 0;
  while (x < r.length) {
    if (r[x] !== '#') { x++; continue; }
    const s = x; while (r[x] === '#') x++;
    d += `M${s} ${y}h${x - s}v1h${s - x}z`;
  }
  return d;
}).join('');
// Paint order: later parts sit in front. hide = parts present for animation but hidden at rest.
const svg = (title, parts, hide = []) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="currentColor" shape-rendering="crispEdges" role="img">
  <title>${title}</title>
${parts.map(([id, rows]) => `  <g id="${id}"${hide.includes(id) ? ' visibility="hidden"' : ''}><path d="${path(rows)}"/></g>`).join('\n')}
</svg>
`;

// 1. Bring an image or clip: a tile above a frame whose top edge is open; the tile drops in (translateY ~6).
const bring = svg('Bring an image or clip', [
  ['frame', [
    '............',
    '............',
    '............',
    '............',
    '.###....###.',
    '.#........#.',
    '.#........#.',
    '.#........#.',
    '.#........#.',
    '.#........#.',
    '.#........#.',
    '.##########.']],
  ['tile', [
    '....####....',
    '....####....',
    '....####....']],
]);

// 2. Depth is read: three layers offset on a diagonal (back, middle outlines; front solid). Each layer only draws the
// pixels the layer in front doesn't cover, so animating from all-at-the-front-position (merged) to rest reads as a split.
// Build depth from rectangles with occlusion rather than by hand.
const grid = () => Array.from({ length: 12 }, () => Array(12).fill('.'));
const outline = (g, x0, y0, n) => { for (let i = 0; i < n; i++) { g[y0][x0 + i] = g[y0 + n - 1][x0 + i] = g[y0 + i][x0] = g[y0 + i][x0 + n - 1] = '#'; } return g; };
const solid = (g, x0, y0, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) g[y0 + y][x0 + x] = '#'; return g; };
const minus = (g, x0, y0, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) g[y0 + y][x0 + x] = '.'; return g; };
const rows = (g) => g.map((r) => r.join(''));
const back = minus(minus(outline(grid(), 1, 1, 7), 3, 3, 7), 5, 5, 7);
const mid = minus(outline(grid(), 3, 3, 7), 5, 5, 7);
const front = solid(grid(), 5, 5, 7);
const depthSvg = svg('Depth is read', [['layer-3', rows(back)], ['layer-2', rows(mid)], ['layer-1', rows(front)]]);

// 3. Stack or roll: a pixel die showing three; faces one and five are there, hidden, for a roll (swap faces, nudge the die).
const pips = (cells) => { const g = grid(); for (const [x, y] of cells) solid(g, x, y, 2); return rows(g); };
const stack = svg('Stack or roll', [
  ['die', rows(outline(grid(), 0, 0, 12))],
  ['face-3', pips([[2, 2], [5, 5], [8, 8]])],
  ['face-1', pips([[5, 5]])],
  ['face-5', pips([[2, 2], [8, 2], [5, 5], [2, 8], [8, 8]])],
], ['face-1', 'face-5']);

// 4. Take it out: the tile is half out of a frame whose right side is open, and a pixel chevron points the way.
// Tile and arrow both slide right (and the arrow can blink); at rest the tile straddles the opening.
const out = svg('Take it out', [
  ['frame', [
    '............',
    '............',
    '######......',
    '#....#......',
    '#...........',
    '#...........',
    '#...........',
    '#...........',
    '#....#......',
    '######......']],
  ['tile', [
    '............',
    '............',
    '............',
    '............',
    '....####....',
    '....####....',
    '....####....',
    '....####....']],
  ['arrow', [
    '............',
    '............',
    '............',
    '.........#..',
    '..........#.',
    '...........#',
    '...........#',
    '..........#.',
    '.........#..']],
]);

for (const [n, s] of [['bring', bring], ['depth', depthSvg], ['stack', stack], ['out', out]]) writeFileSync(OUT + n + '.svg', s);
console.log('brand/icons/steps: bring, depth, stack, out');
