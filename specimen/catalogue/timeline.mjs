// Catalogue group: timeline and sound. See rails-viewport.mjs for the entry shape.
const wave = (d, col) => `<svg viewBox="0 0 160 20" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><path d="${d}" fill="${col}" opacity=".55"/></svg>`;
export default {
  name: 'Timeline and sound',
  blurb: 'The music lane and its event glyphs, and what is drawn on an audio clip.',
  entries: [
    {
      name: 'Music lane and event glyphs (set A)',
      since: '0.41.136',
      rule: 'docs/MUSIC-LANE-REACTIONS.md; app.css "MUSIC LANE"',
      classes: ['vk-lane', 'vk-lane-rows', 'vk-lane-row'],
      note: 'A 24px lane under an audio clip. Solid glyphs: accent (diamond), offbeat (dot), hit (bar), roll (three bars, v0.41.136), drop, build, break, in/out. Detected = the secondary colour; by hand = the accent; selected = white with an accent ring. A busy track splits into sub-rows.',
      html: `<div style="width:560px"><div class="vk-lane">
  <div class="vk-lane__span" data-kind="break" style="--x:.70;--w:.10"></div>
  <button class="vk-lane__mark" data-kind="accent" style="--x:.06" aria-label="Accent"></button>
  <button class="vk-lane__mark" data-kind="offbeat" style="--x:.14" aria-label="Offbeat"></button>
  <button class="vk-lane__mark" data-kind="hit" style="--x:.22" aria-label="Hit"></button>
  <button class="vk-lane__mark" data-kind="roll" style="--x:.30" aria-label="Roll"></button>
  <button class="vk-lane__mark" data-kind="drop" style="--x:.38" aria-label="Drop"></button>
  <button class="vk-lane__mark" data-kind="build" style="--x:.46" aria-label="Build"></button>
  <button class="vk-lane__mark" data-kind="break" style="--x:.54" aria-label="Break"></button>
  <button class="vk-lane__mark" data-kind="inout" style="--x:.62" aria-label="Intro"></button>
  <button class="vk-lane__mark is-hand" data-kind="roll" style="--x:.84" aria-label="Roll, by hand"></button>
  <button class="vk-lane__mark is-selected" data-kind="roll" style="--x:.92" aria-label="Roll, selected"></button>
</div>
<div class="vk-lane-rows" style="margin-top:12px">
  <div class="vk-lane-row"><span class="vk-lane-row__head vk-micro-label">Hits</span><div class="vk-lane"><button class="vk-lane__mark" data-kind="hit" style="--x:.2" aria-label="Hit"></button><button class="vk-lane__mark" data-kind="hit" style="--x:.5" aria-label="Hit"></button></div></div>
  <div class="vk-lane-row"><span class="vk-lane-row__head vk-micro-label">Rolls</span><div class="vk-lane"><button class="vk-lane__mark" data-kind="roll" style="--x:.35" aria-label="Roll"></button><button class="vk-lane__mark" data-kind="roll" style="--x:.8" aria-label="Roll"></button></div></div>
</div></div>`,
    },
    {
      name: 'Sound FX on a clip: anchor pin, fades, ducking line',
      since: '0.41.118',
      rule: 'AGENTS.md "Sound FX on the timeline"',
      classes: ['vk-pin', 'vk-clip-fade', 'vk-clip-fh', 'vk-duck'],
      note: 'The white pin is the sound\'s anchor (the moment it lines up on). Fade corners with a drag dot. The ducking line is the secondary colour because the machine draws it.',
      html: `<div style="display:flex;gap:16px;flex-wrap:wrap"><div style="position:relative;width:260px;height:40px;overflow:hidden;background:color-mix(in srgb,var(--type-teal) 30%,var(--bg-0))"><span class="vk-clip-fade vk-clip-fade--in" style="--fw:50px"></span><span class="vk-clip-fh" style="left:50px"></span><span class="vk-clip-fade vk-clip-fade--out" style="--fw:70px"></span><span class="vk-pin" style="--x:120px"></span></div>
  <div style="position:relative;width:260px;height:40px;overflow:hidden;background:color-mix(in srgb,var(--type-slate) 30%,var(--bg-0))"><svg class="vk-duck" viewBox="0 0 1000 32" preserveAspectRatio="none"><polyline points="0,0 400,0 450,20 600,20 650,0 1000,0"/></svg></div></div>`,
    },
    {
      name: 'Sound library row: type tag and the pin on a mini waveform',
      since: '0.41.117',
      rule: 'AGENTS.md "Sound FX on the timeline"',
      classes: ['vk-tag', 'vk-pin'],
      note: 'The same .vk-pin in a small box: the box is position:relative and the pin takes its height (here 20px); the line and triangle stay the same size, so the sign reads the same as on a clip. The type tag is a button: click to change the type.',
      html: `<div style="width:520px">
  <div class="vk-row" style="gap:10px"><span style="flex:1">Whoosh_Fast_03.wav</span><button class="vk-tag vk-tag--sx" data-sx="whoosh">Whoosh</button><span style="font:10px var(--mono);color:var(--tx-2);width:38px">0.9 s</span><span style="position:relative;width:160px;height:20px;background:var(--bg-1);flex:none">${wave('M0 12C30 4 70 2 100 9s40 8 60 5V20H0z', 'var(--sx-whoosh)')}<span class="vk-pin" style="--x:62%"></span></span></div>
  <div class="vk-row" style="gap:10px"><span style="flex:1">Impact_Metal_Stab_07.wav</span><button class="vk-tag vk-tag--sx" data-sx="hit">Hit</button><span style="font:10px var(--mono);color:var(--tx-2);width:38px">2.4 s</span><span style="position:relative;width:160px;height:20px;background:var(--bg-1);flex:none">${wave('M4 1L160 9v2L4 19z', 'var(--sx-hit)')}<span class="vk-pin vk-pin--auto" style="--x:3%"></span></span></div>
</div>`,
    },
  ],
};
