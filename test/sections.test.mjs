// node test/sections.test.mjs: the panel-section rhythm (v0.31.0) measured in a real browser (Edge): a title sits 14px
// above its first control, each section is padded 22px, a 2px line divides one section from the next, and the first
// section has no line. Measured from dist/app.css, so a rule that drifts fails here.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const { chromium } = (() => {
  for (const repo of ['V3KTR-PROCESSOR', 'V3KTR-kompositor', 'V3KTR-SPACING-WT']) {
    try { return createRequire(`file:///D:/00%20CLAUDE%20APPS/${repo}/package.json`)('playwright'); } catch (e) {}
  }
  throw new Error('playwright not found in any sibling checkout');
})();
const css = readFileSync(new URL('../dist/app.css', import.meta.url), 'utf8');
const sec = (t) => `<section class="vk-section"><div class="vk-sec-label">${t}</div><div class="vk-scrub"><span class="vk-scrub__label">A</span></div><div class="vk-scrub"><span class="vk-scrub__label">B</span></div></section>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  await p.setContent(`<!doctype html><html data-app="dimensor"><style>${css}</style><body style="margin:0"><div id="panel" style="width:330px">${sec('One')}${sec('Two')}</div>`);
  const m = await p.evaluate(() => {
    const [s1, s2] = document.querySelectorAll('.vk-section'), r = (e) => e.getBoundingClientRect();
    const lab = s2.querySelector('.vk-sec-label'), first = s2.querySelector('.vk-scrub'), last1 = [...s1.querySelectorAll('.vk-scrub')].pop();
    return { head: r(first).top - r(lab).bottom, padTop: r(lab).top - r(s2).top, padLeft: r(lab).left - r(s2).left,
      above: r(s2).top - r(last1).bottom, line1: getComputedStyle(s1).boxShadow, line2: getComputedStyle(s2).boxShadow };
  });
  ok(m.head === 14, `title to its first control is 14px (${m.head})`);
  ok(m.padTop === 22 && m.padLeft === 22, `a section is padded 22px (top ${m.padTop}, left ${m.padLeft})`);
  ok(m.line1 === 'none' && /2px/.test(m.line2), `a 2px line divides sections, none above the first (${m.line1} / ${m.line2})`);
  ok(m.above >= 22, `the last control sits at least 22px above the next section (${m.above})`);
  console.log(`sections: ${n} checks passed`);
} finally { await b.close(); }
