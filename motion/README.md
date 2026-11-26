# motion/rig.js: the shared real-camera motion engine

`motion/rig.js` is the suite's one module for camera rigs (Handheld, Shoulder, Gimbal, Steadicam, Dolly, Crane, Drone, Tripod). One ES module, no dependencies, no DOM, CPU only, deterministic (seeded mulberry32, simulated at 240 Hz by default; the `rate` option changes the take). The profiles are the proof-page values Patrick approved on 2026-11-26 ("what is in the proof is very good"); a later refinement is its own patch release, never a silent edit.

- **Pull it like `interactions/scrub.js`:** at a pinned design tag, path `motion/rig.js` (no dist copy; the file is the artifact). An app that bundles an engine core (PROCESSOR's headless export) includes the pulled file there so export gives the same frames as the app.
- Design note: `V3KTR-COWORK/reports/motion-engine/MOTION-ENGINE-2026-11-26.md`. Proof page (same algorithm, same numbers): https://claude.ai/artifact/W7HgKn6PERGyuAMtZVRquy
- Tests: `node --test test/rig.test.mjs` (Node 18+). 16 checks, two of them negative controls (the seam check fails without the loop cross-fade; the character check fails when two profiles are swapped).
- Version: `VERSION` in the module (`0.1.0`), separate from the design tag.

## API

```js
import { createRig, applyToLookAt, rig2d, RIGS, RIG_IDS, AXES, VERSION, hashStr } from './rig.js';   // hashStr seeds the takes; not part of the camera API

const rig = createRig({
  profile: 'handheld',   // an id from RIG_IDS, or a profile object of the same shape
  seed: 7,               // the take; "New take" changes it
  key: 'cam-3',          // optional: mixed into the seed so two cameras with one seed differ
  loop: 6,               // loop length in s (seamless), or null for a one-shot
  duration: 6,           // one-shot length in s (when loop is null)
  unitsPerMetre: 10,     // DIMENSOR 10 (1 unit = 10 cm); metres 1
  rate: 240,             // simulation rate in Hz (default 240); a different rate gives a different take
});
rig.bake(t => ({ p: [x, y, z], target: [tx, ty, tz], fov, focus }));  // the clean move, t in [0, loop or duration]
const o = rig.sample(t, { amount: 1, mask: { roll: 0 } });            // offsets at time t
const pose = applyToLookAt({ p, target, up, fov, focus }, o);          // 3D look-at cameras
const xf = rig2d(o, { focalPx, distance });                            // 2D transforms: { dx, dy, rot, scale, shutterLean }
const { pos, rot, fovScaleMin } = rig.bound(amount);                   // largest offsets, for overscan
```

- `bake()` once per change of the clean move, rig, seed or loop length (about 18 to 30 ms). Amount (0 to 200 %) and the axis mask apply in `sample()`, so dragging them costs nothing.
- `sample(t)` is a pure read of the baked take: any fps, any order, sub-frame times for motion blur.
- Mask keys: `x y z pan tilt roll lens` (the same as `AXES`); a key set to 0 zeroes that axis, any other value scales it.
- Amount 0 returns zero offsets exactly; a camera without a rig record is untouched.
- A clean move that ends where it starts (an orbit) is detected as periodic and loops through; a one-shot inside a loop cuts back at the loop end like the clean move does.
- Offsets: `dp` = [right, up, forward] in app units in the camera's level frame, `dpWorld` in world axes, `dyaw dpitch droll` in degrees, `fovScale` (multiply), `dfocus` (add, app units), `shutterLean` (rolling shutter: `x_ndc += shutterLean * y_ndc`).
- Frame: world up +Y, yaw measured toward +X, yaw 0 looks along +Z; `dp[0]` points along (cos yaw, 0, −sin yaw) and a positive `dyaw` turns toward it. `applyToLookAt` handles this; apps do not re-derive it, and the frame comments in `applyToLookAt` stay (the pivot and re-aim couplings depend on those signs).
- `rig2d` returns `{ dx, dy, rot, scale, shutterLean }`: a 2D app applies `shutterLean` too (rolling-shutter lean, as in the offsets above). The comment on `rig2d` inside `rig.js` lists only the first four; the code is right and the file stays as it is.

## Vendoring (read this before taking a tag)

`rig.js` adds **27 top-level names** to whatever module it ends up in. Internal (19): `DEG`, `CH`, `sub3`, `add3`, `mul3`, `dot3`, `cross3`, `norm3`, `rotAxis`, `mulberry32`, `gauss`, `normRms`, `lowNoise`, `bandNoise`, `corrections`, `smooth01`, `wrapDeg`, `baseOf`, `deepFreeze`. Exported (8): `VERSION`, `AXES`, `RIGS`, `RIG_IDS`, `hashStr`, `createRig`, `applyToLookAt`, `rig2d`. If an app pastes the file into one big module, any of these that already exist there is a SyntaxError (a duplicate `const` or `function`).

- **DIMENSOR and KOMPOSITOR import it as a module.** DIMENSOR already exports a different `RIGS` (lighting rigs, `src/render/world.js`), so alias it: `import { RIGS as CAMERA_RIGS } from '.../rig.js'`.
- **PROCESSOR pulls `js` files flat:** `scripts/pull-design.mjs` strips `export ` and pastes the file into index.html's one inline module, and `--check` hashes that text. Before taking the tag PROCESSOR checks its module for the 27 names (QA scanned PROCESSOR on 2026-11-26 and found no clash for 24 of them; `createRig`, `applyToLookAt` and `rig2d` were not in that scan). If one does, PROCESSOR wraps the pasted block in a function scope in its own pull step (a change to `pull-design.mjs` and its `--check`, owned by PROCESSOR); it never edits `rig.js`.
- There is **no prefixed variant** of the file: the tag has one `motion/rig.js`, byte for byte the motion session's.

## What the Rig row uses (no new pattern)

No CSS and no UI live here. The Rig row an app adds is existing patterns: a `.vk-select` for the rig, a `.vk-scrub` slider for Amount (0 to 200 %), `.vk-chip`s for the axis mask, a normal `.vk-btn` for New take. If one of those is missing for a case, ask the design session.
