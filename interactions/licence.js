// V3KTR licence gate and credits (v0.41.192: no imports, so it vendors flat like link-badge.js). ONE policy for every app: which
// third-party items (sounds, fonts, icons, models, textures) a user may see, which need a credit, and the credit text an export
// ships. Merged from KOMPOSITOR sounds/licence.js + sounds/credits.js (the policy, Patrick 2026-10-08) and INCEPTOR
// src/library/licence.js + credits.js; the suite decision is `SUITE-assets-licence` (2026-11-26: "one policy everywhere").
//
//   CC0, PDM, CC BY, MIT, ISC, Apache-2.0, OFL      always shown
//   V3KTR                                           always shown (what V3KTR drew itself: INCEPTOR's starter symbols; no credit)
//   CC BY-SA                                        hidden until the Share-alike switch is on
//   CC BY-NC, NC-SA                                 hidden until the user says the work is for personal use (every NC add warns);
//                                                   NC-SA needs both switches
//   CC BY-ND, NC-ND                                 never shown
//   anything else, unknown, missing                 never shown
//
// A licence is named by SPDX id (`CC-BY-4.0`) or by the provider's own words (`by`, `CC BY 4.0`, `cc0`, `OFL-1.1`); parse() reads
// both, so the gate never trusts a display name and never needs a hard-coded value. opts = { shareAlike, personal } (`sa` is read
// as shareAlike, the name KOMPOSITOR used). Wording of the warnings and the credits file is PROVISIONAL (Patrick should read it;
// not legal advice).
//
//   parse(licence, version?) → { family, version, spdx, label, kind, credit, nc, sa, nd } | null
//   decide(licence, opts) → { shown, why }     allowed(licence, opts) → boolean     filterShown(items, opts, get?)
//   needsCredit / isNonCommercial / isShareAlike (licence) · label(licence, version?) · deedUrl(licence, version?)
//   creditRecord(item, { provider, now }) → { provider, id, title, author, licence, url, (licenceUrl, fetchedAt) }
//   cleanCredit(record) → the same, strings only, or null with no id or no licence
//   creditLine(record) · creditsText(items, { all }) · creditsFileText(items, { name, heading, notes, ncNote })
//   ncWarning(noun) · saWarning(noun)

const CC = (label, spdxFamily, o = {}) => ({ label, kind: 'cc', credit: true, nc: false, sa: false, nd: false, spdxFamily, ...o });
const FAMILIES = {
  cc0: CC('CC0', 'CC0', { credit: false, version: '1.0', fixed: true, deed: (v) => `https://creativecommons.org/publicdomain/zero/${v}/` }),
  pdm: CC('Public Domain', 'PDM', { credit: false, version: '1.0', fixed: true, deed: (v) => `https://creativecommons.org/publicdomain/mark/${v}/` }),
  by: CC('CC BY', 'CC-BY'),
  'by-sa': CC('CC BY-SA', 'CC-BY-SA', { sa: true }),
  'by-nc': CC('CC BY-NC', 'CC-BY-NC', { nc: true }),
  'by-nc-sa': CC('CC BY-NC-SA', 'CC-BY-NC-SA', { nc: true, sa: true }),
  'by-nd': CC('CC BY-ND', 'CC-BY-ND', { nd: true }),
  'by-nc-nd': CC('CC BY-NC-ND', 'CC-BY-NC-ND', { nc: true, nd: true }),
  ofl: { label: 'OFL', kind: 'font', credit: false, nc: false, sa: false, nd: false, spdxFamily: 'OFL', version: '1.1', deed: () => 'https://openfontlicense.org/' },
  mit: { label: 'MIT', kind: 'code', credit: false, nc: false, sa: false, nd: false, spdxFamily: 'MIT', version: '', fixed: true, deed: () => 'https://opensource.org/license/mit' },
  isc: { label: 'ISC', kind: 'code', credit: false, nc: false, sa: false, nd: false, spdxFamily: 'ISC', version: '', fixed: true, deed: () => 'https://opensource.org/license/isc-license-txt' },
  own: { label: 'V3KTR', kind: 'own', credit: false, nc: false, sa: false, nd: false, spdxFamily: 'V3KTR', version: '', fixed: true, deed: () => '' },
  apache: { label: 'Apache', kind: 'code', credit: false, nc: false, sa: false, nd: false, spdxFamily: 'Apache', version: '2.0', deed: () => 'https://www.apache.org/licenses/LICENSE-2.0' },
};
const CC_DEFAULT_VERSION = '4.0';

const norm = (s) => String(s == null ? '' : s).trim().toLowerCase().replace(/[\s_]+/g, '-');
const VER = /^\d+\.\d+$/;

/** Read a licence given as an SPDX id, a Creative Commons code or a display string. Unknown or missing → null. */
export function parse(licence, version) {
  let s = norm(licence), v = VER.test(String(version || '')) ? String(version) : '';
  if (!s) return null;
  let m;
  if ((m = /^(?:sil-)?ofl(?:-(1\.[01]))?$/.exec(s))) return make('ofl', m[1] || v);
  if ((m = /^apache(?:-(2\.0))?$/.exec(s))) return make('apache', m[1] || v);
  if (s === 'mit') return make('mit', '');
  if (s === 'v3ktr') return make('own', '');
  if (s === 'isc') return make('isc', '');
  s = s.replace(/^cc-/, '');
  if ((m = /^cc0(?:-(1\.0))?$/.exec(s))) return make('cc0', m[1] || v);
  if ((m = /^(?:pdm|public-domain(?:-mark)?)(?:-(1\.0))?$/.exec(s))) return make('pdm', m[1] || v);
  if ((m = /^(by(?:-(?:nc|sa|nd))*?)(?:-(\d+\.\d+))?$/.exec(s)) && FAMILIES[m[1]]) return make(m[1], m[2] || v);
  return null;
}
function make(family, version) {
  const f = FAMILIES[family];
  const ver = f.fixed ? f.version : version || f.version || '';
  const spdx = f.spdxFamily + (ver ? '-' + ver : '');
  return { family, version: ver, spdx, label: f.fixed || !ver ? f.label : `${f.label} ${ver}`, kind: f.kind, credit: f.credit, nc: f.nc, sa: f.sa, nd: f.nd };
}

/** Whether a licence may be shown under these switches. `why` is the reason it is hidden, in words. */
export function decide(licence, opts = {}, version) {
  const sa = !!(opts.shareAlike ?? opts.sa), personal = !!opts.personal;
  const p = parse(licence, version);
  if (!p) return { shown: false, why: 'The licence is unknown or not one this app uses.' };
  if (p.nd) return { shown: false, why: 'No-Derivatives (ND) licences do not allow the item to be used in an edit.' };
  if (p.nc && !personal) return { shown: false, why: 'Non-commercial: shown only when the work is for personal use.' };
  if (p.sa && !sa) return { shown: false, why: 'Share-Alike: shown only when you switch Share-Alike on.' };
  return { shown: true, why: '' };
}
export const allowed = (licence, opts, version) => decide(licence, opts, version).shown;
const licenceOf = (i) => (i && (i.licence ?? i.license)) ?? '';
const versionOf = (i) => (i && (i.licenceVersion ?? i.licenseVersion ?? i.version)) || '';
/** The items the gate lets through, in order. `get(item)` returns [licence, version] when items keep it somewhere else. */
export const filterShown = (items, opts, get) => items.filter((i) => { const g = get ? get(i) : [licenceOf(i), versionOf(i)]; return allowed(g[0], opts, g[1]); });

export const needsCredit = (licence) => !!(parse(licence) || {}).credit;
export const isNonCommercial = (licence) => !!(parse(licence) || {}).nc;
export const isShareAlike = (licence) => !!(parse(licence) || {}).sa;
/** 'CC BY 4.0', 'CC0', 'Public Domain', 'OFL 1.1', 'MIT'; the raw text (or "Unknown licence") when it is not one we know. */
export const label = (licence, version) => { const p = parse(licence, version); return p ? p.label : String(licence || 'Unknown licence'); };
/** The licence deed (where to read it); '' when unknown. */
export function deedUrl(licence, version) {
  const p = parse(licence, version); if (!p) return '';
  const f = FAMILIES[p.family];
  if (f.deed) return f.deed(p.version);
  return `https://creativecommons.org/licenses/${p.family}/${p.version || CC_DEFAULT_VERSION}/`;
}

export const ncWarning = (noun = 'item') => `This ${noun} is licensed for non-commercial use only. Use it only in a project that is for personal use.`;
export const saWarning = (noun = 'item') => `Share-Alike: a work that adapts this ${noun} may have to be shared under the same licence.`;

// ---- credits -------------------------------------------------------------------------------------------------------------

const FIELDS = ['provider', 'id', 'title', 'author', 'licence', 'url', 'licenceUrl', 'fetchedAt'];
const str = (v) => (v == null ? '' : String(v));

/**
 * The record kept with a placed item. Reads either shape: the shared one, or KOMPOSITOR's Openverse one (creator, license,
 * licenseVersion, landingUrl). `licence` is the SPDX id when the licence is known, the provider's own text when not.
 */
export function creditRecord(item, { provider, now } = {}) {
  const p = parse(licenceOf(item), versionOf(item));
  const r = {
    provider: str(provider || item.provider), id: str(item.id), title: str(item.title), author: str(item.author ?? item.creator),
    licence: p ? p.spdx : str(licenceOf(item)), url: str(item.url ?? item.landingUrl),
  };
  const lu = item.licenceUrl ?? item.licenseUrl; if (lu) r.licenceUrl = str(lu);
  if (now) r.fetchedAt = (now instanceof Date ? now : new Date(now)).toISOString();
  return r;
}
/** A record from storage: the known fields as strings; null when it has no id or no licence. */
export function cleanCredit(rec) {
  if (!rec || typeof rec !== 'object') return null;
  const r = {}; for (const k of FIELDS) if (rec[k] != null && (rec[k] !== '' || k in { provider: 1, id: 1, title: 1, author: 1, licence: 1, url: 1 })) r[k] = str(rec[k]);
  for (const k of ['provider', 'id', 'title', 'author', 'licence', 'url']) if (!(k in r)) r[k] = '';
  return r.id && r.licence ? r : null;
}

/** True when a credit list should carry an item with this licence: the ones that ask for credit (CC BY and the like, NC and Share-Alike included) and the unknown ones, exactly the items `creditsText` lists. Fonts under OFL and code under MIT, ISC or Apache are not listed (Help ▸ Licences); a font or icon under CC BY is. */
export const creditListed = (licence) => !parse(licence) || needsCredit(licence);

/** The wire limits for credits sent between apps (Livelink `credits`, a sidecar, a pack): at most this many entries, each string at most this long. */
export const CREDIT_MAX = 200, CREDIT_MAX_LEN = 500;

/**
 * A credit list from outside (a message, a sidecar, a saved project) made safe to keep: an array of cleaned records, each string cut to
 * `maxLen` characters (never inside a surrogate pair), entries `cleanCredit` rejects dropped, de-duplicated by provider and id (the first wins), at most `max` of them.
 * Anything that is not an array is []. Text only: a url in a record is written into a credits file, never fetched or opened.
 */
export function cleanCredits(list, { max = CREDIT_MAX, maxLen = CREDIT_MAX_LEN } = {}) {
  if (!Array.isArray(list)) return [];
  const cap = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : CREDIT_MAX, cut = Number.isFinite(maxLen) ? Math.max(1, Math.floor(maxLen)) : CREDIT_MAX_LEN;
  const seen = new Set(), out = [];
  for (const raw of list) {
    if (out.length >= cap) break;
    const c = cleanCredit(raw); if (!c) continue;
    for (const k of Object.keys(c)) if (c[k].length > cut) c[k] = c[k].slice(0, cut).replace(/[\ud800-\udbff]$/, '');
    if (!c.id || !c.licence) continue;
    const key = `${c.provider}:${c.id}`; if (seen.has(key)) continue; seen.add(key);
    out.push(c);
  }
  return out;
}

/** The credits of several things sent on together (a clip that holds a received icon, a result with a stamp): the union, de-duplicated, within the wire limits. */
export const mergeCredits = (...lists) => cleanCredits(lists.flatMap((l) => (Array.isArray(l) ? l : [])));

/** One credit line: `"Title" by Author, CC BY 4.0 (deed). Source: url`. A licence that needs no credit says so. */
export function creditLine(c) {
  const p = parse(c.licence), lic = p ? p.label : str(c.licence) || 'Unknown licence';
  const deed = c.licenceUrl || (p ? deedUrl(c.licence) : '');
  const head = `"${c.title}"${c.author ? ` by ${c.author}` : ''}, ${lic}`;
  const src = c.url ? `. Source: ${c.url}` : '';
  let s = !p || p.credit ? `${head}${deed ? ` (${deed})` : ''}${src}` : `${head} (credit not required)${src}`;
  if (p && p.nc) s += '. Non-commercial: personal use only.';
  if (p && p.sa) s += ' Share-Alike.';
  return s;
}

/**
 * The lines for Copy and a credits file: the items whose licence asks for credit (CC BY and the like). { all: true } lists every
 * item given, the ones that need none included (KOMPOSITOR's sounds do). Code and font licences (MIT, ISC, Apache, OFL) belong to
 * Help ▸ Licences, so a caller passes them only with { all: true }. De-duplicated by provider and id, in order.
 */
export function creditsText(items, { all = false } = {}) {
  const seen = new Set(), out = [];
  for (const raw of items || []) {
    const c = cleanCredit(raw); if (!c) continue;
    const k = `${c.provider}:${c.id}`; if (seen.has(k)) continue; seen.add(k);
    if (!all && parse(c.licence) && !needsCredit(c.licence)) continue;
    out.push(creditLine(c));
  }
  return out.join('\n');
}

/** The text of a credits file: a heading, the lines, the notes the app adds, and the NC sentence when one item is NC. '' when empty. */
export function creditsFileText(items, { name = 'Untitled', heading, notes = [], ncNote = 'At least one item is licensed for non-commercial use only: this work must stay a personal project.', all = false } = {}) {
  const body = creditsText(items, { all });
  if (!body) return '';
  const nc = (items || []).some((i) => { const c = cleanCredit(i); return c && isNonCommercial(c.licence); });
  return [heading || `Credits in "${name}"`, '', body, '', ...notes, ...(nc && ncNote ? [ncNote] : []), ''].join('\n');
}
