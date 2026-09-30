// Builds brand/icons/ from Patrick's solo wordmark (brand/logo-v3ktr-solo.svg): the glyphs are cut out
// of it, never redrawn.
//   website  : V3 (the V + the lightning 3), white on the ground          icon-site.svg
//   each app : V, dark ink on the app's colour                            icon-processor.svg …
// Dark ink, not white: white on aqua is 1.65:1 and on mandarin 2.84:1 (icons need 3:1); #1c1c1c passes
// on all three (10.3 / 6.0 / 5.5). Square tiles, no radius (core --radius 0).
// PNGs (32, 180, 512) are rendered with Playwright from the PROCESSOR repo's node_modules.
//   node scripts/build-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const solo = readFileSync(new URL('brand/logo-v3ktr-solo.svg', root), 'utf8');
const inner = solo.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
const outerG = inner.match(/<g transform="matrix\(1,0,0,1,[^"]*\)">/)[0];
const glyphs = [...inner.matchAll(/<g transform="[^"]*">\s*<path[^>]*\/>\s*<\/g>/g)].map((m) => m[0]);
// Measured in the solo file's 1377×537 box: glyph 4 = V (x 0–258, y 66–408), glyph 0 = the "3" (x 265–516, y −10–548).
const MARKS = {
  v: { keep: [4], box: [0, 66, 258, 408] },
  v3: { keep: [4, 0], box: [0, -10, 516, 548] },
};

// A square icon: tile colour, glyph colour, glyph filling `fill` of the tile's shorter side.
function icon(mark, tile, ink, fill) {
  const { keep, box } = MARKS[mark];
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  const side = Math.max(w, h) / fill;                        // tile side in glyph units
  const vx = x0 - (side - w) / 2, vy = y0 - (side - h) / 2;
  const g = keep.map((i) => glyphs[i]).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}">` +
    `<rect x="${vx.toFixed(1)}" y="${vy.toFixed(1)}" width="${side.toFixed(1)}" height="${side.toFixed(1)}" fill="${tile}"/>` +
    `<g fill="${ink}">${outerG}${g}</g></g></svg>`;
}

const ICONS = {
  'icon-site': icon('v3', '#212121', '#f4f4f4', 0.8),
  'icon-processor': icon('v', '#00e5a0', '#1c1c1c', 0.72),
  'icon-kompositor': icon('v', '#ff6a43', '#1c1c1c', 0.72),
  'icon-dimensor': icon('v', '#bb6fff', '#1c1c1c', 0.72),
};

const out = new URL('brand/icons/', root);
mkdirSync(out, { recursive: true });
for (const [name, svg] of Object.entries(ICONS)) writeFileSync(new URL(name + '.svg', out), svg + '\n');

// PNGs for places that don't take SVG (apple-touch-icon, PWA manifests, socials).
const require = createRequire('file:///D:/00%20CLAUDE%20APPS/V3KTR-PROCESSOR/package.json');
const { chromium } = require('playwright');
const browser = await chromium.launch({ channel: 'msedge' });
for (const [name, svg] of Object.entries(ICONS)) {
  for (const px of [32, 180, 512]) {
    const page = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${px}" height="${px}" style="display:block" `)}</body>`);
    await page.screenshot({ path: fileURLToPath(new URL(`${name}-${px}.png`, out)) });
    await page.close();
  }
}
await browser.close();
console.log('brand/icons:', Object.keys(ICONS).join(', '), '· svg + png 32/180/512');
