// Audit: does every button that rolls or randomises carry the die?   node scripts/audit-roll-buttons.mjs <url> [--wait=ms] [--click=<css>[,<css>…]] [--include=<css>[,<css>…]]
// Opens the running app (or the specimen / a built page) in Edge, finds every visible button whose text says Roll / Randomise / Random / Shuffle
// (Roll scene, Full random, Random hue, Roll to these settings …) and reports the ones with no die: no .vk-roll-rand__dice inside and no automatic
// die (a .vk-roll-rand draws its own since v0.41.174). Exit code 1 when any is missing, so it can sit in an app's own test run.
// A .vk-thumb result tile (Roll 1 to 6 previews) is skipped: it picks a previewed roll, it does not roll.
// The text match cannot see a roll whose label does not say so (PROCESSOR's six Evolve buttons: Colour, Parameters, Modes, Order, Blends, Masks, each a DIRECTED roll of one aspect).
//   --include=<css>  also checks every visible button matching these selectors, whatever its text says (e.g. --include=".evolve button")
//   --click=<css>    clicks these first, in order (open the tab or panel, load a picture), then waits --wait ms; a selector with no match is reported and skipped
// With no picture loaded many panels are empty: click through to the state you want checked.
import { createRequire } from 'node:module';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const arg = (name) => { const a = process.argv.find((x) => x.startsWith('--' + name + '=')); return a ? a.slice(name.length + 3) : ''; };
const url = process.argv[2]; const wait = +(arg('wait') || 1500);
const clicks = arg('click') ? arg('click').split(/,(?![^\[]*\])/).map((s) => s.trim()).filter(Boolean) : [], include = arg('include');
if (!url || url.startsWith('--')) { console.error('usage: node scripts/audit-roll-buttons.mjs <url> [--wait=ms] [--click=<css>,…] [--include=<css>,…]'); process.exit(2); }
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(url); await p.waitForTimeout(wait);
for (const c of clicks) { const el = await p.$(c); if (!el) { console.log('click: no match for ' + c); continue; } try { await el.click({ timeout: 3000 }); await p.waitForTimeout(400); } catch (e) { console.log('click: could not click ' + c); } }
if (clicks.length) await p.waitForTimeout(wait);
const res = await p.evaluate((include) => {
  const WORDS = /\b(roll|rolls|random|randomi[sz]e|shuffle)\b/i;
  const inc = include ? new Set(document.querySelectorAll(include)) : new Set();
  const seen = [];
  for (const e of document.querySelectorAll('button, [role="button"], .vk-btn')) {
    const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || getComputedStyle(e).visibility === 'hidden') continue;
    if (e.closest('.vk-thumb')) continue;   // a roll RESULT tile is not a roll button: the die stays on the Randomise above it
    const text = (e.textContent || '').replace(/\s+/g, ' ').trim();
    const forced = inc.has(e);
    if (!forced && (!text || text.length > 40 || !WORDS.test(text))) continue;
    const own = !!e.querySelector('.vk-roll-rand__dice');
    const auto = e.classList.contains('vk-roll-rand') && getComputedStyle(e, '::before').content !== 'none';
    seen.push({ text: text || '(no text)', classes: e.className.toString().slice(0, 80), die: own || auto, ownMarkup: own, auto, forced });
  }
  return seen;
}, include);
await b.close();
const miss = res.filter((r) => !r.die);
for (const r of res) console.log((r.die ? 'ok     ' : 'NO DIE ') + JSON.stringify(r.text) + (r.forced ? ' [included]' : '') + (r.die ? (r.ownMarkup ? '  (die in markup)' : '  (automatic)') : '  classes: ' + r.classes + '  -> add .vk-roll-rand'));
console.log(`${res.length} roll / random buttons seen, ${miss.length} without a die`);
if (!res.length) console.log('none seen: nothing on this view says Roll / Random; open the panel (--click=) or name the buttons (--include=)');
process.exit(miss.length ? 1 : 0);
