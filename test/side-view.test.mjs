// node test/side-view.test.mjs [sheet.png]: interactions/side-view.js in a real browser (Edge). Drives the canvas with a
// mouse: drag the block (depth), drag an end (thickness about the centre), Shift = a tenth, a press outside the block
// jumps it there, keys, double-click and Home reset, an update during a drag is ignored, the block draws in the app's
// colour, and toRange / fromRange agree. The well is 400 px wide, so 40 px = 0.1 of depth.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = (() => {
  for (const repo of ['V3KTR-PROCESSOR', 'V3KTR-kompositor', 'V3KTR-SPACING-WT']) {
    try { return createRequire(`file:///D:/00%20CLAUDE%20APPS/${repo}/package.json`)('playwright'); } catch (e) {}
  }
  throw new Error('playwright not found in any sibling checkout');
})();
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHEET = process.argv[2];
const PAGE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/dist/app.css">
<body data-app="kompositor" style="margin:0;padding:20px;background:#212121">
<div id="well" style="width:400px;height:132px;background:var(--bg-1)"></div>
<script type="module">
import { mountSideView, toRange, fromRange } from '/interactions/side-view.js';
window.log = []; window.toRange = toRange; window.fromRange = fromRange;
// a plate: a near subject in the middle rows, a far background everywhere else (q: near = 255)
const w = 80, h = 60, data = new Uint8Array(w * h);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data[y * w + x] = (y > h * 0.3 && y < h * 0.7 && x > w * 0.3 && x < w * 0.7) ? 210 : 40;
window.sv = mountSideView(document.getElementById('well'), {
  onInput: (p) => window.log.push(['input', +p.depth.toFixed(4), +p.thickness.toFixed(4)]),
  onCommit: (p) => window.log.push(['commit', +p.depth.toFixed(4), +p.thickness.toFixed(4)]),
  onReset: () => window.log.push(['reset']),
});
window.reset = () => { window.sv.update({ plate: { data, width: w, height: h }, box: null, place: { depth: 0.5, thickness: 0.3 }, rect: { y: 0.2, h: 0.6 }, auto: { subject: 0.82 } }); window.log = []; };
window.reset(); window.ready = true;
</script>`;
const srv = createServer(async (q, s) => {
  if (q.url === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGE); }
  try { const d = await readFile(ROOT + q.url.slice(1)); s.writeHead(200, { 'content-type': q.url.endsWith('.js') ? 'text/javascript' : 'text/css' }); s.end(d); }
  catch { s.writeHead(404); s.end(); }
});
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const near = (a, b2, e = 0.006) => Math.abs(a - b2) <= e;
try {
  const p = await b.newPage({ deviceScaleFactor: 2 }); await p.goto(`http://localhost:${srv.address().port}/`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(200);
  const box = await p.evaluate(() => document.querySelector('.vk-side-view').getBoundingClientRect().toJSON());
  const X = (lin) => box.left + (1 - lin) * box.width, Y = box.top + box.height / 2;   // linear depth → page x
  const last = async (k) => (await p.evaluate(() => window.log)).filter((e) => e[0] === k).pop();
  if (SHEET) await p.locator('#well').screenshot({ path: SHEET });
  // the block draws in the app's colour (mandarin) at its centre
  const px = await p.evaluate(([x, y]) => { const c = document.querySelector('.vk-side-view'), r = c.getBoundingClientRect(), s = c.width / r.width; return [...c.getContext('2d').getImageData(Math.round((x - r.left) * s), Math.round((y - r.top) * s), 1, 1).data]; }, [X(0.5), Y]);
  ok(px[0] > px[1] + 40 && px[0] > px[2] + 40, 'the block is drawn in the app colour: rgba ' + px.join(','));
  // drag the block 40 px to the right (farther): depth 0.5 → 0.4, thickness unchanged
  await p.mouse.move(X(0.5), Y); await p.mouse.down(); await p.mouse.move(X(0.5) + 40, Y, { steps: 4 });
  let i = await last('input'); ok(near(i[1], 0.4) && near(i[2], 0.3), `drag moves depth (0.5 → ${i[1]}), thickness stays (${i[2]})`);
  await p.evaluate(() => window.sv.update({ place: { depth: 0.9, thickness: 0.1 } }));
  await p.mouse.move(X(0.5) + 41, Y); i = await last('input'); ok(near(i[1], 0.3975), 'an update during a drag is ignored');
  await p.mouse.up(); ok((await last('commit'))?.[1] !== undefined, 'letting go commits once');
  // the near end (left, x of depth + t/2 = 0.65): drag it 20 px left → thickness + 2 × 0.05 = 0.4, depth stays
  await p.evaluate(() => window.reset());
  await p.mouse.move(X(0.65), Y); await p.mouse.down(); await p.mouse.move(X(0.65) - 20, Y, { steps: 4 }); await p.mouse.up();
  i = await last('commit'); ok(near(i[1], 0.5) && near(i[2], 0.4), `dragging an end changes thickness about the centre (${i[1]}, ${i[2]})`);
  // Shift = fine: 40 px moves 0.01
  await p.evaluate(() => window.reset());
  await p.keyboard.down('Shift'); await p.mouse.move(X(0.5), Y); await p.mouse.down(); await p.mouse.move(X(0.5) + 40, Y, { steps: 4 }); await p.mouse.up(); await p.keyboard.up('Shift');
  i = await last('commit'); ok(near(i[1], 0.49, 0.002), `Shift drag is a tenth (0.5 → ${i[1]})`);
  // a press outside the block jumps it there
  await p.evaluate(() => window.reset());
  await p.mouse.move(X(0.1), Y); await p.mouse.down(); await p.mouse.up();
  i = (await p.evaluate(() => window.log)).find((e) => e[0] === 'input'); ok(near(i[1], 0.1, 0.01), `a press outside jumps the block there (${i[1]})`);
  // keys
  await p.evaluate(() => window.reset()); await p.focus('.vk-side-view');
  await p.keyboard.press('ArrowLeft'); i = await last('commit'); ok(near(i[1], 0.51, 0.0001), '← moves nearer by 0.01');
  await p.keyboard.press('Shift+ArrowRight'); i = await last('commit'); ok(near(i[1], 0.41, 0.0001), 'Shift+→ moves farther by 0.1');
  await p.keyboard.press('ArrowUp'); i = await last('commit'); ok(near(i[2], 0.31, 0.0001), '↑ thickens by 0.01');
  await p.keyboard.press('Home'); ok((await last('reset')) !== undefined, 'Home resets to auto');
  await p.evaluate(() => { window.log = []; }); await p.mouse.dblclick(X(0.5), Y); ok((await last('reset')) !== undefined, 'double-click resets to auto');
  // thickness never goes below the minimum
  await p.evaluate(() => window.reset()); for (let k = 0; k < 4; k++) await p.keyboard.press('Shift+ArrowDown');
  i = await last('commit'); ok(near(i[2], 0.02, 0.0001), 'thickness stops at 0.02');
  // the range helpers
  const rr = await p.evaluate(() => { const r = window.toRange({ depth: 0.5, thickness: 0.3 }); const back = window.fromRange(r); return [r, back]; });
  ok(near(rr[0].near, 0.65, 1e-9) && near(rr[0].far, 0.35, 1e-9) && near(rr[1].depth, 0.5, 1e-9) && near(rr[1].thickness, 0.3, 1e-9), 'toRange / fromRange round-trip');
  ok(await p.evaluate(() => document.querySelector('.vk-side-view').getAttribute('role') === 'group' && !!document.querySelector('.vk-side-view').dataset.tip), 'labelled, with a tip');
  console.log(`side-view: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
