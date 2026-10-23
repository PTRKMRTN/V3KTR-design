// Builds docs/icons-thumbnails-mock.html: the mock sheet for docs/ICONS-AND-THUMBNAILS.md (a PROPOSAL, nothing here ships).
// Pictures are STAND-INS drawn as inline SVG in grey (the colourless default); real thumbnails are rendered by each app's own engine.
// Run: node scripts/build-icons-thumbs-mock.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { menuIconSvg } from '../icons/menu-icons.js';
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8') + readFileSync(new URL('../dist/app.css', import.meta.url), 'utf8');

const shade = (id, lo, hi) => `<radialGradient id="${id}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="${hi}"/><stop offset="1" stop-color="${lo}"/></radialGradient>`;
const pics = {
  sphere: '<circle cx="50" cy="50" r="30" fill="url(#g)"/>',
  cube: '<path d="M50 20L78 35V65L50 80L22 65V35z" fill="url(#g)"/><path d="M50 50V80M50 50L22 35M50 50L78 35" stroke="#2b2b2b" stroke-width="1.4" fill="none"/>',
  cone: '<path d="M50 18L76 76H24z" fill="url(#g)"/>',
  torus: '<ellipse cx="50" cy="52" rx="32" ry="20" fill="url(#g)"/><ellipse cx="50" cy="52" rx="13" ry="7" fill="#3a3a3a"/>',
  star: '<path d="M50 16L60 40L86 42L66 58L72 84L50 70L28 84L34 58L14 42L40 40z" fill="url(#g)"/>',
  ring: '<circle cx="50" cy="50" r="28" fill="none" stroke="url(#g)" stroke-width="12"/>',
  cross: '<path d="M40 18H60V40H82V60H60V82H40V60H18V40H40z" fill="url(#g)"/>',
  wave: '<path d="M10 56C24 30 36 30 50 56S76 82 90 56V84H10z" fill="url(#g)"/>',
};
const pic = (k, gold) => `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%;background:var(--bg-3)"><defs>${shade('g', gold ? '#8a6a1c' : '#7a7a7a', gold ? '#f0cf70' : '#e0e0e0')}</defs>${pics[k]}</svg>`;
const tile = (k, label, sel) => `<div class="vk-thumb vk-thumb--card${sel ? ' is-selected' : ''}" role="radio" aria-checked="${!!sel}" tabindex="0" aria-label="${label}"><div class="vk-thumb__pic" style="aspect-ratio:1">${pic(k)}</div><span class="vk-thumb__label">${label}</span></div>`;
const seeds = [['sphere', 'Sphere'], ['cube', 'Cube'], ['cone', 'Cone'], ['torus', 'Torus'], ['star', 'Star'], ['ring', 'Ring'], ['cross', 'Cross'], ['wave', 'Wave']];
const modeTiles = seeds.map(([k, l], i) => tile(k, l, i === 3)).join('');
const card = (k, label, sel, gold) => `<div class="vk-thumb vk-thumb--card${sel ? ' is-selected' : ''}"><div class="vk-thumb__pic" style="aspect-ratio:4/3">${pic(k, gold)}</div><span class="vk-thumb__label">${label}</span></div>`;
const cards = [['sphere', 'Chrome', 0, 0], ['torus', 'Brushed', 0, 0], ['sphere', 'Gold', 1, 1], ['cube', 'Matte', 0, 0], ['ring', 'Satin', 0, 0], ['wave', 'Concrete', 0, 0]].map(([k, l, s, g]) => card(k, l, s, g)).join('');
const lazy = '<div class="vk-thumb vk-thumb--card"><div class="vk-thumb__pic is-empty" style="aspect-ratio:4/3;background:var(--bg-3)"></div><span class="vk-thumb__label">rendering</span></div>';
const row = (k, name, sub, sel) => `<div class="row${sel ? ' sel' : ''}"><div class="rt">${pic(k)}</div><div class="rn"><b>${name}</b><i>${sub}</i></div></div>`;
const icoNames = ['save', 'export', 'eye', 'lock', 'dice', 'film'];
const ico = (n, s) => `<span style="display:inline-flex;width:${s}px;height:${s}px">${menuIconSvg(n, s)}</span>`;
const sizeNote = { 14: 'menus, rows', 16: 'buttons, chips', 20: 'toolbars', 24: 'rail tiles (in a 40px tile)' };
const sizes = [14, 16, 20, 24].map(s => `<div class="isz"><div>${icoNames.map(n => ico(n, s)).join('')}</div><i>${s}px · ${sizeNote[s]}</i></div>`).join('');
const states = [['rest', 'var(--tx-2)', 1], ['hover', 'var(--tx-0)', 1], ['on', 'var(--accent)', 1], ['disabled', 'var(--tx-2)', 0.4]].map(([l, c, o]) => `<div class="st"><span style="color:${c};opacity:${o}">${ico('lock', 20)}</span><i>${l}</i></div>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Icons and thumbnails: mock</title><style>${css}
body{margin:0;background:var(--bg-0);font:12px/1.5 var(--mono);color:var(--tx-1)}
h1{font:600 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--tx-0);margin:0}
.wrap{display:flex;gap:28px;padding:24px;align-items:flex-start}
.panel{width:400px;background:var(--bg-2);box-sizing:border-box;padding:22px 22px 8px;flex:none}
.lab{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--tx-2);margin:22px 0 8px}.lab:first-child{margin-top:0}
.cap{color:var(--tx-2);font-size:10.5px;margin:6px 0 0}
.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.row{display:flex;gap:10px;align-items:center;height:34px;background:var(--bg-2)}.row.sel{background:color-mix(in srgb,var(--accent) var(--tint-sel),var(--bg-2))}
.rt{width:28px;height:28px;flex:none;margin-left:3px}.rn{display:flex;flex-direction:column;line-height:1.15}.rn b{font-weight:400;color:var(--tx-0)}.rn i{font-style:normal;font-size:9.5px;color:var(--tx-2)}
.rows{display:flex;flex-direction:column;gap:3px}
.col2{flex:1;min-width:0}
.card2{background:var(--bg-2);padding:22px;margin-bottom:22px}
table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:5px 8px 5px 0;vertical-align:top;font-weight:400;border-bottom:1px solid var(--line)}th{color:var(--tx-2);font-size:9px;letter-spacing:.14em;text-transform:uppercase}
td b{color:var(--tx-0);font-weight:400}
.isz{margin-bottom:10px}.isz div{display:flex;gap:14px;color:var(--tx-1)}.isz i,.st i{font-style:normal;color:var(--tx-2);font-size:10px}
.sts{display:flex;gap:26px}.st{display:flex;flex-direction:column;align-items:center;gap:4px}
.seg{display:inline-flex;gap:2px;background:var(--bg-1);padding:2px}
</style></head><body data-app="dimensor"><div class="wrap">
<div class="panel" style="min-height:900px">
<div class="lab">Mode: 8 options that look different, a tile grid, M tile (4-up)</div>
<div class="g4" role="radiogroup" aria-label="Poly seed">${modeTiles}</div>
<div class="cap">1:1 picture, 9px label under it. A 356px content width (400 minus two 22px insets) gives an 84px tile.</div>
<div class="lab">Mode: 3 options that do not, a text segmented control, not tiles</div>
<div class="seg"><button class="vk-btn vk-btn--compact is-on">Linear</button><button class="vk-btn vk-btn--compact">Radial</button><button class="vk-btn vk-btn--compact">Spiral</button></div>
<div class="lab">Library: cards, L card (3-up, 4:3)</div>
<div class="g3">${cards}</div>
<div class="g3" style="margin-top:6px">${lazy}${lazy}${lazy}</div>
<div class="cap">Selected is the existing wash plus a solid label. The second row shows tiles still rendering (lazy-loaded): the X.</div>
<div class="lab">Lists: rows, 28px thumb in a 34px row</div>
<div class="rows">${row('cube', 'Studio Floor', 'Material · Matte', 0)}${row('sphere', 'Key light', 'Lighting · Rembrandt', 1)}${row('wave', 'Dunes', 'Environment · sand', 0)}</div>
</div>
<div class="col2">
<div class="card2"><h1>Icons: drawn, monochrome, token-coloured</h1><div class="lab">Sizes (one drawing, 24 grid, 1.4 stroke)</div>${sizes}<div class="lab">States (a latching icon is text colour only; locked is the .vk-lock marker)</div><div class="sts">${states}</div></div>
<div class="card2"><h1>Which control gets what</h1><table>
<tr><th>The choice is</th><th>Use</th><th>Example</th></tr>
<tr><td>an action or verb</td><td><b>icon</b> + label (menus), icon-only + tip (toolbars)</td><td>Save, Export, Lock</td></tr>
<tr><td>a category or object kind</td><td><b>icon</b>, group colour via currentColor</td><td>FX rail, stack row, Add catalogue</td></tr>
<tr><td>2 to 3 options, words say it</td><td><b>text</b> segmented control</td><td>Linear, Radial, Spiral</td></tr>
<tr><td>4 to 12 options that LOOK different</td><td><b>tile grid</b> (rendered thumbnails)</td><td>Poly seed, Thorns shape, Spikes formula</td></tr>
<tr><td>a few options, long names, no visible difference</td><td><b>select</b></td><td>Blend mode, frame rate</td></tr>
<tr><td>13+ content items, searchable</td><td><b>Library cards</b> + chips + search</td><td>Materials, Looks, Environments</td></tr>
<tr><td>a result list to scan</td><td><b>rows</b> with a 28px thumb</td><td>Stack presets, saved looks</td></tr>
<tr><td>a colour or gradient</td><td><b>swatch</b> (its own fill is the content)</td><td>Palette strip</td></tr></table></div>
</div></div></body></html>`;
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/icons-thumbnails-mock.html', import.meta.url), html);
console.log('docs/icons-thumbnails-mock.html', html.length);
