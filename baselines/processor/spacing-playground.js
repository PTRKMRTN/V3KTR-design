/* V3KTR PROCESSOR · spacing playground (baseline v0.570.0)
   Paste into the DevTools console on PROCESSOR (live or local). Adds a slider panel, bottom left.
   Every slider drives one of PROCESSOR's real spacing rules; the starting values ARE the live values.
   Nothing is saved to the app: reload to clear. Your slider positions are remembered in this browser
   (localStorage) so a reload keeps them; "Reset" puts everything back.
   "Copy" puts a list of what you changed on the clipboard (and in the console) to paste back to Claude. */
(() => {
  const ID = 'v3ktr-spacing-playground';
  document.getElementById(ID)?.remove();
  document.getElementById(ID + '-css')?.remove();

  // [key, label, live value, min, max, CSS it drives (use {v} for the value in px)]
  const KNOBS = [
    ['pad', 'Panel padding (--pad)', 12, 6, 28, ':root{--pad:{v}px}'],
    ['sidew', 'Side panel width', 332, 300, 440, ':root{--side-w:{v}px}'],
    ['railw', 'Rail width', 128, 110, 190, ':root{--rail-w:{v}px}'],
    ['btny', 'Button padding · vertical', 5, 2, 12, '.inline-btn,.seg button,.ui-btn,.looks-act-btn{padding-top:{v}px;padding-bottom:{v}px}'],
    ['btnx', 'Button padding · horizontal', 10, 5, 20, '.inline-btn,.seg button,.ui-btn,.looks-act-btn{padding-left:{v}px;padding-right:{v}px}'],
    ['seggap', 'Gap between option buttons', 4, 1, 14, '.seg{gap:{v}px}'],
    ['segm', 'Space above/below option groups', 10, 2, 24, '.seg{margin-top:{v}px;margin-bottom:{v}px}'],
    ['rowh', 'Row height (sliders, toggles, blend)', 28, 22, 44, '.scrub,.tog-row,.blend-row{height:{v}px}'],
    ['rowgap', 'Space between rows', 5, 1, 14, '.scrub{margin:{v}px 0}.tog-row,.blend-row{margin:{v}px 0}'],
    ['secb', 'Space after a section', 10, 2, 32, '.param-section{padding-bottom:{v}px}'],
    ['labt', 'Space above section heads', 11, 2, 28, '.sec-label{margin-top:{v}px}'],
    ['labb', 'Space below section heads', 7, 2, 20, '.sec-label{margin-bottom:{v}px}'],
    ['layy', 'Layer padding · vertical', 7, 3, 16, '.layer{padding-top:{v}px;padding-bottom:{v}px}'],
    ['laygap', 'Gap between layers', 2, 0, 12, '.layer{margin:{v}px 0}'],
    ['menux', 'Menu item padding (top bar)', 9, 4, 18, '.menu{padding-left:{v}px;padding-right:{v}px}'],
  ];
  const OUTLINE = '.inline-btn.tog,.filter-chip{border:2px solid #757575}'; // the settled app standard: 2px, roomier

  let state = {};
  try { state = JSON.parse(localStorage.getItem(ID) || '{}'); } catch (e) {}
  const val = (k) => (state[k] ?? KNOBS.find((n) => n[0] === k)[2]);

  const css = document.createElement('style');
  css.id = ID + '-css';
  document.head.appendChild(css);
  const apply = () => {
    css.textContent = KNOBS.filter(([k, , live]) => val(k) !== live).map(([k, , , , , rule]) => rule.replaceAll('{v}', val(k))).join('\n') + (state.outline ? '\n' + OUTLINE : '');
    try { localStorage.setItem(ID, JSON.stringify(state)); } catch (e) {}
    window.dispatchEvent(new Event('resize'));   // let the canvas re-fit if the panels changed width
  };

  const S = (el, s) => (Object.assign(el.style, s), el);
  const box = S(document.createElement('div'), { all: 'initial', position: 'fixed', left: '12px', bottom: '34px', zIndex: 2147483647, width: '330px', maxHeight: '70vh', overflow: 'auto', background: '#161616', color: '#cfcfcf', font: '11px/1.4 "JetBrains Mono", monospace', boxShadow: '0 8px 30px rgba(0,0,0,.6)', border: '1px solid #3a3a3a' });
  box.id = ID;
  const head = S(document.createElement('div'), { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px', background: '#212121', position: 'sticky', top: '0', cursor: 'pointer' });
  head.innerHTML = '<b style="color:#f4f4f4;letter-spacing:.12em;flex:1">SPACING · v0.570 base</b>';
  const btn = (t) => S(Object.assign(document.createElement('button'), { textContent: t }), { all: 'initial', font: 'inherit', color: '#1c1c1c', background: '#00e5a0', padding: '3px 7px', cursor: 'pointer', textTransform: 'uppercase' });
  const copy = btn('Copy'), reset = btn('Reset'), fold = btn('–');
  S(reset, { background: '#3a3a3a', color: '#f4f4f4' }); S(fold, { background: '#3a3a3a', color: '#f4f4f4' });
  head.append(copy, reset, fold);
  const body = S(document.createElement('div'), { padding: '6px 10px 10px' });
  box.append(head, body);

  const rows = {};
  for (const [k, label, live, min, max] of KNOBS) {
    const row = S(document.createElement('label'), { display: 'block', margin: '8px 0 0' });
    const top = S(document.createElement('div'), { display: 'flex', justifyContent: 'space-between' });
    const name = document.createElement('span'); name.textContent = label;
    const out = document.createElement('span');
    const r = Object.assign(document.createElement('input'), { type: 'range', min, max, step: 1, value: val(k) });
    S(r, { width: '100%', accentColor: '#00e5a0', margin: '2px 0 0' });
    const show = () => { const v = +r.value; out.textContent = v === live ? `${v}px` : `${live} → ${v}px`; out.style.color = v === live ? '#8a8a8a' : '#00e5a0'; };
    r.addEventListener('input', () => { state[k] = +r.value; if (+r.value === live) delete state[k]; show(); apply(); });
    top.append(name, out); row.append(top, r); body.append(row); rows[k] = { r, show, live }; show();
  }
  const ol = S(document.createElement('label'), { display: 'flex', gap: '6px', alignItems: 'center', margin: '12px 0 0', color: '#f4f4f4' });
  const cb = Object.assign(document.createElement('input'), { type: 'checkbox', checked: !!state.outline });
  cb.addEventListener('change', () => { state.outline = cb.checked || undefined; apply(); });
  ol.append(cb, document.createTextNode('2px outlines on toggles + chips (new standard)'));
  body.append(ol);

  reset.onclick = (e) => { e.stopPropagation(); state = {}; for (const k in rows) { rows[k].r.value = rows[k].live; rows[k].show(); } cb.checked = false; apply(); };
  copy.onclick = (e) => {
    e.stopPropagation();
    const lines = KNOBS.filter(([k, , live]) => val(k) !== live).map(([k, label, live]) => `- ${label}: ${live}px → ${val(k)}px`);
    if (state.outline) lines.push('- 2px outlines on toggles + chips: on');
    const text = `PROCESSOR spacing playground (baseline v0.570.0, window ${innerWidth}×${innerHeight})\n` + (lines.join('\n') || '- no changes');
    console.log(text);
    navigator.clipboard?.writeText(text).then(() => (copy.textContent = 'Copied'), () => (copy.textContent = 'See console'));
    setTimeout(() => (copy.textContent = 'Copy'), 1500);
  };
  head.onclick = () => { const hide = body.style.display !== 'none'; body.style.display = hide ? 'none' : ''; fold.textContent = hide ? '+' : '–'; };

  document.body.appendChild(box);
  apply();
  console.log('Spacing playground loaded. Remove it: document.getElementById("' + ID + '").remove(); document.getElementById("' + ID + '-css").remove()');
})();
