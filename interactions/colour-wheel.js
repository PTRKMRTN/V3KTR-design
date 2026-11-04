// V3KTR colour wheel (v0.41.95): the behaviour behind .vk-wheel, the same in every app. Pattern: AGENTS.md "Colour wheels".
//
//   const w = bindColourWheel(el, { onChange({ x, y, hue, amount }) {…}, value: { x: 0, y: 0 } })
//   → { set({x,y}), get(), destroy() }
//
//   - el is <div class="vk-wheel"><div class="vk-wheel__puck"></div></div>. x,y run -1..1 from the centre (y down);
//     hue is the puck angle in degrees 0-360 (0 = right, clockwise on screen), amount 0-1 (distance from the centre).
//   - Drag the puck anywhere on the wheel; Shift while dragging moves it at a quarter of the speed (the shared slider rule);
//     double-click resets to the centre; arrow keys nudge (Shift = fine).
//   - Pointer events with capture, so it works with mouse and pen; the element gets tabindex 0 and role="slider".

export function bindColourWheel(el, { onChange, value } = {}) {
  const puck = el.querySelector('.vk-wheel__puck');
  let x = 0, y = 0, last = null;
  const clamp = (a, b, n) => Math.max(a, Math.min(b, n));
  const norm = () => { const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; } };
  function paint() {
    puck.style.left = (50 + x * 50) + '%';
    puck.style.top = (50 + y * 50) + '%';
    el.setAttribute('aria-valuetext', `hue ${Math.round(hue())}°, amount ${amount().toFixed(2)}`);
  }
  const hue = () => ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
  const amount = () => Math.min(1, Math.hypot(x, y));
  const emit = () => onChange && onChange({ x, y, hue: hue(), amount: amount() });
  function setTo(nx, ny, quiet) { x = nx; y = ny; norm(); paint(); if (!quiet) emit(); }
  function fromPointer(e, fine) {
    const r = el.getBoundingClientRect(), R = r.width / 2;
    const px = (e.clientX - r.left - R) / R, py = (e.clientY - r.top - R) / R;
    if (fine && last) setTo(x + (px - last.px) / 4, y + (py - last.py) / 4);
    else setTo(px, py);
    last = { px, py };
  }
  const down = e => { el.setPointerCapture(e.pointerId); last = null; fromPointer(e, false); last = null; el.dataset.drag = '1'; };
  const move = e => { if (el.dataset.drag) fromPointer(e, e.shiftKey); };
  const up = () => { delete el.dataset.drag; last = null; };
  const dbl = () => setTo(0, 0);
  const key = e => {
    const s = (e.shiftKey ? 0.01 : 0.05), d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
    if (d) { e.preventDefault(); setTo(x + d[0], y + d[1]); }
    else if (e.key === 'Escape' || e.key === 'Delete') setTo(0, 0);
  };
  el.setAttribute('tabindex', '0'); el.setAttribute('role', 'slider');
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('dblclick', dbl); el.addEventListener('keydown', key);
  if (value) setTo(clamp(-1, 1, value.x || 0), clamp(-1, 1, value.y || 0), true); else paint();
  return {
    set(v) { setTo(v.x || 0, v.y || 0, true); },
    get() { return { x, y, hue: hue(), amount: amount() }; },
    destroy() {
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      el.removeEventListener('dblclick', dbl); el.removeEventListener('keydown', key);
    },
  };
}
