// V3KTR online-search switch (v0.41.192: no imports, so it vendors flat like link-badge.js). ONE switch and ONE notice for every
// third-party call an app makes from the browser: Openverse, Fontsource, Poly Haven, ambientCG. Generalised from KOMPOSITOR
// sounds/network.js (Patrick, 2026-10-08, Q5 = A: direct calls after a one-time notice, with a switch in the app); the suite
// decision is `SUITE-assets-fonts` / `SUITE-assets-licence` (2026-11-26: "one policy everywhere"). Nothing is fetched until the
// user has allowed it, and nothing while the switch is off: gatedFetch refuses BEFORE it calls fetch.
//
//   const net = createNet(localStorage)              net.state 'ask' | 'on' | 'off', net.allowed
//   net.allow() / net.deny() / net.set(bool)         remembered in this browser (a private window keeps it for the session)
//   net.onChange(fn) → off()                         state changes (the View ▸ Online search menu follows it)
//   net.onBlocked(fn) → off()                        a call was refused while the state is 'ask': open the notice (fn(purpose))
//   gatedFetch(net, fetch)(url, init)                a fetch that throws NetworkOff while not allowed; init.purpose ("Fontsource
//                                                    search") is only read here, never sent
//   noticeFor(providers, { menu })                   the one-time notice's words, from the providers the app uses; `menu` is the
//                                                    View menu item the app really has (default "Online search"; KOMPOSITOR's is
//                                                    "Online Search", and createNet(storage, { menu }) carries it into NetworkOff)
//
// The switch is stored under `vk.online`. An app that used another key before (KOMPOSITOR's `kmp.online`) passes it in
// `legacyKeys`: it is read once, copied to the shared key and left in place. Not legal advice; the notice wording is PROVISIONAL
// (Patrick should read it).

export const NET_KEY = 'vk.online';

export class NetworkOff extends Error {
  constructor(state, purpose, menu = 'Online search') {
    super('online search is not allowed'); this.name = 'NetworkOff'; this.state = state; this.purpose = purpose || '';
    this.userMessage = state === 'ask'
      ? { what: 'Online search has not been allowed yet.', todo: 'Choose Allow in the notice first.' }
      : { what: 'Online search is turned off.', todo: `Turn it on in the View menu (${menu}) to search.` };
  }
}

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const join = (a) => (a.length < 2 ? a.join('') : a.length === 2 ? `${a[0]} or ${a[1]}` : `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]}`);

/**
 * The notice. providers: [{ name: 'Openverse', for: 'searching sounds', item: 'sound' }, { name: 'Fontsource', for: 'the font
 * browser', item: 'font' }]. → { title, body, allow, later }. With the two providers above the body is KOMPOSITOR's, word for word.
 */
export function noticeFor(providers = [], { menu = 'Online search' } = {}) {
  const ps = providers.filter((p) => p && p.name);
  const uses = ps.map((p) => `${p.for || 'search'} uses ${p.name}`);
  const lead = uses.length ? `${cap(uses[0])}${uses.length > 1 ? `, and ${uses.slice(1).join(', and ')}` : ''}.` : 'Online search uses third-party services.';
  const items = [...new Set(ps.map((p) => p.item).filter(Boolean))];
  const pick = items.length ? `a ${join(items)} you pick is fetched from their servers` : 'what you pick is fetched from their servers';
  return {
    title: 'Search online?',
    body: `${lead} Your search words and your IP address go to them, and ${pick}. Nothing else leaves your device: your projects, media and edits stay here. You can switch this off any time in the View menu (${menu}).`,
    allow: 'Allow online search',
    later: 'Not now',
  };
}

export function createNet(storage, { key = NET_KEY, legacyKeys = [], menu = 'Online search' } = {}) {
  let mem = null; // the choice for this session when storage can't keep it
  const get = (k) => { try { const v = storage.getItem(k); return v === 'on' || v === 'off' ? v : null; } catch { return null; } };
  const put = (v) => { try { storage.setItem(key, v); mem = null; } catch { mem = v; } };
  const read = () => {
    const v = get(key); if (v) return v;
    for (const k of legacyKeys) { const o = get(k); if (o) { put(o); return o; } }   // once: the old key is copied, not removed
    return null;
  };
  const changed = new Set(), blocked = new Set();
  const state = () => mem ?? read() ?? 'ask';
  let last = state();
  const write = (on) => {
    put(on ? 'on' : 'off');
    const s = state();
    if (s !== last) { last = s; for (const f of [...changed]) f(s); }
  };
  return {
    get state() { return state(); },
    get allowed() { return state() === 'on'; },
    get menu() { return menu; },
    allow() { write(true); },
    deny() { write(false); },
    set(on) { write(!!on); },
    onChange(f) { changed.add(f); return () => changed.delete(f); },
    onBlocked(f) { blocked.add(f); return () => blocked.delete(f); },
    _blocked(purpose) { for (const f of [...blocked]) f(purpose); },
  };
}

/** A fetch that makes no request unless the user has allowed online search. */
export const gatedFetch = (net, fetchFn = (...a) => fetch(...a)) => async (url, init) => {
  if (!net.allowed) {
    const purpose = init && init.purpose;
    if (net.state === 'ask') net._blocked(purpose);
    throw new NetworkOff(net.state, purpose, net.menu);
  }
  if (init && 'purpose' in init) { const { purpose, ...rest } = init; return fetchFn(url, rest); }
  return fetchFn(url, init);
};
