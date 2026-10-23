// Builds docs/icons-thumbnails-mock-apps.html: how the icon + thumbnail rules (docs/ICONS-AND-THUMBNAILS.md) would apply to PROCESSOR and
// KOMPOSITOR, using their REAL option names. A PROPOSAL MOCK: pictures are grey/pattern stand-ins, nothing here ships.
// Run: node scripts/build-icons-thumbs-mock-apps.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { menuIconSvg } from '../icons/menu-icons.js';
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8') + readFileSync(new URL('../dist/app.css', import.meta.url), 'utf8');

// stand-in pictures (the effect applied to a small grey figure); real ones are rendered by the app
let uid = 0;
const uniq = (html) => { const n = ++uid; return html.replace(/id="([a-z]+)"/g, (_, i) => `id="${i}${n}"`).replace(/url\(#([a-z]+)\)/g, (_, i) => `url(#${i}${n})`); };
const svg = (inner, bg = '#3a3a3a') => uniq(`<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="display:block;width:100%;height:100%;background:${bg}"><defs><radialGradient id="g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#e8e8e8"/><stop offset="1" stop-color="#7a7a7a"/></radialGradient><clipPath id="c"><circle cx="50" cy="50" r="34"/></clipPath></defs>${inner}</svg>`);
const dots = (shape) => { let s = ''; for (let y = 12; y < 100; y += 12) for (let x = 12; x < 100; x += 12) { const d = Math.hypot(x - 50, y - 50); const r = Math.max(0, 5.5 - d / 14); if (!r) continue;
  s += shape === 'dot' ? `<circle cx="${x}" cy="${y}" r="${r}" fill="#ddd"/>` : shape === 'square' ? `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="#ddd"/>` : shape === 'cross' ? `<path d="M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}" stroke="#ddd" stroke-width="2"/>` : `<path d="M${x - 5} ${y}H${x + 5}" stroke="#ddd" stroke-width="${Math.max(1, r / 1.4)}"/>`; } return svg(s); };
const fig = (extra = '') => svg(`<circle cx="50" cy="50" r="34" fill="url(#g)"/>${extra}`);
const hatch = (a) => svg(`<g clip-path="url(#c)" stroke="#ddd" stroke-width="2">${Array.from({ length: 16 }, (_, i) => `<path d="M${-20 + i * 9} ${a ? 100 : 0}L${40 + i * 9} ${a ? 0 : 100}"/>`).join('')}</g>`);
const metal = (lo, hi, extra = '') => svg(`<defs><linearGradient id="m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset=".5" stop-color="${lo}"/><stop offset="1" stop-color="${hi}"/></linearGradient></defs><circle cx="50" cy="50" r="34" fill="url(#m)"/>${extra}`);
const light = (c1, c2, side) => svg(`<defs><radialGradient id="l" cx="${side}%" cy="30%" r="80%"><stop offset="0" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}" stop-opacity=".5"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><rect width="100" height="100" fill="url(#l)"/>`, '#242424');

const tile = (inner, label, { sel = false, tc = false, chk = false, wide = false } = {}) => `<div class="vk-thumb vk-thumb--card${sel ? ' is-selected' : ''}" role="radio" aria-checked="${sel}" tabindex="0" aria-label="${label}"${tc ? ' data-tc="1"' : ''}><div class="vk-thumb__pic" style="aspect-ratio:${wide ? '16/9' : '1'}">${inner}</div><span class="vk-thumb__label">${label}</span></div>`;
const grid = (cols, items, gap = 6) => `<div style="display:grid;grid-template-columns:repeat(${cols},minmax(0,1fr));gap:${gap}px" role="radiogroup">${items.join('')}</div>`;
const ico = (n, s = 14) => `<span style="display:inline-flex;width:${s}px;height:${s}px">${menuIconSvg(n, s)}</span>`;
const lab = (t) => `<div class="lab">${t}</div>`;
const note = (t) => `<div class="cap">${t}</div>`;
const sel = (t) => `<div class="vk-select vk-select--block" style="display:flex;align-items:center;pointer-events:none">${t}</div>`;
const seg = (opts, on) => `<div class="segw">${opts.map((o, i) => `<button class="vk-btn vk-btn--compact${i === on ? ' is-on' : ''}">${o}</button>`).join('')}</div>`;
const fxTile = (g, n) => `<div class="fxt" style="color:var(--${g})">${ico(n, 24)}</div>`;

const processor = `<div class="panel" data-app="processor"><h1>PROCESSOR · FX panel</h1>
${lab('Halftone · Shape: 4 options that look different, M tiles')}
${grid(4, [tile(dots('dot'), 'Dot', { sel: true }), tile(dots('line'), 'Line'), tile(dots('cross'), 'Cross'), tile(dots('square'), 'Square')])}
${lab('Hatch · Mode: 7 options, M tiles (one row of 4, one of 3)')}
${grid(4, [tile(hatch(1), 'Hatch', { sel: true }), tile(hatch(0), 'Flow'), tile(fig('<circle cx="50" cy="50" r="22" fill="none" stroke="#ddd" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="none" stroke="#ddd" stroke-width="2"/>'), 'Contour'), tile(fig('<path d="M20 30H80M20 50H80M20 70H80M35 20V80M65 20V80" stroke="#ddd" stroke-width="1.5"/>'), 'Weave'), tile(fig('<path d="M16 60C34 30 50 80 84 40" stroke="#ddd" stroke-width="2" fill="none"/>'), 'Stream'), tile(fig('<path d="M20 20H80V80H20z" fill="none" stroke="#ddd" stroke-width="2"/><path d="M20 20L80 80" stroke="#ddd" stroke-width="2"/>'), 'Circuit'), tile(hatch(1), 'Engrave')])}
${lab('Reflections · Material: colour IS the content, true colour')}
${grid(3, [tile(metal('#8a8a8a', '#e6e6e6'), 'Chrome', { sel: true, tc: true, chk: true, wide: false }), tile(metal('#3a8aa8', '#d96fd0'), 'Iridescent', { tc: true }), tile(metal('#6a6a6a', '#bdbdbd'), 'Liquid Metal', { tc: true }), tile(metal('#101010', '#3a3a3a'), 'Obsidian', { tc: true }), tile(metal('#c78a2a', '#7ad0c0'), 'Thin Film', { tc: true }), tile(metal('#9a9a9a', '#f0f0f0'), 'Studio Chrome', { tc: true })])}
${lab('Dither · Algorithm: 12 options, nearly alike at 84px, stays a select')}
${sel('<span style="flex:1">Floyd-Steinberg</span><span style="color:var(--tx-2)">▾</span>')}
${note('Floyd-Steinberg and Atkinson differ in grain you only see at 100%: the rule keeps this a select.')}
${lab('Channel: RGB / Luma / Red / Green / Blue, words say it')}
${seg(['RGB', 'Luma', 'Red', 'Green', 'Blue'], 0)}
${lab('FX rail · icons only (already today): group colour, 24 in a 40 tile')}
<div class="rail">${[['adjust', 'sync'], ['type-sage', 'scale'], ['type-rust', 'frame'], ['type-rose', 'dice'], ['type-teal', 'film'], ['type-violet', 'export'], ['type-amber', 'save'], ['type-slate', 'eye']].map(([g, n]) => fxTile(g, n)).join('')}</div>
${note('The rail stays icons: a rail button adds an effect, a category, not a choice of look.')}
</div>`;

const kompositor = `<div class="panel" data-app="kompositor"><h1>KOMPOSITOR · Edit panels</h1>
${lab('Transitions · exists today (live canvas tiles, 16:9). Needs only the grid + 16:9 modifier')}
${grid(2, [tile(light('#ff8f72', '#ff6a43', 20), 'Whip pan', { wide: true, sel: true }), tile(light('#ffd6c8', '#ff6a43', 80), 'Zoom punch', { wide: true }), tile(light('#c8c8c8', '#666', 50), 'Shake', { wide: true }), tile(light('#ffb59e', '#ff6a43', 65), 'Flash cut', { wide: true })], 6)}
${note('Tiles are 320×180 canvases shown at half, which already meets "render at 2×". Its Text presets grid is 2-up with an 8px gap; the system says 6px.')}
${lab('Light leaks · Kind: 7 options, colour IS the content (true colour), new tiles')}
${grid(4, [tile(light('#ff9a4d', '#ff4a2d', 10), 'Edge bloom', { sel: true, tc: true }), tile(light('#ffdf8a', '#ff7a2d', 50), 'Burn', { tc: true }), tile(light('#9ad0ff', '#d96fd0', 90), 'Prism edge', { tc: true }), tile(light('#ffffff', '#6ab0ff', 50), 'Streak', { tc: true }), tile(light('#fff0b0', '#ffa030', 70), 'Lens flare', { tc: true }), tile(light('#ffffff', '#ffd070', 30), 'Sun glare', { tc: true }), tile(light('#ffffff', '#ffffff', 50), 'Beat flash', { tc: true })])}
${note('Today seven chips. Words alone do not say what Anamorphic streak vs Prism edge looks like: tiles do.')}
${lab('Style · 8 project styles: icon cards (a KIND, not a look): unchanged')}
<div class="g4">${['Music video', 'Trailer', 'Car film', 'Dream'].map((n, i) => `<div class="stc${i === 2 ? ' on' : ''}">${ico(['film', 'play', 'frame', 'sync'][i], 16)}<span>${n}</span></div>`).join('')}</div>
${note('Style icons already exist (style-icons.js). A style is a way of working, not a picture you pick.')}
${lab('Looks, Media, Text presets · exist as .vk-thumb--card tiles today')}
${grid(3, [tile(fig(), 'Noir', { wide: true }), tile(fig(), 'Teal-orange', { wide: true }), tile(fig(), 'v3ktr_export…', { wide: true })])}
${note('No change except converging on the shared grid, 6px gap, and the 16:9 shape modifier.')}
</div>`;

const table = `<div class="panel wide"><h1>What changes, per app</h1><table>
<tr><th></th><th>PROCESSOR</th><th>KOMPOSITOR</th><th>DIMENSOR</th></tr>
<tr><td><b>Icons</b></td><td>FX rail, menus, rows: already on the language; FX icons stay in PROCESSOR until a second app needs them</td><td>Style icons, left-side tabs, menus: already on it</td><td>Add rail, stack, menus: on it</td></tr>
<tr><td><b>Tiles for a Mode</b></td><td><b>New.</b> Candidates by the rule: Halftone Shape (4), Hatch Mode (7), Material (6), Glass (4), Infill (7), Reaction Preset (6), Shape (7), Device (8). Not: Dither Algorithm (12, alike), Channel, Ray Count, Range, Colour</td><td><b>New for Light leak kind (7)</b> and Background presets; Style stays icon cards</td><td>Poly seed, Thorns shape, Spikes formula (S/M)</td></tr>
<tr><td><b>Cards (Library/presets)</b></td><td>Looks grid exists; converge on the shared grid</td><td>Looks, Media, Text, Transitions exist as live canvas tiles; converge on 6px gap + 16:9 modifier</td><td>Library cards (L)</td></tr>
<tr><td><b>Render subject</b></td><td><b>The one real difference.</b> The image is the seed, so a Mode tile is the effect on a picture. Proposal: render on a built-in grey test figure (instant, cached per effect version, same in every session); an optional "preview on my image" can come later</td><td>Engine renders in-canvas already (TW 320 × TH 180)</td><td>Fixed camera per category</td></tr>
<tr><td><b>True colour on select</b></td><td>Material tiles</td><td>Light leak tiles</td><td>Materials with colour, palettes</td></tr>
<tr><td><b>New CSS they need</b></td><td colspan="3">the same four things, once: <code>.vk-tilegrid</code>, <code>--sq</code> / <code>--wide</code> (+ a <code>--video</code> 16:9), <code>--true-colour</code>, and the lazy-thumb loader when a second app has it</td></tr></table></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"><title>Icons and thumbnails: PROCESSOR + KOMPOSITOR</title><style>${css}
body{margin:0;background:var(--bg-0);font:12px/1.5 var(--mono);color:var(--tx-1)}
h1{font:600 11px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--tx-0);margin:0 0 4px}
.wrap{display:flex;gap:24px;padding:24px;align-items:flex-start;flex-wrap:wrap}
.panel{width:400px;background:var(--bg-2);box-sizing:border-box;padding:22px 22px 14px;flex:none}.panel.wide{width:100%}
.lab{font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:var(--tx-2);margin:20px 0 8px}
.cap{color:var(--tx-2);font-size:10.5px;margin:6px 0 0}
.g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.segw{display:inline-flex;gap:2px;background:var(--bg-1);padding:2px}
.rail{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}.fxt{height:40px;display:flex;align-items:center;justify-content:center;background:var(--bg-3)}
.stc{background:var(--bg-3);padding:10px 8px;display:flex;flex-direction:column;gap:6px;font-size:10px;color:var(--tx-1)}.stc.on{background:var(--accent);color:var(--on-accent)}
.vk-thumb[data-tc="1"].is-selected .vk-thumb__pic::after{display:none}.vk-thumb[data-tc="1"] .vk-thumb__pic::after{display:none}
table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:7px 12px 7px 0;vertical-align:top;font-weight:400;border-bottom:1px solid var(--line)}th{color:var(--tx-2);font-size:9px;letter-spacing:.14em;text-transform:uppercase}td b{color:var(--tx-0);font-weight:400}code{color:var(--tx-0)}
</style></head><body><div class="wrap">${processor}${kompositor}${table}</div></body></html>`;
writeFileSync(new URL('../docs/icons-thumbnails-mock-apps.html', import.meta.url), html);
console.log('docs/icons-thumbnails-mock-apps.html', html.length);
