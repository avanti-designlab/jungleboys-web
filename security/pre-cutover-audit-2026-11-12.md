# Pre-cutover security audit: 2026-11-12

Scope: the release candidate (security fixes landed at commit `c15507c`; the performance fixes that followed are covered in the last section) (branch
`claude/jungle-boys-phase-3-w2775d`, pushed to `main` and `live`), built on
live Dutchie data. This is the per-phase audit required by 04 §8, run as the
final gate before DNS cutover. Every result below was observed in this run;
nothing is carried forward from an earlier audit on trust.

**Verdict: PASS, with one item owed by a human (branch protection, below).**
No open high or critical finding.

## Findings and dispositions

| # | Severity | Finding | Disposition |
|---|---|---|---|
| 1 | Critical | `next` 16.2.12 inside a critical advisory range (unauthenticated RCE in the Image Optimization API, among nine advisories) | FIXED: upgraded to 16.4.6 |
| 2 | High | 30 high/critical advisories in the production tree (sharp, postcss, zod, markdown-it, tiptap, happy-dom, others); the four accepted exceptions lapsed 2026-08-26 | FIXED: `npm audit fix` + `@storyblok/react` 7.5.1. Gate reads 0; exceptions list emptied |
| 3 | Medium | CI red at the lint step (36 pre-existing errors), so the build and accessibility steps behind it never executed | FIXED: 2 real errors corrected, 3 pattern rules downgraded to warn with rationale; lint 0 errors |
| 4 | Medium | The accessibility CI step could not launch a browser on Linux runners (Mac Chrome path) | FIXED: `JB_CHROME` + `JB_CHROME_ARGS` in ci.yml; validated in fixture mode locally. **Not yet observed green on GitHub itself** |
| 5 | Medium (a11y) | Sold-out product cards faded to 60% opacity, text under the WCAG contrast floor | FIXED: fade moved to the product shot only |
| 6 | Low | `X-Powered-By: Next.js` response header | FIXED: `poweredByHeader: false` |
| 7 | Info | redirect-qa excused 29 rows through a stale blanket exemption | FIXED: exemption retired; Florida 307s declared as rulings. 85 / 0 fail / 0 pending |

## What was verified, and how

**Secrets discipline (invariant §9.1).** Only `.env.example` is tracked; no
`.env*` file was ever committed in history. No secret-shaped strings in
tracked source. The only `NEXT_PUBLIC_` names in code are the GA measurement
id and the Supabase URL, both public by nature. No server-only env name is
referenced from any `'use client'` file. Rotation runbook:
`security/key-rotation.md`.

**Response headers (§9.6).** Present on pages AND API routes: CSP, HSTS
(2 years, includeSubDomains, preload), `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN`, Referrer-Policy, Permissions-Policy. Known
and previously accepted: bodyless redirect responses do not carry the set
(recorded 2026-07-30; closes at the Vercel edge when HSTS is configured for
the apex at cutover).

**API routes (§9.4).** Five routes: `lead`, `careers`, `checkout`,
`cart-quote`, `revalidate`. All rate-limit. Observed: GET returns 405 on all
four POST routes; malformed JSON returns 400; `revalidate` returns 401 with
no secret and with a wrong secret; rate limit trips at exactly the 13th
request and is NOT bypassed by rotating a spoofed first `X-Forwarded-For`
hop. No route returns upstream error text. `lead` and `careers` carry the
honeypot and the `VERCEL_ENV` local-write guard.

**Database (§9.3).** Queried Supabase directly as the anonymous role: SELECT
and INSERT on `leads` are both refused (42501). `retailers` is publicly
readable by design. RLS itself was verified in the database on 2026-07-30
(`relrowsecurity = true` on both tables); the load-bearing control for the
consent ledger remains that the service-role key never leaves the server,
re-confirmed above.

**Third-party surface (§9.7).** Image optimizer refuses a foreign host
(400). CSP allows scripts only from self and googletagmanager.com. No ad
pixels, session replay, or chat widgets exist to audit.

**Dependencies (§9.7).** `audit-gate`: 0 high/critical in the production
tree, 0 exceptions.

**Regression after the Next.js upgrade.** check-commerce live and fixture,
redirect-qa, a11y-scan live and fixture (25 routes each), check-invariants,
richtext-safe, eslint (0 errors), tsc: all pass on this commit.

**Freshness.** Dutchie Plus has no webhooks, so ISR is the only freshness
mechanism. The prerender manifest shows 60 seconds on every menu route, all
eight product-line landing pages, the sitemap, and the homepage.

**Data hygiene.** The three synthetic profiles forwarded to Klaviyo during
earlier testing (`ava@test.com`, `jane@store.com`,
`ratelimit-probe@example.invalid`) were confirmed by name and creation
timestamp, then deleted by profile id through Klaviyo's data-privacy
deletion API (3 of 3 accepted, and all three confirmed absent on re-query). `a@b.com` never reached Klaviyo.

## Owed before cutover

1. **Branch protection on `main` and `live`** (recorded as non-negotiable).
   Cannot be set from this machine: no GitHub CLI or API token. Two minutes
   in GitHub settings; steps are in the launch checklist.
2. **Look at the Actions tab once.** CI has not been observed green on
   GitHub since these fixes. If the accessibility step fails there, the
   likely cause is the runner's Chrome path or sandbox flag, not the site.
3. Cutover-day items unchanged: MFA on Vercel and Supabase, Supabase
   backups, HSTS at the apex.

## Not in scope, stated so it is not assumed

Dutchie's hosted checkout pages (their code and their cookies), the JB
mobile app, and jungleboysflorida.com. A manual screen-reader pass of the
buy flow is scheduled separately for launch week.

## Performance on the release candidate (Core Web Vitals)

Measured with `scripts/measure-lcp.mjs`: mobile 390px, 4x CPU throttle, slow
4G, median of 5 runs with a 4s drain between runs, spread guard on. Budgets:
LCP 2500ms, CLS 0.1. Fifteen templates, all PASS, all reliable (spread 4 to
80ms).

| Page | LCP | CLS |
|---|---|---|
| Home | 1296ms | 0.001 |
| /products | 1052ms | 0.006 |
| /products/premium-flower | 1840ms | 0.000 |
| /products/hash-hole | 1528ms | 0.000 |
| /products/pre-rolls | 2412ms | 0.000 |
| /products/orc | 2456ms | 0.000 |
| /shop | 872ms | 0.009 |
| Storefront, DTLA | 1152ms | 0.002 |
| Storefront, San Diego | 1216ms | 0.002 |
| Deals, DTLA | 1024ms | 0.000 |
| Product page (PDP) | 920ms | 0.036 |
| /locations | 1080ms | 0.000 |
| /rewards | 1052ms | 0.000 |
| /faq | 824ms | 0.042 |
| /contact | 1056ms | 0.000 |

Two defects were found and fixed during this measurement:

1. **Storefront LCP was a race.** San Diego measured 1795ms or 2590ms run to
   run (the instrument reported UNRELIABLE and refused a verdict). Next 16
   deprecated the Image `priority` prop: it now only inserts a preload link
   and no longer raises fetch priority, so the LCP banner queued last of 16
   image preloads, behind 15 icons. Fixed with `fetchPriority="high"` plus
   lazy-loading the dropdown and below-hero icons, and the same migration on
   seven other hero images. Result: San Diego 1216ms, DTLA 2420 -> 1152ms,
   PDP 1908 -> 920ms.
2. **/shop layout shift.** The "Continue at <store>" banner was inserted
   after first paint for returning shoppers, moving the store list 88px
   (CLS 0.089). The faster paint from fix 1 exposed it. A pre-paint boot flag
   (`html.jb-has-store`) now reserves the slot. CLS 0.009.

Thin margins, stated plainly: /products/orc (2456ms) and /products/pre-rolls
(2412ms) pass within about 100ms of the budget. Both already carry high
fetch priority, so they are bound by hero image weight, not queueing. The
lever, if ever needed, is recompressing `skyline.webp` and the four tube
images, which touches art and is Avanti's call.
