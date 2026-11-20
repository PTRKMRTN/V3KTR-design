// V3KTR scroll fades (v0.36.0, Patrick 2026-10-08; both directions since v0.41.176, Patrick 2026-11-20, card DS-horizontal-edge-fade): the behaviour behind .vk-scroll's edge fades, the same in every app.
// A scroll area fades out over --scroll-fade at an edge with more content past it: the TOP once it has been scrolled
// (so you can see an area is not at its start), the BOTTOM while there is more below, and the same for LEFT and RIGHT on a row that scrolls sideways
// (a one-row bar that cannot wrap: DIMENSOR's Library bar). The fade is a CSS mask on the scroll area (app/frames.css), so it works on any ground; this only sets the four data attributes.
//
//   const f = scrollFade(el)     → { update(), destroy() }
//   scrollFades(root)            every .vk-scroll under root (default document); returns the handles
//
//   - Updates on scroll, on resize of the area or of its content (ResizeObserver), and on DOM changes inside it
//     (MutationObserver), so a list that grows or a section that opens updates without the app calling update().
//   - 1px tolerance: a fractional scroll position never leaves a hairline fade at an edge that is really reached.
//   - The axis is found from the element, not from a class: an element that scrolls sideways (overflow-x auto or scroll) gets data-fade-left / data-fade-right, one that scrolls
//     down gets data-fade-top / data-fade-bottom, and one that scrolls both ways gets all that apply. An app calls nothing new.
//   - Works with any element that scrolls; it doesn't need the .vk-scroll class (an app migrating can apply its own mask with the same data attributes).
//   - The vertical-wheel-to-sideways mapping for a row with no bar is NOT part of this: it stays the app's own behaviour.

const FADE_EPS = 1;

/** Keep el's data-fade-top / data-fade-bottom in step with its scroll position. */
export function scrollFade(el) {
  let raf = 0;
  const update = () => {
    raf = 0;
    const cs = getComputedStyle(el);
    const yOk = cs.overflowY !== 'hidden' && cs.overflowY !== 'clip';          // a row with overflow-y:hidden never fades top or bottom
    const xOk = cs.overflowX === 'auto' || cs.overflowX === 'scroll';           // only an element that really scrolls sideways fades left or right
    const top = yOk && el.scrollTop > FADE_EPS;
    const bottom = yOk && el.scrollHeight - el.clientHeight - el.scrollTop > FADE_EPS;
    const left = xOk && el.scrollLeft > FADE_EPS;
    const right = xOk && el.scrollWidth - el.clientWidth - el.scrollLeft > FADE_EPS;
    const set = (name, on) => { if (on) el.setAttribute(name, ''); else el.removeAttribute(name); };
    set('data-fade-top', top); set('data-fade-bottom', bottom); set('data-fade-left', left); set('data-fade-right', right);
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
      el.removeAttribute('data-fade-top'); el.removeAttribute('data-fade-bottom'); el.removeAttribute('data-fade-left'); el.removeAttribute('data-fade-right');
    },
  };
}

/** scrollFade() on every .vk-scroll and .vk-scroll--x under root. */
export function scrollFades(root = document) {
  return [...root.querySelectorAll('.vk-scroll, .vk-scroll--x')].map(scrollFade);
}
