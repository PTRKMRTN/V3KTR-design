# V3KTR design system — read this before any design work

Any session building UI for PROCESSOR, KOMPOSITOR, DIMENSOR or the site reads this file first.
Canon: `V3KTR-PROJEKT/00_ECOSYSTEM.md` §3 (brand) and §6; scope `V3KTR-PROJEKT/products/DESIGN-SYSTEM.md`.

## Hard rules
1. **Use tokens, never raw hex.** Every colour, radius, font and row height comes from `tokens.css` (`var(--…)`).
   If a value you need doesn't exist, add it HERE (new version), not in the app.
2. **Never hand-copy `:root`.** Apps pull `tokens.css` from a pinned release tag at build time (see README).
3. **Signal colour.** Aqua `--accent #00e5a0`, hover `--hover #3dffc2`, on ground `--bg-0 #212121`: **locked** (PROCESSOR and the brand). Per-app themes are being explored (Patrick 2026-09-29, not locked): see `themes/themes.css` and the Open decisions. Until they're locked, every app uses aqua.
4. **Dark only.** No light mode or theming in v1.
5. A visual change to a live app ships with a before/after sheet.

## Layers: how surfaces differ without drifting
The system has three layers. Every surface takes the core plus exactly one layer.

| Layer | File | Who uses it | What it holds |
|---|---|---|---|
| **Core** | `tokens.css` | everyone | signal aqua, grounds, text greys, FX-group colours, fonts, radius, focus |
| **App** | `app/app.css` | PROCESSOR, KOMPOSITOR, DIMENSOR | dense tool UI taken from PROCESSOR: buttons, chips, `.tog`, rows, sliders, menus (`vk-` classes) |
| **Site** | `site/site.css` | v3ktr.com | display type scale, gutters, nav, feed cards, article prose (`vs-` classes, `--site-*` tokens). **Neutral** (below). |

Each surface pulls one bundle: `dist/app.css` (core + app) or `dist/site.css` (core + site).

Rules for differences:
1. **A layer adds; it never redefines a core token.** The site can have its own type scale, but not its own aqua or its own greys.
2. **A difference lives in the narrowest place that's true.** Used by one app only: a named block in that layer
   (e.g. `/* KOMPOSITOR only */` in `app/app.css`), still in this repo. Used by two surfaces: move it down to the core.
3. **Pure layout of one screen** (PROCESSOR's rail width, a page's grid) stays in the app. It isn't design language.
4. **If a surface needs a value that isn't here, add it here first**, bump the version, then use it. Never a local hex.
5. The specimen page (`specimen/index.html`, built by `scripts/build-specimen.mjs`) shows all three layers. If an app looks different from it, the app has drifted.

## The website is neutral (Patrick 2026-09-30)
- V3KTR the brand is neutral. On the site, **white `--site-signal` is only for things you can click**: links, buttons, active nav, focus.
- Everything else is played down: headings `--site-heading #b3b3b3`, body `--site-text #a3a3a3`, captions `--site-muted #939393`. All pass 4.5:1 on the ground and on panels.
- **App colour appears only in that app's context.** Wrap the section, card or call-to-action in `data-app="processor"` (etc.); inside it the signal becomes the app's colour.
- The FX imagery supplies the colour on the site.
- **Callouts:** on an app's page, colour the word in the app's colour (`[data-app]` + `<em>` in a heading). The gradient (`.vs-spectrum`) is **parked**; if it returns, hero only. Outlined text was tried and dropped: hard to read.
- **Links are underlined** by default (every text link: in-text, "open" links, breadcrumbs, footer); hover thickens the line. Buttons and navigation bars are the only links without an underline.
- **One colour per button (web):** an outline button's border and text always match: white (`.vs-btn`) or the app colour (`.vs-btn--signal`). Never a grey border with coloured text.
- **Outline rule (web):** 5px for buttons (things you press to go somewhere or do something); 2px for everything you select, filter or type into (chips, tags, fields). Colour `--ctrl-edge #757575` (passes 3:1).

## Type
- Manrope (`--sans`) for UI and headings; JetBrains Mono (`--mono`) for captions, controls and values (tabular numbers).
- Body 13px. Controls 11px mono UPPERCASE. Section heads: 11px / 700 / letter-spacing .16em, uppercase, `--tx-2`.

## App components (rules; reference CSS in `app/app.css`)
- **Buttons:** mono, UPPERCASE, square (`--radius` 0), `--bg-3` fill, 3 sizes. **No border** — only chips have borders.
  Primary = `--accent` fill + `--on-accent` ink; hover = `--hover` fill.
- **Chips:** the only bordered element: 2px `--ctrl-edge` (shipped in PROCESSOR v0.571.0). Hover turns border + text `--hover`.
- **`.tog` (state, not action):** transparent + `--ctrl-line` border + `--tx-2` when off; `--accent` fill + `--on-accent` when on.
  Use `.tog` for anything that latches; use a button for anything that fires once.
- **Rows / sliders:** `--row-h` 26px, 3px apart, label 11.5px.
- **Panels:** a lighter fill (`--bg-2`), never an outline.
- **Focus:** `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on `:focus-visible`.
- **FX groups** are identified by the `--type-*` / `--depth` / `--adjust` colours, never by the signal aqua.

## Settled (don't reopen)
- Hover `#3dffc2`. Foreground white `#f4f4f4` with the neutral grey family (`--tx-1 #cfcfcf`, `--tx-2 #8a8a8a`): no blue-tinted greys (Patrick 2026-09-29).

## PROCESSOR spacing pass (shipped v0.571.0, 2026-09-30)
Patrick's pass set the app standard: `--pad` 22, side panel 400, buttons 8/14, rows 26px 3px apart, option gap 3, sections and heads with more air, 2px `--ctrl-edge` outlines on toggles and all chips. `app/app.css` v0.4.0 follows it. Before/after: `baselines/compare/`; recapture with `scripts/processor-baseline.mjs`.
7. ~~App outlines~~ **Settled 2026-09-30: 2px `--ctrl-edge`, roomier** (original padding kept, controls grow 2px). Shipped in PROCESSOR v0.571.0.
0. **Per-app themes** (exploration, not locked). Current picks (Patrick 2026-09-30, judged in the app for vibrance against aqua): KOMPOSITOR hot mandarin `#ff6a43`, DIMENSOR violet `#9d64ff`; aqua is the only locked colour. Known: the mandarin is ΔE 17 from `--danger #ff5b5b` (accepted), so destructive actions in KOMPOSITOR need a second cue (icon or wording), or `--danger` moves; the violet's small text uses `--accent-text #a679ff`. Not in `dist/`; see `themes/themes.css`.
1. **Muted text on panels:** `--tx-2 #8a8a8a` passes 4.5:1 on the ground (4.66) but not on `--bg-2` panels (4.10). Proposed `#969696` for muted text on fills. Affects apps too.
2. **Section-head colour:** this file said `--tx-2`; PROCESSOR renders heads `--tx-0`. The app layer follows PROCESSOR.
3. ~~Radius~~ **Settled 2026-09-30: square corners everywhere** (`--radius: 0`).
4. **Site buttons:** site v2 uses outlined buttons on transparent; the app rule is filled `--bg-3`, no border. Different by design, or align?
5. **Primary-button ink:** site `#04120d` vs core `--on-accent #1c1c1c`.
6. **Pending core colours** (marked PROPOSED in the layers): popup `#262626`, neutral rule `#595959`, error ink `#ff9b8a`, a neutral scrim/toast (PROCESSOR's are blue-tinted).
