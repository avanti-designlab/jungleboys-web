# SEO — URL Inventory Master (03 §2)

`url-inventory.csv` is the migration control document: every legacy URL on
www.jungleboys.com and what happens to it at cutover. Owned by the SEO/Schema
agent. The redirect QA script asserts every row resolves 200 or 301→200
single-hop against staging before cutover, and against production after.

## Sources (2026-07-19)

1. Ahrefs Technical Audit export (⚠️ truncated — 30 rows/sheet cap)
2. Live-site nav crawl (all nav-linked internal URLs)
3. Webflow redirects export (`jungleboys-2026-07-19.csv` — revealed the
   4-hop deals chain: /420-deals→/april-deals→/may-deals→/june-deals→/710-deals,
   flattened to single-hop 301s in this inventory)
4. Brief doc `03_SEO_URL_PRESERVATION` §3

## Key finding

The live LA site is ~32 URLs. Templates like /products, /strains, /drops,
/specials, /blog, /faq, /coa, /sign-in, /about, /careers **do not exist on the
current site** (404) — they are NEW in the rebuild, carry no legacy equity, and
need no redirects.

## Open items

- [ ] `earns_traffic` column — populate from Avanti's GSC top-pages export
- [ ] `/profile-reward` destination — confirm with Avanti (likely /loyalty)
- [ ] Deal-redirect final targets — confirm /710-deals stays the promo landing
      (vs consolidating under /specials) before implementing
- [ ] Cross-check against the Webflow Designer page list (static + CMS) for
      unlinked pages the crawl can't see
- [ ] Brief says 16 FL locations; nav shows 14 — confirm the store list
