// V3KTR rail scroll hint (v0.41.130, from PROCESSOR's .rail-scrollhint; asked for by DIMENSOR, Patrick confirmed it for the Add and 3D FX rails):
// a quiet "Scroll FX" line in a rail's FIXED header, directly after the filter chips and outside the scroller, so it never scrolls away.
//
//   <div class="vk-rail-scrollhint" aria-hidden="true">
//     <svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
//     <span>Scroll FX</span>
//     <svg …same chevron…/>
//   </div>
//   const h = railScrollHint(hintEl, scrollerEl)   → { update(), destroy() }
//
// Hidden unless the scroller overflows (more than 2px); `.is-end` (dimmed) once it is within 2px of the bottom. The arrows always point down.
// Updates on the scroller's scroll, on a ResizeObserver on the scroller, and when the app calls update() (after a filter change).
// The noun is the app's: "Scroll FX" on an FX rail, "Scroll" on an Add rail.
const EPS = 2;

export function railScrollHint(hint, scroller) {
  const update = () => {
    const over = scroller.scrollHeight - scroller.clientHeight > EPS;
    hint.hidden = !over;
    hint.classList.toggle('is-end', over && scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop <= EPS);
  };
  scroller.addEventListener('scroll', update, { passive: true });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(update) : null;
  ro?.observe(scroller);
  update();
  return { update, destroy() { scroller.removeEventListener('scroll', update); ro?.disconnect(); } };
}
