// node test/roll-die.test.mjs: the roll die is automatic (v0.41.174, Patrick 2026-11-20 "check all roll buttons have a die").
// A .vk-roll-rand with no die in its markup draws the die itself; one that carries ROLL_DICE_SVG keeps that one only (never two); a plain .vk-btn has none.
// Pixel checks on a real render (the die box has ink, and the label moves right by die width + gap). Negative control: the same page with the ::before rule removed shows no die on the bare button, so the check can fail.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const css = readFileSync(ROOT + 'tokens.css', 'utf8') + readFileSync(ROOT + 'themes/themes.css', 'utf8') + readFileSync(ROOT + 'dist/app.css', 'utf8');
const { ROLL_DICE_SVG } = await import('../icons/roll-dice.js');
const stripped = css.replace(/\.vk-roll-rand:not\(:has\(> \.vk-roll-rand__dice\)\)::before\{[^}]*\}/, '');
assert.ok(stripped.length < css.length - 1000, 'the negative control really removed the rule');
const html = `<body data-app="dimensor" style="background:#212121;margin:20px;display:flex;flex-direction:column;gap:14px;align-items:flex-start">
<button id="bare" class="vk-btn vk-roll-rand">Roll scene</button>
<button id="own" class="vk-btn vk-roll-rand">${ROLL_DICE_SVG}Roll scene</button>
<button id="compact" class="vk-btn vk-btn--compact vk-roll-rand">Randomise</button>
<button id="primary" class="vk-btn vk-btn--primary vk-roll-rand">Full random</button>
<button id="plain" class="vk-btn">Reset</button>`;
const b = await chromium.launch({ channel: 'msedge' });
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
async function probe(cssText) {
  const p = await b.newPage({ viewport: { width: 400, height: 320 } });
  await p.setContent(`<style>${cssText}</style>${html}`); await p.waitForTimeout(150);
  const out = {};
  for (const id of ['bare', 'own', 'compact', 'primary', 'plain']) {
    const el = await p.$('#' + id);
    const m = await el.evaluate((e) => { const b = getComputedStyle(e, '::before'), r = e.getBoundingClientRect(), pl = parseFloat(getComputedStyle(e).paddingLeft); return { content: b.content, w: b.width, h: b.height, bg: getComputedStyle(e).backgroundColor, left: r.left, top: r.top, bh: r.height, pl, svg: !!e.querySelector('.vk-roll-rand__dice'), labelX: (() => { const rg = document.createRange(); rg.selectNodeContents(e.lastChild); return rg.getBoundingClientRect().left - r.left; })() }; });
    // ink in the 13 x 15 box where the die sits (button padding-left, vertically centred): pixels that differ from the button fill
    const clip = { x: m.left + m.pl, y: m.top + (m.bh - 15) / 2, width: 13, height: 15 };
    const png = await p.screenshot({ clip });
    const ink = await p.evaluate(async ([data, bg]) => {
      const im = new Image(); im.src = 'data:image/png;base64,' + data; await im.decode();
      const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; const [r, g, bl] = bg.match(/\d+/g).map(Number); let k = 0;
      for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - r) + Math.abs(d[i + 1] - g) + Math.abs(d[i + 2] - bl) > 90) k++;
      return k;
    }, [png.toString('base64'), m.bg]);
    out[id] = { ...m, ink };
  }
  await p.close();
  return out;
}
try {
  const a = await probe(css);
  ok(a.bare.content !== 'none' && a.bare.w === '13px' && a.bare.h === '15px', 'a bare .vk-roll-rand draws a 13x15 die');
  ok(a.bare.ink > 40, `the bare button's die has ink (${a.bare.ink} px)`);
  ok(a.own.content === 'none' && a.own.svg, 'a button that carries the die in its markup gets no second one');
  ok(a.own.ink > 40, `the markup die has ink (${a.own.ink} px)`);
  ok(Math.abs(a.bare.labelX - a.own.labelX) < 0.6, `one die in each: the label starts at the same x (${a.bare.labelX.toFixed(1)} / ${a.own.labelX.toFixed(1)})`);
  ok(a.compact.content !== 'none' && a.compact.ink > 40, 'the compact Randomise gets it too');
  ok(a.primary.content !== 'none' && a.primary.ink > 40, 'a primary roll button gets it too');
  ok(a.plain.content === 'none', 'a plain .vk-btn has no die');
  const s = await probe(stripped);
  ok(s.bare.content === 'none' && s.bare.labelX < a.bare.labelX - 15, `NEGATIVE CONTROL: without the rule a bare .vk-roll-rand has no die (label at x ${s.bare.labelX.toFixed(1)}, with it ${a.bare.labelX.toFixed(1)}), so the check can fail`);
  console.log(`roll-die: ${n} checks passed`);
} finally { await b.close(); }
