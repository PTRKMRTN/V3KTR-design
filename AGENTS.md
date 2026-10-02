# V3KTR design system — read this before any design work

Any session building UI for PROCESSOR, KOMPOSITOR, DIMENSOR or the site reads this file first.
Canon: `V3KTR-PROJEKT/00_ECOSYSTEM.md` §3 (brand) and §6; scope `V3KTR-PROJEKT/products/DESIGN-SYSTEM.md`.

## Hard rules
1. **Use tokens, never raw hex.** Every colour, radius, font and row height comes from `tokens.css` (`var(--…)`).
   If a value you need doesn't exist, add it HERE (new version), not in the app.
2. **Never hand-copy `:root`.** Apps pull `tokens.css` from a pinned release tag at build time (see README).
3. **App colours are LOCKED (Patrick 2026-09-30).** PROCESSOR aqua `#00e5a0`, KOMPOSITOR mandarin `#ff6a43`, DIMENSOR violet `#bb6fff`, each with hover / dim / light-ground ink (`themes/themes.css`, tokens `--processor*`, `--kompositor*`, `--dimensor*`). An app sets `data-app="…"` on its root and uses `--accent` / `--hover`; never a raw hex. The V3KTR brand itself is neutral. Don't reopen.
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
- **Forms are neutral in every context** (Patrick 2026-09-30): inside an app section a form does not take the app colour (mandarin on a form read as danger). Its fields, focus border and submit button stay white; the only colour in a form is the error red.
- **Callouts:** on an app's page, colour the word in the app's colour (`[data-app]` + `<em>` in a heading). The gradient (`.vs-spectrum`) is **parked**; if it returns, hero only. Outlined text was tried and dropped: hard to read.
- **Links are underlined** by default (every text link: in-text, "open" links, breadcrumbs, footer); hover thickens the line. Buttons and navigation bars are the only links without an underline.
- **One colour per button (web):** an outline button's border and text always match. On a neutral page `.vs-btn` is white; inside `[data-app]` it is the app colour, like the solid button next to it (Patrick 2026-10-01). `.vs-btn--signal` is the app colour everywhere. Never a grey border with coloured text. Buttons inside a form stay neutral (forms are neutral in every context; Patrick-confirmed 2026-10-01).
- **States (web):** every button, link and pill has rest / hover #cfcfcf / focus (2px ring in its own colour, 3px out) / pressed (hover colour, 1px down) / selected (filled, or a 2px bar for nav) / disabled (40%, no hover), and is one colour in each. Inside an app section, outline buttons take the app colour (Patrick 2026-10-01: a card's buttons share one colour); buttons in forms stay neutral. See `site/site.css` STATES and the specimen's state matrix.
- **Outline rule (web):** 5px for buttons (things you press to go somewhere or do something); 2px for everything you select, filter or type into (chips, tags, fields). Chip outlines are `--ctrl-edge #757575` (passes 3:1).
- **Fields (web, Patrick 2026-10-01):** white at rest (a field is something you act on), 2px, and **5px while focused**: the thicker border is the focus indicator. The button beside it stays 5px, so "type here" and "press here" stay distinct. Error = red border. Same for input, textarea, select (`.vs-field`). A select draws its own solid ▾, inset as far from the right edge as the text is from the left. Spacing: label to the visible control `--site-label-gap` 14px everywhere (tick boxes included: measure to the box, not its row); groups `--site-form-gap` 28px apart. Forms with several fields use `.vs-form`: one column, left-aligned, label above each field, error note under its field, one button at the end. **A form's submit button is solid** (white fill, dark ink; automatic in `.vs-signup` / `.vs-form`), so it never reads as another field.
- **Tick boxes (web, v0.14.0):** `.vs-check` (label wrapping a checkbox and its text) inside a `fieldset.vs-choices` with a `legend.vs-form__label`. Square 20px box, 2px white outline, filled white with a dark tick when checked, hover grey, focus ring 2px 3px out; rows 32px. Invalid group (`aria-invalid` or `.is-error` on the fieldset): every box outline red, plus a `.vs-signup__note.is-error` under the group. Never pre-tick a consent choice.

## Consumer CSS: let layer classes win
Layer classes are single classes (0,1,0) on purpose. A consumer's own descendant rule such as `.facts dd { color }` (0,1,1)
outranks them silently, e.g. a `.vs-group-title` going grey. Wrap local descendant/element rules in `:where()`
(`:where(.facts dd) { color }`), so they have zero weight and layer classes win. (Found by the site-v2 session, 2026-09-30.)

## Status (ready / caution / blocked)
- Tokens: `--status-ready #00e540`, `--status-caution #f9c200`, `--status-blocked #ff5e7e`, ink on a fill `--on-status`. **LOCKED 2026-09-30 (Patrick).** `--danger` is the same red as blocked: one red everywhere (delete, errors, blocked).
- "Ready" is its own green, not PROCESSOR's aqua: on the neutral site aqua means PROCESSOR only.
- Never colour alone: a status always has an icon (`brand/status/`: Patrick's pixel check / warning / error) and a word.
- Site: `[data-status]` + `.vs-verdict` (filled strip) and `.vs-status` (coloured word). Apps: use the tokens.

## Logos (brand/)
- Master `logo-v3ktr.svg` (wordmark + DIMENSIONAL FX) and solo `logo-v3ktr-solo.svg` are **neutral**: white or grey, any colour as needed, never an app colour.
- **An app uses its app logo file** (`logo-v3ktr-processor.svg` etc.): never the wordmark plus separate text (Patrick 2026-09-30).
- Social links use the icons in `brand/social/` (Simple Icons, CC0; third-party trademarks: neutral colour only, never an app colour).
- All files use `currentColor`; `brand/colour/` has the app logos with their colour baked in for places CSS can't reach. Rules in `brand/README.md`.

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
- **Workspace separators are 2px** (Patrick 2026-10-01): lines that divide the workspace into areas use `--stroke` (2px) in `--line`; `.vk-sep` / `.vk-sep--v`. Control outlines aren't separators.
- **Top bar** (v0.18.0, Patrick 2026-10-02): one bar in every app: `.vk-topbar` (36px, `--pad` sides), `.vk-brand` (one width in every app, `--brand-slot`, so File starts at the same x and nothing shifts when switching apps) + `.vk-brand-logo` (the app logo sized to the menu text: `--brand-logo-h/-top/-w`), `.vk-menu`s, then `.vk-doc` (the document name, left-aligned after the menus, never centred). Don't hand-copy the numbers.
- **Menu icons** (v0.20.0): every menu action row leads with an icon from `icons/menu-icons.js` (24 grid, 1.4 stroke, currentColor, 14px) in a `.vk-menu-ic` column; a state check shares the column. A new verb is drawn in this repo first, never in an app.
- **Floating viewport toolbars** (Patrick 2026-10-01): the bottom toolbar sits at `bottom: var(--vp-bar-bottom)` (50px, one toolbar-height higher than the old 14px); each bar stacked above it adds `var(--vp-bar-step)` (36px): timeline at `calc(var(--vp-bar-bottom) + var(--vp-bar-step))`. Same in every app.
- **Focus:** `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on `:focus-visible`.
- **FX group → colour token** (the same everywhere; PROCESSOR's `GROUPS` is the source): adjust `--adjust` · degrade `--type-sage` · distort `--type-rust` · colour `--type-rose` · signal `--type-teal` · glitch `--type-violet` · type `--type-amber` · light `--type-slate` · depth `--depth`.
- **Chips are one colour** (Patrick 2026-09-30): text = outline, or filled with dark ink when selected. Never an outline in one colour with text in another.
- **FX-family titles take the family colour** (Patrick 2026-09-30), on the site and in the apps: where there is a title, or a title and icon, for an FX family (the family name, its effect names, an effect page's title and icon). Use `.vs-group-title` / `.vk-group-title`, or wrap it in `data-group="depth"` etc., which sets `--gcol` from the map above. This and group chips are the only exceptions to the neutral site.
- **FX groups** are identified by the `--type-*` / `--depth` / `--adjust` colours, never by the signal aqua.
- **Exception to the neutral/one-signal rule (Patrick 2026-09-30): a chip that labels an FX group may use that group's colour**, on the site and in the apps: border and text in the group colour (one colour), selected = filled with dark text. Group colours are LOCKED (v0.7.0) and all pass 4.5:1 as chip text; depth is lime `#b1e800`. App: `.vk-chip--group`; site: `.vs-chip--group`; both take `--gcol`.

## Settled (don't reopen)
- Hover `#3dffc2`. Foreground white `#f4f4f4` with the neutral grey family (`--tx-1 #cfcfcf`, `--tx-2 #8a8a8a`): no blue-tinted greys (Patrick 2026-09-29).

## PROCESSOR spacing pass (shipped v0.571.0, 2026-09-30)
Patrick's pass set the app standard: `--pad` 22, side panel 400, buttons 8/14, rows 26px 3px apart, option gap 3, sections and heads with more air, 2px `--ctrl-edge` outlines on toggles and all chips. `app/app.css` v0.4.0 follows it. Before/after: `baselines/compare/`; recapture with `scripts/processor-baseline.mjs`.
7. ~~App outlines~~ **Settled 2026-09-30: 2px `--ctrl-edge`, roomier** (original padding kept, controls grow 2px). Shipped in PROCESSOR v0.571.0.
0. ~~Per-app themes~~ **Locked 2026-09-30** (rule 3). KOMPOSITOR's mandarin sits ΔE 35 from `--danger` (since v0.10.0; it was 17): still pair its destructive actions with an icon or wording.
1. **Muted text on panels:** `--tx-2 #8a8a8a` passes 4.5:1 on the ground (4.66) but not on `--bg-2` panels (4.10). Proposed `#969696` for muted text on fills. Affects apps too.
2. **Section-head colour:** this file said `--tx-2`; PROCESSOR renders heads `--tx-0`. The app layer follows PROCESSOR.
3. ~~Radius~~ **Settled 2026-09-30: square corners everywhere** (`--radius: 0`).
4. **Site buttons:** site v2 uses outlined buttons on transparent; the app rule is filled `--bg-3`, no border. Different by design, or align?
5. **Primary-button ink:** site `#04120d` vs core `--on-accent #1c1c1c`.
6. **Pending core colours** (marked PROPOSED in the layers): popup `#262626`, neutral rule `#595959`, error ink `#ff9b8a`, a neutral scrim/toast (PROCESSOR's are blue-tinted).
