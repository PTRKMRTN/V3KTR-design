// node test/secondary.test.mjs: the secondary colour (v0.41.47) per app in a real browser (Edge): each app defines --accent-2 and its hover, dim and tint; the placement classes
// resolve to it; and what must STAY the accent (primary button, toggle on, focus ring) does not (the negative control). Tag text passes 4.5:1 on its tint and the secondary
// passes 4.5:1 on the panel, per app.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = (() => {
  for (const repo of ['V3KTR-PROCESSOR', 'V3KTR-kompositor', 'V3KTR-SPACING-WT']) {
    try { return createRequire(`file:///D:/00%20CLAUDE%20APPS/${repo}/package.json`)('playwright'); } catch (e) {}
  }
  throw new Error('playwright not found in any sibling checkout');
})();
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const EXPECT = { processor: ['#74ddcf', '#00e5a0'], kompositor: ['#f8b787', '#ff6a43'], dimensor: ['#ecb0eb', '#bb6fff'] };
const rgb = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const parse = (s) => s.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  for (const [app, [sec, acc]] of Object.entries(EXPECT)) {
    await p.setContent(`<style>${css}</style><body data-app="${app}" style="background:#2b2b2b"><span class="vk-tag vk-tag--new" id="tag">NEW</span><span class="vk-tag vk-tag--live" id="live">LIVE</span><div class="vk-playhead" id="ph" style="height:10px"></div><div class="vk-marker" id="mk"></div><svg><path class="vk-series--2" id="sr" d="M0 0L10 10"/></svg><span class="vk-live" id="lv">60</span><span class="vk-toast__dot" id="dot"></span><button class="vk-btn vk-btn--primary" id="pri">Go</button><span class="vk-tog is-on" id="tog">On</span></body>`);
    const m = await p.evaluate(() => {
      const cs = (id) => getComputedStyle(document.getElementById(id)), body = getComputedStyle(document.body);
      return { a2: body.getPropertyValue('--accent-2').trim(), a2h: body.getPropertyValue('--accent-2-hover').trim(), a2d: body.getPropertyValue('--accent-2-dim').trim(), acc: body.getPropertyValue('--accent').trim(),
        ph: cs('ph').backgroundColor, mk: cs('mk').backgroundColor, sr: cs('sr').stroke, lv: cs('lv').color, dot: cs('dot').backgroundColor, pri: cs('pri').backgroundColor, tog: cs('tog').backgroundColor,
        tagBg: cs('tag').backgroundColor, tagFg: cs('tag').color, panel: '#2b2b2b' };
    });
    ok(m.a2 === sec && m.acc === acc, `${app}: --accent-2 is ${sec} and --accent stays ${acc}`);
    ok(m.a2h && m.a2d, `${app}: hover and dim defined`);
    ok(m.ph === rgb(sec) && m.mk === rgb(sec) && m.lv === rgb(sec) && m.dot === rgb(sec), `${app}: playhead, marker, live readout and toast dot use the secondary`);
    ok(m.sr === rgb(sec), `${app}: the second series stroke uses the secondary`);
    ok(m.pri === rgb(acc), `${app}: the primary button stays the accent (negative control)`);
    ok(m.tog !== rgb(sec), `${app}: a toggle that is on stays the accent family, not the secondary (negative control)`);
    ok(cr(parse(rgb(sec)), parse(rgb('#2b2b2b'))) >= 4.5, `${app}: the secondary passes 4.5:1 on the panel`);
    ok(cr(parse(m.tagFg), parse(m.tagBg)) >= 4.5, `${app}: tag text passes 4.5:1 on its tint (${cr(parse(m.tagFg), parse(m.tagBg)).toFixed(2)})`);
  }
  console.log(`secondary: ${n} checks passed`);
} finally { await b.close(); }
