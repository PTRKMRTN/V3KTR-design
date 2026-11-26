// node test/licence.test.mjs: interactions/licence.js and interactions/online.js (pure; no browser).
// Ported from KOMPOSITOR's sounds-licence / sounds-credits / sounds-network tests and INCEPTOR's library licence gate, plus the
// merge: SPDX ids and Creative Commons codes read alike, the credit record reads both shapes, the legacy key is copied once.
// Every check set also runs against deliberate MUTANTS of the module (the gate opened, a licence mislabelled, the network gate
// removed): each must make the checks fail, so a test that cannot fail cannot pass quietly.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = (f) => fs.readFileSync(path.join(ROOT, 'interactions', f), 'utf8');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'vk-lic-'));
let n = 0;
async function load(f, mutate) {
  const file = path.join(TMP, `${n++}-${f}`);
  let s = SRC(f);
  if (mutate) { const t = mutate(s); assert.notEqual(t, s, 'the mutation changed nothing'); s = t; }
  fs.writeFileSync(file, s);
  return import(pathToFileURL(file).href);
}

// ---- licence.js ----------------------------------------------------------------------------------------------------------
function licenceChecks(L) {
  const shown = (lic, o, v) => L.decide(lic, o, v).shown;
  // reading a licence: SPDX ids, provider codes and display strings all land on one family
  for (const [x, v, spdx] of [['CC-BY-4.0', '', 'CC-BY-4.0'], ['by', '4.0', 'CC-BY-4.0'], ['BY', '3.0', 'CC-BY-3.0'], ['CC BY 4.0', '', 'CC-BY-4.0'], ['by', '', 'CC-BY-4.0'],
    ['cc0', '', 'CC0-1.0'], ['CC0-1.0', '', 'CC0-1.0'], ['pdm', '', 'PDM-1.0'], ['Public Domain', '', 'PDM-1.0'],
    ['by-sa', '4.0', 'CC-BY-SA-4.0'], ['CC-BY-NC-SA-3.0', '', 'CC-BY-NC-SA-3.0'], ['OFL-1.1', '', 'OFL-1.1'], ['SIL OFL 1.1', '', 'OFL-1.1'],
    ['MIT', '', 'MIT'], ['ISC', '', 'ISC'], ['Apache-2.0', '', 'Apache-2.0']]) assert.equal(L.parse(x, v).spdx, spdx, `${x} ${v}`);
  for (const bad of ['', null, undefined, 'sampling+', 'by-xx', 'GPL-3.0', 'all rights reserved', 'by-sa-nc']) assert.equal(L.parse(bad), null, String(bad));
  assert.equal(L.parse('V3KTR').spdx, 'V3KTR'); assert.equal(shown('V3KTR', {}), true, "V3KTR's own content is shown"); assert.equal(L.needsCredit('V3KTR'), false); assert.equal(L.label('V3KTR'), 'V3KTR'); assert.equal(L.deedUrl('V3KTR'), '');
  // the policy
  for (const ok of ['cc0', 'pdm', 'by', 'CC-BY-4.0', 'MIT', 'ISC', 'Apache-2.0', 'OFL-1.1']) assert.equal(shown(ok, {}), true, `${ok} is always shown`);
  assert.equal(shown('by-sa', {}), false); assert.equal(shown('by-sa', { shareAlike: true }), true); assert.equal(shown('by-sa', { sa: true }), true, 'sa is read as shareAlike');
  assert.equal(shown('by-sa', { personal: true }), false, 'personal use does not unlock Share-Alike');
  assert.equal(shown('by-nc', {}), false); assert.equal(shown('by-nc', { personal: true }), true); assert.equal(shown('by-nc', { shareAlike: true }), false, 'Share-Alike does not unlock NC');
  assert.equal(shown('by-nc-sa', { personal: true }), false); assert.equal(shown('by-nc-sa', { shareAlike: true }), false); assert.equal(shown('by-nc-sa', { personal: true, shareAlike: true }), true, 'NC-SA needs both');
  for (const nd of ['by-nd', 'by-nc-nd', 'CC-BY-ND-4.0']) assert.equal(shown(nd, { personal: true, shareAlike: true }), false, `${nd} is never shown`);
  for (const bad of ['', null, 'sampling+', 'GPL-3.0']) assert.equal(shown(bad, { personal: true, shareAlike: true }), false, 'unknown or missing is never shown');
  assert.match(L.decide('by-nc', {}).why, /personal use/); assert.match(L.decide('by-sa', {}).why, /Share-Alike/); assert.match(L.decide('by-nd', {}).why, /ND/);
  // items: Openverse shape (license + licenseVersion) and the shared shape (licence)
  const items = [{ title: 'a', license: 'by', licenseVersion: '4.0' }, { title: 'b', license: 'by-nc' }, { title: 'c', licence: 'OFL-1.1' }, { title: 'd', license: 'by-nd' }, { title: 'e' }];
  assert.deepEqual(L.filterShown(items, {}).map((i) => i.title), ['a', 'c']);
  assert.deepEqual(L.filterShown(items, { personal: true }).map((i) => i.title), ['a', 'b', 'c']);
  // credit flags, labels, deeds
  assert.equal(L.needsCredit('by'), true); assert.equal(L.needsCredit('CC-BY-SA-4.0'), true); assert.equal(L.needsCredit('cc0'), false); assert.equal(L.needsCredit('OFL-1.1'), false); assert.equal(L.needsCredit('MIT'), false);
  assert.equal(L.isNonCommercial('by-nc-sa'), true); assert.equal(L.isNonCommercial('by'), false); assert.equal(L.isShareAlike('by-nc-sa'), true); assert.equal(L.isShareAlike('by-nc'), false);
  assert.equal(L.label('by', '4.0'), 'CC BY 4.0'); assert.equal(L.label('cc0'), 'CC0'); assert.equal(L.label('pdm'), 'Public Domain'); assert.equal(L.label('OFL-1.1'), 'OFL 1.1'); assert.equal(L.label('MIT'), 'MIT'); assert.equal(L.label('weird'), 'weird'); assert.equal(L.label(''), 'Unknown licence');
  assert.equal(L.deedUrl('by', '4.0'), 'https://creativecommons.org/licenses/by/4.0/'); assert.equal(L.deedUrl('cc0'), 'https://creativecommons.org/publicdomain/zero/1.0/');
  assert.equal(L.deedUrl('pdm'), 'https://creativecommons.org/publicdomain/mark/1.0/'); assert.equal(L.deedUrl('by-nc-sa', '3.0'), 'https://creativecommons.org/licenses/by-nc-sa/3.0/'); assert.equal(L.deedUrl('nope'), '');
  assert.match(L.ncWarning('sound'), /This sound is licensed for non-commercial use only/); assert.match(L.saWarning('font'), /adapts this font/);
  // the credit record reads both shapes and writes the shared one
  const ov = { provider: 'openverse', id: 'ov1', title: 'By Pad', creator: 'Pat Pad', license: 'by', licenseVersion: '4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', landingUrl: 'https://example.org/by-pad' };
  const r = L.creditRecord(ov, { now: new Date('2026-10-08T05:00:00Z') });
  assert.deepEqual(r, { provider: 'openverse', id: 'ov1', title: 'By Pad', author: 'Pat Pad', licence: 'CC-BY-4.0', url: 'https://example.org/by-pad', licenceUrl: 'https://creativecommons.org/licenses/by/4.0/', fetchedAt: '2026-10-08T05:00:00.000Z' });
  const sh = L.creditRecord({ id: 'kiwi-soda', title: 'Kiwi Soda', author: 'Someone', licence: 'CC-BY-4.0', url: 'https://example.org/kiwi' }, { provider: 'fonts' });
  assert.deepEqual(sh, { provider: 'fonts', id: 'kiwi-soda', title: 'Kiwi Soda', author: 'Someone', licence: 'CC-BY-4.0', url: 'https://example.org/kiwi' });
  assert.equal(L.creditRecord({ id: 'x', title: 'X', licence: 'mystery' }).licence, 'mystery', 'an unknown licence is kept as the provider wrote it');
  assert.equal(L.cleanCredit(null), null); assert.equal(L.cleanCredit({ id: 'a' }), null); assert.equal(L.cleanCredit({ licence: 'by' }), null);
  assert.equal(L.cleanCredit({ ...sh, extra: 'x' }).extra, undefined); assert.equal(L.cleanCredit({ ...sh, title: 5 }).title, '5');
  assert.deepEqual(L.cleanCredit(L.cleanCredit(sh)), L.cleanCredit(sh));
  // credit lines
  assert.equal(L.creditLine(r), '"By Pad" by Pat Pad, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://example.org/by-pad');
  assert.equal(L.creditLine({ id: 'c', title: 'Loop', author: 'A', licence: 'cc0', url: 'https://x.org/c' }), '"Loop" by A, CC0 (credit not required). Source: https://x.org/c');
  assert.match(L.creditLine({ id: 'n', title: 'N', licence: 'CC-BY-NC-SA-4.0' }), /Non-commercial: personal use only\. Share-Alike\.$/);
  assert.equal(L.creditLine({ id: 'f', title: 'Inter', author: 'R. Rasmus', licence: 'OFL-1.1' }), '"Inter" by R. Rasmus, OFL 1.1 (credit not required)');
  // creditsText: the items that ask for credit; all: true lists the rest; de-duplicated; code and font licences only with all
  const set = [r, sh, { provider: 'fonts', id: 'inter', title: 'Inter', licence: 'OFL-1.1' }, { provider: 'x', id: 'zero', title: 'Zero', licence: 'cc0' }, r, { id: '', licence: 'by' }];
  assert.equal(L.creditsText(set).split('\n').length, 2); assert.match(L.creditsText(set), /By Pad/); assert.match(L.creditsText(set), /Kiwi Soda/); assert.doesNotMatch(L.creditsText(set), /Inter|Zero/);
  assert.equal(L.creditsText(set, { all: true }).split('\n').length, 4);
  assert.equal(L.creditsText([]), ''); assert.equal(L.creditsText([{ provider: 'f', id: 'i', title: 'I', licence: 'OFL-1.1' }]), '');
  // the file
  const f = L.creditsFileText([r, { id: 'n', title: 'N', licence: 'by-nc', provider: 'p' }], { name: 'My cut', notes: ['The sounds were cut.'] });
  assert.match(f, /^Credits in "My cut"\n\n"By Pad"/); assert.match(f, /The sounds were cut\./); assert.match(f, /non-commercial use only: this work must stay a personal project\./);
  assert.doesNotMatch(L.creditsFileText([r], { name: 'X' }), /non-commercial/); assert.equal(L.creditsFileText([], { name: 'X' }), '');
  assert.match(L.creditsFileText([r], { heading: 'Sounds in "X"' }), /^Sounds in "X"\n/);
}

// ---- online.js -----------------------------------------------------------------------------------------------------------
const mem = () => { const d = new Map(); return { getItem: (k) => (d.has(k) ? d.get(k) : null), setItem: (k, v) => d.set(k, String(v)), d }; };
const dead = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
const KMP_NOTICE_BODY = 'Searching sounds uses Openverse, and the font browser uses Fontsource. Your search words and your IP address go to them, and a sound or font you pick is fetched from their servers. Nothing else leaves your device: your projects, media and edits stay here. You can switch this off any time in the View menu (Online search).';

async function onlineChecks(O) {
  let s = mem(), net = O.createNet(s);
  assert.equal(net.state, 'ask'); assert.equal(net.allowed, false);
  net.allow(); assert.equal(net.state, 'on'); assert.equal(s.d.get('vk.online'), 'on'); assert.equal(O.createNet(s).state, 'on', 'remembered');
  net.deny(); assert.equal(net.state, 'off'); net.set(true); assert.equal(net.allowed, true);
  const seen = []; const off = net.onChange((v) => seen.push(v)); net.set(true); net.set(false); net.set(false); off(); net.set(true);
  assert.deepEqual(seen, ['off'], 'onChange fires on a change only, and stops after off()');
  // a private window keeps the choice for the session
  const p = O.createNet(dead); assert.equal(p.state, 'ask'); p.allow(); assert.equal(p.state, 'on'); p.deny(); assert.equal(p.state, 'off');
  // the old key is copied once and left in place; the shared key wins afterwards
  s = mem(); s.setItem('kmp.online', 'on'); net = O.createNet(s, { legacyKeys: ['kmp.online'] });
  assert.equal(net.state, 'on'); assert.equal(s.d.get('vk.online'), 'on'); assert.equal(s.d.get('kmp.online'), 'on');
  net.deny(); s.setItem('kmp.online', 'on'); assert.equal(O.createNet(s, { legacyKeys: ['kmp.online'] }).state, 'off', 'the shared key wins over the old one');
  assert.equal(O.createNet(mem(), { legacyKeys: ['kmp.online'] }).state, 'ask');
  // the gate refuses BEFORE fetch
  let calls = 0, got = null; const fake = async (u, i) => { calls++; got = [u, i]; return { ok: true }; };
  net = O.createNet(mem()); const gf = O.gatedFetch(net, fake);
  await assert.rejects(gf('https://x/a'), (e) => e.name === 'NetworkOff' && e.state === 'ask' && /not been allowed/.test(e.userMessage.what)); assert.equal(calls, 0);
  net.deny(); await assert.rejects(gf('https://x/a'), (e) => e.state === 'off' && /turned off/.test(e.userMessage.what)); assert.equal(calls, 0);
  net.allow(); assert.deepEqual(await gf('https://x/a', { headers: { a: 1 } }), { ok: true }); assert.deepEqual(got, ['https://x/a', { headers: { a: 1 } }]);
  await gf('https://x/b', { purpose: 'Fontsource search', headers: { a: 1 } }); assert.deepEqual(got[1], { headers: { a: 1 } }, 'purpose is never sent');
  // purpose reaches the notice while the state is "ask", never once it is decided
  net = O.createNet(mem()); const asked = []; net.onBlocked((pp) => asked.push(pp)); const g2 = O.gatedFetch(net, fake);
  await assert.rejects(g2('u', { purpose: 'Fontsource search' })); net.deny(); await assert.rejects(g2('u', { purpose: 'again' })); assert.deepEqual(asked, ['Fontsource search']);
  // the notice
  const nt = O.noticeFor([{ name: 'Openverse', for: 'searching sounds', item: 'sound' }, { name: 'Fontsource', for: 'the font browser', item: 'font' }]);
  assert.equal(nt.body, KMP_NOTICE_BODY, "KOMPOSITOR's notice, word for word"); assert.equal(nt.title, 'Search online?'); assert.equal(nt.allow, 'Allow online search'); assert.equal(nt.later, 'Not now');
  assert.match(O.noticeFor([{ name: 'Fontsource', for: 'the font picker', item: 'font' }]).body, /^The font picker uses Fontsource\. .* a font you pick is fetched/);
  assert.match(O.noticeFor([{ name: 'A', for: 'a', item: 'x' }, { name: 'B', for: 'b', item: 'y' }, { name: 'C', for: 'c', item: 'z' }]).body, /a x, y or z you pick/);
  assert.match(O.noticeFor([]).body, /^Online search uses third-party services\./);
}

async function expectFail(name, fn) {
  let failed = false; try { await fn(); } catch { failed = true; }
  assert.ok(failed, `MUTANT NOT CAUGHT: ${name}`);
  console.log(`  mutant caught: ${name}`);
}

console.log('licence.js');
await licenceChecks(await load('licence.js')); console.log('  checks pass');
const lm = (name, from, to) => expectFail(name, async () => licenceChecks(await load('licence.js', (s) => s.replace(from, to))));
await lm('ND is shown', 'if (p.nd) return', 'if (false) return');
await lm('personal use unlocks Share-Alike', 'if (p.sa && !sa)', 'if (p.sa && !sa && !personal)');
await lm('NC shown without the switch', 'if (p.nc && !personal)', 'if (false)');
await lm('CC0 asks for credit', "cc0: CC('CC0', 'CC0', { credit: false,", "cc0: CC('CC0', 'CC0', { credit: true,");
await lm('unknown licences are shown', 'if (!p) return { shown: false', 'if (!p) return { shown: true');
await lm('SPDX ids are not read', "s = s.replace(/^cc-/, '');", '');
await lm('credits list every item', 'if (!all && !needsCredit(c.licence)) continue;', '');
await lm('credits are not de-duplicated', 'if (seen.has(k)) continue; seen.add(k);', '');

console.log('online.js');
await onlineChecks(await load('online.js')); console.log('  checks pass');
const om = (name, from, to) => expectFail(name, async () => onlineChecks(await load('online.js', (s) => s.replace(from, to))));
await om('the gate is open', 'if (!net.allowed) {', 'if (false) {');
await om('the old key is not read', 'for (const k of legacyKeys)', 'for (const k of [])');
await om('the old key is not copied', 'if (o) { put(o); return o; }', 'if (o) { return o; }');
await om('purpose is sent to the network', 'const { purpose, ...rest } = init; return fetchFn(url, rest);', 'return fetchFn(url, init);');
await om('onChange fires every time', 'if (s !== last) {', 'if (true) {');
await om('the notice wording changes', 'Your search words and your IP address go to them', 'Your search words go to them');

fs.rmSync(TMP, { recursive: true, force: true });
console.log('licence + online: all checks pass, every mutant caught');
