// V3KTR Style icons (v0.40.1): one per KOMPOSE Style, for the Sequence inspector's Style grid. THE SOURCE: edit here,
// then run scripts/build-style-icons.mjs (writes the JSON + a contact sheet). Same language as icons/menu-icons.js:
// a 24-unit grid, a 1.4 stroke in currentColor, round caps and joins, no fills, drawn at 14px in the grid, larger
// in the sheet. A new style's icon is drawn HERE first, never in KOMPOSITOR.
export const STYLE_ICONS = {
  musicvideo: '<circle cx="9" cy="18" r="2.6"/><circle cx="18.5" cy="13" r="2.6"/><path d="M11.600 18V4.800l8.500-1.700v10"/>',
  trailer: '<path d="M4 10h16v10H4z"/><path d="M5 10l2.500-5.500h3l-2.500 5.500M11 10l2.500-5.500h3l-2.500 5.500M17 10l1.500-5.500h2l-1.500 5.500"/>',
  carfilm: '<path d="M5 16l1.300-4.700A2 2 0 018.200 10h7.600a2 2 0 011.900 1.300L19 16"/><rect x="3.500" y="16" width="17" height="4" rx="1.2"/><circle cx="7.800" cy="20.500" r="1.4"/><circle cx="16.200" cy="20.500" r="1.4"/>',
  dream: '<path d="M7.500 16.500a4 4 0 01-.300-7.980 5 5 0 019.550-1.670A4 4 0 0117 16.500h-9.500z"/><path d="M18.500 4.500l.700 1.700 1.700.700-1.700.700-.700 1.700-.700-1.700-1.700-.700 1.700-.700z"/>',
  montage: '<rect x="3" y="3.500" width="8" height="7.500"/><rect x="13" y="3.500" width="8" height="7.500"/><rect x="3" y="13" width="8" height="7.500"/><rect x="13" y="13" width="8" height="7.500"/>',
  hypereel: '<path d="M13.500 2.500L5.500 14h5.500l-1.600 7.500 9.100-13h-5.900z"/>',
  slowcinema: '<path d="M6.500 3h11M6.500 21h11M7.500 3c0 5.200 9 5.200 9 9s-9 3.800-9 9M16.500 3c0 5.200-9 5.200-9 9s9 3.800 9 9"/>',
  nightdrive: '<path d="M15.200 3.300a8.500 8.500 0 100 17.400 6.800 6.800 0 010-17.400z"/>',
};
export function styleIconSvg(name, size = 14) {
  const p = STYLE_ICONS[name];
  return p ? `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>` : '';
}
