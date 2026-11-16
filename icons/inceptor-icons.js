// V3KTR INCEPTOR icons (v0.41.126, r2 v0.41.135, Patrick 2026-11-16: "the two tone icons as everywhere else for INCEPTOR"). THE SOURCE: edit this file.
// Same language as icons/menu-icons.js: a 24-unit grid, a 1.4 stroke in currentColor, round caps and joins, no fills except small dots.
// Two tones: the drawing itself at full strength, its construction (handles, nodes, guides, axes) at opacity 0.6, and the faintest context at 0.3.
// Replaces INCEPTOR's one-weight prototype drawings (V3KTR-INCEPTOR src/ui/icons.js) group by group; this first batch is the tools row and the Effector family.
// Names match INCEPTOR's `IC` keys so the app can swap them in one for one.
const dot = (x, y, o = 0.6, r = 1.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none" opacity="${o}"/>`;
export const INCEPTOR_ICONS = {
  // tools
  select: '<path d="M6 3.500l12 8.200-5.200 1.100L16 19.200l-2.400 1.100-3.200-6.300L6 17.600z"/>',
  direct: '<path d="M9 5l10 7.200-4.800 1 3 6.300-2.300 1.100-3-6.200L9 18z"/><path d="M3.500 3.500h4v4h-4z" opacity="0.6"/>',
  pen: '<path d="M12 2.500l6 9.500-6 3.500-6-3.500z"/><path d="M12 15.500V21M9 21h6" opacity="0.6"/>' + dot(12, 10.400, 1, 1.200),
  smartpen: '<path d="M9 3l5 8-5 3.500-5-3.500z"/><path d="M9 14.500V17" opacity="0.6"/><path d="M10 20c3 0 3-3 6-3s3 3 5 3" opacity="0.6"/>' + dot(9, 9.500, 1, 1.200),
  curvature: '<path d="M3.500 18c3-13 14-13 17 0"/><path d="M3.500 18h.1M20.500 18h.1" opacity="0.6"/>' + dot(12, 8.300, 1, 1.500),
  polyline: '<path d="M4 18l5-9 5 6 6-10"/>' + dot(4, 18) + dot(9, 9) + dot(14, 15) + dot(20, 5),
  pencil: '<path d="M5 19l1-4L16.500 4.500l3 3L9 18z"/><path d="M14 7l3 3" opacity="0.6"/><path d="M12.500 21H20" opacity="0.3"/>',
  rect: '<path d="M4.500 6.500h15v11h-15z"/>' + dot(4.500, 6.500) + dot(19.500, 6.500) + dot(4.500, 17.500) + dot(19.500, 17.500),
  ellipse: '<path d="M12 5.500c4.700 0 8.500 2.900 8.500 6.500s-3.800 6.500-8.500 6.500S3.500 15.600 3.500 12 7.300 5.500 12 5.500z"/>' + dot(12, 5.500) + dot(20.500, 12) + dot(12, 18.500) + dot(3.500, 12),
  polygon: '<path d="M20.600 12l-4.300 7.400H7.700L3.400 12l4.300-7.400h8.600z"/><path d="M12 12l4.300-7.400" opacity="0.3"/>' + dot(20.600, 12) + dot(16.300, 19.400) + dot(7.700, 19.400) + dot(3.400, 12) + dot(7.700, 4.600) + dot(16.300, 4.600) + dot(12, 12, 0.6, 1.100),
  star: '<path d="M12 3l2.700 5.700 6.100.8-4.500 4.300 1.200 6.100L12 16.900l-5.500 3 1.200-6.100-4.500-4.300 6.100-.8z"/>' + dot(12, 12.500),
  line: '<path d="M5 19L19 5"/>' + dot(5, 19, 0.6, 1.700) + dot(19, 5, 0.6, 1.700),
  spiral: '<path d="M12 12c0-1 1-2 2-1s1 3-1 4-5 0-5-3 3-6 6-5 6 4 4 8-6 6-9 4"/><path d="M12 3v18M3 12h18" opacity="0.3"/>',
  type: '<path d="M6 5.500h12M12 5.500V19"/><path d="M9.500 19h5" opacity="0.6"/>',
  areatype: '<path d="M4 4h16v16H4z" opacity="0.6"/><path d="M8 9h8M12 9v7M10 16h4"/>',
  pathtype: '<path d="M7 4h10M12 4v9.500"/><path d="M3 19c3-4 6-4 9 0s6 4 9 0" opacity="0.6"/>',
  knife: '<path d="M4.500 19.500L17 5l2.500 2.500-8.500 12.500z"/><path d="M14.500 9.500l-3 3" opacity="0.6"/><path d="M3 9h5" opacity="0.3"/>',
  scissors: '<circle cx="6" cy="7" r="2.200"/><circle cx="6" cy="17" r="2.200"/><path d="M7.700 8.400L20 18M7.700 15.600L20 6"/>' + dot(12.500, 12),
  eraser: '<path d="M4.500 14.500l8-8 6 6-6.500 6.500H8z"/><path d="M9.500 9l6 6" opacity="0.6"/><path d="M14 20.500h6" opacity="0.3"/>',
  builder: '<path d="M9 7.500a4.500 4.500 0 1 0 .1 0"/><path d="M15 7.500a4.500 4.500 0 1 0 .1 0" opacity="0.6"/><path d="M12 8.300a4.500 4.500 0 0 1 0 7.400 4.500 4.500 0 0 1 0-7.400z" fill="currentColor" stroke="none" opacity="0.3"/>',
  width: '<path d="M3 12c3-6 6-6 9 0s6 6 9 0M3 12c3 6 6 6 9 0s6-6 9 0"/><path d="M3 12h18" opacity="0.3"/>',
  eyedrop: '<path d="M14 4l6 6-3 1-7 7H6v-4l7-7z"/><path d="M6 18l-2.500 2.500" opacity="0.6"/><path d="M10.500 9.500l4 4" opacity="0.3"/>',
  hand: '<path d="M8 13V6a1.500 1.500 0 0 1 3 0v5M11 11V4.500a1.500 1.500 0 0 1 3 0V11M14 11V6a1.500 1.500 0 0 1 3 0v7c0 4-2 7-6 7-3 0-4-2-6-5l-1.500-2.500a1.400 1.400 0 0 1 2.300-1.600L8 13"/>',
  zoom: '<path d="M10 4a6 6 0 1 0 .1 0M14.500 14.500L20 20"/><path d="M7.500 10h5M10 7.500v5" opacity="0.6"/>',
  snap: '<path d="M6 4v8a6 6 0 0 0 12 0V4M6 4h4v8a2 2 0 0 0 4 0V4h4"/><path d="M6 8h4M14 8h4" opacity="0.6"/>',
  grid: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16" opacity="0.6"/>',
  outline: '<path d="M4 9.500h10v10H4z"/><circle cx="15" cy="9" r="5.500" opacity="0.6"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><path d="M9 9h6v6H9z" opacity="0.6"/>',
  guide: '<path d="M3 8h18"/><path d="M10 3v18" opacity="0.6"/>',
  done: '<path d="M5 12l5 5 9-10"/>',
  rubber: '<path d="M4 18.500c1-6 3-9.500 8-10.500"/><path d="M14 9l1.800 1.100M17.500 11.200l1.800 1.100" opacity="0.6"/><circle cx="21" cy="13.400" r="1.500" opacity="0.6"/>' + dot(4, 18.500, 1, 1.500) + dot(12, 8, 1, 1.500),
  autoadd: '<path d="M3 20c2-7 6-10 11-10.500" opacity="0.6"/><path d="M19 2.500v7M15.500 6h7"/>' + dot(14, 9.500, 1, 1.500),
  corner: '<path d="M4 20V10a6 6 0 0 1 6-6h10"/><path d="M4 20h.1" opacity="0.6"/>',
  // effectors
  efTrans: '<path d="M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M21 12l-2-2M21 12l-2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2"/><path d="M10 10h4v4h-4z" opacity="0.6"/>',
  efRand: '<path d="M5.100 4.100L9.900 6.100L7.900 10.900L3.100 8.900zM13 7.400L17.600 5L20 9.600L15.400 12zM11.200 13.300L14.700 17.200L10.800 20.700L7.300 16.800z"/><path d="M3 20.500h3M18 20.500h3M18 15.500h3" opacity="0.3"/>',
  efPush: '<path d="M4 12h12M12 8l4 4-4 4"/><path d="M20 5v14" opacity="0.6"/><path d="M4 7h4M4 17h4" opacity="0.3"/>',
  efAlign: '<path d="M3 17c6 0 7-9 18-10" opacity="0.3"/><path d="M1.9 13.3L5.2 11.6M5.5 10.5L8.2 7.8M13.8 4.5L17.4 3.3M5.2 21.1L8.7 19.6M12 17L14.7 14.3M16.2 12.8L19.8 11.5"/>' + dot(5.6, 11.4, 1, 1.200) + dot(8.5, 7.5, 1, 1.200) + dot(17.7, 3.1, 1, 1.200) + dot(9.1, 19.4, 1, 1.200) + dot(15, 14, 1, 1.200) + dot(20.1, 11.3, 1, 1.200),
  efColour: '<path d="M12 4a8 8 0 1 0 0 16c1.500 0 2.200-.9 2.200-2 0-1.600 1.100-2.500 2.600-2.500H18a2 2 0 0 0 2-2C20 7.800 16.400 4 12 4z"/>' + dot(7.800, 12.500) + dot(9.500, 8.200) + dot(14, 7.500),
  efVis: '<path d="M12 5C6 5 2 12 2 12s4 7 10 7"/><path d="M12 5c6 0 10 7 10 7s-4 7-10 7" opacity="0.3"/><path d="M12 9.300a2.700 2.700 0 0 0 0 5.400"/><path d="M12 9.300a2.700 2.700 0 0 1 0 5.400" opacity="0.3"/>',
  efSpring: '<path d="M6 12h1.500l1.300-4.500 2.600 9 2.600-9 2.600 9 1.300-4.500H18"/><path d="M4 6v12M20 6v12" opacity="0.6"/>',
  efStep: '<path d="M5 17h3.500v-4H12V9h3.500V5H19"/><path d="M3 3v18h18" opacity="0.3"/>',
  efSnap: '<path d="M4 8.500h16M4 15.500h16M8.500 4v16M15.500 4v16" opacity="0.6"/><path d="M15.500 12.300a3.200 3.200 0 1 0 .1 0"/>' + dot(15.500, 15.500, 1, 1.200),
};
export function inceptorIconSvg(name, size = 14) {
  const b = INCEPTOR_ICONS[name]; if (!b) return '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
}
