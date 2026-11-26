// Duplicate-drawing check for icon sets (v0.41.135, asked for by the QA reviewer after INCEPTOR batch 1: `polygon` had become the same drawing as INCEPTOR's `iso`).
// Renders every icon at 14px (the rail and menu size), blurs it a little, and reports pairs that look alike.
//   node scripts/check-icon-dupes.mjs [--against <path to an app's icons.js with `key: 'path d'` entries>] [--threshold 0.80] [--only inceptor]
// Compared: icons/inceptor-icons.js against itself, against icons/menu-icons.js, and (with --against) against the app's own one-path drawings
// (an app icon with the SAME key is skipped: the redraw replaces it). Exits 1 when a pair is at or over the threshold. Needs playwright from a sibling checkout.
//   --shared fav,faved   (v0.41.158) also compare these NEW shared (menu) icons against every other shared drawing, not only INCEPTOR's against the rest
//   --control            (v0.41.158) negative control: plants a copy of `lock` as an INCEPTOR icon and a copy of `eye` as a new shared icon; the run must FAIL on both (exit 0 only if it does, 2 if the checker is blind)
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const root = new URL('../', import.meta.url);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const THRESH = parseFloat(arg('threshold', '0.80'));
const against = arg('against', '');
const SHARED_NEW = new Set(arg('shared', '').split(',').filter(Boolean));
const CONTROL = process.argv.includes('--control');
const { chromium } = (() => {
  for (const base of ['E:/00 CLAUDE APPS/', 'D:/00 CLAUDE APPS/']) for (const repo of ['V3KTR-kompositor', 'V3KTR-PROCESSOR']) {
    try { return createRequire(base + repo + '/package.json')('playwright'); } catch {}
  }
  throw new Error('playwright not found in any sibling checkout');
})();
const { INCEPTOR_ICONS } = await import(new URL('icons/inceptor-icons.js', root).href);
const { MENU_ICONS } = await import(new URL('icons/menu-icons.js', root).href);
const sets = { inceptor: { ...INCEPTOR_ICONS }, menu: { ...MENU_ICONS } };
if (CONTROL) { sets.inceptor.ctlLockCopy = MENU_ICONS.lock; sets.menu.ctlEyeCopy = MENU_ICONS.eye; SHARED_NEW.add('ctlEyeCopy'); }
if (against) {
  const app = {};
  for (const m of readFileSync(against, 'utf8').matchAll(/([A-Za-z0-9]+): '([^']*)'/g)) if (/^M/.test(m[2])) app[m[1]] = `<path d="${m[2]}"/>`;
  sets.app = app;
}
const icons = [];
for (const [set, o] of Object.entries(sets)) for (const [k, body] of Object.entries(o)) icons.push({ set, k, body });

const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage();
const sims = await p.evaluate(async ([icons, sharedNew]) => {
  const S = 42;   // 14px at 3x
  const vec = async (body) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${S}" height="${S}" fill="none" stroke="#000" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" color="#000">${body}</svg>`;
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const a = x.getImageData(0, 0, S, S).data, v = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) v[i] = a[i * 4 + 3] / 255;
    // 3x3 box blur (a one-pixel shift should not make two drawings "different"), then mean-centred: the score is a Pearson correlation of the two ink maps,
    // so two drawings that merely fill the same square do not score high
    const o = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) { let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, x2 = xx + dx; if (yy >= 0 && yy < S && x2 >= 0 && x2 < S) s += v[yy * S + x2]; } o[y * S + xx] = s; }
    let mean = 0; for (const t of o) mean += t; mean /= o.length;
    let n = 0; for (let i = 0; i < o.length; i++) { o[i] -= mean; n += o[i] * o[i]; } n = Math.sqrt(n) || 1;
    return o.map((t) => t / n);
  };
  const V = []; for (const ic of icons) V.push(await vec(ic.body));
  const out = [];
  for (let i = 0; i < icons.length; i++) {
    if (icons[i].set === 'menu' && sharedNew.includes(icons[i].k)) {   // a new shared icon against every OTHER shared drawing (each pair once)
      for (let j = 0; j < icons.length; j++) { if (i === j || icons[j].set !== 'menu') continue; if (sharedNew.includes(icons[j].k) && j < i) continue;
        let d = 0; for (let t = 0; t < V[i].length; t++) d += V[i][t] * V[j][t];
        out.push([icons[i].k, 'menu:' + icons[j].k, +d.toFixed(3)]); }
      continue; }
    if (icons[i].set !== 'inceptor') continue;
    for (let j = 0; j < icons.length; j++) { if (i === j) continue;
      if (icons[j].set === 'inceptor' && j < i) continue;                           // each in-set pair once
      if (icons[j].set === 'app' && icons[j].k === icons[i].k) continue;            // the drawing it replaces
      let d = 0; for (let t = 0; t < V[i].length; t++) d += V[i][t] * V[j][t];
      out.push([icons[i].k, icons[j].set + ':' + icons[j].k, +d.toFixed(3)]);
    } }
  return out.sort((a, c) => c[2] - a[2]);
}, [icons, [...SHARED_NEW]]);
await b.close();
// Policy. Inside the set: a pair at or over the threshold fails. Against the shared menu set: fails at 0.90 unless it is the SAME VERB drawn the same on purpose.
// Against an app's own drawings that are not redrawn yet: listed as a warning (they are settled when their batch is drawn, and then count as "inside the set").
// done~menu:done: the shared Done check is deliberately one drawing in every app (MENU_ICONS.done, v0.41.147), so INCEPTOR's `done` is the same verb on purpose.
const SAME_VERB = new Set(['done~menu:done', 'select~menu:cursor', 'zoom~menu:zoom', 'zoom~menu:zoomin', 'zoom~menu:zoomout', 'fit~menu:frame', 'efTrans~menu:move', 'efTrans~menu:pan',
  // v0.41.157: eyedrop was PROMOTED to the shared set (same drawing, same name: the shared one takes over); star (the shape tool) and fav (the favourite) are both a star and never sit in one control group
  'eyedrop~menu:eyedrop', 'star~menu:fav', 'star~menu:faved',
  // fav (off) and faved (on) are the same star, outline and solid
  'fav~menu:faved']);
const MENU_FAIL = 0.90;
const fails = [], warns = [];
for (const [a, c, d] of sims) {
  const key = a + '~' + c;
  if (c.startsWith('inceptor:')) { if (d >= THRESH) fails.push([a, c, d]); }
  else if (c.startsWith('menu:')) { if (d >= MENU_FAIL && !SAME_VERB.has(key)) fails.push([a, c, d]); else if (d >= THRESH && !SAME_VERB.has(key)) warns.push([a, c, d]); }
  else if (d >= THRESH) warns.push([a, c, d]);
}
console.log(`icon dupes: ${icons.filter((i) => i.set === 'inceptor').length} INCEPTOR icons against ${icons.length - 1} drawings; inside the set fails at ${THRESH}, against the menu set at ${MENU_FAIL}${SHARED_NEW.size ? `; new shared icons also checked against the other shared drawings: ${[...SHARED_NEW].join(', ')}` : ''}${CONTROL ? '  [NEGATIVE CONTROL RUN]' : ''}`);
for (const [a, c, d] of fails) console.log(`  FAIL ${d.toFixed(3)}  ${a}  ~  ${c}`);
for (const [a, c, d] of warns) console.log(`  look ${d.toFixed(3)}  ${a}  ~  ${c}`);
if (CONTROL) {
  const hitLock = fails.some(([a, c]) => a === 'ctlLockCopy' && c === 'menu:lock'), hitEye = fails.some(([a, c]) => a === 'ctlEyeCopy' && c === 'menu:eye');
  console.log(hitLock && hitEye ? 'CONTROL OK: the planted copy of lock (as an INCEPTOR icon) and the planted copy of eye (as a new shared icon) both FAIL, so the checker can see a duplicate' : `CONTROL FAILED: the checker missed a planted duplicate (lock copy: ${hitLock}, eye copy: ${hitEye})`);
  process.exit(hitLock && hitEye ? 0 : 2);
}
if (fails.length) { console.error(`${fails.length} duplicate pair(s)`); process.exit(1); }
console.log(`no duplicate pairs (${warns.length} to look at)`);
