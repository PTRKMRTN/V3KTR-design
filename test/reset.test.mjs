// node test/reset.test.mjs: drives interactions/reset.js in a real browser (Edge). Checks: interfaceKeys finds every
// v3ktr-<app>-* key and an extraKey, but not another app's key or an unrelated key; resetInterface clears exactly
// those and reloads by default; reload:false leaves the page alone (so a test harness, or an app that wants to
// confirm first, can call it without losing state); nothing outside the app's own prefix is ever touched.
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
import { interfaceKeys, resetInterface } from '/interactions/reset.js';
window.interfaceKeys = interfaceKeys; window.resetInterface = resetInterface;
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
  await p.evaluate(() => {
    localStorage.setItem('v3ktr-kompositor-helper-text', 'on');
    localStorage.setItem('v3ktr-kompositor-ws-align', 'left');
    localStorage.setItem('v3ktr-processor-helper-text', 'on');   // a different app: must survive
    localStorage.setItem('kompositor-recent-projects', '["a.kmp"]');   // not v3ktr-prefixed, and not listed as an extra key
    localStorage.setItem('kompositor-ui-scale', '1.25');   // a legacy key, passed as an extra key below
  });
  const keys = await p.evaluate(() => window.interfaceKeys('kompositor', {}, { extraKeys: ['kompositor-ui-scale'] }));
  ok(keys.sort().join(',') === 'kompositor-ui-scale,v3ktr-kompositor-helper-text,v3ktr-kompositor-ws-align', `finds the app's v3ktr-* keys plus the named extra, nothing else (${keys.join(', ')})`);
  await p.evaluate(() => window.resetInterface('kompositor', {}, { extraKeys: ['kompositor-ui-scale'], reload: false }));
  const after = await p.evaluate(() => ({
    helper: localStorage.getItem('v3ktr-kompositor-helper-text'), ws: localStorage.getItem('v3ktr-kompositor-ws-align'),
    scale: localStorage.getItem('kompositor-ui-scale'), recent: localStorage.getItem('kompositor-recent-projects'),
    otherApp: localStorage.getItem('v3ktr-processor-helper-text'),
  }));
  ok(after.helper === null && after.ws === null && after.scale === null, `the named keys are cleared (${JSON.stringify(after)})`);
  ok(after.recent === '["a.kmp"]', `an unrelated key (not v3ktr-* and not an extra key) survives (${after.recent})`);
  ok(after.otherApp === 'on', `another app's v3ktr-* key survives (${after.otherApp})`);
  // reload:false (just used above) must not have reloaded; prove the default (reload:true) does
  const navigated = p.waitForEvent('framenavigated', { timeout: 3000 }).then(() => true).catch(() => false);
  await p.evaluate(() => { localStorage.setItem('v3ktr-dimensor-helper-text', 'on'); window.resetInterface('dimensor'); });
  ok(await navigated, 'reload:true (the default) reloads the page');
  console.log(`reset: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
