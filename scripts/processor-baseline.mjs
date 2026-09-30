// Captures a spacing baseline of live PROCESSOR: panel screenshots (2x) + measured spacing of every visible control.
// Read-only: it drives a running dev server, it never edits PROCESSOR.
//   1. serve a clean PROCESSOR checkout (node scripts/dev-server.mjs → http://localhost:5050)
//   2. node scripts/processor-baseline.mjs [url] [outDir]
// Playwright is resolved from the PROCESSOR repo's node_modules (this repo has no dependencies).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const require = createRequire('file:///D:/00%20CLAUDE%20APPS/V3KTR-PROCESSOR/package.json');
const { chromium } = require('playwright');

const URL_ = process.argv[2] || 'http://localhost:5050/';
const OUT = process.argv[3] || fileURLToPath(new URL('../baselines/processor/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const [VW, VH] = (process.env.VIEW || '1600x1000').split('x').map(Number);   // window size, e.g. VIEW=1280x800
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: VW, height: VH }, deviceScaleFactor: 2 });
page.on('pageerror', (e) => console.log('pageerror', e.message));
await page.goto(URL_, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const version = await page.evaluate(() => document.querySelector('.ver')?.textContent?.trim() || '?');

const shots = [];
async function shot(name, what, locatorOrClip) {
  const file = `${name}.png`;
  if (!locatorOrClip) await page.screenshot({ path: OUT + file });
  else if (locatorOrClip.x !== undefined) await page.screenshot({ path: OUT + file, clip: locatorOrClip });
  else await page.locator(locatorOrClip).first().screenshot({ path: OUT + file });
  shots.push({ name, file, what });
  console.log('shot', name);
}
const box = async (sel) => page.locator(sel).first().boundingBox();

// ---- empty state
await shot('01-app-empty', 'Whole app, no image loaded', null);

// ---- load the sample, build a stack of three effects
await page.click('#sampleBtn');
await page.waitForTimeout(4000);
const railBtns = page.locator('#rail .rail-btn');
const railCount = await railBtns.count();
for (const i of [0, 5, 12]) {
  if (i < railCount) { await railBtns.nth(i).click(); await page.waitForTimeout(1500); }
}
await page.waitForTimeout(2000);
await page.mouse.move(40, VH - 40);   // off the rail, so no tooltip is showing
await page.waitForTimeout(400);
await shot('02-app-loaded', 'Whole app: sample image, three effects in the stack', null);
await shot('03-topbar', 'Top bar: menus, document name, actions', '.topbar');
await shot('04-ws-tabs', 'Workspace tabs', '#wsTabs');
await shot('05-rail', 'FX rail: group chips and effect buttons', '#rail');
await shot('06-stack', 'FX stack (layers)', '.side .stack');
await shot('07-params', 'Parameter panel as it first shows (selected effect: Dither, chip-heavy)', '#params');

// an effect with sliders: select the Blur layer
const blur = page.locator('#stackList .layer', { hasText: 'Blur' }).first();
if (await blur.count()) { await blur.locator('.lname').click(); await page.waitForTimeout(800); await page.mouse.move(40, VH - 40); await shot('07b-params-sliders', 'Parameter panel, slider-heavy effect (Blur)', '#params'); }

// full-length parameter panel: a taller window so the panel doesn't scroll
await page.locator('#stackList .layer', { hasText: 'Dither' }).first().locator('.lname').click();
await page.setViewportSize({ width: VW, height: 2200 });
await page.waitForTimeout(800); await page.mouse.move(700, 2100);
await shot('07c-params-full', 'Parameter panel, full length (window made taller so nothing scrolls)', '#params');
await page.setViewportSize({ width: VW, height: VH });
await page.waitForTimeout(800);

// a menu open
await page.click('.menu[data-menu="file"]');
await page.waitForTimeout(400);
const tb = await box('.topbar'); const mf = await box('#menuFile');
if (tb && mf) await shot('08-menu-file', 'File menu open', { x: 0, y: 0, width: Math.max(tb.width * 0.4, mf.x + mf.width + 20), height: mf.y + mf.height + 16 });
await page.keyboard.press('Escape'); await page.mouse.click(40, VH - 40);
await page.waitForTimeout(300);

// Explorer + Motion workspaces
await page.click('.ws-tab[data-wstab="explore"]');
await page.waitForTimeout(2500);
await shot('09-explorer', 'FX EXPLORER workspace', null);
await page.click('.ws-tab[data-wstab="motion"]');
await page.waitForTimeout(2000);
await shot('10-motion', 'FX MOTION workspace', null);
if (await page.locator('#motionPanel').isVisible().catch(() => false)) await shot('11-motion-panel', 'Motion panel', '#motionPanel');
await page.click('.ws-tab[data-wstab="edit"]');
await page.waitForTimeout(1000);

// ---- measure: every visible control, grouped by class, with its box model
const data = await page.evaluate(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const px = (v) => Math.round(parseFloat(v) * 10) / 10;
  const key = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).filter((c) => !/^(active|on|is-|hover|sel|open|disabled)/.test(c)).slice(0, 2).join('.') : '');
  const region = (el) => el.closest('.topbar') ? 'topbar' : el.closest('#wsTabs') ? 'ws-tabs' : el.closest('#rail') ? 'rail' : el.closest('#stackList,.stack') ? 'stack' : el.closest('#params') ? 'params' : el.closest('#motionPanel') ? 'motion' : el.closest('#explorer') ? 'explorer' : 'other';
  const CONTROL = 'button,input,select,textarea,[role=button],[role=switch],[role=tab],.btn,.inline-btn,.gen-btn,.ui-btn,.rz-btn,.looks-act-btn,.crop-bar-btn,.filter-chip,.rail-btn,.rail-chip,.ws-tab,.menu,.mi,.scrub,.tog-row,.switch,.seg button,.layer,.mr-row,.blend-row,.cc-row';
  const els = [...document.querySelectorAll(CONTROL)].filter(vis);
  const groups = {};
  for (const el of els) {
    const k = key(el), cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const g = (groups[k] ||= { key: k, regions: new Set(), count: 0, h: new Set(), pad: new Set(), gap: new Set(), fs: new Set(), border: new Set(), margin: new Set() });
    g.count++; g.regions.add(region(el)); g.h.add(Math.round(r.height));
    g.pad.add(`${px(cs.paddingTop)} ${px(cs.paddingRight)} ${px(cs.paddingBottom)} ${px(cs.paddingLeft)}`);
    if (cs.display.includes('flex') || cs.display.includes('grid')) g.gap.add(cs.gap);
    g.fs.add(cs.fontSize); g.border.add(cs.borderTopWidth);
    g.margin.add(`${px(cs.marginTop)} ${px(cs.marginRight)} ${px(cs.marginBottom)} ${px(cs.marginLeft)}`);
  }
  const table = Object.values(groups).map((g) => ({ ...g, regions: [...g.regions].join(' '), h: [...g.h].sort((a, b) => a - b).join(' / '), pad: [...g.pad].join(' | '), gap: [...g.gap].join(' | '), fs: [...g.fs].join(' '), border: [...g.border].join(' '), margin: [...g.margin].filter((m) => m !== '0 0 0 0').join(' | ') })).sort((a, b) => b.count - a.count);

  // containers: panel padding + gaps
  const CONT = ['.topbar', '#wsTabs', '#rail', '.rail-section', '.rail-grid', '.side', '.stack', '#stackList', '#params', '.param-group', '.param-head', '.pg-body', '.roll-group', '.seg', '.looks-filters'];
  const containers = CONT.map((s) => { const el = document.querySelector(s); if (!el || !vis(el)) return null; const cs = getComputedStyle(el); return { sel: s, pad: `${px(cs.paddingTop)} ${px(cs.paddingRight)} ${px(cs.paddingBottom)} ${px(cs.paddingLeft)}`, gap: cs.gap, w: Math.round(el.getBoundingClientRect().width) }; }).filter(Boolean);

  // tight spots: neighbouring controls closer than 4px, and clipped text
  const tight = [];
  const ctrls = els.filter((e) => !e.closest('#rail .tip'));
  for (let i = 0; i < ctrls.length; i++) {
    const a = ctrls[i].getBoundingClientRect();
    for (let j = i + 1; j < ctrls.length; j++) {
      if (ctrls[i].contains(ctrls[j]) || ctrls[j].contains(ctrls[i])) continue;
      const b = ctrls[j].getBoundingClientRect();
      const vOverlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 4;
      const hOverlap = Math.min(a.right, b.right) - Math.max(a.left, b.left) > 4;
      let d = null;
      if (vOverlap) d = Math.max(b.left - a.right, a.left - b.right);
      else if (hOverlap) d = Math.max(b.top - a.bottom, a.top - b.bottom);
      if (d !== null && d >= 0 && d < 4) tight.push({ a: key(ctrls[i]), b: key(ctrls[j]), gap: Math.round(d * 10) / 10, where: region(ctrls[i]), text: (ctrls[i].textContent || '').trim().slice(0, 24) + ' | ' + (ctrls[j].textContent || '').trim().slice(0, 24) });
    }
  }
  const clipped = [...document.querySelectorAll('body *')].filter(vis).filter((el) => el.children.length === 0 && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0 && getComputedStyle(el).overflow !== 'visible').map((el) => ({ el: key(el), where: region(el), text: el.textContent.trim().slice(0, 40), shown: el.clientWidth, needs: el.scrollWidth }));

  // summarise tight pairs by class pair
  const tp = {};
  for (const t of tight) { const k = `${t.where} · ${t.a} ↔ ${t.b} · ${t.gap}px`; (tp[k] ||= { ...t, n: 0 }).n++; }
  return { table, containers, tight: Object.values(tp).sort((a, b) => a.gap - b.gap || b.n - a.n), clipped: clipped.slice(0, 60) };
});

writeFileSync(OUT + 'baseline.json', JSON.stringify({ version, url: URL_, viewport: `${VW}x${VH} @2x`, captured: new Date().toISOString(), shots, ...data }, null, 2));
console.log(`version ${version}: ${shots.length} shots, ${data.table.length} control classes, ${data.tight.length} tight pairs, ${data.clipped.length} clipped`);
await browser.close();
