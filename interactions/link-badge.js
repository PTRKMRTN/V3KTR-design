// V3KTR linked-asset badge (v0.28.1: no imports; CONNECTIVITY.md W4.5, LINK-PROTOCOL.md): an asset that came from another V3KTR app
// (a DIMENSOR logo in a KOMPOSITOR timeline, a PROCESSOR piece in a DIMENSOR scene) says so, the same in every app.
// Lifted from KOMPOSITOR K25 (link/record.js badgeOf + ui/timeline-ui.js linkBadge) and generalised: the chain takes
// the OWNER app's colour from data-owner instead of a hard-coded one, and the protocol's 30 s silence has a state.
//
// Always the chain mark + a word (never colour alone):
//   linked         chain in the owner's colour      "Linked"                 updates when you ask
//   update         a solid owner-colour button      "Update available"       click: pull the new version (onUpdate)
//   closed         broken chain, grey               "Source closed"          plays from its saved copy
//   stale          chain in the caution yellow      "Source not responding"  no renderProgress for 30 s; last good rev kept
//   frozen         padlock, grey                    "Frozen"                 updates from the source are ignored
//   file           document page, grey              "File"                   (v0.34.0) came as dropped files, not a live link; rec.via === 'file'
// The actions live in a menu (linkBadgeMenu): Go to source · Update now · Update policy (On request / Live / Manual) ·
// Freeze. The app renders it with its own menu or popover; with onMenu set, every badge but "Update available" is a
// button that asks for it.
//
//   badgeOf(rec)                     → { state, word, desc } from a link record (K25's record shape, below)
//   linkBadge(rec, { onUpdate, onMenu, app }) → an element (re-render by replacing it)
//   linkBadgeHtml(rec, { app, actionable }) → the same as a string, for apps that build rows with innerHTML; wire the
//                                      clicks yourself: [data-link-update] = update, [data-link-menu] = open the menu
//   linkBadgeMenu(rec)               → [{ id, label, icon, disabled?, checked?, items? }] for the app's own menu
//   ids: 'source' · 'update' · 'policy:onRequest' · 'policy:live' · 'policy:manual' · 'freeze' (a toggle)
//
// A record: { ownerApp: 'dimensor', state: 'linked' | 'updateAvailable' | 'sourceClosed' | 'frozen', policy:
// 'onRequest' | 'live' | 'manual', notResponding?: true }. notResponding is set by the app's link code when a renderReq
// gets no renderProgress for NOT_RESPONDING_MS, and cleared by a later renderProgress or asset (LINK-PROTOCOL.md).
// A record with via: 'file' that is otherwise linked reads as "File" instead of "Linked" (nothing is connected: there is
// no source to ask). Everything with an action of its own still wins: Update available (a re-dropped newer export waits),
// Source closed, Source not responding, Frozen. Records without via read as before.
// The marks are inlined (v0.28.1, found by KOMPOSITOR K27): importing ../icons/menu-icons.js broke apps that
// vendor the design files flat. They are copies of menu-icons' link / unlink / lock / doc; test/link-badge.test.mjs checks
// they still match.
export const BADGE_ICONS = {
  link: '<path d="M10 14a4 4 0 005.660 0l3-3a4 4 0 00-5.660-5.660l-1 1"/><path d="M14 10a4 4 0 00-5.660 0l-3 3a4 4 0 005.660 5.660l1-1"/>',
  unlink: '<path d="M10 14a4 4 0 005.660 0l3-3a4 4 0 00-5.660-5.660l-1 1"/><path d="M14 10a4 4 0 00-5.660 0l-3 3a4 4 0 005.660 5.660l1-1"/><path d="M4 4l16 16"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 14h7M9 17h4"/>',
  lock: '<rect x="6" y="11" width="12" height="9"/><path d="M8.500 11V8a3.500 3.500 0 017 0v3"/>',
};

export const NOT_RESPONDING_MS = 30000;
export const LINK_POLICIES = [['onRequest', 'On request'], ['live', 'Live'], ['manual', 'Manual']];
const NAMES = { processor: 'PROCESSOR', kompositor: 'KOMPOSITOR', dimensor: 'DIMENSOR' };
const nameOf = (app) => NAMES[app] || String(app || 'its app').toUpperCase();

export function badgeOf(rec = {}) {
  const app = nameOf(rec.ownerApp);
  if (rec.state === 'frozen') return { state: 'frozen', word: 'Frozen', desc: 'Kept as it is: updates from its source are ignored' };
  if (rec.state === 'sourceClosed') return { state: 'closed', word: 'Source closed', desc: `Plays from its saved copy. Open it in ${app} to link it again` };
  if (rec.notResponding) return { state: 'stale', word: 'Source not responding', desc: `${app} hasn't answered for 30 s. Showing the last good version` };
  if (rec.state === 'updateAvailable' && rec.policy !== 'manual') return { state: 'update', word: 'Update available', desc: `${app} has a newer version. Click to use it` };
  if (rec.via === 'file') return { state: 'file', word: 'File', desc: `Dropped as files from ${app}. Drop a newer export to update.` };
  return { state: 'linked', word: 'Linked', desc: `Linked to ${app}. ${rec.policy === 'live' ? 'Updates as it changes' : 'Updates when you ask'}` };
}

const ICON = { linked: 'link', update: 'link', stale: 'link', closed: 'unlink', frozen: 'lock', file: 'doc' };
const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${BADGE_ICONS[name]}</svg>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function linkBadgeHtml(rec, { actionable = false } = {}) {
  const b = badgeOf(rec), owner = esc(rec.ownerApp || 'dimensor');
  const inner = `${svg(ICON[b.state])}<span>${esc(b.word)}</span>`;
  const attrs = `class="vk-lnk" data-owner="${owner}" data-state="${b.state}" data-tip="${esc(b.word)}" data-tip-desc="${esc(b.desc)}" aria-label="${esc(b.word + '. ' + b.desc)}"`;
  if (b.state === 'update') return `<button type="button" ${attrs} data-link-update>${inner}</button>`;
  if (actionable) return `<button type="button" ${attrs} data-link-menu aria-haspopup="menu">${inner}</button>`;
  return `<span ${attrs} role="img">${inner}</span>`;
}

export function linkBadge(rec, { onUpdate = () => {}, onMenu = null } = {}) {
  const t = document.createElement('template');
  t.innerHTML = linkBadgeHtml(rec, { actionable: !!onMenu });
  const el = t.content.firstElementChild;
  el.addEventListener('click', (e) => {
    e.stopPropagation(); // a badge sits on a row or a clip: its click is not a select
    if (el.hasAttribute('data-link-update')) onUpdate(rec);
    else if (onMenu) onMenu(el, linkBadgeMenu(rec), rec);
  });
  if (onMenu) el.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); onMenu(el, linkBadgeMenu(rec), rec); });
  return el;
}

export function linkBadgeMenu(rec = {}) {
  const app = nameOf(rec.ownerApp), frozen = rec.state === 'frozen', closed = rec.state === 'sourceClosed';
  return [
    { id: 'source', label: closed ? `Open in ${app}` : `Go to source (${app})`, icon: 'link' },
    { id: 'update', label: 'Update now', icon: 'down', disabled: frozen || rec.state !== 'updateAvailable' },
    { id: 'policy', label: 'Update policy', items: LINK_POLICIES.map(([id, label]) => ({ id: 'policy:' + id, label, checked: (rec.policy || 'onRequest') === id, disabled: frozen })) },
    { id: 'freeze', label: frozen ? 'Unfreeze' : 'Freeze', icon: frozen ? 'unlock' : 'lock', checked: frozen },
  ];
}
