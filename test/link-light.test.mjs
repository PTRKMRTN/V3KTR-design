// node test/link-light.test.mjs [sheet.png]: interactions/link-light.js in a real browser (Edge). Checks the marks'
// order, kinds, labels, that only linked marks are buttons and they call onFocus (click and Enter), that "no link" reads
// as not open, contrast of every mark against the top bar, and optionally writes a sheet of every state in all three apps.
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
const bars = [['processor', 'ready', ['kompositor']], ['processor', 'ready', []], ['kompositor', 'ready', ['processor', 'dimensor']], ['dimensor', 'ready', ['processor']], ['dimensor', 'off', []], ['kompositor', 'connecting', []]];
const PAGE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/dist/app.css">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<body style="margin:0;background:#111;width:900px;font-family:Manrope,sans-serif">
${bars.map(([app, state, peers], i) => `<div style="font:11px monospace;color:#8a8a8a;padding:10px 12px 4px">${app.toUpperCase()} · ${state}${peers.length ? ' · linked: ' + peers.join(', ') : ''}</div>
<div data-app="${app}"><div class="vk-topbar"><div class="vk-menu">File</div><div class="vk-menu">Edit</div><div class="vk-link" id="l${i}"></div></div></div>`).join('')}
<script type="module">
import { mountLinkLight } from '/interactions/link-light.js';
window.focused = [];
const bars = ${JSON.stringify(bars)};
bars.forEach(([app, state, peers], i) => mountLinkLight(document.getElementById('l' + i), { self: app, onFocus: (a) => window.focused.push(a) }).update({ state, peers }));
window.ready = true;
</script>`;
const srv = createServer(async (q, s) => {
  if (q.url === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGE); }
  try { const d = await readFile(ROOT + q.url.slice(1)); s.writeHead(200, { 'content-type': q.url.endsWith('.js') ? 'text/javascript' : 'text/css' }); s.end(d); }
  catch { s.writeHead(404); s.end(); }
});
await new Promise((r) => srv.listen(0, r));
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const p = await b.newPage({ deviceScaleFactor: 2 }); await p.goto(`http://localhost:${srv.address().port}/`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(600);
  if (SHEET) { await p.screenshot({ path: SHEET, fullPage: true }); console.log('sheet:', SHEET); }   // the resting states, before any click or focus
  const marks = (i) => p.evaluate((i) => [...document.querySelectorAll(`#l${i} .vk-link__mark`)].map((m) => ({ tag: m.tagName, text: m.textContent, cls: m.className, label: m.getAttribute('aria-label'), tip: m.dataset.tip })), i);
  let m = await marks(0);
  ok(m.map((x) => x.text).join('') === 'PKD', 'order is always P K D');
  ok(m[0].cls.includes('is-self') && m[0].tag === 'SPAN' && m[0].label === 'PROCESSOR (this app)', 'this app: marked, not a button, labelled');
  ok(m[1].cls.includes('is-linked') && m[1].tag === 'BUTTON' && /KOMPOSITOR is connected/.test(m[1].label), 'linked peer: a button with a word');
  ok(m[2].cls.includes('is-absent') && m[2].tag === 'SPAN' && /DIMENSOR isn't open/.test(m[2].label), 'not open: grey, labelled');
  ok(m.every((x) => x.tip === x.label), 'every mark has a tip (for installTips) matching its label');
  m = await marks(4); ok(m[2].cls.includes('is-self') && m.slice(0, 2).every((x) => x.cls.includes('is-absent') && /No link to/.test(x.label)), 'no link (DIMENSOR): the others read not open, and say why');
  m = await marks(5); ok(m[1].cls.includes('is-self') && [m[0], m[2]].every((x) => /Connecting/.test(x.label)), 'connecting (KOMPOSITOR) says so');
  await p.click('#l0 .vk-link__mark.is-linked'); ok((await p.evaluate(() => window.focused)).join() === 'kompositor', 'clicking a linked mark asks to switch to that app');
  await p.focus('#l2 .vk-link__mark[data-app="dimensor"]'); await p.keyboard.press('Enter'); ok((await p.evaluate(() => window.focused)).join() === 'kompositor,dimensor', 'Enter on a linked mark too');
  // contrast of each mark's letter against what's behind it
  const cr = await p.evaluate(() => {
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const L = (s) => { const [r, g, b2] = s.match(/\d+/g).map(Number); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b2); };
    const ratio = (a, b2) => { const x = L(a), y = L(b2); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const bar = getComputedStyle(document.querySelector('.vk-topbar')).backgroundColor;
    return [...document.querySelectorAll('.vk-link__mark')].map((m) => { const cs = getComputedStyle(m); const bg = cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? bar : cs.backgroundColor; return [m.className.replace('vk-link__mark ', '') + ':' + m.dataset.app, ratio(cs.color, bg)]; });
  });
  const worst = cr.reduce((a, c) => (c[1] < a[1] ? c : a));
  ok(worst[1] >= 4.5, `every mark passes 4.5:1 (worst ${worst[0]} ${worst[1].toFixed(2)})`);
  console.log('lowest contrast:', worst[0], worst[1].toFixed(2));
  console.log(`link-light: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
