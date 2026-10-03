// node test/link-badge.test.mjs [sheet.png]: interactions/link-badge.js + app/link-badge.css in a real browser (Edge).
// Every state is the mark + a word, the chain takes the OWNER's colour (not the host app's), Update available is the
// one solid button and calls onUpdate, the others open the menu when onMenu is set, a badge click never reaches the row,
// "Source not responding" wins over Update available, a manual policy hides Update available, and the menu's items.
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
<body data-app="kompositor" style="margin:0;padding:20px;background:#212121;color:#cfcfcf;font:11px sans-serif">
<div id="sheet" style="display:grid;grid-template-columns:auto auto auto;gap:10px 18px;align-items:center;width:max-content;padding:16px;background:var(--bg-2)"></div>
<div id="row" style="margin-top:12px;padding:6px;background:var(--bg-2)"></div>
<script type="module">
import { linkBadge, linkBadgeHtml, linkBadgeMenu, badgeOf } from '/interactions/link-badge.js';
window.log = []; window.badgeOf = badgeOf; window.linkBadgeMenu = linkBadgeMenu; window.linkBadgeHtml = linkBadgeHtml;
const S = [['linked', { state: 'linked' }], ['update', { state: 'updateAvailable' }], ['stale', { state: 'linked', notResponding: true }],
  ['closed', { state: 'sourceClosed' }], ['frozen', { state: 'frozen' }]];
const sheet = document.getElementById('sheet');
for (const [k, r] of S) for (const owner of ['dimensor', 'processor', 'kompositor']) {
  const el = linkBadge({ ownerApp: owner, policy: 'onRequest', ...r }, { onUpdate: (x) => window.log.push(['update', x.ownerApp]), onMenu: (_, items) => window.log.push(['menu', items.length]) });
  el.dataset.case = k + ':' + owner; sheet.appendChild(el);
}
const row = document.getElementById('row'); row.addEventListener('click', () => window.log.push(['row']));
row.appendChild(linkBadge({ ownerApp: 'dimensor', state: 'linked' }, { onMenu: () => window.log.push(['menu']) }));
row.appendChild(linkBadge({ ownerApp: 'dimensor', state: 'updateAvailable' }, { onUpdate: () => window.log.push(['update']) }));
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
  const p = await b.newPage({ deviceScaleFactor: 2 }); await p.goto(`http://localhost:${srv.address().port}/`); await p.waitForFunction(() => window.ready);
  if (SHEET) await p.locator('#sheet').screenshot({ path: SHEET });
  const info = await p.evaluate(() => [...document.querySelectorAll('#sheet .vk-lnk')].map((el) => {
    const cs = getComputedStyle(el), ic = getComputedStyle(el.querySelector('svg'));
    return { c: el.dataset.case, tag: el.tagName, word: el.querySelector('span').textContent, svg: !!el.querySelector('svg path'), icon: ic.color, bg: cs.backgroundColor, ink: cs.color, outline: cs.borderTopWidth, h: el.getBoundingClientRect().height, label: el.getAttribute('aria-label'), tip: el.dataset.tip };
  }));
  const by = Object.fromEntries(info.map((x) => [x.c, x]));
  ok(info.length === 15 && info.every((x) => x.svg && x.word.trim() && x.label && x.tip), 'every state is the mark + a word, with a tip and a label');
  ok(info.every((x) => x.outline === '0px'), 'flat: no borders');
  ok(info.every((x) => x.h === 17), 'one height (17px) for every state');
  ok(by['linked:dimensor'].icon === 'rgb(187, 111, 255)' && by['linked:processor'].icon === 'rgb(0, 229, 160)' && by['linked:kompositor'].icon === 'rgb(255, 106, 67)',
    `the chain is the OWNER's colour, not the host app's: ${by['linked:dimensor'].icon} · ${by['linked:processor'].icon} · ${by['linked:kompositor'].icon}`);
  ok(by['update:dimensor'].bg === 'rgb(187, 111, 255)' && by['update:dimensor'].tag === 'BUTTON' && by['update:dimensor'].ink === 'rgb(28, 28, 28)', 'Update available is a solid owner-colour button with dark ink');
  ok(by['stale:dimensor'].icon === 'rgb(249, 194, 0)' && by['stale:dimensor'].word === 'Source not responding', 'Source not responding: the caution yellow + its words');
  ok(by['closed:dimensor'].icon === by['frozen:dimensor'].icon && by['closed:dimensor'].icon === 'rgb(138, 138, 138)', 'Source closed and Frozen are grey');
  ok(by['linked:dimensor'].bg !== by['linked:processor'].bg, 'the light ground is tinted by the owner too');
  const lum = (s) => { const [r, g, bl] = s.match(/[\d.]+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const cr = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((m, k) => k - m); return (x + 0.05) / (y + 0.05); };
  const worst = info.map((x) => [x.c, cr(x.ink, x.bg)]).sort((a, c) => a[1] - c[1])[0];
  ok(worst[1] >= 4.5, `every word passes 4.5:1 on its ground (lowest: ${worst[0]} ${worst[1].toFixed(2)})`);
  // clicks
  await p.click('#row .vk-lnk[data-state="update"]'); await p.click('#row .vk-lnk[data-state="linked"]');
  const log = await p.evaluate(() => window.log);
  ok(JSON.stringify(log) === JSON.stringify([['update'], ['menu']]), 'Update available calls onUpdate, Linked opens the menu, and neither reaches the row: ' + JSON.stringify(log));
  ok(await p.evaluate(() => { const el = document.querySelector('#row .vk-lnk[data-state="linked"]'); return el.getAttribute('aria-haspopup') === 'menu'; }), 'the menu badge says it has a menu');
  // state precedence
  const st = await p.evaluate(() => [
    badgeOf({ state: 'updateAvailable', notResponding: true }).state, badgeOf({ state: 'updateAvailable', policy: 'manual' }).state,
    badgeOf({ state: 'frozen', notResponding: true }).state, badgeOf({ state: 'sourceClosed', notResponding: true }).state, badgeOf({}).state]);
  ok(JSON.stringify(st) === '["stale","linked","frozen","closed","linked"]', 'precedence: frozen > closed > not responding > update; manual hides update: ' + st);
  ok(await p.evaluate(() => !window.linkBadgeHtml({ ownerApp: 'dimensor', state: 'linked' }).startsWith('<button')), 'without onMenu, a plain badge is not a button');
  // menu
  const m = await p.evaluate(() => [linkBadgeMenu({ ownerApp: 'dimensor', state: 'updateAvailable', policy: 'live' }), linkBadgeMenu({ ownerApp: 'dimensor', state: 'frozen' })]);
  ok(m[0].map((x) => x.id).join() === 'source,update,policy,freeze', 'menu: Go to source · Update now · Update policy · Freeze');
  ok(!m[0][1].disabled && m[1][1].disabled, 'Update now only when an update is waiting and not frozen');
  ok(m[0][2].items.find((x) => x.checked).id === 'policy:live' && m[1][2].items.every((x) => x.disabled), 'the policy shows its current choice and is locked while frozen');
  ok(m[1][3].label === 'Unfreeze' && m[1][3].checked, 'Freeze toggles to Unfreeze');
  console.log(`link-badge: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
