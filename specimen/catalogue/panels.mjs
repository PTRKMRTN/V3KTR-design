// Catalogue group: panel sections and their headings. See rails-viewport.mjs for the entry shape.
export default {
  name: 'Panels',
  blurb: 'Section headings and the tools that sit on them.',
  entries: [
    {
      name: 'Section actions: labelled buttons under the heading',
      since: '0.41.160',
      rule: 'AGENTS.md "Section actions"',
      classes: ['vk-sec-tools'],
      note: 'A section\'s add action, and its other actions, are a row of plain labelled buttons directly under the heading (Patrick 2026-11-18, option B). Verb and noun, primary add first, housekeeping last, normal size, hugging their text, wrapping at 6px. The icon + (.vk-sec-add) is deprecated for add actions.',
      html: `<div style="width:356px"><div class="vk-sec-bar"><h3 class="vk-sec-head">Layers</h3></div><div class="vk-sec-tools"><button type="button" class="vk-btn">Add item</button><button type="button" class="vk-btn">New layer</button><button type="button" class="vk-btn">Group</button><button type="button" class="vk-btn">Collapse all</button></div>
  <div class="vk-sec-bar" style="margin-top:var(--sec-gap)"><h3 class="vk-sec-head">Swatches</h3><button type="button" class="vk-btn vk-btn--sm vk-sec-reset" data-tip="Reset swatches">Reset</button></div><div class="vk-sec-tools"><button type="button" class="vk-btn">Add swatch</button></div></div>`,
    },
    {
      name: 'Section Reset',
      since: '0.41.148',
      rule: 'AGENTS.md "Labels and button sizes" (A Reset in a section heading)',
      classes: ['vk-sec-reset'],
      note: 'A small text Reset after the section heading name, 14px after it (Patrick 2026-11-18: after the name, not at the right end). Only where every setting in the section can be put back; never beside a Reset | Randomise row.',
      html: `<div class="vk-section" style="width:356px;padding:0"><div class="vk-sec-bar"><h3 class="vk-sec-head">Transform</h3><button type="button" class="vk-btn vk-btn--sm vk-sec-reset" data-tip="Reset Transform">Reset</button></div>
  <div class="vk-scrub" style="--fill:50%"><span class="vk-scrub__label">Rotate</span><span class="vk-scrub__val">0°</span></div></div>`,
    },
    {
      name: 'Locked row: only the lock stays whole',
      since: '0.41.157',
      rule: 'AGENTS.md "Locked row" (v0.41.157)',
      classes: ['vk-lockctl'],
      note: 'A locked row dims to 60% except the lock control. Mark the lock .vk-lockctl and ONLY it is spared: a pressed eye (hidden) or any other pressed control dims with the row. A row with no .vk-lockctl keeps the older rule (any pressed row control counts as the lock).',
      html: `<div style="width:300px"><div class="vk-layer is-locked" style="display:flex;align-items:center;gap:6px;height:26px;padding:0 6px"><button class="vk-row__ctl" aria-pressed="true" aria-label="Show" data-tip="Show"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3l18 18M6.500 7.500C3.800 9.300 2 12 2 12s4 6.500 10 6.500c1.500 0 2.900-.4 4.200-1"/></svg></button><span class="vk-layer__name" style="flex:1">Array</span><button class="vk-row__ctl vk-lockctl" aria-pressed="true" aria-label="Unlock" data-tip="Unlock"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6 11h12v9H6z"/><path d="M8.500 11V8a3.500 3.500 0 0 1 7 0v3"/></svg></button></div></div>`,
    },
  ],
};
