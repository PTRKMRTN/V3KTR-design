// V3KTR Welcome tour (v0.41.175, Patrick 2026-11-20): the behaviour behind app/tour.css. A screenshot of the app with ONE outlined part at a time; Back / Next step between parts, Get started closes.
// Nothing moves by itself: no loop, no timer, no requestAnimationFrame. Markup and rules: app/tour.css, AGENTS.md "Welcome and tour".
//
//   const t = mountTour(scrim, { zones, size: [1920, 1080], inert: appRoot, returnFocus: someButton, onClose })   → { show(i), close(), state(), destroy() }
//
//   scrim   the `.vk-scrim` that holds the `.vk-modal.vk-welcome` (appended to <body>, never inside a zoomed app root; see "T4 messages" in AGENTS.md).
//   zones   [{ name: 'Viewport', line: 'what it is, what you do with it', rect: [x, y, w, h] }] in the screenshot's own pixels, read from the live app's DOM when the screenshot is shot.
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
  let step = 0, closed = false;

  function show(i) {
    step = Math.max(0, Math.min(zones.length - 1, i));
    const z = zones[step], r = z.rect;
    box.style.left = (r[0] / size[0] * 100) + '%'; box.style.top = (r[1] / size[1] * 100) + '%';
    box.style.width = (r[2] / size[0] * 100) + '%'; box.style.height = (r[3] / size[1] * 100) + '%';
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
    show, close, state: () => ({ step, closed }),
    destroy() { document.removeEventListener('keydown', onKey); scrim.removeEventListener('mousedown', onDown); scrim.removeEventListener('click', onScrim); back.removeEventListener('click', onBack); next.removeEventListener('click', onNext); start.removeEventListener('click', close); },
  };
}
