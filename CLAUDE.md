@AGENTS.md

# Jungle Boys Rebuild — Root Context

Every agent reads this file first, every session. It is the antidote to multi-agent drift.
The full source-of-truth brief (docs 00–07 + 0.5 setup runbook) lives one directory up in
`../` (the `jungleboysweb` workspace folder). Doc numbers are READING order; **`05_PHASES`
is the execution timeline.**

## The stack (locked — do not relitigate)

| Layer | Tool | Role |
|---|---|---|
| Framework | Next.js App Router on Vercel | The entire site: design, motion, SEO, rendering. ISR + webhooks. |
| Content | Storyblok | Editable copy/images + per-page SEO fields. Never constrains design. |
| Commerce | Dutchie Plus (GraphQL) | Products, pricing, inventory, COA, cart, checkout. System of record. |
| Auth/Accounts | Dutchie/Dovetail | Owns auth, loyalty, orders. We style branded shells ONLY. |
| Database | Supabase (minimal) | ONLY: `leads` (+TCPA consent ledger) and `retailers` (Product Finder). RLS always on. |
| Marketing | Klaviyo (swappable interface) | Lead destination + copy to LEAD_NOTIFY_EMAIL. |
| Analytics | GA4 + Vercel Analytics | Traffic + server-side events. |

## Locked decisions (00 §9)

- Data fetching: **ISR + Dutchie webhooks** (`/api/revalidate`, secret-gated — already built).
- CMS: **Storyblok** (chosen over Sanity). Supabase stays minimal — no accounts, no auth, no PII beyond leads.
- Age gate: **DOB modal + CA/FL state selector**, client overlay; never blocks crawlers from indexable content.
- COA data **flows from Dutchie** through the same product pipeline. No separate COA system.
- Leads: `/api/lead` → Supabase (consent logged) → Klaviyo + email. Destination behind an interface (swappable).
- Two-map rule: **Locations** (owned stores → Dutchie menus) and **Product Finder** (`/find-jb-products`,
  3rd-party stockists → Supabase) are separate templates that never share a data source or component.
- **Rewards landing is `/rewards`, not `/loyalty` (Avanti, 2026-07-19 — supersedes brief docs 00/03/05):**
  a custom landing page explaining the entire loyalty/rewards program. `/app` and `/pwf-reward` both
  301 → `/rewards`. `/profile-reward` stays as a styled auth shell (logged-in rewards view).
- **`/verify` template (Avanti, 2026-07-19 — adds to brief 00 §7):** product-authenticity
  verification page (customer scans QR or enters scratch code to confirm the product is genuine).
  A main anchor of the new build at the preserved `/verify` URL (currently 404s despite ~3.7k
  clicks/yr). Anti-counterfeit = brand protection. Backend/data source for code verification: TBD —
  discover what system powered the old page before building (Phase 1 planning question for Avanti).
- **Products vs Shop rule (Avanti, 2026-07-19 — refines brief 00 §7 items 12–13):** the **Products tab**
  is a curated JB-only collection — each product line (Hash Holes, Pre-Rolls, 10-Pack Prerolls, Premium
  Flower…) gets its own custom design-heavy landing page with a shop option (these are the Phase 2 Figma
  pages). **URL decision (Avanti 2026-07-19): line pages nest under `/products/` —** e.g.
  `/products/hash-hole` — and today's flat URLs (`/hash-hole`, `/pre-rolls`, `/10-pack-prerolls`,
  `/premium-flower`) 301 to their nested equivalents. The **Shop** is separate: full store inventory via Dutchie
  (location menus / listing with filters). Do not merge these two surfaces.

## The one rule above all (06 §7)

**Foundation first, frozen, then parallelize — and security gates every phase.**
No feature agent (content-templates / commerce / product-experience) builds until BOTH Phase 0
freeze gates pass: **design-token freeze** + **data-model freeze**. No phase is accepted with an
open high/critical security finding. Agent roster lives in `.claude/agents/`.

## URL mandate (03)

Every existing URL resolves identically or 301-redirects single-hop. Never change a URL without a
redirect-map entry; never chain redirects; never ship ranking-relevant content client-only; faceted
filters canonicalize to parent + noindex beyond primary categories; auth/utility routes stay noindex.

## Security invariants (04 §9)

1. No secret is ever client-side (`NEXT_PUBLIC_`) or committed. Real values live in Vercel env vars;
   Avanti enters them herself — never pasted into chat, never handled by an agent in plaintext.
2. Dutchie owns auth/PII/payments; we never store, log, or intercept credentials or payment data.
3. Supabase holds only leads (+consent) and public retailer data; RLS always on; no client writes to
   `leads`; API access grants are explicit (auto-expose is OFF — see `supabase/migrations/0002`).
4. Every API route/webhook authenticates its caller and rate-limits.
5. All CMS content and URL params are untrusted → sanitized/validated.
6. Full security headers + strict CSP on every response.
7. Every imported dependency/repo is vetted before use.
8. The security audit (04 §8) runs and passes at the end of every phase.

## Compliance invariants (07 §7)

21+ DOB gate + CA/FL selector on entry (crawlers still reach indexable content). TCPA consent text
preserved EXACTLY; every lead's consent + timestamp logged in Supabase. Privacy policy reflects
reality (we hold only leads). Lead data deletable on request (CCPA). State-appropriate messaging
(CA adult-use / FL medical) + license numbers + cannabis warnings. Promo disclaimers on deals
templates. No PII in URLs, logs, or analytics.

## Design system

`design-system/MASTER.md` is the token source (generated via ui-ux-pro-max; dials: variance 7,
motion 7, density 4). **Not yet reconciled with Figma — token freeze is OPEN.** Figma:
`figma.com/design/yi6FfGahKw0D04E1t9Unvb/Jungle-Boys-Webdesign`. Brand anchors: charcoal base
(`#111111`/`#0A0B0D` range), JB stacked logo, "PLAYING WITH FIRE®", "SINCE 2006". Per-page
direction arrives via `⟦FILL⟧` slots in brief doc 02. Motion: GSAP + ScrollTrigger, three tiers
(Subtle/Standard/Complex); every animation has a `prefers-reduced-motion` fallback; animate
transform/opacity only; motion never blocks LCP.

## Recorded decisions & gate status

- **Branch protection on `main`: DEFERRED by Avanti's decision (2026-07-19)** — off during Phase 0
  foundation work to avoid merge-friction. **MUST be enabled when Phase 1 feature work starts;
  non-negotiable before cutover.** Documentation agent: raise this at the Phase 1 entry gate.
- **Data-model freeze: CANDIDATE.** `lib/dutchie/` (frozen types + provider interface), Supabase
  schema (migrations 0001/0002), and Storyblok content models (`content/models/`) are defined.
  Freeze passes after Orchestrator review at Phase 0 exit.
- **Design-token freeze: OPEN.** `design-system/MASTER.md` generated but not Figma-reconciled.

## Project-learned invariants (Documentation agent: append, don't rewrite)

- **This repo's Next.js is newer than training data.** Read `node_modules/next/dist/docs/` before
  using unfamiliar APIs. Known: `revalidateTag(tag, profile)` requires the 2nd arg (use `'max'`);
  `_`-prefixed folders under `app/` are private and never route.
- Supabase project region: `us-west-1`; Vercel function region pinned to match (sfo1).
- Deploy domain: `jungleboys-web.vercel.app` (project name `jungleboys` under the-design-lab team).
- Higgsfield/Motion MCP assets must enter via the `media_import_url` workflow (sandbox CDN blocked).
- Env var names are documented in `.env.example` (names only). `DUTCHIE_PLUS_*` stay blank until Phase 3.
- **The live site's auth paths are `/login`, `/signup`, `/auth`, `/callback`, `/forgot-password`,
  `/reset-password`, `/delete-account` — NOT the `/sign-in` paths assumed in brief docs 00/03.**
  Auth-shell templates must use the real paths (URL preservation). See `seo/url-inventory.csv`
  (44-URL authoritative list from the Webflow sitemap, enabled 2026-07-19).
- Dev server: use the workspace `.claude/launch.json` config (`jungleboys-web-dev`, autoPort on —
  port 3000 is often held by the GG project's server; never kill processes on 3000).
