// node test/btnic.test.mjs: .vk-btn--ic (v0.41.60): icon + label on one line, 6px gap, 14px icon, the icon follows the label colour. Negative control: a plain .vk-btn--sm has no gap.
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
const { menuIconSvg } = await import('../icons/menu-icons.js');
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  await p.setContent(`<style>${css}</style><body data-app="dimensor"><button id="a" class="vk-btn vk-btn--sm vk-btn--ic"><span class="vk-menu-ic">${menuIconSvg('up', 14)}</span>Show library</button><button id="n" class="vk-btn vk-btn--sm">Plain</button>`);
  const m = await p.evaluate(() => {
    const cs = (e) => getComputedStyle(e), a = document.getElementById('a'), ic = a.firstElementChild, r = (e) => e.getBoundingClientRect();
    return { disp: cs(a).display, gap: cs(a).columnGap, pad: cs(a).paddingLeft + ' ' + cs(a).paddingTop, icW: r(ic).width, icC: cs(ic).color, aC: cs(a).color, nGap: cs(document.getElementById('n')).columnGap, ly: Math.abs((r(ic).top + r(ic).height / 2) - (r(a).top + r(a).height / 2)) };
  });
  ok(m.disp === 'inline-flex' && m.gap === '6px', 'inline flex with a 6px gap');
  ok(m.pad === '10px 3px', 'small size padding 3px 10px');
  ok(m.icW === 14, 'the icon is 14px');
  ok(m.icC === m.aC, 'the icon takes the label colour');
  ok(m.ly < 1, 'the icon is centred on the button');
  ok(m.nGap === 'normal', 'a plain small button has no gap (negative control)');
  console.log(`btnic: ${n} checks passed`);
} finally { await b.close(); }
