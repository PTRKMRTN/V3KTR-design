// V3KTR scrub behaviour (v0.23.0): how every horizontal value slider behaves under the pointer and the keyboard, the
// same in every app (Patrick 2026-10-02: "holding shift while scrubbing a slider input does a fine control. and any
// sliders that have an angle or centre type value can have the snapping feature").
// A port of PROCESSOR's fineDrag / snapAngle / snapMid (index.html, v0.592.0), which is the reference: change the
// behaviour here and in PROCESSOR together.
//
//   SHIFT = FINE. While Shift is held, pointer movement moves the value a tenth as far.
//     - Shift held at pointerdown: no jump to the click. The drag starts from the current value.
//     - Shift pressed mid-drag: fine from there. Released: back to 1:1 from wherever the value now is.
//     - A drag that never touches Shift reads the pointer as-is.
//   SNAPPING (detents), only for params that declare it:
//     - angle: true  → detents at every 45° of the value (0°, 45°, 90° …). Give min/max in degrees when the range isn't one
//                      full turn; without them the 0..1 fraction is taken as a full turn (PROCESSOR's case).
//     - mid: true    → a detent at the centre of the range (position, light direction, shift: "no offset").
//     Pull radius 1.4% of the range. Detents are OFF while Shift is held and during keyboard stepping: fine control
//     must be able to reach values right next to a detent.
//   KEYBOARD: ←/→ (and ↓/↑) step one displayed unit; Shift+arrow steps 10% of the range.
//
// Usage (one slider element, values min..max):
//   el.addEventListener('pointerdown', (e) => {
//     const drag = fineDrag(el, e, fraction());           // fraction(): the current value as 0..1
//     setFromX(drag.start, drag.fine);
//     const mv = (ev) => setFromX(drag.x(ev), drag.fine);
//     ...
//   });
//   function setFromX(x, fine) { let f = (x - r.left) / r.width; f = snap(f, param, fine()); ... }

const PULL = 0.014;   // detent pull radius, as a fraction of the range

/** Snap a 0..1 fraction to the param's detents. `off` = precision mode (Shift held, or keyboard stepping). */
export function snap(f, param, off = false) {
  if (off || !param) return f;
  if (param.angle) {
    // Detents fall on every 45° OF THE VALUE. With min/max (in degrees) given, a range that isn't 360° wide still snaps at
    // 45°: Twist -720..720, Tilt -90..90 (v0.23.1, found by DIMENSOR). Without them the fraction IS a full turn, which is
    // PROCESSOR's case: 1/8 of the range = 45°.
    if (isFinite(param.min) && isFinite(param.max) && param.max !== param.min) {
      const span = param.max - param.min, deg = param.min + f * span, n = Math.round(deg / 45) * 45;
      if (n >= Math.min(param.min, param.max) && n <= Math.max(param.min, param.max) && Math.abs(deg - n) / Math.abs(span) < PULL) return (n - param.min) / span;
    } else { const s = 1 / 8, n = Math.round(f / s) * s; if (Math.abs(f - n) < PULL) return n; }
  }
  if (param.mid && Math.abs(f - 0.5) < PULL) return 0.5;
  return f;
}

/**
 * Pointer tracking for one scrub, with Shift = fine.
 * @param el      the slider element (its bounding box is the track)
 * @param e       the pointerdown event
 * @param current the slider's current value as a 0..1 fraction
 * @returns { start, x(ev), fine() }: start = the clientX to set from at pointerdown; x(ev) = the clientX to use for a
 *          pointermove; fine() = true while Shift is held (pass it to snap() as `off`).
 */
export function fineDrag(el, e, current) {
  const r = el.getBoundingClientRect();
  let vx = (e.shiftKey && r.width && isFinite(current)) ? r.left + r.width * Math.max(0, Math.min(1, current)) : e.clientX;
  let prev = e.clientX, fine = e.shiftKey, held = !!e.shiftKey;
  return {
    start: vx,
    fine: () => held,
    x(ev) {
      held = !!ev.shiftKey;
      if (ev.shiftKey) fine = true;
      if (!fine) { vx = ev.clientX; prev = ev.clientX; return vx; }
      vx += (ev.clientX - prev) * (ev.shiftKey ? 0.1 : 1); prev = ev.clientX;
      if (r.width) vx = Math.max(r.left, Math.min(r.left + r.width, vx));   // no dead travel past the ends
      return vx;
    },
  };
}

/** Keyboard step for a scrub: one displayed unit, or 10% of the range with Shift. Returns the new value. */
export function keyStep(value, dir, { min = 0, max = 1, unit = 0.01, shift = false } = {}) {
  const v = value + dir * (shift ? (max - min) * 0.1 : unit);
  return Math.max(min, Math.min(max, v));
}
