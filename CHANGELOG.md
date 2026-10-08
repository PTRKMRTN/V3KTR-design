# Changelog

Semver. Apps pin a tag; a major bump means a consumer may render differently.

## 0.41.8 — 2026-10-08

- **Real fix for the hover-tip-killed-by-a-stale-blur bug** (v0.41.5 was defensive only, unconfirmed). KOMPOSITOR traced it: `focusout`'s guard (`blurEl !== target`) let a blur from a control with no `data-tip` through whenever no tip was currently showing (`null !== null` is false), arming a 150 ms timer unrelated to any tip; that timer's `hide()` unconditionally wipes the shared hover-delay timer, silently killing an unrelated hover that started inside that window (trace: pointerover at 57 ms, hover timer armed, killed by the stale blur's `hide()` at ~133 ms). Fixed: a focusout with no tipped control can never arm the timer. `test/help.test.mjs` now has a real negative control for this (34 checks; confirmed it fails without the one-line fix, on the exact reported sequence). AGENTS.md "T1 tips".

## 0.41.7 — 2026-10-08

- **Thumbnails are a pullable file.** `.vk-thumb*` moved from `app/app.css` into its own `app/thumbs.css` (PROCESSOR's request, so it can pull files without the whole bundle), in `dist/app.css` after `app/status.css`. The rule set is unchanged apart from one deliberate fix: **`.vk-thumb__label`'s font-size was never pinned**, so every app inherited a different size by accident; it's now 9px / 0.03em / 6px 5px padding, PROCESSOR's own values (the reference app). `scripts/build-specimen.mjs` also picked up `app/status.css` and `app/thumbs.css`, which it had been missing since their own releases.
- **Docs: never leave a thumbnail `<img>` src-less.** PROCESSOR traced the Looks-grid outline Patrick flagged to an empty tile's `<img>` having no `src` — Chromium draws its own broken-image frame, which no CSS class reaches, so a static read of the rules found nothing wrong. Set a transparent placeholder until the real thumbnail is ready. AGENTS.md "Flat, not outlined".

## 0.41.6 — 2026-10-08

- Docs: the solid-fill-when-selected rule has an exception, named by PROCESSOR's audit — a colour swatch, gradient stop or preset whose own fill IS the content stays an outline/handle on selection; a solid accent fill would hide the colour being chosen. AGENTS.md "Chips are one colour". No CSS change.

## 0.41.5 — 2026-10-08

- **Defensive hardening, not a confirmed fix:** KOMPOSITOR reported that a hover tip opened just after a Tab-away could be closed by the earlier control's deferred blur. `show()`'s existing `cancelBlur()` should already prevent this (any new tip cancels the pending timer for the old one), and a built test for the described sequence passed identically with and without a guard added for it — so no new test was added (an unfalsifiable test isn't shipped), but the deferred-hide callback now also checks it's still closing the element it was scheduled for, in case the real cause turns out to be something this happens to cover. If it recurs, the exact event order from KOMPOSITOR's probe is needed.

## 0.41.4 — 2026-10-08

- **Chip fix: selected is now a solid fill, everywhere.** `.vk-chip.is-active` was only tinting the border and background grey (`--accent-dim` border, `--bg-3` fill) instead of filling solid like `.vk-chip--group.is-on` already correctly does. Found from screenshots of KOMPOSITOR's filter chips (Sounds browser, caption styles, Formats) reading as outlined rather than selected. Fixed to match the group variant: `background:var(--accent);color:var(--on-accent)`. No markup change needed in any app — this is a shared CSS rule, so every app's `.vk-chip.is-active` fixes itself on the next pull.

## 0.41.3 — 2026-10-08

- Docs: "Asset browser shell" pattern, generalised from KOMPOSITOR's shipped Sounds browser (the reference, not a guess) — the expand-over-the-workspace frame shape, filters column, dense results list, licence handling, and that a cut-down category (DIMENSOR's Fonts) is a smaller version of the same shape, not a different one. Not yet a pullable component: one real implementation isn't enough to generalise the CSS from. AGENTS.md. No CSS or JS change.

## 0.41.2 — 2026-10-08

- **Tip fix, round 2** (KOMPOSITOR's probe showed the first fix in v0.41.1 wasn't enough — 5/5 runs still bad, including one with no scroll at all). Two changes: (1) while a keyboard-focus-shown tip's control is still genuinely focused, a scroll **repositions** it instead of hiding it, removing the race with the scroll listener entirely rather than guessing a safe time window. (2) A real `focusout` now defers 150 ms before hiding: a scrolling list that re-renders its rows can detach and re-insert the focused element, firing a genuine blur even though the user never moved away, and the re-render's own refocus can take up to ~120 ms to land (per KOMPOSITOR's probe). If a focusin arrives first, the deferred hide is cancelled with no flicker. `interactions/help.js`. `test/help.test.mjs`: 33 checks (was 28); the blur-defer check counts actual hide transitions with a MutationObserver, because "is it shown again afterwards" can't distinguish a flicker from staying open — both negative controls (always-hide-on-scroll, immediate-hide-on-blur) fail it.

## 0.41.1 — 2026-10-08

- **Tip fix** (found by KOMPOSITOR): a keyboard-focus tip was dismissed by the scroll its own focus caused — focusing a control inside a scroll area scrolls it a few px into view, and the scroll listener hid the tip 10-80 ms after it showed. A scroll within 150 ms of a keyboard-focus-shown tip is now ignored; a later, real scroll still dismisses it. `interactions/help.js`. `test/help.test.mjs`: 28 checks (was 21), with a negative control (reverting the fix fails the new check).

## 0.41.0 — 2026-10-08

- **Reset to defaults** (Patrick's idea): a File menu row that clears an app's remembered INTERFACE preferences — Helper Text, Workspace side, interface scale, and the like — never saved projects, Looks or the library. `interactions/reset.js`: `interfaceKeys` / `resetInterface`, finding every `v3ktr-<app>-*` key automatically plus named legacy keys. A new shared preference must use that prefix. One confirm step (`.vk-modal--danger`), Cancel focused by default. `test/reset.test.mjs`: 5 checks, with a negative control.

## 0.40.1 — 2026-10-08

- **Style icons**: one per KOMPOSE Style (Music video, Trailer, Car film, Dream, Montage, Hype reel, Slow cinema, Night drive), for the Sequence inspector's Style grid. Same language as menu icons (24 grid, 1.4 stroke, currentColor). `icons/style-icons.js` + `.json`, built by `scripts/build-style-icons.mjs`. AGENTS.md "Style icons".

## 0.40.0 — 2026-10-08

- **Scrollbars** (Patrick: "I think we had removed them, I think some have returned"): `.vk-scroll` now carries a house scrollbar, thin with a styled thumb, instead of each app inventing its own — PROCESSOR had one scrollbar style, DIMENSOR another, KOMPOSITOR a third that also (wrongly) put a visible bar on its icon rail, which PROCESSOR and DIMENSOR both hide. The rule: `.vk-scroll` (a content area) always shows the house bar; an icon-only rail (`.rail-scroll`, app-local) always hides its own. AGENTS.md "Workspace frames".

## 0.39.2 — 2026-10-08

- Docs: KOMPOSITOR's exception to the top/status-bar mirror (Patrick, direct): where a full-width row already sits between the viewport and the status bar (its timeline), the status bar stays a full-width bottom row on Left too, rather than pulled in under the viewport. AGENTS.md "Workspace align". No CSS or JS change.

## 0.39.1 — 2026-10-08

- Docs: Patrick's calls from PROCESSOR's workspace-align sheet, rolled out to every app. On Left, the top bar and the status bar move WITH THE CANVAS, not with the rail/panels — a true mirror, not just the rail swapping sides. AGENTS.md "Workspace align" has PROCESSOR's grid shape and the list of insets/exceptions it had to re-check on Left. No CSS or JS change: this is app-side grid work, documented so DIMENSOR and KOMPOSITOR build the same shape.

## 0.39.0 — 2026-10-08

- **Workspace align** (Patrick's idea): `interactions/layout.js` `workspaceAlign('<app>')`, same shape as `helperText()`. Default 'right' (every app's layout today, unchanged); `.set('left')` / `.toggle()` mirrors the workspace, sets `<html data-ws-align="left">`, remembered per app. The mirrored grid is each app's own CSS, documented in AGENTS.md "Workspace align". `test/layout.test.mjs`: 6 checks, with a negative control.
- **View → Interface group**: Helper Text, Workspace (the two rows above) and icon-only buttons now live together under one "Interface" label in the View menu, not loose. Icon-only is scoped (AGENTS.md "View → Interface group") but parked, not built.

## 0.38.2 — 2026-10-08

- Docs: the status bar's 4px top pad assumes the bar sizes itself from its content; an app whose grid fixes the row's own height (PROCESSOR: a 22px row plus --frame-bottom) should zero it locally. Found by PROCESSOR v0.726.0, Patrick's OK on the sheet. AGENTS.md "Status bar". No CSS change: this is the right default for a self-sizing bar.

## 0.38.1 — 2026-10-08

- Two fixes from PROCESSOR's adoption: an EMPTY child (its fps readout, blank at rest by design) was drawing a stray dot with nothing after it — `.vk-status>:empty{display:none}` takes it out of the flow, the same as the display:none/DOM-removal gotcha. The fixed `height:28px` clipped under the Window margin rule (`--frame-bottom`); it's gone, replaced by padding that includes `var(--frame-bottom, 4px)`, so the row grows with the window margin where an app has it and keeps the old look where it doesn't. `test/status.test.mjs`: 9 checks; both fixes have a negative control.

## 0.38.0 — 2026-10-08

- **Status bar dot separators** (Patrick: an idea for the design system). `.vk-status`: its direct children get a dot between them automatically (CSS only, no per-item markup), the same dot as the Livelink menu's. Apps adopt it by renaming their bar's class from `.status`. CSS `app/status.css` (pullable; in `dist/app.css`). `test/status.test.mjs`: 5 checks, including the display:none vs DOM-removal gotcha the file's own comment warns about.

## 0.37.1 — 2026-10-08

- `splitGrip`: no tooltip on the grip (Patrick: the tip showed, then hung where it opened while the line was dragged away). The grip keeps its `aria-label` and separator role. `test/frames.test.mjs` checks there is no tip.

## 0.37.0 — 2026-10-08

- **Window margin** rule (Patrick 2026-10-08): all UI 22px (`--pad`) from every window edge, a textured viewport alone full-bleed. AGENTS.md "Window margin". First shipped in PROCESSOR v0.723.0.
- **Split grip on horizontal lines:** `splitGrip` takes its axis from the separator (`--t`/`--b` → drags up/down, ↑/↓, `row-resize`, an up/down icon, `aria-orientation="horizontal"`), `min`/`max` may be functions, and it returns `update()` to refresh the aria values after a window resize. Patrick: height grips are fine; width grips only on his word. `test/frames.test.mjs` 49 checks (7 new for the horizontal grip).

## 0.36.1 — 2026-10-08

- Fixes from PROCESSOR's adoption: `split-grip.js`'s top-level `ICON` collided with PROCESSOR's own when vendored flat (the page threw at load); renamed `GRIP_ICON`, and `scroll-fade.js`'s `EPS` → `FADE_EPS`. The `.vk-scroll` mask now applies only while a fade shows, so an area at rest has no clip or stacking context. AGENTS.md "Workspace frames" records Patrick's exceptions: no separator against a textured viewport (PROCESSOR's canvas), and no resize grip where a panel needs a minimum width (PROCESSOR's stacks; the other apps not yet analysed).

## 0.36.0 — 2026-10-08

- **Workspace frames** (Patrick's mockup, 2026-10-08): `app/frames.css` + `interactions/scroll-fade.js` + `interactions/split-grip.js`. A frame's scroll area sits `--pad` in from every edge, so content never scrolls into a separator; frame separators sit on the frame edge, inset `--pad` along their length, touching nothing; scroll areas fade at an edge with more past it (top once scrolled, bottom while there is more); optional resize grip on a vertical separator (separator-colour square, ground-colour icon). New tokens `--scroll-fade` (= `--pad`) and `--grip` (18px). Rule: AGENTS.md "Workspace frames". Tested: `node test/frames.test.mjs` (42 checks, the mockup's three-column layout, with a negative control). Additive: nothing existing renders differently until an app adopts the classes.

## 0.35.8 — 2026-10-08

- New FX-group colour, `--type-fuchsia` `#d47dba`, for DIMENSOR's Effectors rail group (Random / Noise / Step / Image / Target effectors that act on Instance copies). It had been borrowing Instance's rose provisionally. Chosen to sit ΔE 22 from rose, close to rust's existing 21.3: a related sibling, not a clash. Passes 4.5:1 on the ground and on panels (5.71 / 5.02).

## 0.35.7 — 2026-10-07

- Docs: switching Update policy to Live pulls a version already waiting at once, the same as a new arrival under Live. Audited and confirmed matching in PROCESSOR, KOMPOSITOR and DIMENSOR's shipped Livelink menus; written into AGENTS.md "Linked-asset badge" as it was undocumented. No visual or token change.

## 0.35.6 — 2026-10-07

- Site: `.vs-card` (the Looks grid) gets more vertical breathing room — card-to-card gap 28px → 40px, media-to-body gap 12px → 16px, and the title now carries an 8px bottom margin so it doesn't sit flush against its tags (Patrick, site-v2).

## 0.35.5 — 2026-10-06

- Docs: the "Sent as files" rule now records what PROCESSOR shipped (v0.690.0): owner from the file's asset chunk, shown with the link off, survives reload and Save/Open Project, and becomes Linked on a live arrival. "Update available" for a re-dropped newer export is not built in any app yet. AGENTS.md "Linked-asset badge". No visual or token change.

## 0.35.4 — 2026-10-06

- Docs: a send row that falls back to files with the link off is labelled with its save form, "Save stage files…" (KOMPOSITOR's stage row), and the same pattern for other save fallbacks. AGENTS.md "Livelink". No visual or token change.

## 0.35.3 — 2026-10-06

- Docs: the Livelink rules are in AGENTS.md, including the link-off behaviour Patrick approved for DIMENSOR (Send to ▸ stays visible with the link off, because it falls back to saving files; LINKED ASSETS hides; LINK and CONNECTED stay). No visual or token change.

## 0.35.2 — 2026-10-06

- Version lines: `tokens.css` and `app/app.css` headers were not bumped at 0.34.0, 0.34.1, 0.35.0 or 0.35.1, so `design:pull` in KOMPOSITOR refused the pin (dist/app.css "does not carry its own version line"). Both headers now read v0.35.2, the bundle and specimen are rebuilt, and `check-drift` fails when a header differs from the newest CHANGELOG version. No visual change.
- Livelink's `sync` icon and the reviewed wording ("Sent as files", "connected") are in this release (they were in 0.35.0/0.35.1 but not pullable without the header).

## 0.35.1 — 2026-10-06

- Livelink wording (the content session's review, applied): state "File" is now **"Sent as files"** (tip "This asset came in as files, not as a live link."). Source closed and Source not responding have the reviewed tips. Apps are **"connected"** in the light's tips ("KOMPOSITOR is connected. Switch to KOMPOSITOR."); assets stay "Linked". The menu's Go to source, Update now, Update policy and Freeze rows carry their reviewed tips. Tests updated: 23 badge, 10 light, 26 interactions.

## 0.35.0 — 2026-10-06

- Menu icon `sync` (two arrows) for Update policy in the Live link menu (CONNECTIVITY W4.6). Live link's other actions already had icons: Go to source = link, Update now = down, Send to = send, Freeze = freeze, Import/Export stay in File. No other change.

## 0.34.1 — 2026-10-06

- Tooling: `scripts/check-drift.mjs` normalises line endings before comparing. On Windows (git autocrlf) the working copy is CRLF and the committed bundles are LF, so the check reported a stale bundle and five "not whole" files that were only line endings. No CSS changed.

## 0.34.0 — 2026-10-05

- **Link badge: a `file` state** (Patrick 2026-10-05, from KOMPOSITOR: a depth asset that arrived as dropped files said "Linked", which is meant for live links). A record with `via: 'file'` that is otherwise linked now reads **"File"** with a grey document mark (never the chain) and the line "Dropped as files from <APP>. Drop a newer export to update." Backward compatible: a new state only. A record without `via`, or with `via: 'link'`, is unchanged; Update available, Source closed, Source not responding and Frozen still win over File. `interactions/link-badge.js` (`badgeOf`, `BADGE_ICONS.doc`), `app/link-badge.css` (`.vk-lnk[data-state="file"]`, neutral like closed), `test/link-badge.test.mjs`.

## 0.33.2 — 2026-10-04

- Tooling: `scripts/check-drift.mjs` (`node scripts/check-drift.mjs`). Exits 1 when a pullable app file isn't whole in `dist/app.css`, when `dist/app.css` or the specimen is stale against its sources, when a surface loads Google Fonts, or when a `vk-` class named by `interactions/` has no rule in `app/`. Hook-only classes (`vk-toast-region`, the `vk-tip-` id prefix) are allowlisted with the reason. Negative controls: renaming a class the modules use fails it; a stale bundle fails it. No visual change.

## 0.33.1 — 2026-10-03

- Specimen page: loads the self-hosted fonts (it still pulled Google Fonts, breaking the no-outside-request rule); shows the panel sections (v0.32.0), the linked-asset badge (v0.28.0) and the link light (v0.26.0), and renders every pullable app file (help, link, side view, link badge, sections) so the page shows what an app gets. No token or component changed.

## 0.33.0 — 2026-10-03

- **Self-hosted fonts** (connectivity session, from KOMPOSITOR K21: the apps and the engine core's glyph FX loaded JetBrains Mono from Google Fonts): `fonts/fonts.css` + 18 woff2 files (288 KB with licences). JetBrains Mono 400/500/600/700 and Manrope 400–800, latin + latin-ext with @fontsource 5.3.0's unicode ranges, `font-display: swap`, SIL OFL 1.1 licences beside them. Families are named as in tokens.css, so swapping the Google `<link>` for `fonts/fonts.css` changes nothing else. One visible difference: mono 700 (link light, badge, section labels) is now the real bold; PROCESSOR's Google URL stopped at 600, so the browser was synthesising it. Built by `scripts/build-fonts.mjs` from a DIMENSOR checkout's @fontsource. `test/fonts.test.mjs`: 5 checks with every request off the test server blocked; a broken path for one weight fails it.

## 0.32.0 — 2026-10-03

- **Panel sections: no lines** (Patrick, after a mockup of inset and thinner variants: "lets ditch the sub dividers, when there are lots it creates noise"). Space alone groups sections now: 22px at the sides and the panel's ends, a new token `--sec-gap` (1.5 × `--pad`, 33px) from a section's last control to the next title, and 14px from title to controls. These are the numbers of the line-free option he first picked. Replaces v0.31.x's 22px padding with a 2px `--line` between sections (44px gap). `test/sections.test.mjs`: 5 checks; v0.31's lines and v0.31's padding each fail it. Main workspace dividers are unchanged (2px).

## 0.31.1 — 2026-10-03

- Panel sections moved into their own pullable file, `app/sections.css` (like help / link / side-view / link-badge), at PROCESSOR's request: it pulls files rather than the bundle and was mirroring the rules. `dist/app.css` has the same rule set as v0.31.0 (240 rules, compared), so there's no visual change.

## 0.31.0 — 2026-10-03

- **Panel sections** (Patrick: "make sure the ui spacing is consistent, particularly the before and after section titles"; he picked KOMPOSITOR's rhythm with its lines over a line-free variant): `.vk-section` with new tokens `--sec-pad` (= `--pad`, 22px) and `--sec-head-gap` (14px). Each section is padded 22px with a 2px `--line` between sections, and its title sits 14px above its first control. Before this, PROCESSOR and DIMENSOR put a title 12px under the section above and 14px over its own controls, so titles read as belonging to the wrong section. `.vk-sec-label` outside a section keeps its old margins until each app moves to sections. `test/sections.test.mjs`: 4 checks; with the title's margin left out it fails (a 34px top).

## 0.30.0 — 2026-10-03

- **Step icons retired** (Patrick: "we don't need these now, we have progressed the design on these"). Removed `brand/icons/steps/`, `icons/step-icons.js` + `.json` and `scripts/build-step-icons.mjs`; they stay in git history (v0.17.0–v0.29.1). v0.29.0 had shared them with the apps on a misread of Patrick's approval, which was for the favicons. No app had placed them; KOMPOSITOR had vendored the module and drops it. The site never used them (it has the animated step scenes).
- The P · K · D favicons (v0.29.0) stay.

## 0.29.1 — 2026-10-03

- Docs only: the step icons are for the apps. The site doesn't use them (Patrick chose animated step scenes on /processor, 2026-10-01; found by the site-v2 session). Corrected in brand/README.md, AGENTS.md and the step-icons module header. No asset changed.

## 0.29.0 — 2026-10-03

- **App favicons are now the link light's tiles** (Patrick): a dark P / K / D on the app's colour, replacing the V. `brand/icons/icon-{processor,kompositor,dimensor}.svg` + PNG 32 / 180 / 512. The letter is JetBrains Mono Bold cut to outlines (borrowed opentype.js + @fontsource from DIMENSOR at build time; the icons need no font), cap height 60 % of the tile so it reads in a 16px tab. The site icon (V3) is unchanged. The before/after sheet went to Patrick.
- **Step icons approved for every surface** (Patrick; trial since v0.17.0): `icons/step-icons.js` (`STEP_ICONS`, `stepIconSvg(name, size, { decorative })`) + `.json`, generated with the SVGs by `scripts/build-step-icons.mjs`. The moving parts are classes in the module (ids in the files), so an app can show one twice. The SVG files are unchanged.

## 0.28.1 — 2026-10-03

- Linked-asset badge: `interactions/link-badge.js` imports nothing now (found by KOMPOSITOR K27). It imported `../icons/menu-icons.js`, which broke apps that vendor the design files flat. Its three marks are inlined as `BADGE_ICONS`, and the test checks they still match menu-icons' link / unlink / lock (19 checks; an edited mark fails). No visual change.

## 0.28.0 — 2026-10-03

- **Linked-asset badge** (CONNECTIVITY.md W4.5), lifted from KOMPOSITOR K25 and generalised: `interactions/link-badge.js` (`badgeOf`, `linkBadge`, `linkBadgeHtml`, `linkBadgeMenu`, `NOT_RESPONDING_MS`) + `app/link-badge.css` (pullable; in `dist/app.css`). Always the chain + a word, with the chain in the OWNER app's colour via `data-owner` (K25 hard-coded `--dimensor`). Five states: Linked · Update available (the one solid button) · Source not responding (new: the protocol's 30 s silence, caution yellow) · Source closed · Frozen. The actions are in a menu: Go to source · Update now · Update policy · Freeze. Grey states keep a `--tx-1` word, because `--tx-2` on `--bg-3` measures 3.3:1.
- Menu icons: + `link`, `unlink` (K25's chain paths).
- `test/link-badge.test.mjs`: 17 checks, including the owner colour, the click wiring (a badge click never reaches its row), state precedence, the menu, and 4.5:1 for every word. Negative control: the hard-coded `--dimensor` icon colour fails the owner check.

## 0.27.1 — 2026-10-03

- Side view: the block is drawn BEHIND the plate (found by PROCESSOR, whose Auto box often spans 5–87 % of the levels): a 16 % tint of the app colour (24 % while dragging) first, the plate's density on top, then the two ends as solid handles. Before, a 40 % fill on top hid the depth it sits in. `test/side-view.test.mjs` now checks the plate still reads grey under the block (16 checks); the v0.27.0 code fails it.

## 0.27.0 — 2026-10-03

The depth side view, shared (CONNECTIVITY.md W1.5; DEPTH-BOX.md §6; asked for by the connectivity session once KOMPOSITOR K24 merged at 47bc101).
- New `interactions/side-view.js`, lifted from KOMPOSITOR's ui/side-view.js as built (no app imports): the plate as a depth density seen from the side, the box as a block in the app colour, drag to move, drag an end to change thickness about the centre, Shift = a tenth, ← → / ↑ ↓ keys, double-click or Home back to auto, an update during a drag ignored. Its wording is now options (`label`, `tip`, `tipDesc`, `emptyText`) so PROCESSOR (Image ▸ Depth custom box) and DIMENSOR (box modes) can say it their way; `toRange` / `fromRange` convert a placement to and from a near/far pair. Class `vk-side-view`, CSS in its own pullable `app/side-view.css`.
- It stays the optional Adjust: it draws and drags a placement and never decides it.
- `test/side-view.test.mjs`: 15 checks in Edge with a real mouse; dropping Shift-fine makes it fail.

## 0.26.1 — 2026-10-03

- `.vk-link` moves to its own file, `app/link.css`, so PROCESSOR (which pulls files, not the bundle) can pull the link light without carrying a copy, the same way as `app/help.css`. `dist/app.css` includes it; its rule set is unchanged.

## 0.26.0 — 2026-10-03

The link light, one pattern for all three apps (brief from the PC1 connectivity session; CONNECTIVITY.md W2.3 + W4.5). DIMENSOR built its own (a dot, a word, linked names); PROCESSOR and KOMPOSITOR need one.
- New `interactions/link-light.js` (`mountLinkLight`, `update({ state, peers })`) and `.vk-link` in the app layer. Three marks P · K · D in a fixed order: this app in its own colour; a linked app as a solid tile in its colour (a button: switch to it); an app that isn't open as a grey letter; no link reads as not open, with the reason in the tip.
- Every mark carries a tip (`data-tip`, for installTips) and an aria-label with the word. All pass 4.5:1 against the top bar (lowest 4.66).
- `test/link-light.test.mjs`: 10 checks in Edge, plus a sheet of every state in all three apps; a linked mark that isn't a button makes it fail.
- Later (W1.5): the depth side-view Adjust panel waits for KOMPOSITOR's first version (M119 / K24).

## 0.25.2 — 2026-10-03

From DIMENSOR adopting v0.25.1.
- Toasts: `setToastHost(el)` / `{ host }` centres the toast above the viewport bars of the canvas area. It was fixed to the whole window, 291 px off the canvas centre in DIMENSOR, contradicting its own comment. Without a host it still falls back to the window.
- Menu: `aria-checked` and `aria-disabled` now follow a check mark or a disabled class that changes WHILE the menu is open (the observer watched only the title's class). The rule that a check with a `data-*` attribute makes a row a `menuitemcheckbox` is now in the code comment and AGENTS.md.
- AGENTS.md: a shown toast catches the pointer where it sits.
- `test/interactions.test.mjs`: 26 checks (clicks the page before Tab; live aria-checked; host centring). Watching only the title makes it fail.

## 0.25.1 — 2026-10-03

- Tip **warm mode** (asked for by the content session, from PROCESSOR's FX rail): once a tip has opened, the next control's tip opens at once, so scanning a row of tiles doesn't wait 400 ms on each; it cools after 500 ms with the pointer off every tip target (`installTips({ warm })`, 0 = off). Keyboard focus and long-press are unchanged. `test/help.test.mjs` now 24 checks; with warm mode off it fails.

## 0.25.0 — 2026-10-03

The three gaps the PROCESSOR session found while adopting the help pattern.
- New `interactions/menu.js`: `installMenubar()`, the WAI-ARIA menubar keyboard (arrows, Home/End, Enter/Space, Esc, roving tabindex, aria-expanded/-checked/-disabled, handled keys stop), lifted from PROCESSOR v0.617.0 (its test/menubar-keys.mjs 33/33) and made generic: defaults are the shared `vk-` classes, and an app passes its own names and open class.
- New `interactions/toast.js`: `toast()`, the behaviour behind `.vk-toast`: the "What happened. What to do." template (`{ what, todo }`), one at a time, `role=status` / `role=alert`, held while hovered or focused, Esc closes, an optional action button. New `.vk-toast--error` (a red tint).
- The tip and help components move to their own file, `app/help.css`, so PROCESSOR (which pulls tokens, not the bundle) can pull them; `dist/app.css` includes it after `app/app.css`, and its rule set is unchanged (210 rules before and after).
- `test/interactions.test.mjs`: 23 checks in Edge (menu + toast); breaking the wrap-around makes it fail.

## 0.24.0 — 2026-10-02

In-app help, step 1 of the approved help pattern (V3KTR-PROJEKT/strategy/HELP-PATTERN.md; Patrick, 2026-10-02: "whole pattern, all 3 apps"; the default UI gains no visual complexity).
- New `interactions/help.js`: `installTips()` (the shared `.vk-tip` behaviour: ~400 ms hover, immediately on keyboard focus, a 500 ms touch long-press that doesn't also press, closes on leave / blur / tap elsewhere / Esc, `aria-describedby` while open, placement by `data-tip-side` with flip-to-fit), `helperText(app)` (View → Helper Text, off by default, remembered per app, `<html data-helper-text="on">`) and `keyLabel()` (platform key hints).
- New app-layer components: `.vk-param-desc` (hidden unless Helper Text is on), `.vk-hint`, `.vk-empty` (+ `__title`, `__body`); `.vk-tip kbd` for the key hint; no tip transition under reduced motion.
- AGENTS.md "Help and copy": the tiers, the alert template ("What happened. What to do."), the Help menu (Guide · Shortcuts · Contact · Privacy · Terms · About <APP>), the Helper Text toggle, key hints and voice, pointing to MESSAGING.md §5–§6.
- Default view unchanged: the existing components render pixel-identical to 0.23.1 (0 differing pixels). `test/help.test.mjs`: 21 checks in Edge; a 100 ms hover delay or a 100 ms long-press makes it fail.

## 0.23.1 — 2026-10-02

- `snap()` puts angle detents at every 45° OF THE VALUE when the param gives `min`/`max` in degrees. Before, it used 1/8 of the range, which is 45° only for a 360° range: on DIMENSOR's Twist (−720…720) that was 180°, on Tilt (−90…90) 22.5° (found by the DIMENSOR session). Without `min`/`max` nothing changes: the 0..1 fraction is a full turn, PROCESSOR's case. Tests: 45° detents on six ranges, and 0..360 in degrees matching PROCESSOR (5174 checks; 90° detents make it fail).

## 0.23.0 — 2026-10-02

Slider behaviour is shared (Patrick: "holding shift while scrubbing a slider input does a fine control. and any sliders that have an angle or centre type value can have the snapping feature").
- New `interactions/scrub.js`: `fineDrag` (Shift = a tenth of the pointer's movement; Shift at the press starts from the current value; release resumes 1:1), `snap` (detents every 45° for `angle` params, at the centre for `mid` params; pull 1.4% of the range; off while Shift is held or keyboard-stepping) and `keyStep` (arrow = one displayed unit, Shift+arrow = 10%).
- A port of PROCESSOR's fineDrag / snapAngle / snapMid, which stays the reference. `test/scrub.test.mjs` checks `snap` against PROCESSOR's functions at 1001 points in both modes (4018 checks; a wider pull radius makes it fail).
- Today: PROCESSOR already behaves this way. DIMENSOR's sliders had Shift only on the arrow keys (a tenth of a step, the opposite of PROCESSOR's Shift+arrow) and no detents; KOMPOSITOR has no sliders yet.

## 0.22.0 — 2026-10-02

Patrick's follow-ups on the flat states.
- Selected rows are a 42% tint (`--tint-sel`, was 26%; his option C). Everything on a selected row is `--tx-0`, secondary text and icons included: `--tx-1`/`--tx-2` fail on the tint. White measures 4.86:1 (PROCESSOR), 6.62 (KOMPOSITOR), 6.73 (DIMENSOR).
- Hover hand-off for controls inside a row (`.vk-row__ctl`): on the control, the row drops back to rest and the control takes the row's hover tint; on a selected row the control previews in the solid app colour.
- Thumbnail cards are one unit: picture and label meet with no gap, the label sits on `--bg-2` at rest, and its text is centred on its capitals (`text-box: trim-both cap alphabetic`).

## 0.21.2 — 2026-10-02

Two of Patrick's notes on the flat states.
- Drop zones: the diagonal stripes are the colour of the ground the zone sits on (`--drop-ground`, default `--bg-1`), cut into the `--bg-2` panel, instead of lighter lines ("make the brighter lines the same colour as the background under it").
- Thumbnail cards: the whole card carries hover and selection. New `.vk-thumb--card` with `.vk-thumb__pic` and `.vk-thumb__label`: hover washes the picture and tints the label; selected blends the picture and makes the label SOLID app colour with dark text, so selection reads on a picture that is already the app colour.

## 0.21.1 — 2026-10-02

- `.vk-drop` no longer sets type: it forced mono capitals onto every line inside a drop zone, so KOMPOSITOR's secondary line wrapped in a 288px panel (found by the KOMPOSITOR session). The type moves to an opt-in `.vk-drop__label`.

## 0.21.0 — 2026-10-02

Flat states instead of outlines (Patrick: "im bigger on solid or flatter styles… the app colour as a full overlay instead of a hover outline"). From the outline audit (173 rules across the three apps and this layer, 15 patterns) and his review of it.
- New core tokens: `--tint-hover` 12% (hovered row), `--tint-sel` 26% (selected row), `--tint-ctrl` 28% (hovered toggle), `--tint-field` 18% (field being typed in), `--thumb-wash` .32 (hovered thumbnail). Text on every tint measured in all three app colours: lowest 5.79:1 (white on a hovered toggle, PROCESSOR).
- `.vk-tog`: off is a `--bg-3` fill (was a 2px `--ctrl-edge` outline on transparent); hover is the `--tint-ctrl` tint with white text (was an outline + text in `--hover`).
- `.vk-menu-pop` and `.vk-cs__list`: `--bg-3`, no keyline; a hovered `.vk-menu-item` fills with the app colour, dark text and shortcut (was `--bg-4` + app-colour text).
- `.vk-input`: no keyline; hover `--bg-4`; focus tints toward the app colour (was an `--accent-dim` border). Keyboard focus keeps its ring (an exception).
- `.vk-modal`, `.vk-toast`, `.vk-note`: no keyline (`.vk-note` moves to `--bg-3`); a danger modal's title is a solid red band (was a red outline).
- `.vk-layer`: hover and active are tints; the 2px accent edge bar goes.
- New: `.vk-row`, `.vk-thumb` (+ `__chk`), `.vk-tag`, `.vk-note--warn` (+ `.vk-note__ic` for the warning icon), `.vk-drop`, `.vk-swatch`.
- Every border that went keeps its space as `transparent`: measured, every existing component is the same size as in 0.20.0.
- Unchanged by decision: chips, tabs and rail buttons, keyboard focus, on-canvas handles and guides, dividers.
- One tint was lowered to pass 4.5:1: `.vk-tag` is an 8% tint (amber text on 20% measures 3.84:1).

## 0.20.0 — 2026-10-02

The menu icons are shared (KOMPOSITOR is the third app with the set; PROCESSOR v0.585.0 said it moves here then).
- `icons/menu-icons.js` (ESM: `MENU_ICONS`, `menuIconSvg(name, size = 14)`) is the source; `scripts/build-menu-icons.mjs` writes `icons/menu-icons.json` for single-file builds and `icons/menu-icons.html`, a contact sheet.
- 51 icons: PROCESSOR's 31 and KOMPOSITOR's 24 (its new freeze, reverse, snap, markin, markout, zoomin, zoomout, actual) plus DIMENSOR's generic verbs (cursor, dice, eye, eyeOff, paste, play, unlock …). Merged by name with no conflicts: every name shared between apps had the same path. Aliases share a drawing: compare = split, rotcw = rotate, fliph = flip, pan = move, undo = reset. DIMENSOR's object and FX concept icons stay in DIMENSOR.
- App layer: `.vk-menu-ic` (a 14px column shared with `.vk-menu-check`, `--tx-2` at rest, the row colour on hover), 9px to the label, the shortcut 18px clear. This is the row the three apps already draw.

## 0.19.0 — 2026-10-02

File starts at the same x in every app (Patrick: "this will avoid any shudder if cycling through the apps").
- New core token `--brand-slot` 142.35px: the widest app logo (KOMPOSITOR 128.35px) + 14px. `.vk-brand` uses it instead of its own logo + 14px.
- File's left edge is 166.35px in all three (22 padding + 142.35 + 2 gap). It was PROCESSOR 159, DIMENSOR 151.5, KOMPOSITOR 166.35 under 0.18.0. PROCESSOR's name is now followed by 23.4px more space before File, DIMENSOR's by 30.9px more.

## 0.18.0 — 2026-10-02

The app top bar is shared (Patrick: "the logo and file menus will need to be brought into line in terms of size, position and spacing").
- Measured before: PROCESSOR and DIMENSOR already matched to half a pixel (same hand-copied rules). KOMPOSITOR differed: bar padding 12px (others 22), logo 22px high at top 7px (others 21.05 at 10.61, so its name sat higher and larger than the menu text), 18px + 4px after the logo (others 14 + 2), menu words 28px apart with no padding (others 14px padding + 2px gap), document name centred (others follow the menus).
- New core tokens `--bar-h` 36px, `--brand-logo-h` 21.05px, `--brand-logo-top` 10.61px (the derivation is in tokens.css), and per-app `--brand-logo-w` in themes.css (PROCESSOR 120.95, KOMPOSITOR 128.35, DIMENSOR 113.45).
- New app-layer classes `.vk-topbar`, `.vk-brand`, `.vk-brand-logo` (masked element via `--brand-logo-url`, or the inline SVG), `.vk-doc`. PROCESSOR's bar is the reference; `.vk-menu` is unchanged.

## 0.17.0 — 2026-10-01

Step icons, a TRIAL (Patrick: "we will see how they look. we dont need to include them if they dont work").
- `brand/icons/steps/{bring,depth,stack,out}.svg` for the site's "How it works" steps: square pixels on a 12×12 grid, `currentColor`, neutral (no app colour), drawn for 48px (a 4px pixel).
- Each moving part is its own `<g id>` so the site can animate it with CSS; the file as written is the rest frame and reads on its own with motion off. bring: `frame`, `tile` (drops in). depth: `layer-1` (front, solid), `layer-2`, `layer-3` (each draws only what the layer in front leaves visible, so they can start stacked and split). stack: `die`, `face-3` (rest), `face-1` and `face-5` (hidden at rest; swap faces to roll). out: `frame`, `tile` (half out of the open side), `arrow` (a pixel chevron).
- Generated by `scripts/build-step-icons.mjs` from ASCII grids; edit there, not the SVGs.

## 0.16.2 — 2026-10-01

- Paragraphs inside `.vs-form` / `.vs-signup` (hints, error notes) have no margin, whatever prose they sit in. On /contact, `.vs-article p` was adding 16px under the topic hint (44px to the next label instead of 28). Found by site-v2.

## 0.16.1 — 2026-10-01

Fix to 0.16.0: the label gap is measured to the visible control, and it is 14px (found by site-v2).
- Patrick's "first" gap was the tick-box legend, and to the eye that was 14px: an 8px margin plus the 6px the 20px box sits below the top of its 32px row. 0.16.0 measured to the row, so fields got 8px and the boxes still looked 14px.
- `--site-label-gap` is now 14px (field labels: `.vs-form__group`, `.vs-signup`). The legend's margin subtracts the row's slack, `calc(gap - (row - box) / 2)` = 8px, so the box is 14px below it too. New `--site-check-box` 20px and `--site-check-row` 32px make that sum explicit.
- Groups stay 28px apart, measured to what you see: a tick-box group in a `.vs-form` pulls the next group up by the same 6px, so the last box → next label is 28px like field → next label.

## 0.16.0 — 2026-10-01

Form spacing (Patrick: "consistent spacing after the label and before the control … use the first as the rule. And the space between form elements a little larger").
- New site tokens `--site-label-gap: 8px` (label or legend to its control) and `--site-form-gap: 28px` (between the groups of a `.vs-form`, was 20px).
- `.vs-form__group`, `.vs-choices > legend` and `.vs-signup` all use `--site-label-gap`. `.vs-signup` was 10px, so a single sign-up's label sits 2px closer to its field.

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
