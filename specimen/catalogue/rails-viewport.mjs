// Catalogue group: rails and viewport tools. One entry per shipped component (or family); `classes` lists every base class the entry shows, which is what
// the coverage gate in scripts/check-drift.mjs reads. `{{ic:name:size}}` becomes an inline menu icon. Demos render with the real CSS, in the page's theme.
export default {
  name: 'Rails and viewport tools',
  blurb: 'The add-rail, the tool column over a canvas, and what is drawn on a viewport.',
  entries: [
    {
      name: 'Rail view switch + filter chips',
      since: '0.41.124',
      rule: 'AGENTS.md "Rail view switch + filter chips"; interactions/rail-view.js',
      classes: ['vk-rail-head', 'vk-rail-chips', 'vk-rail-item', 'vk-icon-tog', 'vk-tag', 'vk-group-title', 'vk-group-label'],
      note: 'A head row: the group chips, then one toggle that flips icons-only and icon + label. Icons view = the app\'s tile grid (144px); labels view = rows (192px). Later rows dim; the depth star follows the name.',
      html: `<div style="display:flex;gap:28px;align-items:flex-start;flex-wrap:wrap">
  <div style="width:192px;background:var(--bg-1);padding:14px 11px">
    <div class="vk-rail-head"><div class="vk-rail-chips"><button class="vk-chip vk-chip--group is-on">ALL</button><button class="vk-chip vk-chip--group" style="--gcol:var(--type-rose)">REP</button><button class="vk-chip vk-chip--group" style="--gcol:var(--type-amber)">DEF</button><button class="vk-chip vk-chip--group" style="--gcol:var(--type-teal)">STY</button></div><button class="vk-icon-tog" aria-label="Show icons">{{ic:railicons:15}}</button></div>
    <div class="vk-group-label" style="--gcol:var(--type-rose);padding:6px 0 4px">REPLICATE</div>
    <button class="vk-rail-item" style="--gcol:var(--type-rose)">{{ic:dup:14}}<span class="vk-rail-item__nm">Repeat<i class="vk-rail-item__star">★</i></span></button>
    <button class="vk-rail-item" style="--gcol:var(--type-rose)">{{ic:flip:14}}<span class="vk-rail-item__nm">Mirror</span></button>
    <button class="vk-rail-item is-later" style="--gcol:var(--type-rose)">{{ic:link:14}}<span class="vk-rail-item__nm">Connect</span><span class="vk-tag">V1.1</span></button>
    <button class="vk-rail-item is-disabled" style="--gcol:var(--type-rose)">{{ic:grid3d:14}}<span class="vk-rail-item__nm">At maximum</span></button>
  </div>
  <p class="th-note" style="max-width:36ch">Rest, star, later (V1.1) and disabled rows. The toggle's icon is the view it switches to.</p></div>`,
    },
    {
      name: 'Rail scroll hint',
      since: '0.41.130',
      rule: 'AGENTS.md "Rail scroll hint"; interactions/rail-scrollhint.js',
      classes: ['vk-rail-scrollhint'],
      note: 'In the rail header after the chips, outside the scroller: hidden unless the rail overflows; dimmed once at the bottom. The noun is the app\'s ("Scroll FX", "Scroll").',
      html: `<div style="display:flex;gap:28px"><div style="width:144px"><div class="vk-rail-scrollhint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><span>Scroll FX</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div></div>
  <div style="width:144px"><div class="vk-rail-scrollhint is-end"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg><span>Scroll FX</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div></div></div>`,
    },
    {
      name: 'Tool column: tiles, narrow scrub, fly-out',
      since: '0.41.119',
      rule: 'AGENTS.md "Tool-column extras"; interactions/vscrub.js, vfly.js',
      classes: ['vk-vtools', 'vk-vscrub', 'vk-brush-ring'],
      note: 'The column down the right of a viewport while a tool is on: 30px tiles, a done tile, a one-number vertical scrub, a value tile that folds a picker out to the left.',
      html: `<div style="position:relative;width:360px;height:250px;background:var(--bg-1)"><div class="vk-vtools" style="position:absolute;right:12px;top:10px">
    <button class="vk-vtools__t vk-vtools__t--done" aria-label="Done"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></button>
    <button class="vk-vtools__t" aria-pressed="true" aria-label="Brush">{{ic:path:16}}</button>
    <div class="vk-vscrub" role="slider" aria-label="Radius" aria-valuenow="0.94"><i style="height:62%"></i>{{ic:radius:14}}<span>0.94</span></div>
    <div class="vk-vscrub" role="slider" aria-label="Strength" aria-valuenow="50"><i style="height:50%"></i>{{ic:strength:14}}<span>50</span></div>
    <div class="vk-vtools__fly"><button class="vk-vtools__t vk-vtools__t--val" aria-expanded="true">AUTO</button><div class="vk-vtools__opts" role="menu"><button class="vk-vtools__o" aria-checked="true">Auto · full</button><button class="vk-vtools__o">Full</button><button class="vk-vtools__o">50%</button></div></div>
  </div><svg width="80" height="80" style="position:absolute;left:30px;top:80px"><circle class="vk-brush-ring" cx="40" cy="40" r="30"/></svg></div>`,
    },
    {
      name: 'React toggle in a slider row',
      since: '0.41.125',
      rule: 'CHANGELOG 0.41.125',
      classes: ['vk-react-wrap', 'vk-react-ctl', 'vk-react'],
      note: 'The toggle sits inside the slider at its right edge (the value makes room); the react panel opens under the row.',
      html: `<div style="width:300px"><div class="vk-scrub vk-react-wrap" style="--fill:40%"><span class="vk-scrub__label">Amount</span><span class="vk-scrub__val">0.40</span><button class="vk-row__ctl vk-react-ctl" aria-pressed="true" aria-label="React to the music">{{ic:react:16}}</button></div>
  <div class="vk-react"><span class="vk-micro-label">React to the music</span><div class="vk-row"><span>Band</span><span class="vk-scrub__val" style="margin-left:auto">Bass</span></div></div></div>`,
    },
    {
      name: 'Canvas well',
      since: '0.41.127',
      rule: 'CHANGELOG 0.41.127',
      classes: ['vk-canvas-well'],
      note: 'The ground behind an image in a viewport: --canvas-well with the V3KTR tile at 38px, centred.',
      html: `<div class="vk-canvas-well" style="width:240px;height:110px"></div>`,
    },
    {
      name: 'Viewport readouts: pill, pick dots, measure line',
      since: '0.41.123',
      rule: 'AGENTS.md "Pick on the clip"',
      classes: ['vk-vp-pill', 'vk-vp-dot', 'vk-vp-measure'],
      note: 'Marks drawn over a viewport: the readout pill, tracked-point dots (rest, hover, picked) and the dashed two-point measure line.',
      html: `<svg width="360" height="130" style="background:#2b2926"><line class="vk-vp-measure" x1="60" y1="95" x2="290" y2="45"/>
  <circle class="vk-vp-dot" cx="30" cy="40"/><circle class="vk-vp-dot" cx="130" cy="70"/><circle class="vk-vp-dot is-hover" cx="200" cy="25"/><circle class="vk-vp-dot is-picked" cx="60" cy="95"/><circle class="vk-vp-dot is-picked" cx="290" cy="45"/></svg>
  <div style="margin-top:8px"><span class="vk-vp-pill">DISTANCE 1.84</span></div>`,
    },
  ],
};
