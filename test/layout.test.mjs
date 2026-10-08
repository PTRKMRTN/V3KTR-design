// node test/layout.test.mjs: drives interactions/layout.js's workspaceAlign in a real browser (Edge). Checks: the
// default is 'right' with no data-ws-align attribute (the default DOM is unchanged, like data-helper-text); set('left')
// adds the attribute and persists across a reload (localStorage, per app); toggle() flips both ways; a different
// app's key is independent; an invalid stored value falls back to 'right'.
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
const PAGE = `<!doctype html><meta charset="utf-8"><body>
<script type="module">
import { workspaceAlign } from '/interactions/layout.js';
window.workspaceAlign = workspaceAlign;
window.ready = true;
</script>`;
const srv = createServer(async (q, s) => {
  if (q.url === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGE); }
  try { const d = await readFile(ROOT + q.url.slice(1)); s.writeHead(200, { 'content-type': 'text/javascript' }); s.end(d); }
  catch { s.writeHead(404); s.end(); }
});
await new Promise((r) => srv.listen(0, r));
const url = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage(); await p.goto(url); await p.waitForFunction(() => window.ready);
  const r1 = await p.evaluate(() => { const ws = window.workspaceAlign('kompositor'); return { on: ws.on, attr: document.documentElement.getAttribute('data-ws-align') }; });
  ok(r1.on === 'right' && r1.attr === null, `default is right, no attribute (${r1.on}, ${r1.attr})`);
  const r2 = await p.evaluate(() => { const ws = window.workspaceAlign('kompositor'); ws.set('left'); return document.documentElement.getAttribute('data-ws-align'); });
  ok(r2 === 'left', `set('left') adds data-ws-align="left" (${r2})`);
  await p.reload(); await p.waitForFunction(() => window.ready);
  const r3 = await p.evaluate(() => { const ws = window.workspaceAlign('kompositor'); return { on: ws.on, attr: document.documentElement.getAttribute('data-ws-align') }; });
  ok(r3.on === 'left' && r3.attr === 'left', `the choice survives a reload (${r3.on}, ${r3.attr})`);
  const r4 = await p.evaluate(() => { const ws = window.workspaceAlign('kompositor'); ws.toggle(); const back = ws.on; ws.toggle(); return { back, forward: ws.on }; });
  ok(r4.back === 'right' && r4.forward === 'left', `toggle() flips both ways (${r4.back} → ${r4.forward})`);
  const r5 = await p.evaluate(() => window.workspaceAlign('processor').on);
  ok(r5 === 'right', `a different app's key is independent (${r5})`);
  const r6 = await p.evaluate(() => { localStorage.setItem('v3ktr-dimensor-ws-align', 'sideways'); return window.workspaceAlign('dimensor').on; });
  ok(r6 === 'right', `an invalid stored value falls back to right (${r6})`);
  console.log(`layout: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
