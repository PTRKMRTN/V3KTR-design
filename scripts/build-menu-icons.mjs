// icons/menu-icons.js is the source. This writes icons/menu-icons.json (for apps that can't import ESM, e.g. a
// single-file build) and icons/menu-icons.html (a contact sheet at 14px and 42px, for review).
//   node scripts/build-menu-icons.mjs
import { writeFileSync } from 'node:fs';
import { MENU_ICONS, menuIconSvg } from '../icons/menu-icons.js';
const out = (f) => new URL('../icons/' + f, import.meta.url);
writeFileSync(out('menu-icons.json'), JSON.stringify({ grid: 24, stroke: 1.4, size: 14, icons: MENU_ICONS }, null, 2) + '\n');
const cell = (n) => `<div class="c"><span class="s">${menuIconSvg(n, 14)}</span><span class="l">${menuIconSvg(n, 42)}</span><code>${n}</code></div>`;
writeFileSync(out('menu-icons.html'), `<!doctype html><meta charset="utf-8"><title>V3KTR menu icons</title>
<style>body{margin:0;padding:24px;background:#212121;color:#cfcfcf;font:11px "JetBrains Mono",monospace}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:14px}.c{display:flex;flex-direction:column;gap:8px;padding:10px;background:#2a2a2a}.s{color:#8a8a8a}.l{color:#f4f4f4}</style>
<div class="g">${Object.keys(MENU_ICONS).map(cell).join('')}</div>
`);
console.log(`icons/menu-icons.json + menu-icons.html: ${Object.keys(MENU_ICONS).length} icons`);
