// Publish the specimen to design.v3ktr.com (key-locked; deploy/specimen/). Run on every design tag, after build-specimen.mjs:
//   node scripts/publish-specimen.mjs            builds .publish/specimen/ and deploys
//   node scripts/publish-specimen.mjs --dry      builds only
// The page links ../fonts/fonts.css, so the folder keeps the repo's layout: specimen/, fonts/, icons/*.html.
import { cpSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = root + '.publish/specimen/';
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(root + 'specimen', out + 'specimen', { recursive: true });
cpSync(root + 'fonts', out + 'fonts', { recursive: true });
mkdirSync(out + 'icons', { recursive: true });
for (const f of readdirSync(root + 'icons').filter((x) => x.endsWith('.html'))) cpSync(root + 'icons/' + f, out + 'icons/' + f);
console.log('built', out);
if (process.argv.includes('--dry')) process.exit(0);
execFileSync('npx', ['wrangler', 'deploy', '--config', root + 'deploy/specimen/wrangler.jsonc'], { stdio: 'inherit', shell: true });
