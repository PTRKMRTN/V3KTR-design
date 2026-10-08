// V3KTR in-app help (v0.24.0): the shared tip behaviour, the Helper Text toggle and platform key labels, the same in every
// app. Spec: V3KTR-PROJEKT/strategy/HELP-PATTERN.md (approved by Patrick 2026-10-02); rules: AGENTS.md "Help and copy".
//
// ⛔ The default UI gains no visual complexity: no (i) icons, no always-visible help. Help shows only when activated:
//    hover, keyboard focus, long-press, or View → Helper Text (OFF by default).
//
// TIPS (T1). Mark any control with data attributes; one shared .vk-tip element shows them:
//   <button data-tip="Randomise" data-tip-desc="Roll new settings for this effect" data-tip-key="R">…</button>
//   data-tip-side="left|right|top|bottom" (default bottom, flipped to fit). Rail tips use the side AWAY from the panel.
//   - mouse / pen: opens after ~400 ms of hover; closes on leave. Warm mode (v0.25.1): once a tip has opened, the next
//     control's tip opens at once, until the pointer has been off every tip target for 500 ms (`warm`, 0 = off).
//   - keyboard: opens IMMEDIATELY when the control gets keyboard focus (:focus-visible); closes on blur.
//   - touch: opens on a 500 ms long-press (the press then does NOT also activate the control); closes on a tap elsewhere.
//   - Esc closes. While open the control gets aria-describedby → the tip, so screen readers read it too.
//   Retire native title= on anything that gets a data-tip (title is invisible on touch and to keyboard users).
//
//   installTips({ root, delay, longPress, warm }) → uninstall()
//
// HELPER TEXT (T2). View → Helper Text, off by default, remembered per app. While on, <html data-helper-text="on"> and the
// parameter descriptions (.vk-param-desc) show.
//   const help = helperText('processor');   help.on  ·  help.set(true)  ·  help.toggle()
//
// KEY LABELS. Write shortcuts once as "Ctrl+Shift+S"; keyLabel() shows them in the platform's form (⌘⇧S on a Mac).

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');

/** "Ctrl+Shift+S" → "⌘⇧S" on a Mac, "Ctrl+Shift+S" elsewhere. "Mod" means Ctrl / ⌘. */
export function keyLabel(combo, mac = isMac()) {
  if (!combo) return '';
  if (!mac) return combo.replace(/\bMod\b/g, 'Ctrl');
  const map = { Mod: '⌘', Ctrl: '⌘', Cmd: '⌘', Shift: '⇧', Alt: '⌥', Option: '⌥', Enter: '↩', Backspace: '⌫', Delete: '⌦', Esc: '⎋' };
  return combo.split('+').map((k) => map[k.trim()] ?? k.trim()).join('');
}

/** Install the shared tip behaviour on a root (default: the document). Returns a function that removes it. */
export function installTips({ root = document, delay = 400, longPress = 500, warm = 500, doc = root.ownerDocument || root } = {}) {
  const tip = doc.createElement('div');
  tip.className = 'vk-tip'; tip.id = 'vk-tip-' + Math.random().toString(36).slice(2, 8); tip.setAttribute('role', 'tooltip');
  (doc.body || doc.documentElement).appendChild(tip);
  let target = null, pending = null, timer = 0, pressX = 0, pressY = 0, eatClick = false, lastHidden = 0, shownByFocus = false, blurTimer = 0;
  const find = (el) => (el && el.closest ? el.closest('[data-tip]') : null);

  function fill(el) {
    tip.textContent = '';
    const b = doc.createElement('b'); b.textContent = el.dataset.tip; tip.appendChild(b);
    if (el.dataset.tipKey) { const k = doc.createElement('kbd'); k.textContent = keyLabel(el.dataset.tipKey); b.appendChild(k); }
    if (el.dataset.tipDesc) { const em = doc.createElement('em'); em.textContent = el.dataset.tipDesc; tip.appendChild(em); }
  }
  function place(el) {
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect(), W = doc.documentElement.clientWidth, H = doc.documentElement.clientHeight, g = 8;
    const at = {
      bottom: [r.left + r.width / 2 - t.width / 2, r.bottom + g], top: [r.left + r.width / 2 - t.width / 2, r.top - g - t.height],
      left: [r.left - g - t.width, r.top + r.height / 2 - t.height / 2], right: [r.right + g, r.top + r.height / 2 - t.height / 2],
    };
    const fits = ([x, y]) => x >= 0 && y >= 0 && x + t.width <= W && y + t.height <= H;
    const want = el.dataset.tipSide || 'bottom', flip = { bottom: 'top', top: 'bottom', left: 'right', right: 'left' }[want] || 'top';
    let [x, y] = fits(at[want] || at.bottom) ? (at[want] || at.bottom) : fits(at[flip]) ? at[flip] : (at[want] || at.bottom);
    x = Math.max(4, Math.min(W - t.width - 4, x)); y = Math.max(4, Math.min(H - t.height - 4, y));
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
  }
  const win = doc.defaultView || window;
  const cancelBlur = () => { win.clearTimeout(blurTimer); blurTimer = 0; };
  function show(el, byFocus = false) {
    clearTimeout(timer); cancelBlur();
    if (!el || !el.dataset.tip) return;
    if (target && target !== el) hide();
    target = el; shownByFocus = byFocus; fill(el); tip.classList.add('is-shown'); place(el);
    const d = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (!d.includes(tip.id)) el.setAttribute('aria-describedby', [...d, tip.id].join(' '));
  }
  function hide() {
    clearTimeout(timer); cancelBlur(); pending = null;
    if (target) lastHidden = Date.now();   // warm mode starts counting from here
    if (target) {
      const d = (target.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== tip.id);
      d.length ? target.setAttribute('aria-describedby', d.join(' ')) : target.removeAttribute('aria-describedby');
    }
    target = null; shownByFocus = false; tip.classList.remove('is-shown');
  }

  const on = [];
  const listen = (el, ev, fn, opt) => { el.addEventListener(ev, fn, opt); on.push([el, ev, fn, opt]); };
  listen(root, 'pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const el = find(e.target); if (!el || el === target || el === pending) return;   // crossing a control's own children doesn't restart the delay
    // WARM MODE: once a tip has been open, the next control shows its tip at once, so scanning a row of tiles (an FX
    // rail) doesn't wait 400 ms on every one. It cools after `warm` ms with the pointer off every tip target.
    const isWarm = warm > 0 && (target || Date.now() - lastHidden < warm);
    clearTimeout(timer); pending = el; timer = setTimeout(() => { pending = null; show(el); }, isWarm ? 0 : delay);
  });
  listen(root, 'pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const el = find(e.target); if (!el) return;
    if (e.relatedTarget && el.contains(e.relatedTarget)) return;   // moving inside the control
    pending = null;
    if (el === target || !target) hide(); else clearTimeout(timer);
  });
  listen(root, 'focusin', (e) => { cancelBlur(); const el = find(e.target); if (el && el.matches(':focus-visible')) show(el, true); });
  // A blur is deferred 150 ms (found by KOMPOSITOR, 2026-10-08, from a probe showing the tip gone with no scroll at
  // all, a gap of up to ~120 ms before a one-frame defer was tried and found too short): a scrolling list that
  // re-renders its rows can detach and re-insert the focused element, firing a real focusout even though the user
  // never moved focus away, and that re-render's own refocus can take a while to land. If a focusin arrives before
  // the deferred check runs (that refocus, or a genuine Tab to the next control, both normally within a frame of
  // this focusout), cancelBlur() in show()/focusin above cancels it and the tip either stays or moves to the new
  // target with no flicker (checked by a MutationObserver in the test, not just "is it shown again afterwards").
  listen(root, 'focusout', (e) => {
    if (find(e.target) !== target) return;
    cancelBlur();
    blurTimer = win.setTimeout(() => { if (!doc.activeElement || !doc.activeElement.matches(':focus-visible') || find(doc.activeElement) !== target) hide(); }, 150);
  });
  listen(root, 'pointerdown', (e) => {
    const el = find(e.target);
    if (target && el !== target) hide();                          // a tap (or click) elsewhere closes it
    if (e.pointerType !== 'touch' || !el) { if (e.pointerType !== 'touch') hide(); return; }
    pressX = e.clientX; pressY = e.clientY; clearTimeout(timer);
    timer = setTimeout(() => { show(el); eatClick = true; }, longPress);
  });
  listen(root, 'pointermove', (e) => { if (e.pointerType === 'touch' && Math.hypot(e.clientX - pressX, e.clientY - pressY) > 8) clearTimeout(timer); });
  listen(root, 'pointerup', (e) => { if (e.pointerType === 'touch' && !eatClick) clearTimeout(timer); });
  listen(root, 'pointercancel', () => clearTimeout(timer));
  listen(root, 'click', (e) => { if (eatClick) { eatClick = false; e.preventDefault(); e.stopPropagation(); } }, true);   // a long-press shows the tip; it doesn't also press
  listen(root, 'contextmenu', (e) => { if (e.pointerType === 'touch' || eatClick) e.preventDefault(); });
  listen(doc, 'keydown', (e) => { if (e.key === 'Escape' && target) hide(); });
  // A keyboard focus that lands inside a scroll area makes the browser scroll it into view, which used to hide the
  // tip 10-80 ms after it showed (found by KOMPOSITOR, 2026-10-08). While the tip is up because of keyboard focus
  // and that same control is still genuinely focused, a scroll just moves the tip with it instead of hiding it —
  // this removes the race entirely, rather than guessing a safe delay. Scroll still hides a hover-shown tip (it
  // isn't anchored to anything the user is still doing), and still hides a focus-shown one once focus has actually
  // left (shownByFocus false, or the control no longer :focus-visible — the focusout/blurTimer path above owns that).
  listen(doc.defaultView || window, 'scroll', () => {
    if (!target) return;
    if (shownByFocus && target.matches && target.matches(':focus-visible') && doc.activeElement === target) place(target);
    else hide();
  }, true);

  return function uninstall() { hide(); for (const [el, ev, fn, opt] of on) el.removeEventListener(ev, fn, opt); tip.remove(); };
}

/** View → Helper Text: off by default, remembered per app. Sets <html data-helper-text="on"> while on. */
export function helperText(app, { doc = document, store = (() => { try { return localStorage; } catch { return null; } })() } = {}) {
  const key = `v3ktr-${app}-helper-text`;
  let v = false;
  try { v = store?.getItem(key) === 'on'; } catch {}
  const apply = () => { if (v) doc.documentElement.setAttribute('data-helper-text', 'on'); else doc.documentElement.removeAttribute('data-helper-text'); };
  apply();
  return {
    get on() { return v; },
    set(next) { v = !!next; try { store?.setItem(key, v ? 'on' : 'off'); } catch {} apply(); return v; },
    toggle() { return this.set(!v); },
  };
}
