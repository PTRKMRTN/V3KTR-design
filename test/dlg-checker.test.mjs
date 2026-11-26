// node test/dlg-checker.test.mjs: v0.41.186, DIMENSOR's SVG import dialog. (1) the transparency checker pair keeps a near-black and a white logo readable (contrast from the real tokens),
// (2) .vk-dlg-preview--checker really paints a checker in two tones in 8px squares and leaves .is-empty and a plain preview alone, (3) a slider in a dialog has a track that differs from the dialog.
// Real CSS (dist/app.css), real pixels, Edge. Negative controls: the old pair #777 / #999 fails the white-logo bar; without the checker rule the preview stays the dark well; without the dialog-slider rule the track equals the dialog.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const tokens = readFileSync(ROOT + 'tokens.css', 'utf8');
const css = tokens + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };

// ---- (1) contrast of the pair, from the tokens file itself
const tok = (name) => { const m = tokens.match(new RegExp('--' + name + ':\\s*(#[0-9a-fA-F]{6}|\\d+px)')); assert.ok(m, 'token ' + name + ' present'); return m[1]; };
const A = tok('checker-a'), B = tok('checker-b'), CELL = tok('checker-cell');
const lum = (hex) => { const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const BAR = 3.2;   // against both squares; the white logo on the lighter square is the tight one (3.28)
const passes = (a, b) => ['#111111', '#ffffff'].every((logo) => cr(logo, a) >= BAR && cr(logo, b) >= BAR);
ok(A === '#777777' && B === '#8e8e8e' && CELL === '8px', `the pair is #777777 / #8e8e8e at 8px (got ${A} / ${B} / ${CELL})`);
ok(passes(A, B), `near-black and white both reach ${BAR}:1 on both squares (near-black ${cr('#111111', A).toFixed(2)} / ${cr('#111111', B).toFixed(2)}, white ${cr('#ffffff', A).toFixed(2)} / ${cr('#ffffff', B).toFixed(2)})`);
ok(!passes('#777777', '#999999'), 'negative control: the first suggestion #777777 / #999999 fails (white on #999999 is ' + cr('#ffffff', '#999999').toFixed(2) + ':1)');
ok(cr('#838383', A) < 1.3 && cr('#838383', B) < 1.3, 'the known limit holds: a mid-grey logo (#838383) vanishes on the checker (' + cr('#838383', A).toFixed(2) + ' / ' + cr('#838383', B).toFixed(2) + ')');
ok(cr(A, B) > 1.2 && cr(A, B) < 1.6, 'the two tones are close to each other (' + cr(A, B).toFixed(2) + ':1), so the checker does not fight the logo');

// ---- (2) and (3) in the browser
const page = (c) => `<!doctype html><meta charset=utf-8><style>${c}</style><body data-app="dimensor" style="margin:0;background:#161616;color:var(--tx-0)">
<div class="vk-modal" id="m" style="width:360px;margin:10px"><div class="vk-modal__title">Import SVG</div><div style="padding:0 18px 16px">
<div class="vk-dlg-preview vk-dlg-preview--checker" id="chk"><svg viewBox="0 0 360 190"><circle cx="180" cy="95" r="50" fill="#111"/></svg></div>
<div class="vk-dlg-preview" id="plain"><svg viewBox="0 0 360 190"><circle cx="180" cy="95" r="50" fill="#e2572e"/></svg></div>
<div class="vk-dlg-preview vk-dlg-preview--checker is-empty" id="empty">No shapes to extrude</div>
<div class="vk-scrub" id="inmodal" style="--fill:35%"><span class="vk-scrub__label">Depth</span><span class="vk-scrub__val">12</span></div></div></div>
<div class="vk-scrub" id="outside" style="--fill:35%;width:300px;margin:10px"><span class="vk-scrub__label">Depth</span><span class="vk-scrub__val">12</span></div>`;
const b = await chromium.launch({ channel: 'msedge' });
const open = async (c = css) => { const p = await b.newPage({ viewport: { width: 520, height: 900 } }); await p.setContent(page(c)); await p.evaluate(() => document.fonts.ready); return p; };
const noRule = css.replace(/\.vk-dlg-preview--checker:not\(\.is-empty\)\{[^}]*\}/, '');
const noScrub = css.replace('.vk-modal .vk-scrub{background:var(--bg-3);}', '');
ok(noRule.length < css.length && noScrub.length < css.length, 'the negative controls really removed their rule');
try {
  const p = await open();
  const g = await p.evaluate(() => { const cs = (s) => getComputedStyle(document.querySelector(s));
    return { chk: [cs('#chk').backgroundColor, cs('#chk').backgroundImage.slice(0, 18), cs('#chk').backgroundSize], plain: cs('#plain').backgroundImage.slice(0, 12), empty: cs('#empty').backgroundImage.slice(0, 12), emptyBg: cs('#empty').backgroundColor,
      modal: cs('#m').backgroundColor, inm: cs('#inmodal').backgroundColor, out: cs('#outside').backgroundColor }; });
  ok(g.chk[0] === 'rgb(119, 119, 119)' && g.chk[1].startsWith('conic-gradient') && g.chk[2] === '16px 16px', 'the checker is painted: ' + JSON.stringify(g.chk));
  ok(g.plain.startsWith('url('), 'a plain preview keeps the canvas tile (' + g.plain + ')');
  ok(g.empty.startsWith('url(') && g.emptyBg !== 'rgb(119, 119, 119)', 'an empty preview keeps the dark well even with the class (' + g.empty + ', ' + g.emptyBg + ')');
  // real pixels: two adjacent cells of the checker are the two tones
  const box = await (await p.$('#chk')).boundingBox();
  const shot = await p.screenshot({ clip: { x: box.x + 2, y: box.y + 2, width: 40, height: 20 } });
  const px = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const at = (a, y) => Array.from(x.getImageData(a, y, 1, 1).data).slice(0, 3).join(','); return [at(1, 1), at(9, 1), at(17, 1), at(9, 9)]; }, shot.toString('base64'));
  ok(new Set(px).size === 2 && px[0] === px[2] && px[0] !== px[1], 'two tones alternate across cells and down: ' + px.join(' | '));
  ok(g.inm === 'rgb(58, 58, 58)' && g.modal === 'rgb(43, 43, 43)' && g.inm !== g.modal, `a slider in a dialog is --bg-3 on the dialog's --bg-2 (${g.inm} on ${g.modal})`);
  ok(g.out === 'rgb(43, 43, 43)', 'a slider outside a dialog is unchanged (--bg-2: ' + g.out + ')');
  await p.close();
  // negative controls
  const p2 = await open(noRule);
  const nr = await p2.evaluate(() => getComputedStyle(document.querySelector('#chk')).backgroundImage.slice(0, 12));
  ok(nr.startsWith('url('), 'negative control: without the checker rule the preview is still the dark well (' + nr + ')'); await p2.close();
  const p3 = await open(noScrub);
  const ns = await p3.evaluate(() => [getComputedStyle(document.querySelector('#inmodal')).backgroundColor, getComputedStyle(document.querySelector('#m')).backgroundColor]);
  ok(ns[0] === ns[1], 'negative control: without the dialog-slider rule the track equals the dialog (' + ns.join(' on ') + ')'); await p3.close();
} finally { await b.close(); }
console.log(`dlg-checker: ${n} checks pass`);
