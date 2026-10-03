// V3KTR menu icons (v0.28.0: + link, unlink from KOMPOSITOR K25). THE SOURCE: edit this file, then run scripts/build-menu-icons.mjs (writes the JSON + sheet).
// Promoted once a third app wanted the set (KOMPOSITOR, 2026-10-02): DIMENSOR drew the first ones (src/ui/icons.js),
// PROCESSOR v0.585.0 and KOMPOSITOR copied them character for character and added their own verbs in the same
// language. Apps take them from here now instead of copying.
// Language: a 24-unit grid, a 1.4 stroke in currentColor, round caps and joins, no fills, drawn at 14px in menus.
// Aliases share one drawing because the apps name the verb differently:
//   compare = split · rotcw = rotate · fliph = flip · pan = move · undo = reset
// A new verb is drawn HERE first (same grid and stroke), then used in the app.
export const MENU_ICONS = {
  actual: '<rect x="4" y="4" width="16" height="16"/><path d="M9 9v6M15 9v6M12 10v.5M12 13.5v.5"/>',
  book: '<path d="M4 5h6a2 2 0 012 2v13a2 2 0 00-2-2H4zM20 5h-6a2 2 0 00-2 2v13a2 2 0 012-2h6z"/>',
  compare: '<path d="M12 3v18" stroke-dasharray="2 2"/><rect x="3" y="7" width="6" height="10"/><rect x="15" y="7" width="6" height="10"/>',
  crop: '<path d="M7 3v14h14"/><path d="M3 7h14v14"/>',
  cursor: '<path d="M6 3l12 9-5 1 3 6-2.500 1-3-6-4.500 3z"/>',
  dice: '<rect x="4" y="4" width="16" height="16"/><circle cx="9" cy="9" r="1.1"/><circle cx="15" cy="15" r="1.1"/><circle cx="15" cy="9" r="1.1"/><circle cx="9" cy="15" r="1.1"/>',
  doc: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 14h7M9 17h4"/>',
  down: '<path d="M6 10l6 6 6-6"/>',
  dup: '<rect x="8" y="8" width="12" height="12"/><path d="M4 16V4h12"/>',
  export: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>',
  eye: '<path d="M2 12s4-6.5 10-6.5S22 12 22 12s-4 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
  eyeOff: '<path d="M3 3l18 18M6.5 7.5C3.800 9.300 2 12 2 12s4 6.500 10 6.500c1.700 0 3.200-.500 4.500-1.200M10 5.800A9 9 0 0112 5.500c6 0 10 6.500 10 6.500a16 16 0 01-2.600 3.200"/>',
  film: '<rect x="3" y="5" width="18" height="14"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  flip: '<path d="M12 3v18"/><path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
  fliph: '<path d="M12 3v18"/><path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
  flipv: '<path d="M3 12h18"/><path d="M8 8l4-4 4 4M8 16l4 4 4-4"/>',
  frame: '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
  freeze: '<rect x="4" y="5" width="16" height="14"/><path d="M10 9v6M14 9v6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.500v.5"/>',
  keys: '<rect x="3" y="6" width="18" height="12"/><path d="M7 10h1M11 10h1M15 10h1M7 14h10"/>',
  link: '<path d="M10 14a4 4 0 005.660 0l3-3a4 4 0 00-5.660-5.660l-1 1"/><path d="M14 10a4 4 0 00-5.660 0l-3 3a4 4 0 005.660 5.660l1-1"/>',
  lock: '<rect x="6" y="11" width="12" height="9"/><path d="M8.500 11V8a3.500 3.500 0 017 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14"/><path d="M3 6l9 7 9-7"/>',
  markin: '<path d="M10 4H7v16h3"/><path d="M12 12h8M16 8l4 4-4 4"/>',
  markout: '<path d="M14 4h3v16h-3"/><path d="M12 12H4M8 8l-4 4 4 4"/>',
  move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  new: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>',
  open: '<path d="M3 7h6l2 2h10v10H3z"/>',
  openproj: '<path d="M3 7h6l2 2h10v10H3z"/><path d="M8 13h8M8 16h5"/>',
  pan: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
  paste: '<rect x="5" y="5" width="14" height="16"/><path d="M9 5V3h6v2"/>',
  play: '<path d="M7 5l12 7-12 7z"/>',
  receive: '<path d="M20 12H7M12 6l-6 6 6 6"/><path d="M4 5v14"/>',
  redo: '<path d="M19 12a7 7 0 11-7-7h5"/><path d="M14 2l3 3-3 3"/>',
  reset: '<path d="M5 12a7 7 0 107-7H7"/><path d="M10 2L7 5l3 3"/>',
  reverse: '<path d="M19 6l-7 6 7 6zM12 6l-7 6 7 6z"/>',
  rotate: '<path d="M20 12a8 8 0 11-3-6.200"/><path d="M17 2v4h-4"/>',
  rotccw: '<path d="M4 12a8 8 0 103-6.200"/><path d="M7 2v4h4"/>',
  rotcw: '<path d="M20 12a8 8 0 11-3-6.200"/><path d="M17 2v4h-4"/>',
  save: '<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
  scale: '<rect x="4" y="12" width="8" height="8"/><path d="M12 12l8-8M14 4h6v6"/>',
  send: '<path d="M4 12h13M12 6l6 6-6 6"/><path d="M20 5v14"/>',
  snap: '<path d="M6 4v8a6 6 0 0012 0V4"/><path d="M6 8h4M14 8h4"/>',
  split: '<path d="M12 3v18" stroke-dasharray="2 2"/><rect x="3" y="7" width="6" height="10"/><rect x="15" y="7" width="6" height="10"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  undo: '<path d="M5 12a7 7 0 107-7H7"/><path d="M10 2L7 5l3 3"/>',
  unlink: '<path d="M10 14a4 4 0 005.660 0l3-3a4 4 0 00-5.660-5.660l-1 1"/><path d="M14 10a4 4 0 00-5.660 0l-3 3a4 4 0 005.660 5.660l1-1"/><path d="M4 4l16 16"/>',
  unlock: '<rect x="6" y="11" width="12" height="9"/><path d="M8.500 11V8a3.500 3.500 0 016.800-1"/>',
  up: '<path d="M6 14l6-6 6 6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
  zoomin: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5M10.5 8v5"/>',
  zoomout: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M8 10.5h5"/>',
};
export function menuIconSvg(name, size = 14) {
  const p = MENU_ICONS[name];
  return p ? `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>` : '';
}
