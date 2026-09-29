# V3KTR design system — read this before any design work

Any session building UI for PROCESSOR, KOMPOSITOR, DIMENSOR or the site reads this file first.
Canon: `V3KTR-PROJEKT/00_ECOSYSTEM.md` §3 (brand) and §6; scope `V3KTR-PROJEKT/products/DESIGN-SYSTEM.md`.

## Hard rules
1. **Use tokens, never raw hex.** Every colour, radius, font and row height comes from `tokens.css` (`var(--…)`).
   If a value you need doesn't exist, add it HERE (new version), not in the app.
2. **Never hand-copy `:root`.** Apps pull `tokens.css` from a pinned release tag at build time (see README).
3. **One signal colour.** Aqua `--accent #00e5a0` on ground `--bg-0 #212121`, hover `--hover #3dffc2`, for every app. No per-app accents.
4. **Dark only.** No light mode or theming in v1.
5. A visual change to a live app ships with a before/after sheet.

## Type
- Manrope (`--sans`) for UI and headings; JetBrains Mono (`--mono`) for captions, controls and values (tabular numbers).
- Body 13px. Controls 11px mono UPPERCASE. Section heads: 11px / 700 / letter-spacing .16em, uppercase, `--tx-2`.

## Components (rules; reference CSS lands in `components/` in a later version)
- **Buttons:** mono, UPPERCASE, square (`--radius` 2px), `--bg-3` fill, 3 sizes. **No border** — only chips have borders.
  Primary = `--accent` fill + `--on-accent` ink; hover = `--hover` fill.
- **Chips:** the only bordered element: 1px `--ctrl-line`; hover turns border + text `--hover`.
- **`.tog` (state, not action):** transparent + `--ctrl-line` border + `--tx-2` when off; `--accent` fill + `--on-accent` when on.
  Use `.tog` for anything that latches; use a button for anything that fires once.
- **Rows / sliders:** `--row-h` 28px, label 11.5px.
- **Panels:** a lighter fill (`--bg-2`), never an outline.
- **Focus:** `outline: var(--focus-ring); outline-offset: var(--focus-offset)` on `:focus-visible`.
- **FX groups** are identified by the `--type-*` / `--depth` / `--adjust` colours, never by the signal aqua.

## Open decisions (don't settle these yourself)
- `--tx-0` white: `#f4f4f4` (neutral, current) vs `#f4f6f8` (cool, site v2). Patrick decides.
