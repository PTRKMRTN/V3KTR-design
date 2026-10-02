// node test/scrub.test.mjs: checks interactions/scrub.js against PROCESSOR's reference functions.
import assert from 'node:assert/strict';
import { snap, fineDrag, keyStep } from '../interactions/scrub.js';
// PROCESSOR v0.592.0 reference (index.html), with its SCRUB_SNAP_OFF flag as an argument
const pAngle = (v, off) => { if (off) return v; const s = 1 / 8; const n = Math.round(v / s) * s; return (Math.abs(v - n) < 0.014) ? n : v; };
const pMid = (v, off) => { if (off) return v; return (Math.abs(v - 0.5) < 0.014) ? 0.5 : v; };
let n = 0;
for (let i = 0; i <= 1000; i++) { const f = i / 1000;
  for (const off of [false, true]) {
    assert.equal(snap(f, { angle: true }, off), pAngle(f, off), `angle ${f} off=${off}`);
    assert.equal(snap(f, { mid: true }, off), pMid(f, off), `mid ${f} off=${off}`); n += 2;
  } }
assert.equal(snap(0.3, {}), 0.3); assert.equal(snap(0.124, { angle: true }), 0.125); assert.equal(snap(0.124, { angle: true }, true), 0.124);
assert.equal(snap(0.49, { mid: true }), 0.5); assert.equal(snap(0.48, { mid: true }), 0.48);
// fineDrag: a 200px track at x=100; value at 25%
const el = { getBoundingClientRect: () => ({ left: 100, width: 200 }) };
let d = fineDrag(el, { clientX: 250, shiftKey: false }, 0.25);   // plain: jump to click
assert.equal(d.start, 250); assert.equal(d.x({ clientX: 260, shiftKey: false }), 260);
d = fineDrag(el, { clientX: 250, shiftKey: true }, 0.25);        // shift at down: start from the value, not the click
assert.equal(d.start, 150); assert.equal(d.x({ clientX: 260, shiftKey: true }), 151); assert.equal(d.fine(), true);
assert.equal(d.x({ clientX: 270, shiftKey: false }), 161); assert.equal(d.fine(), false);   // released: 1:1 from where it is
d = fineDrag(el, { clientX: 290, shiftKey: true }, 0.95); assert.equal(d.x({ clientX: 390, shiftKey: true }), 300); assert.equal(d.x({ clientX: 290, shiftKey: true }), 290);
assert.equal(d.x({ clientX: 2000, shiftKey: false }), 300);                                  // clamped to the track
assert.equal(keyStep(0.5, 1, { unit: 0.01 }), 0.51); assert.equal(keyStep(0.5, -1, { shift: true }), 0.4); assert.equal(keyStep(0.95, 1, { shift: true }), 1);
console.log(`scrub: ${n + 14} checks passed (snap matches PROCESSOR at 1001 points, both modes)`);
