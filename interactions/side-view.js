// V3KTR depth side view (v0.27.0; CONNECTIVITY.md W1.5, DEPTH-BOX.md §6): a plate's depth seen from the side, and a box
// to place in it as a block you drag in depth and stretch in thickness. Lifted from KOMPOSITOR K24 (ui/side-view.js,
// main 47bc101) as built, with its wording made options so all three apps can use it:
//   KOMPOSITOR  Adjust behind auto-place: the inserted asset's box in the plate
//   PROCESSOR   Image ▸ Depth, Custom box: the near and far levels (use toRange / fromRange)
//   DIMENSOR    box modes
// It is the optional ADJUST behind an automatic placement: it only draws and drags the placement, it never decides it,
// and nothing must need it for the default to work.
//
//   const sv = mountSideView(el, { onInput(place), onCommit(place), onReset(), label, tip, tipDesc, emptyText })
//   sv.update({ plate, box, place, rect, auto })   redraws; the values are the caller's, never kept beyond a drag
//     plate  { data: Uint8Array (q in the box's own space, near = 255), width, height } or null (no depth yet)
//     box    the plate's depth box ({ space, near, far }); with it the view is drawn in linear terms (DEPTH-BOX §2)
//     place  { depth, thickness } linear (§6): the centre of the block and its depth share; rect { y, h } the rows it
//            covers (fractions of the frame; PROCESSOR's custom box spans the whole frame: { y: 0, h: 1 })
//     auto   the auto placement ({ subject }), drawn as a tick at the subject's depth
//   sv.destroy()
//   toRange(place) → { near, far } and fromRange({ near, far }) → place, for a near/far pair of levels.
//
// Seen from the side: the camera is on the left, depth runs to the right (near → far), the frame's rows run down. The
// plate is a density of where its pixels sit (every column folded onto its row); the block is the box. Drag the block to
// move it, drag either end to change its thickness (about its centre), double-click to go back to auto. Shift = fine
// (a tenth, the shared slider rule). Keys: ← → depth, ↑ ↓ thickness (Shift: ten times as far), Home: auto.
// Its two 2px ends are handles drawn on the depth, so they keep their lines (the on-canvas exception to flat states).

export const toRange = (p) => ({ near: Math.min(1, p.depth + p.thickness / 2), far: Math.max(0, p.depth - p.thickness / 2) });
export const fromRange = (r) => ({ depth: (r.near + r.far) / 2, thickness: Math.abs(r.near - r.far) });

const STEP = 0.01;      // one key press, in linear depth
const EDGE_PX = 6;      // the ends of the block, grabbable this far either side
const MIN_T = 0.02;     // the thinnest a box can be made

const toLin = (q, box) => {
  if (!box || box.space !== 'inv') return q;
  const z = 1 / (1 / box.far + q * (1 / box.near - 1 / box.far));
  return Math.max(0, Math.min(1, (box.far - z) / (box.far - box.near)));
};
const css = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

export function mountSideView(el, { onInput = () => {}, onCommit = () => {}, onReset = () => {},
  label = 'Depth side view: drag the block to move it in depth, drag an end to change its thickness',
  tip = 'Side view', tipDesc = 'Drag to move in depth, an end to change thickness, double-click for auto',
  emptyText = 'Depth still on its way' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'vk-side-view';
  canvas.tabIndex = 0;
  canvas.setAttribute('role', 'group');
  canvas.setAttribute('aria-label', label);
  canvas.dataset.tip = tip;   // shown by installTips (help.js)
  canvas.dataset.tipDesc = tipDesc;
  el.appendChild(canvas);
  let st = { plate: null, box: null, place: { depth: 0.5, thickness: 0.3 }, rect: { y: 0.2, h: 0.6 }, auto: null };
  let density = null, densityOf = null, drag = null;

  // the plate's side view: rows × depth bins, counted once per plate map
  function build(plate, box) {
    if (densityOf === plate && density && density.box === box) return density;
    const R = 64, B = 96, n = new Float32Array(R * B);
    if (plate) {
      const lut = new Float32Array(256); for (let v = 0; v < 256; v++) lut[v] = toLin(v / 255, box);
      const { data, width: w, height: h } = plate;
      for (let y = 0; y < h; y++) { const r = Math.min(R - 1, Math.floor(y / h * R)); for (let x = 0; x < w; x++) { const b = Math.min(B - 1, Math.floor((1 - lut[data[y * w + x]]) * B)); n[r * B + b]++; } }
      let max = 0; for (const v of n) max = Math.max(max, v);
      for (let i = 0; i < n.length; i++) n[i] = n[i] ? Math.min(1, 0.15 + Math.sqrt(n[i] / max)) : 0;
    }
    densityOf = plate; density = { R, B, n, box };
    return density;
  }

  const geom = () => {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    return { w: r.width, h: r.height, dpr, left: r.left, top: r.top };
  };
  const xOf = (l, g) => (1 - l) * g.w; // linear depth → x (near at the left)
  const blockX = g => { const { depth, thickness } = st.place; return [xOf(Math.min(1, depth + thickness / 2), g), xOf(Math.max(0, depth - thickness / 2), g)]; };

  function draw() {
    const g = geom();
    if (!g.w || !g.h) return;
    const W = Math.round(g.w * g.dpr), H = Math.round(g.h * g.dpr);
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const c = canvas.getContext('2d');
    c.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
    c.fillStyle = css(el, '--bg-1'); c.fillRect(0, 0, g.w, g.h);
    // the block: the asset's box over the rows it covers. Drawn BEHIND the plate (v0.27.1, found by PROCESSOR): a wide box
    // (PROCESSOR's Auto box often spans 5–87 % of the levels) used to cover the depth it sits in. Now a light tint first,
    // the plate on top, then the two ends as solid handles, so the distribution stays readable at any width.
    const [x0, x1] = blockX(g), y0 = Math.max(0, st.rect.y) * g.h, y1 = Math.min(1, st.rect.y + st.rect.h) * g.h;
    const accent = css(el, '--accent');
    c.fillStyle = accent; c.globalAlpha = drag ? 0.24 : 0.16; c.fillRect(x0, y0, Math.max(2, x1 - x0), y1 - y0);
    c.globalAlpha = 1;
    const d = build(st.plate, st.box);
    c.fillStyle = css(el, '--tx-2');
    const cw = g.w / d.B, ch = g.h / d.R;
    for (let r = 0; r < d.R; r++) for (let b = 0; b < d.B; b++) { const a = d.n[r * d.B + b]; if (a) { c.globalAlpha = a; c.fillRect(b * cw, r * ch, cw + 0.5, ch + 0.5); } }
    c.globalAlpha = 1;
    if (!st.plate) { c.fillStyle = css(el, '--tx-2'); c.font = `11px ${css(el, '--sans') || 'sans-serif'}`; c.fillText(emptyText, 8, g.h / 2); }
    c.fillStyle = accent; c.fillRect(x0, y0, 2, y1 - y0); c.fillRect(Math.max(x0, x1 - 2), y0, 2, y1 - y0); // the ends: handles
    if (st.auto && Number.isFinite(st.auto.subject)) { const sx = xOf(st.auto.subject, g); c.fillStyle = css(el, '--tx-1'); c.fillRect(sx - 0.5, 0, 1, 6); c.fillRect(sx - 0.5, g.h - 6, 1, 6); }
  }

  const clamp = p => ({ depth: Math.max(-0.5, Math.min(1.5, p.depth)), thickness: Math.max(MIN_T, Math.min(1, p.thickness)) });
  function hit(e) {
    const g = geom(), x = e.clientX - g.left, [x0, x1] = blockX(g);
    if (Math.abs(x - x0) <= EDGE_PX) return 'near';
    if (Math.abs(x - x1) <= EDGE_PX) return 'far';
    if (x > x0 && x < x1) return 'move';
    return 'move'; // anywhere else: the block jumps there and follows
  }
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    const g = geom(), kind = hit(e), x = e.clientX - g.left, start = { ...st.place };
    try { canvas.setPointerCapture(e.pointerId); } catch { /* a synthetic pointer (tests) has none to capture */ }
    drag = { kind, x, start, g, fine: e.shiftKey };
    if (kind === 'move' && !(x > blockX(g)[0] && x < blockX(g)[1])) { st.place = clamp({ ...start, depth: 1 - x / g.w }); drag.start = { ...st.place }; drag.x = x; onInput(st.place); }
    draw();
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag) { const k = hit(e); canvas.style.cursor = k === 'move' ? 'grab' : 'ew-resize'; return; }
    const k = e.shiftKey ? 0.1 : 1, dl = -(e.clientX - drag.g.left - drag.x) / drag.g.w * k, s = drag.start;
    if (drag.kind === 'move') st.place = clamp({ ...s, depth: s.depth + dl });
    else st.place = clamp({ ...s, thickness: s.thickness + (drag.kind === 'near' ? 2 * dl : -2 * dl) });
    onInput(st.place); draw();
  });
  const end = () => { if (!drag) return; drag = null; onCommit(st.place); draw(); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('dblclick', () => onReset());
  canvas.addEventListener('keydown', e => {
    const k = e.shiftKey ? 10 : 1, p = st.place;
    let next = null;
    if (e.key === 'ArrowLeft') next = { ...p, depth: p.depth + STEP * k };
    else if (e.key === 'ArrowRight') next = { ...p, depth: p.depth - STEP * k };
    else if (e.key === 'ArrowUp') next = { ...p, thickness: p.thickness + STEP * k };
    else if (e.key === 'ArrowDown') next = { ...p, thickness: p.thickness - STEP * k };
    else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); onReset(); return; }
    if (!next) return;
    e.preventDefault(); e.stopPropagation();
    st.place = clamp(next); draw(); onCommit(st.place);
  });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => draw()) : null;
  ro?.observe(canvas);

  return {
    update(next) { if (drag) return; st = { ...st, ...next, place: { ...st.place, ...(next.place || {}) } }; draw(); },
    get dragging() { return !!drag; },
    destroy() { ro?.disconnect(); canvas.remove(); },
  };
}
