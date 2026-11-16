// Catalogue group: dialogs and overlays. See rails-viewport.mjs for the entry shape.
export default {
  name: 'Dialogs',
  blurb: 'What sits inside a modal dialog.',
  entries: [
    {
      name: 'Tall dialog: the middle scrolls',
      since: '0.41.152',
      rule: 'AGENTS.md "Tall dialogs scroll in the middle"',
      classes: ['vk-modal__body'],
      note: 'A dialog is never taller than the window less 22px top and bottom. Everything between the title and the actions sits in .vk-modal__body, which scrolls; the title and the action row stay put. (Demo capped at 300px.)',
      html: `<div class="vk-modal" style="width:340px;max-height:300px"><div class="vk-modal__title">Import SVG</div><div class="vk-modal__body vk-scrollbar" style="padding:8px 18px 16px">
  <div class="vk-dlg-preview is-empty">Preview</div><div class="vk-row vk-row--ctl" style="margin-top:3px"><span class="vk-row__label">Depth</span><span class="vk-scrub__val" style="margin-left:auto">12 mm</span></div>
  <div class="vk-row vk-row--ctl" style="margin-top:3px"><span class="vk-row__label">Bevel</span><span class="vk-scrub__val" style="margin-left:auto">1 mm</span></div>
  <div class="vk-row vk-row--ctl" style="margin-top:3px"><span class="vk-row__label">Material</span><span class="vk-scrub__val" style="margin-left:auto">Brushed</span></div></div>
  <div class="vk-modal__actions" style="padding-top:12px"><button class="vk-btn">Cancel</button><button class="vk-btn vk-btn--primary">Import</button></div></div>`,
    },
    {
      name: 'Dialog preview: a live view you can turn',
      since: '0.41.142',
      rule: 'AGENTS.md "Dialog preview"',
      classes: ['vk-dlg-preview'],
      note: 'The picture box at the top of an import dialog: 190px tall on the canvas well, holding a live view that redraws as the options change; grab to turn it. Empty state: a line of text.',
      html: `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <div class="vk-modal" style="width:360px"><div class="vk-modal__title">Import SVG</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview vk-canvas-nav"><svg viewBox="0 0 360 190"><ellipse cx="140" cy="100" rx="52" ry="48" fill="#e2572e"/><path d="M196 62l58-10v70l-58 10z" fill="#19b5b1"/><path d="M264 132l30-80 22 80z" fill="#f6c51f"/></svg></div><span class="vk-dlg-preview__hint">Drag to turn</span><div class="vk-scrub" style="--fill:35%"><span class="vk-scrub__label">Extrude</span><span class="vk-scrub__val">0.35</span></div></div></div>
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">Import SVG</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview is-empty">No shapes to extrude</div></div></div>
</div>`,
    },
  ],
};
