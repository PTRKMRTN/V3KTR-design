// V3KTR toasts (v0.25.0): the behaviour behind .vk-toast, the same in every app. T4 of the help pattern: non-blocking
// news ("Saved", "Couldn't read that file. Try a PNG, JPG or WebP."). Use the alert dialog only when the person must act.
//
//   toast('Saved')                                      a plain message
//   toast({ what: "Couldn't read that file.", todo: 'Try a PNG, JPG or WebP.' }, { kind: 'error' })
//                                                       the template: "What happened. What to do."
//   toast(msg, { ms: 4000, action: { label: 'Undo', run: () => … } })
//   → { close() }
//
//   - One live region, created on first use: role="status" (polite) for news, role="alert" for kind 'error'.
//   - One toast at a time: a new one replaces the current one (no stacks piling up over the canvas).
//   - WHERE: centred above the viewport bars of a HOST element, one stacked step above the bottom toolbar
//     (bottom: --vp-bar-bottom + --vp-bar-step + 4px). Set the host once with setToastHost(viewportEl), or per call with
//     { host }; it should be the canvas area (it gets position:relative if it is static). Without a host it falls back to
//     the whole window, which is off-centre in an app with side panels (v0.25.2: found by DIMENSOR, 291 px off).
//   - It stays ms (default 3200; errors 6000), and stays while the pointer is over it or it has focus. Esc closes it.
//     ⚠️ While shown it catches the pointer where it sits (so hover-hold and its action work): keep it short.
//   - Raw errors never go in here: log err to the console and show the template instead.

const regions = new Map();   // host element → its region
let current = null, defaultHost = null;

/** Set where toasts appear from now on: the app's canvas / viewport element. */
export function setToastHost(el) { defaultHost = el || null; }

function ensureRegion(doc, host) {
  const key = host || doc;
  const have = regions.get(key);
  if (have && have.isConnected) return have;
  const region = doc.createElement('div');
  region.className = 'vk-toast-region';
  const pos = host ? 'absolute' : 'fixed';
  region.style.cssText = `position:${pos};left:50%;transform:translateX(-50%);bottom:calc(var(--vp-bar-bottom, 50px) + var(--vp-bar-step, 36px) + 4px);z-index:900;pointer-events:none;`;
  if (host && (doc.defaultView || window).getComputedStyle(host).position === 'static') host.style.position = 'relative';
  (host || doc.body || doc.documentElement).appendChild(region);
  regions.set(key, region);
  return region;
}

export function toast(message, { kind = 'info', ms, action, host = defaultHost, doc = document } = {}) {
  const text = typeof message === 'string' ? message : [message.what, message.todo].filter(Boolean).join(' ');
  const r = ensureRegion(doc, host);
  if (current) current.close();
  const el = doc.createElement('div');
  el.className = 'vk-toast' + (kind === 'error' ? ' vk-toast--error' : '');
  el.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  el.style.pointerEvents = 'auto';
  const span = doc.createElement('span'); span.textContent = text; el.appendChild(span);
  if (action) {
    const b = doc.createElement('button'); b.type = 'button'; b.className = 'vk-btn vk-btn--sm'; b.textContent = action.label;
    b.addEventListener('click', () => { try { action.run(); } finally { handle.close(); } });
    el.appendChild(b);
  }
  r.appendChild(el);
  let timer = 0, hold = false;
  const arm = () => { clearTimeout(timer); timer = setTimeout(() => { if (!hold) handle.close(); }, ms ?? (kind === 'error' ? 6000 : 3200)); };
  el.addEventListener('pointerenter', () => { hold = true; clearTimeout(timer); });
  el.addEventListener('pointerleave', () => { hold = false; arm(); });
  el.addEventListener('focusin', () => { hold = true; clearTimeout(timer); });
  el.addEventListener('focusout', () => { hold = false; arm(); });
  const onKey = (e) => { if (e.key === 'Escape') handle.close(); };
  doc.addEventListener('keydown', onKey);
  const handle = { el, close() { clearTimeout(timer); doc.removeEventListener('keydown', onKey); el.remove(); if (current === handle) current = null; } };
  current = handle; arm();
  return handle;
}
