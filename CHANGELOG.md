# Changelog

Semver. Apps pin a tag; a major bump means a consumer may render differently.

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
