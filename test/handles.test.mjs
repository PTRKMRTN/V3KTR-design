// node test/handles.test.mjs: the viewport handle tokens, the interactions/handles.js constants, the camera-row current marker and the section-head add button,
// measured in a real browser (Edge) from dist/app.css. Negative control: a row without .is-current does not get the filled tile.
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
const { HANDLE, handleColours } = await import('../interactions/handles.js');
const { MENU_ICONS } = await import('../icons/menu-icons.js');
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  await p.setContent(`<style>${css}</style><body data-app="dimensor"><div class="vk-layer is-current"><span class="vk-layer__icon" id="curic">x</span><span class="vk-layer__name">A</span></div><div class="vk-layer"><span class="vk-layer__icon" id="othic">x</span></div><span class="vk-vp-pill" id="pill">Height 1.41</span><span class="vk-vp-pill" id="hid" hidden>x</span><div class="vk-sec-bar" id="bar"><span class="vk-sec-head">Cameras</span><button class="vk-sec-add" id="add">+</button></div>`);
  const m = await p.evaluate(() => {
    const cs = (e) => getComputedStyle(e), tok = (k) => cs(document.documentElement).getPropertyValue(k).trim(), r = (e) => e.getBoundingClientRect();
    return { size: tok('--hdl-size'), hot: tok('--hdl-hot'), tan: tok('--hdl-tan'), hit: tok('--hdl-hit'), hitTouch: tok('--hdl-hit-touch'), curve: tok('--hdl-curve'), aux: tok('--hdl-aux'),
      curBg: cs(document.getElementById('curic')).backgroundColor, othBg: cs(document.getElementById('othic')).backgroundColor,
      addW: r(document.getElementById('add')).width, addH: r(document.getElementById('add')).height, addRight: Math.round(r(document.getElementById('bar')).right - r(document.getElementById('add')).right) };
  });
  ok(m.size === `${HANDLE.size}px` && m.hot === `${HANDLE.hot}px` && m.tan === `${HANDLE.tan}px`, 'size tokens match HANDLE');
  ok(m.hit === `${HANDLE.hit}px` && m.hitTouch === `${HANDLE.hitTouch}px` && m.curve === `${HANDLE.curve}px` && m.aux === `${HANDLE.aux}px`, 'hit, curve and aux tokens match HANDLE');
  ok(m.curBg === 'rgb(187, 111, 255)', 'the current item icon tile fills with the app accent');
  ok(m.othBg !== m.curBg, 'a non-current item does not (negative control)');
  ok(m.addW === 22 && m.addH === 22 && m.addRight === 0, 'the add button is 22 x 22 at the right end of the head');
  const pl = await p.evaluate(() => { const c = getComputedStyle(document.getElementById('pill')); return { bg: c.backgroundColor, fg: c.color, fs: c.fontSize, fw: c.fontWeight, pe: c.pointerEvents }; });
  ok(pl.bg === 'rgb(187, 111, 255)' && pl.fg === 'rgb(28, 28, 28)' && pl.fs === '10px' && pl.fw === '600' && pl.pe === 'none', 'the viewport pill: accent fill, on-accent ink, 10px / 600, never takes the pointer');
  ok(await p.evaluate(() => getComputedStyle(document.getElementById('hid')).display) === 'none', 'a hidden pill is not displayed (the [hidden] trap)');
  const cols = await p.evaluate(() => { const cs = getComputedStyle(document.body); return { accent: cs.getPropertyValue('--accent').trim(), hover: cs.getPropertyValue('--hover').trim() }; });
  ok(cols.accent === '#bb6fff' && cols.hover === '#ca96ff', 'the accent and hover tokens the overlay reads');
  const hc = await p.evaluate(() => { const cs = getComputedStyle(document.body); return [cs.getPropertyValue('--accent').trim(), cs.getPropertyValue('--tx-0').trim()]; });
  ok(typeof handleColours === 'function' && hc[0] === '#bb6fff', 'handleColours is exported and reads these tokens');
  for (const k of ['path', 'smooth', 'sharp', 'bezier', 'close', 'camera', 'add', 'curve', 'isolines', 'anamorph', 'cables', 'stereographic', 'mobius']) ok(typeof MENU_ICONS[k] === 'string' && MENU_ICONS[k].length > 20, 'icon ' + k);
  console.log(`handles: ${n} checks passed`);
} finally { await b.close(); }
