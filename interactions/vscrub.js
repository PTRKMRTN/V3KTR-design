// V3KTR narrow scrub behaviour (v0.41.112, Patrick 2026-11-13: minimal gestures): the behaviour behind .vk-vscrub, a one-number
// vertical tile for viewport toolbars and tool columns (never side panels or workspace tabs: those keep the labelled .vk-scrub).
//
//   const s = vscrub(el, { min: 0, max: 1, value: 0.5, step: 0.01, format: (v) => v.toFixed(2), onInput: (v) => … });
//   → { value, set(v, silent), destroy() }
//
// GESTURES (minimal set): drag up/down, mouse wheel, Up/Down arrows (Shift+arrow = 10% of the range). Shift while dragging = fine
// (a tenth as far, the same rule as .vk-scrub). No reset gesture, no type-in: exact entry lives in the app's side panel.
// HORIZONTAL FORM (v0.41.172): add .vk-vscrub--h for a horizontal toolbar: the fill is a width, a drag goes along x (right = more), Left/Right arrows join Up/Down.
// MARKUP: <div class="vk-vscrub" tabindex="0" role="slider" aria-label="Radius" data-tip="Radius"><i></i><svg/><span></span></div>
//   The <i> fill height and the <span> text are written here; aria-valuenow/min/max are kept current. Set aria-disabled="true" to freeze it.
// A drag across the full tile height of travel (TRAVEL px) moves the whole range; the fill follows the value, not the pointer.

const TRAVEL = 160;   // px of pointer travel for the full range

export function vscrub(el, { min = 0, max = 1, value = min, step = (max - min) / 100, format = (v) => String(+v.toFixed(2)), onInput } = {}) {
  const fill = el.querySelector('i'), label = el.querySelector('span'), horiz = el.classList.contains('vk-vscrub--h');
  let v = value;
  const clamp = (x) => Math.min(max, Math.max(min, x));
  const paint = () => {
    const f = (v - min) / (max - min || 1);
    if (fill) fill.style[horiz ? 'width' : 'height'] = (f * 100).toFixed(1) + '%';
    if (label) label.textContent = format(v);
    el.setAttribute('aria-valuemin', min); el.setAttribute('aria-valuemax', max); el.setAttribute('aria-valuenow', v);
    el.setAttribute('aria-valuetext', format(v));
  };
  const set = (x, silent) => {
    const n = clamp(Math.round((x - min) / step) * step + min);
    if (n === v) return;
    v = n; paint();
    if (!silent) { onInput && onInput(v); el.dispatchEvent(new CustomEvent('vscrub', { detail: { value: v }, bubbles: true })); }
  };
  const off = () => el.getAttribute('aria-disabled') === 'true';
  let drag = null;
  const down = (e) => {
    if (off() || e.button !== 0) return;
    el.setPointerCapture(e.pointerId); el.classList.add('is-drag');
    drag = { y: horiz ? e.clientX : e.clientY, v, fine: e.shiftKey };
  };
  const move = (e) => {
    if (!drag) return;
    const pos = horiz ? e.clientX : e.clientY;
    if (e.shiftKey !== drag.fine) { drag = { y: pos, v, fine: e.shiftKey }; }
    const k = (drag.fine ? 0.1 : 1) * (max - min) / TRAVEL;
    set(drag.v + (horiz ? pos - drag.y : drag.y - pos) * k);
  };
  const up = () => { drag = null; el.classList.remove('is-drag'); };
  const wheel = (e) => { if (off()) return; e.preventDefault(); set(v + (e.deltaY < 0 ? 1 : -1) * step * (e.shiftKey ? 1 : Math.max(1, Math.round((max - min) / step / 50)))); };
  const key = (e) => {
    const up = e.key === 'ArrowUp' || (horiz && e.key === 'ArrowRight'), dn = e.key === 'ArrowDown' || (horiz && e.key === 'ArrowLeft');
    if (off() || (!up && !dn)) return;
    e.preventDefault(); set(v + (up ? 1 : -1) * (e.shiftKey ? (max - min) / 10 : step));
  };
  el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', wheel, { passive: false }); el.addEventListener('keydown', key);
  paint();
  return { get value() { return v; }, set, destroy() { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); el.removeEventListener('wheel', wheel); el.removeEventListener('keydown', key); } };
}
