// V3KTR tile fly-out (v0.41.119, Patrick 2026-11-13: "tiles folding out to the left"): the picker for a viewport tool column.
// Replaces a native <select> over a tile (the OS list is off-brand). Click the tile and its choices fold out to the LEFT as a row of tiles.
//
//   <div class="vk-vtools__fly">
//     <button class="vk-vtools__t vk-vtools__t--val" aria-haspopup="true" aria-expanded="false" data-tip="Render scale">AUTO</button>
//     <div class="vk-vtools__opts" role="menu" hidden>
//       <button class="vk-vtools__o" role="menuitemradio" aria-checked="true" data-value="auto">Auto · full</button> …
//   const f = vfly(el, { onPick: (value, label) => … });   → { value, set(value, silent), close(), destroy() }
// Picking sets aria-checked, writes the tile's text from data-short (or the option's text), closes. Esc, outside click or a second click close.
// Left / Right move between options when open; Enter or Space picks.
export function vfly(el, { onPick } = {}) {
  const tile = el.querySelector(':scope > .vk-vtools__t'), box = el.querySelector(':scope > .vk-vtools__opts');
  const opts = () => [...box.querySelectorAll('.vk-vtools__o')];
  const open = () => { box.hidden = false; tile.setAttribute('aria-expanded', 'true'); (opts().find((o) => o.getAttribute('aria-checked') === 'true') || opts()[0])?.focus(); };
  const close = (back) => { box.hidden = true; tile.setAttribute('aria-expanded', 'false'); if (back) tile.focus(); };
  const set = (value, silent) => {
    const o = opts().find((x) => x.dataset.value === String(value)); if (!o) return;
    opts().forEach((x) => x.setAttribute('aria-checked', x === o ? 'true' : 'false'));
    tile.textContent = o.dataset.short || o.textContent;
    if (!silent && onPick) onPick(o.dataset.value, o.textContent);
  };
  const onTile = () => (box.hidden ? open() : close());
  const onBox = (e) => { const o = e.target.closest('.vk-vtools__o'); if (o) { set(o.dataset.value); close(true); } };
  const onKey = (e) => {
    if (box.hidden) return;
    const l = opts(), i = l.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); l[Math.min(l.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); l[Math.max(0, i - 1)]?.focus(); }
  };
  const onDoc = (e) => { if (!box.hidden && !el.contains(e.target)) close(); };
  tile.addEventListener('click', onTile); box.addEventListener('click', onBox); el.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDoc);
  return { get value() { return opts().find((o) => o.getAttribute('aria-checked') === 'true')?.dataset.value; }, set, close, destroy() { tile.removeEventListener('click', onTile); box.removeEventListener('click', onBox); el.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDoc); } };
}
