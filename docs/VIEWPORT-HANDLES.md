# Viewport handles for curves and FX (PATH1, FXH1): proposal (NOT shipped)

Status: **proposal and mockup**, requested by DIMENSOR (Patrick's D58 decisions, 2026-10-25). Mockup: `V3KTR-COWORK/reports/viewport-handles/handles.png` (built by `build.mjs`). No token, class or icon is in the repo until Patrick has looked at the mockup; DIMENSOR builds nothing until a tag exists.

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
