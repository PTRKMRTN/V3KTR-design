// tokens.css is the source; tokens.json is generated from it. Run after any token edit:
//   node scripts/build-json.mjs
import { readFileSync, writeFileSync } from 'node:fs';
const css = readFileSync(new URL('../tokens.css', import.meta.url), 'utf8');
const version = css.match(/v(\d+\.\d+\.\d+)/)[1];
const tokens = {};
for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) tokens[m[1]] = m[2].trim();
writeFileSync(new URL('../tokens.json', import.meta.url), JSON.stringify({ version, tokens }, null, 2) + '\n');
console.log(`tokens.json v${version}: ${Object.keys(tokens).length} tokens`);
