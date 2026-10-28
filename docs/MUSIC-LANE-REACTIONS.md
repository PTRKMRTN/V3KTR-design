# Music lane, Reactions list and the react control: proposal (NOT shipped)

Status: **proposal and mockup**, requested by KOMPOSITOR for music-reactive edits (Patrick 2026-10-27: "one of the top priorities now"; scope `V3KTR-PROJEKT/research/kompositor-music-reactive-scoping-2026-10.md` §3 to 5). Mockup: `V3KTR-COWORK/reports/music-reactive/music.png` (`build.mjs`). The lane markers have since shipped (v0.41.58); the rest waits for Patrick's look. The launch freeze is lifted (2026-10-29): planned work is for now unless Patrick marks it for after launch. Principle (Patrick): simple usability and UI, some flexibility, never a node graph.

## 1. Built from existing pieces
| Need | Existing piece |
|---|---|
| Lane head, section titles, sub-heading | `.vk-sec-head`, `.vk-sec-sub.vk-sub-head` |
| Instrument filter (Kick, Snare, Hats, Bass, Vocals, All) | `.vk-chip` toggles (selected = solid accent) |
| Sensitivity, Sync, Amount | `.vk-scrub` sliders (Shift fine, as everywhere) |
| Action picker per event type | `.vk-select` inside a `.vk-row` |
| Feel (Tight, Natural, Loose) | `.vk-seg` of `.vk-chip`s (hugs its text, per the hug rule) |
| Tap in, Apply to this edit | `.vk-btn.vk-btn--sm` |
| Drag readout "01:12.4" | `.vk-vp-pill` |
| Playhead | `.vk-playhead` (secondary) |
| The react toggle on a param row | `.vk-row__ctl` icon toggle (text colour only when on) |
| Machine-detected vs your choice | the secondary-colour rule: detected = `--accent-2`, hand-placed or moved = `--accent` |

## 2. New (small)
1. **The Music lane.** A 24 px lane under the audio clip, `--bg-1` ground, seven **marker shapes** (14 px grid, drawn as SVG glyphs; the same glyph appears in the lane, the legend and the Reactions rows so the list and the lane read as one):
   - Accent: diamond. Off-beat accent: small diamond. Hit: thin vertical tick (2 px).
   - Break: a span (12% secondary tint) with a bracket-bar glyph at its start. Build: a span with a rising wedge glyph.
   - Drop and return: downward triangle. Intro and outro: a bracket glyph at the very start and end.
   - **Colour:** detected = `--accent-2`; a marker you add, move or accept = `--accent` (the person's choice). Spans tint at 12% of the same colour.
   - **States** (handle family, section 3 of VIEWPORT-HANDLES): rest as above; hover = `--hover` / the secondary's hover; **selected = white fill with a 2 px accent ring, 12 px**; dragging adds the time pill. 24 px hit area.
   - **Editing:** click selects; drag moves it onto the true hit (snaps to the beat grid while Shift is held); Delete removes; click on an empty spot adds; **Tap in** adds a marker at the playhead each time a key is pressed while the track plays. The playhead is `.vk-playhead`.
   - The instrument chips filter which markers show; **Sensitivity** sets how many accents are found.
2. **The Reactions list.** A `.vk-section` titled Reactions: a master **Sync** `.vk-scrub`, then a sub-heading and one `.vk-row` per event type: the marker glyph, the name, an action `.vk-select` (Punch, Flash, Cut, Hold, Freeze, Shake, Slam text, Speed ramp, Pulse an effect, None), an Amount `.vk-scrub` (96 px). Styles set defaults (Hits None, Breaks Hold). **Apply to this edit** re-applies and keeps hand-edited markers.
3. **The react control.** At the right end of any modulatable setting's row, a 22 px `.vk-row__ctl` icon toggle (new icon `react`, a waveform ending in a dot): off = `--tx-2`, on = `--accent-2`. On opens a **REACT block** under the row (indented 12 px, `--bg-2`, a `.vk-micro-label` "REACT"): Source (`.vk-select`: Accents, Kick, Bass, Loudness, Vocals), Amount (`.vk-scrub`), Feel (`.vk-seg`). One shared component for every param.
4. **Icon `react`** (24 grid, two tones: the wave at 1, the dot solid), drawn in `V3KTR-COWORK/reports/music-reactive/icons.json`.

## 3. Proposed classes (when approved)
`.vk-lane` (the 24 px lane), `.vk-lane__mark` (a positioned marker, `--x` as the fraction, `[data-kind="accent|offbeat|hit|break|drop|build|inout"]`, `.is-hand` for accent colour, `.is-selected`), `.vk-lane__span` (a break or build span), `.vk-react` (the REACT disclosure block). Tokens: none new. Icon: `react` in `icons/menu-icons.js`.

## 4. Open questions for Patrick
1. Launch scope: no freeze now, so this is for now unless you mark it for after launch.
2. Marker colour rule (detected = secondary, yours = accent): right, or should every marker be one colour?
3. Seven marker shapes are many; the legend carries them. Is that fine, or fold hits into accents and breaks into builds as "spans"?
