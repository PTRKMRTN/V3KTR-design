# Secondary colour per app: proposal (NOT shipped)

Status: **shipped in v0.41.47** (Patrick 2026-10-25: "half way is great, lock it in"). **The shipped colours are the halfway point between each app's tonal and analogous +35° options** (PROCESSOR `#74ddcf`, KOMPOSITOR `#f8b787`, DIMENSOR `#ecb0eb`), not the round-3 picks in the table below, which are kept as the record of the first proposal. Sections 3 to 6 describe the same tokens and placements; the collision table in section 5 was for the round-3 picks, and the halfway colours measured clear of every reserved colour (nearest: PROCESSOR's own accent at 9.3 on the OKLab × 100 scale, KOMPOSITOR caution yellow at 10.1, DIMENSOR fuchsia at 13.4). Mockups: `V3KTR-COWORK/reports/secondary-colour/` (`<app>-r3.png`, built by `build2.mjs`; round 1 and 2 are `build-round1.mjs` / `build.mjs`).

## 1. Why
One accent per app does every job: primary action, selected, hover, focus, toggle on, links, the active tab, progress, the playhead. When one colour carries all of them, none of them stands out. A second colour lets "do this / this is chosen" stay the accent while "time, live state, second data" gets its own voice. The question Patrick asked: would breaking up the colour a little **help or hinder**? The mockups say it helps when it is rationed and hinders when it spreads (the "bold" variant in round 1 fought the accent).

## 2. The colours (Patrick's picks, 2026-10-25)

| App | Accent | Secondary | Hover | Dim | Tint (tag/background) | Reads as |
|---|---|---|---|---|---|---|
| PROCESSOR | aqua `#00e5a0` | `#a8d545` | `#bee074` | `#5e7231` | 12% over `--bg-3` | lime / yellow-green |
| KOMPOSITOR | mandarin `#ff6a43` | `#f09a35` | `#f4b368` | `#7e572a` | 12% over `--bg-3` | orange |
| DIMENSOR | violet `#bb6fff` | `#ef7a7a` | `#f39b9b` | `#7e4949` | 12% over `--bg-3` | coral red |

Derivation (same recipe as the accents): hover = 25% towards white; dim = 55% towards the ground `#212121`. Computed values are in `V3KTR-COWORK/reports/secondary-colour/tokens.json`.

### Contrast (WCAG, text and graphics)

| App | on ground `#212121` | on panel `#2b2b2b` | on `--bg-3` | ink `#1c1c1c` ON the secondary |
|---|---|---|---|---|
| PROCESSOR | 9.41 | 8.27 | 6.65 | 9.96 |
| KOMPOSITOR | 7.19 | 6.32 | 5.08 | 7.61 |
| DIMENSOR | 5.93 | 5.22 | 4.19 | 6.28 |

All pass 4.5:1 for text on the ground and the panel. **On `--bg-3` DIMENSOR's 4.19 is graphics-only** (3:1), so small text on a grey button face is not allowed there.

**Tags with a tint** (the round-3 mock used 22%, too strong): use a **12% tint with the hover colour as text**: PROCESSOR 5.89, KOMPOSITOR 5.05, DIMENSOR 4.54, all pass. Never the plain secondary on a 22% tint (DIMENSOR 3.05, KOMPOSITOR 3.48 fail).

## 3. Tokens (when it ships)
Per app in `themes/themes.css`, beside the accent set: `--accent-2`, `--accent-2-hover`, `--accent-2-dim`, `--accent-2-tint`, plus `--processor-2`, `--kompositor-2`, `--dimensor-2` raw values. An app sets `data-app` and uses `--accent-2`; never a raw hex (rule 1). The site stays neutral: **no secondary on the site** (AGENTS.md "The website is neutral").

## 4. Where it goes (the rule)
**Rule of thumb: the accent is for the person's choices; the secondary is for what time and the machine are doing.** Under 5% of any screen.

Takes the secondary:
- Timeline playhead and markers, beat marks, in-points (KOMPOSITOR first).
- Live / progress state: the progress dot, the percentage, the bar of a `.vk-toast--pinned` pill and a render or export bar; the "LIVE" tag.
- The **second series** of a curve, graph or histogram marker (the first stays the accent or grey).
- Channel and depth views: the DEPTH channel tag and its swatch or ramp (DIMENSOR, PROCESSOR depth).
- "New" and information tags (`NEW`, `LIVE`), as a 12% tint + hover-colour text.
- A one-character readout that needs to read as live (fps, a live count).

Stays the accent (never the secondary): primary buttons, selected rows and tiles, toggle on, tab active, the **focus ring**, links, slider fills, section heads, the Blends latch, the roll buttons, hover washes.

Never: the secondary as a button fill; both colours in one control; a gradient between them (the one allowed gradient is a depth ramp that ends in the secondary); the secondary on the site; as an error or warning colour.

## 5. Conflicts the picks have (found by measuring, ΔE76)

| Pick | Nearest existing colour | ΔE | Verdict and mitigation |
|---|---|---|---|
| PROCESSOR `#a8d545` | depth FX group lime `#b1e800` | **22** | Close. The depth group colour appears on the rail and chips; the secondary appears in other places, and never in the same chip. Pairs where they meet (a depth-group item that is also live) must use the group colour for the group and the secondary only for the live dot. Measured alternatives: `#8dd350` is only ΔE 28 from depth (a small gain); the greener `#6fc979` is ΔE 53 and separates cleanly (it was candidate 3 in round 2). Flagged to Patrick. |
| KOMPOSITOR `#f09a35` | caution yellow `#f9c200` (29), type-amber `#b58d4c` (30), its own accent mandarin `#ff6a43` (34) | 29 to 34 | Distinct enough; the status icon and word always accompany caution (never colour alone, AGENTS.md Status). |
| DIMENSOR `#ef7a7a` | danger `#ff5e7e` (**19**) and the rust FX group `#cd7f6e` (**17**) | **17 to 19** | **The risky one.** A coral progress dot beside a pink-red error toast is near the same hue. Rules: never use the secondary for any error/blocked meaning; error toasts and danger fills keep their tint and icon; the secondary never sits in a chip with the rust group. If it still reads as an alarm in use, the round-2 fallbacks do not solve it: pink `#d974b3` is ΔE 35 from danger but **ΔE 6 from DIMENSOR's Effectors fuchsia `#d47dba`** (a collision inside the same app), and rose `#e56fa0` is ΔE 24 from danger. A DIMENSOR secondary in a different family (the blue and brass tried in round 1, or an orange) avoids both; the brief of "pink/red" is what makes this one hard. |

## 6. How to adopt (not before Patrick's go)
1. Add the tokens above; drift check asserts each `data-app` defines all four.
2. Add placement classes only where a shared component needs one: `.vk-tag--live` / `--new` (12% tint, hover-colour text), `.vk-toast__dot` and `.vk-toast .pbar` take `--accent-2`, a `.vk-playhead` and `.vk-marker` pair for timelines, `.vk-series--2` for the second graph series.
3. Apps adopt per component, each with a before/after sheet, **one component family per PR** (the app.css migration method, proved against `main`).
4. AGENTS.md gets this section's rule (4) as "Secondary colour" and the contrast table.
5. Test: a Playwright check that the placements resolve to `--accent-2` and the "stays the accent" list does not, with a negative control.

## 7. Open questions for Patrick
1. PROCESSOR: keep `#a8d545` (the pick, ΔE 22 from the depth lime) or the greener `#6fc979` (ΔE 53)?
2. DIMENSOR: coral `#ef7a7a` sits very close to danger and rust (ΔE 17 to 19); keep it with the rules in section 5, or try a hue outside red/pink (pink and rose have their own collisions, see section 5)?
3. Are the tag and "live" placements right, or should the secondary only ever appear on time and progress?
4. Should the secondary have a presence in the site's app sections (cards inside `[data-app]`)? Recommended no.
5. Any app surface where the accent already feels overused that this should relieve first?
