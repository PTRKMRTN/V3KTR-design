// node test/sections.test.mjs: the panel-section rhythm (v0.32.0: space only, no lines) measured in a real browser (Edge):
// a title sits 14px above its first control, the panel's first section starts 22px down and every section is 22px in
// from the sides, one section's last control sits 33px above the next title, and nothing draws a line between them.
// Measured from dist/app.css, so a rule that drifts fails here.
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
    const lab1 = s1.querySelector('.vk-sec-label'), lab = s2.querySelector('.vk-sec-label'), first = s2.querySelector('.vk-scrub'), last1 = [...s1.querySelectorAll('.vk-scrub')].pop();
    const panel = document.getElementById('panel'), lastAll = [...s2.querySelectorAll('.vk-scrub')].pop();
    return { head: r(first).top - r(lab).bottom, padTop: r(lab1).top - r(panel).top, padLeft: r(lab).left - r(panel).left,
      gap: r(lab).top - r(last1).bottom, padBottom: r(panel).bottom - r(lastAll).bottom,
      lines: [s1, s2].map((e) => getComputedStyle(e).boxShadow + '|' + getComputedStyle(e).borderTopWidth + '|' + getComputedStyle(e, '::before').content).join(' ') };
  });
  ok(m.head === 14, `title to its first control is 14px (${m.head})`);
  ok(m.padTop === 22 && m.padLeft === 22, `sections sit 22px in from the panel's top and side (top ${m.padTop}, left ${m.padLeft})`);
  ok(m.gap === 33, `a section's last control sits 33px above the next title (${m.gap})`);
  ok(m.padBottom >= 22, `the last section ends 22px or more above the panel's foot (${m.padBottom})`);
  ok(!/2px|1px/.test(m.lines.replace(/|0px/g, '')) && !/inset/.test(m.lines), `no line between sections (${m.lines})`);
  console.log(`sections: ${n} checks passed`);
} finally { await b.close(); }
