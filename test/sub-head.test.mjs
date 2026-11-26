// node test/sub-head.test.mjs: v0.41.190, one label size. .vk-sec-sub and every .vk-micro-label (a sub-head, a name above a seg, the react head, a lane head)
// are 9px / 0.14em; .vk-menu-label (menu group labels) is a different class and stays 8.5px.
// Real CSS (dist/app.css) in Edge. Negative control: with the old micro-label values put back, the bare micro-label is 8.5px and the checks fail.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(ROOT + 'fonts/fonts.css', 'utf8').replace(/url\(([^)]+)\)/g, (m, u) => 'url(' + (/^['"]?(data:|https?:|file:)/.test(u) ? u : 'file:///' + (ROOT + 'fonts/' + u.replace(/['"]/g, '').replace(/^\.\//, '')).replace(/\\/g, '/')) + ')')
  + readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const NEW = '.vk-micro-label{font-size:9px;letter-spacing:0.14em;';
const oldCss = css.replace(NEW, '.vk-micro-label{font-size:8.5px;letter-spacing:0.16em;');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
ok(css.includes(NEW) && oldCss !== css, 'the negative control really puts the old values back');
const html = (c) => `<!doctype html><meta charset=utf-8><style>body{font-family:var(--sans);margin:0}${c}</style><body data-app="dimensor"><div class="vk-section"><h3 class="vk-sec-head">Render</h3>
<div class="vk-sec-sub" id="sub">Quality</div><div class="vk-micro-label vk-sub-head" id="subhead">Samples</div>
<div class="vk-micro-label" id="name">Smooth deforms</div><div class="vk-seg"><button>Off</button><button>On</button></div>
<div class="vk-react"><div class="vk-micro-label" id="react">React</div></div>
<div class="vk-lane-rows" style="width:400px"><div class="vk-lane-row"><span class="vk-lane-row__head vk-micro-label" id="lane">Offbeats</span><div class="vk-lane"></div></div></div>
<div class="vk-menu-label" id="menu">Interface</div></div>`;
const b = await chromium.launch({ channel: 'msedge' });
const read = async (c) => { const p = await b.newPage(); await p.setContent(html(c)); await p.evaluate(() => document.fonts.ready);
  const r = await p.evaluate(() => Object.fromEntries(['sub', 'subhead', 'name', 'react', 'lane', 'menu'].map((id) => { const e = document.getElementById(id), s = getComputedStyle(e); return [id, { fs: s.fontSize, ls: parseFloat(s.letterSpacing), tt: s.textTransform, col: s.color, w: Math.round(e.getBoundingClientRect().width * 10) / 10, sw: e.scrollWidth, cw: e.clientWidth }]; }))); await p.close(); return r; };
try {
  const r = await read(css);
  for (const id of ['sub', 'subhead', 'name', 'react', 'lane']) ok(r[id].fs === '9px' && Math.abs(r[id].ls - 1.26) < 0.02, `${id}: 9px / 1.26px (${r[id].fs}, ${r[id].ls}px)`);
  ok(['subhead', 'name', 'react'].every((id) => r[id].col === r.sub.col) && ['subhead', 'name', 'react', 'lane'].every((id) => r[id].tt === 'uppercase'), 'the same colour on the sub-head, the name and the react head (a lane head keeps its own track-head grey); all uppercase');
  ok(r.lane.sw <= r.lane.cw, `the lane head's text fits its 72px head (${r.lane.sw} in ${r.lane.cw})`);
  ok(r.menu.fs === '8.5px', `.vk-menu-label is another class and stays 8.5px (${r.menu.fs})`);
  const o = await read(oldCss);
  ok(o.name.fs === '8.5px' && o.sub.fs === '9px', 'negative control: with the old values a name above a seg is 8.5px beside a 9px sec-sub, so the one-size checks fail');
} finally { await b.close(); }
console.log(`sub-head: ${n} checks pass`);
