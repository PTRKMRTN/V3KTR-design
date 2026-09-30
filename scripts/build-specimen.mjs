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
const themesCss = read('themes/themes.css');
const themeVars = Object.fromEntries([...themesCss.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const resolve = (v) => { const m = v.trim().match(/^var\(--([a-z0-9-]+)\)$/i); return m ? themeVars[m[1]] : v.trim(); };
const themes = [...themesCss.matchAll(/\[data-app="([a-z-]+)"\]\s*\{([^}]*)\}/g)].map(([, id, body]) => ({ id, accent: resolve(body.match(/--accent:([^;]+);/)[1]), hover: resolve(body.match(/--hover:([^;]+);/)[1]) }));
const clashWith = { danger: '#ff5b5b', 'warn (PROCESSOR #e0a33a)': '#e0a33a', 'warn-2 (#d4823b)': '#d4823b', 'type-rust': '#a85d4e', 'type-rose': '#9d5a6e', 'type-amber': '#b08847', 'type-violet': '#8a6db0', 'type-slate': '#6a7280', 'type-teal': '#5a8a8f', 'type-sage': '#6e8f6a' };
const lab = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047, y = r * 0.2126 + g * 0.7152 + b * 0.0722, z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883; return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]; };
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const themeRows = themes.map((t) => {
  const g = ratio(t.accent, '#212121'), ink = ratio('#1c1c1c', t.accent);
  const [nn, nd] = Object.entries(clashWith).map(([k, v]) => [k, dE(t.accent, v)]).sort((a, b) => a[1] - b[1])[0];
  const flag = (ok) => (ok ? '' : ' class="warn"');
  return `<tr><td><span class="th-sw" style="background:${t.accent}"></span>${t.id.replace("-", " · ").toUpperCase()}</td><td>${t.accent}</td><td${flag(g >= 4.5)}>${g.toFixed(2)}:1</td><td${flag(ink >= 4.5)}>${ink.toFixed(2)}:1</td><td${flag(nd >= 25)}>--${nn} · ΔE ${nd.toFixed(0)}</td></tr>`;
}).join('');
const themeHtml = `<div class="spec-group"><div class="spec-caption">App themes · locked 2026-09-30</div>
  <div class="spec-row th-pick" role="group" aria-label="App theme">${themes.map((t, i) => `<button type="button" data-app-pick="${t.id}" aria-pressed="${i === 0}">${t.id.replace("-", " · ")}</button>`).join('')}</div>
  <div class="th-wrap"><table class="th-t"><thead><tr><th>App</th><th>Accent</th><th>On ground</th><th>Dark ink on it</th><th>Nearest other colour</th></tr></thead><tbody>${themeRows}</tbody></table></div>
  <p class="th-note">Red cells: under 4.5:1 for small text, or under ΔE 25 from a colour it must be told apart from.</p></div>`;
const siteCss = read('site/site.css');

const html = `<title>V3KTR Design</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap">
<style>
/* ===== core: tokens.css v${version} ===== */
${core}
/* ===== app layer ===== */
${appCss}
/* ===== app themes (exploration) ===== */
${themesCss}
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
.spec-states{display:grid;grid-template-columns:150px repeat(6,minmax(120px,1fr));gap:10px 14px;align-items:center;overflow-x:auto;padding:16px;background:var(--bg-0)}
.spec-states[data-app]{background:var(--bg-2)}
.spec-st-h{font:600 11px var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--tx-2)}
.spec-st-n{font:11px var(--mono);color:var(--tx-2)}
.spec-na{color:var(--bg-4)}
.th-pick button{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.08em;background:var(--bg-3);color:var(--tx-1);border:0;height:28px;padding:0 12px;cursor:pointer}
.th-pick button[aria-pressed=true]{background:var(--tx-0);color:var(--bg-0)}
.th-pick button:focus-visible{outline:2px solid var(--tx-0);outline-offset:2px}
.th-wrap{overflow-x:auto}
.th-t{border-collapse:collapse;font:11px var(--mono);font-variant-numeric:tabular-nums;min-width:560px}
.th-t th,.th-t td{text-align:left;padding:6px 14px 6px 0;border-bottom:1px solid var(--bg-2)}
.th-t th{color:var(--tx-2);font-weight:600}
.th-t td{color:var(--tx-1)}
.th-t td.warn{color:var(--danger)}
.th-sw{display:inline-block;width:10px;height:10px;margin-right:8px;vertical-align:-1px}
.th-note{font:11px var(--mono);color:var(--tx-2);margin:8px 0 0}
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
  ${layer('app', 'App layer', 'Taken from PROCESSOR. Hover states are forced on with <code>.is-hover</code> so every state is visible at once. Switch the theme to see each app&rsquo;s colour on the same controls.', appCss, themeHtml + '<div id="app-themed" data-app="processor">' + read('app/specimen.html') + '</div>')}
  ${layer('site', 'Site layer', 'Taken from site v2. Neutral: white only for links, buttons and active states; text in three greys (headings #b3b3b3, body #a3a3a3, muted #939393). App colour appears only inside [data-app].', siteCss, read('site/specimen.html'))}
</div>
<script>
(function(){
  var btns=[].slice.call(document.querySelectorAll('.tabs button'));
  function show(t){
    btns.forEach(function(b){b.setAttribute('aria-selected',b.dataset.t===t?'true':'false')});
    [].forEach.call(document.querySelectorAll('.tab-panel'),function(p){p.hidden=p.dataset.tab!==t});
  }
  btns.forEach(function(b){b.addEventListener('click',function(){show(b.dataset.t);try{history.replaceState(null,'','#'+b.dataset.t)}catch(e){}})});
  [].forEach.call(document.querySelectorAll('[data-app-pick]'),function(b,_,all){b.addEventListener('click',function(){
    document.getElementById('app-themed').setAttribute('data-app',b.dataset.appPick);
    [].forEach.call(document.querySelectorAll('[data-app-pick]'),function(o){o.setAttribute('aria-pressed',o===b?'true':'false')});
  })});
  var h=(location.hash||'').slice(1); if(h==='app'||h==='site') show(h);
})();
</script>
`;

mkdirSync(new URL('specimen/', root), { recursive: true });
writeFileSync(new URL('specimen/index.html', root), html);
console.log(`specimen/index.html v${version}: ${groups.length} core groups, app ${appCss ? 'yes' : 'missing'}, site ${siteCss ? 'yes' : 'missing'}`);
