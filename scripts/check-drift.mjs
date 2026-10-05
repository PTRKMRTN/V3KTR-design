// Drift check (v0.33.2): what quietly goes wrong between releases. Exits 1 on any failure.
//   node scripts/check-drift.mjs
// 1. every app/*.css is included whole in dist/app.css (a pullable file missing from the bundle drifts from it)
// 2. dist/app.css and specimen/index.html are current with their sources (rebuilt, then compared)
// 3. no surface loads Google Fonts: fonts/ is the source (v0.33.0)
// 4. every vk- class the shared interactions/ use has a rule in app/ (an unstyled class is a silent gap)
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
// Line endings are normalised: on Windows git (autocrlf) checks files out as CRLF, the committed bundle is LF.
const read = (p) => readFileSync(new URL(p, root), 'utf8').replace(/\r\n/g, '\n');
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };

const appFiles = ['app/app.css', ...readdirSync(new URL('app/', root)).filter((f) => f.endsWith('.css') && f !== 'app.css').map((f) => 'app/' + f)];
const bundle = read('dist/app.css');
for (const f of appFiles) check(bundle.includes(read(f).trim()), `${f} is not whole in dist/app.css (run scripts/build-dist.mjs)`);

// rebuilt comparisons: run the builder, see whether the output moved, and restore the committed copy either way
for (const [built, script] of [['dist/app.css', 'build-dist.mjs'], ['specimen/index.html', 'build-specimen.mjs']]) {
  const committed = read(built);
  execFileSync(process.execPath, [fileURLToPath(new URL('scripts/' + script, root))], { stdio: 'ignore' });
  const rebuilt = read(built);
  writeFileSync(new URL(built, root), committed);
  check(rebuilt === committed, `${built} is stale: rebuild with scripts/${script} and commit it`);
}

const SURFACES = ['dist/app.css', 'dist/site.css', 'specimen/index.html', 'fonts/fonts.css'];
for (const f of SURFACES) check(!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(read(f)), `${f} loads Google Fonts (use fonts/fonts.css)`);

const css = appFiles.map(read).join('\n');
const used = new Set();
for (const f of readdirSync(new URL('interactions/', root))) for (const m of read('interactions/' + f).matchAll(/vk-[a-z][a-z0-9_-]*/g)) used.add(m[0]);
// Hook-only classes: named by the shared modules, styled inline or only as an id prefix, so no rule is due.
// vk-toast-region: positioned inline by toast.js (over the viewport bars); vk-tip-: the id prefix of a tip.
const HOOK_ONLY = new Set(['vk-toast-region', 'vk-tip-']);
for (const c of used) check(HOOK_ONLY.has(c) || new RegExp('\\.' + c + '(?![\\w-])').test(css),`class .${c} is used by interactions/ but has no rule in app/`);

if (fails.length) { console.error(`drift check: ${fails.length} problem(s)\n  - ` + fails.join('\n  - ')); process.exit(1); }
console.log(`drift check: clean (${appFiles.length} app files whole in the bundle, ${SURFACES.length} surfaces offline, ${used.size} shared classes styled)`);
