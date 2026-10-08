// V3KTR split grip (v0.36.0, Patrick 2026-10-08; optional): a resize square centred on a vertical frame separator.
// A --grip square in the separator colour with the icon in the ground colour (app/frames.css .vk-fsep__grip); drag it,
// or focus it and use the arrows, to move the separator. The app owns the size: this reports a width, the app applies it.
//
//   const g = splitGrip(sepEl, { get, set, min, max, step, label })   → { destroy() }
//     sepEl   a .vk-fsep--l / .vk-fsep--r element; the grip is appended to it
//     get()   the current size in px (e.g. the side panel's width)
//     set(px) apply a new size (already clamped to min..max); persist it if you like
//     dir     +1 when dragging right GROWS the size (the separator is the frame's right edge), -1 when dragging right
//             SHRINKS it (the frame sits to the right of the separator). Default -1.
//     step    arrow-key step in px (default 10; Shift ×4). Home / End jump to min / max. Double-click calls reset().
//     reset() optional: put the default size back (double-click, or Enter)
//
//   - A role="separator" with aria-orientation="vertical", aria-valuenow/min/max and a tip via data-tip, so it works
//     from the keyboard and with a screen reader; tips come from interactions/help.js like every other control.
//   - Pointer capture, so a drag never loses the grip over an iframe or canvas; touch-action:none in the CSS.

const GRIP_ICON = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 3 1.5 6l3 3M7.5 3l3 3-3 3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="square"/></svg>';

export function splitGrip(sep, { get, set, min = 200, max = 800, dir = -1, step = 10, reset = null, label = 'Resize' } = {}) {
  const g = document.createElement('div');
  g.className = 'vk-fsep__grip';
  g.tabIndex = 0;
  g.setAttribute('role', 'separator');
  g.setAttribute('aria-orientation', 'vertical');
  g.setAttribute('aria-label', label);
  g.setAttribute('aria-valuemin', String(min));
  g.setAttribute('aria-valuemax', String(max));
  g.dataset.tip = label;
  g.dataset.tipDesc = 'Drag to resize; double-click to reset';
  g.innerHTML = GRIP_ICON;
  sep.appendChild(g);
  const clamp = (v) => Math.max(min, Math.min(max, Math.round(v)));
  const apply = (v) => { const c = clamp(v); set(c); g.setAttribute('aria-valuenow', String(c)); return c; };
  g.setAttribute('aria-valuenow', String(clamp(get())));

  let x0 = 0, s0 = 0, id = null;
  const down = (e) => {
    if (e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    id = e.pointerId; x0 = e.clientX; s0 = get();
    g.setPointerCapture(id); g.classList.add('is-dragging');
  };
  const move = (e) => { if (e.pointerId !== id) return; apply(s0 + dir * (e.clientX - x0)); };
  const up = (e) => {
    if (e.pointerId !== id) return;
    id = null; g.classList.remove('is-dragging');
    try { g.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  const key = (e) => {
    const k = e.key, s = (e.shiftKey ? 4 : 1) * step;
    let v = null;
    if (k === 'ArrowLeft') v = get() - dir * s;
    else if (k === 'ArrowRight') v = get() + dir * s;
    else if (k === 'Home') v = min;
    else if (k === 'End') v = max;
    else if (k === 'Enter' && reset) { reset(); g.setAttribute('aria-valuenow', String(clamp(get()))); }
    else return;
    e.preventDefault(); e.stopPropagation();
    if (v != null) apply(v);
  };
  const dbl = (e) => { if (!reset) return; e.preventDefault(); reset(); g.setAttribute('aria-valuenow', String(clamp(get()))); };
  g.addEventListener('pointerdown', down);
  g.addEventListener('pointermove', move);
  g.addEventListener('pointerup', up);
  g.addEventListener('pointercancel', up);
  g.addEventListener('keydown', key);
  g.addEventListener('dblclick', dbl);
  return {
    el: g,
    destroy() {
      g.removeEventListener('pointerdown', down); g.removeEventListener('pointermove', move);
      g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up);
      g.removeEventListener('keydown', key); g.removeEventListener('dblclick', dbl);
      g.remove();
    },
  };
}
