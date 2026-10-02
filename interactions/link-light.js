// V3KTR link light (v0.26.0): which V3KTR apps are open and linked in this browser, the same in all three apps' top bars
// (CONNECTIVITY.md W2.3 + W4.5; protocol: LINK-PROTOCOL.md hello/bye, a peer drops after 90 s of silence). This draws
// it; the app's own link code says who is linked.
//
//   const light = mountLinkLight(el, { self: 'processor', onFocus: (app) => link.send(app, { type: 'focus' }) });
//   light.update({ state: 'ready', peers: ['kompositor'] });   // state: 'off' | 'connecting' | 'ready'
//
// Three marks, P · K · D, always in that order, so they sit in the same place in every app:
//   this app   its letter in its own colour, no fill           tip "PROCESSOR (this app)"
//   linked     a solid tile in that app's colour, dark letter  tip "KOMPOSITOR is open and linked. Click to switch to it."
//              it is a real <button>: click or Enter calls onFocus(app)
//   not open   a grey letter, no fill                          tip "KOMPOSITOR isn't open in this browser."
//   no link    (state 'off' or 'connecting') the other two read as not open, and their tip says why
// Never colour alone: every mark has a tip (data-tip, shown by installTips) and an aria-label with the word.

export const LINK_APPS = [['processor', 'P', 'PROCESSOR'], ['kompositor', 'K', 'KOMPOSITOR'], ['dimensor', 'D', 'DIMENSOR']];

const TIPS = {
  self: (n) => `${n} (this app)`,
  linked: (n) => `${n} is open and linked. Click to switch to it.`,
  absent: (n) => `${n} isn't open in this browser.`,
  off: (n) => `No link to ${n} here. Apps link when they're opened on a V3KTR address.`,
  connecting: () => 'Connecting to the V3KTR link…',
};

export function mountLinkLight(el, { self, onFocus = () => {}, tips = {} } = {}) {
  if (!el) return { update() {} };
  const t = { ...TIPS, ...tips };
  el.classList.add('vk-link');
  el.setAttribute('role', 'group');
  el.setAttribute('aria-label', 'V3KTR link');
  let last = '';
  function update({ state = 'off', peers = [] } = {}) {
    const linked = new Set(state === 'ready' ? peers : []);
    const key = state + '|' + [...linked].sort().join(',');
    if (key === last) return; last = key;
    el.dataset.state = state;
    el.replaceChildren(...LINK_APPS.map(([id, letter, name]) => {
      const kind = id === self ? 'self' : linked.has(id) ? 'linked' : state === 'ready' ? 'absent' : state;
      const tip = (t[kind] || t.absent)(name);
      const m = document.createElement(kind === 'linked' ? 'button' : 'span');
      m.className = `vk-link__mark is-${kind === 'off' || kind === 'connecting' ? 'absent' : kind}`;
      m.dataset.app = id; m.textContent = letter;
      m.dataset.tip = tip; m.setAttribute('aria-label', tip);
      if (kind === 'linked') { m.type = 'button'; m.addEventListener('click', () => onFocus(id)); }
      else m.setAttribute('role', 'img');
      return m;
    }));
  }
  update();
  return { update };
}
