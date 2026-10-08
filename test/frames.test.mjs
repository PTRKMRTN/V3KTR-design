// node test/frames.test.mjs: workspace frames (v0.36.0, Patrick's 2026-10-08 mockup) measured in a real browser (Edge),
// from dist/app.css and the real interactions/scroll-fade.js + split-grip.js, so a rule that drifts fails here.
// The page is the mockup: a top bar, then three columns, the right one split into two stacked frames.
//   1. every scroll area sits --pad (22px) in from every edge of its frame and touches no other scroll area or line
//   2. every separator sits ON its frame's edge, is --stroke wide, is inset --pad along its length, and touches no
//      other separator, frame edge or page edge
//   3. a vertical separator spans exactly the scroll areas beside it; a horizontal one spans its frame's scroll area
//   4. sections inside a scroll area part by space (--sec-gap) with no line, and drop their own padding
//   5. scroll fades: none at rest with nothing to scroll; bottom only at the top of a long list; both mid-way; top only
//      at the end; the mask is really applied (computed mask-image carries the fade); content growth updates it
//   6. grip: centred on the line, --grip square, separator colour with ground-colour ink; drag resizes (clamped);
//      arrows / Home / End; double-click resets; role=separator with aria values
// Each group has a negative control: the same check against a deliberately broken variant must FAIL.
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
const rows = (n) => Array.from({ length: n }, (_, i) => `<div class="vk-scrub" style="height:26px;margin:3px 0;background:#333">row ${i}</div>`).join('');
const sec = (t, n) => `<section class="vk-section"><div class="vk-sec-label">${t}</div>${rows(n)}</section>`;
const PAGE = (extraCss = '') => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="/dist/app.css"><style>${extraCss}</style>
<body data-app="processor" style="margin:0;background:var(--bg-1)">
<div id="app" style="display:grid;grid-template-rows:80px 1fr;grid-template-columns:60px var(--mid,380px) 1fr;width:900px;height:800px">
  <div style="grid-column:1/-1;background:var(--bg-1)"></div>
  <div class="vk-frame" id="f-left"></div>
  <div class="vk-frame" id="f-mid"><div class="vk-fsep vk-fsep--l" id="s-midL"></div><div class="vk-fsep vk-fsep--r" id="s-midR"></div>
    <div class="vk-scroll" id="sc-mid">${sec('One', 4)}${sec('Two', 4)}</div></div>
  <div style="display:grid;grid-template-rows:1fr 1fr;min-height:0">
    <div class="vk-frame" id="f-top"><div class="vk-fsep vk-fsep--b" id="s-topB"></div><div class="vk-scroll" id="sc-top">${sec('Long', 40)}</div></div>
    <div class="vk-frame" id="f-bot"><div class="vk-scroll" id="sc-bot">${sec('Short', 2)}</div></div>
  </div>
</div>
<script type="module">
import { scrollFades } from '/interactions/scroll-fade.js';
import { splitGrip } from '/interactions/split-grip.js';
window.fades = scrollFades();
const app = document.getElementById('app');
window.mid = 380;
window.grip = splitGrip(document.getElementById('s-midR'), { get: () => window.mid, set: (v) => { window.mid = v; app.style.setProperty('--mid', v + 'px'); },
  min: 300, max: 500, dir: 1, reset: () => { window.mid = 380; app.style.setProperty('--mid', '380px'); }, label: 'Resize panel' });
window.ready = true;
</script>`;

const server = createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname.startsWith('/page')) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(PAGE(decodeURIComponent(u.searchParams.get('css') || ''))); }
  try { const b = await readFile(ROOT + u.pathname.slice(1)); res.writeHead(200, { 'content-type': u.pathname.endsWith('.js') ? 'text/javascript' : 'text/css' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const origin = `http://localhost:${server.address().port}`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

const GEOM = () => {
  const r = (id) => document.getElementById(id).getBoundingClientRect();
  const R = (e) => { const x = e.getBoundingClientRect(); return { l: x.left, t: x.top, r: x.right, b: x.bottom, w: x.width, h: x.height }; };
  const g = (id) => R(document.getElementById(id));
  const out = { frames: {}, scrolls: {}, seps: {} };
  for (const id of ['f-mid', 'f-top', 'f-bot']) out.frames[id] = g(id);
  for (const id of ['sc-mid', 'sc-top', 'sc-bot']) out.scrolls[id] = g(id);
  for (const id of ['s-midL', 's-midR', 's-topB']) out.seps[id] = g(id);
  const s = [...document.querySelectorAll('#sc-mid .vk-section')];
  const lastRow = [...s[0].querySelectorAll('.vk-scrub')].pop();
  out.secGap = s[1].querySelector('.vk-sec-label').getBoundingClientRect().top - lastRow.getBoundingClientRect().bottom;
  out.secPadL = s[0].querySelector('.vk-sec-label').getBoundingClientRect().left - r('sc-mid').left;
  out.secLines = s.map((e) => getComputedStyle(e).borderTopWidth + getComputedStyle(e, '::before').content).join(' ');
  out.page = { w: document.getElementById('app').getBoundingClientRect().width, h: document.getElementById('app').getBoundingClientRect().height, top: 80 };
  return out;
};

function checkGeom(m, say) {
  const errs = []; const want = (c, msg) => { if (!c) errs.push(msg); else say && say(msg); };
  const pairs = [['f-mid', 'sc-mid'], ['f-top', 'sc-top'], ['f-bot', 'sc-bot']];
  for (const [f, s] of pairs) {
    const F = m.frames[f], S = m.scrolls[s];
    want(Math.round(S.l - F.l) === 22 && Math.round(F.r - S.r) === 22 && Math.round(S.t - F.t) === 22 && Math.round(F.b - S.b) === 22,
      `${s} sits 22px in from every edge of ${f} (l ${S.l - F.l} r ${F.r - S.r} t ${S.t - F.t} b ${F.b - S.b})`);
  }
  const L = m.seps['s-midL'], Rr = m.seps['s-midR'], B = m.seps['s-topB'], FM = m.frames['f-mid'], FT = m.frames['f-top'];
  want(Math.round(L.w) === 2 && Math.round(L.l) === Math.round(FM.l), `left separator is 2px on the frame's left edge (${L.w}, ${L.l} vs ${FM.l})`);
  want(Math.round(Rr.w) === 2 && Math.round(Rr.r) === Math.round(FM.r), `right separator is 2px on the frame's right edge (${Rr.w}, ${Rr.r} vs ${FM.r})`);
  want(Math.round(B.h) === 2 && Math.round(B.b) === Math.round(FT.b), `horizontal separator is 2px on the frame's bottom edge (${B.h}, ${B.b} vs ${FT.b})`);
  // 3: lengths follow the scroll areas
  const SM = m.scrolls['sc-mid'], ST = m.scrolls['sc-top'];
  want(Math.round(L.t) === Math.round(SM.t) && Math.round(L.b) === Math.round(SM.b) && Math.round(Rr.t) === Math.round(SM.t) && Math.round(Rr.b) === Math.round(SM.b),
    `vertical separators span exactly the scroll area beside them (${L.t}–${L.b} vs ${SM.t}–${SM.b})`);
  want(Math.round(B.l) === Math.round(ST.l) && Math.round(B.r) === Math.round(ST.r), `horizontal separator spans its frame's scroll area (${B.l}–${B.r} vs ${ST.l}–${ST.r})`);
  // 2: touches nothing — the vertical right separator and the horizontal one (its neighbour) keep a gap
  const gapX = B.l - Rr.r, gapY = Math.min(Math.abs(Rr.t - B.b), Math.abs(Rr.b - B.t));
  want(gapX >= 20, `the horizontal separator starts clear of the vertical one (${gapX}px)`);
  want(L.t - m.page.top >= 20 && m.page.h - L.b >= 20, `vertical separators stop short of the top bar and the page foot (${L.t - m.page.top} / ${m.page.h - L.b})`);
  want(B.l > FT.l + 20 && FT.r - B.r >= 20, `horizontal separator stops short of the page edge (${FT.r - B.r})`);
  // content never meets a separator: every scroll area is >= 20px clear of every separator
  for (const [sid, S] of Object.entries(m.scrolls)) for (const [pid, P] of Object.entries(m.seps)) {
    const dx = Math.max(P.l - S.r, S.l - P.r, 0), dy = Math.max(P.t - S.b, S.t - P.b, 0);
    want(Math.max(dx, dy) >= 20, `${sid} keeps ≥20px from ${pid} (${Math.max(dx, dy)})`);
  }
  // 4
  want(m.secGap === 33, `sections in a scroll area part by --sec-gap 33px (${m.secGap})`);
  want(m.secPadL === 0, `sections drop their own side padding inside a scroll area (${m.secPadL})`);
  want(!/[12]px/.test(m.secLines.replace(/0px/g, '')), `no line between sections (${m.secLines})`);
  return errs;
}

try {
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  const open = async (css = '') => { const p = await ctx.newPage(); await p.goto(`${origin}/page?css=${encodeURIComponent(css)}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(100); return p; };
  const p = await open();
  // 1–4
  const m = await p.evaluate(GEOM);
  const errs = checkGeom(m, (msg) => { n++; });
  assert.deepEqual(errs, [], errs.join('\n'));
  console.log(`  ok    geometry: ${n} checks`);
  // control: the old PROCESSOR habit — separator inset 12px on one side only, scroll area flush to the frame
  const pc = await open('.vk-scroll{margin:0 !important}.vk-fsep--b{left:12px !important;right:0 !important}');
  const cerrs = checkGeom(await pc.evaluate(GEOM));
  ok(cerrs.length >= 4, `control: a flush scroll area + a 12px one-sided separator FAILS the geometry (${cerrs.length} failures)`);
  await pc.close();

  // 5 fades
  const fade = (id) => p.evaluate((id) => { const e = document.getElementById(id); return { top: e.hasAttribute('data-fade-top'), bot: e.hasAttribute('data-fade-bottom'), mask: getComputedStyle(e).maskImage || getComputedStyle(e).webkitMaskImage }; }, id);
  let f = await fade('sc-bot');
  ok(!f.top && !f.bot, `a short area has no fade (${JSON.stringify(f)})`);
  f = await fade('sc-top');
  ok(!f.top && f.bot, `a long area at its start fades at the bottom only`);
  ok(/transparent|rgba\(0, 0, 0, 0\)/.test(f.mask) && /22px/.test(f.mask), `the bottom fade is a real 22px mask (${String(f.mask).slice(0, 90)})`);
  await p.evaluate(() => { const e = document.getElementById('sc-top'); e.scrollTop = e.scrollHeight / 3; });
  await p.waitForTimeout(80);
  f = await fade('sc-top');
  ok(f.top && f.bot, 'mid-way it fades at both ends');
  await p.evaluate(() => { const e = document.getElementById('sc-top'); e.scrollTop = e.scrollHeight; });
  await p.waitForTimeout(80);
  f = await fade('sc-top');
  ok(f.top && !f.bot, 'at the end it fades at the top only');
  await p.evaluate(() => { document.querySelector('#sc-bot .vk-section').insertAdjacentHTML('beforeend', '<div style="height:900px"></div>'); });
  await p.waitForTimeout(150);
  f = await fade('sc-bot');
  ok(f.bot, 'content that grows past the area turns its bottom fade on without the app calling update()');
  const restMask = await p.evaluate(() => getComputedStyle(document.getElementById('sc-mid')).maskImage);
  ok(!/22px/.test(restMask), `an area that doesn't scroll carries no fade in its mask (${String(restMask).slice(0, 60)})`);

  // 6 grip
  const gm = await p.evaluate(() => {
    const g = document.querySelector('.vk-fsep__grip'), s = document.getElementById('s-midR');
    const a = g.getBoundingClientRect(), c = s.getBoundingClientRect(), cs = getComputedStyle(g);
    return { cx: a.left + a.width / 2, sx: c.left + c.width / 2, cy: a.top + a.height / 2, sy: c.top + c.height / 2, w: a.width, h: a.height,
      bg: cs.backgroundColor, ink: cs.color, line: getComputedStyle(s).backgroundColor, ground: getComputedStyle(document.body).backgroundColor,
      role: g.getAttribute('role'), now: g.getAttribute('aria-valuenow'), min: g.getAttribute('aria-valuemin'), max: g.getAttribute('aria-valuemax') };
  });
  ok(Math.abs(gm.cx - gm.sx) < 1 && Math.abs(gm.cy - gm.sy) < 1, `the grip is centred on the separator (${gm.cx - gm.sx}, ${gm.cy - gm.sy})`);
  ok(gm.w === 18 && gm.h === 18, `the grip is an 18px square (${gm.w}×${gm.h})`);
  ok(gm.bg === gm.line && gm.ink === gm.ground, `the grip is the separator colour with ground-colour ink (${gm.bg} / ${gm.ink})`);
  ok(gm.role === 'separator' && gm.now === '380' && gm.min === '300' && gm.max === '500', 'role=separator with aria value, min and max');
  await p.mouse.move(gm.cx, gm.cy); await p.mouse.down(); await p.mouse.move(gm.cx + 60, gm.cy, { steps: 4 }); await p.mouse.up();
  let w = await p.evaluate(() => [window.mid, document.getElementById('f-mid').getBoundingClientRect().width]);
  ok(w[0] === 440 && Math.round(w[1]) === 440, `dragging 60px right grows the panel to 440 (${w})`);
  await p.mouse.move(gm.cx + 60, gm.cy); await p.mouse.down(); await p.mouse.move(gm.cx + 400, gm.cy, { steps: 4 }); await p.mouse.up();
  w = await p.evaluate(() => window.mid);
  ok(w === 500, `a drag past max clamps at 500 (${w})`);
  await p.focus('.vk-fsep__grip'); await p.keyboard.press('ArrowLeft');
  ok(await p.evaluate(() => window.mid) === 490, 'ArrowLeft steps 10px');
  await p.keyboard.press('Shift+ArrowLeft');
  ok(await p.evaluate(() => window.mid) === 450, 'Shift+ArrowLeft steps 40px');
  await p.keyboard.press('Home');
  ok(await p.evaluate(() => window.mid) === 300, 'Home jumps to min');
  await p.dblclick('.vk-fsep__grip');
  ok(await p.evaluate(() => [window.mid, document.querySelector('.vk-fsep__grip').getAttribute('aria-valuenow')].join()) === '380,380', 'double-click resets and updates aria-valuenow');
  const after = checkGeom(await p.evaluate(GEOM));
  ok(after.filter((e) => !/sc-top|sc-bot|Long|Short/.test(e)).length === 0, `the frame rules still hold after resizing (${after.join('; ')})`);
  console.log(`frames: ${n} checks passed`);
} finally { await b.close(); server.close(); }
