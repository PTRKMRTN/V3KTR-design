# Brand assets

From Patrick, 2026-09-30. `source/` holds his files exactly as supplied; the files here are derived from them.

| File | What | Where |
|---|---|---|
| `logo-v3ktr.svg` | Master: wordmark + DIMENSIONAL FX | the site, socials, anything about V3KTR as a whole |
| `logo-v3ktr-solo.svg` | Wordmark only | where the tagline won't fit or reads too small |
| `logo-v3ktr-processor.svg` | PROCESSOR logo: wordmark + app name, one file | PROCESSOR, and PROCESSOR's section/card on the site |
| `logo-v3ktr-kompositor.svg` | KOMPOSITOR logo | KOMPOSITOR |
| `logo-v3ktr-dimensor.svg` | DIMENSOR logo | DIMENSOR |
| `colour/logo-v3ktr-*.svg` | The app logos with their locked colour baked in | where CSS can't set a colour (email, a standalone `<img>`, exports) |

**Sizing.** The master and solo files share the same viewBox (1377×537) and the same outer bounds: the DIMENSIONAL FX line sits inside the wordmark's box. Sized by height, both give the same wordmark size; the master is not taller.

**Colour.** Every file in this folder uses `fill: currentColor`, so it takes whatever colour it's placed in:
set `color` on the element (inline SVG), or use the file as a CSS mask over `background-color` (as PROCESSOR does).
The master and solo marks are neutral: white (`--tx-0`) or grey (`#a3a3a3`) on the dark ground, or any colour a context needs.
App logos take their app colour: `color: var(--accent)` inside `[data-app="…"]`, or the `--processor` / `--kompositor` / `--dimensor` tokens.

**Rules.**
- An app uses its **app logo file**. Never rebuild it from the wordmark plus separate text: the lockup's spacing and type are part of the mark.
- Don't recolour an app logo to another app's colour, and don't put an app colour on the master or solo mark (the V3KTR brand is neutral).
- Don't redraw, stretch or outline any mark. Scale it with its viewBox.
