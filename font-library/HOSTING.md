# Hosting the shared font library at fonts.v3ktr.com

What goes up is the folder the build writes (`node scripts/build-fonts.mjs --library --from <INCEPTOR dist/fonts-dist> --extras <dimensor-fonts> --out <folder>`): `v1/` (faces, catalogue, licences, NOTICE) plus the CORS files. The faces are about 51 MB and are not in this repo; `font-library/v1/` here holds the catalogue, NOTICE and licences only.

The host is an R2 bucket `v3ktr-fonts` with the custom domain `fonts.v3ktr.com` (COWORK `reports/asset-alignment/FONTS-HOST-SETUP.md` steps 1 to 3). R2 does not read a `_headers` file, so the headers are set as below.

## Paths never change content
Faces are served `immutable` for a year, so `v1/files/...` never changes in place. A changed font (a new upstream version, a re-encode with a better tool) goes under a new folder, `v2/`, with its own catalogue; never over `v1/`.

## CORS (step 4)
- Dashboard: paste `cors-dashboard.json` (the S3-style array).
- Command line: `npx wrangler r2 bucket cors set v3ktr-fonts --file cors-wrangler.json` (the `{"rules": [...]}` shape Cloudflare documents for that command; **it took on the live bucket, 2026-11-27**).
- Then `npx wrangler r2 bucket cors list v3ktr-fonts` and keep the output: it is the proof the policy took.

## Headers: set per object at upload (as done on the live bucket, 2026-11-27)
R2 does not read a `_headers` file, and the wrangler login that set the bucket up can read zones but not make Transform Rules, so **every object carries its own `Cache-Control`, set at upload** (`npx wrangler r2 object put v3ktr-fonts/<path> --file <file> --content-type <type> --cache-control "<value>"`):
- **Faces under `v1/files/` and licences under `v1/licences/`:** `--cache-control "public, max-age=31536000, immutable"`.
- **`v1/catalogue.json` and `v1/NOTICE.txt`:** `--cache-control "public, max-age=3600"` (the catalogue is the file that changes when a family is added, so it must not be immutable).
  `npx wrangler r2 object put v3ktr-fonts/v1/catalogue.json --file <folder>/v1/catalogue.json --content-type application/json --cache-control "public, max-age=3600"`
  (the same for `v1/NOTICE.txt` with `--content-type "text/plain; charset=utf-8"`).
- **`Cross-Origin-Resource-Policy` is not set, on purpose.** Measured on the live host in headless Edge on a page that is cross-origin isolated (COOP same-origin, COEP require-corp): a `FontFace` load of a face and the catalogue fetch both work, because the CORS header satisfies COEP; a no-cors fetch of the same face is blocked (`ERR_BLOCKED_BY_RESPONSE`). So CORP only matters to an app that loads these files **without CORS** (a plain `<img>`-style or no-cors fetch). Every consumer here uses `FontFace` or `fetch` with CORS. If one ever needs no-cors loading, add one Transform Rule for the hostname: `Cross-Origin-Resource-Policy: cross-origin`.
- If Transform Rules are ever used for the cache instead, the `immutable` rule must be scoped to `starts_with(http.request.uri.path, "/v1/files/")` or `"/v1/licences/"` only: a rule for the whole hostname would make `catalogue.json` and `NOTICE.txt` immutable for a year as well. The build's `_headers` file is for a host that reads one (Cloudflare Pages or a Worker), not for the R2 custom domain.

## Upload content types
`.woff2` as `font/woff2`, `.ttf` (Roboto Flex and Darktech LDR) as `font/ttf`, licences as `text/plain; charset=utf-8`.

## Check after upload
`curl -sI https://fonts.v3ktr.com/v1/catalogue.json` shows one `cache-control` of 3600; a licence under `/v1/licences/` or a face under `/v1/files/` shows the immutable one; all carry `access-control-allow-origin: *` and expose `Content-Length` and `ETag`. Confirmed on the live host on 2026-11-27 (catalogue and NOTICE 3600, licence immutable).
The one-cache-across-the-apps check (Chromium keys its HTTP cache by top-level site, and the four apps share `v3ktr.com`) is made now that the host exists, not assumed.
