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
// angle detents follow the VALUE's degrees when min/max are given (DIMENSOR's ranges)
const fr=(deg,min,max)=>(deg-min)/(max-min);
for (const [min,max] of [[-720,720],[-360,360],[-90,90],[1,90],[0,360],[-180,180]]) {
  for (let d = Math.ceil(min/45)*45; d <= max; d += 45) { const f = fr(d+0.3,min,max); assert.ok(Math.abs(snap(f,{angle:true,min,max}) - fr(d,min,max)) < 1e-12, `${min}..${max} snaps to ${d}`); assert.equal(snap(f,{angle:true,min,max},true), f); n += 2; }
  const off = fr((Math.ceil(min/45)*45)+22.5,min,max); if (off <= 1) { assert.equal(snap(off,{angle:true,min,max}), off, `${min}..${max} mid-way stays`); n++; }
}
// a 0..360 range in degrees equals PROCESSOR's fraction-of-a-turn behaviour
for (let i = 0; i < 1000; i++) { const f = i/1000 + 0.0003; assert.ok(Math.abs(snap(f,{angle:true,min:0,max:360}) - pAngle(f,false)) < 1e-12, `0..360 ${f}`); n++; }   // +0.0003 keeps points off the exact pull boundary, where float rounding decides
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
console.log(`scrub: ${n + 14} checks passed (snap matches PROCESSOR at 1001 points, both modes; 45° detents in degrees on six ranges)`);
