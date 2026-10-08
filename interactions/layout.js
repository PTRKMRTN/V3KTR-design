// V3KTR workspace align (v0.39.0; Patrick 2026-10-08, View ▸ Interface): which side the workspace's fixed-width
// panels (rail, side panel(s), inspector) sit on. 'right' is every app's layout today, unchanged: the viewport is
// the flexible column (minmax(0,1fr)) and stays wherever it already is; 'left' mirrors it, the panels moving to the
// left edge and the viewport taking the right. Same shape and storage pattern as helperText() (interactions/help.js).
//
//   const ws = workspaceAlign('kompositor');   // reads the remembered value, sets data-ws-align, returns it
//   ws.on === 'right' | 'left'
//   ws.set('left') / ws.toggle()                // toggle() flips right ↔ left
//
// data-ws-align is set on <html> only when 'left' (removed for 'right', the default, so the default DOM is
// unchanged — same convention as data-helper-text). An app mirrors its own grid under [data-ws-align="left"]:
// the viewport stays the flexible track (minmax(0,1fr)); the fixed-width tracks (rail/panel/insp) move to the
// start of the row instead of the end, in the same left-to-right reading order they had (rail nearest the
// viewport). This file does not generate that CSS — grid-template-areas are app-specific — it only owns the
// attribute, the stored preference and the View ▸ Interface menu row's state.
export function workspaceAlign(app, { doc = document, store = (() => { try { return localStorage; } catch { return null; } })() } = {}) {
  const key = `v3ktr-${app}-ws-align`;
  let v = 'right';
  try { v = store?.getItem(key) === 'left' ? 'left' : 'right'; } catch {}
  const apply = () => { if (v === 'left') doc.documentElement.setAttribute('data-ws-align', 'left'); else doc.documentElement.removeAttribute('data-ws-align'); };
  apply();
  return {
    get on() { return v; },
    set(next) { v = next === 'left' ? 'left' : 'right'; try { store?.setItem(key, v); } catch {} apply(); return v; },
    toggle() { return this.set(v === 'left' ? 'right' : 'left'); },
  };
}
