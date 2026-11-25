// node test/dialog-lists.test.mjs: v0.41.180, PROCESSOR's "Use in an FX" dialog: the pick list inside a dialog (.vk-modal__list), the row note (.vk-row__note),
// three actions at the narrowest dialog (.vk-modal__actions wraps), and the Linked badge's drag hint. Real CSS (dist/app.css), real clicks, Edge.
// Negative controls: without the list rule a row is invisible against the dialog; without flex-wrap three actions overflow at 300px.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const { badgeOf } = await import('../interactions/link-badge.js');
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const noList = css.replace(/\.vk-modal__list \.vk-row\{background:var\(--bg-3\);\}/, '');
const noWrap = css.replace('.vk-modal__actions{display:flex;flex-wrap:wrap;', '.vk-modal__actions{display:flex;');
assert.ok(noList.length < css.length && noWrap.length < css.length, 'the negative controls really removed their rule');
const acts = '<div class="vk-modal__actions"><button class="vk-btn">Keep mine</button><button class="vk-btn">Use in an FX…</button><button class="vk-btn vk-btn--primary">Replace</button></div>';
const page = (c) => `<!doctype html><meta charset=utf-8><style>${c}</style><body data-app="processor" style="margin:0;background:#161616;font:var(--fs-body)/1.35 var(--sans);color:var(--tx-1)">
<div class="vk-modal" id="m1" style="width:390px"><div class="vk-modal__title">Use in an FX</div><div class="vk-modal__msg">Pick the image slot to fill with it.</div>
<div class="vk-modal__list" id="list"><div class="vk-row is-selected" id="r1"><span class="vk-row__label">Image · Image</span><span class="vk-row__note" id="n1">has an image</span></div><div class="vk-row" id="r2"><span class="vk-row__label">Pattern · Stamp Image</span><span class="vk-row__note" id="n2">no image</span></div></div>
<div class="vk-modal__actions"><button class="vk-btn">Back</button></div></div>
<div class="vk-modal" id="wide" style="width:440px"><div class="vk-modal__title">Image</div><div class="vk-modal__msg">Replace it?</div>${acts}</div>
<div class="vk-modal" id="narrow" style="width:300px;min-width:300px"><div class="vk-modal__title">Image</div><div class="vk-modal__msg">Replace it?</div>${acts}</div>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const open = async (c = css) => { const p = await b.newPage({ viewport: { width: 700, height: 900 } }); await p.setContent(page(c)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); return p; };
const luma = (rgb) => { const sc = /^color\(/.test(rgb) ? 255 : 1; const [r, g, bl] = rgb.match(/[\d.]+/g).slice(0, 3).map((v) => Number(v) * sc).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
const cr = (a, c) => { const [x, y] = [luma(a), luma(c)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
try {
  const p = await open();
  const g = await p.evaluate(() => { const cs = (s) => getComputedStyle(document.querySelector(s)), r = (s) => document.querySelector(s).getBoundingClientRect();
    return { modal: cs('#m1').backgroundColor, r2: cs('#r2').backgroundColor, r1: cs('#r1').backgroundColor, listPad: cs('#list').paddingLeft + '/' + cs('#list').paddingRight,
      rowL: Math.round(r('#r2').left - r('#m1').left), rowR: Math.round(r('#m1').right - r('#r2').right), noteSize: cs('#n2').fontSize, noteColor: cs('#n2').color, noteSelColor: cs('#n1').color, noteWrap: cs('#n2').whiteSpace,
      noteGap: Math.round(r('#r2').right - r('#n2').right), rowRightPad: cs('#r2').paddingRight, tx0: getComputedStyle(document.documentElement).getPropertyValue('--tx-0') }; });
  ok(g.r2 !== g.modal, `a list row is not the dialog's ground (${g.r2} on ${g.modal})`);
  ok(g.r1 !== g.r2, `the selected row differs from a resting one (${g.r1} vs ${g.r2})`);
  ok(g.listPad === '18px/18px' && g.rowL === g.rowR, `the list brings 18px side padding and the rows sit evenly (${g.listPad}, left ${g.rowL} right ${g.rowR})`);
  ok(g.noteSize === '11px' && g.noteWrap === 'nowrap', `the note is 11px and never wraps (${g.noteSize}, ${g.noteWrap})`);
  ok(g.noteGap === parseInt(g.rowRightPad), `the note sits at the right end of the row, inside its padding (${g.noteGap}px from the edge, padding ${g.rowRightPad})`);
  ok(g.noteSelColor !== g.noteColor, `the note turns white on the selected row (${g.noteSelColor} vs ${g.noteColor})`);
  const c1 = cr(g.noteColor, g.r2), c2 = cr(g.noteSelColor, g.r1);
  ok(c1 >= 4.5 && c2 >= 4.5, `the note reads on its ground: ${c1.toFixed(2)}:1 at rest, ${c2.toFixed(2)}:1 selected`);
  await p.hover('#r2'); await p.waitForTimeout(150);
  const hv = await p.evaluate(() => getComputedStyle(document.getElementById('r2')).backgroundColor);
  ok(hv !== g.r2 && hv !== g.r1, `hover is its own tint, neither resting nor selected (${hv})`);
  // three actions
  const lay = await p.evaluate(() => { const o = (id) => { const m = document.getElementById(id), bs = [...m.querySelectorAll('.vk-modal__actions .vk-btn')].map((e) => e.getBoundingClientRect()), mr = m.getBoundingClientRect(), a = m.querySelector('.vk-modal__actions').getBoundingClientRect();
      return { lines: new Set(bs.map((x) => Math.round(x.top))).size, over: bs.some((x) => x.right > a.right - 18 + 0.5 || x.left < a.left + 18 - 0.5), lastRight: Math.round(a.right - 18 - bs[2].right), heights: [...new Set(bs.map((x) => x.height))], gapX: Math.round(bs[1].left - bs[0].right), gapY: Math.round([...bs].sort((x, y) => x.top - y.top)[2].top - bs[0].bottom) }; }; return { wide: o('wide'), narrow: o('narrow') }; });
  ok(lay.wide.lines === 1 && !lay.wide.over && lay.wide.lastRight === 0, `440px: three actions on one line, the main one at the right edge (${JSON.stringify(lay.wide)})`);
  ok(lay.narrow.lines === 2 && !lay.narrow.over && lay.narrow.heights.length === 1, `300px: three actions wrap to two lines, nothing past the dialog 18px padding, one size (${JSON.stringify(lay.narrow)})`);
  ok(lay.narrow.gapY === 8 && lay.wide.gapX === 8, `8px apart both ways (${lay.wide.gapX}, ${lay.narrow.gapY})`);
  await p.close();
  const q = await open(noList); const bad = await q.evaluate(() => getComputedStyle(document.getElementById('r2')).backgroundColor === getComputedStyle(document.getElementById('m1')).backgroundColor); await q.close();
  ok(bad, 'NEGATIVE CONTROL: without the list rule a row is the same colour as the dialog (invisible until hovered)');
  const w = await open(noWrap); const ov = await w.evaluate(() => { const a = document.querySelector('#narrow .vk-modal__actions').getBoundingClientRect(); return [...document.querySelectorAll('#narrow .vk-modal__actions .vk-btn')].some((e) => e.getBoundingClientRect().left < a.left + 18 - 0.5); }); await w.close();
  ok(ov, 'NEGATIVE CONTROL: without flex-wrap the three actions run past the dialog padding at 300px');
  // the badge tip
  const L = badgeOf({ ownerApp: 'dimensor', policy: 'onRequest' }).desc, L2 = badgeOf({ ownerApp: 'dimensor', policy: 'live', dragHint: false }).desc;
  ok(/Drag onto an image slot to copy it there$/.test(L) && L.split(' ').length <= 16, `a Linked badge's tip carries the drag hint (${L})`);
  ok(!/Drag/.test(L2) && !/Drag/.test(badgeOf({ ownerApp: 'dimensor', state: 'frozen' }).desc) && !/Drag/.test(badgeOf({ ownerApp: 'dimensor', via: 'file' }).desc), 'dragHint:false and the other states carry no hint');
  console.log(`dialog-lists: ${n} checks passed`);
} finally { await b.close(); }
