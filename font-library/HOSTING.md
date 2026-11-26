# Hosting the shared font library at fonts.v3ktr.com

What goes up is the folder the build writes (`node scripts/build-fonts.mjs --library --from <INCEPTOR dist/fonts-dist> --extras <dimensor-fonts> --out <folder>`): `v1/` (faces, catalogue, licences, NOTICE) plus the CORS files. The faces are about 51 MB and are not in this repo; `font-library/v1/` here holds the catalogue, NOTICE and licences only.

The host is an R2 bucket `v3ktr-fonts` with the custom domain `fonts.v3ktr.com` (COWORK `reports/asset-alignment/FONTS-HOST-SETUP.md` steps 1 to 3). R2 does not read a `_headers` file, so the headers are set as below.

## Paths never change content
Faces are served `immutable` for a year, so `v1/files/...` never changes in place. A changed font (a new upstream version, a re-encode with a better tool) goes under a new folder, `v2/`, with its own catalogue; never over `v1/`.

## CORS (step 4)
- Dashboard: paste `cors-dashboard.json` (the S3-style array).
- Command line: `npx wrangler r2 bucket cors set v3ktr-fonts --file cors-wrangler.json` (the `{"rules": [...]}` shape Cloudflare documents for that command; not tried against the live bucket from here).
- Then `npx wrangler r2 bucket cors list v3ktr-fonts` and keep the output: it is the proof the policy took.

## Headers (step 5): two Transform Rules, scoped
1. **All paths on `fonts.v3ktr.com`:** `Cross-Origin-Resource-Policy: cross-origin` (KOMPOSITOR is cross-origin isolated).
2. **Only** `starts_with(http.request.uri.path, "/v1/files/")` or `starts_with(http.request.uri.path, "/v1/licences/")`: `Cache-Control: public, max-age=31536000, immutable`.
   A rule for the whole hostname would make `catalogue.json` and `NOTICE.txt` immutable for a year as well, and the catalogue is the file that changes when a family is added.
3. **catalogue.json and NOTICE.txt:** set per object at upload, `--cache-control "public, max-age=3600"`:
   `npx wrangler r2 object put v3ktr-fonts/v1/catalogue.json --file <folder>/v1/catalogue.json --content-type application/json --cache-control "public, max-age=3600"`
   (the same for `v1/NOTICE.txt` with `--content-type "text/plain; charset=utf-8"`).

## Upload content types
`.woff2` as `font/woff2`, `.ttf` (Roboto Flex and Darktech LDR) as `font/ttf`, licences as `text/plain; charset=utf-8`.

## Check after upload
`curl -sI https://fonts.v3ktr.com/v1/catalogue.json` shows one `cache-control` of 3600; a face under `/v1/files/` shows the immutable one; both carry `access-control-allow-origin` and `cross-origin-resource-policy`.
The one-cache-across-the-apps check (Chromium keys its HTTP cache by top-level site, and the four apps share `v3ktr.com`) is made once the host exists, not assumed.
