// node test/asset-browser.test.mjs: the asset browser shell, licence tags, credit line and Licences dialog (v0.41.195): app/asset-browser.css, drawn with the REAL tokens and bundle in an app theme.
// The measurements are the rule in AGENTS.md "Asset browser shell": a text row is 34px and a specimen row 44px, rows 4px apart, the header and every row on one column grid, hover and selected tints over --bg-2,
// the keyboard cursor ring inside the row, a licence tag neutral and the limiting one caution, a credit line cut with an ellipsis, a licence set resting on --bg-3.
// Every check also runs against deliberate MUTANTS of the CSS (a rule removed or changed): each must fail at least one check, so a test that cannot fail cannot pass quietly.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
assert.ok(css.includes('.vk-ab__row'), 'dist/app.css carries app/asset-browser.css (run node scripts/build-dist.mjs)');
const COLS = '26px minmax(150px,1fr) minmax(180px,1.8fr) 84px 96px 54px';
const row = (cls, extra = '') => `<div class="vk-ab__row ${cls}" role="option"><span class="vk-ab__lead${extra}">★</span><span class="vk-ab__name"><b>Space Mono with a name long enough to be cut by the column edge</b><small>Shared · 4 styles</small></span><span class="vk-ab__prev" style="font-family:monospace">Hamburgefonstiv</span><span class="vk-ab__cell">Mono</span><span><span class="vk-tag vk-tag--lic">OFL 1.1</span></span><button class="vk-btn vk-btn--compact vk-ab__act">Use</button></div>`;
const page = (c) => `<!doctype html><meta charset=utf-8><style>${c}</style><body data-app="processor" style="margin:0;background:#161616;font:var(--fs-body)/1.35 var(--sans);color:var(--tx-1)">
<div id="shell" class="vk-ab" style="width:1000px;height:auto;--ab-cols:${COLS};display:block;padding:20px">
  <div class="vk-ab__cols" id="cols"><span></span><span>Family</span><span>Preview</span><span>Category</span><span>Licence</span><span></span></div>
  <div class="vk-ab__rows" id="rows" tabindex="0" role="listbox">${row('vk-ab__row--specimen', ' is-on')}${row('vk-ab__row--specimen is-selected is-cursor')}${row('vk-ab__row--specimen')}<div id="plain">${row('')}${row('')}</div></div>
</div>
<div style="padding:20px;display:flex;gap:10px;align-items:center;width:200px"><span id="tagA" class="vk-tag vk-tag--lic">CC BY 4.0 with more words than fit</span><span id="tagB" class="vk-tag vk-tag--lic vk-tag--nc">CC BY-NC 4.0</span></div>
<div class="vk-store-detail" id="det" style="width:420px"><span class="vk-store-detail__name">Kiwi</span><span class="vk-store-detail__credit" id="cred">"Kiwi Soda" by Pixel Sagas, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://example.org/kiwi-soda-and-a-long-path</span></div>
<div class="vk-modal" style="width:520px"><div class="vk-licences"><div class="vk-lic" id="lic"><div class="vk-lic__head"><span class="vk-lic__name">Shared fonts<small>155 families</small></span><span class="vk-tag vk-tag--lic">OFL 1.1</span><button class="vk-btn vk-btn--compact">Licence text</button></div><pre class="vk-lic__text vk-copyable" id="lt" hidden>text</pre><pre class="vk-lic__text vk-copyable" id="lt2">open text</pre></div></div></div>`;
const b = await chromium.launch({ channel: 'msedge' });
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
// every check returns a list of failures ('' = none) so a mutant can be required to produce at least one
async function checks(c) {
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } }); await p.setContent(page(c)); await p.waitForTimeout(250);
  const bad = [];
  const g = await p.evaluate(() => { const r = (e) => e.getBoundingClientRect(), q = (s) => document.querySelector(s), qa = (s) => [...document.querySelectorAll(s)], cs = (e, k) => getComputedStyle(e)[k];
    const sp = qa('#rows > .vk-ab__row'), pl = qa('#plain .vk-ab__row'), hc = [...q('#cols').children], rc = [...sp[0].children];
    const tagB = q('#tagB'), tagA = q('#tagA'), cred = q('#cred'), lic = q('#lic'), bold = q('#rows .vk-ab__name b');
    return { spH: r(sp[0]).height, plH: r(pl[0]).height, spPitch: r(sp[1]).top - r(sp[0]).top, plPitch: r(pl[1]).top - r(pl[0]).top,
      colX: hc.map((e, i) => Math.round(r(e).left - r(rc[i]).left)), rest: cs(sp[2], 'backgroundColor'), sel: cs(sp[1], 'backgroundColor'),
      starOn: cs(sp[0].querySelector('.vk-ab__lead'), 'color'), starOff: cs(sp[2].querySelector('.vk-ab__lead'), 'color'),
      tagAc: cs(tagA, 'color'), tagBc: cs(tagB, 'color'), tagAh: r(tagA).height, tagBh: r(tagB).height, tagAnow: cs(tagA, 'whiteSpace'),
      credOver: cred.scrollWidth > cred.clientWidth, credTO: cs(cred, 'textOverflow'), credSel: cs(cred, 'userSelect'),
      licBg: cs(lic, 'backgroundColor'), ltHidden: cs(q('#lt'), 'display'), lt2: cs(q('#lt2'), 'display'), lt2Sel: cs(q('#lt2'), 'userSelect'),
      boldTO: cs(bold, 'textOverflow'), boldCut: bold.scrollWidth > bold.clientWidth, prevSize: cs(sp[0].querySelector('.vk-ab__prev'), 'fontSize'), bg2: cs(q('#shell'), 'backgroundColor') }; });
  const ok = (cond, m) => { if (!cond) bad.push(m); };
  ok(g.spH === 44 && g.plH === 34, `rows: specimen 44, text 34 (${g.spH}, ${g.plH})`);
  ok(g.spPitch === 48 && g.plPitch === 38, `rows are 4px apart: pitch 48 and 38 (${g.spPitch}, ${g.plPitch})`);
  ok(g.colX.every((x) => Math.abs(x) <= 1), `the header columns sit over the row columns (${g.colX})`);
  ok(g.rest !== g.sel, `a selected row tints over the rest (${g.rest} / ${g.sel})`);
  ok(g.starOn !== g.starOff, 'a leading action that is on takes the accent');
  ok(g.tagAc === g.tagBc ? false : g.tagBc === rgb('#f9c200'), `a limiting licence tag is the caution colour (${g.tagBc})`);
  ok(g.tagAc !== rgb('#f9c200'), 'an open licence tag is not caution');
  ok(g.tagAh === g.tagBh, `a licence tag never wraps (${g.tagAh}, ${g.tagBh}, ${g.tagAnow})`);
  ok(g.credOver && g.credTO === 'ellipsis' && g.credSel === 'text', `the credit line is cut with an ellipsis and selectable (${g.credOver}, ${g.credTO}, ${g.credSel})`);
  ok(g.licBg === rgb('#262626') || g.licBg !== g.bg2, `a licence set rests on its own ground (${g.licBg})`);
  ok(g.ltHidden === 'none' && g.lt2 === 'block' && g.lt2Sel === 'text', `licence text is hidden until opened, then selectable (${g.ltHidden}, ${g.lt2}, ${g.lt2Sel})`);
  ok(g.boldCut && g.boldTO === 'ellipsis', 'a long name is cut with an ellipsis');
  ok(g.prevSize === '22px', `the specimen is 22px (${g.prevSize})`);
  // hover tints over the row; the keyboard cursor draws its ring inside
  await p.hover('#rows > .vk-ab__row:nth-child(3)'); await p.waitForTimeout(120);
  const h = await p.evaluate(() => [getComputedStyle(document.querySelector('#rows > .vk-ab__row:nth-child(3)')).backgroundColor, getComputedStyle(document.querySelector('#rows > .vk-ab__row:nth-child(1)')).backgroundColor]);
  ok(h[0] !== h[1], `hover tints a row (${h[0]} against ${h[1]})`);
  await p.keyboard.press('Tab'); await p.waitForTimeout(120);
  const ring = await p.evaluate(() => { const e = document.querySelector('.vk-ab__row.is-cursor'); const s = getComputedStyle(e); return [document.activeElement.id, s.outlineStyle, s.outlineOffset]; });
  ok(ring[0] === 'rows' && ring[1] !== 'none' && ring[2] === '-2px', `the keyboard cursor ring sits inside the row (${ring})`);
  await p.close(); return bad;
}
let n = 0;
const real = await checks(css); assert.deepEqual(real, [], 'the real CSS passes every check:\n' + real.join('\n')); n++; console.log('  checks pass');
const rm = (re) => { const o = css.replace(re, ''); assert.ok(o.length < css.length, 'the mutation changed nothing: ' + re); return o; };
const sub = (a, b) => { assert.ok(css.includes(a), 'the mutation changed nothing: ' + a); return css.replace(a, b); };
const mutants = [
  ['the specimen row is as short as a text row', () => rm(/\.vk-ab__row--specimen\{height:44px;\}/)],
  ['rows touch each other', () => sub('.vk-ab__row + .vk-ab__row{margin-top:4px;}', '.vk-ab__row + .vk-ab__row{margin-top:0;}')],
  ['the row grid ignores --ab-cols', () => sub('display:grid;grid-template-columns:var(--ab-cols);gap:10px;align-items:center;\n  background:var(--bg-2)', 'display:grid;grid-template-columns:30px 1fr 1fr 1fr 1fr 1fr;gap:10px;align-items:center;\n  background:var(--bg-2)').replace(/\r?\n/g, '\n')],
  ['a selected row does not tint', () => rm(/\.vk-ab__row\.is-selected\{[^}]*\}/)],
  ['hover does not tint a row', () => rm(/\.vk-ab__row:hover\{background[^}]*\}/)],
  ['a limiting licence is not caution', () => rm(/\.vk-tag--lic\.vk-tag--nc\{[^}]*\}/)],
  ['a licence tag wraps', () => sub('.vk-tag--lic{white-space:nowrap;flex:none;', '.vk-tag--lic{')],
  ['the credit line is not cut', () => sub('white-space:nowrap;overflow:hidden;text-overflow:ellipsis;user-select:text;}', 'user-select:text;}')],
  ['the credit line cannot be selected', () => sub('text-overflow:ellipsis;user-select:text;}', 'text-overflow:ellipsis;}')],
  ['the cursor ring is drawn outside', () => sub('outline-offset:-2px;}\n.vk-ab__lead', 'outline-offset:2px;}\n.vk-ab__lead').replace(/\r?\n/g, '\n')],
  ['the specimen is not 22px', () => sub('.vk-ab__prev{font-size:22px;', '.vk-ab__prev{font-size:13px;')],
  ['a name is not cut', () => sub('.vk-ab__name b{display:block;color:var(--tx-0);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}', '.vk-ab__name b{display:block;color:var(--tx-0);font-weight:600;}')],
];
for (const [name, make] of mutants) { let c; try { c = make(); } catch (e) { if (/changed nothing/.test(e.message)) throw e; throw e; } const bad = await checks(c); assert.ok(bad.length > 0, 'MUTANT NOT CAUGHT: ' + name); n++; console.log('  mutant caught: ' + name); }
await b.close();
console.log(`asset browser: ${n} runs (the real CSS and ${mutants.length} mutants), every mutant caught`);
