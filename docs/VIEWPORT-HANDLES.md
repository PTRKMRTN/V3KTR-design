# Viewport handles for curves and FX (PATH1, FXH1): proposal (NOT shipped)

Status: **shipped in v0.41.46** (Patrick 2026-10-25: "the handles and cameras look good, go ahead", relayed by DIMENSOR). Requested by DIMENSOR (D58 and D59). Mockups: `V3KTR-COWORK/reports/viewport-handles/handles.png` (`build.mjs`) and `cameras.png` (`build-cameras.mjs`). The tokens `--hdl-*`, `interactions/handles.js`, `.vk-layer.is-current`, `.vk-sec-bar` / `.vk-sec-add` and the seven icons are in the repo.

## 1. Language (taken from what exists)
PROCESSOR's crop handles and `.vp-*` viewport handles are the family: **idle geometry is the accent, the part under the hand or being dragged is the hover accent, a 1 px dark halo (`drop-shadow(0 0 1px rgba(0,0,0,.85))`) keeps it legible over any render, corner points are diamonds and edge points circles**. On-canvas handles are one of the named exceptions that keep lines (AGENTS.md "Flat, not outlined"). Lessons carried over from PROCESSOR: handles follow the hand; gimbals sit on the subject; one size class.

## 2. Tokens (proposed, in `tokens.css`)

| Token | Value | Use |
|---|---|---|
| `--hdl-size` | 10px | a point at rest |
| `--hdl-hot` | 12px | hover, selected, dragging |
| `--hdl-tan` | 7px | a tangent handle |
| `--hdl-hit` | 24px (32px on touch) | minimum hit area, always larger than the drawn handle |
| `--hdl-curve` | 2px | the curve line |
| `--hdl-aux` | 1px | tangent lines, stems, outlines of planes |
| `--hdl-halo` | `drop-shadow(0 0 1px rgba(0,0,0,.85))` | legibility over a render |

Handles are **screen-space**: the sizes are CSS px and never scale with the camera or the zoom. Colours are tokens: `--accent`, `--hover`, `--on-accent`, `--tx-0`. Since the overlay is drawn in WebGPU / three.js (not DOM), the spec is the table plus the states below: read the token values from the computed style once per theme and draw with them; never a hex in the overlay code.

## 3. Point states (item 1)

| State | Shape | Size | Fill |
|---|---|---|---|
| Smooth, rest | circle | 10 | `--accent` |
| Sharp, rest | diamond | 10 | `--accent` |
| Hover | same shape | 12 | `--hover` |
| Selected | same shape | 12 | `--tx-0` (white) with a 2px `--accent` ring |
| Dragging | same shape | 12 | `--hover` |
| Bezier, selected | circle + two tangent handles | 12 + 7 | white/ring + tangents `--accent` at 0.6 |

Rule: **the accent marks the person's choices; selection is the white fill**, so a selected point stays distinct from the rest even when every point is the accent. Smooth is the default (the curve passes through it); any point toggles Sharp (diamond) or Bezier (shows tangents).

## 4. Tangents, curve line, insert hint (items 2 and 3)
- Tangent handle: 7 px circle `--accent` at 0.6, joined to its point by a 1 px `--accent` line at 0.6. Shown only for a selected Bezier point.
- Curve line: 2 px. **Selected curve** `--accent` at 1; other curves `--accent` at 0.6 (the 0.3 / 0.6 / 1 scale).
- Insert hint: while the pointer is within 12 px of the line, an 8 px ghost ring (`--accent` at 0.6) with a plus sits on the line at the nearest point; click inserts a point there.

## 5. Drawing (item 4)
- Plane: the ground or the view plane; the plane's name shows in a pill next to the cursor (`.vp-ro` style: `--accent` fill, `--on-accent` mono 10 px). A faint grid (white at 0.18) shows on the plane while the tool is active.
- Cursor: a thin white crosshair (1 px, 28 px) on the plane; click adds a point; a **dashed rubber-band** (1.5 px, `--accent` at 0.6) runs from the last point to the cursor.
- Closing: pointing at the first point shows an 11 px ring (`--accent` at 0.6) round it; a click closes the curve.
- Finish with double-click or Enter; Esc cancels the last point, a second Esc leaves the tool.
- **Toolbar entry:** an icon toggle (`.vk-icon-tog`, text colour only when on, per the small-icon-toggle rule) in DIMENSOR's viewport toolbar, icon `path`.

## 6. Height (item 5)
A selected point shows: a 1 px dashed stem (`--accent` at 0.6) down to its ground foot; a foot marker (4 px dot with a 9 × 4 px ring at 0.3); a **lift capsule** (16 × 28 px, `--accent` fill, up and down chevrons in `--on-accent`) above the point; and while dragging, a readout pill ("Height 0.42"). Drag the capsule, or Shift-drag the point, to lift it; cursor `ns-resize`.

## 7. Delete, close and the point menu (item 6)
Keys: Delete / Backspace deletes the selected point, C closes the curve, S / A / B set Smooth / Sharp / Bezier. Right-click a point opens the system menu (`.vk-menu`, rows with icons from the shared set): label POINT, then Smooth, Sharp, Bezier (key hints right-aligned), a 2 px divider, Close curve, Delete point. New menu icons drawn here first (two-tone, 24 grid): `path`, `smooth`, `sharp`, `bezier`, `close` (`V3KTR-COWORK/reports/viewport-handles/icons.json`); `trash` exists. **Caveat:** at 14 px `smooth`, `sharp` and `bezier` read as one family and are told apart mostly by the dot shape; the menu always shows the word beside them.

## 8. FX handles, same family (FXH1 sketch)
- **Axis arrow:** 2 px shaft, 10 px cone head, a 6 px dot at the origin, a 24 px hit ring at the head (shown on hover).
- **Angle arc:** a 2 px arc, a 16% accent wedge, 1 px radius lines at 0.6, a 12 px white handle with ring at the moving end, a pill with the value.
- **Plane:** a quad outline 1 px at 0.6 with a 16% fill, diamond corner handles (8 px), a 12 px white centre handle to move it.
- **Gimbal rings:** three rings through the subject's centre, 2 px at 1 (the active ring), 1.5 px at 0.6, 1 px at 0.3, a 12 px white handle on the active ring, a 6 px dot at the centre. Sits on the subject (PROCESSOR's rule).

## 9. Not decided here
- Whether point handles should take a second colour once the secondary-colour question is settled (no: the accent is the person's choice).
- Touch: 32 px hit areas are in; two-finger lifting is not specified.
- Keys S / A / B as single letters may clash with DIMENSOR's existing shortcuts; DIMENSOR checks.

## 10. Adoption (after Patrick's look)
1. Add the `--hdl-*` tokens and a short `VIEWPORT-HANDLES` section to AGENTS.md; add the five icons to `icons/menu-icons.js`; tag.
2. DIMENSOR draws the overlay from the tokens, PATH1 first, FXH1 second, with before/after sheets of each state in the real viewport.
3. PROCESSOR's crop and `.vp-*` handles keep working; adopt the tokens when next touched (their sizes already match: 12 px diamonds and circles).

## 11. Camera items (CAM1, DIMENSOR D59): what exists, what is proposed
Mockup: `V3KTR-COWORK/reports/viewport-handles/cameras.png` (`build-cameras.mjs`).

**Existing patterns that cover it (use these classes, nothing new):**
- Section: `.vk-section` + `.vk-sec-head` ("Cameras").
- A camera row: `.vk-layer` (icon tile `.vk-layer__icon`, name `.vk-layer__name` with a `<small>` line for lens and field of view); `.is-active` is the **selected** row tint, `.is-hover`, `.is-disabled` as everywhere.
- Row actions: `.vk-row__ctl` icon controls (text colour only when on, per the small-icon-toggle rule), each with a tip that adds a description (the tip-repeat rule): **Look through** (shared `eye`), **Update** (shared `sync`), **Lock** (shared `lock` / `unlock`, `.vk-lock` marker on a locked row).

**Proposed (no pattern today):**
1. **Active marker.** The ONE active camera has its row's icon tile filled solid (`--accent` background, `--on-accent` icon). Selected (the row tint) and active (what renders) are therefore two different marks and never confused. Other cameras keep the dark tile with an accent icon. Set by "Make active" in the row's context menu, or by clicking the tile.
2. **Section-head add button.** A 22 × 22 px icon button (`--bg-3`, hover `--bg-4`) at the right end of the head, for "Add camera" (tip with a description). This is the shared pattern for any "add an item to this list" head; DIMENSOR's lists use it from now on.
3. **Frustum marker** (in the D58 family): apex dot, four edges to a far-plane rectangle, an up tick; screen-size class (about 34 px long whatever the distance, true orientation), never rendered, clickable at the apex (24 px hit). States: inactive = lines at 0.6, 5 px apex; active = full lines, solid apex, 16% far-plane tint; hover = hover accent, 1.5 px lines, 12 px ring at 0.6; selected = white apex with a 2 px accent ring. Name label in the mono 9.5 px pill on hover.
4. New icons, drawn here first: `camera` (body and lens, two-tone), `add` (plus). Icons in `icons-cameras.json`.

**Key scope (D58, from DIMENSOR):** S / A / B (Smooth / Sharp / Bezier) are active only while a path is being edited (a point selected or the draw tool on) and never in Walk mode, where WASD move the camera. The draw tool owns Enter while it is on.

## 12. Camera focus target (depth of field), a named variant (Patrick via DIMENSOR, 2026-10-25)
Built only from the D58 parts; no new token.
- **Line:** a dashed line, **2 px** (dash 3 4) with the handle halo, from the frustum apex to the focus point, **drawn on top of the 1 px solid aim line** (section 13) so it stays visible where the two run along each other (Patrick, 2026-10-25, after a mockup); `--accent` at 0.6 on an inactive camera, 1 on the active one; faint (0.3) while blur is 0.
- **Target marker:** so that it is never mistaken for a curve point, the focus target is its own shape: a **12 px ring** (2 px `--accent` stroke, hollow) with a **4 px centre dot**, i.e. a target. States: rest = accent (0.6 inactive, 1 active); hover = `--hover`; selected or dragging = white fill ring with an accent stroke and the dot in accent. Same 24 px hit area, same halo; draggable on the view plane through the point, with a "Focus 1.8" readout pill while dragging.
- Never rendered; shown only for the cameras that have a stack row; hidden when the viewport's Cameras overlay is off.

## 13. Camera aim target and depth-box extents (Patrick via DIMENSOR, 2026-10-25)
Mockup: `V3KTR-COWORK/reports/viewport-handles/aim.png` (`build-aim.mjs`). Handle-family parts only: no new token.

**Aim target** (where the camera looks), on the same line as the focus target:
- **Line:** a **solid** 1 px line (`--hdl-aux`) from the apex to the aim point; the focus line stays dashed and is 2 px, drawn on top of this one (section 12). 0.6 on an inactive camera, 1 on the active one.
- **Marker:** a **filled square**, 10 px at rest (12 px hot): the one shape the family had not used (circle = smooth point, diamond = sharp point, ring + dot = focus), so an aim target cannot be taken for a curve point or the focus. States: inactive = accent at 0.6; active = accent; hover = `--hover` 12 px; selected or dragging = white fill with a 2 px accent stroke, 12 px. Same 24 px hit area and halo.
- **Drag:** the point follows what is under the cursor (it snaps onto an object surface, else onto the view plane through the point) and the camera turns to look at it. Readout pill (`.vp-ro` style): "Aim: <object name>" while over an object, else "Aim 2.4" (the distance).
- **Aim and focus overlap (common):** the **aim square stays on top**; the **focus ring grows to 20 px** and encloses it. Hit priority: the square (inside 8 px of the centre) is the aim; the ring band outside it is the focus. Hovering either highlights its own line only.

**Depth-box extents on a camera:**
- **While the slices show, the frustum's own far-plane rectangle and its 16% fill are dropped**: the near and far slices are the only planes, and the four edge lines stay (Patrick, 2026-10-25). Without slices the frustum marker is unchanged.
- Drawn as two **slices of the frustum**: where the box's near depth and far depth cut the frustum's four edge lines. The **near slice is a 1 px outline, the far slice a 1 px outline with a 14% plane**, with the four edge segments between them at 0.3.
- **Colour: the secondary (`--accent-2`)**, since depth is on the secondary list (depth-channel marks). Labels "near 0.4" and "far 1.6" in `--accent-2-hover`, mono 9.5 px.
- **Shown** for the selected camera, and for the active camera while a depth-box effect is selected; hidden with the Cameras overlay. Never rendered.
