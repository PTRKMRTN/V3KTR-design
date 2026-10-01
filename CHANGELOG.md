# Changelog

Semver. Apps pin a tag; a major bump means a consumer may render differently.

## 0.15.0 — 2026-10-01

Select arrow (Patrick: "spacing the carat to match the padding of the text").
- `.vs-field select` draws its own arrow, a solid ▾ in the signal colour (the app's dropdown mark), with its right edge 16px inside the outer edge, the same as the text on the left. Measured: text 17px from the left edge, arrow 17px from the right, at rest and focused (the arrow is positioned from the border box, so it doesn't move when the border thickens). The browser's arrow sat 6px from the edge (9px focused).
- The select's text now lines up with the other fields: 17px in, where the browser's own select padding put it at 21px.
- Browser autofill no longer paints fields blue-grey: an autofilled field keeps the ground colour and white text.

## 0.14.0 — 2026-10-01

Tick boxes (requested by site-v2 for the "Hear it first" sign-up: one box per list).
- New `.vs-choices` (fieldset) + `.vs-check` (label + checkbox). Square 20px box in the field rule: 2px white outline; checked = white fill with a dark tick (like a selected chip); hover = the hover grey; keyboard focus = 2px ring 3px out; disabled 40%. Row 32px, label in body text.
- Invalid group: `aria-invalid="true"` or `.is-error` on the fieldset turns every box outline red; pair it with `.vs-signup__note.is-error`.
- Neutral in every context (added to the form reset), so it stays white inside an app card.

## 0.13.0 — 2026-10-01

Viewport toolbars sit higher (Patrick: "the height of the single toolbar away further", all apps).
- New core tokens `--vp-bar-bottom: 50px` (the bottom floating toolbar; apps had 14px) and `--vp-bar-step: 36px` (each bar stacked above it; apps had the timeline at 50px, now 86px).
- `.vk-toast--pinned` follows them (54px → 90px), so it still clears the bottom bar.

## 0.12.0 — 2026-10-01

Fields are white and thicken on focus (Patrick, option B).
- `.vs-field` input, textarea and select: 2px white border at rest (was 2px grey `--ctrl-edge`), 5px while focused (the border is the focus indicator; no separate ring). Padding drops by 3px on focus so the text doesn't move. Error stays a red border. Inside forms the white holds in app sections too (forms are neutral).
- New `.vs-form` / `.vs-form__group` / `.vs-form__label` for forms with several fields: one column, left-aligned, label above, note under its field, one button at the end. Added to the neutral-form reset.
- Textarea: 140px minimum, vertical resize.
- A form's submit button is now solid (white fill, dark ink, hover grey), automatically for any submit button in `.vs-signup` / `.vs-form`; it was a white outline, which read as another field next to white fields. Stays white inside app sections.

## 0.11.0 — 2026-10-01
Site layer renders differently: app-card buttons.
- **Inside `[data-app]`, the outline `.vs-btn` takes the app colour** (Patrick): a card's buttons share one colour, e.g. an aqua "How it works" outline next to the solid aqua "Open Processor". Was white in every context (v0.4.2). Hover = the app's hover colour.
- Buttons inside a form stay neutral (forms are neutral in every context, Patrick-confirmed).

## 0.10.5 — 2026-10-01
Site layer renders differently: nav.
- `.vs-nav` collapses into the menu below **1100px** (was 860px), and tightens its link gap to 24px from 1100 to 1279px. With five links the bar overflowed sideways between 861 and 1099px.
- `.vs-verdict` keeps its ink as a `<p>` inside a `.vs-panel` (`.vs-panel p` had turned it grey on green).

## 0.10.4 — 2026-10-01
- **Workspace separators are 2px in every app** (Patrick): `--stroke` in `--line`; new `.vk-sep` / `.vk-sep--v` in the app layer. Shipped in PROCESSOR v0.578.0.
- PROCESSOR now pulls its tokens from this repo (v0.577.0, pinned to v0.10.3 in its design.json), pixel-identical.

## 0.10.3 — 2026-09-30
- The sign-up success note is white wherever the form sits (Patrick); inside a `.vs-panel` the panel's paragraph rule had turned it grey. The error note stays the status red.

## 0.10.2 — 2026-09-30
- **Forms are neutral in every context** (Patrick): `.vs-signup` / `.vs-field` reset `--site-signal`, `-hover` and `-ink` to the neutral site values, so inside `[data-app]` the focus border, focus ring and submit button are white, not the app colour (KOMPOSITOR's mandarin read as a danger state). The error red is unchanged.

## 0.10.1 — 2026-09-30
- Site focus rings no longer use core `--focus-ring` (it resolves to PROCESSOR's aqua outside `[data-app]`): the email input and card media ring in `--site-signal` (white on a neutral page, the app's colour in an app section).
- Error state: `.vs-field input[aria-invalid="true"]` takes the error red on its border and focus ring, so the field matches its note.
- `.vs-field input` text is always white (`--tx-0`); inside `[data-app]` it had taken the app colour.

## 0.10.0 — 2026-09-30
Consumers render differently: the danger red.
- **Status colours LOCKED** (Patrick): ready `#00e540`, caution `#f9c200`, blocked `#ff5e7e`.
- **`--danger` is the status red**: `#ff5b5b` → `#ff5e7e`, `--danger-dim` `#7a2a2a` → `#7a2d3c`. One red everywhere; it sits ΔE 35 from KOMPOSITOR's mandarin (the old one was 17). Shipped in PROCESSOR v0.575.0.
- Site: `--site-error-ink` is now `var(--status-blocked)` (was `#ff9b8a`): form error notes use the same red.

## 0.9.1 — 2026-09-30
- `.vs-verdict` works as a link and inside article prose: dark ink and no underline for `a.vs-verdict` (the prose link rule outranked it: white, underlined ink on the fill), `<strong>` and inner links inherit the ink, hover = brightness, focus ring in the state colour.
- `.vs-verdict` weight 700 → 500 (it's a sentence); `<strong>` and links inside are 700.

## 0.9.0 — 2026-09-30
Adds status. Nothing existing changes.
- **Status tokens (PROPOSED, awaiting Patrick; names stable):** `--status-ready #00e540`, `--status-caution #f9c200`, `--status-blocked #ff5e7e`, `--on-status #1c1c1c`. Each passes 4.5:1 as small text on the ground and panels and as a fill under dark ink, and stays clear of the app and FX-group colours.
- **Site:** `[data-status="ready|caution|blocked"]`, `.vs-verdict` (filled strip; neutral panel with no state), `.vs-status` (coloured word), `.vs-status__icon`.
- **Status icons:** `brand/status/` check / warning / error / close: Patrick's pixel icons from the v1 site, `currentColor`.

## 0.8.0 — 2026-09-30
Adds assets; no CSS changes.
- `brand/social/`: Instagram, X, YouTube, Bluesky, Facebook, TikTok from Simple Icons v16.33.0 (CC0), `currentColor`. Approved by Patrick. Each mark remains its owner's trademark: neutral colour only, no distortion. Notes in `brand/README.md`.

## 0.7.4 — 2026-09-30
- `.vs-callout` gets 48px above it (Patrick: the lede → callout gap is the standard); none when it's the first child of its container.

## 0.7.3 — 2026-09-30
Site layer renders differently: footer.
- Footer (Patrick): link groups sit together after the logo, columns sized to content (`auto` ×4, `justify-content: start`, column gap `clamp(40px, 5vw, 80px)`); two columns under 900px with the brand full width. Was four fractional columns across the full width.
- `.vs-callout + .vs-tiers` gets 16px (they touched).

## 0.7.2 — 2026-09-30
- **FX group contexts:** `[data-group="adjust|degrade|distort|colour|signal|glitch|type|light|depth"]` sets `--gcol` (themes/themes.css, in both bundles). The group → colour map now lives in one place.
- **FX-family titles** (Patrick): `.vs-group-title` / `.vk-group-title` colour a family's title, effect names or effect-page title in its group colour. The second exception to the neutral site, after group chips.
- AGENTS.md: "chips are one colour" and "family titles take the family colour" (Patrick).

## 0.7.1 — 2026-09-30
- Icon PNGs are RGBA (were RGB; Next's .ico pipeline refuses RGB). Pixels unchanged.
- Site: `.vs-tags > li.vs-chip--group` takes the group colour (the tags rule outranked `.vs-chip--group`).
- AGENTS.md: the FX group → colour token map, so every consumer maps groups the same way.

## 0.7.0 — 2026-09-30
Consumers render differently: FX-group colours, chip centring, app focus ring.
- **FX-group colours LOCKED** (Patrick): all nine pass 4.5:1 as small text on panels. Six lifted in lightness only: amber `#b58d4c`, rust `#cd7f6e`, rose `#c67f93`, sage `#7b9c76`, teal `#6b9ca1`, slate `#8c94a3`, violet `#a386cb`. **Depth is lime `#b1e800`**: it no longer reuses PROCESSOR's aqua. Shipped in PROCESSOR v0.573.0.
- **FX-group chips use their group colour** (the one exception to the neutral site): app `.vk-chip--group` and new site `.vs-chip--group`, both via `--gcol`. Rest = border and text in the group colour; selected = filled with dark ink.
- **Chip labels centred**: `text-box: trim-both cap alphabetic` with `(1lh − 0.73em)/2` added back, so heights are unchanged; `.vs-beta` takes a 1px padding shift.
- **Focus ring in app themes**: `--focus-ring` resolved to aqua everywhere (a custom property resolves `var()` where it's declared). Each `[data-app]` now restates it, so the ring is the app's colour.
- **Icons**: `brand/icons/` website V3 (white on the ground), app V (dark ink on the app colour); SVG + PNG 32/180/512.

## 0.6.0 — 2026-09-30
Adds brand assets; no CSS changes for consumers.
- `brand/`: Patrick's logos. Master (wordmark + DIMENSIONAL FX), solo wordmark, and the PROCESSOR / KOMPOSITOR / DIMENSOR logos. All `fill: currentColor`; `brand/colour/` has the app logos with their locked colours baked in. Originals untouched in `brand/source/`.
- Rule: an app uses its app logo file, never the wordmark plus separate text. The master and solo marks are neutral. `brand/README.md`, AGENTS.md.
- Specimen: a Logos tab.

## 0.5.0 — 2026-09-30
**App colours locked** (Patrick). Consumers may render differently.
- PROCESSOR `#00e5a0`, KOMPOSITOR `#ff6a43`, DIMENSOR `#bb6fff`, each with hover, dim and a light-ground ink: tokens `--processor*`, `--kompositor*`, `--dimensor*` in `themes/themes.css`, which is now part of `dist/app.css` and `dist/site.css`. `data-app="…"` switches `--accent` / `--hover` / `--on-accent` / `--accent-ink`.
- DIMENSOR violet `#9d64ff` → `#bb6fff`: it failed 4.5:1 as small text (4.37 on the ground, 3.84 on panels). The hue moved slightly warmer to keep its intensity (OKLCH chroma 0.210 vs 0.220); it now passes 5.24 / 4.61, and dark text on it 5.54. The separate small-text violet is no longer needed.
- All three pass 4.5:1 as small text on the ground, wells and panels, and as a fill under dark text; each light-ground ink passes on #f4f4f4 and #fff.
- Site: `[data-app="kompositor"]` / `"dimensor"` sections now get their colours from the bundle (before, the bundle had no themes, so they fell back to aqua).

## 0.4.2 — 2026-09-30
Site layer renders differently: states.
- **One state system for every site button, link and pill** (Patrick): rest, hover (#cfcfcf), focus (2px ring in the element's own colour, 3px out), pressed (hover colour, 1px down), selected (filled / 2px bar), disabled (40%, no hover). One colour per element in every state.
- White outline buttons stay white-family inside app sections too; only `.vs-btn--signal` uses the app colour.
- Fixed mixed colours: filter chips, the beta pill (border, text and dot) and the video play button were a grey outline around differently coloured text. The focus ring was aqua everywhere, including neutral pages.
- Specimen: a state matrix, neutral and inside `[data-app="processor"]`.

## 0.4.1 — 2026-09-30
Site layer renders differently: outline buttons.
- **One colour per button** (Patrick): an outline button's border and text always match. `.vs-btn` is white (border + text); `.vs-btn--signal` is the signal colour (border + text), i.e. the app colour inside `[data-app]`. Hover moves border and text together. Before, inside an app section the text turned aqua while the border stayed grey.

## 0.4.0 — 2026-09-30
Consumers may render differently: the app layer takes PROCESSOR's new spacing.
- **App layer follows PROCESSOR v0.571.0 (Patrick's spacing pass):** buttons 8/14, `.vk-seg` gap 3 / margin 19, rows 26px and 3px apart, section heads 12/14, menus 14, layers 8 + 3. Core `--pad` 12 → 22, `--row-h` 28 → 26.
- Baselines: `baselines/processor` (v0.570.0 before), `baselines/processor-after` (v0.571.0), `baselines/compare` (before/after sheet), `baselines/fit` (1280 and 2375 wide).

## 0.3.0 — 2026-09-30
Consumers may render differently: square corners, a neutral site layer, underlined site links.
- Core: `--ctrl-edge #757575` (control outline, 3:1) and `--stroke 2px`. Site outline rule: buttons 5px, chips/tags/fields 2px. App layer: `.vk-tog`/`.vk-chip` 2px `--ctrl-edge`, roomier (settled); lands in the PROCESSOR spacing pass.
- **Core `--radius` 2px → 0: square corners everywhere** (Patrick 2026-09-30). PROCESSOR never applied the 2px, so the apps don't change.
- Site: every text link underlined by default (hover 2px); control outlines `--site-stroke` 3px in `#757575` (3:1, was 1px `#595959` at 2.3:1); input focus ring restored; `.vs-site a` reset lowered to `:where()` so link and button classes apply. Gradient callouts parked.
- Site layer is **neutral** (Patrick 2026-09-30): white only for links/buttons/active states; headings #b3b3b3, body #a3a3a3, muted #939393; `--site-signal` family replaces `--accent` on the site; `[data-app]` switches it to the app's colour. `--site-signal-ink` is now the ground (site v2's #04120d retires).
- Site callouts: app-coloured words on app pages (`[data-app]` + `<em>`); `.vs-spectrum` / `.vs-spectrum-bar` parked. `.vs-outline` dropped (hard to read).
- Themes (exploration): current picks KOMPOSITOR hot mandarin #ff6a43, DIMENSOR violet #9d64ff.

## 0.2.0 — 2026-09-29
- Layers: core (`tokens.css`) + app layer (`app/app.css`, 31 `vk-` components from PROCESSOR) + site layer (`site/site.css`, 38 `vs-` components and `--site-*` tokens from site v2). Rules in AGENTS.md.
- `dist/app.css` and `dist/site.css`: one pull per consumer.
- Specimen page built from the repo (`scripts/build-specimen.mjs`).
- Open decisions listed in AGENTS.md; values marked PROPOSED in the layers are not settled.

## 0.1.1 — 2026-09-29
- Foreground settled: `--tx-0 #f4f4f4`, neutral grey family (Patrick). No value changes from 0.1.0; site v2 drops `#f4f6f8`, `#c9cdd3`, `#a0a6ae`.

## 0.1.0 — 2026-09-29
- First extraction from PROCESSOR `index.html :root` (origin/main 4f170b9). Token names kept identical to PROCESSOR.
- Hover aqua settled: `--hover #3dffc2` (Patrick, 2026-09-29). Site v2's `#3bf0b8` retires.
- Added `--sans`, `--fs-*`, `--head-*`, `--row-h`, `--focus-ring` / `--focus-offset` (values taken from PROCESSOR rules, not new).
- App layout sizes (`--rail-w`, `--side-w`) stay in PROCESSOR; they're not shared.
- Open at the time: `--tx-0` neutral vs cool (settled in 0.1.1).
