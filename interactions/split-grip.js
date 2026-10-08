// V3KTR split grip (v0.36.0; horizontal lines v0.37.0, Patrick 2026-10-08; optional): a resize square centred on a frame
// separator. A --grip square in the separator colour with the icon in the ground colour (app/frames.css .vk-fsep__grip);
// drag it, or focus it and use the arrows, to move the separator. The app owns the size: this reports one, the app applies it.
//
//   const g = splitGrip(sepEl, { get, set, min, max, dir, step, reset, label })   → { el, destroy() }
//     sepEl   a .vk-fsep element; the grip is appended to it. Its class picks the axis: --l / --r = a VERTICAL line
//             (drags left/right, ←/→, col-resize); --t / --b = a HORIZONTAL line (drags up/down, ↑/↓, row-resize)
//     get()   the current size in px (a panel's width, or the upper frame's height)
//     set(px) apply a new size (already clamped to min..max); persist it if you like
//     min/max px, or functions returning px (for limits that follow the window: "the lower frame keeps 200px")
//     dir     +1 when dragging right / down GROWS the size (the separator is the frame's right or bottom edge), -1 when
//             it SHRINKS it (the frame sits right of / below the separator). Default -1 for a vertical line, +1 for a
//             horizontal one (the usual case: a frame owns the line on its bottom edge).
//     step    arrow-key step in px (default 10; Shift ×4). Home / End jump to min / max. Double-click calls reset().
//     reset() optional: put the default size back (double-click, or Enter)
//
//   - A role="separator" with aria-orientation (vertical or horizontal, the line's own direction), aria-valuenow/min/max
//     and a tip via data-tip, so it works from the keyboard and with a screen reader.
//   - Pointer capture, so a drag never loses the grip over an iframe or canvas; touch-action:none in the CSS.

const GRIP_ICON_V = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 3 1.5 6l3 3M7.5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>';
const GRIP_ICON_H = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 1.5l3 3M3 7.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>';

export function splitGrip(sep, { get, set, min = 200, max = 800, dir, step = 10, reset = null, label = 'Resize' } = {}) {
  const horiz = sep.classList.contains('vk-fsep--t') || sep.classList.contains('vk-fsep--b');
  if (dir == null) dir = horiz ? 1 : -1;
  const lo = () => (typeof min === 'function' ? min() : min), hi = () => (typeof max === 'function' ? max() : max);
  const g = document.createElement('div');
  g.className = 'vk-fsep__grip' + (horiz ? ' vk-fsep__grip--h' : '');
  g.tabIndex = 0;
  g.setAttribute('role', 'separator');
  g.setAttribute('aria-orientation', horiz ? 'horizontal' : 'vertical');
  g.setAttribute('aria-label', label);
  g.dataset.tip = label;
  g.dataset.tipDesc = 'Drag to resize; double-click to reset';
  g.innerHTML = horiz ? GRIP_ICON_H : GRIP_ICON_V;
  sep.appendChild(g);
  const clamp = (v) => { const a = lo(), b = Math.max(a, hi()); return Math.max(a, Math.min(b, Math.round(v))); };
  const aria = () => {
    g.setAttribute('aria-valuemin', String(Math.round(lo()))); g.setAttribute('aria-valuemax', String(Math.round(Math.max(lo(), hi()))));
    g.setAttribute('aria-valuenow', String(clamp(get())));
  };
  const apply = (v) => { const c = clamp(v); set(c); aria(); return c; };
  aria();

  let p0 = 0, s0 = 0, id = null;
  const pos = (e) => (horiz ? e.clientY : e.clientX);
  const down = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId; p0 = pos(e); s0 = get();
    g.setPointerCapture(id); g.classList.add('is-dragging');
  };
  const move = (e) => { if (e.pointerId !== id) return; apply(s0 + dir * (pos(e) - p0)); };
  const up = (e) => {
    if (e.pointerId !== id) return;
    id = null; g.classList.remove('is-dragging');
    try { g.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  const key = (e) => {
    const k = e.key, s = (e.shiftKey ? 4 : 1) * step;
    const back = horiz ? 'ArrowUp' : 'ArrowLeft', fwd = horiz ? 'ArrowDown' : 'ArrowRight';
    let v = null;
    if (k === back) v = get() - dir * s;
    else if (k === fwd) v = get() + dir * s;
    else if (k === 'Home') v = lo();
    else if (k === 'End') v = hi();
    else if (k === 'Enter' && reset) { reset(); aria(); }
    else return;
    e.preventDefault(); e.stopPropagation();
    if (v != null) apply(v);
  };
  const dbl = (e) => { if (!reset) return; e.preventDefault(); reset(); aria(); };
  g.addEventListener('pointerdown', down);
  g.addEventListener('pointermove', move);
  g.addEventListener('pointerup', up);
  g.addEventListener('pointercancel', up);
  g.addEventListener('keydown', key);
  g.addEventListener('dblclick', dbl);
  return {
    el: g,
    update: aria,
    destroy() {
      g.removeEventListener('pointerdown', down); g.removeEventListener('pointermove', move);
      g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
      g.removeEventListener('keydown', key); g.removeEventListener('dblclick', dbl);
      g.remove();
    },
  };
}
