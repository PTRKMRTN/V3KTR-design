// The shared font library (brief §1.1, fonts and licence, Patrick 2026-11-26: "one set everywhere"). Builds the folder that is
// published at fonts.v3ktr.com from INCEPTOR's font set (152 families, unmodified google/fonts files, catalogue `inceptor-fonts` v2)
// and DIMENSOR's three extra fonts. Reached as `node scripts/build-fonts.mjs --library ...`; this file is the work.
//
//   node scripts/build-fonts.mjs --library --from <INCEPTOR dist/fonts-dist> --out <folder>
//        [--extras <COWORK reports/asset-alignment/dimensor-fonts>] [--only id,id] [--tools <folder>]   (tools: `npm install` once in scripts/font-tools)
//        [--meta-to font-library]   also copies catalogue.json, NOTICE.txt and licences/ to <dir>/v1/ (the part that IS committed)
//   node scripts/build-fonts.mjs --library --check <folder> [--from <fonts-dist>] [--meta-only]   (the integrity check, exit 1 on a miss;
//        --meta-only checks a folder that holds the catalogue and licences but no face files, like the committed font-library/)
//   node scripts/build-fonts.mjs --library --verify <folder> --from <fonts-dist>      (decode every woff2, compare with its TTF)
//
// What the output holds (the folder is the site root; the ~51 MB of faces are NOT committed, but the catalogue, NOTICE and licences are:
// `font-library/v1/`, written with --meta-to, so a test, the specimen and the apps read them without a ten-minute build):
//   v1/catalogue.json     format `v3ktr-fonts` v1: INCEPTOR's fields unchanged, plus per family `p` (its faces, each with a path
//                         under v1/ and its byte size) and `cr` (the credit, for a family whose licence asks for one)
//   v1/files/<id>/<face>.woff2     lossless woff2 of the TTF; two families stay the original .ttf (KEEP_ORIGINAL below)
//   v1/licences/<id>.txt  the licence text of every family, v1/NOTICE.txt the designer / copyright / source list
//   cors.json             the bucket's CORS policy (GET and HEAD from any origin), for `wrangler r2 bucket cors set v3ktr-fonts --file cors.json`
//   _headers              the same rules plus Cross-Origin-Resource-Policy and the year-long cache, for a host that reads a _headers file
//                         (Cloudflare Pages or a Worker). An R2 custom domain does not read it: there the cache and CORP rule is the
//                         Transform Rule in COWORK reports/asset-alignment/FONTS-HOST-SETUP.md step 5.
//
// Lossless and whole-file, no subsetting (brief §1.1): a font with a Reserved Font Name counts as modified under the OFL when glyphs
// are removed, and Darktech LDR (CC BY-SA 3.0) hands ShareAlike to anything adapted. woff2 is a reversible re-encoding of the same
// tables (the format drops only the DSIG signature, which a re-encode voids anyway), so the family names, versions, glyphs and
// licences stay exactly as published. `--verify` proves it per file: tables, every outline and advance width, and (v1 r2) every
// glyph's instruction bytes, on-curve and OVERLAP_SIMPLE flags and composite flags, because woff2 2.0.1 drops the overlap flag.
// A face loads whole, per family, on first use: the apps never fetch the library at once.
// IMMUTABLE PATHS: the face files are served with a year-long `immutable` cache, so a path never changes its content. A changed font
// (a new upstream version) goes under a new folder (`v2/`), never over `v1/`.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const has = (n) => process.argv.includes('--' + n);
const read = (p) => fs.readFileSync(p);
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const VER = 'v1';
const TOOLS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'font-tools');

// DIMENSOR's three extras (HANDOVER.md in dimensor-fonts/, Patrick 2026-11-26). The licence of each is what the gate reads.
export const EXTRAS = [
  { id: 'kiwi-soda', f: 'Kiwi Soda', file: 'kiwi-soda.ttf', licFile: 'kiwi-soda-CC-BY-4.0.txt', l: 'CC-BY-4.0', c: 'display', ver: '',
    cr: { by: 'jeti', line: 'Kiwi Soda by jeti', url: 'https://www.dafont.com/kiwisoda.font' }, keep: false },
  { id: 'y224', f: 'Y224', file: 'y224.ttf', licFile: 'y224-CC0-1.0.txt', l: 'CC0-1.0', c: 'display', ver: '',
    cr: { by: 'GGBotNet', line: 'Y224 by GGBotNet (courtesy credit; none required)', url: 'https://www.dafont.com/y224.font' }, keep: false },
  { id: 'darktech-ldr', f: 'Darktech LDR', file: 'darktech-ldr.ttf', licFile: 'darktech-ldr-CC-BY-SA-3.0.txt', l: 'CC-BY-SA-3.0', c: 'display', ver: '',
    cr: { by: 'Michal "Neoqueto" Nowak', line: 'Darktech LDR by Michal "Neoqueto" Nowak, CC BY-SA 3.0', url: 'https://www.dafont.com/darktech-ldr.font' }, keep: true },   // keep = served as the original TTF
];

// Families served as the original TTF, not woff2: Darktech LDR (CC BY-SA 3.0: an adapted copy would carry ShareAlike) and Roboto Flex,
// whose 422 simple glyphs carry OVERLAP_SIMPLE, a flag the woff2 encoder (wawoff2 2.0.1, the latest) drops. +1.0 MB.
export const KEEP_ORIGINAL = new Set(['roboto-flex', 'darktech-ldr']);

// ---- sfnt reading (only what the checks need) -------------------------------------------------------------------------------
export function tablesOf(b) {
  const n = b.readUInt16BE(4), m = new Map();
  for (let i = 0; i < n; i++) { const o = 12 + i * 16; m.set(b.toString('latin1', o, o + 4), b.subarray(b.readUInt32BE(o + 8), b.readUInt32BE(o + 8) + b.readUInt32BE(o + 12))); }
  return m;
}
export const glyphSlices = (t) => {
  const head = t.get('head'), loca = t.get('loca'), glyf = t.get('glyf'); if (!glyf || !loca) return null;
  const long = head.readInt16BE(50) === 1, n = long ? loca.length / 4 : loca.length / 2, off = (i) => (long ? loca.readUInt32BE(i * 4) : loca.readUInt16BE(i * 2) * 2);
  const out = []; for (let i = 0; i + 1 < n; i++) out.push(glyf.subarray(off(i), off(i + 1)));
  return out;
};
/** What a re-encode must keep and a table or outline comparison cannot see: a simple glyph's instruction bytes and each point's on-curve
 *  and OVERLAP_SIMPLE bits; a composite's component glyph ids, its instruction bytes and the component flags that matter (not the
 *  argument size, which the encoder may choose). → a string, equal when the glyph keeps all of it. */
export function glyphSig(g) {
  if (g.length < 10) return '';
  const nc = g.readInt16BE(0);
  if (nc >= 0) {
    let o = 10 + nc * 2; const npts = nc ? g.readUInt16BE(10 + (nc - 1) * 2) + 1 : 0;
    const il = g.readUInt16BE(o); o += 2; const ins = g.subarray(o, o + il).toString('hex'); o += il;
    const fl = []; while (fl.length < npts && o < g.length) { const f = g[o++]; fl.push(f & 0x41); if (f & 8) { let r = g[o++]; while (r-- > 0) fl.push(f & 0x41); } }
    return nc + '|' + ins + '|' + fl.join('');
  }
  let o = 10, f, comps = [], ins = '';
  do {
    f = g.readUInt16BE(o); comps.push((f & 0x1f06) + ':' + g.readUInt16BE(o + 2)); o += 4; o += f & 1 ? 4 : 2;
    if (f & 8) o += 2; else if (f & 0x40) o += 4; else if (f & 0x80) o += 8;
  } while (f & 0x20);
  if (f & 0x100) { const il = g.readUInt16BE(o); ins = g.subarray(o + 2, o + 2 + il).toString('hex'); }
  return 'c|' + comps.join(',') + '|' + ins;
}
const trimmed = (b) => { let e = b.length; while (e > 0 && b[e - 1] === 0) e--; return b.subarray(0, e); };

/** Whether a woff2's decoded font is the same font as its TTF: every table identical except glyf, loca, head and DSIG; the glyph outlines
 *  and advance widths identical (read with opentype.js, since woff2 re-encodes glyf, so its bytes differ while its outlines do not); head
 *  identical but for the three fields a re-encode may change. → '' or why not. `ot` is the opentype.js module. */
export function sameFont(ttf, decoded, ot) {
  const a = tablesOf(ttf), b = tablesOf(decoded);
  for (const [tag, data] of a) {
    if (tag === 'DSIG') continue;
    if (!b.has(tag)) return `table ${tag} is missing`;
    if (tag === 'glyf' || tag === 'loca' || tag === 'head') continue;
    if (Buffer.compare(data, b.get(tag)) !== 0) return `table ${tag} differs`;
  }
  for (const tag of b.keys()) if (!a.has(tag)) return `table ${tag} was added`;
  const ha = a.get('head'), hb = b.get('head');   // head: everything but checkSumAdjustment (8..11), indexToLocFormat (50..51) and flags bit 11 ("lossless transform", which the woff2 encoder sets)
  for (let i = 0; i < ha.length; i++) if (!(i >= 8 && i < 12) && !(i >= 50 && i < 52) && (i === 16 ? ha[i] & 0xf7 : ha[i]) !== (i === 16 ? hb[i] & 0xf7 : hb[i])) return `head differs at byte ${i}`;
  if (!ot) return a.has('glyf') ? 'no opentype.js: the outlines were not compared' : '';
  const toAB = (x) => x.buffer.slice(x.byteOffset, x.byteOffset + x.byteLength);
  let fa, fb, i = -1;
  try {
    fa = ot.parse(toAB(ttf)); fb = ot.parse(toAB(decoded));
    if (fa.numGlyphs !== fb.numGlyphs) return `glyph count ${fa.numGlyphs} against ${fb.numGlyphs}`;
    for (i = 0; i < fa.numGlyphs; i++) {
      const ga = fa.glyphs.get(i), gb = fb.glyphs.get(i);
      if (ga.advanceWidth !== gb.advanceWidth) return `glyph ${i}: advance width differs`;
      if (JSON.stringify(ga.path.commands) !== JSON.stringify(gb.path.commands)) return `glyph ${i}: outline differs`;
    }
  } catch (e) { return `glyph ${i}: cannot be read (${e.message})`; }
  const sa = glyphSlices(a), sb = glyphSlices(b);
  if (sa && sb) for (let k = 0; k < sa.length; k++) if (glyphSig(sa[k]) !== glyphSig(sb[k])) return `glyph ${k}: instructions or flags differ (the overlap flag, the on-curve bits or the hinting)`;
  return '';
}

function opentypeTool() {
  const dirs = [arg('tools', process.env.FONT_TOOLS), TOOLS_DIR].filter(Boolean);
  for (const d of dirs) { try { return createRequire(path.join(d, 'package.json'))('opentype.js'); } catch {} }
  return null;
}

function woff2Tool() {
  const tools = arg('tools', process.env.FONT_TOOLS);
  const bases = [tools && path.join(tools, 'package.json'), path.join(TOOLS_DIR, 'package.json')].filter(Boolean);
  for (const b of bases) { try { return createRequire(b)('wawoff2'); } catch {} }
  throw new Error('wawoff2 is needed to write woff2: run `npm install` in scripts/font-tools (or pass --tools <folder with node_modules/wawoff2>)');
}

function faceOf(file) {   // `alegreya-var-italic.ttf`, `abril-fatface-400-normal.ttf`
  const m = /-(var|\d{3})-(normal|italic)\.ttf$/.exec(file);
  return m ? { w: m[1] === 'var' ? 'var' : +m[1], i: m[2] === 'italic' ? 1 : 0 } : { w: 400, i: 0 };
}

// ---- build ---------------------------------------------------------------------------------------------------------------
async function build() {
  const from = arg('from'), out = arg('out'), extras = arg('extras'), only = (arg('only') || '').split(',').filter(Boolean);
  if (!from || !out) throw new Error('usage: --library --from <fonts-dist> --out <folder> [--extras <folder>] [--only id,id]');
  const w2 = woff2Tool();
  const srcCatPath = path.join(from, 'catalogue.json'), srcCatBytes = read(srcCatPath), srcHash = createHash('sha256').update(srcCatBytes).digest('hex');
  const src = JSON.parse(srcCatBytes.toString('utf8'));
  if (src.format !== 'inceptor-fonts' || src.v !== 2) throw new Error(`the source catalogue is ${src.format} v${src.v}; this build reads inceptor-fonts v2`);
  const missing = [];   // the source folder is live (INCEPTOR rebuilds it on every ship): refuse a half-written one, and say what is absent
  for (const fam of src.families) {
    if (only.length && !only.includes(fam.id)) continue;
    if (!fs.existsSync(path.join(from, 'licences', fam.id + '.txt'))) missing.push(`licences/${fam.id}.txt`);
    const dir = path.join(from, 'files', fam.id); if (!fs.existsSync(dir) || !fs.readdirSync(dir).some((f) => f.endsWith('.ttf'))) missing.push(`files/${fam.id}/*.ttf`);
  }
  if (!fs.existsSync(path.join(from, 'NOTICE.txt'))) missing.push('NOTICE.txt');
  if (missing.length) throw new Error(`the source folder ${from} is incomplete (${missing.length} missing: ${missing.slice(0, 6).join(', ')}${missing.length > 6 ? ', ...' : ''}). INCEPTOR may be rebuilding it: wait for its ship to finish, or build from a copy.`);
  const root = path.join(out, VER);
  fs.rmSync(root, { recursive: true, force: true });
  for (const d of ['files', 'licences']) fs.mkdirSync(path.join(root, d), { recursive: true });
  const families = []; let ttfBytes = 0, outBytes = 0, faces = 0;
  const emit = async (id, file, buf, keepTtf) => {
    const rel = `files/${id}/${keepTtf ? file : file.replace(/\.ttf$/, '.woff2')}`;
    const data = keepTtf ? buf : Buffer.from(await w2.compress(buf));
    fs.mkdirSync(path.join(root, 'files', id), { recursive: true });
    fs.writeFileSync(path.join(root, rel), data);
    ttfBytes += buf.length; outBytes += data.length; faces++;
    return { n: file.replace(/\.ttf$/, ''), ...faceOf(file), b: data.length, p: rel };
  };
  for (const fam of src.families) {
    if (only.length && !only.includes(fam.id)) continue;
    const dir = path.join(from, 'files', fam.id);
    const p = []; for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.ttf')).sort()) p.push(await emit(fam.id, file, read(path.join(dir, file)), KEEP_ORIGINAL.has(fam.id)));
    families.push({ ...fam, p });
    fs.copyFileSync(path.join(from, 'licences', fam.id + '.txt'), path.join(root, 'licences', fam.id + '.txt'));
  }
  if (createHash('sha256').update(read(srcCatPath)).digest('hex') !== srcHash) throw new Error('the source catalogue changed while the library was being built (INCEPTOR shipped?). Build again.');
  const srcNotice = fs.readFileSync(path.join(from, 'NOTICE.txt'), 'utf8');
  const gfCommit = (/google\/fonts[^)]*commit ([0-9a-f]{40})/.exec(srcNotice) || [])[1] || '';
  const nLic = (re) => families.filter((f) => re.test(f.l)).length;
  let notice = `V3KTR shared fonts\n\nEvery font file in this library is a lossless woff2 re-encoding of the original font file: the font data is unchanged and the\nDSIG signature table, which any re-encode voids, is not carried. The exceptions are served as the original TTF, unchanged: ${[...KEEP_ORIGINAL].sort().join(', ')}.\nThe set holds ${nLic(/^OFL/)} families under the SIL Open Font Licence 1.1 and ${nLic(/^Apache/)} under Apache-2.0 (each file is the unmodified font, so no change\nneeds noting), and the extras named at the end. Not legal advice.\n\n` + srcNotice;
  if (extras) {
    notice += '\n\nExtra fonts (from DIMENSOR, added to the shared set 2026-11-26). Each is distributed under the licence named beside it.\n';
    for (const x of EXTRAS) {
      if (only.length && !only.includes('extras') && !only.includes(x.id)) continue;
      const buf = read(path.join(extras, x.file));
      const p = [await emit(x.id, x.file, buf, KEEP_ORIGINAL.has(x.id))];
      families.push({ id: x.id, f: x.f, c: x.c, l: x.l, s: 'latin', w: [400], ft: '', ver: x.ver, wf: 1, fs: buf.length ? readFsType(buf) : 0, cr: x.cr, p });
      fs.copyFileSync(path.join(extras, 'licences', x.licFile), path.join(root, 'licences', x.id + '.txt'));
      notice += `\n${x.f}  (${x.id})\n  Licence: ${x.l}  ·  licences/${x.id}.txt\n  Credit: ${x.cr.line}\n  Source: ${x.cr.url}\n${x.keep ? '  Served as the original file, unedited (CC BY-SA 3.0: a modified copy would have to be shared under the same licence).\n' : ''}`;
    }
  }
  families.sort((a, b) => (a.id < b.id ? -1 : 1));
  const cat = { format: 'v3ktr-fonts', v: 1, base: `/${VER}/`, from: { format: src.format, v: src.v, catalogueSha256: srcHash, googleFontsCommit: gfCommit, families: src.families.length }, families };
  fs.writeFileSync(path.join(root, 'catalogue.json'), JSON.stringify(cat));
  fs.writeFileSync(path.join(root, 'NOTICE.txt'), notice);
  fs.writeFileSync(path.join(out, 'cors.json'), JSON.stringify([{ AllowedOrigins: ['*'], AllowedMethods: ['GET', 'HEAD'], AllowedHeaders: ['*'], ExposeHeaders: ['Content-Length', 'ETag'], MaxAgeSeconds: 86400 }], null, 2) + '\n');
  fs.writeFileSync(path.join(out, '_headers'), [
    // No URL matches two Cache-Control rules: a header set by two matching rules is JOINED with a comma on Cloudflare Pages.
    '/' + VER + '/*', '  Access-Control-Allow-Origin: *', '  Cross-Origin-Resource-Policy: cross-origin', '  X-Content-Type-Options: nosniff', '',
    '/' + VER + '/files/*', '  Cache-Control: public, max-age=31536000, immutable', '',
    '/' + VER + '/licences/*', '  Cache-Control: public, max-age=31536000, immutable', '',
    '/' + VER + '/catalogue.json', '  Cache-Control: public, max-age=3600', '',
    '/' + VER + '/NOTICE.txt', '  Cache-Control: public, max-age=3600', '',
  ].join('\n'));
  const metaTo = arg('meta-to');
  if (metaTo) {
    const m = path.join(metaTo, VER); fs.rmSync(m, { recursive: true, force: true }); fs.mkdirSync(path.join(m, 'licences'), { recursive: true });
    for (const f of ['catalogue.json', 'NOTICE.txt']) fs.copyFileSync(path.join(root, f), path.join(m, f));
    for (const f of fs.readdirSync(path.join(root, 'licences'))) fs.copyFileSync(path.join(root, 'licences', f), path.join(m, 'licences', f));
  }
  console.log(`font library: ${families.length} families, ${faces} faces, ${(ttfBytes / 1e6).toFixed(1)} MB as TTF -> ${(outBytes / 1e6).toFixed(1)} MB (${(outBytes / ttfBytes).toFixed(2)}); wrote ${root}`);
}
const readFsType = (buf) => { const t = tablesOf(buf).get('OS/2'); return t && t.length >= 10 ? t.readUInt16BE(8) : 0; };

// ---- check ---------------------------------------------------------------------------------------------------------------
/** The integrity check of a built folder. → a list of what is wrong (empty = fine). */
export function checkLibrary(out, from, { metaOnly = false } = {}) {
  const bad = [], root = path.join(out, VER);
  let cat; try { cat = readJson(path.join(root, 'catalogue.json')); } catch (e) { return [`catalogue.json cannot be read: ${e.message}`]; }
  if (cat.format !== 'v3ktr-fonts' || cat.v !== 1) bad.push(`unexpected catalogue ${cat.format} v${cat.v}`);
  const seen = new Set();
  for (const f of cat.families) {
    if (seen.has(f.id)) bad.push(`${f.id}: listed twice`); seen.add(f.id);
    if (!fs.existsSync(path.join(root, 'licences', f.id + '.txt'))) bad.push(`${f.id}: no licence file`);
    else if (fs.statSync(path.join(root, 'licences', f.id + '.txt')).size < 100) bad.push(`${f.id}: the licence file is almost empty`);
    if (!f.l) bad.push(`${f.id}: no licence id`);
    if (!f.p || !f.p.length) bad.push(`${f.id}: no faces`);
    for (const p of metaOnly ? [] : f.p || []) {
      const file = path.join(root, p.p);
      if (!fs.existsSync(file)) bad.push(`${f.id}: missing ${p.p}`);
      else if (fs.statSync(file).size !== p.b) bad.push(`${f.id}: ${p.p} is ${fs.statSync(file).size} bytes, the catalogue says ${p.b}`);
    }
    if (/^CC-BY(-|$)/.test(f.l) && !(f.cr && f.cr.line)) bad.push(`${f.id}: ${f.l} asks for credit and has none`);
  }
  if (!/lossless woff2 re-encoding/.test(fs.existsSync(path.join(root, 'NOTICE.txt')) ? fs.readFileSync(path.join(root, 'NOTICE.txt'), 'utf8') : '')) bad.push('NOTICE.txt does not say the files are lossless woff2 re-encodings');
  if (!cat.from || !/^[0-9a-f]{64}$/.test(cat.from.catalogueSha256 || '')) bad.push('the catalogue does not record the hash of its source catalogue');
  if (from) {   // reserved names, versions and licence ids survive from the source catalogue
    const src = readJson(path.join(from, 'catalogue.json')), by = new Map(cat.families.map((f) => [f.id, f]));
    for (const s of src.families) {
      const f = by.get(s.id); if (!f) continue;
      if (JSON.stringify(f.rn || null) !== JSON.stringify(s.rn || null)) bad.push(`${s.id}: reserved names changed`);
      if (f.l !== s.l || f.ver !== s.ver || f.f !== s.f) bad.push(`${s.id}: name, version or licence changed`);
    }
  }
  return bad;
}

async function verify(out, from) {
  const w2 = woff2Tool(), ot = opentypeTool(), root = path.join(out, VER), cat = readJson(path.join(root, 'catalogue.json')); let n = 0; const bad = [];
  if (!ot) { console.log('verify: opentype.js not found (`npm install` in scripts/font-tools); outlines cannot be compared'); return false; }
  for (const f of cat.families) for (const p of f.p) {
    const orig = path.join(from || '', 'files', f.id, p.n + '.ttf');
    const file = path.join(root, p.p); if (!fs.existsSync(orig)) continue;
    const ttf = read(orig);
    const decoded = p.p.endsWith('.ttf') ? read(file) : Buffer.from(await w2.decompress(read(file)));
    const why = sameFont(ttf, decoded, ot); n++; if (why) bad.push(`${p.p}: ${why}`);
  }
  console.log(`verify: ${n} faces decoded and compared, ${bad.length} different`); for (const b of bad) console.log('  ' + b);
  return bad.length === 0;
}

if (has('library') || /build-font-library\.mjs$/.test(process.argv[1] || '')) {
  if (has('check')) { const bad = checkLibrary(arg('check'), arg('from'), { metaOnly: has('meta-only') }); console.log(bad.length ? bad.join('\n') : 'library check: clean'); process.exit(bad.length ? 1 : 0); }
  else if (has('verify')) { process.exit((await verify(arg('verify'), arg('from'))) ? 0 : 1); }
  else await build();
}
