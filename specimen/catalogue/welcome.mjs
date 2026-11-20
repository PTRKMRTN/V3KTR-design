// Catalogue group: the Welcome tour. See rails-viewport.mjs for the entry shape.
const shot = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><rect width="1920" height="1080" fill="#26262a"/><rect x="22" y="97" width="1076" height="517" fill="#3a3a40"/><rect x="1180" y="45" width="440" height="576" fill="#2f2f35"/><rect x="1620" y="45" width="300" height="576" fill="#2b2b30"/><rect x="4" y="624" width="1912" height="412" fill="#222226"/></svg>');
const demo = `<div class="vk-modal vk-welcome" style="width:760px;max-width:100%"><div class="vk-modal__body"><div class="vk-welcome__deck">
<div class="vk-welcome__head"><div class="vk-welcome__top"><div class="vk-welcome__logo" aria-label="Welcome to KOMPOSITOR"><svg viewBox="0 0 150 22"><text x="0" y="17" font-family="JetBrains Mono,monospace" font-weight="700" font-size="16" fill="currentColor">KOMPOSITOR</text></svg></div><button class="vk-btn vk-btn--primary">Get started</button></div><p class="vk-welcome__line">A quick look at the parts of KOMPOSITOR.</p></div>
<div class="vk-tour" style="margin:14px 22px 0"><div class="vk-tour__stage" role="img" aria-label="A screenshot with the media pool outlined" style="width:100%"><img src="data:image/svg+xml,${shot}" alt=""><div class="vk-tour__box" style="left:61.4%;top:4.2%;width:22.9%;height:53.3%"></div></div>
<div class="vk-tour__bar" style="width:100%"><div class="vk-tour__cap"><div class="vk-tour__head"><span class="vk-tour__n">4 / 6</span><b class="vk-tour__name">Media pool</b></div><p class="vk-tour__txt">Drop video, images and audio here.</p></div>
<div class="vk-tour__nav"><button class="vk-btn vk-tour__btn">Back</button><button class="vk-btn vk-tour__btn">Next</button></div></div></div></div></div>
<div class="vk-welcome__more"><div class="vk-welcome__links"><a class="vk-menu-item vk-welcome__link" href="#"><span>Guide</span><span class="vk-welcome__link-d">how KOMPOSITOR works</span></a><a class="vk-menu-item vk-welcome__link" href="#"><span>Shortcuts</span><span class="vk-welcome__link-d">the keys, on one page</span></a></div><p class="vk-hint">Open this again from Help › Welcome.</p></div></div>`;
export default {
  name: 'Welcome tour',
  blurb: 'The first-open modal: the app as a screenshot, one outlined part at a time.',
  entries: [
    {
      name: 'Welcome tour: screenshot, one part at a time, links below',
      since: '0.41.175',
      rule: 'AGENTS.md "Welcome and tour"',
      classes: ['vk-welcome', 'vk-tour'],
      note: 'A modal split in two: the deck (logo and Get started at the top, the screenshot with one box on it, then a caption row with Back and Next) over a slightly darker box with the links and the hint. The box and the part name take --tour-hi (lemon, one value in every app); Back and Next take it too and ring in white when focused; Get started is the one primary in the app colour. Each app supplies its own screenshot and its own part list; interactions/tour.js mountTour() places the box from rects in the screenshot\'s pixels. Shown static here.',
      html: demo,
    },
  ],
};
