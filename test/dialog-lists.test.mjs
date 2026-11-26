// node test/dialog-lists.test.mjs: v0.41.180 and v0.41.181, PROCESSOR's "Use in an FX" dialog: the pick list inside a dialog (.vk-modal__list), the row note (.vk-row__note),
// three actions at the narrowest dialog (.vk-modal__actions wraps), and the Linked badge's drag hint. Real CSS (dist/app.css), real clicks, Edge.
// Negative controls: without the list rule a row is invisible against the dialog; without flex-wrap three actions overflow at 300px; without the hover rule the note on a hovered row is under AA.
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
const page = (c, app = 'processor') => `<!doctype html><meta charset=utf-8><style>${c}</style><body data-app="${app}" style="margin:0;background:#161616;font:var(--fs-body)/1.35 var(--sans);color:var(--tx-1)">
<div class="vk-modal" id="m1" style="width:390px"><div class="vk-modal__title">Use in an FX</div><div class="vk-modal__msg">Pick the image slot to fill with it.</div>
<div class="vk-modal__list" id="list"><div class="vk-row is-selected" id="r1"><span class="vk-row__label">Image · Image</span><span class="vk-row__note" id="n1">has an image</span></div><div class="vk-row" id="r2"><span class="vk-row__label">Pattern · Stamp Image</span><span class="vk-row__note" id="n2">no image</span></div></div>
<div class="vk-modal__actions"><button class="vk-btn">Back</button></div></div>
<div class="vk-modal" id="wide" style="width:440px"><div class="vk-modal__title">Image</div><div class="vk-modal__msg">Replace it?</div>${acts}</div>
<div class="vk-modal" id="narrow" style="width:300px;min-width:300px"><div class="vk-modal__title">Image</div><div class="vk-modal__msg">Replace it?</div>${acts}</div>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
const open = async (c = css, app = 'processor') => { const p = await b.newPage({ viewport: { width: 700, height: 900 } }); await p.setContent(page(c, app)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200); return p; };
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
  // the note on a hovered row: AA (4.5:1) on all four app colours; the negative control drops the hover rule
  const HOVER = '.vk-modal__list .vk-row:hover .vk-row__note,.vk-modal__list .vk-row.is-hover .vk-row__note{color:var(--tx-1);}'; const noHover = css.replace(HOVER, '');
  assert.ok(noHover.length < css.length, 'the hover negative control really removed its rule');
  const hoverRatio = async (c, app) => { const q = await open(c, app); await q.hover('#r2'); await q.waitForTimeout(150); const v = await q.evaluate(() => ({ fg: getComputedStyle(document.getElementById('n2')).color, bg: getComputedStyle(document.getElementById('r2')).backgroundColor })); await q.close(); return cr(v.fg, v.bg); };
  const worst = []; for (const app of ['processor', 'kompositor', 'dimensor', 'inceptor']) { const r = await hoverRatio(css, app); worst.push(r); ok(r >= 4.5, `the note on a hovered row reads at AA in ${app} (${r.toFixed(2)}:1)`); }
  const bare = await hoverRatio(noHover, 'processor');
  ok(bare < 4.5, `NEGATIVE CONTROL: without the hover rule the note on a hovered row is under AA in processor (${bare.toFixed(2)}:1)`);
  // the note sits at least 16px from the label (the row's 8px gap plus the note's 8px)
  const p3 = await open(); const gap = await p3.evaluate(() => document.getElementById('n2').getBoundingClientRect().left - document.querySelector('#r2 .vk-row__label').getBoundingClientRect().right); await p3.close();
  ok(gap >= 16, `the note is at least 16px from the label's right edge when the label is short (${Math.round(gap)}px: the margin-left:auto pushes it further)`);
  // the badge tip: 12 words at most, the drag hint is opt-in
  const words = (t) => t.split(' ').length;
  const plain = badgeOf({ ownerApp: 'dimensor', policy: 'onRequest' }).desc, live = badgeOf({ ownerApp: 'dimensor', policy: 'live' }).desc;
  const drag = badgeOf({ ownerApp: 'dimensor', policy: 'onRequest', dragHint: true }).desc, dragLive = badgeOf({ ownerApp: 'dimensor', policy: 'live', dragHint: true }).desc;
  ok(drag === 'Linked to DIMENSOR. Drag onto an image slot to copy it there' && words(drag) <= 12 && words(dragLive) <= 12 && dragLive === drag, `with dragHint: true the tip is the 12-word hint (${drag}: ${words(drag)} words, the same for both policies)`);
  ok(words(plain) <= 12 && words(live) <= 12 && !/Drag/.test(plain) && !/Drag/.test(live), `by default there is no hint, so an app without the drag never promises it (${plain}; ${live})`);
  ok(!/Drag/.test(badgeOf({ ownerApp: 'dimensor', policy: 'live', dragHint: false }).desc), 'dragHint: false is the same as the default');
  ok(!/Drag/.test(badgeOf({ ownerApp: 'dimensor', state: 'frozen', dragHint: true }).desc) && !/Drag/.test(badgeOf({ ownerApp: 'dimensor', via: 'file', dragHint: true }).desc) && !/Drag/.test(badgeOf({ ownerApp: 'dimensor', state: 'sourceClosed', dragHint: true }).desc), 'the other states carry no hint even with dragHint: true');
  // every state's tip description is 12 words at most (the limit in AGENTS.md), not only the Linked ones
  const STATES = [{ state: 'frozen' }, { state: 'sourceClosed' }, { notResponding: true }, { state: 'updateAvailable' }, { via: 'file' }, { policy: 'live' }, { dragHint: true }].map((r) => ({ ownerApp: 'kompositor', ...r }));
  const over = STATES.filter((r) => words(badgeOf(r).desc) > 12).map((r) => badgeOf(r).word);
  ok(over.length === 0, 'every badge state keeps its tip description to 12 words at most' + (over.length ? ' (over: ' + over.join(', ') + ')' : ''));
  ok(words("The source app is open but isn't answering. Try again, or check it.") > 12, 'NEGATIVE CONTROL: the old Source not responding text (13 words) fails the same limit');
  // the specimen shows the real word on both Linked chips, one owner, and says which chip has which tip
  const spec = readFileSync(ROOT + 'specimen/index.html', 'utf8');
  ok(!/Linked, draggable/.test(spec) && (spec.match(/<span>Linked<\/span>/g) || []).length >= 2 && /left chip carries the default tip/.test(spec), 'the specimen has two chips that both read Linked, and a note saying which carries which tip');
  // NEGATIVE CONTROL for the default: the old behaviour (hint on unless false) would have put the hint on a plain record
  const oldDefault = (rec) => (rec.dragHint === false ? 'plain' : 'Drag onto an image slot');
  ok(/Drag/.test(oldDefault({ ownerApp: 'dimensor' })) && !/Drag/.test(plain), 'NEGATIVE CONTROL: an on-by-default hint would show on a plain record; the shipped default does not');
  console.log(`dialog-lists: ${n} checks passed`);
} finally { await b.close(); }
