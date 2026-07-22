// ─── REDIRECT MAP v1 (03 §4 — from seo/url-inventory.csv) ────────────────────
// Every rule is single-hop 301 (permanent: true). No chains. Owned by the
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

  // Deal-page rotations — flattened, single hop. INTERIM: /710-deals is a Phase-2
  // (Dutchie) page that doesn't exist yet, so these point at /rewards (live) to
  // avoid a soft-404. RESTORE destination to '/710-deals' once that page ships.
  { source: '/420-deals', destination: '/rewards', permanent: false },
  { source: '/april-deals', destination: '/rewards', permanent: false },
  { source: '/may-deals', destination: '/rewards', permanent: false },
  { source: '/june-deals', destination: '/rewards', permanent: false },

  // Rewards consolidation — /rewards is the loyalty landing (supersedes /loyalty)
  { source: '/app', destination: '/rewards', permanent: true },
  { source: '/pwf-reward', destination: '/rewards', permanent: true },

  // Product authentication moved to /auth (BatchSys verify + scan flow)
  { source: '/verify', destination: '/auth', permanent: true },

  // Product-line landings nest under /products (Avanti decision)
  { source: '/hash-hole', destination: '/products/hash-hole', permanent: true },
  { source: '/pre-rolls', destination: '/products/pre-rolls', permanent: true },
  { source: '/10-pack-prerolls', destination: '/products/10-pack-prerolls', permanent: true },
  { source: '/premium-flower', destination: '/products/premium-flower', permanent: true },
]
