// icons/style-icons.js is the source. This writes icons/style-icons.json (for apps that can't import ESM) and
// icons/style-icons.html (a contact sheet at 14px and 42px, for review).
//   node scripts/build-style-icons.mjs
import { writeFileSync } from 'node:fs';
import { STYLE_ICONS, styleIconSvg } from '../icons/style-icons.js';
const LABEL = { musicvideo: 'Music video', trailer: 'Trailer', carfilm: 'Car film', dream: 'Dream', montage: 'Montage', hypereel: 'Hype reel', slowcinema: 'Slow cinema', nightdrive: 'Night drive' };
const out = (f) => new URL('../icons/' + f, import.meta.url);
writeFileSync(out('style-icons.json'), JSON.stringify({ grid: 24, stroke: 1.4, size: 14, icons: STYLE_ICONS, labels: LABEL }, null, 2) + '\n');
const cell = (n) => `<div class="c"><span class="s">${styleIconSvg(n, 14)}</span><span class="l">${styleIconSvg(n, 42)}</span><code>${LABEL[n]}</code></div>`;
writeFileSync(out('style-icons.html'), `<!doctype html><meta charset="utf-8"><title>V3KTR Style icons</title>
<style>body{margin:0;padding:24px;background:#212121;color:#cfcfcf;font:11px "JetBrains Mono",monospace}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:14px}.c{display:flex;flex-direction:column;gap:8px;padding:10px;background:#2a2a2a}.s{color:#8a8a8a}.l{color:#f4f4f4}</style>
<div class="g">${Object.keys(STYLE_ICONS).map(cell).join('')}</div>
`);
console.log(`icons/style-icons.json + style-icons.html: ${Object.keys(STYLE_ICONS).length} icons`);
