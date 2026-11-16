// design.v3ktr.com: the design-system specimen behind a secret link, the same gate as the staging sites (Patrick 2026-11-16, Decisions card DS-specimen-address).
// Visit once with ?key=<STAGE_KEY>: the key becomes a 30-day cookie and the URL drops it. Without the cookie every path is a plain 404, and nothing is indexed.
// Secret: STAGE_KEY (wrangler secret put STAGE_KEY). Assets: the folder scripts/publish-specimen.mjs builds.
const COOKIE = 'v3ktr_stage_ds';
const DAYS = 30;
const eq = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let d = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) d |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return d === 0;
};
const cookieOf = (req) => {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\s*)' + COOKIE + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
};
const SECURITY = [
  ['x-content-type-options', 'nosniff'],
  ['referrer-policy', 'strict-origin-when-cross-origin'],
  ['x-frame-options', 'DENY'],
  ['content-security-policy', "frame-ancestors 'none'"],
  ['permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'],
  ['strict-transport-security', 'max-age=31536000'],
];
const notFound = () => new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain', 'x-robots-tag': 'noindex, nofollow', 'cache-control': 'no-store' } });
export default {
  async fetch(req, env) {
    if (!env.STAGE_KEY) return notFound();
    const url = new URL(req.url);
    const key = url.searchParams.get('key');
    if (key !== null) {
      if (!eq(key, env.STAGE_KEY)) return notFound();
      url.searchParams.delete('key');
      return new Response(null, { status: 302, headers: {
        location: url.pathname + (url.search || ''),
        'set-cookie': `${COOKIE}=${encodeURIComponent(env.STAGE_KEY)}; Max-Age=${DAYS * 86400}; Path=/; Secure; HttpOnly; SameSite=Lax`,
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      } });
    }
    if (!eq(cookieOf(req), env.STAGE_KEY)) return notFound();
    if (url.pathname === '/') url.pathname = '/specimen/index.html';
    const res = await env.ASSETS.fetch(new Request(url, req));
    const out = new Response(res.body, res);
    out.headers.set('x-robots-tag', 'noindex, nofollow');
    out.headers.set('cache-control', (res.headers.get('content-type') || '').includes('text/html') ? 'no-store, no-transform' : 'no-store');
    for (const [k, v] of SECURITY) out.headers.set(k, v);
    return out;
  },
};
