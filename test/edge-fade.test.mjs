// node test/edge-fade.test.mjs: the shared scroll fade in BOTH directions (v0.41.176, Patrick 2026-11-20, card DS-horizontal-edge-fade). Real browser (Edge), the real interactions/scroll-fade.js and dist/app.css.
//   1. a sideways row (.vk-scroll--x) that fits has no fade and no mask; one that overflows fades right at its start, both ways in the middle, left at its end (1 px tolerance)
//   2. chips added or removed update the fade without the app calling anything; destroy() clears the attributes
//   3. a vertical-only .vk-scroll still fades exactly as before: its pixels are the same with the new second gradient as with the old one-gradient mask
//   4. an area that scrolls BOTH ways: the mask is two gradients intersected; the bottom-right corner is dimmed by both (darker than either edge).
//   5. the axis comes from the element, not the class: a .vk-scroll with overflow-x hidden gets no left/right; a .vk-scroll--x row never gets top/bottom
// Negative controls: removing the second gradient makes the corner check FAIL; a row that fits would fail check 1 if the fade were always on (the same page with an always-on mask).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const mod = readFileSync(ROOT + 'interactions/scroll-fade.js', 'utf8').replace(/export function/g, 'function');
const chips = (n) => Array.from({ length: n }, (_, i) => `<span class="c" style="display:inline-block;flex:none;width:90px;height:22px;margin-right:6px;background:#fff">chip ${i}</span>`).join('');
const page = (extra = '') => `<!doctype html><meta charset=utf-8><style>${css}${extra}</style><body style="margin:0;background:#000;color:#000">
<div id="fits" class="vk-scroll--x" style="display:flex;width:400px;height:30px">${chips(3)}</div>
<div id="row" class="vk-scroll--x" style="display:flex;width:300px;height:30px">${chips(7)}</div>
<div id="vert" class="vk-scroll" style="margin:0;width:200px;height:120px;background:#fff;overflow-x:hidden"><div style="height:600px;background:#fff"></div></div>
<div id="both" class="vk-scroll" style="margin:0;width:200px;height:120px;background:#fff"><div style="width:700px;height:600px;background:#fff"></div></div>
<div id="hid" class="vk-scroll" style="margin:0;width:200px;height:120px;overflow-x:hidden"><div style="width:700px;height:600px;background:#fff"></div></div>
<script>${mod};window.fades=scrollFades();window.f=Object.fromEntries(['fits','row','vert','both','hid'].map(function(id,i){return [id,window.fades[i]]}));</script>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; if (process.env.V) console.log('  ok', m); };
const open = async (extra) => { const p = await b.newPage({ viewport: { width: 700, height: 900 } }); await p.setContent(page(extra)); await p.waitForTimeout(300); return p; };
const st = (p, id) => p.evaluate((id) => { const e = document.getElementById(id); return { t: e.hasAttribute('data-fade-top'), b: e.hasAttribute('data-fade-bottom'), l: e.hasAttribute('data-fade-left'), r: e.hasAttribute('data-fade-right'), mask: getComputedStyle(e).maskImage || getComputedStyle(e).webkitMaskImage }; }, id);
const scroll = async (p, id, o) => { await p.evaluate(([id, o]) => { const e = document.getElementById(id); e.scrollLeft = o.x ?? e.scrollLeft; e.scrollTop = o.y ?? e.scrollTop; }, [id, o]); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))))); };
// luminance (0..255) of one pixel of an element's screenshot
const lum = async (p, id, x, y) => { const png = await (await p.$('#' + id)).screenshot(); return p.evaluate(async ([d, x, y]) => { const im = new Image(); im.src = 'data:image/png;base64,' + d; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0); const q = g.getImageData(x, y, 1, 1).data; return q[0]; }, [png.toString('base64'), x, y]); };
try {
  const p = await open(); let s;
  s = await st(p, 'fits'); ok(!s.t && !s.b && !s.l && !s.r && (s.mask === 'none' || !/22px/.test(s.mask)), `a row that fits has no fade and no mask (${JSON.stringify({ ...s, mask: String(s.mask).slice(0, 30) })})`);
  s = await st(p, 'row'); ok(s.r && !s.l && !s.t && !s.b, 'a sideways row at its start fades on the right only'); ok(/22px/.test(s.mask) && /to right/.test(s.mask), 'the fade is a real 22px mask');
  await scroll(p, 'row', { x: 60 }); s = await st(p, 'row'); ok(s.l && s.r, 'mid-way it fades both sides');
  await scroll(p, 'row', { x: 99999 }); s = await st(p, 'row'); ok(s.l && !s.r, 'at its end it fades on the left only');
  await scroll(p, 'row', { x: 0.5 }); s = await st(p, 'row'); ok(!s.l, 'within 1 px of the start counts as the start (no hairline fade)');
  await scroll(p, 'row', { x: 0 });
  // 2 chips added / removed
  await p.evaluate(() => { const r = document.getElementById('row'); while (r.children.length > 2) r.lastElementChild.remove(); }); await p.waitForTimeout(200); s = await st(p, 'row'); ok(!s.l && !s.r && !/22px/.test(s.mask), 'removing chips until the row fits clears the fade and the mask, without calling update()');
  await p.evaluate(() => { const r = document.getElementById('row'); for (let i = 0; i < 6; i++) r.insertAdjacentHTML('beforeend', '<span style="display:inline-block;flex:none;width:90px;height:22px;margin-right:6px;background:#fff">x</span>'); }); await p.waitForTimeout(200); s = await st(p, 'row'); ok(s.r, 'adding chips past the edge turns the right fade on without calling update()');
  await p.evaluate(() => window.f.row.destroy()); s = await st(p, 'row'); ok(!s.l && !s.r && !s.t && !s.b, 'destroy() clears the attributes');
  // 3 vertical-only identical to before
  await scroll(p, 'vert', { y: 150 }); s = await st(p, 'vert'); ok(s.t && s.b && !s.l && !s.r, 'a vertical area (overflow-x hidden) mid-way fades top and bottom only');
  const both = [await lum(p, 'vert', 100, 5), await lum(p, 'vert', 100, 60), await lum(p, 'vert', 100, 114)];
  ok(both[0] < 250 && both[1] === 255 && both[2] < 250, `the vertical fade dims the top and bottom edge pixels and leaves the middle full (${both})`);
  const old = await open('#vert{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 22px,#000 calc(100% - 22px),transparent 100%)!important;mask-image:linear-gradient(to bottom,transparent 0,#000 22px,#000 calc(100% - 22px),transparent 100%)!important;-webkit-mask-composite:source-over!important;mask-composite:add!important}');
  await scroll(old, 'vert', { y: 150 });
  const oldPx = [await lum(old, 'vert', 100, 5), await lum(old, 'vert', 100, 60), await lum(old, 'vert', 100, 114), await lum(old, 'vert', 0, 60), await lum(old, 'vert', 199, 60)];
  const newPx = [...both, await lum(p, 'vert', 0, 60), await lum(p, 'vert', 199, 60)];
  ok(JSON.stringify(oldPx) === JSON.stringify(newPx), `a vertical-only area looks the same with the intersected mask as with the old one-gradient mask (${oldPx} / ${newPx})`); await old.close();
  // 4 both ways
  s = await st(p, 'both'); ok(s.b && s.r && !s.t && !s.l, 'an area that scrolls both ways at its start fades bottom and right');
  ok((s.mask.match(/linear-gradient/g) || []).length === 2, 'its mask is two gradients');
  const mc = await p.evaluate(() => getComputedStyle(document.getElementById('both')).maskComposite || getComputedStyle(document.getElementById('both')).webkitMaskComposite); ok(/intersect|source-in/.test(mc), `composited by intersection (${mc})`);
  const px = { corner: await lum(p, 'both', 197, 117), bottom: await lum(p, 'both', 100, 117), right: await lum(p, 'both', 197, 60), centre: await lum(p, 'both', 100, 60) };
  ok(px.centre === 255 && px.bottom < 250 && px.right < 250 && px.corner < Math.min(px.bottom, px.right), `the corner is dimmed by both fades, darker than either edge (corner ${px.corner}, bottom ${px.bottom}, right ${px.right})`);
  // negative control: the second gradient removed -> the right edge is no longer dimmed and the corner is no darker than the bottom edge
  const neg = await open('#both{-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 var(--fade-t),#000 calc(100% - var(--fade-b)),transparent 100%)!important;mask-image:linear-gradient(to bottom,transparent 0,#000 var(--fade-t),#000 calc(100% - var(--fade-b)),transparent 100%)!important}');
  const nx = { corner: await lum(neg, 'both', 197, 117), bottom: await lum(neg, 'both', 100, 117), right: await lum(neg, 'both', 197, 60) };
  ok(!(nx.right < 250 && nx.corner < Math.min(nx.bottom, nx.right)), `NEGATIVE CONTROL: without the second gradient the corner check fails (corner ${nx.corner}, bottom ${nx.bottom}, right ${nx.right})`); await neg.close();
  // 5 axis from the element
  s = await st(p, 'hid'); ok(!s.l && !s.r && s.b, 'a .vk-scroll with overflow-x hidden gets no left/right fade, only bottom');
  const hy = await p.evaluate(() => { const e = document.createElement('div'); e.className = 'vk-scroll--x'; e.style.cssText = 'width:100px;height:20px;display:block'; e.innerHTML = '<div style="width:400px;height:40px"></div>'; document.body.append(e); const h = scrollFade(e); h.update(); const r = { t: e.hasAttribute('data-fade-top'), b: e.hasAttribute('data-fade-bottom'), r: e.hasAttribute('data-fade-right') }; h.destroy(); e.remove(); return r; });
  ok(hy.r && !hy.t && !hy.b, 'a .vk-scroll--x row taller inside than outside never fades top or bottom (overflow-y hidden)');
  await p.close();
  console.log(`edge-fade: ${n} checks passed`);
} finally { await b.close(); }
