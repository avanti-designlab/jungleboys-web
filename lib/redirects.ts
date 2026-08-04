// ─── REDIRECT MAP v1 (03 §4 — from seo/url-inventory.csv) ────────────────────
// Every rule is single-hop and permanent (Next emits 308 for permanent: true). No chains. Owned by the
// SEO/Schema agent; changes require an inventory row. QA'd against staging
// before cutover by the redirect QA script.

type Redirect = {
  source: string
  destination: string
  permanent: boolean
}

const CA_LEGACY: Array<[string, string]> = [
  ['jungle-boys-dtla', 'downtown-los-angeles'],
  ['jungle-boys-pomona', 'pomona'],
  ['jungle-boys-orange-county', 'orange-county'],
  ['jungle-boys-san-diego', 'san-diego'],
]

export const redirects: Redirect[] = [
  // Legacy CA menu format (+ deep links) — GBP history points here
  ...CA_LEGACY.map(([old, slug]) => ({
    source: `/menu/${old}`,
    destination: `/menu/california/${slug}`,
    permanent: true,
  })),
  ...CA_LEGACY.map(([old, slug]) => ({
    source: `/menu/${old}/:path*`,
    destination: `/menu/california/${slug}`,
    permanent: true,
  })),

  // Legacy FL menu format — one param rule covers all cities (+ deep links)
  {
    source: '/menu/florida/jungle-boys-:city',
    destination: '/menu/florida/:city',
    permanent: true,
  },
  {
    source: '/menu/florida/jungle-boys-:city/:path*',
    destination: '/menu/florida/:city',
    permanent: true,
  },

  // Closed stores → locations index (confirmed by Avanti)
  { source: '/menu/arizona/:path*', destination: '/locations', permanent: true },
  { source: '/menu/tlc-collective', destination: '/locations', permanent: true },
  { source: '/menu/tlc-collective/:path*', destination: '/locations', permanent: true },

  // Deal-page rotations — flattened, single hop. The evergreen /deals door
  // shipped 2026-08-04 (routes visitors to their store's live deals), so the
  // month rotations land there instead of the /rewards interim.
  { source: '/420-deals', destination: '/deals', permanent: false },
  { source: '/april-deals', destination: '/deals', permanent: false },
  { source: '/may-deals', destination: '/deals', permanent: false },
  { source: '/june-deals', destination: '/deals', permanent: false },

  // INTERIM, same pattern as the deal rotations above: these three are linked
  // from live chrome (mobile tab bar, /products "explore more" cards, the
  // header Log in control) but their Phase-3 destinations do not exist yet, so
  // every one of them was a crawlable 404 on the primary category page and on
  // all seven line pages. Pointing them at the nearest live surface keeps the
  // links honest and stops the crawl budget draining into dead ends.
  // RESTORE all three to their real destinations when Phase 3 ships.
  { source: '/710-deals', destination: '/deals', permanent: false },
  { source: '/drops', destination: '/products', permanent: false },
  // /login RESTORED (2026-08-04): the styled auth shell exists now — the
  // interim /rewards pointer is gone. /signup etc. stay pending.

  // Rewards consolidation — /rewards is the loyalty landing (supersedes /loyalty)
  { source: '/app', destination: '/rewards', permanent: true },
  { source: '/pwf-reward', destination: '/rewards', permanent: true },

  // /verify is RETIRED (Avanti, 2026-07-30). It served an older verification
  // process that the rebuild does not use; /auth is the real product-auth flow
  // and the printed sticker format (jungleboys.com/auth/<CODE>).
  //
  // PERMANENT (308), not the temporary redirect this was before. A 307 says
  // "this URL is coming back", which was right while /verify was still planned
  // as a page and is wrong now that it is deliberately gone. A 308 tells Google
  // to fold /verify's history into /auth and stop offering the old URL — which
  // is what retiring it means. The ~3.7k clicks/yr land on the flow they were
  // looking for either way.
  { source: '/verify', destination: '/auth', permanent: true },

  // /about 404s today and carries ~144 clicks/yr. TEMPORARY on purpose: the URL
  // inventory still intends a real /about, so a 308 would tell Google it is
  // never coming back. The redirect-qa exemption that was hiding this 404 under
  // a "Phase 3" label has been removed.
  { source: '/about', destination: '/', permanent: false },

  // Product-line landings nest under /products (Avanti decision)
  { source: '/hash-hole', destination: '/products/hash-hole', permanent: true },
  { source: '/pre-rolls', destination: '/products/pre-rolls', permanent: true },
  { source: '/10-pack-prerolls', destination: '/products/10-pack-prerolls', permanent: true },
  { source: '/premium-flower', destination: '/products/premium-flower', permanent: true },
]
