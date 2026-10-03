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

// v0.29.0 (Patrick 2026-10-03: approved, synced across the apps): the same four as a module apps pull, like
// icons/menu-icons.js. Inner markup only (the <g id> moving parts kept, so CSS can animate them); the step's title
// goes in as the label, or the icon is hidden when the step's text sits beside it. The moving parts are classes here, not
// ids, so an app can show the same icon twice on a page.
const STEPS = Object.fromEntries([['bring', bring], ['depth', depthSvg], ['stack', stack], ['out', out]].map(([n, s]) => {
  const title = s.match(/<title>([^<]*)<\/title>/)[1];
  const inner = s.replace(/^[\s\S]*?<\/title>\s*/, '').replace(/\s*<\/svg>\s*$/, '').replace(/\n\s*/g, '').replace(/<g id="/g, '<g class="');
  return [n, { title, inner }];
}));
const ICONS_DIR = new URL('../icons/', import.meta.url);
writeFileSync(new URL('step-icons.json', ICONS_DIR), JSON.stringify({ grid: 12, steps: STEPS }, null, 2) + '\n');
writeFileSync(new URL('step-icons.js', ICONS_DIR), `// V3KTR step icons (v0.29.0). GENERATED by scripts/build-step-icons.mjs from its ASCII grids: don't edit here.
// Four 12×12 pixel icons for the four steps (bring · depth · stack · out), the same on the site's "How it works" and
// in every app (empty states, first-run hints). currentColor, crisp edges, neutral: tint them with the surface's
// colour. Each moving part is a <g class> for CSS animation; the markup is the rest frame. Draw at a multiple of 12px.
//   stepIconSvg('depth', 48)                    → labelled with the step's title (role="img")
//   stepIconSvg('depth', 48, { decorative: true }) → aria-hidden, when the step's text sits beside it
export const STEP_ICONS = ${JSON.stringify(STEPS, null, 2)};
export function stepIconSvg(name, size = 48, { decorative = false } = {}) {
  const s = STEP_ICONS[name];
  if (!s) return '';
  const a11y = decorative ? 'aria-hidden="true"' : \`role="img" aria-label="\${s.title}"\`;
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="\${size}" height="\${size}" fill="currentColor" shape-rendering="crispEdges" \${a11y}>\${s.inner}</svg>\`;
}
`);
console.log('icons/step-icons.js + .json');
