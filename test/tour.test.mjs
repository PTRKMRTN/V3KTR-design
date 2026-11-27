// node test/tour.test.mjs: the Welcome tour (v0.41.175): app/tour.css + interactions/tour.js. Real clicks and keys in Edge. Negative controls: the box takes its colour from --tour-hi (a page without the token fails),
// and Back / Next must not wear the app colour.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const tokens = readFileSync(ROOT + 'tokens.css', 'utf8'), themes = readFileSync(ROOT + 'themes/themes.css', 'utf8'), app = readFileSync(ROOT + 'dist/app.css', 'utf8');
const tourJs = readFileSync(ROOT + 'interactions/tour.js', 'utf8').replace('export function mountTour', 'window.mountTour = function mountTour');
const ZONES = [
  { name: 'Viewport', line: 'Your edit, playing.', rect: [22, 97, 1076, 517] }, { name: 'Workspaces', line: 'Edit or Kompose.', rect: [1116, 8, 148, 34] },
  { name: 'Panels', line: 'Pick what the panel shows.', rect: [1118, 54, 64, 340] }, { name: 'Media pool', line: 'Drop media here.', rect: [1180, 45, 440, 576] },
  { name: 'Inspector', line: 'Settings for the selection.', rect: [1620, 45, 300, 576] }, { name: 'Timeline', line: 'Your edit in order.', rect: [4, 624, 1912, 412] }];
const svg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#303034"/></svg>');
const page = (css, zones = ZONES, js = tourJs) => `<!doctype html><meta charset=utf-8><style>${css}</style><body data-app="kompositor" style="margin:0;background:var(--bg-1)"><div id="appc"><button id="appbtn" class="vk-btn" style="margin:20px">Timeline</button></div>
<div class="vk-scrim is-on" id="scrim"><div class="vk-modal vk-welcome" role="dialog" aria-modal="true" aria-labelledby="wt"><div class="vk-modal__body vk-scrollbar"><div class="vk-welcome__deck">
<div class="vk-welcome__head"><div class="vk-welcome__top"><div class="vk-welcome__logo" id="wt" aria-label="Welcome to KOMPOSITOR"><svg viewBox="0 0 100 22"><rect width="100" height="22" fill="currentColor"/></svg></div><button class="vk-btn vk-btn--primary" data-tour="start">Get started</button></div><p class="vk-welcome__line">A quick look at the parts of KOMPOSITOR.</p></div>
<div class="vk-tour"><div class="vk-tour__stage" role="img" aria-label="A screenshot of KOMPOSITOR."><img src="data:image/svg+xml,${svg}" alt=""><div class="vk-tour__box"></div></div>
<div class="vk-tour__bar"><div class="vk-tour__cap" aria-live="polite" aria-atomic="true"><div class="vk-tour__head"><span class="vk-tour__n"></span><b class="vk-tour__name"></b></div><p class="vk-tour__txt"></p></div>
<div class="vk-tour__nav"><button class="vk-btn vk-tour__btn" data-tour="back">Back</button><button class="vk-btn vk-tour__btn" data-tour="next">Next</button></div></div></div></div></div>
<div class="vk-welcome__more"><div class="vk-welcome__links"><a class="vk-menu-item vk-welcome__link" href="#"><span>Guide</span><span class="vk-welcome__link-d">how it works</span></a></div><p class="vk-hint">Open this again from Help › Welcome.</p></div></div></div>
<script>window.__imgs=[];var OI=window.Image;window.Image=function(){var i=new OI();window.__imgs.push(i);return i};</script><script>${js}</script><script>window.__closed=0;window.__raf=0;var r=window.requestAnimationFrame;window.requestAnimationFrame=function(f){window.__raf++;return r(f)};
window.__t=mountTour(document.getElementById('scrim'),{zones:${JSON.stringify(zones)},inert:document.getElementById('appc'),returnFocus:document.getElementById('appbtn'),onClose:function(){window.__closed++}});</script>`;
const full = tokens + themes + app, noTok = full.replace(/--tour-hi:[^;]*;\s*--tour-hi-glow:[^;]*;/g, '');
assert.ok(noTok.length < full.length, 'the negative control really removed the token');
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const open = async (css = full, o = {}) => { const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: o.reduced ? 'reduce' : 'no-preference' }); if (o.route) await o.route(p); await p.setContent(page(css, o.zones, o.js), { waitUntil: o.route ? 'domcontentloaded' : 'load' }); await p.waitForTimeout(300); return p; };
const st = (p) => p.evaluate(() => ({ s: __t.state(), count: document.querySelector('.vk-tour__n').textContent, name: document.querySelector('.vk-tour__name').textContent, focus: document.activeElement.dataset.tour || document.activeElement.id, back: document.querySelector('[data-tour=back]').disabled, next: document.querySelector('[data-tour=next]').disabled }));
// a step may name its own picture (v0.41.196): steps 1-3 share the page's picture, step 4 (the Sequencer) has its own at its own size, step 5 shares it again
const svgOf = (c, w, h) => 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><rect width="' + w + '" height="' + h + '" fill="' + c + '"/></svg>');
const SEQ = svgOf('#a04040', 1920, 1080), SEQ2 = svgOf('#40a040', 1280, 720);
const PZ = [{ name: 'Viewport', line: 'a', rect: [22, 97, 1076, 517] }, { name: 'Timeline', line: 'b', rect: [4, 624, 1912, 412] }, { name: 'Sequencer', line: 'c', rect: [100, 80, 960, 540], shot: SEQ },
  { name: 'Steps', line: 'd', rect: [640, 360, 320, 180], shot: SEQ2, size: [1280, 720] }, { name: 'Inspector', line: 'e', rect: [1620, 45, 300, 576] }];
const pic = (p) => p.evaluate(() => document.querySelector('.vk-tour__stage > img').getAttribute('src'));
const geo = (p) => p.evaluate(() => { const b = document.querySelector('.vk-tour__box').getBoundingClientRect(), s = document.querySelector('.vk-tour__stage').getBoundingClientRect(); return [(b.left - s.left) / s.width, (b.top - s.top) / s.height, b.width / s.width, b.height / s.height]; });
const near = (a, w, h, tol = 0.004) => a.every((v, k) => Math.abs(v - [w[0] / h[0], w[1] / h[1], w[2] / h[0], w[3] / h[1]][k]) <= tol);
async function pictures(js, label) {
  const p = await open(full, { zones: PZ, js }); const base = await pic(p); const bad = [];
  await p.click('[data-tour=next]'); await p.waitForTimeout(350); if (await pic(p) !== base) bad.push('a step without shot keeps the shared picture');
  await p.click('[data-tour=next]'); await p.waitForTimeout(40); const mid = await geo(p); // right after the picture swap
  if (await pic(p) !== SEQ) bad.push('step 3 shows its own picture');
  if (!near(mid, PZ[2].rect, [1920, 1080])) bad.push('on a picture change the box jumps to its rect, it does not glide (' + mid.map((v) => v.toFixed(3)) + ')');
  await p.waitForTimeout(350);
  await p.click('[data-tour=next]'); await p.waitForTimeout(40); const mid2 = await geo(p);
  if (await pic(p) !== SEQ2) bad.push('step 4 shows its own picture');
  if (!near(mid2, PZ[3].rect, [1280, 720])) bad.push('step 4 places the box in its own picture\'s pixels (' + mid2.map((v) => v.toFixed(3)) + ')');
  await p.waitForTimeout(350); await p.click('[data-tour=next]'); await p.waitForTimeout(350);
  if (await pic(p) !== base) bad.push('a later step without shot goes back to the shared picture');
  if (!near(await geo(p), PZ[4].rect, [1920, 1080])) bad.push('and the box is placed in the shared picture\'s pixels again');
  await p.click('[data-tour=back]'); await p.waitForTimeout(350); if (await pic(p) !== SEQ2) bad.push('Back returns to the step\'s own picture');
  const imgs = await p.evaluate(() => window.__imgs.map((i) => i.getAttribute('src')));
  if (imgs.length !== 2 || !imgs.includes(SEQ) || !imgs.includes(SEQ2)) bad.push('both step pictures are preloaded when the tour opens, once each (' + imgs.length + ')');
  await p.close(); return bad;
}
async function inside(js) { // a move inside one picture still glides
  const p = await open(full, { zones: PZ, js }); await p.click('[data-tour=next]'); await p.waitForTimeout(60); const g = await geo(p); await p.close();
  return !near(g, PZ[1].rect, [1920, 1080], 0.01);
}
// a slow picture: the step shows its caption at once, but the old picture keeps its old box until the new picture is ready; then picture and box arrive together
const SLOW = 'http://tour.test/slow.svg', SZ = [{ name: 'Viewport', line: 'a', rect: [22, 97, 1076, 517] }, { name: 'Sequencer', line: 'c', rect: [100, 80, 960, 540], shot: SLOW }];
async function slow(js) {
  const p = await open(full, { zones: SZ, js, route: (pg) => pg.route(SLOW, async (r) => { await new Promise((k) => setTimeout(k, 1500)); await r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#a04040"/></svg>' }); }) });
  const base = await pic(p), bad = []; await p.click('[data-tour=next]'); await p.waitForTimeout(80);
  const early = await p.evaluate(() => ({ name: document.querySelector('.vk-tour__name').textContent })), earlyBox = await geo(p);
  if (early.name !== 'Sequencer') bad.push('the caption changes at once (' + early.name + ')');
  if (await pic(p) !== base) bad.push('the old picture stays while the new one loads');
  if (!near(earlyBox, SZ[0].rect, [1920, 1080])) bad.push('the old picture keeps its old box while the new one loads (' + earlyBox.map((v) => v.toFixed(3)) + ')');
  await p.waitForTimeout(2200);
  if (await pic(p) !== SLOW) bad.push('the picture arrives');
  if (!near(await geo(p), SZ[1].rect, [1920, 1080])) bad.push('on its rect');
  await p.close(); return bad;
}
const expectFail = async (name, mut) => { const bad = await pictures(mut(tourJs), name); if (!bad.length) throw new Error('MUTANT SURVIVED: ' + name); n++; };
const sub = (a, c) => (j) => { if (!j.includes(a)) throw new Error('mutation changed nothing: ' + a.slice(0, 60)); return j.replace(a, () => c); };
try {
  { const bad = await pictures(tourJs); ok(!bad.length, 'step pictures: ' + bad.join('; ')); ok(await inside(tourJs), 'a move inside one picture still glides');
    { const bad = await slow(tourJs); ok(!bad.length, 'a slow picture: ' + bad.join('; '));
      const m = await slow(sub('if (step === i0) show(i0);', '')(tourJs)); ok(m.length > 0, 'MUTANT CAUGHT: a slow picture never arrives');
      const m2 = await slow(sub('(im.onload = im.onerror = go)); return; }', '(im.onload = im.onerror = go)); }')(tourJs)); ok(m2.length > 0, 'MUTANT CAUGHT: the box moves before a slow picture is ready');
      { const p = await open(full, { zones: SZ, js: tourJs, route: (pg) => pg.route(SLOW, (r) => r.fulfill({ status: 404, body: 'no' })) }); await p.click('[data-tour=next]'); await p.waitForTimeout(500);
        ok((await st(p)).s.step === 1 && near(await geo(p), SZ[1].rect, [1920, 1080]), 'a picture that fails to load does not strand the step: it moves on'); await p.close(); } }
    await expectFail('the picture is never swapped', sub("stageImg.setAttribute('src', pic);", ''));
    await expectFail('the box glides across a picture change', sub("box.style.transition = 'none';", ''));
    await expectFail('the step pictures are not preloaded', sub('im.src = z.shot;', ''));
    await expectFail('a step\'s own size is ignored', sub('sz = z.size || size', 'sz = size'));
    await expectFail('a step without shot keeps the last step\'s picture', sub('pic = z.shot || baseSrc', 'pic = z.shot || shown')); }
  { const p = await open(); let u = await st(p);
    ok(u.count === '1 / 6' && u.name === 'Viewport' && u.back && !u.next && u.focus === 'next', 'opens on step 1 with focus on Next and Back off');
    for (let i = 1; i < 6; i++) {
      await p.click('[data-tour=next]'); await p.waitForTimeout(350); u = await st(p);
      const box = await p.evaluate(() => { const b = document.querySelector('.vk-tour__box').getBoundingClientRect(), s = document.querySelector('.vk-tour__stage').getBoundingClientRect(); return [Math.round((b.left - s.left) / s.width * 1920), Math.round((b.top - s.top) / s.height * 1080), Math.round(b.width / s.width * 1920), Math.round(b.height / s.height * 1080)]; });
      ok(box.every((v, k) => Math.abs(v - ZONES[i].rect[k]) <= 2), `step ${i + 1}: the box is on its rect (${box} against ${ZONES[i].rect})`);
      ok(u.count === `${i + 1} / 6` && u.name === ZONES[i].name, `step ${i + 1}: count and name`);
    }
    ok(u.next && !u.back && u.focus === 'start', 'at the last step Next is off and focus moved on to Get started, not lost');
    await p.click('[data-tour=back]'); u = await st(p); ok(u.count === '5 / 6' && !u.next, 'Back steps back and turns Next on again');
    // layout: tops and edges (r12 rules)
    const L = await p.evaluate(() => { const R = (s) => document.querySelector(s).getBoundingClientRect(); return { bk: R('[data-tour=back]').top, nx: R('[data-tour=next]').top, gs: R('[data-tour=start]').top, lg: R('.vk-welcome__logo').top, gsR: R('[data-tour=start]').right, nxR: R('[data-tour=next]').right, stR: R('.vk-tour__stage').right }; });
    ok(Math.abs(L.bk - L.nx) < 0.5, 'Back and Next tops are equal'); ok(Math.abs(L.gs - L.lg) < 0.5, 'Get started top is on the logo top');
    ok(Math.abs(L.gsR - L.stR) < 1.5 && Math.abs(L.nxR - L.stR) < 1.5, 'Get started and Next end on the picture\'s right edge');
    await p.close(); }
  { const p = await open(); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); ok((await st(p)).s.step === 2, 'ArrowRight steps'); await p.keyboard.press('ArrowLeft'); ok((await st(p)).s.step === 1, 'ArrowLeft steps back');
    const seq = []; for (let k = 0; k < 10; k++) { await p.keyboard.press('Tab'); seq.push(await p.evaluate(() => !!document.activeElement.closest('.vk-modal'))); } ok(seq.every(Boolean), 'Tab stays inside the dialog');
    await p.close(); }
  for (const how of ['esc', 'outside', 'start']) {
    const p = await open(); ok(await p.evaluate(() => document.getElementById('appc').inert === true), 'the app is inert while the tour is open');
    if (how === 'esc') await p.keyboard.press('Escape'); else if (how === 'outside') await p.mouse.click(8, 8); else await p.click('[data-tour=start]');
    const r = await p.evaluate(() => ({ on: document.getElementById('scrim').classList.contains('is-on'), inert: document.getElementById('appc').inert, focus: document.activeElement.id, closed: window.__closed }));
    ok(!r.on && !r.inert && r.focus === 'appbtn' && r.closed === 1, `${how}: closes once, the app is live again and focus returns`); await p.close(); }
  { const p = await open(); await p.click('.vk-modal .vk-tour__txt'); ok(await p.evaluate(() => document.getElementById('scrim').classList.contains('is-on')), 'a click inside the dialog does not close it'); await p.close(); }
  { const p = await open(); const c = await p.evaluate(() => { const cs = (e, k) => getComputedStyle(e)[k], q = (s) => document.querySelector(s); const d = document.createElement('div'); d.style.cssText = 'color:var(--tour-hi);background:var(--accent)'; document.body.append(d); const hi = cs(d, 'color'), acc = cs(d, 'backgroundColor'); d.remove();
      return { hi, acc, box: cs(q('.vk-tour__box'), 'borderTopColor'), name: cs(q('.vk-tour__name'), 'color'), back: cs(q('[data-tour=back]'), 'backgroundColor'), start: cs(q('[data-tour=start]'), 'backgroundColor'), ink: cs(q('[data-tour=back]'), 'color'), ring: cs(q('[data-tour=next]'), 'outlineColor'), ringW: cs(q('[data-tour=next]'), 'outlineWidth') }; });
    ok(c.hi === 'rgb(255, 240, 77)', 'the token is lemon'); ok(c.box === c.hi && c.name === c.hi && c.back === c.hi, 'box, part name and Back all read --tour-hi');
    ok(c.start === c.acc && c.start !== c.hi, 'Get started keeps the app colour'); ok(c.ink === 'rgb(28, 28, 28)', 'Back / Next ink is --on-accent');
    ok(c.ring === 'rgb(244, 244, 244)' && c.ringW === '2px', `the focused Next rings in white, 2px (${c.ring})`);
    await p.close(); }
  { const p = await open(noTok); const c = await p.evaluate(() => getComputedStyle(document.querySelector('.vk-tour__box')).borderTopColor); ok(c !== 'rgb(255, 240, 77)', `NEGATIVE CONTROL: without --tour-hi the box is not lemon (${c})`); await p.close(); }
  { const p = await open(full, { reduced: true }); ok(await p.evaluate(() => getComputedStyle(document.querySelector('.vk-tour__box')).transitionDuration) === '0s', 'reduced motion: the box does not glide'); await p.close();
    const q = await open(); ok((await q.evaluate(() => getComputedStyle(document.querySelector('.vk-tour__box')).transitionDuration)).startsWith('0.28s'), 'otherwise it glides 0.28s'); await q.waitForTimeout(1000); ok(await q.evaluate(() => window.__raf) === 0, 'nothing runs by itself: no animation frames'); await q.close(); }
  console.log(`tour: ${n} checks passed`);
} finally { await b.close(); }
