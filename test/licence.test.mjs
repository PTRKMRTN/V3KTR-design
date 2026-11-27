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
  for (const [x, v, spdx] of [['CC-BY-4.0', '', 'CC-BY-4.0'], ['by', '4.0', 'CC-BY-4.0'], ['BY', '3.0', 'CC-BY-3.0'], ['CC BY 4.0', '', 'CC-BY-4.0'], ['by', '', 'CC-BY'],
    ['cc0', '', 'CC0-1.0'], ['CC0-1.0', '', 'CC0-1.0'], ['pdm', '', 'PDM-1.0'], ['Public Domain', '', 'PDM-1.0'],
    ['by-sa', '4.0', 'CC-BY-SA-4.0'], ['CC-BY-NC-SA-3.0', '', 'CC-BY-NC-SA-3.0'], ['OFL-1.1', '', 'OFL-1.1'], ['SIL OFL 1.1', '', 'OFL-1.1'],
    ['MIT', '', 'MIT'], ['ISC', '', 'ISC'], ['Apache-2.0', '', 'Apache-2.0']]) assert.equal(L.parse(x, v).spdx, spdx, `${x} ${v}`);
  for (const bad of ['', null, undefined, 'sampling+', 'by-xx', 'GPL-3.0', 'all rights reserved', 'by-sa-nc', 'Apache-1.1', 'Apache-1.0', 'OFL-2.0', '0', 'cc-0', 'CC0-2.0', 'cc0-9.9', 'PDM-2.0']) assert.equal(L.parse(bad), null, String(bad));
  for (const [x, spdx] of [['Apache-2.0', 'Apache-2.0'], ['apache', 'Apache-2.0'], ['OFL-1.0', 'OFL-1.0'], ['OFL', 'OFL-1.1'], ['CC0-1.0', 'CC0-1.0'], ['PDM-1.0', 'PDM-1.0']]) assert.equal(L.parse(x).spdx, spdx, x);
  assert.equal(L.parse('by').label, 'CC BY', 'a licence with no stated version does not claim one'); assert.equal(L.parse('by', '3.0').label, 'CC BY 3.0');
  assert.equal(L.deedUrl('by'), 'https://creativecommons.org/licenses/by/4.0/', 'only the deed link defaults to 4.0'); assert.equal(L.deedUrl('by', '3.0'), 'https://creativecommons.org/licenses/by/3.0/');
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
  for (const free of ['pdm', 'ISC', 'Apache-2.0', 'MIT', 'OFL-1.1', 'cc0', 'V3KTR']) assert.equal(L.needsCredit(free), false, `${free} asks for no credit`);
  assert.deepEqual(L.filterShown([{ x: 'by' }, { x: 'by-nd' }], {}, (i) => [i.x, '']), [{ x: 'by' }], 'filterShown reads the licence where get() says');
  assert.equal(L.deedUrl('OFL-1.1'), 'https://openfontlicense.org/');
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
  const weird = [{ provider: 'p', id: 'au', title: 'Odd', licence: 'CC BY 2.5 AU' }, { provider: 'p', id: 'cu', title: 'Custom one', licence: 'Custom' }];
  assert.equal(L.creditsText(weird).split('\n').length, 2, 'unknown licences are listed: one line too many is better than one missing');
  assert.equal(L.cleanCredit({ provider: 'p', id: 'nolic', title: 'No licence' }), null, 'a record with an id and no licence is dropped');
  assert.equal(L.creditsText([]), ''); assert.equal(L.creditsText([{ provider: 'f', id: 'i', title: 'I', licence: 'OFL-1.1' }]), '');
  // the wire helpers: what a message or sidecar may carry
  assert.deepEqual(L.cleanCredits(undefined), []); assert.deepEqual(L.cleanCredits('x'), []); assert.deepEqual(L.cleanCredits({ id: 'a', licence: 'by' }), []);
  assert.deepEqual(L.cleanCredits([r, null, { id: 'x' }, { licence: 'by' }, 5, r]), [L.cleanCredit(r)], 'rejected entries are dropped and a repeat is kept once');
  { const a = { provider: 'p', id: '1', title: 'A', licence: 'CC-BY-4.0' }, a2 = { ...a, title: 'Other title' };
    assert.equal(L.cleanCredits([a, a2])[0].title, 'A', 'the first of a repeated provider and id wins'); }
  { const big = Array.from({ length: 300 }, (_, i) => ({ provider: 'p', id: 'i' + i, title: 'T' + i, licence: 'CC-BY-4.0' }));
    assert.equal(L.cleanCredits(big).length, 200, 'at most 200 entries'); assert.equal(L.cleanCredits(big)[199].id, 'i199', 'the first 200 are kept, in order');
    assert.equal(L.cleanCredits(big, { max: 5 }).length, 5); }
  { const long = 'x'.repeat(900), c = L.cleanCredits([{ provider: 'p', id: 'i', title: long, author: long, licence: 'CC-BY-4.0', url: 'https://e.org/' + long }])[0];
    assert.equal(c.title.length, 500); assert.equal(c.author.length, 500); assert.equal(c.url.length, 500, 'every string is cut to 500');
    assert.equal(L.cleanCredits([{ provider: 'p', id: 'i', title: long, licence: 'by' }], { maxLen: 10 })[0].title.length, 10); }
  { const many = Array.from({ length: 5 }, (_, i) => ({ provider: 'p', id: 'i' + i, title: 'T', licence: 'CC-BY-4.0' }));
    for (const [m, want] of [[0, 0], [-1, 0], [2.5, 2], [2, 2]]) assert.equal(L.cleanCredits(many, { max: m }).length, want, 'max ' + m + ' keeps ' + want);
    for (const m of [null, NaN, undefined, 'x']) assert.equal(L.cleanCredits(many, { max: m }).length, 5, 'a max of ' + String(m) + ' is the default, not a cap of one'); }
  for (const bad of [NaN, null, 'x', Infinity]) assert.equal(L.cleanCredits([{ provider: 'p', id: 'i', title: 'y'.repeat(900), licence: 'by' }], { maxLen: bad })[0].title.length, 500, 'maxLen ' + String(bad) + ' falls back to 500');
  { const t = 'x'.repeat(499) + '\u{1F600}tail', c = L.cleanCredits([{ provider: 'p', id: 'e', title: t, licence: 'by' }])[0];
    assert.equal(c.title, 'x'.repeat(499), 'a cut inside an emoji drops the half pair, no lone surrogate'); assert.doesNotMatch(c.title, /[\ud800-\udfff]/);
    const ok = L.cleanCredits([{ provider: 'p', id: 'e', title: 'x'.repeat(498) + '\u{1F600}tail', licence: 'by' }])[0].title; assert.equal(ok.length, 500, 'a whole pair that fits is kept'); }
  assert.deepEqual(L.mergeCredits({ id: 'a', licence: 'by' }), [], 'a bare record is not a list'); assert.deepEqual(L.mergeCredits({ id: 'a', licence: 'by' }, [r]).map((c) => c.id), [r.id]);
  assert.deepEqual(L.cleanCredits(L.cleanCredits([r, sh])), L.cleanCredits([r, sh]), 'cleaning twice changes nothing');
  assert.deepEqual(L.mergeCredits([r], [sh, r], undefined, [{ provider: 'p', id: 'z', title: 'Z', licence: 'CC0' }]).map((c) => c.id), [r.id, sh.id, 'z'], 'the union keeps order and drops repeats');
  assert.deepEqual(L.mergeCredits(), []);
  // which licences a sender lists: what creditsText lists, so a CC BY font or icon is in and an OFL font or MIT icon is out
  for (const [lic, want] of [['CC-BY-4.0', true], ['by-sa', true], ['by-nc', true], ['by-nc-sa', true], ['CC0', false], ['PDM', false], ['OFL-1.1', false], ['MIT', false], ['ISC', false], ['Apache-2.0', false], ['V3KTR', false], ['Custom', true], ['', true]])
    assert.equal(L.creditListed(lic), want, lic + ' listed: ' + want);
  for (const lic of ['CC-BY-4.0', 'by-nc', 'CC0', 'OFL-1.1', 'MIT', 'Custom', 'CC BY-SA 3.0']) assert.equal(L.creditsText([{ provider: 'p', id: 'i', title: 'T', licence: lic }]) !== '', L.creditListed(lic), 'creditsText and creditListed agree on ' + lic);
  // the file
  const f = L.creditsFileText([r, { id: 'n', title: 'N', licence: 'by-nc', provider: 'p' }], { name: 'My cut', notes: ['The sounds were cut.'] });
  assert.match(f, /^Credits in "My cut"\n\n"By Pad"/); assert.match(f, /The sounds were cut\./); assert.match(f, /non-commercial use only: this work must stay a personal project\./);
  assert.doesNotMatch(L.creditsFileText([r], { name: 'X' }), /non-commercial/); assert.equal(L.creditsFileText([], { name: 'X' }), '');
  assert.match(L.creditsFileText([r], { heading: 'Sounds in "X"' }), /^Sounds in "X"\n/);
}

// ---- online.js -----------------------------------------------------------------------------------------------------------
const mem = () => { const d = new Map(); return { getItem: (k) => (d.has(k) ? d.get(k) : null), setItem: (k, v) => d.set(k, String(v)), d }; };
const dead = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
// KOMPOSITOR's own words, as in sounds/network.js and its live menu item "Online Search" (ui/main.js, test/shell.mjs): NOT edited to fit the module.
const KMP_NOTICE_BODY = 'Searching sounds uses Openverse, and the font browser uses Fontsource. Your search words and your IP address go to them, and a sound or font you pick is fetched from their servers. Nothing else leaves your device: your projects, media and edits stay here. You can switch this off any time in the View menu (Online Search).';
const KMP_OFF_TODO = 'Turn it on in the View menu (Online Search) to search.';

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
  const KMP = { menu: 'Online Search' };
  const nt = O.noticeFor([{ name: 'Openverse', for: 'searching sounds', item: 'sound' }, { name: 'Fontsource', for: 'the font browser', item: 'font' }], KMP);
  assert.equal(nt.body, KMP_NOTICE_BODY, "KOMPOSITOR's notice, word for word, with its own menu name");
  assert.match(O.noticeFor([{ name: 'A', for: 'a' }]).body, /View menu \(Online search\)\.$/, 'the default menu name');
  { const k = O.createNet(mem(), KMP); k.deny(); await assert.rejects(O.gatedFetch(k, async () => 1)('u'), (e) => e.userMessage.todo === KMP_OFF_TODO); }
  assert.equal(nt.title, 'Search online?'); // assert.equal(nt.title, 'Search online?'); assert.equal(nt.allow, 'Allow online search'); assert.equal(nt.later, 'Not now');
  assert.match(O.noticeFor([{ name: 'Fontsource', for: 'the font picker', item: 'font' }]).body, /^The font picker uses Fontsource\. .* a font you pick is fetched/);
  assert.match(O.noticeFor([{ name: 'A', for: 'a', item: 'x' }, { name: 'B', for: 'b', item: 'y' }, { name: 'C', for: 'c', item: 'z' }]).body, /a x, y or z you pick/);
  assert.match(O.noticeFor([]).body, /^Online search uses third-party services\./);
}

async function expectFail(name, fn) {
  let failed = false; try { await fn(); } catch (e) { if (/mutation changed nothing/.test(String(e && e.message))) throw e; failed = true; }
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
await lm('credits list every item', 'if (!all && parse(c.licence) && !needsCredit(c.licence)) continue;', '');
await lm('PDM asks for credit', "pdm: CC('Public Domain', 'PDM', { credit: false,", "pdm: CC('Public Domain', 'PDM', { credit: true,");
await lm('ISC asks for credit', "isc: { label: 'ISC', kind: 'code', credit: false", "isc: { label: 'ISC', kind: 'code', credit: true");
await lm('Apache asks for credit', "apache: { label: 'Apache', kind: 'code', credit: false", "apache: { label: 'Apache', kind: 'code', credit: true");
await lm('filterShown ignores get', 'const g = get ? get(i) : [licenceOf(i), versionOf(i)];', 'const g = [licenceOf(i), versionOf(i)];');
await lm('the OFL deed link changes', "deed: () => 'https://openfontlicense.org/'", "deed: () => 'https://example.org/'");
await lm('a missing version is claimed as 4.0', "version || f.version || '';", "version || f.version || (f.kind === 'cc' ? '4.0' : '');");
await lm('Apache 1.1 is read', 'apache(?:-(2\\.0))?$', 'apache(?:-(\\d\\.\\d))?$');
await lm('unknown licences are dropped from the credits', 'if (!all && parse(c.licence) && !needsCredit(c.licence)) continue;', 'if (!all && !needsCredit(c.licence)) continue;');
await lm('credits are not de-duplicated', 'if (seen.has(k)) continue; seen.add(k);', '');
await lm('credit lists are not capped', 'if (out.length >= cap) break;', '');
await lm('credit strings are not cut', 'if (c[k].length > cut)', 'if (false)');
await lm('credit lists keep repeats', 'if (seen.has(key)) continue; seen.add(key);', '');
await lm('a non-array credit list is kept', 'if (!Array.isArray(list)) return [];', 'if (!list) return [];');
await lm('the wire limit is 100', 'CREDIT_MAX = 200', 'CREDIT_MAX = 100');
await lm('the string limit is 100', 'CREDIT_MAX_LEN = 500', 'CREDIT_MAX_LEN = 100');
await lm('a sender would drop unknown licences', 'export const creditListed = (licence) => !parse(licence) || needsCredit(licence);', 'export const creditListed = (licence) => needsCredit(licence);');
await lm('a zero or negative cap keeps one entry', 'Math.max(0, Math.floor(max))', 'Math.max(1, Math.floor(max))');
await lm('a fractional cap rounds up', 'Math.max(0, Math.floor(max))', 'Math.max(0, Math.ceil(max))');
await lm('a missing cap is a cap of one', ': CREDIT_MAX, cut', ': 1, cut');
await lm('a NaN string limit turns the cut off', 'Number.isFinite(maxLen) ?', 'true ?');
await lm('a cut inside an emoji leaves a lone surrogate', ".slice(0, cut).replace(/[\\ud800-\\udbff]$/, '')", '.slice(0, cut)');
await lm('merge keeps a bare record', 'lists.flatMap((l) => (Array.isArray(l) ? l : []))', 'lists.flat()');
await lm('merge drops the second list', 'cleanCredits(lists.flatMap((l) => (Array.isArray(l) ? l : [])))', 'cleanCredits(lists[0])');

console.log('online.js');
await onlineChecks(await load('online.js')); console.log('  checks pass');
const om = (name, from, to) => expectFail(name, async () => onlineChecks(await load('online.js', (s) => s.replace(from, to))));
await om('the gate is open', 'if (!net.allowed) {', 'if (false) {');
await om('the old key is not read', 'for (const k of legacyKeys)', 'for (const k of [])');
await om('the old key is not copied', 'if (o) { put(o); return o; }', 'if (o) { return o; }');
await om('purpose is sent to the network', 'const { purpose, ...rest } = init; return fetchFn(url, rest);', 'return fetchFn(url, init);');
await om('onChange fires every time', 'if (s !== last) {', 'if (true) {');
await om('the menu name is ignored by the notice', '(${menu}).`,', '(Online search).`,');
await om('the menu name is ignored by NetworkOff', 'View menu (${menu}) to search', 'View menu (Online search) to search');
await om('the notice wording changes', 'Your search words and your IP address go to them', 'Your search words go to them');

fs.rmSync(TMP, { recursive: true, force: true });
console.log('licence + online: all checks pass, every mutant caught');
