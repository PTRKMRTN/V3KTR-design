// node test/interactions.test.mjs: interactions/menu.js and interactions/toast.js in a real browser (Edge).
// Menu: roles, roving tabindex, ← → Home End along the bar, ↓/Enter/Space/↑ open, ↑ ↓ wrap inside, Enter runs a row
// (and focus goes back to the title first), a disabled row doesn't run, ← → inside open the neighbour, Esc closes and
// returns to the title, aria-expanded follows, a handled key never reaches the app.
// Toast: template text, role status / alert, one at a time, auto-close, held while hovered, Esc closes.
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
const menu = (name, rows) => `<div class="vk-menu" id="m-${name}">${name}<div class="vk-menu-pop">${rows}</div></div>`;
const PAGE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/dist/app.css">
<body data-app="processor" style="background:#212121">
<div class="vk-topbar"><div class="vk-menubar" id="bar" style="display:contents">
${menu('File', '<div class="vk-menu-item" id="f-new">New</div><div class="vk-menu-sep"></div><div class="vk-menu-item is-disabled" id="f-dis">Render</div><div class="vk-menu-item" id="f-save">Save</div>')}
${menu('Edit', '<div class="vk-menu-item" id="e-undo">Undo</div><div class="vk-menu-item" id="e-redo">Redo</div>')}
${menu('View', '<div class="vk-menu-item" id="v-help"><span class="vk-menu-check" data-helper>✓</span><span>Helper Text</span></div>')}
</div></div>
<script type="module">
import { installMenubar } from '/interactions/menu.js';
import { toast } from '/interactions/toast.js';
window.ran = []; window.appKeys = 0; window.toast = toast;
document.querySelectorAll('.vk-menu').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m) { const o = m.classList.contains('is-open'); document.querySelectorAll('.vk-menu').forEach((x) => x.classList.remove('is-open')); if (!o) m.classList.add('is-open'); } }));
document.querySelectorAll('.vk-menu-item').forEach((r) => r.addEventListener('click', () => { window.ran.push(r.id); document.querySelectorAll('.vk-menu').forEach((x) => x.classList.remove('is-open')); }));   // like the apps: running a row closes the menu
document.addEventListener('keydown', () => window.appKeys++);
installMenubar(document.getElementById('bar'));
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
  const p = await b.newPage(); await p.goto(`http://localhost:${srv.address().port}/`); await p.waitForFunction(() => window.ready);
  const focus = () => p.evaluate(() => document.activeElement?.id || document.activeElement?.className);
  const attr = (id, a) => p.evaluate(([id, a]) => document.getElementById(id).getAttribute(a), [id, a]);
  ok(await attr('bar', 'role') === 'menubar' && await attr('m-File', 'role') === 'menuitem' && await attr('f-new', 'role') === 'menuitem', 'roles');
  ok(await attr('v-help', 'role') === 'menuitemcheckbox', 'a row with a data-* check is a menuitemcheckbox');
  ok(await attr('m-File', 'tabindex') === '0' && await attr('m-Edit', 'tabindex') === '-1', 'roving tabindex: one title in the tab order');
  await p.keyboard.press('Tab'); ok(await focus() === 'm-File', 'Tab reaches File');
  await p.keyboard.press('ArrowRight'); ok(await focus() === 'm-Edit' && await attr('m-Edit', 'tabindex') === '0', '→ moves along the bar');
  await p.keyboard.press('End'); ok(await focus() === 'm-View', 'End');
  await p.keyboard.press('Home'); ok(await focus() === 'm-File', 'Home');
  const before = await p.evaluate(() => window.appKeys);
  await p.keyboard.press('ArrowDown'); ok(await focus() === 'f-new' && await attr('m-File', 'aria-expanded') === 'true', '↓ opens on the first row, aria-expanded');
  ok(await p.evaluate(() => window.appKeys) === before, 'a handled key never reaches the app');
  await p.keyboard.press('ArrowUp'); ok(await focus() === 'f-save', '↑ wraps to the last row');
  await p.keyboard.press('ArrowDown'); ok(await focus() === 'f-new', '↓ wraps to the first row');
  await p.keyboard.press('ArrowRight'); ok(await focus() === 'e-undo' && await attr('m-File', 'aria-expanded') === 'false', '→ inside opens the neighbour, closes this one');
  await p.keyboard.press('Escape'); ok(await focus() === 'm-Edit' && await attr('m-Edit', 'aria-expanded') === 'false', 'Esc closes and returns to the title');
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowUp'); ok(await focus() === 'f-save', '↑ on a title opens on the last row');
  await p.keyboard.press('ArrowUp'); ok(await focus() === 'f-dis', 'disabled rows are still reachable');
  await p.keyboard.press('Enter'); ok(!(await p.evaluate(() => window.ran.includes('f-dis'))), 'a disabled row does not run');
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => window.ran.includes('f-save')) && await focus() === 'm-File', 'Enter runs the row; focus is back on the title');
  // toast
  await p.evaluate(() => window.toast({ what: "Couldn't read that file.", todo: 'Try a PNG, JPG or WebP.' }, { kind: 'error', ms: 400 }));
  const t = () => p.evaluate(() => [...document.querySelectorAll('.vk-toast')].map((x) => [x.getAttribute('role'), x.textContent]));
  let ts = await t(); ok(ts.length === 1 && ts[0][0] === 'alert' && ts[0][1] === "Couldn't read that file. Try a PNG, JPG or WebP.", 'error toast: template text, role alert');
  await p.evaluate(() => window.toast('Saved', { ms: 300 })); ts = await t(); ok(ts.length === 1 && ts[0][0] === 'status' && ts[0][1] === 'Saved', 'one at a time; news is role status');
  await p.waitForTimeout(450); ok((await t()).length === 0, 'closes on its own');
  await p.evaluate(() => window.toast('Held', { ms: 250 })); await p.hover('.vk-toast'); await p.waitForTimeout(400); ok((await t()).length === 1, 'held while hovered');
  await p.mouse.move(2, 2); await p.waitForTimeout(350); ok((await t()).length === 0, 'closes after the pointer leaves');
  await p.evaluate(() => window.toast('Esc me', { ms: 5000 })); await p.keyboard.press('Escape'); ok((await t()).length === 0, 'Esc closes');
  console.log(`interactions: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
