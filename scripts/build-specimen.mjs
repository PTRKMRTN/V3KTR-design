// Builds specimen/index.html — one page showing the whole system — from the repo's own files:
// tokens.css (core), app/app.css + app/specimen.html, site/site.css + site/specimen.html.
// The page renders the REAL layer CSS, so what you see is what an app gets. Run:
//   node scripts/build-specimen.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => (existsSync(new URL(p, root)) ? readFileSync(new URL(p, root), 'utf8') : '');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const core = read('tokens.css');
const version = core.match(/v(\d+\.\d+\.\d+)/)[1];

// ---- Core tokens, grouped by the /* Heading — … */ comments in tokens.css
const groups = [];
let cur = null;
for (const line of core.split('\n')) {
  const h = line.match(/^\s*\/\*\s*([A-Z][^—(*]*?)\s*(?:[—(]|\*\/)/);
  if (h && !line.includes('Source of truth')) { cur = { name: h[1].trim(), tokens: [] }; groups.push(cur); continue; }
  for (const m of line.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) cur?.tokens.push([m[1], m[2].trim()]);
}

// WCAG contrast, for colour tokens against the ground
const hex = (v) => (/^#[0-9a-f]{6}$/i.test(v) ? v : null);
const lum = (h) => {
  const c = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

const isColour = (v) => /^#|^rgba?\(/.test(v);
const tokenCard = ([n, v]) => {
  if (isColour(v)) {
    const r = hex(v) ? ratio(v, '#212121') : null;
    return `<div class="tk"><div class="tk-sw" style="background:var(--${n})"></div><div class="tk-n">--${n}</div><div class="tk-v">${esc(v)}${r ? ` · ${r.toFixed(1)}:1` : ''}</div></div>`;
  }
  return `<div class="tk tk-plain"><div class="tk-n">--${n}</div><div class="tk-v">${esc(v)}</div></div>`;
};
const coreHtml = groups.map((g) => `<div class="spec-group"><div class="spec-caption">${esc(g.name)}</div><div class="tk-grid">${g.tokens.map(tokenCard).join('')}</div></div>`).join('');

const typeHtml = `
<div class="spec-group"><div class="spec-caption">Type in use</div>
  <div class="ty"><span class="ty-l">Manrope 800 · display</span><span style="font:800 40px/1.1 var(--sans);color:var(--tx-0)">Effects that see depth.</span></div>
  <div class="ty"><span class="ty-l">Manrope 13 · body</span><span style="font:400 var(--fs-body)/1.5 var(--sans);color:var(--tx-1)">Reads depth out of a flat photo, so effects work inside the picture, not just on top.</span></div>
  <div class="ty"><span class="ty-l">Mono 11 · controls</span><span style="font:500 var(--fs-ctrl) var(--mono);text-transform:uppercase;color:var(--tx-0)">Depth 0.62 · Bleed 0.40 · Randomise</span></div>
  <div class="ty"><span class="ty-l">Section head 11/700/.16em</span><span style="font:var(--head-weight) var(--fs-ctrl) var(--mono);letter-spacing:var(--head-track);text-transform:uppercase;color:var(--tx-2)">Adjust</span></div>
</div>`;

const layer = (id, title, blurb, css, frag) => `
<section class="tab-panel" id="p-${id}" data-tab="${id}" ${id === 'core' ? '' : 'hidden'}>
  <p class="lede">${blurb}</p>
  ${frag || `<p class="empty">Not extracted yet.</p>`}
</section>`;

const appCss = read('app/app.css');
const siteCss = read('site/site.css');

const html = `<title>V3KTR Design</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
/* ===== core: tokens.css v${version} ===== */
${core}
/* ===== app layer ===== */
${appCss}
/* ===== site layer ===== */
${siteCss}
/* ===== specimen page shell (not part of the system) ===== */
:root{color-scheme:dark}
html,body{background:var(--bg-0);color:var(--tx-1)}
body{font:var(--fs-body)/1.5 var(--sans);margin:0;padding-inline:16px}
.shell{max-width:1200px;margin:0 auto;padding-block:28px 64px}
.top{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 20px;margin-bottom:6px}
.top h1{font:800 22px/1.2 var(--sans);color:var(--tx-0);margin:0}
.top .ver{font:500 11px var(--mono);color:var(--accent)}
.intro{max-width:68ch;color:var(--tx-2);margin:0 0 20px}
.tabs{display:flex;gap:4px;flex-wrap:wrap;position:sticky;top:env(safe-area-inset-top,0px);background:var(--bg-0);padding-block:10px;z-index:5;border-bottom:1px solid var(--bg-2);margin-bottom:24px}
.tabs button{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.08em;background:var(--bg-3);color:var(--tx-1);border:0;border-radius:var(--radius);height:28px;padding:0 12px;cursor:pointer}
.tabs button[aria-selected=true]{background:var(--accent);color:var(--on-accent)}
.tabs button:hover{background:var(--hover);color:var(--on-accent)}
.tabs button:focus-visible{outline:var(--focus-ring);outline-offset:var(--focus-offset)}
.lede{max-width:68ch;margin:0 0 24px;color:var(--tx-1)}
.empty{color:var(--tx-2);font:11px var(--mono)}
.spec-group{margin:0 0 32px}
.spec-caption{font:700 11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--tx-2);margin:0 0 12px}
.spec-row{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:0 0 12px}
.tk-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.tk{background:var(--bg-2);border-radius:var(--radius);overflow:hidden}
.tk-sw{height:56px}
.tk-n{font:600 11px var(--mono);color:var(--tx-0);padding:8px 10px 0;word-break:break-all}
.tk-v{font:11px var(--mono);color:var(--tx-2);padding:2px 10px 10px;font-variant-numeric:tabular-nums}
.tk-plain .tk-n{padding-top:10px}
.ty{display:grid;grid-template-columns:180px 1fr;gap:16px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--bg-2)}
.ty-l{font:11px var(--mono);color:var(--tx-2)}
@media (max-width:600px){.ty{grid-template-columns:1fr;gap:4px}}
.model{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:0 0 28px}
.model div{background:var(--bg-2);border-radius:var(--radius);padding:14px}
.model b{display:block;font:700 11px var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.model p{margin:0;color:var(--tx-1)}
.src{font:11px var(--mono);color:var(--tx-2)}
</style>
<div class="shell">
  <div class="top"><h1>V3KTR Design</h1><span class="ver">v${version}</span><span class="src">PTRKMRTN/V3KTR-design</span></div>
  <p class="intro">Every token and component, rendered from the repo's own CSS. Built by <code>scripts/build-specimen.mjs</code>; if an app looks different from this page, the app has drifted.</p>
  <div class="tabs" role="tablist">
    <button role="tab" id="t-core" data-t="core" aria-selected="true">Core</button>
    <button role="tab" id="t-app" data-t="app" aria-selected="false">App layer</button>
    <button role="tab" id="t-site" data-t="site" aria-selected="false">Site layer</button>
  </div>
  <section class="tab-panel" id="p-core" data-tab="core">
    <div class="model">
      <div><b>Core</b><p>Shared by every surface: signal aqua, grounds, text greys, FX-group colours, fonts, radius. Layers can't redefine these.</p></div>
      <div><b>App layer</b><p>Dense tool UI taken from PROCESSOR: buttons, chips, toggles, rows, sliders. Used by PROCESSOR, KOMPOSITOR and DIMENSOR.</p></div>
      <div><b>Site layer</b><p>The website's own scale: display type, gutters, nav, feed cards, article prose. Same core, different shape.</p></div>
    </div>
    ${coreHtml}
    ${typeHtml}
  </section>
  ${layer('app', 'App layer', 'Taken from PROCESSOR. Hover states are forced on with <code>.is-hover</code> so every state is visible at once.', appCss, read('app/specimen.html'))}
  ${layer('site', 'Site layer', 'Taken from site v2 and moved onto the core colours: hover #3dffc2, neutral greys.', siteCss, read('site/specimen.html'))}
</div>
<script>
(function(){
  var btns=[].slice.call(document.querySelectorAll('.tabs button'));
  function show(t){
    btns.forEach(function(b){b.setAttribute('aria-selected',b.dataset.t===t?'true':'false')});
    [].forEach.call(document.querySelectorAll('.tab-panel'),function(p){p.hidden=p.dataset.tab!==t});
  }
  btns.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.t);try{history.replaceState(null,'','#'+b.dataset.t)}catch(e){}})});
  var h=(location.hash||'').slice(1); if(h==='app'||h==='site') show(h);
})();
</script>
`;

mkdirSync(new URL('specimen/', root), { recursive: true });
writeFileSync(new URL('specimen/index.html', root), html);
console.log(`specimen/index.html v${version}: ${groups.length} core groups, app ${appCss ? 'yes' : 'missing'}, site ${siteCss ? 'yes' : 'missing'}`);
