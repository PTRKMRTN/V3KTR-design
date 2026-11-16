// Catalogue group: panel sections and their headings. See rails-viewport.mjs for the entry shape.
export default {
  name: 'Panels',
  blurb: 'Section headings and the tools that sit on them.',
  entries: [
    {
      name: 'Section Reset',
      since: '0.41.148',
      rule: 'AGENTS.md "Labels and button sizes" (A Reset in a section heading)',
      classes: ['vk-sec-reset'],
      note: 'A small text Reset at the right end of a section heading, the heading kept clear of it. Only where every setting in the section can be put back; never beside a Reset | Randomise row.',
      html: `<div class="vk-section" style="width:356px;padding:0"><div class="vk-sec-bar"><h3 class="vk-sec-head">Transform</h3><button type="button" class="vk-btn vk-btn--sm vk-sec-reset" data-tip="Reset Transform">Reset</button></div>
  <div class="vk-scrub" style="--fill:50%"><span class="vk-scrub__label">Rotate</span><span class="vk-scrub__val">0°</span></div></div>`,
    },
  ],
};
