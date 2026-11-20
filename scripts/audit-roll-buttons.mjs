// Audit: does every button that rolls or randomises carry the die?   node scripts/audit-roll-buttons.mjs <url> [--wait=ms]
// Opens the running app (or the specimen / a built page) in Edge, finds every visible button whose text says Roll / Randomise / Random / Shuffle
// (Roll scene, Full random, Random hue, Roll to these settings …) and reports the ones with no die: no .vk-roll-rand__dice inside and no automatic
// die (a .vk-roll-rand draws its own since v0.41.174). Exit code 1 when any is missing, so it can sit in an app's own test run.
// It reads the page as it is: open the panels you want checked first (use --wait to give yourself time) or script the clicks around it.
import { createRequire } from 'node:module';
const { chromium } = createRequire('E:/00 CLAUDE APPS/V3KTR-kompositor/package.json')('playwright');
const url = process.argv[2]; const wait = +((process.argv.find((a) => a.startsWith('--wait=')) || '--wait=1500').slice(7));
if (!url) { console.error('usage: node scripts/audit-roll-buttons.mjs <url> [--wait=ms]'); process.exit(2); }
const b = await chromium.launch({ channel: 'msedge' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto(url); await p.waitForTimeout(wait);
const res = await p.evaluate(() => {
  const WORDS = /\b(roll|rolls|random|randomi[sz]e|shuffle)\b/i;
  const seen = [];
  for (const e of document.querySelectorAll('button, [role="button"], .vk-btn')) {
    const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || getComputedStyle(e).visibility === 'hidden') continue;
    if (e.closest('.vk-thumb')) continue;   // a roll RESULT tile (Roll 1 to 6 previews) is not a roll button: the die stays on the Randomise above it
    const text = (e.textContent || '').replace(/\s+/g, ' ').trim(); if (!text || text.length > 40 || !WORDS.test(text)) continue;
    const own = !!e.querySelector('.vk-roll-rand__dice');
    const auto = e.classList.contains('vk-roll-rand') && getComputedStyle(e, '::before').content !== 'none';
    // any other glyph (an svg) that is not the die: a roll button with a different icon is a miss as well
    seen.push({ text, classes: e.className.toString().slice(0, 80), die: own || auto, ownMarkup: own, auto });
  }
  return seen;
});
await b.close();
const miss = res.filter((r) => !r.die);
for (const r of res) console.log((r.die ? 'ok     ' : 'NO DIE ') + JSON.stringify(r.text) + (r.die ? (r.ownMarkup ? '  (die in markup)' : '  (automatic)') : '  classes: ' + r.classes + '  -> add .vk-roll-rand'));
console.log(`${res.length} roll / random buttons seen, ${miss.length} without a die`);
process.exit(miss.length ? 1 : 0);
