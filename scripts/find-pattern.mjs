// Look up the design system before building any UI element.   node scripts/find-pattern.mjs <word> [word...]
// Searches the shared classes (app/*.css, site/site.css), their comments, AGENTS.md, the icon sets and the docs, and prints
// every hit with its file and line. No hit for a thing you are about to build means the system has no pattern for it:
// STOP and ask Patrick (AskUserQuestion) before inventing one. See AGENTS.md "Before you build any UI".
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const words = process.argv.slice(2).map((w) => w.toLowerCase());
if (!words.length) { console.log('usage: node scripts/find-pattern.mjs <word> [word...]   e.g. tile, dice, toggle, scrollbar, menu'); process.exit(1); }
const files = [];
const walk = (d) => { for (const n of readdirSync(root + d)) { const p = d + n; const s = statSync(root + p); if (s.isDirectory()) { if (!['node_modules', 'dist', '.git', 'baselines', 'specimen', 'fonts', 'brand'].includes(n)) walk(p + '/'); } else if (/\.(css|js|md)$/.test(n) || n === 'AGENTS.md') files.push(p); } };
walk('');
let hits = 0;
for (const f of files) {
  const lines = readFileSync(root + f, 'utf8').split(/\r?\n/);
  lines.forEach((l, i) => { const low = l.toLowerCase(); if (words.every((w) => low.includes(w))) { hits++; if (hits <= 60) console.log(`${f}:${i + 1}  ${l.trim().slice(0, 150)}`); } });
}
console.log(hits ? `\n${hits} hit(s)${hits > 60 ? ' (first 60 shown)' : ''}. Read the rule in AGENTS.md before using a class.` : `\nNO HIT for "${words.join(' ')}". The system has no pattern for this: ask Patrick before building one.`);
