// node test/progress.test.mjs: .vk-progress (v0.41.48) in a real browser (Edge): the fill is --p of the track, in the secondary colour; 4 / 2 / 8px heights; the overlay
// variant pins to the bottom edge, has no track and stacks with --at; no --p means an empty fill (negative control); the width transition is off under reduced motion.
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
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const html = `<style>${css}</style><body data-app="kompositor" style="margin:0;background:#2b2b2b"><div style="width:200px">
<div class="vk-progress" id="a" role="progressbar" aria-valuenow="25" style="--p:25%"></div>
<div class="vk-progress vk-progress--thin" id="t" style="--p:50%"></div>
<div class="vk-progress vk-progress--thick" id="k" style="--p:100%"></div>
<div class="vk-progress" id="z"></div></div>
<div id="tile" style="position:relative;width:100px;height:60px;margin-top:20px"><div class="vk-progress vk-progress--overlay" id="o1" style="--p:40%"></div><div class="vk-progress vk-progress--overlay" id="o2" style="--p:70%;--at:2px"></div></div></body>`;
try {
  const p = await b.newPage();
  await p.setContent(html);
  const m = await p.evaluate(() => {
    const cs = (id, pseudo) => getComputedStyle(document.getElementById(id), pseudo), r = (id) => document.getElementById(id).getBoundingClientRect();
    return { aH: r('a').height, tH: r('t').height, kH: r('k').height, aFill: parseFloat(cs('a', '::after').width), aTrack: r('a').width, tFill: parseFloat(cs('t', '::after').width), kFill: parseFloat(cs('k', '::after').width),
      zFill: parseFloat(cs('z', '::after').width), fillBg: cs('a', '::after').backgroundColor, trackBg: cs('a').backgroundColor, oBg: cs('o1').backgroundColor,
      o1Bottom: r('tile').bottom - r('o1').bottom, o2Bottom: r('tile').bottom - r('o2').bottom, oH: r('o1').height, role: document.getElementById('a').getAttribute('role') };
  });
  ok(m.aH === 4 && m.tH === 2 && m.kH === 8, 'heights 4 / 2 / 8');
  ok(Math.abs(m.aFill - m.aTrack * 0.25) < 0.6 && Math.abs(m.tFill - 100) < 0.6 && Math.abs(m.kFill - 200) < 0.6, 'the fill is --p of the track');
  ok(m.zFill === 0, 'no --p means an empty fill (negative control)');
  ok(m.fillBg === 'rgb(248, 183, 135)', 'the fill is the app secondary (KOMPOSITOR #f8b787)');
  ok(m.trackBg === 'rgb(58, 58, 58)', 'the track is --bg-3');
  ok(m.oBg === 'rgba(0, 0, 0, 0)' && m.oH === 2, 'overlay: no track, 2px');
  ok(Math.abs(m.o1Bottom) < 0.6 && Math.abs(m.o2Bottom - 2) < 0.6, 'overlay pins to the bottom edge and --at stacks the second 2px above');
  ok(m.role === 'progressbar', 'the documented role is on the test markup');
  const tr = await p.evaluate(() => getComputedStyle(document.getElementById('a'), '::after').transitionDuration);
  ok(tr === '0.1s', 'width transition .1s');
  await p.emulateMedia({ reducedMotion: 'reduce' });
  const tr2 = await p.evaluate(() => getComputedStyle(document.getElementById('a'), '::after').transitionDuration);
  ok(tr2 === '0s', 'no transition under reduced motion');
  console.log(`progress: ${n} checks passed`);
} finally { await b.close(); }
