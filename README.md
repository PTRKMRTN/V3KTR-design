# V3KTR-design

The one source of truth for how every V3KTR surface looks: PROCESSOR, KOMPOSITOR, DIMENSOR and v3ktr.com.
Apps **consume** it; they never hand-copy it.

| File | What |
|---|---|
| `tokens.css` | The tokens as CSS custom properties. **Source of truth.** |
| `tokens.json` | Generated from `tokens.css` (`node scripts/build-json.mjs`) for TS and tooling. |
| `AGENTS.md` | Rules for any session doing design work. Read before building UI. |
| `CHANGELOG.md` | Semver history. |

## Consuming it

**Build-time pull, pinned tag.** An app's build step fetches `tokens.css` at a release tag and inlines it in place of its own `:root`:

```
https://cdn.jsdelivr.net/gh/PTRKMRTN/V3KTR-design@v0.1.0/tokens.css
https://raw.githubusercontent.com/PTRKMRTN/V3KTR-design/v0.1.0/tokens.css
```

Don't load it at runtime in a live app: it adds a network dependency and a flash of unstyled page.
To take a change, bump the pinned tag in the app and rebuild. A weekly drift check compares each app's tokens with its pinned version.

**Referencing it.** Each app repo's `CLAUDE.md` points here, so any design build reads `AGENTS.md` and uses tokens instead of raw values.

## Changing a token
Edit `tokens.css` → `node scripts/build-json.mjs` → CHANGELOG entry → bump the version in the `tokens.css` header → tag `vX.Y.Z`.
