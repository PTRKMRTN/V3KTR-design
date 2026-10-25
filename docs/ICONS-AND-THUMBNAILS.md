# Icons and thumbnails: one system (PROPOSAL, 2026-10-23)

> Status: **DECIDED by Patrick 2026-10-23** (the four rules in §10, Poly = S tiles). **Mockups only for now:** the CSS in §8 is NOT built and no app integrates until Patrick says so.
> Brief: DIMENSOR control session, at Patrick's request. Mock: `docs/icons-thumbnails-mock.html`
> (built by `scripts/build-icons-thumbs-mock.mjs`; sheet `V3KTR-COWORK/reports/design-icons-thumbnails-mock-2026-10-23.png`).
> The pictures in the mock are grey stand-ins; real thumbnails come from each app's engine.

## 1. The split

| | Icon | Thumbnail |
|---|---|---|
| What it is | **drawn** once, monochrome, `currentColor` | **rendered** by the app's own engine from the thing itself |
| Stands for | an action, a category, an object kind | a piece of content you pick: a preset, a mode, a material, a look, an environment |
| Colour | a token (state colour, or the FX group colour) | grey by default; colour only where colour IS the content |
| Where it lives | this repo (`icons/`), pulled by tag | the app; this repo holds only the **rules** and the CSS |
| Cost | none | a render, so lazy and cached |

Test, in order, for any choice the person makes:
1. Is it an **action or a kind of thing**? → icon (+ label).
2. Do the options have a **look that words can't carry in a second**? → thumbnail.
3. Otherwise → text (a segmented control for 2–3, a select for the rest).

## 2. Which control gets what

| The choice is | Use | Example |
|---|---|---|
| an action or verb | icon + label in menus; icon-only + tip in toolbars | Save, Export, Lock |
| a category or object kind | icon, group colour via `currentColor` | FX rail, stack row, Add catalogue |
| 2–3 options, words say it | text segmented control | Linear · Radial · Spiral |
| **4–20 options that look different** | **tile grid** | Poly seed, Thorns shape, Spikes formula, Text path kind |
| a few options, long names, no visible difference | select | Blend mode, frame rate |
| 21+ content items, searchable | Library cards + chips + search | Materials, Looks, Environments |
| a result list to scan | rows with a thumb | stack presets, saved looks |
| a colour or gradient | swatch (its own fill is the content) | palette strip |

**When a dropdown becomes a tile grid:** 4–20 options **and** at least ~70% of them are visibly different at 84px. If the
renders would look alike (a shade of grey, a number), it stays a select. Over 20 it is not a tile grid, it is the Library. (**Raised from 12 to 20 on 2026-10-25**: PROCESSOR's Dither Palette (17, plus its two depth-plane twins) and ASCII Charset (19) read fine in `.vk-tilegrid` at 3 rows of 6 in the 400px panel and Patrick signed them off, "much better, lock n load". Sheet: `V3KTR-COWORK/reports/tile-survey/dither-ascii-before-after.png`. The 70% rule still applies: at 19 a few ASCII charsets are close to alike at small size, which is the limit, so a selector of that size needs the figure chosen so the options differ.)
A **Mode** (one primary variant selector) is the usual tile-grid candidate; a **Preset** (sets many controls) is a card.

## 3. Sizes (all against the 400px side panel, 22px insets, so 356px of content)

| Size | Where | Picture | Columns | Label |
|---|---|---|---|---|
| **S tile** | dense pickers (a seed, 12+ options) | 1:1, ~56px | 6-up | tooltip only |
| **M tile** | param mode selectors | 1:1, 84px | 4-up | 9px under the picture |
| **L card** | Library, presets | 4:3, ~115px | 3-up (2-up in a narrow panel) | 9px under the picture |
| **Row thumb** | lists, results | 1:1, 28px in a 34px row | n/a | the row's title + one muted line |

**Fill-width rule (from DIMENSOR's LIB2, 2026-10-23):** the sizes above are **minimums**, not fixed columns. A tile grid is `repeat(auto-fill, minmax(var(--tile-min), 1fr))` with the minimum S 52 / M 78 / L card 108, so the number of tiles per row adapts to the panel width and the tiles **stretch to fill the row evenly with no ragged space on the right**. At the standard 356px content width that gives exactly 6 / 4 / 3 columns (S 54px, M 84px, L ~115px), so the table is what you see at the default width and a narrower or wider panel changes the count, not the gap. Gap 6px everywhere (the existing `.vk-thumb--card` rhythm). One component: **`.vk-thumb--card`** (exists), plus a grid
container and two shape modifiers (§8). Selected/hover/empty behave exactly as `.vk-thumb--card` does today.

## 4. Thumbnail rendering rules (so thumbnails made by scripts stay consistent)

1. **Subject:** centred, filling ~80% of the frame, never cropped; the same camera per **category**, not per item (all
   materials on one sphere, all lights on one diagram, all seeds three-quarter view).
2. **Ground:** `--bg-3` (`#3a3a3a`), flat, so a tile sits on a `--bg-2` panel and a transparent subject reads. No gradient floor.
3. **Light:** one fixed three-point rig per category; **no app colour in any render** (a render never takes `--accent`).
4. **Colourless by default** (DIMENSOR D15): grey subject unless the colour is what is being chosen (materials with a
   colour, palettes, skies). A render never invents colour to look nicer.
5. **Size:** render at 2× the largest display size for the category (M tile 168px, L card 240×180, row 56px); WebP, ~4–12 KB.
6. **Dark only:** one background, no light variant.
7. **Scripted renders:** a manifest per category (`id`, params, camera preset), one render harness per app, and a **cache key
   = hash(engine version + params + camera preset)**; a thumbnail is rebuilt only when its key changes.
8. **Loading:** never on the first-load path. Lazy (`IntersectionObserver`), cached (IndexedDB by key), the shared **X**
   (`.is-empty`) until the picture lands, a transparent 1×1 until then (never a src-less `<img>`). An app that cannot render
   on a given device shows the X permanently and the label carries the choice; the control still works.

9. **Fit and padding (DIMENSOR LIB2):** a tile's drawing is scaled to FIT a padded box: **3–4px inner padding**, `object-fit:contain`, so the drawing's longer axis touches the padding, measured on the actual ink, not the canvas; the same in every tile of a grid so a row reads at one visual size. Applies to drawn and rendered tiles alike.
10. **One ground for all tiles** in a grid or Library (rule 2): no per-tile blue, black or white grounds.
11. **Drawn thumbnails** (a lighting diagram, a gobo, a path kind) are *drawn*, not rendered: monochrome, the one lit or active element in `--accent`, everything else greys. They follow the same fit, ground and size rules.

## 5. Icons

- **Language (unchanged, now written once for everything):** 24 grid, **1.4 stroke**, round caps and joins, no fills,
  `currentColor`, no corner radius (square, like the UI). Source files: `icons/menu-icons.js`, `icons/style-icons.js`;
  **a new verb or kind is drawn in this repo first.**
- **Sizes:** 14 menus and rows · 16 buttons and chips · 20 toolbars · 24 rail tiles (in a 40px tile). One drawing, scaled;
  the stroke scales with it, so a 14px icon is a light line (its job is to be a hint beside a label).
- **FX icons:** the same language with per-shape opacity for depth, tinted by the family colour through `currentColor`. They
  live in PROCESSOR's registry today; they are promoted into this repo **when a second app needs them** (DIMENSOR already
  carries its own set), the same rule as every other promotion. Gradients on icons were tried and parked (Patrick 2026-10-14).
- **Pairing with a label:** icon left, `gap:9px`, label always present in menus and rows (it is the `.vk-menu-ic` column rule).
  An icon-only control always has `data-tip` + `aria-label`.
- **States:** rest `--tx-2` · hover `--tx-0` · on = `--accent` text colour only (the standing exception: small icon toggles
  never fill) · disabled 40% · locked = the `.vk-lock` marker, top right. Selected row: `--tx-0` (v0.41.18).
- **Icon backlog (DIMENSOR D49):** every tile in an Add-rail group has a unique icon; four are placeholders to redraw here first: **gradient, picture, fog, glb** (point, area, sun, bounce, flag, reflection reuse existing drawings). A new kind is drawn in this repo, then used in the app. Rail group colours stay as they are (Patrick 2026-10-23): FX group colours tint the rail icons, the selected rail fill, the group chips, the stack row icons and the panel title icon.
- **Group colour:** an FX-family or object-kind icon takes `--gcol` from the group map (AGENTS.md); no other icon is coloured.

## 6. Accessibility

- A tile grid is a `role="radiogroup"` of `role="radio"` tiles (`aria-checked`, roving `tabindex`, arrows move, Space/Enter
  choose), each with an `aria-label` = its name and a `data-tip`. The thumbnail image is decorative (`alt=""`); the name is
  the accessible label, so a tile that failed to render is still operable.
- Contrast: the label sits on `--bg-2` in `--tx-1` (passes); selected label is `--on-accent` on `--accent` (passes, existing).
- Focus: the shared 2px ring, plus the label tint, on `:focus-visible`.
- Icon-only controls: `aria-label` + tip (the T1 tip already opens on keyboard focus).

## 7. File layout and how apps pull it

- **Icons:** `icons/` (exists). Add `icons/fx-icons.js` only when promoted (above). Pulled by tag like the rest.
- **Thumbnails:** not stored here. This repo holds **this doc, the CSS and `interactions/` helpers** (a lazy-thumb loader
  `lazyThumbs(root, { render, key })` with the cache and the X, to be extracted from DIMENSOR's start-up thumbnail code
  once LIB1 lands, not before: lift from a shipped second use, as with the asset browser shell).
- **Tokens:** no new colour tokens. New sizing tokens only if two apps need the same number: `--tile-s/-m/-l` (56 / 84 / fills).

## 8. What needs adding to the CSS (small; NOT built: waits for Patrick to say integrate)

1. `.vk-tilegrid` — `display:grid; grid-template-columns:repeat(var(--cols,4),minmax(0,1fr)); gap:6px`.
2. `.vk-thumb--sq .vk-thumb__pic{aspect-ratio:1}` and `.vk-thumb--wide .vk-thumb__pic{aspect-ratio:4/3}`.
3. **`.vk-thumb--true-colour`** (the finding from the mock): today a *selected* thumbnail recolours its picture to the app
   hue (`mix-blend-mode:color`). For tiles whose **colour is the content** (the Gold material in the mock, a palette, a sky)
   that hides what you chose, exactly the exception the chip rule names for swatches. On `--true-colour`, selected = the
   solid label + the check, **no blend on the picture**. Everything else keeps today's wash.
4. Optional later: `lazyThumbs()` (above).

## 9. Use cases per app

| App | Icons | Thumbnails |
|---|---|---|
| **DIMENSOR** | Add rail + catalogue, stack rows, top bar, menus | Poly seed / Thorns shape / Spikes formula / Text path kind (M tiles); Library cards for Materials, Lighting, Environment, Looks, Presets (L cards); stack presets (rows) |
| **PROCESSOR** | FX rail (24 in 40, group colour), menu, rows | Looks grid (exists); any Mode whose options differ visibly (Dither pattern, Halftone shape, Blend preview) as M tiles |
| **KOMPOSITOR** | Style icons, left-side tabs, menus | Transitions, Looks, Media, Text presets (exist as `.vk-thumb--card`); Style cards could gain a thumb |

## 10. Decisions (Patrick, 2026-10-23)

1. Tile rule: **4–20 options and visibly different**, else a select (§2). Yes.
2. Sizes S 56 / M 84 / L card, 6px gap. Yes. **Poly's 18 seeds are S tiles** (6-up, name as a tip).
3. Colourless grey renders by default, colour only where colour is the content (§4). Yes.
4. `--true-colour` selection for colour-content tiles (§8.3). Yes.

## 11. How this applies to PROCESSOR and KOMPOSITOR (mock: `docs/icons-thumbnails-mock-apps.html`)

Real option names from the apps' source; pictures in the mock are stand-ins.

**PROCESSOR.** Icons: already on the language (FX rail, menus, rows). Tiles for a Mode, by the §2 rule:
- **Tile candidates:** Halftone *Shape* (Dot/Line/Cross/Square), Hatch *Mode* (7), Reflections *Material* (6, true colour), Glass (4), Infill (7), Reaction *Preset* (6), Shape (7), Device (8).
- **Stay a select or text:** Dither *Algorithm* (12 options, nearly alike at 84px), Channel (RGB/Luma/R/G/B), Ray Count, Range, Colour (Mono/Source/Duo/ANSI), Snap.
- **The one real difference:** in PROCESSOR the image is the seed, so a Mode tile is the effect applied to a picture. Proposal: render on a built-in grey test figure (instant, same in every session, cached per effect version); "preview on my image" can come later as an option. The Looks grid already exists as `.vk-thumb--card` and converges on the shared grid.

**KOMPOSITOR.** It is furthest along: Looks, Media, Text presets and Transitions are already `.vk-thumb--card` tiles with live-rendered canvases (320×180 shown at half, so already "2×"). What it gains:
- **New tiles:** Light leak *kind* (7: Edge bloom, Burn, Prism edge, Anamorphic streak, Lens flare, Sun glare, Beat flash; true colour) and Background presets.
- **Stays as it is:** Style (8 project styles) stays icon cards: a style is a way of working, not a picture you pick.
- **Convergence:** the shared grid at a 6px gap (its Text presets grid is 8px today) and a **16:9 shape modifier** (`.vk-thumb--video`), which the proposal's §8 did not list and needs.

**What the three apps share:** the same CSS (§8, plus `--video`), the same rule for tile vs select vs Library, and the same true-colour selection for colour-content tiles. Icons need nothing new.

## 12. Input from DIMENSOR (2026-10-23), treated as input to the system

Shipped on DIMENSOR staging and decided by Patrick: D48 (Library = choosing, params = editing; chips Materials · Presets · Lighting · Environment · Looks · Stacks; Presets = 44 `.vk-thumb--card` cards filtered by the selected object's kind; Looks = whole scenes only), D49 (Add rail adds a thing, the Library picks variants; Environment 4, Lights 7, Atmosphere 3, Ground 3 tiles, each with a unique icon), mode tiles (`src/ui/modetiles.js`: Poly seed, Thorns Shape, Spikes Formula, Text Path, Fog look, Particles preset). Built into this proposal: the fill-width rule (§3), fit and padding (§4.9), one ground (§4.10), drawn thumbnails (§4.11), the icon backlog (§5).

How DIMENSOR's open points resolve against the decided rules:
- **Tile sizes vs "fill the row":** resolved by the fill-width rule: sizes are minimums, columns adapt, tiles stretch evenly (§3).
- **Fit/padding:** a rendering rule (§4.9), not an app one.
- **Colour tint on selected mode tiles:** DIMENSOR's mode tiles use today's colour blend. For tiles whose colour is the content (materials, lighting, environment pictures, Demoscene) the decided rule replaces it with true colour (label + check); **grey-render mode tiles keep the colour blend**, which is exactly what it was designed for.
- **Params-head tools (Reset / Randomise / Options):** use `.vk-btn--compact` (v0.41.31, already released; it is PROCESSOR's tool-row size).
- **Greyscale chrome, lighting diagrams in `--accent`, white group titles in chips:** consistent with §4 and §4.11.
- **Still open (not decided, Patrick's):** nothing new from this note; the CSS in §8 (plus `--video` for KOMPOSITOR's 16:9 tiles) waits for his go to integrate.

## 13. Decided 2026-10-23/24: how thumbnails are rendered (PROCESSOR first)

Patrick's decisions after the icon and tile rounds (marks stored in the Icon marking artifact; rendered set in `V3KTR-COWORK/reports/tile-rollout/`):

- **Icons.** FX icons: **today's icon stays** where it was already marked good (Blur, Curves, Datamosh, Dither, Halftone, Reaction, Split Tone); **V1 refined line** wins for Anamorphic Flare, ASCII, Bloom, Braille, Depth Fog, Duotone, Grain, Kaleidoscope, Pixel Sort, Point Cloud and Scanlines; **V2 dot-matrix is dropped** (too similar across the set, and unreadable at 14px). Roll-out to the other ~70 icons is pending his go.
- **The test figure is one bevelled isometric cube** (`test-cube.png`), square, no border, the FX run over the top of it. **No loose interpretation:** an effect is never tuned until it rebuilds the picture into a new composition (Kaleidoscope was left out for that reason); a mirroring or tiling effect must keep the cube recognisable or is not tiled.
- **Never black.** The darkest value in any tile is the UI dark grey `#3a3a3a` (the tile ground). Implemented as a floor clamp (`LEVELS=floor`), not a lift, so the ground stays `#3a3a3a` and contrast is kept.
- **Grid, when needed.** A diamond grid on the cube's ground (`test-cube-grid2.png`): cells 4–5× the round-3 size (about 1.7 across), lines about `#5e5e5e`, 2px, fading toward the edge. Decided **per selector**: grid where the effect leaves large flat ground where it visibly does nothing (displace, warp, pixelate, pattern, point-cloud style); the plain cube otherwise. The metals look better on the plain cube (the grid shows through them as an embossed lattice).
- **Tile preview scale.** Where fine dots or thin lines define an effect, its texture parameter is overridden coarser **only when rendering a tile** (raw values beyond the slider range are accepted by the engine): Halftone cell 1.5, Machine spacing 1.5 + weight 0.5, Slicer spacing 1.5, Block Mosaic size 2.5, Display pitch 1.0, and so on, kept in `tile-rollout/config.json`. Shading-led effects (Reskin, Glass, Warp, Databend, Hardware) stay at defaults. A full "half as fine again" (2.0) dissolves the cube, so 1.5 is the working ceiling.
- **Square, no border.** Tiles are plain 168×168 squares: no rounded corners, no outline baked in or drawn around them.
- **Which selectors are tiles.** Of 38 candidate selectors rendered, **19 qualify**: Halftone Shape (drawn pictograms preferred), Machine Mode, Reskin Material, Glass, Slicer Infill, Display Device, Pattern Mode / Shape / Lattice, Block Mosaic Style, Point Cloud Shape / Field, Scanlines Mode, Long Exposure Mode, Scan Glitch Mode, Databend Mode, Domain Warp Field, Hardware Device, Moiré Grating. **19 are rejected** (options alike, or they rebuild the picture): see `tile-rollout/notes.md`. A selector qualifies only if its options are distinguishable at 84px.
- **Still weak:** Machine Flow ≈ Circuit, Reskin Chrome ≈ Liquid Metal and Obsidian ≈ Studio Chrome, Point Cloud Digits is nearly empty, Hatch is dim; the dot/line modes in Machine remain fine at 84px.
- **Two more test figures, for selectors where the cube hides the point (PROCESSOR, 2026-10-25).** A **full-range figure** (a tone ramp from black to white, for dither and palette selectors whose look is the range of values) and a **colour figure** (a hue sweep, so a colour palette shows its colours). The cube stays the default; use these only where the cube cannot show the difference. Raised the tile limit to 20 (section 2).
- **Reproducible:** `node tile-rollout/render.mjs` rebuilds every tile from the engine and `config.json`; the engine is driven headless in about 3 minutes for all selectors. This is the harness PROCESSOR will own when it integrates; nothing is integrated yet (mockups only, Patrick 2026-10-23).

## 14. The final FX icon set (Patrick, 2026-10-24)

Pilot + roll-out marks resolved into one set of **94 FX icons: 43 changed (11 pilot winners + 32 roll-out redraws), 51 stay as today**. All 43 are `currentColor` only, viewBox 24, no gradient / filter / text / rounded rect (linted); one gradient-using icon (Gradient Map) is gone. Files and manifest (key, name, group, source per icon): `V3KTR-COWORK/reports/final-fx-icons/` (`icons/<file>.svg`, `manifest.json`, `overview.png`, `assemble.mjs`). The source of truth for the app is PROCESSOR's `const I` dict in `index.html`; the downstream chain is `V3KTR-PROJEKT/scripts/export-fx-icons.mjs` then `V3KTR-WEBSITE-NEXT/scripts/sync-fx-icons.mjs` (the site's FX catalogue). Rejected redraws (kept as today): Compression, Depth Shatter, HSV, Levels, Motion Blur, Pixel Stretch, Sharpen, and Dla take 1 / Liquid take 2 (the other take of each was chosen).
