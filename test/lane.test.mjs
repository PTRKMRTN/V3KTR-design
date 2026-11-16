// node test/lane.test.mjs: the Music lane markers (v0.41.58) in a real browser (Edge): positions from --x, the 24px hit area, detected = the secondary, .is-hand = the accent,
// selected = a white fill with an accent ring behind it, the glyph sizes per kind, spans from --x / --w, the REACT block, and the hidden attribute. Negative control: a plain marker is not the accent.
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
const { MENU_ICONS } = await import('../icons/menu-icons.js');
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  await p.setContent(`<style>${css}</style><body data-app="kompositor" style="margin:0"><div class="vk-lane" id="lane" style="width:400px">
<div class="vk-lane__span" id="sp" data-kind="break" style="--x:.30;--w:.10"></div>
<button class="vk-lane__mark" id="a" data-kind="accent" style="--x:.25"></button>
<button class="vk-lane__mark is-hand" id="h" data-kind="accent" style="--x:.5"></button>
<button class="vk-lane__mark is-selected" id="s" data-kind="accent" style="--x:.75"></button>
<button class="vk-lane__mark" id="o" data-kind="offbeat" style="--x:.1"></button>
<button class="vk-lane__mark" id="t" data-kind="hit" style="--x:.9"></button>
<button class="vk-lane__mark" id="rl" data-kind="roll" style="--x:.4"></button>
<button class="vk-lane__mark" id="x" data-kind="accent" style="--x:.6" hidden></button></div>
<div class="vk-lane-rows" id="rows" style="width:400px"><div class="vk-lane-row" id="r1"><span class="vk-lane-row__head vk-micro-label">Accents</span><div class="vk-lane" id="l1"></div></div><div class="vk-lane-row" id="r2" hidden><span class="vk-lane-row__head"></span><div class="vk-lane"></div></div><div class="vk-lane-row" id="r3"><span class="vk-lane-row__head"></span><div class="vk-lane"></div></div></div>
<div class="vk-react" id="rc"><span class="vk-micro-label">REACT</span></div></body>`);
  const m = await p.evaluate(() => {
    const cs = (id, ps) => getComputedStyle(document.getElementById(id), ps), r = (id) => document.getElementById(id).getBoundingClientRect(), lane = r('lane');
    return { lh: lane.height, aCx: r('a').left + r('a').width / 2 - lane.left, aW: r('a').width, aH: r('a').height, hCx: r('h').left + r('h').width / 2 - lane.left,
      aBg: cs('a', '::after').backgroundColor, hBg: cs('h', '::after').backgroundColor, sBg: cs('s', '::after').backgroundColor, sRing: cs('s', '::before').backgroundColor, sRingDisplay: cs('s', '::before').display, aRingDisplay: cs('a', '::before').display,
      rowsH: r('rows').height, r2d: cs('r2').display, headW: document.getElementById('r1').children[0].getBoundingClientRect().width, laneW: r('l1').width, headBg: getComputedStyle(document.getElementById('r1').children[0]).backgroundColor,
      aGlyphW: cs('a', '::after').width, oGlyphW: cs('o', '::after').width, tGlyphW: cs('t', '::after').width, tGlyphH: cs('t', '::after').height,
      rlW: cs('rl', '::after').width, rlH: cs('rl', '::after').height, rlClip: cs('rl', '::after').clipPath, tClip: cs('t', '::after').clipPath,
      rlRing: cs('rl', '::before').display, rlPe: cs('rl').pointerEvents,
      // ink runs across the middle of the roll's clip path, sampled every quarter pixel: a roll is three bars with two gaps (the margin before the first bar is not a gap)
      rlRuns: (() => { const m = cs('rl', '::after').clipPath.match(/^path\("(.*)"\)$/); if (!m) return null; const p = new Path2D(m[1]), x = document.createElement('canvas').getContext('2d'); const runs = []; let on = false, start = 0;
        for (let q = 0; q <= 60; q++) { const hit = q < 60 && x.isPointInPath(p, q / 4 + 0.125, 6); if (hit !== on) { if (on) runs.push(['bar', (q - start) / 4]); else if (runs.length) runs.push(['gap', (q - start) / 4]); on = hit; start = q; } } return runs; })(),
      spLeft: r('sp').left - lane.left, spW: r('sp').width, xDisplay: cs('x').display, rcBg: cs('rc').backgroundColor, rcMl: cs('rc').marginLeft };
  });
  ok(m.lh === 24, 'the lane is 24px');
  ok(Math.abs(m.aCx - 100) < 0.6 && Math.abs(m.hCx - 200) < 0.6, 'a marker sits at --x of the lane width');
  ok(m.aW === 24 && m.aH === 24, 'every marker has a 24px hit area');
  ok(m.aBg === 'rgb(248, 183, 135)', 'a detected marker is the secondary (KOMPOSITOR #f8b787)');
  ok(m.hBg === 'rgb(255, 106, 67)', 'a hand marker is the accent (KOMPOSITOR #ff6a43)');
  ok(m.aBg !== m.hBg, 'a plain marker is not the accent (negative control)');
  ok(m.sBg === 'rgb(244, 244, 244)' && m.sRing === 'rgb(255, 106, 67)' && m.sRingDisplay === 'block' && m.aRingDisplay === 'none', 'a selected marker is white with an accent ring behind it; an unselected one has no ring');
  ok(m.aGlyphW === '14px' && m.oGlyphW === '8px' && m.tGlyphW === '5px' && m.tGlyphH === '14px', 'glyph sizes: accent 14, off-beat 8, hit 5 x 14 (solid)');
  ok(m.rlW === '15px' && m.rlH === '12px' && m.rlClip !== m.tClip, 'roll: a 15 x 12 box (13px of bars), not the hit bar');
  { const bars = (m.rlRuns || []).filter((r) => r[0] === 'bar'), gaps = (m.rlRuns || []).filter((r) => r[0] === 'gap');
    ok(bars.length === 3 && bars.every((r) => Math.abs(r[1] - 3) <= 0.25), 'roll: exactly three bars, each 3px wide (a triangle or one block fails here)');
    ok(gaps.length === 2 && gaps.every((r) => Math.abs(r[1] - 2) <= 0.25), 'roll: two gaps of 2px between the bars'); }
  ok(m.rlRing === 'none' && m.rlPe === 'none', 'roll: no selected ring and no pointer (derived from the hits, never selected)');
  ok(m.rowsH === 49 && m.r2d === 'none', 'sub-rows: a row with no markers (hidden) takes no space; two 24px rows + 1px gap');
  ok(m.headW === 72 && Math.abs(m.laneW - 328) < 0.6 && m.headBg === 'rgb(43, 43, 43)', 'a row head is 72px on --bg-2 and the lane fills the rest');
  ok(Math.abs(m.spLeft - 120) < 0.6 && Math.abs(m.spW - 40) < 0.6, 'a span starts at --x and is --w of the lane wide');
  ok(m.xDisplay === 'none', 'a hidden marker is not displayed');
  ok(m.rcBg === 'rgba(0, 0, 0, 0)' && m.rcMl === '0px', 'the REACT block has no box and no indent (v0.41.113)');
  ok(typeof MENU_ICONS.react === 'string' && MENU_ICONS.react.length > 20, 'the react icon exists');
  console.log(`lane: ${n} checks passed`);
} finally { await b.close(); }
