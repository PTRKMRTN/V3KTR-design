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
//   - It sits where .vk-toast--pinned puts it (above the viewport bars), stays ms (default 3200; errors 6000), and
//     stays while the pointer is over it or it has focus. Esc closes it.
//   - Raw errors never go in here: log err to the console and show the template instead.

let region = null, current = null;

function ensureRegion(doc) {
  if (region && region.isConnected) return region;
  region = doc.createElement('div');
  region.className = 'vk-toast-region';
  region.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(var(--vp-bar-bottom, 50px) + var(--vp-bar-step, 36px) + 4px);z-index:900;pointer-events:none;';
  (doc.body || doc.documentElement).appendChild(region);
  return region;
}

export function toast(message, { kind = 'info', ms, action, doc = document } = {}) {
  const text = typeof message === 'string' ? message : [message.what, message.todo].filter(Boolean).join(' ');
  const r = ensureRegion(doc);
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
