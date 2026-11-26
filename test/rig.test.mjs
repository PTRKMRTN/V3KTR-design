// node --test test/rig.test.mjs    (Node 18+, no dependencies)
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRig, applyToLookAt, rig2d, RIGS, RIG_IDS } from '../motion/rig.js';

const L = 6;
const ease = (t, a, b) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * u * (u * (u * 6 - 15) + 10); };
const SUBJ = [0, 1.3, 0];
const MOVES = {
  hold: () => ({ p: [0.4, 1.6, -4.5], target: SUBJ, fov: 40 }),
  dolly: t => ({ p: [0, 1.55, -7 + 3.6 * ease(t, .8, 4.4)], target: SUBJ, fov: 40 }),
  orbit: t => { const a = 2 * Math.PI * t / L; return { p: [-Math.sin(a) * 5, 1.6, -Math.cos(a) * 5], target: SUBJ, fov: 40 }; },
  walk: t => { let s = 0; const h = 1 / 240, v = x => 1.3 * Math.min(1, Math.max(0, (x - .5) / .8)) * (1 - Math.min(1, Math.max(0, (x - 4.2) / .8))); for (let x = 0; x < t; x += h) s += v(x) * h; return { p: [0, 1.55, -9 + s], target: SUBJ, fov: 40 }; },
  cruise: t => ({ p: [0, 1.5, -10 + 1.0 * t], target: [0, 1.5, 50 + 1.0 * t], fov: 40 }), // constant 1 m/s, looking ahead
};
const flat = o => [...o.dp, o.dyaw, o.dpitch, o.droll, o.fovScale, o.dfocus];
const take = (profile, move, seed = 7, extra = {}) => createRig({ profile, seed, loop: L, ...extra }).bake(MOVES[move]);
function goertzel(x, fs, f) { const w = 2 * Math.PI * f / fs, c = 2 * Math.cos(w); let s1 = 0, s2 = 0; for (const v of x) { const s = v + c * s1 - s2; s2 = s1; s1 = s; } return Math.sqrt(s1 * s1 + s2 * s2 - c * s1 * s2) / x.length; }
const rms = a => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length);

test('same seed gives the same take; another seed gives another', () => {
  const a = take('handheld', 'dolly', 7), b = take('handheld', 'dolly', 7), c = take('handheld', 'dolly', 8);
  let diff = 0;
  for (let i = 0; i <= 200; i++) { const t = i / 200 * L; assert.deepEqual(flat(a.sample(t)), flat(b.sample(t))); diff = Math.max(diff, Math.abs(a.sample(t).dyaw - c.sample(t).dyaw)); }
  assert.ok(diff > 0.05, `seeds 7 and 8 should differ (max pan difference ${diff})`);
});

test('a camera key changes the take for the same seed', () => {
  const a = take('handheld', 'hold', 7, { key: 'cam1' }), b = take('handheld', 'hold', 7, { key: 'cam2' });
  assert.notEqual(a.sample(1).dyaw, b.sample(1).dyaw);
});

test('amount 0 returns the clean move exactly', () => {
  const r = take('handheld', 'walk');
  for (let i = 0; i <= 50; i++) assert.deepEqual(flat(r.sample(i / 50 * L, { amount: 0 })), [0, 0, 0, 0, 0, 0, 1, 0]);
});

test('axis mask zeroes only the masked axes', () => {
  const r = take('handheld', 'walk'), o = r.sample(2.3, { mask: { x: 0, roll: 0 } });
  assert.equal(o.dp[0], 0); assert.equal(o.droll, 0);
  assert.notEqual(o.dp[1], 0); assert.notEqual(o.dyaw, 0);
});

function seam(r) {
  const a = r.sample(0), b = r.sample(L - 1e-9), h = 1 / 240, a1 = r.sample(h), b1 = r.sample(L - h);
  const pos = Math.max(...[0, 1, 2].map(k => Math.abs(a.dp[k] - b.dp[k])));
  const ang = Math.max(Math.abs(a.dyaw - b.dyaw), Math.abs(a.dpitch - b.dpitch), Math.abs(a.droll - b.droll));
  const k0 = Math.max(Math.abs((a1.dyaw - a.dyaw) - (b.dyaw - b1.dyaw)), Math.abs((a1.droll - a.droll) - (b.droll - b1.droll)));
  // the take's own largest step-to-step bend away from the seam (fast vibration bends a lot everywhere)
  let own = 1e-9; for (let i = 240; i < 240 * (L - 1); i += 7) { const p = r.sample((i - 1) * h), q = r.sample(i * h), s = r.sample((i + 1) * h);
    own = Math.max(own, Math.abs((s.dyaw - q.dyaw) - (q.dyaw - p.dyaw)), Math.abs((s.droll - q.droll) - (q.droll - p.droll))); }
  return { pos, ang, kink: k0 / own };
}
test('every rig closes its loop on every move (no jump, no kink)', () => {
  // One-shot moves (dolly, walk) cut back at the loop end, so re-aim (which uses the subject distance) may jump with
  // the cut; the clean move jumps there too. Angles are checked on moves that loop; travel is checked on all of them.
  for (const id of RIG_IDS) for (const mv of ['hold', 'dolly', 'orbit', 'walk']) {
    const r = take(id, mv), s = seam(r);
    assert.ok(s.pos < 1e-4, `${id}/${mv} position seam ${s.pos} m`);
    if (!r.periodic && mv !== 'hold') continue;
    assert.ok(s.ang < 0.01, `${id}/${mv} angle seam ${s.ang} deg`);
    assert.ok(s.kink < 1.5, `${id}/${mv} bend at the seam is ${s.kink.toFixed(2)}x the take's own largest bend`);
  }
});
test('negative control: without the cross-fade the seam check fails', () => {
  const s = seam(take('handheld', 'walk', 7, { _test: { noCrossfade: true } }));
  assert.ok(s.pos > 1e-4 || s.ang > 0.01, 'the seam check must be able to fail');
});

test('steady speed passes through; a stop overshoots', () => {
  const quiet = { name: 'q', resp: { t: [0.7, .4, 1], r: [1.2, .5, .7] }, low: {}, band: [], pivot: { back: 0, below: 0 }, aim: 0, af: [1, 1], breath: 0, rs: 0 };
  const cruise = createRig({ profile: quiet, seed: 1, loop: null, duration: 6 }).bake(MOVES.cruise);
  for (let t = 2; t <= 4; t += .25) assert.ok(Math.abs(cruise.sample(t).dp[2]) < 5e-4, `cruise offset at ${t}s = ${cruise.sample(t).dp[2]} m`);
  const dolly = createRig({ profile: quiet, seed: 1, loop: null, duration: 6 }).bake(MOVES.dolly);
  let peak = 0; for (let t = 4.4; t <= 6; t += 1 / 60) peak = Math.max(peak, Math.abs(dolly.sample(t).dp[2]));
  assert.ok(peak > 0.01, `a crane-weight stop should overshoot by more than 1 cm (got ${peak} m)`);
});

test('rig character is measurable: handheld pans far more than gimbal at rest (and the check fails if swapped)', () => {
  const panRms = id => { const r = take(id, 'hold'); const a = []; for (let i = 0; i < L * 60; i++) a.push(r.sample(i / 60).dyaw); return rms(a); };
  const check = (loud, calm) => panRms(loud) > 3 * panRms(calm);
  assert.ok(check('handheld', 'gimbal'));
  assert.ok(!check('gimbal', 'handheld'), 'negative control');
  assert.ok(check('handheld', 'tripod'));
});

test('footsteps appear only while the camera travels', () => {
  const stepEnergy = mv => { const r = take('handheld', mv); const a = []; for (let i = 0; i < 240 * 3; i++) a.push(r.sample(1.5 + i / 240).dp[1]); return goertzel(a, 240, 1.9); };
  const walk = stepEnergy('walk'), hold = stepEnergy('hold');
  assert.ok(walk > 5 * hold, `step-rate bob walk ${walk} vs hold ${hold}`);
});

test('sampling is independent of frame rate and call order', () => {
  const r = take('drone', 'dolly'), t = 2.5;
  const first = flat(r.sample(t));
  for (let i = 0; i < 24; i++) r.sample(i / 24);
  assert.deepEqual(flat(r.sample(t)), first);
});

test('loop detection: orbit is periodic, a one-shot dolly is a cut', () => {
  assert.equal(take('gimbal', 'orbit').periodic, true);
  assert.equal(take('gimbal', 'dolly').periodic, false);
});

test('applyToLookAt with no offsets returns the same pose; offsets turn the camera the expected way', () => {
  const pose = { p: [0, 1.6, -5], target: [0, 1.3, 0], up: [0, 1, 0], fov: 40, focus: 50 };
  const zero = { dp: [0, 0, 0], dpWorld: [0, 0, 0], dyaw: 0, dpitch: 0, droll: 0, fovScale: 1, dfocus: 0, shutterLean: 0 };
  const same = applyToLookAt(pose, zero);
  for (let k = 0; k < 3; k++) { assert.ok(Math.abs(same.p[k] - pose.p[k]) < 1e-12); assert.ok(Math.abs(same.target[k] - pose.target[k]) < 1e-9); }
  const up = applyToLookAt(pose, { ...zero, dpitch: 5 }); assert.ok(up.target[1] > pose.target[1], 'positive pitch looks up');
  const yaw = applyToLookAt(pose, { ...zero, dyaw: 5 }); assert.ok(yaw.target[0] > 0, 'positive yaw turns toward +X (toward +dp[0] at yaw 0)');
});

test('rig2d: zero offsets are identity; positive yaw moves the picture left', () => {
  const zero = { dp: [0, 0, 0], dyaw: 0, dpitch: 0, droll: 0, fovScale: 1, shutterLean: 0 };
  assert.deepEqual(rig2d(zero, { focalPx: 1000, distance: 3 }), { dx: -0, dy: 0, rot: -0, scale: 1, shutterLean: 0 });
  assert.ok(rig2d({ ...zero, dyaw: 1 }, { focalPx: 1000, distance: 3 }).dx < 0);
});

test('bound grows with amount (for overscan)', () => {
  const r = take('handheld', 'walk'), b1 = r.bound(1), b2 = r.bound(2);
  assert.ok(b1.pos > 0.005 && b1.rot > 0.2);
  assert.ok(b2.pos > 1.8 * b1.pos && b2.rot > 1.8 * b1.rot);
});

test('unitsPerMetre scales positions, not angles', () => {
  const m = createRig({ profile: 'handheld', seed: 3, loop: L, unitsPerMetre: 1 }).bake(MOVES.walk);
  const d = createRig({ profile: 'handheld', seed: 3, loop: L, unitsPerMetre: 10 }).bake(t => { const c = MOVES.walk(t); return { p: c.p.map(v => v * 10), target: c.target.map(v => v * 10), fov: 40 }; });
  const a = m.sample(2), b = d.sample(2);
  assert.ok(Math.abs(b.dp[1] - 10 * a.dp[1]) < 1e-9); assert.ok(Math.abs(b.dyaw - a.dyaw) < 1e-9);
});

test('profiles are frozen', () => { assert.throws(() => { RIGS.handheld.aim = 0; }); });
