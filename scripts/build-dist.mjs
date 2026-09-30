// One file per consumer, so each surface pulls a single URL at build time:
//   dist/app.css  = core + app themes + app layer   (PROCESSOR, KOMPOSITOR, DIMENSOR)
//   dist/site.css = core + app themes + site layer  (v3ktr.com)
// Run: node scripts/build-dist.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const r = (p) => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
for (const [out, layer] of [['app', 'app/app.css'], ['site', 'site/site.css']]) {
  writeFileSync(new URL(`../dist/${out}.css`, import.meta.url), `${r('tokens.css')}\n${r('themes/themes.css')}\n${r(layer)}`);
  console.log(`dist/${out}.css`);
}
