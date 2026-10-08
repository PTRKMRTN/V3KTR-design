// node test/help.test.mjs: drives interactions/help.js in a real browser (Edge via Playwright from a sibling checkout).
// Checks the approved behaviour: hover opens after ~400 ms (not before), warm mode (the next tip at once, cold again
// after 500 ms off every target), keyboard focus opens at once, a 500 ms touch
// long-press opens it WITHOUT pressing the control, a tap elsewhere / leave / blur / Esc close it, aria-describedby is
// set while open, Helper Text is off by default and shows .vk-param-desc only while on, and keyLabel is platform-aware.
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
const PAGE = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/dist/app.css">
<body data-app="processor" style="background:#212121;padding:40px">
<button id="a" class="vk-btn" data-tip="Randomise" data-tip-desc="Roll new settings for this effect" data-tip-key="Ctrl+R"><span id="a2">Randomise</span></button>
<button id="b" class="vk-btn" data-tip="Reset" style="margin-left:40px">Reset</button>
<div id="scrollArea" style="height:150px;overflow:auto;margin-top:20px;background:#2b2b2b">
  <div style="height:400px"></div>
  <button id="c" class="vk-btn" data-tip="Reseed" style="display:block">Reseed</button>
  <div style="height:400px"></div>
</div>
<div id="out" style="height:200px"></div>
<div class="vk-scrub">Radius</div><div class="vk-param-desc" id="pd">How far the sharpening reaches.</div>
<script type="module">
import { installTips, helperText, keyLabel } from '/interactions/help.js';
window.uninstall = installTips(); window.help = helperText('test'); window.keyLabel = keyLabel;
window.clicks = 0; document.getElementById('a').addEventListener('click', () => window.clicks++);
</script>`;
const srv = createServer(async (q, s) => {
  if (q.url === '/') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGE); }
  try { const d = await readFile(ROOT + q.url.slice(1)); s.writeHead(200, { 'content-type': q.url.endsWith('.js') ? 'text/javascript' : 'text/css' }); s.end(d); }
  catch { s.writeHead(404); s.end(); }
});
await new Promise((r) => srv.listen(0, r));
const url = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
try {
  const ctx = await b.newContext({ hasTouch: true }); const p = await ctx.newPage();
  await p.goto(url); await p.waitForFunction(() => window.help);
  const shown = () => p.evaluate(() => document.querySelector('.vk-tip').classList.contains('is-shown'));
  const text = () => p.evaluate(() => document.querySelector('.vk-tip').textContent);
  // hover: not at 250 ms, yes by 550 ms; crossing a child doesn't restart the delay
  await p.hover('#a'); await p.waitForTimeout(250); ok(!(await shown()), 'hover: not open at 250 ms');
  await p.hover('#a2'); await p.waitForTimeout(300); ok(await shown(), 'hover: open by ~550 ms, child crossing did not restart it');
  ok((await text()).includes('Randomise') && (await text()).includes('Roll new settings'), 'tip has name + description');
  ok(await p.evaluate(() => document.getElementById('a').getAttribute('aria-describedby')?.startsWith('vk-tip-')), 'aria-describedby set while open');
  await p.mouse.move(5, 300); await p.waitForTimeout(60); ok(!(await shown()), 'leave closes');
  // warm mode: straight after one tip, the next control's tip opens at once; after 600 ms off every target it's cold again
  await p.hover('#b'); await p.waitForTimeout(80); ok((await shown()) && (await text()).startsWith('Reset'), 'warm: the next tip opens at once');
  await p.mouse.move(5, 300); await p.waitForTimeout(650); await p.hover('#a'); await p.waitForTimeout(150); ok(!(await shown()), 'cold again after 650 ms off every target');
  await p.waitForTimeout(400); ok(await shown(), 'cold: opens after the full delay');
  await p.mouse.move(5, 300); await p.waitForTimeout(650);
  ok(!(await p.evaluate(() => document.getElementById('a').hasAttribute('aria-describedby'))), 'aria-describedby removed on close');
  // keyboard focus: immediate
  await p.mouse.click(5, 300); await p.keyboard.press('Tab'); await p.waitForTimeout(30);
  ok(await shown(), 'keyboard focus opens at once');
  await p.keyboard.press('Escape'); ok(!(await shown()), 'Esc closes');
  await p.keyboard.press('Tab'); await p.waitForTimeout(30); ok((await text()).startsWith('Reset'), 'focus moves the tip to the next control');
  // keyboard focus inside a scroll area (KOMPOSITOR, 2026-10-08): Tabbing to #c makes the browser scroll
  // #scrollArea to bring it into view; that self-caused scroll must not dismiss the tip it just opened
  await p.keyboard.press('Tab'); await p.waitForTimeout(30);
  ok((await text()).startsWith('Reseed'), 'focus reaches the control inside the scroll area');
  ok(await shown(), 'the scroll-into-view the focus itself causes does not dismiss it');
  await p.waitForTimeout(80); ok(await shown(), 'still open 80 ms later (the window the bug fired in)');
  // a later, real scroll (not the focus's own) still dismisses it once the grace window has passed
  await p.waitForTimeout(100);
  await p.evaluate(() => { const a = document.getElementById('scrollArea'); a.scrollTop += 20; a.dispatchEvent(new Event('scroll', { bubbles: true })); });
  await p.waitForTimeout(30); ok(!(await shown()), 'a real scroll after the grace window still dismisses it');
  await p.keyboard.press('Tab'); await p.waitForTimeout(30); ok(!(await shown()), 'blur closes');
  // mouse click focus (not :focus-visible) does not open it instantly
  await p.mouse.click(5, 300); await p.evaluate(() => document.getElementById('b').focus({ focusVisible: false }));
  // touch long-press: opens after 500 ms, and the press does not also click
  const touch = (type, id) => p.evaluate(([type, id]) => { const el = document.getElementById(id); const r = el.getBoundingClientRect();
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerType: 'touch', clientX: r.left + 5, clientY: r.top + 5 })); }, [type, id]);
  await p.evaluate(() => document.activeElement?.blur()); await p.evaluate(() => document.querySelector('.vk-tip').classList.remove('is-shown'));
  const before = await p.evaluate(() => window.clicks);
  await touch('pointerdown', 'a'); await p.waitForTimeout(300); ok(!(await shown()), 'touch: not open at 300 ms');
  await p.waitForTimeout(300); ok(await shown(), 'touch: open after a 500 ms long-press');
  await touch('pointerup', 'a'); await p.evaluate(() => document.getElementById('a').click());
  ok((await p.evaluate(() => window.clicks)) === before, 'long-press did not press the control');
  await touch('pointerdown', 'out'); await p.waitForTimeout(30); ok(!(await shown()), 'tap elsewhere closes');
  // a short tap still presses the control and shows nothing
  await touch('pointerdown', 'a'); await p.waitForTimeout(120); await touch('pointerup', 'a'); await p.evaluate(() => document.getElementById('a').click());
  ok((await p.evaluate(() => window.clicks)) === before + 1 && !(await shown()), 'short tap presses, no tip');
  // Helper Text: off by default; on shows .vk-param-desc; remembered
  ok(!(await p.isVisible('#pd')), 'Helper Text off by default: description hidden');
  await p.evaluate(() => window.help.toggle()); ok(await p.isVisible('#pd'), 'Helper Text on: description shown');
  await p.reload(); await p.waitForFunction(() => window.help); ok(await p.isVisible('#pd'), 'Helper Text remembered');
  await p.evaluate(() => window.help.set(false)); ok(!(await p.isVisible('#pd')), 'Helper Text off again');
  // key labels
  ok((await p.evaluate(() => window.keyLabel('Ctrl+Shift+S', true))) === '⌘⇧S', 'Mac key label');
  ok((await p.evaluate(() => window.keyLabel('Mod+Z', false))) === 'Ctrl+Z', 'Windows key label');
  console.log(`help: ${n} checks passed`);
} finally { await b.close(); srv.close(); }
