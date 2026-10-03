// node test/fonts.test.mjs: the self-hosted fonts (v0.33.0) load in a real browser (Edge) with the network to anything
// but this test server blocked: every family and weight in fonts/fonts.css loads from fonts/, the text set in --mono
// and --sans really draws in them (not a fallback: measured against monospace / sans-serif), and no request leaves.
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
const PAGE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/fonts/fonts.css"><link rel="stylesheet" href="/dist/app.css">
<body data-app="processor"><span id="m" style="font-family:var(--mono);font-size:40px">Wiiiimm 0.00</span><span id="s" style="font-family:var(--sans);font-size:40px">Wiiiimm 0.00</span>
<span id="mf" style="font-family:monospace;font-size:40px">Wiiiimm 0.00</span><span id="sf" style="font-family:sans-serif;font-size:40px">Wiiiimm 0.00</span>`;
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = createServer(async (q, s) => {
  if (q.url === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGE); }
  try { const d = await readFile(ROOT + q.url.slice(1)); s.writeHead(200, { 'content-type': TYPES[q.url.match(/\.\w+$/)?.[0]] || 'application/octet-stream' }); s.end(d); }
  catch { s.writeHead(404); s.end(); }
});
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const ctx = await b.newContext(); const origin = `http://localhost:${srv.address().port}`;
  const outside = []; await ctx.route('**/*', (r) => { if (r.request().url().startsWith(origin)) return r.continue(); outside.push(r.request().url()); return r.abort(); });
  const fontReqs = []; const p = await ctx.newPage(); p.on('requestfinished', (r) => { if (r.url().endsWith('.woff2')) fontReqs.push(r.url()); });
  await p.goto(origin + '/');
  const res = await p.evaluate(async () => {
    const want = [['JetBrains Mono', [400, 500, 600, 700]], ['Manrope', [400, 500, 600, 700, 800]]];
    const loads = []; for (const [f, ws] of want) for (const w of ws) { await document.fonts.load(`${w} 16px '${f}'`, 'Wa').catch(() => {}); const face = [...document.fonts].find((x) => x.family.replace(/"/g, '') === f && x.weight === String(w) && x.unicodeRange.startsWith('U+0-FF')); loads.push([f, w, face ? face.status : 'none']); }
    await document.fonts.ready;
    const wd = (id) => document.getElementById(id).getBoundingClientRect().width;
    return { loads, m: wd('m'), mf: wd('mf'), s: wd('s'), sf: wd('sf') };
  });
  ok(res.loads.every(([, , k]) => k === 'loaded'), 'every family and weight loads: ' + res.loads.map(([f, w, k]) => `${f} ${w}:${k}`).join(', '));
  ok(Math.abs(res.m - res.mf) > 2, `--mono draws in JetBrains Mono, not the fallback (${res.m.toFixed(1)} vs ${res.mf.toFixed(1)})`);
  ok(Math.abs(res.s - res.sf) > 2, `--sans draws in Manrope, not the fallback (${res.s.toFixed(1)} vs ${res.sf.toFixed(1)})`);
  ok(fontReqs.length > 0 && fontReqs.every((u) => u.startsWith(origin + '/fonts/')), `fonts come from fonts/ (${fontReqs.length} files)`);
  ok(outside.length === 0, 'no request leaves the page\'s own server: ' + JSON.stringify(outside));
  console.log(`fonts: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
