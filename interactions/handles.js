// Viewport handle sizes and colours for a canvas / WebGPU overlay that cannot use CSS (DIMENSOR's curves and FX handles; docs/VIEWPORT-HANDLES.md).
// Sizes are CSS px in screen space (never scaled by the camera). Colours are read from the tokens, never hard-coded:
//   const hc = handleColours(document.documentElement);   // once per theme / app, e.g. when data-app is set
// States: rest = hc.accent, 10 px; hover and dragging = hc.hover, 12 px; selected = hc.white fill + 2 px hc.accent ring, 12 px;
// tangent = hc.accent at 0.6, 7 px. Smooth points are circles, sharp points diamonds. Selected curve line at 1, other curves at 0.6.
export const HANDLE = Object.freeze({ size: 10, hot: 12, tan: 7, hit: 24, curve: 2, aux: 1, ring: 2, halo: '0 0 1px rgba(0,0,0,.85)' });
export function handleColours(el, win = el.ownerDocument.defaultView) {
  const cs = win.getComputedStyle(el), get = (n) => cs.getPropertyValue(n).trim();
  return { accent: get('--accent'), hover: get('--hover'), onAccent: get('--on-accent'), white: get('--tx-0') };
}
