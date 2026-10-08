// node test/status.test.mjs: the status bar's dot separators (v0.38.0) measured in a real browser (Edge), built from
// dist/app.css so a rule that drifts fails here. A plain .vk-status with several children gets a dot before every
// child but the first; a one-child bar gets none; removing a child from the DOM (not hiding it) still reads right.
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
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage();
  await p.setContent(`<!doctype html><html data-app="processor"><style>${css}</style><body style="margin:0">
    <div id="s3" class="vk-status"><span>Ready</span><span>60 fps</span><span>3 layers</span></div>
    <div id="s1" class="vk-status"><span>Ready</span></div>
    <div id="se" class="vk-status"><span>Ready</span><span id="fps"></span><span>3 layers</span></div>
  </body>`);
  const dots = await p.evaluate(() => [...document.querySelectorAll('#s3 > *')].map((el) => getComputedStyle(el, '::before').content));
  ok(dots[0] === 'none', `the first child gets no dot (${dots[0]})`);
  ok(dots[1] === '"·"' && dots[2] === '"·"', `every later child gets a dot (${dots.slice(1).join(', ')})`);
  const one = await p.evaluate(() => getComputedStyle(document.querySelector('#s1 > *'), '::before').content);
  ok(one === 'none', `a single child gets no dot (${one})`);
  // the risk the file's own comment warns about: taking the FIRST item out with display:none, not the DOM, leaves
  // its dot rule attached to it (still :first-child), so the item now drawn first wrongly keeps its own dot too
  await p.evaluate(() => { document.querySelectorAll('#s3 > *')[0].style.display = 'none'; });
  const hidden = await p.evaluate(() => getComputedStyle(document.querySelectorAll('#s3 > *')[1], '::before').content);
  ok(hidden === '"·"', `hiding the first item with display:none leaves a stray dot on the one now drawn first (${hidden}) — the bug the file warns about`);
  // done properly: remove the first item from the DOM, and the new first gets no dot
  await p.evaluate(() => { document.querySelectorAll('#s3 > *')[0].remove(); });
  const removed = await p.evaluate(() => getComputedStyle(document.querySelectorAll('#s3 > *')[0], '::before').content);
  ok(removed === 'none', `removing it from the DOM instead leaves the new first item with no dot (${removed})`);
  // an empty child (PROCESSOR's fps readout at rest) draws no dot of its own, and the next real item still gets one
  const empties = await p.evaluate(() => [...document.querySelectorAll('#se > *')].map((el) => getComputedStyle(el).display));
  ok(empties[1] === 'none', `an empty child is taken out of the flow (${empties[1]})`);
  const afterEmpty = await p.evaluate(() => getComputedStyle(document.querySelectorAll('#se > *')[2], '::before').content);
  ok(afterEmpty === '"·"', `the item after an empty one still gets its own dot (${afterEmpty})`);
  await p.evaluate(() => { document.getElementById('fps').textContent = '60 fps'; });
  const filled = await p.evaluate(() => getComputedStyle(document.getElementById('fps')).display);
  ok(filled !== 'none', `filling the empty span in later shows it again (${filled})`);
  // no fixed height: the row's own height comes from its padding, so --frame-bottom (an app's window-margin pad) works
  const h = await p.evaluate(() => {
    document.documentElement.style.setProperty('--frame-bottom', '22px');
    const r = document.getElementById('s1').getBoundingClientRect().height;
    document.documentElement.style.removeProperty('--frame-bottom');
    return r;
  });
  ok(h > 28, `--frame-bottom grows the row instead of being clipped by a fixed height (${h}px)`);
  console.log(`status: ${n} checks passed`);
} finally { await b.close(); }
