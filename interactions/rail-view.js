// V3KTR rail view switch + group filter (v0.41.124, Patrick 2026-11-16, picked from V3KTR-COWORK/reports/rail-view-mock/):
// an add-rail is shown as icons only (the tile grid) or as one column of icon + label, and its FX-group chips filter it.
//
//   <div data-view="icons">   (the rail root, the app's own element)
//     <div class="vk-rail-head">
//       <div class="vk-rail-chips"><button class="vk-chip vk-chip--group is-on" data-rail-filter="all">ALL</button>
//         <button class="vk-chip vk-chip--group" data-rail-filter="rep" style="--gcol:var(--type-rose)">REP</button> …</div>
//       <button class="vk-icon-tog" data-rail-view-toggle></button>
//     </div>
//     … groups: any element with data-group="rep" (heading + its tiles / rows)
//   </div>
//   const rv = railView(root, { app: 'processor', defaultView: 'icons', icons: { icons: svg, labels: svg }, onChange })
//   → { view, filter, setView(v), setFilter(g), destroy() }
//
// The toggle's icon shows the view you would switch TO (icons.labels while in icons view, icons.icons in labels view);
// its tip reads "Show labels" / "Show icons" (data-tip). The view is remembered as 'v3ktr-<app>-railView', so Reset to
// defaults (reset.js) clears it; the filter is not remembered. One group at a time; ALL resets. Rails stay add-only.
const KEY = (app) => `v3ktr-${app}-railView`;
const store = () => { try { return localStorage; } catch { return null; } };

export function railView(root, { app, defaultView = 'icons', icons = {}, onChange = () => {} } = {}) {
  const toggle = root.querySelector('[data-rail-view-toggle]');
  let view = defaultView, filter = 'all';
  try { const v = store()?.getItem(KEY(app)); if (v === 'icons' || v === 'labels') view = v; } catch {}
  const apply = () => {
    root.dataset.view = view;
    if (toggle) {
      const to = view === 'icons' ? 'labels' : 'icons';
      if (icons[to]) toggle.innerHTML = icons[to];
      const tip = to === 'labels' ? 'Show labels' : 'Show icons';
      toggle.dataset.tip = tip; toggle.setAttribute('aria-label', tip);
    }
    for (const el of root.querySelectorAll('[data-group]')) el.hidden = filter !== 'all' && el.dataset.group !== filter;
    for (const c of root.querySelectorAll('[data-rail-filter]')) c.classList.toggle('is-on', c.dataset.railFilter === filter);
  };
  const setView = (v) => { if (v !== 'icons' && v !== 'labels') return; view = v; try { store()?.setItem(KEY(app), v); } catch {} apply(); onChange({ view, filter }); };
  const setFilter = (g) => { filter = g || 'all'; apply(); onChange({ view, filter }); };
  const onClick = (e) => {
    if (e.target.closest('[data-rail-view-toggle]')) return setView(view === 'icons' ? 'labels' : 'icons');
    const c = e.target.closest('[data-rail-filter]'); if (c) setFilter(c.dataset.railFilter);
  };
  root.addEventListener('click', onClick);
  apply();
  return { get view() { return view; }, get filter() { return filter; }, setView, setFilter, destroy() { root.removeEventListener('click', onClick); } };
}
