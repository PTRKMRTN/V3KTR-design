// V3KTR INCEPTOR icons (v0.41.126, r2 v0.41.135, r3 v0.41.140 = the pen, Patrick 2026-11-16: "the two tone icons as everywhere else for INCEPTOR"). THE SOURCE: edit this file.
// Same language as icons/menu-icons.js: a 24-unit grid, a 1.4 stroke in currentColor, round caps and joins, no fills except small dots.
// Two tones: the drawing itself at full strength, its construction (handles, nodes, guides, axes) at opacity 0.6, and the faintest context at 0.3.
// Replaces INCEPTOR's one-weight prototype drawings (V3KTR-INCEPTOR src/ui/icons.js) group by group; this first batch is the tools row and the Effector family.
// Names match INCEPTOR's `IC` keys so the app can swap them in one for one.
const dot = (x, y, o = 0.6, r = 1.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none" opacity="${o}"/>`;
export const INCEPTOR_ICONS = {
  // tools
  select: '<path d="M6 3.500l12 8.200-5.200 1.100L16 19.200l-2.400 1.100-3.200-6.300L6 17.600z"/>',
  direct: '<path d="M9 5l10 7.200-4.800 1 3 6.300-2.300 1.100-3-6.200L9 18z"/><path d="M3.500 3.500h4v4h-4z" opacity="0.6"/>',
  pen: '<path d="M17 4l3 3-5 4.900v2.200L4.500 19.500 9.900 9h2.200z"/><path d="M12.100 9l2.900 2.900M9.600 14.400l-5.100 5.100" opacity="0.6"/><path d="M11 21.500c3.500 0 4.500-1.500 9-1.500" opacity="0.3"/>' + dot(9.800, 14.200, 1, 1.300),
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
  // batch 2: property latches and two panel icons (Patrick 2026-11-16: option toggles are icon toggles; APPROVED by Patrick 2026-11-18, "Approve all seven")
  underline: '<path d="M7 4v8a5 5 0 0 0 10 0V4"/><path d="M5 20.500h14" opacity="0.6"/>',
  strikethrough: '<path d="M16.500 7.500C16.100 5.600 14.500 4.500 12 4.500c-2.700 0-4.500 1.300-4.500 3.300 0 1.700 1.500 2.500 4.500 3.200"/><path d="M12 13c3 .7 4.500 1.500 4.500 3.200 0 2-1.800 3.300-4.500 3.300-2.600 0-4.200-1.100-4.600-3.100"/><path d="M4 12h16" opacity="0.6"/>',
  lockratio: '<path d="M9 12h6v5H9z"/><path d="M10.300 12v-1.200a1.700 1.700 0 0 1 3.400 0V12"/><path d="M4 9.500V4h5.500M20 14.500V20h-5.500" opacity="0.6"/>',
  scalestrokes: '<path d="M3.500 3.500h11v11h-11z"/><path d="M6.500 6.500h5v5h-5z" opacity="0.6"/><path d="M13 13l7.500 7.500M15.500 20.500h5v-5"/>',
  dash: '<path d="M3 15h3.500M9.500 15h3.500M16 15h5"/><path d="M3 9h18" opacity="0.3"/>',
  invertdepth: '<path d="M3 12h12" opacity="0.3"/><path d="M3.500 11.500c1.200-5.500 9.800-5.500 11 0"/><path d="M3.500 12.500c1.200 5.500 9.800 5.500 11 0" stroke-dasharray="1.600 2" opacity="0.6"/><path d="M19.500 7v10M17.500 9l2-2 2 2M17.500 15l2 2 2-2"/>',
  goinside: '<path d="M4 4h16v16H4z" opacity="0.6"/><path d="M12 12h6v6h-6z"/><path d="M6.500 6.500l5 5M12 8.500v3h-3"/>',
  // batch 3 (card DS-tool-tile-faces, Patrick 2026-11-18: A, icons on the on/off tiles): the two tool toggles with no icon yet (rubber and autoadd are batch 1); APPROVED by Patrick 2026-11-18 (review card DS-inceptor-icons-b3-r1)
  closenear: '<path d="M7 17C2 10 9 3 16 6s4 9 0 12c-2 1.500-4 1-5.500.500"/><path d="M11 17a4 4 0 1 0-8 0 4 4 0 1 0 8 0" opacity="0.6"/>' + dot(7, 17, 1, 1.300),
  symmetric: '<path d="M3 8.500c3-4 5 3 9 0s6-3.500 9 0"/><path d="M3 15.500c3 4 5-3 9 0s6 3.500 9 0" opacity="0.6"/><path d="M3 12h18" stroke-dasharray="2 2" opacity="0.3"/>',
  // rail batch 1 (INCEPTOR build session, 2026-11-26): FX rail Replicate (6) and Mask (3), the rows that drew the fallback squiggle. Keys are the lower-case row names.
  array: '<path d="M2.500 6.400h3.800v3.800H2.500z"/><path d="M10.100 6.400h3.800v3.800h-3.800zM2.500 14h3.800v3.800H2.500z" opacity="0.6"/><path d="M17.700 6.400h3.800v3.800h-3.800zM10.100 14h3.800v3.800h-3.800z" opacity="0.3"/><path d="M17.700 14h3.800v3.800h-3.800z" opacity="0.3"/>',
  blendsteps: '<circle cx="3.500" cy="12" r="2" fill="currentColor" stroke="none"/><rect x="7.800" y="9.500" width="5" height="5" rx="1.800" opacity="0.6"/><path d="M15.800 9h6v6h-6z"/>',
  depthsheets: '<path d="M3.500 20l4.500-4h12l-4.500 4z"/><path d="M3.500 14.500L8 10.500h12l-4.500 4z" opacity="0.6"/><path d="M3.500 9L8 5h12l-4.500 4z" opacity="0.3"/>',
  shatter: '<path d="M4 5l6.500-1-.5 6.500L4.500 9z"/><path d="M13.500 4.500L20 6l-1 5-6-1z"/><path d="M13.500 13.500l6-.5-1.500 6.500-5.500-.5z" opacity="0.6"/><path d="M4.500 12.500l6 .5-.5 6.500-4.500-1.500z" opacity="0.6"/>',
  slice: '<path d="M4 4h14L4 18z"/><path d="M20 6v14H6z"/><path d="M21 3L3 21" opacity="0.3"/>',
  typetunnel: '<path d="M3.500 3.500h17v17h-17z" opacity="0.3"/><path d="M6.500 6.500h11v11h-11z" opacity="0.6"/><path d="M3.500 3.500L6.500 6.500M20.500 3.500L17.500 6.500M3.500 20.500L6.500 17.500M20.500 20.500L17.500 17.500" opacity="0.3"/><path d="M9.200 9.200h5.600M12 9.200v5.800"/>',
  clipby: '<path d="M15 5.500H3.500v13H15" opacity="0.3"/><path d="M15 5.500a6.500 6.500 0 0 1 0 13" opacity="0.6"/><path d="M15 5.500a6.500 6.500 0 0 0 0 13z"/>',
  maskbyfield: '<path d="M12 4A6.500 6.500 0 0 0 12 17"/><path d="M12 4A6.500 6.500 0 0 1 12 17" stroke-dasharray="1.800 2.400" opacity="0.6"/><path d="M4.500 20.500H9"/><path d="M10 20.500h4.500" opacity="0.6"/><path d="M15.500 20.500H20" opacity="0.3"/>',
  visibilitybyfield: '<path d="M3.500 16c2.500-3.500 5-5 8.500-5s6 1.500 8.500 5c-2.500 3.500-5 5-8.500 5s-6-1.500-8.500-5z"/><circle cx="12" cy="16" r="2"/>' + dot(5, 5.500, 1, 1.500) + dot(9.500, 5.500, 1, 1.500) + dot(14, 5.500, 0.6, 1.500) + dot(18.500, 5.500, 0.3, 1.500),
  cloth: '<path d="M5 5.500c4.500 2 9.500-2 14 0v12c-4.500 2-9.500-2-14 0z"/><path d="M9.500 6.500c1 3.500 1 6.500 0 10M14.500 5.800c-1 3.500-1 7 0 11" opacity="0.6"/>' + dot(5, 5.500, 1, 1.500) + dot(19, 5.500, 1, 1.500),
  fallandsettle: '<circle cx="12" cy="4.500" r="2" opacity="0.3"/><circle cx="12" cy="10" r="2.200" opacity="0.6"/><ellipse cx="12" cy="17.400" rx="3.400" ry="2.300"/><path d="M4 21h16" opacity="0.6"/>',
  pile: '<circle cx="12" cy="8.900" r="2"/><circle cx="9.200" cy="13.700" r="2"/><circle cx="14.800" cy="13.700" r="2"/><circle cx="6.400" cy="18.500" r="2" opacity="0.6"/><circle cx="12" cy="18.500" r="2" opacity="0.6"/><circle cx="17.600" cy="18.500" r="2" opacity="0.6"/>',
  repel: '<circle cx="12" cy="12" r="3"/><path d="M8.800 8.800L6.500 6.500M15.200 8.800l2.300-2.300M8.800 15.200l-2.300 2.300M15.200 15.200l2.300 2.300" opacity="0.6"/>' + dot(4.800, 4.800, 1, 1.300) + dot(19.200, 4.800, 1, 1.300) + dot(4.800, 19.200, 1, 1.300) + dot(19.200, 19.200, 1, 1.300),
  rope: '<path d="M4 6L7.200 11.100L10.400 13.700L13.600 13.700L16.800 11.100L20 6"/>' + dot(4, 6, 1, 1.700) + dot(7.200, 11.100, 1, 1.300) + dot(10.400, 13.700, 1, 1.300) + dot(13.600, 13.700, 1, 1.300) + dot(16.800, 11.100, 1, 1.300) + dot(20, 6, 1, 1.700),
  softbody: '<path d="M3.500 15.500C3 9 8 5 12 5s9 4 8.500 10.500c-.2 2.300-2 3.500-4 3.500H7.500c-2 0-3.800-1.200-4-3.500z"/><path d="M5.500 11c2-1.500 4 1.500 6.500 0s4.500-1.500 6.500 0M5 15.200c2-1.500 4 1.500 7 0s5-1.500 7 0" opacity="0.6"/>',
  springfollow: '<path d="M3 12h18" opacity="0.3"/><path d="M3.500 19C5.500 19 6 5 8 5C10 5 10.500 15 12.500 15C14.500 15 14.500 10 16.500 10C18.500 10 18.500 12.500 20.500 12.500"/>' + dot(20.500, 12.500, 1, 1.600),
  textanimator: '<path d="M3.500 19L8.500 5.500l5 13.500M5.300 14.500h6.400"/><path d="M17 9l4 3-4 3z" opacity="0.6"/>',
  textbounce: '<path d="M3 21h18" opacity="0.3"/><path d="M3.500 21c.7-7 2.300-9.500 4-9.500s3.300 2.500 4 9.500" opacity="0.6"/><path d="M13.500 21c.5-4 1.600-5.500 3-5.500s2.500 1.500 3 5.500" opacity="0.3"/><path d="M5 2.500h5M7.500 2.500v6"/>',
  textspin: '<path d="M9.500 9h5M12 9v6.500"/><path d="M19.500 12A7.500 7.500 0 1 1 15.750 5.500M14.500 2.800l1.250 2.700-2.950.300" opacity="0.6"/>',
  textwave: '<path d="M2 8C4.500 8 7 14.500 12 14.500S19.500 8 22 8" opacity="0.3"/><path d="M3.300 5.200h4.400M5.500 5.200V10M9.800 11.700h4.400M12 11.700v4.800M16.300 5.200h4.400M18.500 5.200V10"/>',
  tilt: '<path d="M5 9h14v6H5z" opacity="0.3"/><path d="M4.400 11.600L17.600 6.800l2 5.600L6.400 17.200z"/>',
};
export function inceptorIconSvg(name, size = 14) {
  const b = INCEPTOR_ICONS[name]; if (!b) return '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
}
