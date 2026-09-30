// Builds baselines/processor/index.html: the "before" sheet for Patrick's PROCESSOR spacing pass.
// Reads baseline.json (from processor-baseline.mjs) and spacing-playground.js. Run:
//   node scripts/build-baseline-sheet.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const dir = new URL('../baselines/processor/', import.meta.url);
const d = JSON.parse(readFileSync(new URL('baseline.json', dir), 'utf8'));
const playground = readFileSync(new URL('spacing-playground.js', dir), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The rules that set PROCESSOR's spacing today, read from its CSS (v0.570.0). Grouped by where you see them.
const RULES = [
  ['Layout', [
    ['Panel padding', '--pad', '12px', 'Used by the stack list and every parameter section. One number moves both.'],
    ['Side panel width', '--side-w', '332px', 'Wider side = smaller canvas.'],
    ['Rail width', '--rail-w', '128px', '3 columns of square icon tiles. Widening makes tiles bigger; it does not add columns.'],
    ['Top bar / tabs / status rows', '.app grid rows', '36 / 40 / 1fr / 22px', ''],
  ]],
  ['Buttons', [
    ['Regular button', '.inline-btn, .ui-btn', 'padding 5 10 · 11px', 'The workhorse: RESET, RANDOMISE, stack actions.'],
    ['Option button (chips in params)', '.seg button', 'padding 5 10 · 11px · gap 4', 'Dither palettes, modes. Wrap onto several rows.'],
    ['Large button', '.gen-btn', 'padding 8 14', ''],
    ['Small button', '.inline-btn.sm', 'padding 3 7 · 9px', '+ MASK on layers.'],
    ['Toggle (latched)', '.inline-btn.tog', 'padding 5 10 · 1px outline', '+FEATURES, +BLENDS. Gets the 2px outline.'],
    ['Group filter chip', '.filter-chip / .rail-chip', 'padding 3 5 · 8px · 1px outline', 'ALL / ADJUST … on the rail.'],
  ]],
  ['Parameter panel', [
    ['Effect title', '.param-title', 'padding 12 12 8', ''],
    ['Section', '.param-section', 'padding 2 12 10', 'FX BLEND, FX PARAMETERS.'],
    ['Section head', '.sec-label', '10px · margin 11 0 7', ''],
    ['Slider row', '.scrub', 'height 28 · margin 5 0', ''],
    ['Toggle / blend row', '.tog-row, .blend-row', 'height 28 · margin 3 0 · padding 0 9', ''],
    ['Option group', '.seg', 'gap 4 · margin 10 0', ''],
    ['Randomise group', '.roll-group', 'padding 3 · gap 0', 'Buttons touch each other by design.'],
  ]],
  ['Stack', [
    ['Stack list', '.stack-list', 'padding 2 12 4', ''],
    ['Layer row', '.layer', 'padding 7 8 · gap 8 · margin 2 0', 'Height 46.'],
  ]],
  ['Top bar', [
    ['Menu item', '.menu', 'padding 4 9 · 12.5px', ''],
    ['Top bar', '.topbar', 'padding 0 12 · gap 2', ''],
    ['Workspace tabs', '.ws-tabs', 'gap 22 · 13px', ''],
  ]],
];

// Where things sit tightest (measured), with what each means for the pass.
const TIGHT = [
  ['0px', 'RANDOMISE ↔ +FEATURES', 'Parameter panel', 'A joined group (.roll-group), intentional. With 2px outlines the toggles\' outline will sit hard against RANDOMISE; give the group a gap of 2–4px.'],
  ['1px', 'Rail icon tiles', 'Rail', 'The icon grid has a 1px gap on purpose (126 pairs). The rail is 128px for exactly 3 columns: padding added inside the rail shrinks every tile.'],
  ['1px', 'fit · orig · controls · auto', 'Canvas controls bar', 'The four canvas controls nearly touch. Easy to space; nothing else depends on them.'],
  ['2px', 'Slider ↔ motion dot', 'Parameter panel', 'The animate dot beside each slider. Wider panel padding squeezes the slider, not the dot.'],
  ['2px', 'Layer ↔ layer', 'Stack', '2px margin between layers. More spacing here shows fewer layers before the stack scrolls.'],
  ['2px', 'File ↔ Edit ↔ …', 'Top bar', 'Spacing comes from the menu items\' own padding.'],
  ['3px', 'Rail group chips', 'Rail', 'ALL / ADJUST / … wrap in pairs inside 116px. Wider chips drop to one per row.'],
  ['3px', 'Slider ↔ slider ↔ toggle row', 'Parameter panel', 'Rows are 5px (sliders) and 3px (toggles) apart; the playground sets both together.'],
];

const shots = d.shots.map((s) => `<figure class="shot${/app|explorer|motion$/.test(s.name) && !/panel/.test(s.name) ? ' wide' : ''}"><a href="${s.file}" target="_blank" rel="noopener"><img src="${s.file}" alt="${esc(s.what)}" loading="lazy"></a><figcaption>${esc(s.what)}</figcaption></figure>`).join('');
const rules = RULES.map(([g, rows]) => `<tr class="grp"><th colspan="4">${g}</th></tr>` + rows.map(([n, sel, v, note]) => `<tr><td>${n}</td><td><code>${esc(sel)}</code></td><td class="num">${esc(v)}</td><td class="note">${esc(note)}</td></tr>`).join('')).join('');
const measured = d.table.filter((r) => r.count > 0).map((r) => `<tr><td><code>${esc(r.key)}</code></td><td>${esc(r.regions)}</td><td class="num">${r.count}</td><td class="num">${esc(r.h)}</td><td class="num">${esc(r.pad)}</td><td class="num">${esc(r.fs)}</td></tr>`).join('');
const tight = TIGHT.map(([g, what, where, note]) => `<tr><td class="num gap">${g}</td><td>${esc(what)}</td><td>${esc(where)}</td><td class="note">${esc(note)}</td></tr>`).join('');

const html = `<title>PROCESSOR Spacing Baseline</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Manrope:wght@400;600;800&display=swap">
<style>
:root{color-scheme:dark;--bg:#212121;--p:#2b2b2b;--p2:#3a3a3a;--t0:#f4f4f4;--t1:#cfcfcf;--t2:#8a8a8a;--a:#00e5a0;--ink:#1c1c1c}
html,body{background:var(--bg);color:var(--t1)}
body{margin:0;padding-inline:16px;font:14px/1.55 Manrope,system-ui,sans-serif}
.w{max-width:1240px;margin:0 auto;padding-block:32px 72px}
h1{font:800 28px/1.15 Manrope,sans-serif;color:var(--t0);margin:0 0 8px;text-wrap:balance}
.meta{font:12px 'JetBrains Mono',monospace;color:var(--t2);margin:0 0 20px}
.meta b{color:var(--a);font-weight:600}
p{max-width:72ch;margin:0 0 12px}
h2{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase;color:var(--t0);margin:44px 0 6px}
h2+p{color:var(--t2)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px;margin:18px 0 0}
.steps div{background:var(--p);padding:14px}
.steps b{display:block;font:700 11px 'JetBrains Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--a);margin-bottom:4px}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;align-items:start}
.shot{margin:0;background:var(--p)}.shot.wide{grid-column:1/-1}
.shot img{display:block;width:100%;height:auto}
.shot figcaption{font:11px 'JetBrains Mono',monospace;color:var(--t2);padding:8px 10px}
.tw{overflow-x:auto}
table{border-collapse:collapse;width:100%;min-width:720px;font-size:13px}
th,td{text-align:left;padding:7px 12px 7px 0;border-bottom:1px solid var(--p);vertical-align:top}
thead th{font:600 11px 'JetBrains Mono',monospace;color:var(--t2);text-transform:uppercase;letter-spacing:.08em}
tr.grp th{font:700 11px 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--a);padding-top:18px}
td.num,code{font:12px 'JetBrains Mono',monospace;font-variant-numeric:tabular-nums;color:var(--t0)}
code{color:var(--t1)}
td.note{color:var(--t2)}
td.gap{color:var(--a);font-weight:700}
.code{position:relative;background:#161616;border:1px solid var(--p2)}
.code pre{margin:0;padding:14px;max-height:280px;overflow:auto;font:11.5px/1.5 'JetBrains Mono',monospace;color:var(--t1)}
.copy{position:absolute;top:8px;right:8px;font:700 11px 'JetBrains Mono',monospace;text-transform:uppercase;background:var(--a);color:var(--ink);border:0;padding:6px 10px;cursor:pointer}
.copy:focus-visible{outline:2px solid var(--t0);outline-offset:2px}
.src{font:11px 'JetBrains Mono',monospace;color:var(--t2);margin-top:40px}
</style>
<div class="w">
  <h1>PROCESSOR spacing baseline</h1>
  <p class="meta">Before the spacing pass · <b>${esc(d.version)}</b> · window ${esc(d.viewport)} · captured ${esc(d.captured.slice(0, 10))}</p>
  <p>This is PROCESSOR as it is today, before your spacing pass: what it looks like, the numbers that set its spacing, and where it's tightest. The playground lets you move those numbers live in DevTools and copy back what you settle on.</p>
  <div class="steps">
    <div><b>1 · Look</b>The screenshots are the "before". Click one for full size.</div>
    <div><b>2 · Play</b>Paste the playground into the DevTools console on PROCESSOR. Sliders start at today's values.</div>
    <div><b>3 · Keep</b>Hit Copy on the panel and paste the list back to Claude. That becomes the spacing change, and the new app standard.</div>
  </div>

  <h2>Spacing playground</h2>
  <p>Paste into the console (F12 → Console) on processor.v3ktr.com or a local copy. It only changes what you see in that tab; reload to clear. Slider positions are remembered in your browser, and Reset puts them back. The checkbox turns on the new 2px outlines for toggles and chips.</p>
  <div class="code"><button class="copy" type="button" id="cp">Copy snippet</button><pre id="snip">${esc(playground)}</pre></div>

  <h2>Before: screenshots</h2>
  <p>Sample image, three effects in the stack. Panels at 2× resolution.</p>
  <div class="gal">${shots}</div>

  <h2>Where it's tightest</h2>
  <p>Neighbouring controls closer than 4px, measured in the browser, and what each means for the pass. Nothing is cut off: no text in the UI is currently truncated.</p>
  <div class="tw"><table><thead><tr><th>Gap</th><th>Between</th><th>Where</th><th>What it means</th></tr></thead><tbody>${tight}</tbody></table></div>

  <h2>The numbers that set the spacing</h2>
  <p>From PROCESSOR's CSS. Padding is top right bottom left, in px.</p>
  <div class="tw"><table><thead><tr><th>What</th><th>Rule</th><th>Today</th><th>Note</th></tr></thead><tbody>${rules}</tbody></table></div>

  <h2>Measured controls</h2>
  <p>Every visible control, grouped by class, as the browser draws it (sample image, three effects, Edit workspace).</p>
  <div class="tw"><table><thead><tr><th>Class</th><th>Where</th><th>Count</th><th>Height</th><th>Padding</th><th>Font</th></tr></thead><tbody>${measured}</tbody></table></div>

  <p class="src">Built from PTRKMRTN/V3KTR-design · baselines/processor · scripts/processor-baseline.mjs captures, scripts/build-baseline-sheet.mjs builds this page.</p>
</div>
<script>
document.getElementById('cp').addEventListener('click', function () {
  var b = this, t = document.getElementById('snip').textContent;
  var done = function (m) { b.textContent = m; setTimeout(function () { b.textContent = 'Copy snippet'; }, 1600); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(t).then(function () { done('Copied'); }, function () { sel(); done('Selected: Ctrl+C'); });
  } else { sel(); done('Selected: Ctrl+C'); }
  function sel() { var r = document.createRange(); r.selectNodeContents(document.getElementById('snip')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
});
</script>
`;
writeFileSync(new URL('index.html', dir), html);
console.log('baselines/processor/index.html', d.version, d.shots.length, 'shots');
