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
// the version line: tokens.css and app/app.css must head with the newest CHANGELOG version (apps pin on it)
const newest = read('CHANGELOG.md').match(/^## (\d+\.\d+\.\d+)/m)[1];
for (const f of ['tokens.css', 'app/app.css']) check(read(f).split('\n')[0].includes('v' + newest), `${f} header does not say v${newest} (bump the version line; apps pin on it)`);

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

// 5. catalogue coverage (v0.41.128): every base .vk- class the bundle styles must be shown in the specimen. specimen/catalogue/pending.json is the
// shrinking list of classes still to catalogue: a class missing from the specimen and not on it fails; a class on it that the specimen now shows fails too (delete it).
{
  const defined = new Set([...bundle.matchAll(/\.(vk-[a-z0-9_-]+)/g)].map((m) => m[1]).filter((c) => !/__|--/.test(c)));
  const spec = read('specimen/index.html');
  const shown = new Set([...spec.slice(spec.lastIndexOf('</style>')).matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
  const pending = new Set(JSON.parse(read('specimen/catalogue/pending.json')));
  for (const c of defined) check(shown.has(c) || pending.has(c), `class .${c} is styled but has no specimen entry (add it to specimen/catalogue/)`);
  for (const c of pending) check(!shown.has(c), `class .${c} is in specimen/catalogue/pending.json but the specimen now shows it (delete it from the list)`);
  console.log(`catalogue coverage: ${[...defined].filter((c) => shown.has(c)).length} of ${defined.size} base classes shown, ${pending.size} pending`);
}
if (fails.length) { console.error(`drift check: ${fails.length} problem(s)\n  - ` + fails.join('\n  - ')); process.exit(1); }
console.log(`drift check: clean (${appFiles.length} app files whole in the bundle, ${SURFACES.length} surfaces offline, ${used.size} shared classes styled)`);
