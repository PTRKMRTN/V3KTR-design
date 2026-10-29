// Builds dist/desktop-only.html: the shared "needs a desktop" gate page, one self-contained file (tokens, themes,
// the .vk-btn and .vk-fullpage rules, four woff2 faces and the three brand logos inlined; no network, no app boot).
// App picked by ?app=processor|kompositor|dimensor, else by a <app>.* hostname, else PROCESSOR.
// Run: node scripts/build-desktop-only.mjs   (after build-dist)
import { readFileSync, writeFileSync } from 'node:fs';
const rb = (p) => readFileSync(new URL('../' + p, import.meta.url));
const r = (p) => rb(p).toString('utf8');
const rules = (css, keep) => {
  css = css.replace(/\/\*[\s\S]*?\*\//g, ''); // top-level rules only (no nesting in the slice we keep)
  const out = []; let depth = 0, start = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) { const rule = css.slice(start, i + 1); if (keep(rule.split('{')[0])) out.push(rule.trim()); start = i + 1; }
  }
  return out.join('\n');
};
const slice = rules(r('app/app.css'), (sel) => /\.vk-btn(?![-\w])|\.vk-btn--(primary|lg)|\.vk-fullpage/.test(sel) && !/\.vk-btn--ic|\.vk-seg|\.vk-menu/.test(sel));
const font = (f) => `data:font/woff2;base64,${rb('fonts/' + f).toString('base64')}`;
const faces = [['Manrope', 400, 'manrope-latin-400-normal'], ['Manrope', 700, 'manrope-latin-700-normal'], ['JetBrains Mono', 400, 'jetbrains-mono-latin-400-normal'], ['JetBrains Mono', 500, 'jetbrains-mono-latin-500-normal']]
  .map(([n, w, f]) => `@font-face{font-family:'${n}';font-style:normal;font-weight:${w};font-display:swap;src:url(${font(f + '.woff2')}) format('woff2');}`).join('\n');
const apps = ['processor', 'kompositor', 'dimensor'];
const logos = apps.map((a) => `<div class="vk-fullpage__logo" data-logo="${a}" role="img" aria-label="V3KTR ${a}" hidden>${r(`brand/logo-v3ktr-${a}.svg`).trim()}</div>`).join('\n  ');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>V3KTR needs a desktop</title>
<style>
${faces}
${r('tokens.css')}
${r('themes/themes.css')}
${slice}
html,body{margin:0;background:var(--bg-1);}
</style></head>
<body>
<main class="vk-fullpage" id="app" data-app="processor">
 <div class="vk-fullpage__in">
  ${logos}
  <h1><em id="name">PROCESSOR</em> needs a desktop</h1>
  <p>V3KTR apps run in a desktop browser with WebGPU. They are not available on phones or tablets.</p>
  <ul class="vk-fullpage__list">
   <li><b>Use</b> · the latest desktop Chrome, Edge or Safari</li>
  </ul>
  <p>Open this page on your computer and you are in.</p>
  <div class="vk-fullpage__row">
   <button class="vk-btn vk-btn--primary vk-btn--lg" type="button" id="copy">Copy link</button>
   <small id="url"></small>
  </div>
  <small><a href="https://v3ktr.com">v3ktr.com</a></small>
 </div>
</main>
<script>
(function(){var apps=${JSON.stringify(apps)},q=new URLSearchParams(location.search).get('app');
if(apps.indexOf(q)<0){q=null;for(var i=0;i<apps.length;i++)if(location.hostname.indexOf(apps[i])===0)q=apps[i];}
q=q||'processor';var url='https://'+q+'.v3ktr.com';
var m=document.getElementById('app');m.setAttribute('data-app',q);document.getElementById('name').textContent=q.toUpperCase();
Array.prototype.forEach.call(document.querySelectorAll('[data-logo]'),function(e){e.hidden=e.getAttribute('data-logo')!==q;});
document.getElementById('url').textContent=url.replace('https://','');
var b=document.getElementById('copy');b.onclick=function(){try{navigator.clipboard.writeText(url).then(function(){b.textContent='Copied'},function(){b.textContent=url})}catch(e){b.textContent=url}};})();
</script>
</body></html>
`;
writeFileSync(new URL('../dist/desktop-only.html', import.meta.url), html);
console.log('dist/desktop-only.html', html.length, 'bytes');
