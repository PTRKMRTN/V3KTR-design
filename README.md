# V3KTR-design

The one source of truth for how every V3KTR surface looks: PROCESSOR, KOMPOSITOR, DIMENSOR and v3ktr.com.
Apps **consume** it; they never hand-copy it.

| File | What |
|---|---|
| `tokens.css` | **Core** tokens, shared by every surface. Source of truth. |
| `app/app.css` | **App layer**: tool UI taken from PROCESSOR (`vk-` classes). `app/INVENTORY.md` maps each to its PROCESSOR selector + drift. |
| `site/site.css` | **Site layer**: website scale and components from site v2 (`vs-` classes, `--site-*`). `site/INVENTORY.md` likewise. |
| `dist/app.css`, `dist/site.css` | What consumers pull: core + one layer (`node scripts/build-dist.mjs`). |
| `specimen/index.html` | The whole system on one page (`node scripts/build-specimen.mjs`). |
| `brand/` | Logos: master, solo, and one per app (`currentColor`; `brand/colour/` has baked-in colours). Rules in `brand/README.md`. |
| `tokens.json` | Generated from `tokens.css` (`node scripts/build-json.mjs`). |
| `AGENTS.md` | Rules for any session doing design work. Read before building UI. |
| `CHANGELOG.md` | Semver history. |

## Consuming it

**Build-time pull, pinned tag.** An app's build step fetches its bundle at a release tag and inlines it in place of its own `:root`:

```
https://cdn.jsdelivr.net/gh/PTRKMRTN/V3KTR-design@v0.3.0/dist/app.css    # apps
https://cdn.jsdelivr.net/gh/PTRKMRTN/V3KTR-design@v0.3.0/dist/site.css   # website
```

Don't load it at runtime in a live app: it adds a network dependency and a flash of unstyled page.
To take a change, bump the pinned tag in the app and rebuild. A weekly drift check compares each app's tokens with its pinned version.

**Referencing it.** Each app repo's `CLAUDE.md` points here, so any design build reads `AGENTS.md` and uses tokens instead of raw values.

## Who pulls what
- **PROCESSOR:** `design.json` + `scripts/pull-design.mjs` write `tokens.css` + `themes/themes.css` at a pinned tag into a generated block in `index.html`; the build checks it.
- **Website (site-v2):** `design.json` + `scripts/pull-design.mjs` vendor `dist/site.css` and `brand/` at a pinned tag, with a prebuild check.
- **KOMPOSITOR, DIMENSOR:** not yet; their CLAUDE.md points design work here.

## Changing something
Edit `tokens.css` or a layer → `node scripts/build-json.mjs && node scripts/build-dist.mjs && node scripts/build-specimen.mjs` → CHANGELOG entry → bump the version in the `tokens.css` header → tag `vX.Y.Z`. Layer rules are in `AGENTS.md`.
