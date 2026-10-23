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
| **4–12 options that look different** | **tile grid** | Poly seed, Thorns shape, Spikes formula, Text path kind |
| a few options, long names, no visible difference | select | Blend mode, frame rate |
| 13+ content items, searchable | Library cards + chips + search | Materials, Looks, Environments |
| a result list to scan | rows with a thumb | stack presets, saved looks |
| a colour or gradient | swatch (its own fill is the content) | palette strip |

**When a dropdown becomes a tile grid:** 4–12 options **and** at least ~70% of them are visibly different at 84px. If the
renders would look alike (a shade of grey, a number), it stays a select. Over 12 it is not a tile grid, it is the Library.
A **Mode** (one primary variant selector) is the usual tile-grid candidate; a **Preset** (sets many controls) is a card.

## 3. Sizes (all against the 400px side panel, 22px insets, so 356px of content)

| Size | Where | Picture | Columns | Label |
|---|---|---|---|---|
| **S tile** | dense pickers (a seed, 12+ options) | 1:1, ~56px | 6-up | tooltip only |
| **M tile** | param mode selectors | 1:1, 84px | 4-up | 9px under the picture |
| **L card** | Library, presets | 4:3, ~115px | 3-up (2-up in a narrow panel) | 9px under the picture |
| **Row thumb** | lists, results | 1:1, 28px in a 34px row | n/a | the row's title + one muted line |

Gap 6px everywhere (the existing `.vk-thumb--card` rhythm). One component: **`.vk-thumb--card`** (exists), plus a grid
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

1. Tile rule: **4–12 options and visibly different**, else a select (§2). Yes.
2. Sizes S 56 / M 84 / L card, 6px gap. Yes. **Poly's 18 seeds are S tiles** (6-up, name as a tip).
3. Colourless grey renders by default, colour only where colour is the content (§4). Yes.
4. `--true-colour` selection for colour-content tiles (§8.3). Yes.
