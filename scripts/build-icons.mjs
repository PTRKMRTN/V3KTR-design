// Builds brand/icons/.
//   website  : V3 (the V + the lightning 3) cut from Patrick's solo wordmark (brand/logo-v3ktr-solo.svg), never
//              redrawn; white on the ground                                icon-site.svg
//   each app : its letter, dark ink on the app's colour: P · K · D, the link light's tiles (v0.29.0, Patrick
//              2026-10-03; was the V). The letter is JetBrains Mono Bold (the link light's face, --mono 700) cut
//              to outlines, so the icon needs no font                     icon-processor.svg …
// Dark ink, not white: white on aqua is 1.65:1 and on mandarin 2.84:1 (icons need 3:1); #1c1c1c passes
// on all three (10.3 / 6.0 / 5.5). Square tiles, no radius (core --radius 0).
// PNGs (32, 180, 512) are rendered with Playwright from the PROCESSOR repo's node_modules.
//   node scripts/build-icons.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
// opentype.js and the font are borrowed from a sibling checkout too (DIMENSOR has both); only needed to rebuild.
const borrow = (mod) => { for (const repo of ['V3KTR-dimensor', 'V3KTR-dimensor-wt']) { try { return createRequire(`file:///D:/00%20CLAUDE%20APPS/${repo}/package.json`)(mod); } catch (e) {} } throw new Error(mod + ' not found in a DIMENSOR checkout'); };
const opentype = borrow('opentype.js');
const MONO = opentype.parse(readFileSync(createRequire('file:///D:/00%20CLAUDE%20APPS/V3KTR-dimensor/package.json').resolve('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff')).buffer);

const root = new URL('../', import.meta.url);
const solo = readFileSync(new URL('brand/logo-v3ktr-solo.svg', root), 'utf8');
const inner = solo.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
const outerG = inner.match(/<g transform="matrix\(1,0,0,1,[^"]*\)">/)[0];
const glyphs = [...inner.matchAll(/<g transform="[^"]*">\s*<path[^>]*\/>\s*<\/g>/g)].map((m) => m[0]);
// Measured in the solo file's 1377×537 box: glyph 4 = V (x 0–258, y 66–408), glyph 0 = the "3" (x 265–516, y −10–548).
const MARKS = {
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

// An app icon: its letter on a 100-unit square tile, the letter's cap height CAP of the side, centred on its own
// outline (not the advance width, so P and K sit visually centred). Bigger than in the link light (10px type on an
// 18px tile) so it still reads at 16px in a tab.
const CAP = 0.6;
function letterIcon(ch, tile, ink) {
  const probe = MONO.getPath(ch, 0, 0, 1000).getBoundingBox(), size = 1000 * (CAP * 100) / (probe.y2 - probe.y1);
  const b = MONO.getPath(ch, 0, 0, size).getBoundingBox();
  const p = MONO.getPath(ch, 50 - (b.x1 + b.x2) / 2, 50 - (b.y1 + b.y2) / 2, size).toPathData(2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${tile}"/><path fill="${ink}" d="${p}"/></svg>`;
}

const ICONS = {
  'icon-site': icon('v3', '#212121', '#f4f4f4', 0.8),
  'icon-processor': letterIcon('P', '#00e5a0', '#1c1c1c'),
  'icon-kompositor': letterIcon('K', '#ff6a43', '#1c1c1c'),
  'icon-dimensor': letterIcon('D', '#bb6fff', '#1c1c1c'),
};

const out = new URL('brand/icons/', root);
mkdirSync(out, { recursive: true });
for (const [name, svg] of Object.entries(ICONS)) writeFileSync(new URL(name + '.svg', out), svg + '\n');

// Re-encode an 8-bit RGB PNG as RGBA (alpha 255), same pixels. Chromium writes RGB for opaque images.
function toRGBA(png) {
  let p = 8, w, h, type, idat = [];
  while (p < png.length) { const len = png.readUInt32BE(p), t = png.toString('ascii', p + 4, p + 8), d = png.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); type = d[9]; } if (t === 'IDAT') idat.push(d); p += 12 + len; }
  if (type === 6) return png;
  const bpp = 3, stride = w * bpp, raw = inflateSync(Buffer.concat(idat)), px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], r = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? px[y * stride + x - bpp] : 0, up = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      let v = r[x]; if (f === 1) v += a; else if (f === 2) v += up; else if (f === 3) v += (a + up) >> 1; else if (f === 4) { const q = a + up - c, pa = Math.abs(q - a), pb = Math.abs(q - up), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      px[y * stride + x] = v & 255; } }
  const out = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) { out[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) { const s = y * stride + x * 3, d = y * (w * 4 + 1) + 1 + x * 4; out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]; out[d + 3] = 255; } }
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = (buf) => { let c = 0xffffffff; for (const x of buf) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'ascii'), d]); const cc = Buffer.alloc(4); cc.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([png.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(out)), chunk('IEND', Buffer.alloc(0))]);
}

// PNGs for places that don't take SVG (apple-touch-icon, PWA manifests, socials).
// Playwright is borrowed from a sibling checkout (this repo has no dependencies). Other sessions reinstall those
// checkouts' node_modules, so try each in turn.
const { chromium } = (() => {
  for (const repo of ['V3KTR-PROCESSOR', 'V3KTR-kompositor', 'V3KTR-SPACING-WT']) {
    try { return createRequire(`file:///D:/00%20CLAUDE%20APPS/${repo}/package.json`)('playwright'); } catch (e) {}
  }
  throw new Error('playwright not found in any sibling checkout (npm install in one of them)');
})();
const browser = await chromium.launch({ channel: 'msedge' });
for (const [name, svg] of Object.entries(ICONS)) {
  for (const px of [32, 180, 512]) {
    const page = await browser.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 });
    await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${px}" height="${px}" style="display:block" `)}</body>`);
    const file = fileURLToPath(new URL(`${name}-${px}.png`, out));
    writeFileSync(file, toRGBA(await page.screenshot()));   // RGBA: some pipelines (Next's .ico) refuse RGB
    await page.close();
  }
}
await browser.close();
console.log('brand/icons:', Object.keys(ICONS).join(', '), '· svg + png 32/180/512');
