// Catalogue group: the asset browser shell and its licence parts (v0.41.195). See rails-viewport.mjs for the entry shape.
const FONT_ROWS = [
  ['Playfair Display', 'Shared · 6 styles', 'Hamburgefonstiv', 'Georgia,serif', 'Serif', 'OFL 1.1', false, true],
  ['Space Mono', 'Shared · 4 styles', 'Hamburgefonstiv', 'monospace', 'Mono', 'OFL 1.1', false, false],
  ['Kiwi Soda', 'Shared · 1 style', 'Hamburgefonstiv', '"Comic Sans MS",cursive', 'Display', 'CC BY 4.0', false, false],
  ['Darktech LDR', 'Shared · 1 style', 'Hamburgefonstiv', 'Impact,sans-serif', 'Display', 'CC BY-SA 3.0', true, false],
];
const fontRow = ([n, meta, pv, ff, cat, lic, nc, cur], i) => `<div class="vk-ab__row vk-ab__row--specimen${i === 1 ? ' is-selected' : ''}${cur ? ' is-current' : ''}" role="option" aria-selected="${i === 1}"><span class="vk-ab__lead${i === 0 ? ' is-on' : ''}" aria-hidden="true">★</span><span class="vk-ab__name"><b>${n}</b><small>${meta}</small></span><span class="vk-ab__prev" style="font-family:${ff}">${pv}</span><span class="vk-ab__cell">${cat}</span><span><span class="vk-tag vk-tag--lic${nc ? ' vk-tag--nc' : ''}">${lic}</span></span><button type="button" class="vk-btn vk-btn--compact vk-ab__act">Use</button></div>`;
const chip = (t, on) => `<button type="button" class="vk-chip${on ? ' is-active' : ''}">${t}</button>`;
export default {
  name: 'Asset browser',
  blurb: 'The shape a browsable-asset panel (fonts, sounds, icons, media) expands into, and the licence parts that go with it. Each app keeps its own logic inside it.',
  entries: [
    {
      name: 'Asset browser shell: the Fonts list',
      since: '0.41.195',
      rule: 'AGENTS.md "Asset browser shell"',
      classes: ['vk-ab', 'vk-ab__filters', 'vk-ab__main', 'vk-ab__tabs', 'vk-ab__search', 'vk-ab__q', 'vk-ab__pv', 'vk-ab__sum', 'vk-ab__chips', 'vk-ab__cols', 'vk-ab__group', 'vk-ab__rows', 'vk-ab__row', 'vk-ab__row--specimen', 'vk-ab__lead', 'vk-ab__name', 'vk-ab__prev', 'vk-ab__cell', 'vk-ab__act', 'vk-ab__sr', 'vk-ab__msg', 'vk-ab__foot', 'vk-ab__styles', 'vk-ab__acts'],
      note: 'Two frames and a separator: the filters column at the left (sections of chips), the results at the right. The head holds the kind tabs with Collapse, then the search field, the preview text and the summary; under it the column header, then the rows, then the foot with the selected font, its styles and Use. A row whose preview is the font drawn in its own letters is the 44px specimen row. The columns come from one value, --ab-cols, so the header and every row line up.',
      html: `<div style="height:470px;display:flex;background:var(--bg-1)"><div class="vk-ab" style="--ab-cols:26px minmax(150px,1fr) minmax(180px,1.8fr) 84px 96px 54px">
  <div class="vk-ab__filters vk-frame"><div class="vk-scroll"><div class="vk-section"><div class="vk-sec-bar"><h3 class="vk-sec-head">Category</h3></div><div class="vk-ab__chips">${chip('All', true)}${chip('Serif')}${chip('Sans')}${chip('Mono')}${chip('Display')}${chip('Script')}</div></div>
    <div class="vk-section"><div class="vk-sec-bar"><h3 class="vk-sec-head">Has</h3></div><div class="vk-ab__chips">${chip('Italic')}${chip('Variable')}${chip('Latin Ext')}</div></div></div><div class="vk-fsep vk-fsep--r"></div></div>
  <div class="vk-ab__main vk-frame"><div class="vk-frame-head"><div class="vk-ab__tabs"><div class="vk-tabs" role="tablist"><div class="vk-tab is-active" role="tab" tabindex="0" aria-selected="true">Fonts</div><div class="vk-tab" role="tab" tabindex="-1" aria-selected="false">Sounds</div><div class="vk-tab" role="tab" tabindex="-1" aria-selected="false">Icons</div></div><button type="button" class="vk-btn">Collapse</button></div>
    <div class="vk-ab__search"><input class="vk-input vk-ab__q" placeholder="Search fonts" aria-label="Search fonts"><input class="vk-input vk-ab__pv" value="Hamburgefonstiv" aria-label="Preview text"><span class="vk-ab__sum">4 shown of 155</span></div>
    <div class="vk-ab__cols"><span></span><span>Family</span><span>Preview</span><span>Category</span><span>Licence</span><span></span></div></div>
    <div class="vk-scroll vk-ab__rows" role="listbox" aria-label="Fonts" tabindex="0"><div class="vk-ab__group">My fonts</div><div class="vk-ab__row vk-ab__row--specimen" role="option" aria-selected="false"><span class="vk-ab__lead" aria-hidden="true">★</span><span class="vk-ab__name"><b>Northwind Sans</b><small>Uploaded in this file</small></span><span class="vk-ab__prev" style="font-family:Manrope,sans-serif">Hamburgefonstiv</span><span class="vk-ab__cell">Sans</span><span><span class="vk-tag vk-tag--lic">Yours</span></span><button type="button" class="vk-btn vk-btn--compact vk-ab__act">Use</button></div><div class="vk-ab__group">Shared set</div>${FONT_ROWS.map(fontRow).join('')}</div>
    <div class="vk-ab__foot"><div class="vk-store-detail"><span class="vk-store-detail__name">Space Mono</span><span>Colophon Foundry</span><span class="vk-store-detail__credit">Space Mono, OFL 1.1</span><a class="vk-store-detail__end" href="#">Licence</a></div><div class="vk-ab__styles">${chip('Regular', true)}${chip('Italic')}${chip('Bold')}${chip('Bold Italic')}</div><div class="vk-ab__acts"><button type="button" class="vk-btn vk-btn--primary">Use Space Mono</button></div></div></div></div></div>`,
    },
    {
      name: 'Asset browser: a 34px results row (Sounds)',
      since: '0.41.195',
      rule: 'AGENTS.md "Asset browser shell"',
      classes: ['vk-ab__row', 'vk-ab__cols'],
      note: 'A row that is text and facets, with no picture, stays at 34px: a play control, the title with its meta under it, the source, the length, the licence tag and Add. The same grid on --ab-cols as the header. Hover and the selected row tint over the row; the keyboard cursor draws its ring inside.',
      html: `<div class="vk-ab" style="height:auto;--ab-cols:26px minmax(160px,2fr) 100px 52px 96px 62px;padding:0 14px 14px;display:block"><div class="vk-ab__cols"><span></span><span>Title</span><span>Source</span><span>Length</span><span>Licence</span><span></span></div><div class="vk-ab__rows" role="listbox" aria-label="Sounds">
  <div class="vk-ab__row" role="option" aria-selected="false"><button type="button" class="vk-ab__lead" aria-label="Play" style="background:none;border:0;color:inherit;padding:0">▶</button><span class="vk-ab__name"><b>Rain on a tin roof</b><small>ambience · rain</small></span><span class="vk-ab__cell">Openverse</span><span class="vk-ab__cell">0:58</span><span><span class="vk-tag vk-tag--lic">CC BY 4.0</span></span><button type="button" class="vk-btn vk-btn--compact vk-ab__act">Add</button></div>
  <div class="vk-ab__row is-selected" role="option" aria-selected="true"><button type="button" class="vk-ab__lead" aria-label="Play" style="background:none;border:0;color:inherit;padding:0">▶</button><span class="vk-ab__name"><b>Low drone, D</b><small>drone · dark</small></span><span class="vk-ab__cell">Openverse</span><span class="vk-ab__cell">2:31</span><span><span class="vk-tag vk-tag--lic">CC0</span></span><button type="button" class="vk-btn vk-btn--compact vk-ab__act">Add</button></div>
  <div class="vk-ab__row" role="option" aria-selected="false"><button type="button" class="vk-ab__lead" aria-label="Play" style="background:none;border:0;color:inherit;padding:0">▶</button><span class="vk-ab__name"><b>Street band loop</b><small>music · live</small></span><span class="vk-ab__cell">Openverse</span><span class="vk-ab__cell">1:12</span><span><span class="vk-tag vk-tag--lic vk-tag--nc">CC BY-NC 4.0</span></span><button type="button" class="vk-btn vk-btn--compact vk-ab__act">Add</button></div></div></div>`,
    },
    {
      name: 'Licence tags: open and limiting',
      since: '0.41.195',
      rule: 'AGENTS.md "Licence tags and credit line"',
      classes: ['vk-tag--lic', 'vk-tag--nc'],
      note: 'A tag that names a licence. Neutral for an open one (CC0, CC BY, OFL, MIT); caution for one that limits use (non-commercial, and a Share-Alike that binds an adapted work). The word is always printed: never colour alone.',
      html: `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="vk-tag vk-tag--lic">CC0</span><span class="vk-tag vk-tag--lic">CC BY 4.0</span><span class="vk-tag vk-tag--lic">OFL 1.1</span><span class="vk-tag vk-tag--lic">MIT</span><span class="vk-tag vk-tag--lic vk-tag--nc">CC BY-NC 4.0</span><span class="vk-tag vk-tag--lic vk-tag--nc">CC BY-SA 3.0</span></div>`,
    },
    {
      name: 'Credit line in the detail strip',
      since: '0.41.195',
      rule: 'AGENTS.md "Licence tags and credit line"',
      classes: ['vk-store-detail__credit'],
      note: 'The selected item\'s credit text sits in the detail strip between its name and the end links: quiet (--tx-2-hi), one line cut with an ellipsis, and selectable, because it is meant to be copied.',
      html: `<div class="vk-store-detail" style="width:720px"><span class="vk-store-detail__name">Kiwi Soda</span><span>Kiwi Soda</span><span class="vk-store-detail__credit">"Kiwi Soda" by Pixel Sagas, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Source: https://example.org/kiwi-soda</span><a class="vk-store-detail__end" href="#">Source</a></div>`,
    },
    {
      name: 'Help > Licences: what an app bundles',
      since: '0.41.195',
      rule: 'AGENTS.md "Licence tags and credit line"',
      classes: ['vk-licences', 'vk-lic', 'vk-lic__head', 'vk-lic__name', 'vk-lic__text'],
      note: 'The one dialog layout every app uses to list what it ships: a set per row with its name and a meta line, the licence tag, and Licence text, which opens the full text under the row (mono, selectable, scrolls). Sets rest on --bg-3 like a dialog pick list.',
      html: `<div class="vk-modal" style="width:560px"><div class="vk-modal__title">Licences</div><div class="vk-modal__body vk-scrollbar" style="max-height:330px"><div class="vk-licences">
  <div class="vk-lic"><div class="vk-lic__head"><span class="vk-lic__name">Shared fonts<small>155 families, served from fonts.v3ktr.com</small></span><span class="vk-tag vk-tag--lic">OFL 1.1</span><button type="button" class="vk-btn vk-btn--compact" aria-expanded="true">Licence text</button></div><pre class="vk-lic__text vk-copyable">Copyright (c) the family authors. This Font Software is licensed under the SIL Open Font License, Version 1.1. This licence is copied below, and is also available with a FAQ at https://openfontlicense.org</pre></div>
  <div class="vk-lic"><div class="vk-lic__head"><span class="vk-lic__name">Darktech LDR<small>1 family, shown with Share-alike on</small></span><span class="vk-tag vk-tag--lic vk-tag--nc">CC BY-SA 3.0</span><button type="button" class="vk-btn vk-btn--compact" aria-expanded="false">Licence text</button></div></div>
  <div class="vk-lic"><div class="vk-lic__head"><span class="vk-lic__name">Depth Anything<small>the depth model</small></span><span class="vk-tag vk-tag--lic">Apache 2.0</span><button type="button" class="vk-btn vk-btn--compact" aria-expanded="false">Licence text</button></div></div></div></div>
  <div class="vk-modal__actions"><button type="button" class="vk-btn vk-btn--primary">Close</button></div></div>`,
    },
  ],
};
