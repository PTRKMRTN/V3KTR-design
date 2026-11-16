// V3KTR INCEPTOR icons (v0.41.126, Patrick 2026-11-17: "the two tone icons as everywhere else for INCEPTOR"). THE SOURCE: edit this file.
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
  polygon: '<path d="M12 3.500l7.500 4.300v8.400L12 20.500l-7.500-4.300V7.800z"/><path d="M12 12L4.500 7.800M12 12l7.500-4.200M12 12v8.500" opacity="0.3"/>' + dot(12, 12),
  star: '<path d="M12 3l2.700 5.700 6.100.8-4.500 4.300 1.200 6.100L12 16.900l-5.500 3 1.200-6.100-4.500-4.300 6.100-.8z"/>' + dot(12, 12.500),
  line: '<path d="M5 19L19 5"/>' + dot(5, 19, 0.6, 1.700) + dot(19, 5, 0.6, 1.700),
  spiral: '<path d="M12 12c0-1 1-2 2-1s1 3-1 4-5 0-5-3 3-6 6-5 6 4 4 8-6 6-9 4"/><path d="M12 3v18M3 12h18" opacity="0.3"/>',
  type: '<path d="M6 5.500h12M12 5.500V19"/><path d="M9.500 19h5" opacity="0.6"/>',
  areatype: '<path d="M4 4h16v16H4z" opacity="0.6"/><path d="M8 9h8M12 9v7M10 16h4"/>',
  pathtype: '<path d="M3 19c4-10 14-10 18 0" opacity="0.6"/><path d="M9 4.500h6M12 4.500V9"/>',
  knife: '<path d="M4.500 19.500L17 5l2.500 2.500-8.500 12.500z"/><path d="M14.500 9.500l-3 3" opacity="0.6"/><path d="M3 9h5" opacity="0.3"/>',
  scissors: '<circle cx="6" cy="7" r="2.200"/><circle cx="6" cy="17" r="2.200"/><path d="M7.700 8.400L20 18M7.700 15.600L20 6"/>' + dot(12.500, 12),
  eraser: '<path d="M4.500 14.500l8-8 6 6-6.500 6.500H8z"/><path d="M9.500 9l6 6" opacity="0.6"/><path d="M14 20.500h6" opacity="0.3"/>',
  builder: '<path d="M9 7.500a4.500 4.500 0 1 0 .1 0"/><path d="M15 7.500a4.500 4.500 0 1 0 .1 0" opacity="0.6"/><path d="M12 8.300a4.500 4.500 0 0 1 0 7.400 4.500 4.500 0 0 1 0-7.400z" fill="currentColor" stroke="none" opacity="0.3"/>',
  width: '<path d="M3 12c3-6 6-6 9 0s6 6 9 0M3 12c3 6 6 6 9 0s6-6 9 0"/><path d="M3 12h18" opacity="0.3"/>',
  eyedrop: '<path d="M14 4l6 6-3 1-7 7H6v-4l7-7z"/><path d="M6 18l-2 2" opacity="0.6"/><circle cx="19" cy="18.500" r="1.500" opacity="0.6"/>',
  hand: '<path d="M8 13V6a1.500 1.500 0 0 1 3 0v5M11 11V4.500a1.500 1.500 0 0 1 3 0V11M14 11V6a1.500 1.500 0 0 1 3 0v7c0 4-2 7-6 7-3 0-4-2-6-5l-1.500-2.500a1.400 1.400 0 0 1 2.300-1.600L8 13"/>',
  zoom: '<path d="M10 4a6 6 0 1 0 .1 0M14.500 14.500L20 20"/><path d="M7.500 10h5M10 7.500v5" opacity="0.6"/>',
  snap: '<path d="M6 4v8a6 6 0 0 0 12 0V4M6 4h4v8a2 2 0 0 0 4 0V4h4"/><path d="M6 8h4M14 8h4" opacity="0.6"/>',
  grid: '<path d="M4 4h16v16H4z"/><path d="M4 10h16M4 15h16M10 4v16M15 4v16" opacity="0.6"/>',
  outline: '<path d="M5 5h14v14H5z"/><path d="M9 9h6v6H9z" opacity="0.6"/>',
  fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><path d="M9 9h6v6H9z" opacity="0.6"/>',
  guide: '<path d="M3 8h18"/><path d="M10 3v18" opacity="0.6"/>',
  done: '<path d="M5 12l5 5 9-10"/>',
  rubber: '<path d="M4 18c4-8 12-8 16 0"/>' + dot(4, 18, 1, 1.500) + dot(20, 18, 1, 1.500) + dot(12, 10, 0.6, 1.500),
  autoadd: '<path d="M12 3v6M9 6h6"/><path d="M3 20c4-8 14-8 18 0" opacity="0.6"/>',
  corner: '<path d="M4 20V10a6 6 0 0 1 6-6h10"/><path d="M4 20h.1" opacity="0.6"/>',
  // effectors
  efTrans: '<path d="M12 3v18M3 12h18M12 3l-2 2M12 3l2 2M21 12l-2-2M21 12l-2 2M12 21l-2-2M12 21l2-2M3 12l2-2M3 12l2 2"/><path d="M10 10h4v4h-4z" opacity="0.6"/>',
  efRand: '<path d="M5 5h14v14H5z"/><path d="M9 9h.1M15 15h.1M12 12h.1"/><path d="M15 9h.1M9 15h.1" opacity="0.3"/>',
  efPush: '<path d="M4 12h12M12 8l4 4-4 4"/><path d="M20 5v14" opacity="0.6"/><path d="M4 7h4M4 17h4" opacity="0.3"/>',
  efAlign: '<path d="M5 4v16"/><path d="M5 8h10M5 12h14M5 16h7" opacity="0.6"/>',
  efColour: '<path d="M12 4a8 8 0 1 0 .1 0"/><path d="M12 12V4M12 12l6.900 4M12 12l-6.900 4" opacity="0.6"/>',
  efVis: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><path d="M12 9.500a2.500 2.500 0 1 0 .1 0" opacity="0.6"/>',
  efSpring: '<path d="M4 12h3l1-4 2 8 2-8 2 8 2-8 1 4h3"/><path d="M4 20h16" opacity="0.3"/>',
  efStep: '<path d="M4 18h4v-4h4v-4h4V6h4"/><path d="M4 18L20 6" opacity="0.3"/>',
  efSnap: '<path d="M4 4h16v16H4zM4 12h16M12 4v16" opacity="0.3"/><path d="M16 13a3 3 0 1 0 .1 0"/>' + dot(16, 16, 1, 1.200),
};
export function inceptorIconSvg(name, size = 14) {
  const b = INCEPTOR_ICONS[name]; if (!b) return '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
}
