// V3KTR reset to defaults (v0.41.0; Patrick 2026-10-08, File ▸ a bottom section): clears an app's remembered
// INTERFACE preferences — Helper Text, Workspace side, interface scale, dismissed tips, remembered link policies,
// and the like — back to what a fresh install would start with. It never touches saved work: projects, Looks,
// the library, exports. Every shared preference this repo ships (helperText, workspaceAlign, and any that follow)
// stores under the key 'v3ktr-<app>-...', precisely so this can find them without a hand-kept list; a NEW shared
// preference must follow that convention. An app's own prefs that predate the convention (and aren't renamed) are
// passed in as extraKeys.
//
//   interfaceKeys('processor', { extraKeys: ['processor-ui-scale'] })   → the keys reset would clear, to preview
//   resetInterface('processor', { extraKeys: [...], reload: true })    → clears them, then reloads (default)
//
// The confirmation is the app's own dialog (.vk-modal--danger): name what clears, say plainly that saved work is
// untouched, Cancel focused by default (this is destructive and not undoable). File ▸ "Reset <APP> to defaults…"
// at the bottom of the menu, its own section.
const prefixOf = (app) => `v3ktr-${app}-`;

export function interfaceKeys(app, { store = (() => { try { return localStorage; } catch { return null; } })() } = {}, { extraKeys = [] } = {}) {
  if (!store) return [];
  const prefix = prefixOf(app);
  const found = [];
  for (let i = 0; i < store.length; i++) { const k = store.key(i); if (k && k.startsWith(prefix)) found.push(k); }
  for (const k of extraKeys) if (store.getItem(k) != null) found.push(k);
  return found;
}

export function resetInterface(app, { store = (() => { try { return localStorage; } catch { return null; } })() } = {}, { extraKeys = [], reload = true, doc = document } = {}) {
  const keys = interfaceKeys(app, { store }, { extraKeys });
  for (const k of keys) { try { store.removeItem(k); } catch {} }
  if (reload && doc?.defaultView) doc.defaultView.location.reload();
  return keys;
}
