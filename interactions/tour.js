// V3KTR Welcome tour (v0.41.175, Patrick 2026-11-20): the behaviour behind app/tour.css. A screenshot of the app with ONE outlined part at a time; Back / Next step between parts, Get started closes.
// Nothing moves by itself: no loop, no timer, no requestAnimationFrame. Markup and rules: app/tour.css, AGENTS.md "Welcome and tour".
//
//   const t = mountTour(scrim, { zones, size: [1920, 1080], inert: appRoot, returnFocus: someButton, onClose })   → { show(i), close(), state(), destroy() }
//
//   scrim   the `.vk-scrim` that holds the `.vk-modal.vk-welcome` (appended to <body>, never inside a zoomed app root; see "T4 messages" in AGENTS.md).
//   zones   [{ name: 'Viewport', line: 'what it is, what you do with it', rect: [x, y, w, h], shot?: 'sequencer.png', size?: [1920, 1080] }] in the screenshot's own pixels, read from the live app's DOM when the screenshot is shot.
//           `shot` (optional, v0.41.196): this step's own picture, for a part that lives on another screen or tab. A step without `shot` shows the picture the markup carries (the shared one). Every `shot` is loaded and decoded when the tour opens; the picture and the box change together, the box jumps (no glide) and never sits over the wrong picture, even on a slow load (the box is hidden until the picture is ready). `size` is that picture's pixel size when it differs from the shared `size`.
//   size    the screenshot's pixel size (default 1920 x 1080); the box is placed in percent of it, so it follows the stage at any width.
//   inert   an element (or list) made `inert` while the tour is open and restored on close, so the app behind cannot take focus or clicks.
//   returnFocus  the element that gets focus when the tour closes (the control that opened it, or the app's first control).
//   onClose called once when it closes (Get started, Esc, a click on the scrim outside the modal). The app records "seen" here.
//
// Hooks in the markup: `[data-tour="back"|"next"|"start"]`, `.vk-tour__box`, `.vk-tour__n`, `.vk-tour__name`, `.vk-tour__txt`.
// Keys: ArrowRight / ArrowLeft step, Esc closes, Tab stays inside the dialog. Focus opens on Next, and when Back or Next turns off at an end, focus moves on (never lost).
// The part name and the line sit in an aria-live="polite" region, so each step is announced once.

export function mountTour(scrim, { zones, size = [1920, 1080], inert = null, returnFocus = null, onClose = null } = {}) {
  if (!scrim || !zones || !zones.length) throw new Error('mountTour needs a scrim and at least one zone');
  const q = (s) => scrim.querySelector(s);
  const box = q('.vk-tour__box'), nm = q('.vk-tour__name'), tx = q('.vk-tour__txt'), cnt = q('.vk-tour__n');
  const back = q('[data-tour="back"]'), next = q('[data-tour="next"]'), start = q('[data-tour="start"]');
  const inerts = inert ? (Array.isArray(inert) ? inert : [inert]) : [];
  inerts.forEach((e) => { e.inert = true; });
  const stageImg = q('.vk-tour__stage > img'), baseSrc = stageImg ? stageImg.getAttribute('src') : null;
  // every picture a step names is loaded and decoded now, so a step never opens on a blank stage; `ready` holds the ones that are decoded
  const pics = new Map(), ready = new Set();
  zones.forEach((z) => { if (z.shot && !pics.has(z.shot)) { const im = new Image(); im.src = z.shot; pics.set(z.shot, im); const done = () => ready.add(z.shot); im.decode ? im.decode().then(done, done) : (im.onload = done); } });
  let step = 0, closed = false, shown = baseSrc;

  function show(i) {
    step = Math.max(0, Math.min(zones.length - 1, i));
    const z = zones[step], i0 = step, pic = z.shot || baseSrc, swap = stageImg && pic && pic !== shown;
    // the picture and the box change together: at once when the picture is ready, otherwise the box waits (hidden) for it, so it never sits over the wrong picture
    const place = () => {
      if (i0 !== step) return;
      const r = z.rect, sz = z.size || size;
      if (swap) { stageImg.setAttribute('src', pic); shown = pic; box.style.transition = 'none'; } // a new picture: the box jumps, the glide is for moves inside one picture
      box.style.left = (r[0] / sz[0] * 100) + '%'; box.style.top = (r[1] / sz[1] * 100) + '%';
      box.style.width = (r[2] / sz[0] * 100) + '%'; box.style.height = (r[3] / sz[1] * 100) + '%';
      box.style.visibility = '';
      if (swap) { void box.offsetWidth; box.style.transition = ''; }
    };
    if (swap && z.shot && !ready.has(pic)) { box.style.visibility = 'hidden'; const im = pics.get(pic), go = () => { ready.add(pic); place(); }; im.decode ? im.decode().then(go, go) : (im.complete ? go() : im.addEventListener('load', go, { once: true })); } else place();
    nm.textContent = z.name; tx.textContent = z.line; cnt.textContent = (step + 1) + ' / ' + zones.length;
    back.disabled = step === 0; next.disabled = step === zones.length - 1;
    // focus never falls out of the dialog when Back or Next turns off
    const a = document.activeElement;
    if (a && a.disabled) (a === back ? next : start).focus();
  }
  function close() {
    if (closed) return; closed = true;
    inerts.forEach((e) => { e.inert = false; });
    scrim.classList.remove('is-on');
    if (returnFocus && returnFocus.focus) returnFocus.focus();
    if (onClose) onClose();
  }
  const onBack = () => show(step - 1), onNext = () => show(step + 1);
  back.addEventListener('click', onBack); next.addEventListener('click', onNext); start.addEventListener('click', close);
  let down = null;
  const onDown = (e) => { down = e.target; };
  const onScrim = (e) => { if (e.target === scrim && down === scrim) close(); };
  scrim.addEventListener('mousedown', onDown); scrim.addEventListener('click', onScrim);
  const onKey = (e) => {
    if (closed || !scrim.classList.contains('is-on')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowRight' && !next.disabled) { show(step + 1); e.preventDefault(); return; }
    if (e.key === 'ArrowLeft' && !back.disabled) { show(step - 1); e.preventDefault(); return; }
    if (e.key === 'Tab') {
      const f = [...scrim.querySelectorAll('a[href],button:not([disabled])')].filter((x) => x.offsetParent !== null || x === document.activeElement);
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { f[f.length - 1].focus(); e.preventDefault(); } else if (!e.shiftKey && i === f.length - 1) { f[0].focus(); e.preventDefault(); }
    }
  };
  document.addEventListener('keydown', onKey);
  show(0); next.focus();
  return {
    show, close, state: () => ({ step, closed, shot: shown }),
    destroy() { document.removeEventListener('keydown', onKey); scrim.removeEventListener('mousedown', onDown); scrim.removeEventListener('click', onScrim); back.removeEventListener('click', onBack); next.removeEventListener('click', onNext); start.removeEventListener('click', close); },
  };
}
