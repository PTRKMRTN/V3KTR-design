// canvas-nav: the pure maths (wheelFactor, stepZoom, zoomAt). node test/canvas-nav.test.mjs
import assert from 'node:assert/strict';
import { wheelFactor, stepZoom, zoomAt, ZOOM_MIN, ZOOM_MAX } from '../interactions/canvas-nav.js';
let n = 0; const ok = (c, m) => { assert.ok(c, m); n++; };
// wheel: up zooms in, down zooms out, clamped to 0.7-1.5 per event
ok(wheelFactor({ deltaY: -100 }) > 1 && wheelFactor({ deltaY: 100 }) < 1, 'wheel up zooms in, down zooms out');
ok(wheelFactor({ deltaY: -100000 }) === 1.5 && wheelFactor({ deltaY: 100000 }) === 0.7, 'one event is clamped to 0.7-1.5');
ok(wheelFactor({ deltaY: -1, deltaMode: 1 }) === wheelFactor({ deltaY: -16 }), 'a line is 16 px');
ok(wheelFactor({ deltaY: -1, deltaMode: 2 }) === wheelFactor({ deltaY: -400 }), 'a page is 400 px');
ok(wheelFactor({ deltaY: -10, ctrlKey: true }) > wheelFactor({ deltaY: -10 }), 'ctrl (pinch) is faster');
ok(wheelFactor({ deltaY: -10, shiftKey: true }) < wheelFactor({ deltaY: -10 }), 'shift is fine');
ok(wheelFactor({ deltaX: -100, deltaY: 0, shiftKey: true }) > 1, 'shift+wheel arriving on X still zooms');
// zoom: clamped, with the 100% detent
ok(stepZoom(1, 1000) === ZOOM_MAX && stepZoom(1, 0.0001) === ZOOM_MIN, 'zoom is clamped');
ok(stepZoom(0.9, 1.2) === 1, 'a step crossing 100% lands on it');
ok(stepZoom(1.2, 0.8) === 1, 'also from above');
ok(stepZoom(1, 1.1) === 1.1 && stepZoom(2, 1.1) === 2.2, 'a step that does not cross is plain');
ok(stepZoom(0.4, 1.4, 0.5) === 0.5, 'the detent follows `one`');
// zoom toward a point: the point under the cursor stays put
{
  const v = { zoom: 1, panX: 10, panY: -5 }, cx = 80, cy = -30, z = 2;
  const r = zoomAt(v, z, cx, cy);
  // the art point under the cursor sits cx / zoom from the art centre; after the zoom the centre has moved by the pan change, and the point must still be under the cursor
  const off = (r.panX - v.panX) + cx * (r.zoom / v.zoom) - cx, offY = (r.panY - v.panY) + cy * (r.zoom / v.zoom) - cy;
  ok(Math.abs(off) < 1e-9 && Math.abs(offY) < 1e-9, 'zoomAt keeps the point under the cursor fixed');
  ok(r.zoom === 2 && zoomAt(v, 1, 5, 5).panX === 10, 'no zoom change, no pan change');
}
console.log(`canvas-nav: ${n} checks passed`);
