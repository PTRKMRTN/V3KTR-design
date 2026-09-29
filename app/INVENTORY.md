# V3KTR app layer: inventory (v0.2.0)

Source: the PROCESSOR `<style>` block (1234 lines, the current origin/main extract). Markup context came from the local
`V3KTR-PROCESSOR/index.html`, which is **older** than that extract: `.signup-note` and `.beta-tag` are not in it.
All values in `app.css` are copied from PROCESSOR. Colours, fonts and row height go through core tokens; the `--app-*`
tokens at the top of `app.css` hold the values core lacks.

## (a) Components

The three button sizes are PROCESSOR's own. They are named in the comment above `.gen-btn` and tagged `/* LARGE | REGULAR | SMALL */` on each rule:

| Size | Metrics | PROCESSOR classes |
|---|---|---|
| **Large** | 8px 14px · 11px · .04em · `transition:all .12s` | `.gen-btn` |
| **Regular** | 5px 10px · 11px · .04em | `.inline-btn`, `.looks-act-btn`, `.rz-btn`, `.crop-bar-btn`, `.topbar .btn`, `.dlr-btn`, `.ui-btn`, `.mask-btn`, `.param-tools .inline-btn` |
| **Small** | 3px 7px · 9px · .06em | `.inline-btn.sm`, `.layer .lmask`, `.seg.mask-cmb button` |

| vk class | PROCESSOR selector(s) | Notes |
|---|---|---|
| `.vk-app` | `html,body` | Base ground, sans font, 13px, antialiased. |
| `.vk-mono` | `.mono` | Mono font with tabular numbers. |
| `:focus-visible`, `.is-focus` | `:focus-visible` | Uses the core `--focus-ring` / `--focus-offset`. |
| `.vk-btn` (Regular) | shared mono/UPPERCASE rule + the Regular list above | bg-3, no border, hover = `--hover` fill + `--on-accent`. |
| `.vk-btn--lg` | `.gen-btn` | Large. The only size with a transition. |
| `.vk-btn--sm` | `.inline-btn.sm`, `.layer .lmask`, `.seg.mask-cmb button` | Small. |
| `.vk-btn--primary`, `.vk-btn.is-on` | `.looks-act-btn.active`, `.motion-play.on`, `.layer .lmask.on`, `.vp-tool[aria-pressed=true]`, `.txt-action.on` | PROCESSOR has **no primary class**. Its accent fill means "this is on". The hover-to-`--hover` fill follows AGENTS.md and `.inline-btn.tog.on:hover`. The other PROCESSOR on-states ignore hover. |
| `.vk-btn--ghost` | `.rz-btn.ghost`, `.crop-bar-btn.ghost`, `.ui-btn.ghost` | Label goes to `--tx-2`; the fill stays. |
| `.vk-btn--bare` | `.inline-btn.ghost` | Transparent until hover. |
| `.vk-btn--danger` | `.ui-btn.danger` | `--danger` fill with `--app-danger-ink`. Hover adds `brightness(1.08)`. |
| `.vk-btn:disabled`, `.is-disabled` | `.gen-btn.disabled`, `.motion-step:disabled` | Opacity .38. |
| `.vk-tog` (+`.is-on`, `[aria-checked]`) | `.inline-btn.tog`, `.tog.on`, `.tog.on:hover` | A latched state. Uses Regular metrics plus a 1px `--ctrl-line` border, so it is 2px taller than a Regular button. |
| `.vk-roll-group` | `.roll-group`, `.roll-group .tog+.tog` | A bg-2 tray: Randomise plus its latches. |
| `.vk-btn-row` | `.param-tools`, `.gen-toolrow`, `.btn-row` | A left-aligned wrapping row with a 6px gap. |
| `.vk-seg` (+`--sm`) | `.seg`, `.seg button`, `.seg button.on`, `.seg.mask-cmb button` | Options have no letter-spacing. The on option does not react to hover. |
| `.vk-chip` | `.filter-chip`, `:hover`, `.active` | The only bordered control. |
| `.vk-chip--group` | `.rail-chip`, `.rail-chip.on` | The on state takes the FX-group colour from `--gcol`. |
| `.vk-row` (+`--action`, `__label`) | `.blend-row`, `.col-row`, `.col-row:hover`, `.blend-label` | A 28px bg-3 row. |
| `.vk-tog-row` | `.tog-row`, `.tog-row span` | |
| `.vk-switch` | `.switch`, `::after`, `.on` | Square, 30×16. |
| `.vk-scrub` (`__fill`, `__label`, `__val`) | `.scrub`, `.fill`, `.s-label`, `.s-val` | `--fill` holds the value. `--tcol` is set in the markup but no rule reads it. |
| `.vk-sec-head` | `.panel-head`, `.explorer-head`, `.rail-label` | Type only; padding stays with the container. |
| `.vk-sec-label` | `.sec-label`, `.gen-secname` | |
| `.vk-sec-sub` | `.sec-sub` | |
| `.vk-group-label` | `.rail-group-label` | Uses `--gcol`. |
| `.vk-micro-label` | `.looks-group-label`, `.mi-group-label` (type) | |
| `.vk-tabs` / `.vk-tab` | `.ws-tabs`, `.ws-tab`, `:hover`, `.active` | |
| `.vk-menubar` | `.topbar` | Flex and gap only. The 36px height comes from PROCESSOR's grid row. |
| `.vk-menu`, `.vk-menu-pop`, `.vk-menu-item`, `-kbd`, `-sep`, `-label`, `-check`, `--checks` | `.menu`, `.menu-pop`, `.mi`, `.mi-kbd`, `.mi-sep`, `.mi-group-label`, `.mi-check`, `#menuImage .mi` | |
| `.vk-select` | `.blend-select` | A 22px select inside a row. |
| `.vk-select--block` | `select.ctl` | 28px, full width. |
| `.vk-select--transport` | `.mfps-select` | 30px. |
| `.vk-cs` (`__trigger`, `__list`, `__opt`, `--up`) | `.cs-wrap`, `.cs-trigger`, `.cs-list`, `.cs-opt`, `.cs-up` | Themed dropdown. |
| `.vk-input` (+`--mono`, `--inline`) | `input.ctl`, `.text-input`, `.inline-field` | Focus tints the border to `--accent-dim` and keeps the ring (see drift). |
| `.vk-scrim` | `.ui-overlay` | |
| `.vk-modal` (+`--danger`, `__title`, `__msg`, `__actions`) | `.ui-card`, `.ui-title`, `.ui-msg`, `.ui-actions` | The branded confirm/alert dialog. |
| `.vk-toast` (+`--pinned`, `__dot`) | `.depth-status`, `.ds-dot` | PROCESSOR has **no toast class**. This non-blocking status pill is the closest match. |
| `.vk-note` (+`--pinned`, `__go`) | `.signup-note`, `a.sn-go` | The post-export footnote. The specimen copy is a placeholder because the real markup is not in the local checkout. |
| `.vk-tip` | `.rail-btn .tip` | Tooltip. JS sets its position (`position:fixed`). |
| `.vk-panel` (+`--float`) | `.crop-bar`, `.canvas-controls` | A bg-2 fill with no outline. |
| `.vk-layer` (`__icon`, `__name`) | `.layer`, `.licon`, `.lname`, `.layer.active`, `.hidden-layer` | FX stack row. `.motion-item` uses the same pattern. |
| `.vk-kbd` | `.kbd` | |
| `.is-inline` | none (specimen helper) | Renders a floating surface in normal flow. |

## (b) Drift: raw colours in processor-style.css that are not core token values

The `:root` block is excluded. Counts are occurrences.

| Value | # | Selectors | Suggestion |
|---|---|---|---|
| `rgba(0,0,0,0.6)` | 9 | `.menu-pop`, `.cs-list`, `.cp-pop`, `.crop-bar`, `.ui-card`, `#gpuCanvas` (shadows); `.look-del` (bg); `.cp-cursor`, `.cp-hcursor` (ring) | Promote to core as a shadow token (`--shadow-pop`). Already `--app-shadow-pop`, `-modal` and `-float`. |
| `#262626` | 4 | `.menu-pop`, `select option`, `.cs-list`, `.cp-pop` | **Promote to core as `--bg-pop`.** It is a real surface step between bg-0 and bg-2. Currently `--app-pop-bg`. |
| `#282828` | 4 | `#gpuCanvas`, `.refine-canvas` (transparency checker) | Keep as a canvas-only app token. |
| `#fff` | 4 | `.cp-area`, `.cp-cursor`, `.cp-hcursor`, `.rl-tag` | Keep literal: the colour picker is functional and `.rl-tag` uses difference blending. |
| `rgba(0,0,0,0.55)` | 3 | `.look-card .look-motion`, `.tf-handle`, `.sc-overlay` | Collapse into the shadow and scrim tokens. |
| `rgba(0,0,0,0.5)` | 3 | `.depth-status`, `.canvas-controls`, `.sc-panel` | Collapse into the shadow tokens. `.depth-status` uses it as `--app-shadow-toast`. |
| `rgba(255,90,60,0.6)` | 2 | `.motion-timeline .mt-head`, `.vt-bar .vt-head` | ⚠️ An orange-red glow on the aqua playhead, probably left over from an old accent. Suggest `--accent-glow`. This is a visual change, so it needs a before/after. |
| `#ff6b6b` | 2 | `.look-del:hover` | ⚠️ Near-miss of `--danger #ff5b5b`. Use `--danger`. |
| `rgba(0,0,0,0.7)` | 2 | `.rz-card`, `.dlr-card` | These are older modal cards. Converge on `.ui-card`'s shadow. |
| `rgba(255,255,255,0.18)` | 2 | `.cp-swatch`, `.col-swatch` | Near-miss of `--ctrl-line` (.20). Use `--ctrl-line`. |
| `#d4b347` / `#d4823b` / `#d44a3b` | 2 each | `#statCost.t-*`, `#statGpu.t-*` | A cost-tier warn scale. Suggest core `--warn-1/2/3`, or keep as app tokens. |
| `#e0a33a` | 1 | `.stat-fps.short` (fallback of the undefined `--warn`) | Belongs with the warn scale above. `--warn` is referenced but never defined. |
| `#8a8f96` | 1 | `.corner-hint` (fallback of the undefined `--muted`) | ⚠️ A **blue-tinted grey**, which breaks the settled no-blue-greys rule. Use `--tx-2`. |
| `rgba(8,9,11,0.8 / 0.66 / 0.88 / 0.97 / 0.72)` | 5 | `.rz-overlay`, `.crop-rect`, `.dlr-overlay`, `.nogpu-gate`, `.ui-overlay` | One blue-tinted near-black at five alphas. Suggest one core `--scrim`, neutral (`rgba(0,0,0,…)`) or kept as is, with at most two strengths. `.ui-overlay` is `--app-scrim`. |
| `rgba(15,17,19,0.86)` | 1 | `.depth-status` | Blue-tinted as well. Keep as `--app-toast-bg` or neutralise. |
| `#616161` | 1 | `.lb-node`, `.vp-node` | Keep as an app token (control-node grey). |
| `#1d1d1d` | 1 | `.canvas-wrap` | Keep as an app token (canvas well). |
| `#363636` | 1 | `#gpuCanvas`, `.refine-canvas` | Keep (checker pair with `#282828`). |
| `rgba(0,0,0,0.85)` | 1 | `.vp-overlay svg` (drop shadow) | Keep: it is for handle legibility. |
| `rgba(0,0,0,.45)` | 1 | `.signup-note` | `--app-shadow-note`. Collapse into the shadow tokens. |
| `rgba(0,0,0,0.4)` | 1 | `.iso-label` | Collapse into the shadow tokens. |
| `rgba(0,0,0,0.3)` | 1 | `.rail-btn .tip` | `--app-shadow-tip`. |
| `rgba(255,255,255,0.1)` | 1 | `.preset` | Could become `--ctrl-line`, but that is a visual change. |
| `rgba(255,255,255,0.35)` | 1 | `.ramp-stop::before` | Keep (stop halo). |
| `#1a0606` | 1 | `.ui-btn.danger` | Promote to core as `--on-danger` (the ink that sits on the danger fill). Currently `--app-danger-ink`. |
| `#000`, `#f00`, `#ff0`, `#0f0`, `#0ff`, `#00f`, `#f0f`, `#ff0000`, `rgba(0,0,0,0)`, `rgba(255,255,255,0)` | 1–2 | `.cp-area`, `.cp-hue` | Keep literal: the picker's hue and saturation gradients are functional. |

Raw hex that **equals** a core value but should be written as `var()`:

| Value | # | Selectors | Fix |
|---|---|---|---|
| `#cfcfcf` (as `%23cfcfcf`) | 5 | `.mfps-select`, `.mr-row select`, `select.ctl`, `.blend-select`, `.cs-trigger::after` (chevron data-URI) | A data URI cannot use `var()`, so it is one shared `--app-chevron`. |
| `#3a3a3a` | 4 | `.ramp-bar` (checker) | `var(--bg-3)` |
| `#212121` | 3 | `.lb-guide`, `.lb-ring`, `.vp-cross` | `var(--bg-1)` (the comment says "panel bg colour"). |
| `#8a8a8a` | 1 | `.rail-scrollhint` | `var(--tx-2)` |
| `#2b2b2b` | 1 | `.rail-btn .tip` (ink) | `app.css` uses `var(--bg-2)` to keep the pixels. The semantic token is `--on-accent #1c1c1c`, but switching is a visual change. |

### Non-colour drift found while extracting

- **Section heads are `--tx-0`, not `--tx-2`.** AGENTS.md says heads are `--tx-2`, but `.panel-head`, `.explorer-head`, `.rail-label` and `.sec-label` are all white. `app.css` follows PROCESSOR. One of the two needs to change.
- **`--radius:2px` is declared but never used.** Every control renders square (0). AGENTS.md says "square (`--radius` 2px)". `app.css` sets no radius, so it matches the live app. Patrick should decide between 0 and 2px.
- **Focus ring is killed on inputs and selects.** `.ctl:focus`, `.text-input:focus`, `.inline-field`, `.blend-select:focus`, `.rz-dims input:focus`, `.cc-select`, `.cp-hex` and `.cp-rgb input` all set `outline:none`, which beats the global `:focus-visible`. `app.css` does not carry this over.
- **Hover colour is inconsistent.** Menu items (`.mi:hover`) and `.ctl-btn` hover to `--accent` text; everything else uses `--hover`.
- **On-state buttons ignore hover** (`.looks-act-btn.active`, `.seg button.on`, `.motion-play.on`), while `.tog.on` does react.
- **Off-scale buttons:**
  - `.es-sample`: 9px 16px, .06em. A fourth size.
  - `.panel-head .actions span.txt-action`: 5px 10px but 10px font, .08em.
  - `.motion-step`: 30px high, 0 8px, and not uppercase.
- **Bordered non-chips:**
  - `.ctl-btn` and `.rz-preset` (1px `--line`), `.sc-close`, `.stat-preview`, `.heavy-tag`. These break "only chips have borders".
  - `.beta-tag` is an outline chip that uses a `--bg-4` border instead of `--ctrl-line`.
- **Two disabled opacities:** .38 (`.gen-btn.disabled`, `.motion-step`) and .55 (`.motion-play.disabled`, `#rsRender.disabled`, `.es-sample:disabled`).
- **Transitions are uneven:** `.gen-btn` uses `all .12s`, `.lmask` uses `background/color .12s`, and all other Regular buttons have none.
- **Duplicate rules:**
  - `.rs-progress`, `.rs-bar`, `.rs-bar-fill` and `.rs-prog-label` are each defined twice, with conflicting values (bar 7px then 8px, label 10px then 11px).
  - `.looks-actions` is defined twice (gap 8 then 5).
  - `.look-card{position:relative}` appears three times.
- **Undefined tokens** are referenced with fallbacks: `--muted`, `--warn`, `--tx-3`.
- **Font stacks are hard-coded.** Most rules write `'JetBrains Mono',monospace` rather than `var(--mono)`, and the body uses `'Manrope',sans-serif`. PROCESSOR's `--mono` also lacks core's `ui-monospace`.

## (c) Skipped, and why

- **Canvas and viewport overlays:** crop (`.crop-*`), transform corner-pin (`.tf-*`), viewport handles (`.vp-*`), isolation frame, drop overlay, empty/start screen, canvas checkerboard. These belong to the PROCESSOR image editor, not shared chrome.
- **Editor widgets:**
  - colour picker (`.cp-*`, `.col-swatch`)
  - curve editor
  - gradient ramp and designer (`.ramp-*`, `.rl-*`)
  - light rig and view pad
  - bias faders (`.gf-*`)
  - motion timeline and sparklines
  - Looks gallery cards
  - rail icon grid
  
  Each is a single-purpose instrument. They could become later app-layer components if KOMPOSITOR or DIMENSOR need them.
- **Older modal variants:** `.rz-card`/`.rz-title` and `.dlr-card`. These are the same pattern as `.ui-card` with different padding, title size and shadow (drift). `.vk-modal` follows `.ui-card`, the newest and "branded" one.
- **Status bar and scrollbar styling** (`.status`, `::-webkit-scrollbar`): app-frame specific.
- **Utilities** `.sr-only` and `.skip-link`: generic rather than design-system components. Worth adding in core later.
- **Toast:** PROCESSOR has none. `.vk-toast` is the `.depth-status` pill, so no toast behaviour (auto-dismiss, stacking) is implied.
- **Tooltip:** only the rail tooltip exists. Everywhere else PROCESSOR uses native `title=`.
