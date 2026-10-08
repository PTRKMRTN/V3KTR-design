// V3KTR scroll fades (v0.36.0, Patrick 2026-10-08): the behaviour behind .vk-scroll's edge fades, the same in every app.
// A scroll area fades out over --scroll-fade at an edge with more content past it: the TOP once it has been scrolled
// (so you can see an area is not at its start), the BOTTOM while there is more below. The fade is a CSS mask on the
// scroll area (app/frames.css), so it works on any ground; this only sets the two data attributes.
//
//   const f = scrollFade(el)     → { update(), destroy() }
//   scrollFades(root)            every .vk-scroll under root (default document); returns the handles
//
//   - Updates on scroll, on resize of the area or of its content (ResizeObserver), and on DOM changes inside it
//     (MutationObserver), so a list that grows or a section that opens updates without the app calling update().
//   - 1px tolerance: a fractional scroll position never leaves a hairline fade at an edge that is really reached.
//   - Works with any element that scrolls vertically; it doesn't need the .vk-scroll class (an app migrating can apply
//     its own mask with the same data attributes).

const FADE_EPS = 1;

/** Keep el's data-fade-top / data-fade-bottom in step with its scroll position. */
export function scrollFade(el) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const top = el.scrollTop > FADE_EPS;
    const bottom = el.scrollHeight - el.clientHeight - el.scrollTop > FADE_EPS;
    if (top) el.setAttribute('data-fade-top', ''); else el.removeAttribute('data-fade-top');
    if (bottom) el.setAttribute('data-fade-bottom', ''); else el.removeAttribute('data-fade-bottom');
  };
  const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
  el.addEventListener('scroll', schedule, { passive: true });
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  if (ro) { ro.observe(el); for (const c of el.children) ro.observe(c); }
  const mo = typeof MutationObserver === 'function' ? new MutationObserver(() => {
    if (ro) for (const c of el.children) ro.observe(c);
    schedule();
  }) : null;
  if (mo) mo.observe(el, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open'] });
  update();
  return {
    update,
    destroy() {
      el.removeEventListener('scroll', schedule);
      if (ro) ro.disconnect();
      if (mo) mo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.removeAttribute('data-fade-top'); el.removeAttribute('data-fade-bottom');
    },
  };
}

/** scrollFade() on every .vk-scroll under root. */
export function scrollFades(root = document) {
  return [...root.querySelectorAll('.vk-scroll')].map(scrollFade);
}
