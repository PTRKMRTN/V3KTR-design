// One file per consumer, so each surface pulls a single URL at build time:
//   dist/app.css  = core + app themes + app layer   (PROCESSOR, KOMPOSITOR, DIMENSOR)
//   dist/site.css = core + app themes + site layer  (v3ktr.com)
// Run: node scripts/build-dist.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const r = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
for (const [out, layers] of [['app', ['app/app.css', 'app/help.css', 'app/link.css']], ['site', ['site/site.css']]]) {
  writeFileSync(new URL(`../dist/${out}.css`, import.meta.url), [r('tokens.css'), r('themes/themes.css'), ...layers.map(r)].join('\n'));
  console.log(`dist/${out}.css`);
}
