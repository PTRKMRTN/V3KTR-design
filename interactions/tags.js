// V3KTR removable tag list behaviour (v0.41.177): the keyboard and focus rules behind app/tags.css, the same in every app.
//
//   const t = mountTags(row, { onRemove(name, tagEl), addSelector = '[data-tags-add]' })   → { destroy() }
//
//   row       the `.vk-row` (or any element) that holds the `.vk-tags` list and the add button.
//   onRemove  called once per removal, BEFORE the tag leaves the DOM, with the name (its `.vk-tags__t` text) and the tag element. The app removes the reference and records ONE undo step.
//             Return `false` to cancel the removal.
//
//   - A click on an x, or Enter / Space (the native button) or Delete / Backspace on a focused x, removes that tag.
//   - After a removal focus moves to the next x, else the previous x, else the add button (`[data-tags-add]`): focus is never lost to <body>.
//   - A polite live region (`.vk-tags__live`, role=status) says "Removed <name>".
//   - It never adds a tag: adding is the app's own (Add selected), and it renders its own tag markup (see app/tags.css).
//   Event delegation on the row, so tags the app adds or re-renders later work without calling anything.

export function mountTags(row, { onRemove = null, addSelector = '[data-tags-add]' } = {}) {
  const list = row.querySelector('.vk-tags') || row;
  let live = row.querySelector('.vk-tags__live');
  if (!live) { live = document.createElement('span'); live.className = 'vk-tags__live'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); row.appendChild(live); }
  const xs = () => [...list.querySelectorAll('.vk-tags__x')];
  function remove(x) {
    const tag = x.closest('.vk-tags__tag'); if (!tag) return;
    const name = (tag.querySelector('.vk-tags__t') || tag).textContent.trim();
    const all = xs(), i = all.indexOf(x);
    if (onRemove && onRemove(name, tag) === false) return;
    tag.remove();
    const rest = xs();
    const target = rest[i] || rest[i - 1] || row.querySelector(addSelector);   // the tag that took its place, else the one before, else the add button
    if (target && target.focus) target.focus();
    live.textContent = ''; live.textContent = 'Removed ' + name;
  }
  const onClick = (e) => { const x = e.target.closest && e.target.closest('.vk-tags__x'); if (x && list.contains(x)) remove(x); };
  const onKey = (e) => { if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.classList && e.target.classList.contains('vk-tags__x')) { e.preventDefault(); remove(e.target); } };
  row.addEventListener('click', onClick); row.addEventListener('keydown', onKey);
  return { destroy() { row.removeEventListener('click', onClick); row.removeEventListener('keydown', onKey); } };
}
