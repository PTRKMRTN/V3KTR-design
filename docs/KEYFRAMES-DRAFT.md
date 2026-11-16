# Keyframes: one language for the suite (DRAFT, not approved)

**Status: PROPOSED by the design-system session, 2026-11-16. Nothing here is a rule until Patrick approves a mockup.**
It exists so the first keyframe mockups (DIMENSOR's keyframe timeline `KEY1` and Mask lane keys, sprint 11-16) are drawn in a way every app can share.
No app has shipped a keyframe UI yet, so the first approved mockup sets the language for all four.

## What exists today (checked 2026-11-16)

| App | What it has | Sign |
|---|---|---|
| PROCESSOR | FX Motion: a setting is ARMED so the Motion stack drives it. No keyframes on a timeline. | round dot on the row (`.motion-dot`, accent when armed) |
| KOMPOSITOR | Music lane events; speed presets. "Keyframe graph" is a later item. | lane glyphs (set A); the **accent** event is a 14px diamond |
| DIMENSOR | Camera tracking Mask lane mock; keyframe timeline mock coming. | diamonds on a `.vk-lane` (mock) |
| INCEPTOR | Links: a setting is DRIVEN by a signal (field, loop, audio). No keyframes. | **◇ = driven**, ● = armed motion (mock) |

## Proposed language

1. **A diamond is a key**: a value pinned at a time. **A round dot is "something drives this setting"** (armed, linked, reacting).
2. **Keys live on a lane.** A key lane is a `.vk-lane` in a labelled `.vk-lane-row` (the head names the property or track: Position, Camera, Mask). Never mixed into the Music lane.
3. **The key mark is `.vk-lane__mark[data-kind="key"]`**: the lane's diamond. A key a person set is `.is-hand` (the app colour); a key the machine made (a camera solve, a bake) stays the secondary colour; a key that sets itself because the person changed a value at a new time is the person's; selected is `.is-selected` (white with the accent ring). This is the suite's existing rule: the machine draws in the secondary, the person in the accent.
4. **The animated stretch between two keys** is a `.vk-lane__span` (`.is-hand` when the keys are).
5. **The playhead** is `.vk-playhead`. `.vk-marker` (the 7px secondary diamond) stays a TIMELINE marker (in point, out point, beat) and is not used for keys.
6. **On a setting's row**, the key control is a `.vk-row__ctl` in the same slot as the react toggle: text colour only, no fill (the small-icon-toggle rule). Grey = no keys; accent = a key at the playhead.
7. **How a key eases** (Ease / Linear / Hold) is a `.vk-seg` in the inspector for the selected key. No graph editor in the first version.
8. **Keys:** click a key to jump to it, drag to move it in time, Delete removes it, Esc deselects.

## First mockups (DIMENSOR KEY1, 2026-11-16)

`V3KTR-COWORK/reports/key1-mock/` (`mock-a/b/c/open.png`), drawn in the parts above. They answer the open points both ways and recommend:

- **Key size 10px** (at 4.3px a frame, 14px keys under four frames apart merge; 10px also tells a key lane from the Music lane). The hit area stays 24px.
- **Hold has no glyph.** A tinted stretch means the value moves; no tint means it waits. Which one is shown in the panel's Ease / Linear / Hold.
- **The row control has three states:** grey hollow = no keys; accent hollow = the row has keys, the playhead is between them; accent solid = a key is here. Two drawings of a `key` icon (hollow, solid).
- **A key at time 0 must not be cut by the lane's edge.** The design-system answer: key marks are never clipped (the lane clips its spans, not its marks), so the time scale does not need an inset.
- **Where the lanes live:** option A (one lane for the selection under the Loop bar) first; option C (a Timeline frame, sharing KOMPOSITOR's timeline rows and ruler) can follow without redoing keys.

The design-system session agrees with each recommendation. None is a rule until Patrick picks.

## Decided

- **A diamond is a key in every app; a round dot means "something drives this setting"** (Patrick, 2026-11-16, Decisions card DS-diamond-means-key, "Diamond = key everywhere"). INCEPTOR's "driven" mark becomes the `link` icon. Recorded in AGENTS.md.

## Open, for Patrick

- **Size of the key diamond.** The Music lane's accent diamond is 14px. Keys can sit close together; a smaller diamond (10px) would also tell a key lane from the Music lane.
- **A Hold key's shape.** Whether Hold needs its own glyph (a square) or only shows in the inspector.
- **New drawings needed if approved:** a `key` icon for the row control, and any glyph beyond the diamond.
