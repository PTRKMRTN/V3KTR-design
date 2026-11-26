// V3KTR rig — shared real-camera motion engine (v0.1.0)
// One pure ES module, no dependencies, CPU only. Same inputs + seed => same take, at any fps.
// Design: V3KTR-COWORK/reports/motion-engine/MOTION-ENGINE-2026-11-26.md
//
//   import { createRig, applyToLookAt, rig2d, RIGS, RIG_IDS } from './rig.js';
//   const rig = createRig({ profile: 'handheld', seed: 7, loop: 6, unitsPerMetre: 10 });
//   rig.bake(t => ({ p: [x, y, z], target: [tx, ty, tz], fov: 40 }));   // the clean move
//   const o = rig.sample(t, { amount: 1, mask: { roll: 0 } });          // offsets to add
//   const pose = applyToLookAt({ p, target, up, fov, focus }, o);         // or rig2d(o, ...)
//
// Units: positions in app units (unitsPerMetre converts to metres inside), angles in degrees, time in seconds.

export const VERSION = '0.1.0';
const DEG = Math.PI / 180;
export const AXES = ['x', 'y', 'z', 'pan', 'tilt', 'roll', 'lens'];

/* ---------- rig profiles (metres, degrees, Hz). resp = [natural Hz, damping ratio, inertia 0..1] ---------- */
export const RIGS = deepFreeze({
  handheld: { name: 'Handheld',
    resp: { t: [2.2, .55, .5], r: [2.8, .5, .5] },
    low: { x: [.35, .006], y: [.30, .005], z: [.25, .006], yaw: [.40, .18], pitch: [.40, .15], roll: [.30, .35] },
    band: [['yaw', 9, 2, .02], ['pitch', 9, 2, .02], ['roll', 9, 2, .015], ['y', .25, 4, .003], ['pitch', .25, 4, .06]],
    corr: { yaw: { drift: .6, fc: .12, thr: .35, T: .30 }, pitch: { drift: .5, fc: .12, thr: .30, T: .30 }, roll: { drift: .6, fc: .10, thr: .50, T: .35 } },
    gait: { bob: .022, sway: .012, roll: 1.0, pitch: .5, yaw: .3, heel: .006, rate: 1.9, smooth: 0 },
    pivot: { back: .30, below: .50 }, aim: .7, af: [2.5, .45], breath: .03, rs: .025 },
  shoulder: { name: 'Shoulder',
    resp: { t: [1.6, .5, .7], r: [1.8, .5, .7] },
    low: { x: [.25, .004], y: [.25, .004], z: [.20, .005], yaw: [.30, .12], pitch: [.30, .10], roll: [.25, .25] },
    band: [['yaw', 8, 2, .008], ['pitch', 8, 2, .008], ['y', .25, 4, .004], ['pitch', .25, 4, .05]],
    corr: { yaw: { drift: .4, fc: .10, thr: .25, T: .45 }, pitch: { drift: .3, fc: .10, thr: .20, T: .45 }, roll: { drift: .5, fc: .08, thr: .35, T: .50 } },
    gait: { bob: .025, sway: .015, roll: 1.4, pitch: .35, yaw: .25, heel: .004, rate: 1.8, smooth: 0 },
    pivot: { back: .15, below: .35 }, aim: .8, af: [1.8, .6], breath: .02, rs: .015 },
  gimbal: { name: 'Gimbal',
    resp: { t: [2.0, .6, .5], r: [1.0, .9, .9] },
    low: { x: [.35, .005], y: [.35, .004], z: [.30, .005], yaw: [.30, .04], pitch: [.30, .03], roll: [.30, .01] },
    band: [],
    corr: { yaw: { drift: .12, fc: .08, thr: .10, T: .60 } },
    gait: { bob: .016, sway: .010, roll: .05, pitch: .05, yaw: .05, heel: .004, rate: 1.9, smooth: 0 },
    pivot: { back: 0, below: 0 }, aim: .3, af: [2.5, .5], breath: .02, rs: .02 },
  steadicam: { name: 'Steadicam',
    resp: { t: [.9, .55, .9], r: [1.1, .6, .8] },
    low: { x: [.20, .010], y: [.25, .006], z: [.20, .008], yaw: [.15, .10], pitch: [.20, .06], roll: [.15, .08] },
    band: [['pitch', .7, 3, .06], ['roll', .7, 3, .08]],
    corr: { yaw: { drift: .3, fc: .06, thr: .25, T: .70 } },
    gait: { bob: .005, sway: .006, roll: .10, pitch: .05, yaw: .05, heel: 0, rate: 1.8, smooth: .7 },
    pivot: { back: 0, below: 0 }, aim: .5, af: [1.5, .7], breath: .02, rs: .015 },
  dolly: { name: 'Dolly',
    resp: { t: [1.3, .7, .8], r: [2.0, .7, .6] },
    low: { x: [1, .0008], y: [1, .0008], z: [1, .0008], yaw: [.30, .02], pitch: [.30, .015], roll: [.30, .005] },
    band: [],
    corr: { yaw: { drift: .08, fc: .08, thr: .06, T: .50 } },
    bumps: { spacing: 1.2, amp: .0015, vib: .0004 },
    pivot: { back: 0, below: 0 }, aim: 0, af: [1.2, .8], breath: .02, rs: .012 },
  crane: { name: 'Crane',
    resp: { t: [.7, .4, 1.0], r: [1.2, .5, .7] },
    low: { x: [.30, .002], y: [.30, .003], z: [.30, .002], yaw: [.10, .03], pitch: [.10, .03], roll: [.10, .01] },
    band: [['y', 1.1, 6, .002]],
    corr: { yaw: { drift: .10, fc: .06, thr: .08, T: .60 } },
    pivot: { back: 0, below: 0 }, aim: 0, af: [1.2, .8], breath: .02, rs: .012 },
  drone: { name: 'Drone',
    resp: { t: [.8, .75, 1.0], r: [1.5, .8, .6] },
    low: { x: [.25, .030], y: [.25, .020], z: [.25, .025], yaw: [.15, .25], pitch: [.20, .05], roll: [.20, .02] },
    band: [['pitch', 38, 4, .01], ['yaw', 38, 4, .01], ['roll', 38, 4, .01]],
    corr: { yaw: { drift: .3, fc: .05, thr: .2, T: .8 } },
    tilt: .8,
    pivot: { back: 0, below: 0 }, aim: .2, af: [2, .7], breath: .01, rs: .03 },
  tripod: { name: 'Tripod',
    resp: { t: [8, .9, .1], r: [2.5, .75, .5] },
    low: { x: [1, .0002], y: [1, .0002], z: [1, .0002], yaw: [.30, .008], pitch: [.30, .006], roll: [.30, .003] },
    band: [['yaw', 14, 3, .004], ['pitch', 14, 3, .003]],
    pivot: { back: 0, below: 0 }, aim: 0, af: [1.5, .8], breath: .02, rs: .01 },
});
export const RIG_IDS = Object.freeze(['handheld', 'shoulder', 'gimbal', 'steadicam', 'dolly', 'crane', 'drone', 'tripod']);

/* ---------- deterministic randomness and filters ---------- */
function deepFreeze(o) { Object.values(o).forEach(v => { if (v && typeof v === 'object') deepFreeze(v); }); return Object.freeze(o); }
export function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(r) { let u = r(); if (u < 1e-12) u = 1e-12; return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
function normRms(a, rms) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; const k = s > 0 ? rms / Math.sqrt(s / a.length) : 0; for (let i = 0; i < a.length; i++) a[i] *= k; return a; }
function lowNoise(n, R, fc, rms, rng) {
  const a = 1 - Math.exp(-2 * Math.PI * fc / R); let s1 = 0, s2 = 0; const out = new Float64Array(n);
  const warm = Math.min(6000, Math.ceil(4 * R / fc));
  for (let i = -warm; i < n; i++) { s1 += a * (gauss(rng) - s1); s2 += a * (s1 - s2); if (i >= 0) out[i] = s2; }
  return normRms(out, rms);
}
function bandNoise(n, R, f, q, rms, rng) {
  const w = 2 * Math.PI * Math.min(f, R * .45) / R, al = Math.sin(w) / (2 * q), a0 = 1 + al, b0 = al / a0, b2 = -al / a0, a1 = -2 * Math.cos(w) / a0, a2 = (1 - al) / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const out = new Float64Array(n); const warm = Math.ceil(8 * q * R / f);
  for (let i = -warm; i < n; i++) { const x = gauss(rng); const y = b0 * x + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; if (i >= 0) out[i] = y; }
  return normRms(out, rms);
}
function corrections(n, R, c, rng) { // drift until noticed, then a minimum-jerk catch with a small overshoot
  const d = lowNoise(n, R, c.fc, c.drift, rng), out = new Float64Array(n);
  let pos = 0, moving = false, t0 = 0, c0 = 0, c1 = 0, dur = 1, wait = -1, thr = c.thr * (0.8 + 0.4 * rng());
  for (let i = 0; i < n; i++) {
    if (!moving) {
      if (wait < 0 && Math.abs(d[i] - pos) > thr) wait = i + Math.round(R * (0.12 + 0.12 * rng()));
      if (wait >= 0 && i >= wait) { moving = true; t0 = i; c0 = pos; const err = d[i] - pos; c1 = d[i] + err * 0.15 * rng(); dur = Math.max(4, c.T * (0.75 + 0.5 * rng()) * R); wait = -1; }
    }
    if (moving) { const u = (i - t0) / dur; if (u >= 1) { pos = c1; moving = false; thr = c.thr * (0.8 + 0.4 * rng()); } else { const s = u * u * u * (10 - 15 * u + 6 * u * u); pos = c0 + (c1 - c0) * s; } }
    out[i] = d[i] - pos;
  }
  return out;
}
const smooth01 = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
const wrapDeg = a => ((a % 360) + 540) % 360 - 180;

/* ---------- clean pose helpers ---------- */
function baseOf(c, upm) { // -> metres + yaw/pitch (deg) + focus distance (m)
  const p = [c.p[0] / upm, c.p[1] / upm, c.p[2] / upm];
  let yaw = c.yaw ?? 0, pitch = c.pitch ?? 0, focus = c.focus != null ? c.focus / upm : 3;
  if (c.target) {
    const d = [c.target[0] / upm - p[0], c.target[1] / upm - p[1], c.target[2] / upm - p[2]], h = Math.hypot(d[0], d[2]);
    yaw = Math.atan2(d[0], d[2]) / DEG; pitch = Math.atan2(d[1], h) / DEG;
    if (c.focus == null) focus = Math.max(.05, Math.hypot(d[0], d[1], d[2]));
  }
  return { p, yaw, pitch, focus, fov: c.fov ?? 40 };
}

const CH = ['r', 'u', 'f', 'yaw', 'pitch', 'roll', 'focus'];

/**
 * createRig(opts)
 *  profile        rig id from RIG_IDS, or a profile object of the same shape
 *  seed           integer; the take
 *  loop           loop length in seconds (takes close seamlessly), or null for a one-shot
 *  duration       one-shot length in seconds (when loop is null)
 *  unitsPerMetre  app units per metre (DIMENSOR 10, metres 1)
 *  rate           simulation rate, default 240 Hz
 *  key            optional extra string mixed into the seed (e.g. camera id) so two cameras with the same seed differ
 */
export function createRig(opts = {}) {
  const P = typeof opts.profile === 'string' ? RIGS[opts.profile] : opts.profile;
  if (!P) throw new Error(`rig: unknown profile "${opts.profile}"`);
  const pid = typeof opts.profile === 'string' ? opts.profile : (P.id || P.name || 'custom');
  const R = opts.rate || 240, upm = opts.unitsPerMetre || 1, seed = opts.seed | 0, key = opts.key || '';
  const loop = opts.loop ?? null, dur = loop ?? Math.max(.1, opts.duration || 6);
  const test = opts._test || {};
  let T = null;

  function bake(clean) {
    const warm = loop ? 12 : 3, span = loop ? warm + 2 * loop : warm + dur;
    const n = Math.ceil(span * R) + 2, m = Math.round(dur * R);
    const rng = k => mulberry32(hashStr(pid + '|' + key + '|' + k + '|' + seed));
    const det = {}, sto = {}; CH.forEach(c => { det[c] = new Float64Array(n); sto[c] = new Float64Array(n); });
    const B = new Array(m + 1); for (let k = 0; k <= m; k++) B[k] = baseOf(clean(Math.min(dur, k / R)), upm);
    const b0 = B[0], bm = B[m];
    const periodic = !!loop && Math.hypot(b0.p[0] - bm.p[0], b0.p[1] - bm.p[1], b0.p[2] - bm.p[2]) < 1e-4 && Math.abs(wrapDeg(b0.yaw - bm.yaw)) < 1e-3 && Math.abs(b0.pitch - bm.pitch) < 1e-3;
    const wi = Math.round(warm * R);
    const at = loop ? (i => (((i - wi) % m) + m) % m) : (i => Math.min(m, Math.max(0, i - wi)));
    const kin = k => {
      const km = periodic ? (k - 1 + m) % m : Math.max(0, k - 1), kp = periodic ? (k + 1) % m : Math.min(m, k + 1);
      const a = B[km], b = B[k], c = B[kp], h = 1 / R, dt = periodic ? 2 * h : ((kp - km) * h || h);
      const cy = Math.cos(b.yaw * DEG), sy = Math.sin(b.yaw * DEG);
      const vel = [0, 1, 2].map(j => (c.p[j] - a.p[j]) / dt), acc = [0, 1, 2].map(j => (c.p[j] - 2 * b.p[j] + a.p[j]) / (h * h));
      let ay = (wrapDeg(c.yaw - b.yaw) - wrapDeg(b.yaw - a.yaw)) / (h * h), ap = ((c.pitch - b.pitch) - (b.pitch - a.pitch)) / (h * h);
      if (!periodic && (k === 0 || k === m)) { acc[0] = acc[1] = acc[2] = 0; ay = ap = 0; }
      return { speed: Math.hypot(vel[0], vel[1], vel[2]), ar: acc[0] * cy - acc[2] * sy, au: acc[1], af: acc[0] * sy + acc[2] * cy, ayaw: ay, apitch: ap, focus: b.focus };
    };
    const K = new Array(m + 1); for (let k = 0; k <= m; k++) K[k] = kin(k);
    const map = { x: 'r', y: 'u', z: 'f', yaw: 'yaw', pitch: 'pitch', roll: 'roll' };

    // 1) weight: e'' = -w^2 e - 2 z w e' - inertia * a, with a high-passed at ~2 s (sustained forces are leaned into)
    for (const [c, g, ak] of [['r', 't', 'ar'], ['u', 't', 'au'], ['f', 't', 'af'], ['yaw', 'r', 'ayaw'], ['pitch', 'r', 'apitch']]) {
      const [f, z, mm] = P.resp[g], w = 2 * Math.PI * f, sub = 4, h = 1 / (R * sub), kh = 1 - Math.exp(-1 / (2 * R));
      let e = 0, v = 0, alp = 0;
      for (let i = 0; i < n; i++) { const a0 = K[at(i)][ak]; alp += (a0 - alp) * kh; const a = a0 - alp; for (let s = 0; s < sub; s++) { v += (-w * w * e - 2 * z * w * v - mm * a) * h; e += v * h; } det[c][i] = e; }
    }
    if (P.tilt) for (let i = 0; i < n; i++) { const k = K[at(i)]; det.pitch[i] += -P.tilt * k.af * .25; det.roll[i] += P.tilt * k.ar * .25; }
    // focus follows the subject through a second-order lag (hunts when underdamped)
    { const [f, z] = P.af, w = 2 * Math.PI * f; let fa = K[at(0)].focus, v = 0;
      for (let i = 0; i < n; i++) { const fb = K[at(i)].focus; for (let s = 0; s < 4; s++) { v += (-w * w * (fa - fb) - 2 * z * w * v) / (R * 4); fa += v / (R * 4); } det.focus[i] = fa - fb; } }
    // 2) sway and bands
    for (const k in P.low) { const [fc, rms] = P.low[k], a = lowNoise(n, R, fc, rms, rng('low' + k)); for (let i = 0; i < n; i++) sto[map[k]][i] += a[i]; }
    for (const [k, f, q, rms] of (P.band || [])) { const a = bandNoise(n, R, f, q, rms, rng('band' + k + f)); for (let i = 0; i < n; i++) sto[map[k]][i] += a[i]; }
    // 3) drift and catch
    if (P.corr) for (const k in P.corr) { const a = corrections(n, R, P.corr[k], rng('corr' + k)); for (let i = 0; i < n; i++) sto[map[k]][i] += a[i]; }
    // 4) footsteps, gated by travel speed
    if (P.gait) {
      const G = P.gait, r = rng('gait'); let ph = r(), fs = G.rate, lastStep = Math.floor(ph), hv = 0, hx = 0; const wh = 2 * Math.PI * 6, gz = .35;
      const gx = new Float64Array(n), gy = new Float64Array(n), gr = new Float64Array(n), gp = new Float64Array(n), gw = new Float64Array(n);
      for (let i = 0; i < n; i++) {
        const g = smooth01((K[at(i)].speed - .15) / .75); ph += fs / R;
        if (Math.floor(ph) !== lastStep) { lastStep = Math.floor(ph); fs = G.rate * (1 + .05 * gauss(r)); hv += G.heel * wh * (.8 + .4 * r()) * g; }
        hv += (-wh * wh * hx - 2 * gz * wh * hv) / R; hx += hv / R;
        const a = 2 * Math.PI * ph;
        gy[i] = g * G.bob * (.8 * Math.cos(a) + .2 * Math.cos(2 * a + .7)) - hx; gx[i] = g * G.sway * Math.cos(a / 2);
        gr[i] = g * G.roll * Math.cos(a / 2 + .4); gp[i] = g * G.pitch * Math.cos(a + 1.1) + hx * 15; gw[i] = g * G.yaw * Math.cos(a / 2 + 2.0);
      }
      if (G.smooth) { const al = 1 - Math.exp(-2 * Math.PI * G.smooth / R); for (const arr of [gx, gy, gr, gp, gw]) { let s1 = arr[0], s2 = arr[0]; for (let i = 0; i < n; i++) { s1 += al * (arr[i] - s1); s2 += al * (s1 - s2); arr[i] = s2; } } }
      for (let i = 0; i < n; i++) { sto.r[i] += gx[i]; sto.u[i] += gy[i]; sto.roll[i] += gr[i]; sto.pitch[i] += gp[i]; sto.yaw[i] += gw[i]; }
    }
    // 5) dolly track: bumps at rail joints and wheel vibration, both scaled by speed
    if (P.bumps) {
      const Bm = P.bumps, r = rng('bumps'), vib = bandNoise(n, R, 14, 3, 1, rng('vib')); let s = 0, last = 0, bv = 0, bx = 0; const wb = 2 * Math.PI * 9, zb = .3;
      for (let i = 0; i < n; i++) {
        const sp = K[at(i)].speed; s += sp / R;
        if (Math.floor(s / Bm.spacing) !== last) { last = Math.floor(s / Bm.spacing); bv += Bm.amp * wb * (.6 + .8 * r()); }
        bv += (-wb * wb * bx - 2 * zb * wb * bv) / R; bx += bv / R;
        sto.u[i] += bx + Bm.vib * Math.min(1, sp / .6) * vib[i]; sto.pitch[i] += bx * 8;
      }
    }
    T = { det, sto, warm, n, B, periodic };
    return api;
  }

  function lerp(a, x) { const i = Math.max(0, Math.min(a.length - 2, Math.floor(x))), f = x - i; return a[i] * (1 - f) + a[i + 1] * f; }
  function raw(t) { // offsets in metres/degrees, camera frame, before pivot/aim/amount/mask
    const o = {};
    if (loop) {
      const tau = ((t % loop) + loop) % loop, s = test.noCrossfade ? 1 : smooth01(tau / loop), g = 1 / Math.sqrt(s * s + (1 - s) * (1 - s));
      const i0 = (T.warm + tau) * R, i1 = (T.warm + loop + tau) * R;
      for (const c of CH) o[c] = lerp(T.det[c], i1) + (lerp(T.sto[c], i0) * s + lerp(T.sto[c], i1) * (1 - s)) * g;
    } else {
      const i = (T.warm + Math.min(dur, Math.max(0, t))) * R;
      for (const c of CH) o[c] = lerp(T.det[c], i) + lerp(T.sto[c], i);
    }
    return o;
  }
  function baseAt(t) { const m = T.B.length - 1, x = (loop ? ((t % loop) + loop) % loop : Math.min(dur, Math.max(0, t))) * R, i = Math.min(m - 1, Math.floor(x)), f = x - i, a = T.B[i], b = T.B[i + 1];
    return { yaw: a.yaw + wrapDeg(b.yaw - a.yaw) * f, focus: a.focus + (b.focus - a.focus) * f, fov: a.fov + (b.fov - a.fov) * f }; }

  /**
   * sample(t, { amount = 1, mask = {} }) -> offsets to add to the clean pose at time t
   *  dp         [right, up, forward] in app units, camera frame (yaw only; level)
   *  dpWorld    [x, y, z] in app units, world frame
   *  dyaw dpitch droll   degrees
   *  fovScale   multiply the clean fov
   *  dfocus     add to the clean focus distance (app units)
   *  shutterLean  rolling-shutter horizontal lean: x_ndc += shutterLean * y_ndc
   */
  function sample(t, s = {}) {
    if (!T) throw new Error('rig: call bake(clean) first');
    const A = s.amount ?? 1, M = Object.assign({ x: 1, y: 1, z: 1, pan: 1, tilt: 1, roll: 1, lens: 1 }, s.mask || {});
    const zero = { dp: [0, 0, 0], dpWorld: [0, 0, 0], dyaw: 0, dpitch: 0, droll: 0, fovScale: 1, dfocus: 0, shutterLean: 0 };
    if (A === 0) return zero;
    const one = tt => {
      const o = raw(tt), b = baseAt(tt);
      let r = o.r, u = o.u, f = o.f, yaw = o.yaw, pitch = o.pitch, roll = o.roll;
      r += P.pivot.back * Math.sin(yaw * DEG) - P.pivot.below * Math.sin(roll * DEG); u += P.pivot.back * Math.sin(pitch * DEG);
      yaw -= P.aim * Math.atan2(r, b.focus) / DEG; pitch -= P.aim * Math.atan2(u, b.focus) / DEG;
      return { r: r * A * M.x, u: u * A * M.y, f: f * A * M.z, yaw: yaw * A * M.pan, pitch: pitch * A * M.tilt, roll: roll * A * M.roll, focus: o.focus * A * M.lens, b };
    };
    const o = one(t), b = o.b, cy = Math.cos(b.yaw * DEG), sy = Math.sin(b.yaw * DEG);
    const foc = b.focus + o.focus, fovScale = 1 + A * M.lens * P.breath * Math.log(Math.max(.05, foc) / b.focus);
    let lean = 0;
    if (M.lens && P.rs) { const h = 1 / 240, a = one(t - h), c = one(t + h); const w = ((c.yaw + c.b.yaw) - (a.yaw + a.b.yaw)) * DEG / (2 * h);
      lean = w * P.rs * A / (2 * Math.tan(b.fov * fovScale * DEG / 2)) * (9 / 16); }
    return {
      dp: [o.r * upm, o.u * upm, o.f * upm],
      dpWorld: [(o.r * cy + o.f * sy) * upm, o.u * upm, (-o.r * sy + o.f * cy) * upm],
      dyaw: o.yaw, dpitch: o.pitch, droll: o.roll, fovScale, dfocus: o.focus * upm, shutterLean: lean,
    };
  }

  /** Largest offsets over the take at this amount (for overscan): { pos (app units), rot (deg), fovScaleMin } */
  function bound(amount = 1, mask) {
    let pos = 0, rot = 0, fmin = 1; const N = Math.ceil(dur * 60);
    for (let i = 0; i <= N; i++) { const o = sample(i / 60, { amount, mask }); pos = Math.max(pos, Math.hypot(...o.dp)); rot = Math.max(rot, Math.abs(o.dyaw), Math.abs(o.dpitch), Math.abs(o.droll)); fmin = Math.min(fmin, o.fovScale); }
    return { pos, rot, fovScaleMin: fmin };
  }

  const api = { bake, sample, bound, get baked() { return !!T; }, get periodic() { return T ? T.periodic : null; }, profile: P, id: pid, loop, duration: dur };
  return api;
}

/* ---------- adapters ---------- */
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm3 = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function rotAxis(v, k, ang) { const c = Math.cos(ang), s = Math.sin(ang); return add3(add3(mul3(v, c), mul3(cross3(k, v), s)), mul3(k, dot3(k, v) * (1 - c))); }

/**
 * applyToLookAt(pose, o) for look-at cameras (DIMENSOR camPose, three.js).
 *  pose = { p:[x,y,z], target:[x,y,z], up?:[0,1,0], fov?, focus? }  ->  same shape with the rig applied.
 * Frame: world up is +Y; yaw is measured toward +X (yaw 0 looks along +Z); dp[0] points along (cos yaw, 0, -sin yaw),
 * so a positive dyaw turns the camera toward +dp[0]. Positive dpitch looks up. Positive droll swings the camera's
 * up vector toward three.js screen-right. The pivot and re-aim couplings rely on these signs; keep them.
 * The target keeps its distance from the camera.
 */
export function applyToLookAt(pose, o) {
  const up0 = pose.up || [0, 1, 0], p = add3(pose.p, o.dpWorld);
  let fwd = sub3(pose.target, pose.p); const dist = Math.hypot(fwd[0], fwd[1], fwd[2]) || 1; fwd = mul3(fwd, 1 / dist);
  fwd = rotAxis(fwd, [0, 1, 0], o.dyaw * DEG);                        // pan about world up, toward +dp[0]
  const right = norm3(cross3(fwd, [0, 1, 0]));                        // three.js: right = fwd x up
  fwd = norm3(rotAxis(fwd, right, o.dpitch * DEG));                   // tilt about camera right (positive = up)
  let up = norm3(cross3(right, fwd));
  if (up0[1] < 0) up = mul3(up, -1);
  up = norm3(rotAxis(up, fwd, o.droll * DEG));                        // roll about the view axis
  const out = { ...pose, p, target: add3(p, mul3(fwd, dist)), up };
  if (pose.fov != null) out.fov = pose.fov * o.fovScale;
  if (pose.focus != null) out.focus = pose.focus + o.dfocus;
  out.shutterLean = o.shutterLean;
  return out;
}

/**
 * rig2d(o, { focalPx, distance, unitsPerMetre }) for 2D apps (PROCESSOR Transform, KOMPOSITOR 2.5D).
 * focalPx: focal length in pixels of the virtual camera (frameHeight / (2 tan(fov/2))); distance: subject distance in app units.
 * Returns { dx, dy (px, +y down), rot (deg), scale } to compose after the clean transform.
 */
export function rig2d(o, { focalPx, distance = 30 }) {
  const D = distance, tanY = Math.tan(o.dyaw * DEG), tanP = Math.tan(o.dpitch * DEG);
  const dx = -focalPx * tanY - focalPx * o.dp[0] / D;
  const dy = focalPx * tanP + focalPx * o.dp[1] / D;
  const scale = (D / Math.max(D * .2, D - o.dp[2])) / o.fovScale;
  return { dx, dy, rot: -o.droll, scale, shutterLean: o.shutterLean };
}
