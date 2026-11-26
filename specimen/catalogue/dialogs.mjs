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
      name: 'A pick list in a dialog, with a note on each row',
      since: '0.41.180',
      rule: 'AGENTS.md "Dialog pick list, row note, three actions"',
      classes: ['vk-modal__list', 'vk-row__note'],
      note: 'Rows inside a dialog sit one step up from its ground (--bg-3); hover and the selected row tint over that. A short note at the right end of a row is .vk-row__note (11px, --tx-2-hi, --tx-1 on a hovered row, white on the selected row). The list brings its own 18px side padding.',
      html: `<div class="vk-modal" style="width:360px"><div class="vk-modal__title">Use in an FX</div><div class="vk-modal__msg">Pick the image slot to fill with it. Your open image stays as it is.</div>
  <div class="vk-modal__list" role="listbox" aria-label="Image slots"><div class="vk-row is-selected" role="option" aria-selected="true" tabindex="0"><span class="vk-row__label">Image · Image</span><span class="vk-row__note">has an image</span></div><div class="vk-row" role="option" aria-selected="false" tabindex="-1"><span class="vk-row__label">Pattern · Stamp Image</span><span class="vk-row__note">no image</span></div><div class="vk-row" role="option" aria-selected="false" tabindex="-1"><span class="vk-row__label">Depth DOF · Aperture Image</span><span class="vk-row__note">no image</span></div></div>
  <div class="vk-modal__actions"><button class="vk-btn">Back</button></div></div>`,
    },
    {
      name: 'Three actions in a dialog',
      since: '0.41.180',
      rule: 'AGENTS.md "Dialog pick list, row note, three actions"',
      classes: ['vk-modal__actions'],
      note: 'Order left to right: the way out, the alternative, the main action last and --primary. All three are normal-size .vk-btn. In a wide dialog they sit on one line at the right; at the narrowest dialog (300px) they wrap, still right-aligned, 8px apart both ways.',
      html: `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <div class="vk-modal" style="width:440px"><div class="vk-modal__title">Image from DIMENSOR</div><div class="vk-modal__msg">DIMENSOR sent an image (400 × 300, with its exact depth). Replace the current image with it?</div><div class="vk-modal__actions"><button class="vk-btn">Keep mine</button><button class="vk-btn">Use in an FX…</button><button class="vk-btn vk-btn--primary">Replace</button></div></div>
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">Image from DIMENSOR</div><div class="vk-modal__msg">Replace the current image with it?</div><div class="vk-modal__actions"><button class="vk-btn">Keep mine</button><button class="vk-btn">Use in an FX…</button><button class="vk-btn vk-btn--primary">Replace</button></div></div>
</div>`,
    },
    {
      name: 'Dialog preview: a live view you can turn',
      since: '0.41.142',
      rule: 'AGENTS.md "Dialog preview"',
      classes: ['vk-dlg-preview'],
      note: 'The picture box at the top of an import dialog: 190px tall on the canvas well, holding a live view that redraws as the options change; grab to turn it. Empty state: a line of text.',
      html: `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <div class="vk-modal" style="width:360px"><div class="vk-modal__title">Import SVG</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview vk-canvas-nav"><svg viewBox="0 0 360 190"><ellipse cx="140" cy="100" rx="52" ry="48" fill="#e2572e"/><path d="M196 62l58-10v70l-58 10z" fill="#19b5b1"/><path d="M264 132l30-80 22 80z" fill="#f6c51f"/></svg></div><span class="vk-dlg-preview__hint">Drag to turn</span><div class="vk-scrub" style="--fill:35%"><span class="vk-scrub__fill"></span><span class="vk-scrub__label">Extrude</span><span class="vk-scrub__val">0.35</span></div></div></div>
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">Import SVG</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview is-empty">No shapes to extrude</div></div></div>
</div>`,
    },
    {
      name: 'Dialog preview on a flat picture: the transparency checker',
      since: '0.41.186',
      rule: 'AGENTS.md "Dialog preview"',
      classes: ['vk-dlg-preview--checker'],
      note: 'A flat picture (a logo, an SVG) on the dark well can vanish. With .vk-dlg-preview--checker the well is a transparency checker of two neutral mid greys (--checker-a, --checker-b, 8px squares): a near-black logo and a white logo both read, with no measurement. Contrast with the two squares (#777777 first, #8e8e8e second). Reads, 3.2:1 or more on both: #000000 to #2a2a2a and #fdfdfd up. Weak, under 3.2 on at least one: the greys between, for example #333333 2.82 / 3.86 and #eeeeee 3.86 / 2.82. Lost, under 1.5 on at least one: #5c5c5c to #afafaf (under 1.5 on both: #717171 to #959595), for example #838383 1.18 / 1.16. Not for a photograph or a render. Never on .is-empty. The slider in a dialog now has a visible empty track beside its fill.',
      html: `<div style="display:flex;gap:24px;align-items:flex-start;flex-wrap:wrap">
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">Near-black logo</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview vk-dlg-preview--checker"><svg viewBox="0 0 264 190"><circle cx="132" cy="95" r="52" fill="#111"/><path d="M110 96l22-30 22 30-22 30z" fill="#303030"/></svg></div><div class="vk-scrub" style="--fill:35%"><span class="vk-scrub__fill"></span><span class="vk-scrub__label">Depth</span><span class="vk-scrub__val">12 mm</span></div></div></div>
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">White logo</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview vk-dlg-preview--checker"><svg viewBox="0 0 264 190"><circle cx="132" cy="95" r="52" fill="#fff"/><path d="M110 96l22-30 22 30-22 30z" fill="#d9d9d9"/></svg></div><div class="vk-scrub" style="--fill:35%"><span class="vk-scrub__fill"></span><span class="vk-scrub__label">Depth</span><span class="vk-scrub__val">12 mm</span></div></div></div>
  <div class="vk-modal" style="width:300px"><div class="vk-modal__title">Mid-grey logo (the limit)</div><div style="padding:0 18px 16px"><div class="vk-dlg-preview vk-dlg-preview--checker"><svg viewBox="0 0 264 190"><circle cx="132" cy="95" r="52" fill="#838383"/></svg></div></div></div>
</div>`,
    },
  ],
};
