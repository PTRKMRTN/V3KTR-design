# Changelog

Semver. Apps pin a tag; a major bump means a consumer may render differently.

## Unreleased
- Core: `--ctrl-edge #757575` (control outline, 3:1) and `--stroke 2px`. Site outline rule: buttons 5px, chips/tags/fields 2px. App layer: `.vk-tog`/`.vk-chip` PROPOSED 2px `--ctrl-edge` at the same outer size.
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
