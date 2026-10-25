// node test/subhead.test.mjs: the sub-heading spacing (v0.41.49) measured in a real browser (Edge): 22px above a sub-heading (block flow and as the first child of a flex row wrapper),
// 6px to its control, none directly after a section title, and a .vk-seg after it loses its 19px margin. Negative control: without .vk-sub-head the micro-label keeps no such gap.
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
try {
  const p = await b.newPage();
  await p.setContent(`<style>${css}</style><body data-app="dimensor" style="margin:0"><div style="width:330px">
<section class="vk-section" id="s1"><div class="vk-sec-head" id="t1">Title</div><div class="vk-micro-label vk-sub-head" id="h0">ORDER</div><div class="vk-scrub" id="c0"><span class="vk-scrub__label">A</span></div>
<div class="vk-scrub" id="c1"><span class="vk-scrub__label">B</span></div><div class="vk-micro-label vk-sub-head" id="h1">HOLD</div><div class="vk-seg" id="g1"><button class="vk-chip">One</button></div>
<div class="vk-scrub" id="c2"><span class="vk-scrub__label">C</span></div><div class="vk-micro-label" id="plain">PLAIN</div><div class="vk-scrub" id="c3"><span class="vk-scrub__label">D</span></div>
<div class="vk-scrub" id="c4"><span class="vk-scrub__label">E</span></div><div><div class="vk-micro-label vk-sub-head" id="h2">SIZE</div><div class="vk-scrub" id="c5"><span class="vk-scrub__label">F</span></div></div><div class="vk-scrub" id="c6"><span class="vk-scrub__label">G</span></div><div style="display:flex;flex-direction:column"><div class="vk-micro-label vk-sub-head" id="h3">VIEW</div></div></section></div></body>`);
  const m = await p.evaluate(() => {
    const r = (id) => document.getElementById(id).getBoundingClientRect(), g = (a, b) => Math.round(r(b).top - r(a).bottom);
    return { titleToSub: g('t1', 'h0'), subToCtl: g('h0', 'c0'), above: g('c1', 'h1'), subToSeg: g('h1', 'g1'), plainAbove: g('c3', 'plain') - 0, flexAbove: g('c4', 'h2'), flexBelow: g('h2', 'c5'), boxedAbove: g('c6', 'h3'), plainPad: getComputedStyle(document.getElementById('plain')).marginTop };
  });
  ok(m.titleToSub === 14, `directly after a section title the title's 14px holds (got ${m.titleToSub})`);
  ok(m.subToCtl === 6, `sub-heading to its control is 6px (got ${m.subToCtl})`);
  ok(m.above === 22, `22px above a sub-heading after a control (got ${m.above})`);
  ok(m.subToSeg === 6, `a .vk-seg after a sub-heading loses its own margin: 6px (got ${m.subToSeg})`);
  ok(m.flexAbove === 22, `22px above a sub-heading that is the first child of a block wrapper (a plain block wrapper: the 3px control margin collapses) (got ${m.flexAbove})`);
  ok(m.boxedAbove === 25, `a wrapper that makes its own box (flex) does not collapse the control margin above: 22 + 3 = 25 (got ${m.boxedAbove})`);
  ok(m.flexBelow === 6, `6px below it in the wrapper (got ${m.flexBelow})`);
  ok(m.plainPad === '0px', 'a plain micro-label (no .vk-sub-head) gets no gap rule (negative control)');
  const tok = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--sub-head-gap').trim());
  ok(tok === '22px', '--sub-head-gap is 22px');
  console.log(`subhead: ${n} checks passed`);
} finally { await b.close(); }
