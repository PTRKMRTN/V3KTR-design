// node test/tags.test.mjs: the removable tag list (v0.41.177): app/tags.css + interactions/tags.js, drawn in the REAL stack row on INCEPTOR's params ground (--bg-1) and column (424px of content). Real clicks and keys in Edge.
// Negative controls: the same page without the scoped hover guard (the Avoid row tints), and a stack row WITHOUT a tag list still tints with the guard in place (the guard is scoped).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { menuIconSvg } = await import('../icons/menu-icons.js');
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const noGuard = css.replace(/\.vk-row\.vk-row--stack:has\(> \.vk-tags\):has\([^{]*\{background:none;\}/, '');
assert.ok(noGuard.length < css.length - 40, 'the negative control really removed the guard');
const mod = readFileSync(ROOT + 'interactions/tags.js', 'utf8').replace('export function mountTags', 'window.mountTags = function mountTags');
const X = menuIconSvg('x', 11);
const tag = (n) => `<span class="vk-tags__tag" role="listitem"><span class="vk-tags__t"${n.length > 16 ? ` data-tip="${n}"` : ''}>${n}</span><button type="button" class="vk-row__ctl vk-tags__x" data-tip="Remove ${n}" aria-label="Remove ${n}">${X}</button></span>`;
const row = (id, names, dis) => `<div class="vk-row vk-row--stack" id="${id}"><span class="vk-row__label">Avoid</span><div class="vk-tags" role="list" aria-label="Avoid">${names.map(tag).join('')}</div><div class="vk-btn-row vk-tags__more"><button type="button" class="vk-btn" data-tags-add ${dis ? 'aria-disabled="true"' : ''}>Add selected</button></div></div>`;
const T3 = ['Title', 'Logo', 'Subtitle'], T8 = ['Title', 'Logo', 'Subtitle', 'Badge', 'Caption two', 'Frame', 'Mask shape', 'iPhone frame'];
const page = (c) => `<!doctype html><meta charset=utf-8><style>${c}</style><body data-app="inceptor" style="margin:0;background:#161616;font:var(--fs-body)/1.35 var(--sans);color:var(--tx-1)">
<div id="p1" style="width:468px;box-sizing:border-box;background:var(--bg-1);padding:6px 22px 14px">${row('a', T3)}</div>
<div id="p2" style="width:468px;box-sizing:border-box;background:var(--bg-1);padding:6px 22px 14px">${row('eight', T8)}</div>
<div id="p3" style="width:468px;box-sizing:border-box;background:var(--bg-1);padding:6px 22px 14px">${row('long', ['Logo', 'Headline with a very long name'])}</div>
<div id="p4" style="width:468px;box-sizing:border-box;background:var(--bg-1);padding:6px 22px 14px">${row('dis', T3, true)}</div>
<div id="p5" style="width:468px;box-sizing:border-box;background:var(--bg-1);padding:6px 22px 14px"><div class="vk-row vk-row--stack" id="other"><span class="vk-row__label">Mode</span><div class="vk-btn-row"><button class="vk-btn">Wrap</button><button class="vk-row__ctl" id="otherctl" style="width:22px;height:22px;border:0;background:transparent;color:var(--tx-2-hi)">${X}</button></div></div></div>
<script>${mod};window.removed=[];window.cancel=false;window.t=mountTags(document.getElementById('a'),{onRemove:function(n){window.removed.push(n);if(window.cancel)return false}});</script>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const open = async (c = css) => { const p = await b.newPage({ viewport: { width: 700, height: 900 } }); await p.setContent(page(c)); await p.waitForTimeout(300); return p; };
try {
  const p = await open();
  const g = await p.evaluate(() => { const r = (e) => e.getBoundingClientRect(), q = (s) => document.querySelector(s), qa = (s) => [...document.querySelectorAll(s)];
    const tg = qa('#a .vk-tags__tag'), lines = (id) => new Set(qa('#' + id + ' .vk-tags__tag').map((e) => Math.round(r(e).top))).size, t = q('#a .vk-tags__t'), lt = qa('#long .vk-tags__t'), cs = getComputedStyle(t);
    return { labelIn: Math.round(r(q('#a .vk-row__label')).left - r(q('#p1')).left), content: Math.round(r(q('#p1')).width - 44), tagH: r(tg[0]).height, xW: r(q('#a .vk-tags__x')).width, xH: r(q('#a .vk-tags__x')).height, gap: Math.round(r(tg[1]).left - r(tg[0]).right),
      eightLines: lines('eight'), eightH: Math.round(r(q('#eight')).height), threeH: Math.round(r(q('#a')).height), font: cs.fontSize, tt: cs.textTransform, short: lt[0].scrollWidth > lt[0].clientWidth, longCut: lt[1].scrollWidth > lt[1].clientWidth, btnH: r(q('#a [data-tags-add]')).height, btnBelow: r(q('#a [data-tags-add]')).top >= r(q('#a .vk-tags')).bottom, dis: getComputedStyle(q('#dis [data-tags-add]')).opacity, ringOff: (() => { const x = q('#a .vk-tags__x'); x.focus(); return getComputedStyle(x).outlineOffset; })() }; });
  ok(g.labelIn === 22 && g.content === 424, `the label sits 22px in from the panel edge on a 424px column (${g.labelIn}, ${g.content})`);
  ok(g.tagH === 22 && g.xW === 22 && g.xH === 22 && g.gap === 6, `tag 22px, x 22×22, tags 6px apart (${g.tagH}, ${g.xW}×${g.xH}, ${g.gap})`);
  ok(g.btnH === 26 && g.btnBelow, 'Add selected is a normal 26px button on its own line under the tags');
  ok(g.eightLines === 2 && g.eightH === 100 && g.threeH === 72, `eight objects wrap to 2 lines (row ${g.eightH}px), three objects 72px (${g.threeH})`);
  ok(g.font === '12px' && g.tt === 'none', `names as typed in 12px (${g.font}, ${g.tt})`);
  ok(!g.short && g.longCut, 'a long name is cut with an ellipsis, a short one is not');
  ok(g.dis === '0.38', `a disabled Add selected is the shared 0.38 (${g.dis})`);
  ok(g.ringOff === '-2px', `the x focus ring sits inside the tag (${g.ringOff})`);
  // hover guard, like for like on --bg-1
  await p.hover('#a .vk-tags__tag:nth-child(2) .vk-tags__x'); await p.waitForTimeout(150);
  const h = await p.evaluate(() => getComputedStyle(document.getElementById('a')).backgroundColor); ok(h === 'rgba(0, 0, 0, 0)', `hovering an x leaves the Avoid row clear (${h})`);
  await p.hover('#otherctl'); await p.waitForTimeout(150);
  const o = await p.evaluate(() => getComputedStyle(document.getElementById('other')).backgroundColor); ok(o === 'rgb(43, 43, 43)', `a stack row WITHOUT a tag list still hands over its hover (${o}): the guard is scoped`);
  const q = await open(noGuard); await q.hover('#a .vk-tags__tag:nth-child(2) .vk-tags__x'); await q.waitForTimeout(150);
  const ng = await q.evaluate(() => getComputedStyle(document.getElementById('a')).backgroundColor); ok(ng === 'rgb(43, 43, 43)', `NEGATIVE CONTROL: without the guard the Avoid row tints (${ng})`); await q.close();
  // behaviour
  await p.evaluate(() => document.querySelector('#a .vk-tags__tag:nth-child(2) .vk-tags__x').focus());
  await p.keyboard.press('Delete'); await p.waitForTimeout(100);
  let s = await p.evaluate(() => ({ names: [...document.querySelectorAll('#a .vk-tags__t')].map((e) => e.textContent), focus: document.activeElement.getAttribute('aria-label'), removed: window.removed.slice(), live: document.querySelector('#a .vk-tags__live').textContent }));
  ok(JSON.stringify(s.names) === '["Title","Subtitle"]' && s.focus === 'Remove Subtitle' && s.removed[0] === 'Logo' && s.live === 'Removed Logo', `Delete removes the focused tag, focus moves to the next x, onRemove gets the name, the live region says it (${JSON.stringify(s)})`);
  await p.keyboard.press('Backspace'); await p.waitForTimeout(100);
  s = await p.evaluate(() => ({ names: [...document.querySelectorAll('#a .vk-tags__t')].map((e) => e.textContent), focus: document.activeElement.getAttribute('aria-label') }));
  ok(JSON.stringify(s.names) === '["Title"]' && s.focus === 'Remove Title', 'Backspace on the last tag moves focus to the one before');
  await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  s = await p.evaluate(() => ({ n: document.querySelectorAll('#a .vk-tags__tag').length, focusAdd: document.activeElement.hasAttribute('data-tags-add'), live: document.querySelector('#a .vk-tags__live').textContent }));
  ok(s.n === 0 && s.focusAdd && s.live === 'Removed Title', 'Enter on the x removes it; with no tags left focus goes to Add selected');
  await p.evaluate(() => { document.querySelector('#a .vk-tags').insertAdjacentHTML('beforeend', '<span class="vk-tags__tag"><span class="vk-tags__t">Late</span><button type="button" class="vk-row__ctl vk-tags__x" aria-label="Remove Late"></button></span>'); window.cancel = true; });
  await p.click('#a .vk-tags__x'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelectorAll('#a .vk-tags__tag').length === 1 && window.removed.slice(-1)[0] === 'Late'), 'a tag added after mount works, and onRemove returning false cancels the removal');
  await p.close();
  // the specimen markup follows the rule: every x has a data-tip, every disabled Add selected a data-tip and a data-tip-desc (a negative control strips them and the check fails)
  const cat = (await import('../specimen/catalogue/panels.mjs')).default.entries.find((e) => e.classes && e.classes.includes('vk-tags'));
  ok(!!cat, 'the specimen has a vk-tags entry');
  const audit = (html) => { const xs = html.match(/<button[^>]*vk-tags__x[^>]*>/g) || [], dis = html.match(/<button[^>]*aria-disabled="true"[^>]*>/g) || []; return { xs: xs.length, xsNoTip: xs.filter((t) => !/data-tip="Remove /.test(t)).length, dis: dis.length, disNoDesc: dis.filter((t) => !/data-tip="Add selected"/.test(t) || !/data-tip-desc="[^"]+\./.test(t)).length }; };
  const au = audit(cat.html); ok(au.xs >= 3 && au.xsNoTip === 0 && au.dis >= 1 && au.disNoDesc === 0, `every x in the specimen has data-tip="Remove …", every disabled Add selected data-tip + data-tip-desc (${JSON.stringify(au)})`);
  const bad = audit(cat.html.replace(/ data-tip="Remove [^"]*"/g, '').replace(/ data-tip-desc="[^"]*"/g, ''));
  ok(bad.xsNoTip > 0 && bad.disNoDesc > 0, `NEGATIVE CONTROL: the same markup without the tips fails the audit (${JSON.stringify(bad)})`);
  console.log(`tags: ${n} checks passed`);
} finally { await b.close(); }
