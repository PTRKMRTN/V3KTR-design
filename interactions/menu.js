// V3KTR menu bar keyboard (v0.25.0): a real WAI-ARIA menubar, the same in every app. Lifted from PROCESSOR's
// menubarKeys (v0.617.0, help step 3, tested by its test/menubar-keys.mjs 33/33) and made generic.
//
//   On a menu title:  ← → move along the bar (an open menu stays open on the new title) · ↓ / Enter / Space open it on
//                     its first row · ↑ opens it on the last row · Home / End · Esc closes.
//   Inside a menu:    ↑ ↓ move (wrapping) · Home / End · Enter / Space run the row · Esc closes and returns to the title
//                     · ← → close it and open the neighbouring menu · Tab closes it.
//   Roving tabindex: exactly one title is in the tab order. Mouse behaviour is the app's own (this only adds keys).
//   A handled key stops here, so it never also reaches the app's own shortcuts (Space-to-pan, arrows, Esc chains).
//   aria-expanded, aria-checked (rows with a state check) and aria-disabled follow the classes the app already sets.
//
// installMenubar(bar, options) → uninstall()
//   bar      the element holding the menu titles; it gets role="menubar"
//   options  selectors and class names, defaulting to the shared vk- classes:
//     menu: ':scope > .vk-menu'   pop: '.vk-menu-pop'   item: '.vk-menu-item'   sep: '.vk-menu-sep'   label: '.vk-menu-label'
//     check: '.vk-menu-check' (a row whose check has data-* attributes is a menuitemcheckbox)
//     openClass: 'is-open'   disabledClass: 'is-disabled'   staticClass: 'is-static' (reference rows: read, not run)
//     open(menu): how to open a menu (default: menu.click(), i.e. the app's own click handler)
//   PROCESSOR passes its own names: { menu: ':scope > .menu[data-menu]', pop: '.menu-pop', item: '.mi', sep: '.mi-sep',
//   label: '.mi-group-label', check: '.mi-check', openClass: 'open', disabledClass: 'disabled', staticClass: 'mi-static' }.

export function installMenubar(bar, o = {}) {
  const opt = { menu: ':scope > .vk-menu', pop: '.vk-menu-pop', item: '.vk-menu-item', sep: '.vk-menu-sep', label: '.vk-menu-label',
    check: '.vk-menu-check', openClass: 'is-open', disabledClass: 'is-disabled', staticClass: 'is-static', open: (m) => m.click(), ...o };
  if (!bar) return () => {};
  bar.setAttribute('role', 'menubar');
  const menus = [...bar.querySelectorAll(opt.menu)];
  const rows = (m) => [...m.querySelectorAll(`${opt.pop} ${opt.item}`)];
  const titleOf = (m) => (m.firstChild && m.firstChild.textContent || '').trim();
  const isOpen = (m) => m.classList.contains(opt.openClass);
  const observers = [];
  menus.forEach((m, i) => {
    m.setAttribute('role', 'menuitem'); m.setAttribute('aria-haspopup', 'menu'); m.setAttribute('aria-expanded', 'false');
    m.tabIndex = i === 0 ? 0 : -1;
    const pop = m.querySelector(opt.pop);
    if (pop) { pop.setAttribute('role', 'menu'); pop.setAttribute('aria-label', titleOf(m)); }
    m.querySelectorAll(opt.sep).forEach((x) => x.setAttribute('role', 'separator'));
    m.querySelectorAll(opt.label).forEach((x) => x.setAttribute('role', 'presentation'));
    const roleRows = () => rows(m).forEach((mi) => {
      const chk = mi.querySelector(opt.check), stateful = chk && Object.keys(chk.dataset).length > 0;
      mi.setAttribute('role', stateful ? 'menuitemcheckbox' : 'menuitem'); mi.tabIndex = -1;
      if (mi.classList.contains(opt.staticClass)) mi.setAttribute('aria-disabled', 'true');
    });
    roleRows();
    const mo = new MutationObserver(() => {
      const open = isOpen(m); m.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { roleRows(); rows(m).forEach((mi) => {
        if (mi.getAttribute('role') === 'menuitemcheckbox') mi.setAttribute('aria-checked', (mi.querySelector(opt.check).textContent || '').trim() ? 'true' : 'false');
        if (!mi.classList.contains(opt.staticClass)) mi.setAttribute('aria-disabled', mi.classList.contains(opt.disabledClass) ? 'true' : 'false');
      }); }
    });
    mo.observe(m, { attributes: true, attributeFilter: ['class'] }); observers.push(mo);
  });
  const anyOpen = () => menus.some(isOpen);
  const closeAll = () => menus.forEach((x) => x.classList.remove(opt.openClass));
  const openMenu = (m, last) => { if (!isOpen(m)) opt.open(m); const r = rows(m); const t = last ? r[r.length - 1] : r[0]; if (t) t.focus(); };
  const goTitle = (i, open) => {
    const m = menus[(i + menus.length) % menus.length]; closeAll();
    menus.forEach((x) => { x.tabIndex = -1; }); m.tabIndex = 0; m.focus();
    if (open) openMenu(m, false);
  };
  const handlers = menus.map((m, i) => {
    const h = (e) => {
      const k = e.key, inRow = e.target !== m && e.target.matches && e.target.matches(opt.item);
      let done = true;
      if (!inRow) {
        if (k === 'ArrowRight') goTitle(i + 1, anyOpen());
        else if (k === 'ArrowLeft') goTitle(i - 1, anyOpen());
        else if (k === 'ArrowDown' || k === 'Enter' || k === ' ') openMenu(m, false);
        else if (k === 'ArrowUp') openMenu(m, true);
        else if (k === 'Home') goTitle(0, false);
        else if (k === 'End') goTitle(menus.length - 1, false);
        else if (k === 'Escape' && isOpen(m)) m.classList.remove(opt.openClass);
        else done = false;
      } else {
        const r = rows(m), j = r.indexOf(e.target);
        if (k === 'ArrowDown') r[(j + 1) % r.length].focus();
        else if (k === 'ArrowUp') r[(j - 1 + r.length) % r.length].focus();
        else if (k === 'Home') r[0].focus();
        else if (k === 'End') r[r.length - 1].focus();
        else if (k === 'Enter' || k === ' ') {
          const row = e.target;
          if (!row.classList.contains(opt.staticClass) && !row.classList.contains(opt.disabledClass)) { m.focus(); row.click(); }   // focus the title FIRST: a dialog the row opens returns focus there
        }
        else if (k === 'Escape') { m.classList.remove(opt.openClass); m.focus(); }
        else if (k === 'ArrowRight') goTitle(i + 1, true);
        else if (k === 'ArrowLeft') goTitle(i - 1, true);
        else if (k === 'Tab') { m.classList.remove(opt.openClass); done = false; }
        else done = false;
      }
      if (done) { e.preventDefault(); e.stopPropagation(); }
    };
    m.addEventListener('keydown', h); return [m, h];
  });
  return function uninstall() { observers.forEach((o2) => o2.disconnect()); handlers.forEach(([m, h]) => m.removeEventListener('keydown', h)); };
}
