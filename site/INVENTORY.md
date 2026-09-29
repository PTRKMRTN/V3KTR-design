# Site layer inventory · v0.2.0

Source: `V3KTR-SITEV2-WT`, branch `site-v2` @ `5004d53` (2026-09-29): `styles/v2-chrome.css` (387 lines),
`styles/v2.css` (1022), `styles/v2-article.css` (513). Core: `tokens.css` v0.1.1.
Settled inputs (Patrick 2026-09-29): hover `#3dffc2`; neutral greys `#f4f4f4 / #cfcfcf / #8a8a8a`; ground `#212121`.

## (a) Site-v2 custom properties → what they become

| site-v2 | value | becomes | value | note |
|---|---|---|---|---|
| `--v2-ground` | `#212121` | core `--bg-0` | `#212121` | exact |
| `--v2-panel` | `#2a2a2a` | core `--bg-2` | `#2b2b2b` | **recommend**: 1 step lighter, not visible |
| `--v2-well` | `#262626` | `--site-well` (pending core) | `#262626` | no core step between bg-0 and bg-2 |
| `--v2-rule` | `#3a3a3a` | core `--bg-3` | `#3a3a3a` | exact value; only use is the article `hr` |
| `--v2-rule-2` | `#555a60` (cool) | `--site-line-2` (pending core, **proposed**) | `#595959` | neutral, luminance-matched: 2.30:1 on bg-0 vs 2.31:1. Alternative: core `--ctrl-line` (renders `#4d4d4d` on bg-0, 1.90:1, dimmer) |
| `--v2-fg` | `#f4f6f8` (cool) | core `--tx-0` | `#f4f4f4` | settled |
| `--v2-fg-2` | `#c9cdd3` (cool) | core `--tx-1` | `#cfcfcf` | settled; slightly lighter (10.34 vs 10.09:1) |
| `--v2-muted` | `#a0a6ae` (cool) | core `--tx-2` | `#8a8a8a` | settled, but **darker**: 6.56 → 4.66:1 on bg-0. Fails on fills, see (e); `--site-muted` proposed |
| `--v2-signal` | `#00e5a0` | core `--accent` | `#00e5a0` | exact |
| `--v2-signal-hi` | `#3bf0b8` | core `--hover` | `#3dffc2` | settled; retires |
| `--v2-signal-ink` | `#04120d` | `--site-signal-ink` (pending core) | `#04120d` | core `--on-accent` is `#1c1c1c`. Both pass (11.59 vs 10.32:1 on aqua). **Recommend retiring to `--on-accent`** (one ink everywhere); kept exact pending a call |
| `--v2-gutter` | `clamp(16px, 3.4vw, 48px)` | `--site-gutter` | same | |
| `--v2-max` | `1440px` | `--site-max` | same | |
| `--v2-nav-h` | `100px` | `--site-nav-h` | same | |
| `--v2-display` (on body) | `var(--font-manrope), "Manrope", …` | core `--sans` | `'Manrope',ui-sans-serif,…` | ⚠️ see "uncertain" below |
| `--v2-mono` (on body) | `var(--font-jetbrains-mono), "JetBrains Mono", …` | core `--mono` | `'JetBrains Mono',ui-monospace,…` | ⚠️ same |
| `--v2-app-cols` (inline, `.v2-apps`) | `2` default | not ported | | page layout |

New site-layer tokens (no site-v2 variable; lifted from repeated raw values): `--site-scrim-bar`, `--site-scrim-label`,
`--site-subnav-h`, `--site-section-y`, `--site-hero-y`, `--site-shell-y`, `--site-col-gap`, `--site-read`,
`--site-focus-offset`, the type scale `--site-fs-*` (sign, display, title, h2, h2-sm, subhead, h3, h4, intro, lede,
read, body, small, fine, cap, eyebrow, wordmark, appname) and `--site-weight-display: 800`.

**Pending core** (a layer may not own greys/inks — AGENTS.md layer rule 1): `--site-well`, `--site-line-2`,
`--site-muted`, `--site-signal-ink`, `--site-error-ink`. They sit in a marked block at the top of `site.css` so the file
renders today; each moves to `tokens.css` (v0.1.2) on approval, or is dropped in favour of a core token.

## (b) Raw colours hard-coded outside `:root` (12 uses)

| value | count | where | suggested mapping |
|---|---|---|---|
| `rgba(33,33,33,0.92)` | 2 | `.v2-nav`, `.v2-subnav` | `--site-scrim-bar` = `color-mix(in srgb, var(--bg-0) 92%, transparent)` |
| `rgba(33,33,33,0.85)` | 3 | `.v2-tagline`, `.v2-badge`, `.v3feed-lightbox__close/__nav` | `--site-scrim-label` (bg-0 at 85%) |
| `rgba(13,14,16,0.85)` | 1 | `.v2-play` | cool near-black → `--site-scrim-label` (visible: slightly lighter, neutral) |
| `rgba(0,0,0,0.8)` | 1 | `.v2-dialog::backdrop` | not ported; if ported, a core `--backdrop` (pure black is neutral, fine) |
| `rgba(20,20,20,0.94)` | 1 | `.v3feed-lightbox` | not ported; suggest merging with the dialog backdrop (two scrims for one job) |
| `#ff9b8a` | 2 | `.v2-signup__note.is-error`, `.v3pf__check--fail .v3pf__word` | `--site-error-ink` (pending core; core `--danger #ff5b5b` is a fill red, 5.29:1) |
| `#4a3a14` | 1 | `.v3pf__strip--maybe` | not ported; needs a core warn-dim fill (none exists) |
| `#4a1f1f` | 1 | `.v3pf__strip--no` | not ported; nearest core `--danger-dim #7a2a2a` (not a hair — noticeably brighter) |

Inside `:root`: the 11 `--v2-*` colours in (a). Outside the three CSS files (out of scope, noted for the site owner):
8 inline `style={{color:"var(--v2-signal)"}}` on `.v2-cap` (now `.vs-cap--signal`); `#353a40` (cool grey) in an SVG
on `/processor`; `app/global-error.tsx` renders a **white** page (`#ffffff` bg, `#08805b` link) against the dark-only rule.

## (c) Components ported

| vs class | site-v2 selector |
|---|---|
| `.vs-site` (+ `a`, `:focus-visible`) | `.v2-chrome`, `.v2-page` base |
| `.vs-wrap` | `.v2-wrap` |
| `.vs-skip` | `.v2-skip` |
| `.vs-cap`, `.vs-cap--signal` (new) | `.v2-cap` (+ inline signal colour) |
| `.vs-eyebrow`, `--signal` | `.v2-eyebrow`, `--signal` |
| `.vs-lede`, `.vs-intro`, `.vs-fine` | `.v2-lede`, `.v2-shell__intro`, `.v2-fine` |
| `.vs-link`, `.vs-open-link` | `.v2-link`, `.v2-open-link` |
| `.vs-display` (+`em`) | `.v2-hero h1` |
| `.vs-title` | `.v2-page .v2-shell__title` |
| `.vs-h2`, `.vs-h2--sm` | `.v2-page h2`, `.v2-h2-sm` |
| `.vs-subhead` | `.v2-apphero__what` |
| `.vs-sign` | `.v2-sign` |
| `.vs-wordmark`, `--sm` | `.v2-apphero h1`, `.v2-app__name` |
| `.vs-btn`, `--primary`, `--signal`, `[disabled]` | `.v2-btn` family |
| `.vs-cta-row` | `.v2-cta-row` |
| `.vs-soon`, `.vs-beta`, `__dot` | `.v2-soon`, `.v2-beta`, `__dot` |
| `.vs-chip` | `.v2-chip` (filter toggle) |
| `.vs-tags` | `.v2-chips > li` |
| `.vs-menu`, `__name`, `__what` | `.v2-open__menu`, `.v2-open__name`, `.v2-open__what` |
| `.vs-nav`, `__bar`, `__brand`, `__logo`, `__links`, `__actions`, `__menu` | `.v2-nav…` (incl. 860px collapse) |
| `.vs-subnav`, `__bar` | `.v2-subnav` |
| `.vs-foot`, `__grid`, `__brand`, `__nav`, `__nav--quiet` | `.v2-foot…`, `.v2-foot__social` folded into `__nav` |
| `.vs-section`, `.vs-head-row`, `.vs-stack` | `.v2-section`, `.v2-head-row`, `.v2-stack` |
| `.vs-hero`, `__grid`, `__copy` | `.v2-hero…` |
| `.vs-frame`, `--169`, `--square`, `.vs-figure` | `.v2-frame…`, `.v2-figure` |
| `.vs-tagline`, `--signal`, `.vs-badge`, `.vs-play` | `.v2-tagline…`, `.v2-badge`, `.v2-play` |
| `.vs-filters`, `.vs-grid`, `.vs-card`, `__media`, `__body`, `__title`, `.vs-empty` | `.v2-filters`, `.v2-grid`, `.v2-card…`, `.v2-card h2/h3`, `.v2-empty` |
| `.vs-panel`, `--well`, `__what` | `.v2-app`, `--soon`, `__what` |
| `.vs-callout` | `.v2-beta-note` |
| `.vs-tiers`, `.vs-tier`, `--feature`, `__price`, `--later` | `.v2-tiers`, `.v2-tier…` |
| `.vs-steps` | `.v2-steps` |
| `.vs-signup`, `__label`, `--plain`, `__note`, `.is-error`; `.vs-field` | `.v2-signup…`, `.v2-field` |
| `.vs-shell`, `__head`, `.vs-crumbs` | `.v2-shell`, `__head`, `.v2-crumbs` |
| `.vs-article` (h2 h3 p ul ol li strong a code pre blockquote hr figcaption) | `.v2-article …` (figcaption ← `.block-image__tags`) |
| `.vs-prose`, `.vs-specs` | `.v2-prose`, `.v2-specs` |

Every `:hover` also matches `.is-hover` (checked by script). `!important` from site v2 dropped (it existed only to beat the
legacy template's bare-element rules). Link hovers were **not** added: site v2 has none on `.v2-link` / article links.

## (d) Skipped, and why

- **Page layout one-offs:** `.v2-split`, `.v2-pair`, `.v2-apps` grid, `.v2-close`, `.v2-two`, `.v2-principles`,
  `.v2-workspaces`/`.v2-ws`, `.v2-families`/`.v2-fam`/`.v2-fxlist`, `.v2-walk`, `.v2-techgrid`, `.v2-smallscreen`,
  `.v2-hero__grid` ratios beyond the hero itself — AGENTS rule 3 (one screen's layout isn't design language).
- **`.v2-works` + `@keyframes v2-works-sweep`:** a single teaser treatment; revisit if a second use appears.
- **`.v2-dialog`, `.v3feed-lightbox`:** bound to specific React components (looks dialog, ArticleImageZoom); their two
  different scrims should be unified before either becomes a system component.
- **Content-specific blocks:** `.v3credit`, `.v3legal__summary`, `.v3lineage`, `.v3pf*` (compatibility check — also the
  only users of `#4a3a14`/`#4a1f1f`), `.fxd-*` (per-effect pages), `.v2-article .v3grid / .v3feed-gallery` image grids.
- **Mobile Open-button workaround** (`.v2-nav__open-mobile`, specificity fix) and `.v2-open` `<details>` plumbing: behaviour, not style.
- **Page globals** (`html, body` background, `scroll-behavior`, `scroll-padding-top`): belong to the site app shell.

## (e) Contrast checks (WCAG 2.x relative luminance)

| text | on bg-0 `#212121` | on well `#262626` | on panel `#2a2a2a` | on bg-2 `#2b2b2b` | on bg-3 `#3a3a3a` |
|---|---|---|---|---|---|
| `--tx-0 #f4f4f4` | 14.64 | 13.76 | 13.05 | 12.87 | 10.34 |
| `--tx-1 #cfcfcf` | 10.34 | 9.71 | 9.21 | 9.09 | 7.30 |
| **`--tx-2 #8a8a8a`** | **4.66 ✓** | **4.38 ✗** | **4.16 ✗** | **4.10 ✗** | 3.29 ✗ |
| old `--v2-muted #a0a6ae` | 6.56 | 6.17 | 5.85 | 5.77 | 4.64 |
| proposed `--site-muted #969696` | 5.44 | 5.12 | 4.85 | 4.79 | 3.85 |
| (min passing alt `#949494`) | 5.31 | 4.99 | 4.73 | 4.67 | 3.75 |
| `--accent #00e5a0` | 9.75 | 9.16 | 8.69 | 8.57 | 6.89 |
| `--hover #3dffc2` | 12.48 | 11.73 | 11.13 | 10.98 | 8.82 |
| `--site-error-ink #ff9b8a` | 7.90 | 7.43 | 7.05 | 6.95 | 5.58 |

Ink on signal: `#04120d` on aqua 11.59, on hover 14.84; core `--on-accent #1c1c1c` 10.32 / 13.21.

**Verdict on muted:** `--tx-2` passes 4.5:1 on the bare ground only. Site v2 sets muted captions on fills
(`.v2-cap` inside pricing tiers, `.v3credit__label`, `.fxd-facts dt` on panel; `.v2-cap` badge text sits on a scrim).
**Proposed, not picked:** `--site-muted #969696` for muted text on fills (applied in `site.css` only inside
`.vs-panel`, `.vs-tier`, `.vs-callout`, labelled PROPOSED). Alternatives for Patrick: (1) raise core `--tx-2` itself
(affects the apps — `--tx-2` also fails on the apps' `--bg-2` panels at 4.10); (2) keep `--tx-2` and forbid muted text on fills.

Non-text (WCAG 1.4.11, 3:1): input and chip borders `#555a60` were 2.31:1 on the ground; the neutral `#595959` keeps
that (2.30) and `--ctrl-line` lowers it (1.90). Both fail 3:1 — pre-existing, not caused by the port. The input's
boundary matters most (`.vs-field input`); flag for the site owner.

## Drift from core rules (for a decision, not fixed here)

1. **Buttons are outlined, not filled.** Site `.v2-btn` = transparent + 1px `#555a60` border; core rule is `--bg-3` fill,
   no border. Secondary hover = border to `--tx-0`, not a fill. Ported as the site has it.
2. **Chips hover to grey, not aqua.** Site `.v2-chip:hover` border → `--tx-1`; core chips hover border + text → `--hover`.
3. **Signal ink** `#04120d` vs core `--on-accent #1c1c1c`.
4. **Focus offset** 3px vs core `--focus-offset` 2px (kept as `--site-focus-offset`).
5. **Caption tracking** `.v2-cap` .1em / `.v2-eyebrow` .16em vs core section head .16em — eyebrow matches core; cap doesn't.

## Uncertain

- **Fonts under next/font.** Site v2 reads `var(--font-manrope)` because next/font renames the family; core `--sans`
  names `'Manrope'` literally. On the real site, `var(--sans)` only resolves if Manrope is loaded under that family
  name (e.g. Google Fonts CSS) — otherwise the site would need to override `--sans`, which layer rule 1 forbids. Needs a decision.
- `color-mix()` for the scrims needs Chrome 111 / Safari 16.2 / Firefox 113; fine for a WebGPU product, but it is new syntax here.
