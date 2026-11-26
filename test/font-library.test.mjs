// node test/font-library.test.mjs: scripts/build-fonts.mjs --library (brief 1.1) on a small fixture: one INCEPTOR family (Abril Fatface,
// OFL, with a Reserved Font Name) and DIMENSOR's three extras. Needs `npm install` once in scripts/font-tools (wawoff2, opentype.js).
// Proves: every face is a lossless woff2 of its TTF (tables equal, every glyph outline and advance width equal), Darktech LDR stays the
// original TTF byte for byte, every family has a licence file, the CC BY families carry a credit, the reserved names and versions
// survive, the headers carry CORS and CORP, and the integrity check FAILS on each fault planted below (a missing licence, a missing
// face, a truncated file, a lost credit, changed reserved names, a changed glyph).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const FIX = path.join(ROOT, 'test/fixtures/font-library');
const SRC = path.join(FIX, 'fonts-dist'), EXTRAS = path.join(FIX, 'extras');
const TOOLS = path.join(ROOT, 'scripts/font-tools');
let ot, w2;
try { const r = createRequire(path.join(TOOLS, 'package.json')); ot = r('opentype.js'); w2 = r('wawoff2'); }
catch { console.error('font library test: run `npm install` in scripts/font-tools first (wawoff2 and opentype.js)'); process.exit(2); }
const { checkLibrary, sameFont, glyphSig, glyphSlices, tablesOf, KEEP_ORIGINAL } = await import(pathToFileURL(path.join(ROOT, 'scripts/build-font-library.mjs')).href);

const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-fontlib-'));
const run = (...a) => spawnSync(process.execPath, [path.join(ROOT, 'scripts/build-fonts.mjs'), '--library', ...a], { encoding: 'utf8' });
const built = run('--from', SRC, '--extras', EXTRAS, '--out', OUT);
assert.equal(built.status, 0, built.stderr || built.stdout);
assert.match(built.stdout, /4 families, 4 faces/);
const V1 = path.join(OUT, 'v1');
const cat = JSON.parse(fs.readFileSync(path.join(V1, 'catalogue.json'), 'utf8'));
const fam = (id) => cat.families.find((f) => f.id === id);

// the catalogue
assert.equal(cat.format, 'v3ktr-fonts'); assert.equal(cat.v, 1); assert.deepEqual(cat.families.map((f) => f.id), ['abril-fatface', 'darktech-ldr', 'kiwi-soda', 'y224']);
const src = JSON.parse(fs.readFileSync(path.join(SRC, 'catalogue.json'), 'utf8')).families[0];
for (const k of Object.keys(src)) assert.deepEqual(fam('abril-fatface')[k], src[k], `INCEPTOR's field ${k} is unchanged`);
assert.deepEqual(fam('abril-fatface').rn, ['Abril', 'Abril Fatface'], 'the reserved names survive');
assert.deepEqual(fam('abril-fatface').p.map((p) => p.p), ['files/abril-fatface/abril-fatface-400-normal.woff2']);
assert.deepEqual([fam('kiwi-soda').l, fam('y224').l, fam('darktech-ldr').l], ['CC-BY-4.0', 'CC0-1.0', 'CC-BY-SA-3.0']);
assert.equal(fam('kiwi-soda').cr.line, 'Kiwi Soda by jeti'); assert.match(fam('darktech-ldr').cr.line, /Neoqueto.*CC BY-SA 3\.0/);

// lossless: every woff2 decodes to the same font as its TTF (this is the claim that makes "no subsetting" safe under the OFL)
const ttfOf = (id, n) => fs.readFileSync(path.join(id === 'abril-fatface' ? SRC : EXTRAS, id === 'abril-fatface' ? `files/${id}/${n}.ttf` : `${n}.ttf`));
for (const [id, n] of [['abril-fatface', 'abril-fatface-400-normal'], ['kiwi-soda', 'kiwi-soda'], ['y224', 'y224']]) {
  const p = fam(id).p[0], file = path.join(V1, p.p), ttf = ttfOf(id, n);
  assert.ok(p.p.endsWith('.woff2') && p.b === fs.statSync(file).size && p.b < ttf.length, `${id} is a smaller woff2`);
  const decoded = Buffer.from(await w2.decompress(fs.readFileSync(file)));
  assert.equal(sameFont(ttf, decoded, ot), '', `${id} decodes to the same font`);
}
// Darktech LDR: the original file, byte for byte (an adapted copy would carry ShareAlike)
assert.equal(fam('darktech-ldr').p[0].p, 'files/darktech-ldr/darktech-ldr.ttf');
assert.deepEqual([...KEEP_ORIGINAL].sort(), ['darktech-ldr', 'roboto-flex'], 'the two families served as the original TTF');
assert.equal(Buffer.compare(fs.readFileSync(path.join(V1, 'files/darktech-ldr/darktech-ldr.ttf')), ttfOf('darktech-ldr', 'darktech-ldr')), 0);
// the licences, the notice, the headers
for (const id of ['abril-fatface', 'kiwi-soda', 'y224', 'darktech-ldr']) assert.ok(fs.statSync(path.join(V1, 'licences', id + '.txt')).size > 100, `${id} has its licence`);
assert.match(fs.readFileSync(path.join(V1, 'NOTICE.txt'), 'utf8'), /Darktech LDR[\s\S]*unedited/);
const hdr = fs.readFileSync(path.join(OUT, '_headers'), 'utf8');
const cors = JSON.parse(fs.readFileSync(path.join(OUT, 'cors.json'), 'utf8'));
assert.deepEqual([cors[0].AllowedOrigins, cors[0].AllowedMethods], [['*'], ['GET', 'HEAD']], 'the bucket CORS policy: GET and HEAD from any origin');
assert.match(hdr, /Access-Control-Allow-Origin: \*/); assert.match(hdr, /Cross-Origin-Resource-Policy: cross-origin/); assert.match(hdr, /immutable/);
assert.deepEqual(checkLibrary(OUT, SRC), [], 'the built library passes its own check');
const cli = run('--check', OUT, '--from', SRC); assert.equal(cli.status, 0); assert.match(cli.stdout, /clean/);

// the check can FAIL: plant each fault in a copy and require it to be reported
const faulty = (name, plant, expect) => {
  const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-fontlib-bad-')); fs.cpSync(OUT, copy, { recursive: true });
  plant(copy); const bad = checkLibrary(copy, SRC);
  assert.ok(bad.some((b) => expect.test(b)), `FAULT NOT CAUGHT: ${name} (got: ${bad.join(' | ') || 'clean'})`);
  fs.rmSync(copy, { recursive: true, force: true }); console.log(`  fault caught: ${name}`);
};
const edit = (copy, fn) => { const f = path.join(copy, 'v1/catalogue.json'); const c = JSON.parse(fs.readFileSync(f, 'utf8')); fn(c); fs.writeFileSync(f, JSON.stringify(c)); };
faulty('a licence file is missing', (c) => fs.rmSync(path.join(c, 'v1/licences/y224.txt')), /y224: no licence file/);
faulty('a face file is missing', (c) => fs.rmSync(path.join(c, 'v1/files/kiwi-soda/kiwi-soda.woff2')), /kiwi-soda: missing/);
faulty('a face file is truncated', (c) => { const f = path.join(c, 'v1/files/abril-fatface/abril-fatface-400-normal.woff2'); fs.writeFileSync(f, fs.readFileSync(f).subarray(0, 100)); }, /abril-fatface: .*bytes/);
faulty('a CC BY credit is lost', (c) => edit(c, (j) => { delete j.families.find((f) => f.id === 'kiwi-soda').cr; }), /kiwi-soda: CC-BY-4\.0 asks for credit/);
faulty('the reserved names change', (c) => edit(c, (j) => { j.families.find((f) => f.id === 'abril-fatface').rn = ['Abril']; }), /abril-fatface: reserved names changed/);
faulty('a licence id changes', (c) => edit(c, (j) => { j.families.find((f) => f.id === 'abril-fatface').l = 'MIT'; }), /abril-fatface: name, version or licence changed/);
faulty('a family has no faces', (c) => edit(c, (j) => { j.families.find((f) => f.id === 'y224').p = []; }), /y224: no faces/);
// the outline comparison can fail: move one point of one glyph in the decoded copy
{
  const ttf = ttfOf('abril-fatface', 'abril-fatface-400-normal'), decoded = Buffer.from(await w2.decompress(fs.readFileSync(path.join(V1, fam('abril-fatface').p[0].p))));
  const o = ot.parse(decoded.buffer.slice(decoded.byteOffset, decoded.byteOffset + decoded.byteLength)); const gi = [...Array(o.numGlyphs).keys()].find((i) => o.glyphs.get(i).path.commands.length > 6);
  const bad = Buffer.from(decoded); const n = bad.readUInt16BE(4); let glyf, loca; for (let i = 0; i < n; i++) { const e = 12 + i * 16, tag = bad.toString('latin1', e, e + 4); if (tag === 'glyf') glyf = bad.readUInt32BE(e + 8); if (tag === 'loca') loca = bad.readUInt32BE(e + 8); }
  const headOff = [...Array(n).keys()].map((i) => 12 + i * 16).filter((e) => bad.toString('latin1', e, e + 4) === 'head').map((e) => bad.readUInt32BE(e + 8))[0];
  const isLong = bad.readInt16BE(headOff + 50) === 1;
  const gStart = glyf + (isLong ? bad.readUInt32BE(loca + gi * 4) : bad.readUInt16BE(loca + gi * 2) * 2);
  bad[gStart + 12] ^= 0x05;   // inside the flags / first coordinates of the glyph
  assert.notEqual(sameFont(ttf, bad, ot), '', 'a moved point is reported'); console.log('  fault caught: a glyph outline changes');
}
assert.notEqual(sameFont(ttfOf('y224', 'y224'), Buffer.from(await w2.decompress(fs.readFileSync(path.join(V1, 'files/kiwi-soda/kiwi-soda.woff2')))), ot), '', 'two different fonts are not the same font');

// ---- provenance and the notice (QA r1 item 4)
const srcHash = createHash('sha256').update(fs.readFileSync(path.join(SRC, 'catalogue.json'))).digest('hex');
assert.equal(cat.from.catalogueSha256, srcHash, 'the catalogue records the hash of the source catalogue');
assert.match(cat.from.googleFontsCommit, /^[0-9a-f]{40}$/, "and the google/fonts commit the source's NOTICE names");
const notice = fs.readFileSync(path.join(V1, 'NOTICE.txt'), 'utf8');
assert.match(notice, /lossless woff2 re-encoding/); assert.match(notice, /DSIG signature table/); assert.match(notice, /1 families under the SIL Open Font Licence 1\.1 and 0 under Apache-2\.0/);
assert.match(notice, /darktech-ldr, roboto-flex/);
faulty('the notice does not say the files are re-encodings', (c) => fs.writeFileSync(path.join(c, 'v1/NOTICE.txt'), 'plain'), /NOTICE\.txt does not say/);
faulty('the source hash is not recorded', (c) => edit(c, (j) => { delete j.from.catalogueSha256; }), /hash of its source catalogue/);
// a family in KEEP_ORIGINAL is served as the original TTF, byte for byte (a copy of the fixture family under Roboto Flex's id)
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-fontlib-keep-')); const src2 = path.join(tmp, 'src'); fs.cpSync(SRC, src2, { recursive: true });
  fs.renameSync(path.join(src2, 'files/abril-fatface'), path.join(src2, 'files/roboto-flex')); fs.renameSync(path.join(src2, 'files/roboto-flex/abril-fatface-400-normal.ttf'), path.join(src2, 'files/roboto-flex/roboto-flex-400-normal.ttf'));
  fs.renameSync(path.join(src2, 'licences/abril-fatface.txt'), path.join(src2, 'licences/roboto-flex.txt'));
  const c2 = JSON.parse(fs.readFileSync(path.join(src2, 'catalogue.json'), 'utf8')); c2.families[0].id = 'roboto-flex'; fs.writeFileSync(path.join(src2, 'catalogue.json'), JSON.stringify(c2));
  const r = run('--from', src2, '--out', path.join(tmp, 'out')); assert.equal(r.status, 0, r.stderr);
  const p0 = JSON.parse(fs.readFileSync(path.join(tmp, 'out/v1/catalogue.json'), 'utf8')).families[0].p[0];
  assert.equal(p0.p, 'files/roboto-flex/roboto-flex-400-normal.ttf'); assert.equal(Buffer.compare(fs.readFileSync(path.join(tmp, 'out/v1', p0.p)), fs.readFileSync(path.join(src2, 'files/roboto-flex/roboto-flex-400-normal.ttf'))), 0);
  // a half-written source (a licence file absent) stops with a clear message, naming the file
  fs.rmSync(path.join(src2, 'licences/roboto-flex.txt')); const bad = run('--from', src2, '--out', path.join(tmp, 'out2'));
  assert.notEqual(bad.status, 0); assert.match(bad.stderr, /incomplete[\s\S]*licences\/roboto-flex\.txt/); console.log('  fault caught: a source with a missing licence stops the build');
  fs.rmSync(tmp, { recursive: true, force: true });
}
// ---- the glyph flags and instructions (QA r1 item 1): woff2 2.0.1 drops OVERLAP_SIMPLE, and tables and outlines cannot see it
{
  const ttf = ttfOf('abril-fatface', 'abril-fatface-400-normal'), dec = Buffer.from(await w2.decompress(fs.readFileSync(path.join(V1, fam('abril-fatface').p[0].p))));
  const slices = glyphSlices(tablesOf(dec)); let simple = -1, comp = -1;
  slices.forEach((g, i) => { if (g.length > 12 && g.readInt16BE(0) > 0 && simple < 0) simple = i; if (g.length > 12 && g.readInt16BE(0) < 0 && comp < 0) comp = i; });
  assert.ok(simple >= 0, 'the fixture has a simple glyph');
  const plant = (gi, fn) => { const bad = Buffer.from(dec); fn(glyphSlices(tablesOf(bad))[gi]); return bad; };   // the slices are views into the copy
  const flagAt = (g) => 10 + g.readInt16BE(0) * 2 + 2 + g.readUInt16BE(10 + g.readInt16BE(0) * 2);
  const badFlag = plant(simple, (g) => { g[flagAt(g)] ^= 0x40; });
  assert.match(sameFont(ttf, badFlag, ot), /instructions or flags differ/, 'a planted OVERLAP_SIMPLE bit is reported');
  const badOn = plant(simple, (g) => { g[flagAt(g)] ^= 0x01; });
  assert.notEqual(sameFont(ttf, badOn, ot), '', 'a planted on-curve bit is reported'); console.log('  fault caught: a glyph flag changes');
  assert.notEqual(glyphSig(glyphSlices(tablesOf(badFlag))[simple]), glyphSig(glyphSlices(tablesOf(dec))[simple]));
  if (comp >= 0) { const g = glyphSlices(tablesOf(dec))[comp], bad = Buffer.from(g); bad[0 + 10 + 3] ^= 0x01; assert.notEqual(glyphSig(bad), glyphSig(g), 'a changed component is reported'); }
}
// ---- the headers (QA r1 item 2): no URL matches two Cache-Control rules (Cloudflare Pages joins them with a comma)
const rulesOf = (txt) => { const rules = []; let cur = null; for (const raw of txt.split(/\r?\n/)) { if (!raw.trim()) continue; if (!/^\s/.test(raw)) { cur = { path: raw.trim(), lines: [] }; rules.push(cur); } else cur.lines.push(raw.trim()); } return rules; };
const headersFor = (txt, url) => { const h = new Map(); for (const r of rulesOf(txt)) if (new RegExp('^' + r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$').test(url)) for (const l of r.lines) { const i = l.indexOf(':'), k = l.slice(0, i).trim().toLowerCase(), v = l.slice(i + 1).trim(); h.set(k, h.has(k) ? h.get(k) + ', ' + v : v); } return Object.fromEntries(h); };
const CC1Y = 'public, max-age=31536000, immutable', CC1H = 'public, max-age=3600';
assert.equal(headersFor(hdr, '/v1/catalogue.json')['cache-control'], CC1H, 'the catalogue has ONE Cache-Control, an hour');
assert.equal(headersFor(hdr, '/v1/NOTICE.txt')['cache-control'], CC1H);
assert.equal(headersFor(hdr, '/v1/files/abril-fatface/abril-fatface-400-normal.woff2')['cache-control'], CC1Y);
assert.equal(headersFor(hdr, '/v1/licences/abril-fatface.txt')['cache-control'], CC1Y);
for (const u of ['/v1/catalogue.json', '/v1/files/x/y.woff2', '/v1/licences/x.txt', '/v1/NOTICE.txt']) { const h = headersFor(hdr, u); assert.equal(h['access-control-allow-origin'], '*'); assert.equal(h['cross-origin-resource-policy'], 'cross-origin'); }
const oldHdr = '/v1/*\n  Cache-Control: ' + CC1Y + '\n\n/v1/catalogue.json\n  Cache-Control: ' + CC1H + '\n';
assert.match(headersFor(oldHdr, '/v1/catalogue.json')['cache-control'], /immutable, public, max-age=3600/, 'the old two-rule file joins them: the check can see that'); console.log('  fault caught: two Cache-Control rules on one URL');

// ---- the committed catalogue and licences (brief 1.1: "only the catalogue and the licence files are committed"): the whole set, no build
{
  const META = path.join(ROOT, 'font-library');
  if (fs.existsSync(path.join(META, 'v1/catalogue.json'))) {
    assert.deepEqual(checkLibrary(META, null, { metaOnly: true }), [], 'the committed catalogue, notice and licences are complete');
    const mc = JSON.parse(fs.readFileSync(path.join(META, 'v1/catalogue.json'), 'utf8')), by = (l) => mc.families.filter((x) => x.l === l).length;
    assert.equal(mc.families.length, 155); assert.equal(by('OFL-1.1'), 145); assert.equal(by('Apache-2.0'), 7); assert.deepEqual([by('CC0-1.0'), by('CC-BY-4.0'), by('CC-BY-SA-3.0')], [1, 1, 1]);
    assert.equal(mc.families.filter((x) => x.rn && x.rn.length).length, 45, 'the 45 families with reserved font names keep them');
    assert.equal(mc.families.every((x) => fs.existsSync(path.join(META, 'v1/licences', x.id + '.txt'))), true);
    const orig = (id) => mc.families.find((x) => x.id === id).p.every((p) => p.p.endsWith('.ttf'));
    assert.ok(orig('roboto-flex') && orig('darktech-ldr') && !orig('inter'), 'Roboto Flex and Darktech LDR are served as the original TTF, Inter as woff2');
    const copy = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-fontlib-meta-')); fs.cpSync(META, copy, { recursive: true }); fs.rmSync(path.join(copy, 'v1/licences/inter.txt'));
    assert.ok(checkLibrary(copy, null, { metaOnly: true }).some((b) => /inter: no licence file/.test(b)), 'the committed-set check can fail'); console.log('  fault caught: a licence file missing from the committed set'); fs.rmSync(copy, { recursive: true, force: true });
  } else console.log('  (font-library/ is not committed in this tree: the committed-set checks are skipped)');
}

fs.rmSync(OUT, { recursive: true, force: true });
console.log('font library: built, lossless, licensed, credited, and every planted fault caught');
