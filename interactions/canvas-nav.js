// V3KTR canvas navigation (v0.41.133): scroll-zoom toward the cursor, drag-pan with grab / grabbing, middle-drag pan, double-click fit. The same in every app.
// Lifted from INCEPTOR src/nav.js, itself KOMPOSITOR ui/viewport.js, which ports PROCESSOR's 82-zoom-paint-mode.js wheel handler: three app copies became one
// (Patrick 2026-11-16, "the same canvas control as the other apps, in terms of grab and scroll zoom").
//
//   const nav = bindNav(well, { centre, canPan, skip, get, set, one, fit })   → { destroy() }
//     centre()   → { x, y }: the art's on-screen centre now (for zoom toward the cursor)
//     canPan(e)  → whether this pointerdown may start a pan (the app keeps item drags, handles and controls for itself)
//     skip(e)    → true for events the app handles itself (a toolbar, a toast); default none
//     get() / set(view): the app owns the view { zoom, panX, panY }
//     one()      → the zoom that means 100 % (default 1);  fit() → the fitted view { zoom, panX, panY }
//   Put `.vk-canvas-nav` on the well: grab / grabbing cursor (the class `.is-panning` is added while a pan is live) and touch-action:none.
//
// Wheel: delta normalised across devices (lines x16, pages x400), exp-mapped, clamped to 0.7-1.5 per event; Ctrl = trackpad pinch (faster), Shift = fine.
// A step that crosses 100 % lands on it (the detent). Zoom is clamped to ZOOM_MIN-ZOOM_MAX. A vector editor whose Select drags a marquee on empty canvas
// keeps pan on Space or middle-drag and moves the marquee to Shift-drag: that is the app's `canPan`, not this module's call.
export const ZOOM_MIN = 0.2, ZOOM_MAX = 12;

/** One wheel event → a zoom factor. */
export function wheelFactor({ deltaX = 0, deltaY = 0, deltaMode = 0, ctrlKey = false, shiftKey = false }) {
  let dy = shiftKey && deltaY === 0 ? deltaX : deltaY;      // Shift+wheel arrives on X on some platforms
  if (deltaMode === 1) dy *= 16; else if (deltaMode === 2) dy *= 400;
  const k = ctrlKey ? 0.006 : shiftKey ? 0.00015 : 0.0015;  // ctrl = trackpad pinch; Shift = fine
  return Math.min(1.5, Math.max(0.7, Math.exp(-dy * k)));
}
/** Clamp, with the 100 % detent: a step that crosses `one` lands on it. */
export function stepZoom(prev, factor, one = 1, min = ZOOM_MIN, max = ZOOM_MAX) {
  let z = Math.max(min, Math.min(max, prev * factor));
  if ((prev - one) * (z - one) < 0) z = one;
  return z;
}
/** Zoom toward a point (cx, cy = offset from the art's on-screen centre): the point under the cursor stays put. */
export function zoomAt(view, zoom, cx = 0, cy = 0) {
  const ratio = zoom / view.zoom;
  return { zoom, panX: view.panX + cx * (1 - ratio), panY: view.panY + cy * (1 - ratio) };
}

export function bindNav(well, { centre, canPan = () => true, get, set, one = () => 1, fit, skip = () => false, min = ZOOM_MIN, max = ZOOM_MAX }) {   // min / max (v0.41.145, INCEPTOR: 0.01 to 64)
  const onWheel = (e) => {
    if (skip(e)) return;
    e.preventDefault();
    const v = get(), c = centre();
    set(zoomAt(v, stepZoom(v.zoom, wheelFactor(e), one(), min, max), e.clientX - c.x, e.clientY - c.y));
  };
  let drag = null;
  const onDown = (e) => {
    const middle = e.button === 1;
    if ((e.button !== 0 && !middle) || skip(e) || (!middle && !canPan(e))) return;
    e.preventDefault();
    const v = get();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, panX: v.panX, panY: v.panY };
    well.setPointerCapture(e.pointerId); well.classList.add('is-panning');
  };
  const onMove = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    set({ zoom: get().zoom, panX: drag.panX + (e.clientX - drag.x), panY: drag.panY + (e.clientY - drag.y) });
  };
  const end = (e) => { if (drag && e.pointerId === drag.id) { drag = null; well.classList.remove('is-panning'); } };
  // pointer capture retargets the click to the well itself, so the well counts as empty canvas here
  const onDbl = (e) => { if (!skip(e) && (e.target === well || canPan(e))) set(fit()); };
  well.addEventListener('wheel', onWheel, { passive: false });
  well.addEventListener('pointerdown', onDown);
  well.addEventListener('pointermove', onMove);
  well.addEventListener('pointerup', end); well.addEventListener('pointercancel', end);
  well.addEventListener('dblclick', onDbl);
  return { destroy() {
    well.removeEventListener('wheel', onWheel); well.removeEventListener('pointerdown', onDown); well.removeEventListener('pointermove', onMove);
    well.removeEventListener('pointerup', end); well.removeEventListener('pointercancel', end); well.removeEventListener('dblclick', onDbl);
    well.classList.remove('is-panning');
  } };
}
