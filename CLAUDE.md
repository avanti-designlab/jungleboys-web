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
- Age gate (**revised by Avanti 2026-07-19, supersedes brief 00 §9/07 §1 DOB approach**): simple
  YES/NO matching the live design (yellow "WELCOME TO THE JUNGLE", mascot characters on buttons).
  No DOB entry. Client overlay; never blocks crawlers. Counsel reviews before cutover. CA/FL state
  selection moved out of the gate — it lives in the locations/menu UX (decide in Phase 3).
- COA data **flows from Dutchie** through the same product pipeline. No separate COA system.
- Leads: `/api/lead` → Supabase (consent logged) → Klaviyo + email. Destination behind an interface (swappable).
- Two-map rule: **Locations** (owned stores → Dutchie menus) and **Product Finder** (`/find-jb-products`,
  3rd-party stockists → Supabase) are separate templates that never share a data source or component.
- **Store count (verified live 2026-07-19; brief's "16 FL" is stale):** 4 CA + **15 FL** stores on
  `/locations` — but only **14 FL menu pages** exist. **St. Petersburg is listed with NO menu page**;
  the rebuild adds `/menu/florida/st-petersburg` (embed variant) if an embed exists — ask Avanti/FL
  team for the St. Pete Dutchie embed when building Phase 1 locations.
- **CA-native / FL-embed rule (Avanti, 2026-07-19 — refines brief 01 §4 + 05 Phase 3):** only the
  **4 California menus** are built natively on the Dutchie Plus API (we have no FL API access, only
  their embed codes). The **14 (soon 15) Florida pages** stay as Dutchie embeds inside a branded shell — kept
  for traffic, deliberately not the design/SEO focus (FL's transactional site is jungleboysflorida.com,
  run by the FL team, who also control FL GBPs). The location-menu template therefore has TWO variants:
  CA (native API) and FL (embed shell). Full FL merge into the main site = future project, OUT of scope.
- **Rewards landing is `/rewards`, not `/loyalty` (Avanti, 2026-07-19 — supersedes brief docs 00/03/05):**
  a custom landing page explaining the entire loyalty/rewards program. `/app` and `/pwf-reward` both
  301 → `/rewards`. `/profile-reward` stays as a styled auth shell (logged-in rewards view).
- **Media template = VIDEO HUB (Avanti, 2026-07-19 — resolves brief 00 §7 "type TBD"):** a gallery of
  (a) YouTube documentaries **auto-pulled from the JB channel** (server-side feed fetch + ISR — new
  uploads appear automatically, no manual step) and (b) **manually-added videos via Storyblok**
  (`media_video` content model: YouTube URL or uploaded file, featured flag). Both merge into one
  gallery. Every video emits `VideoObject` JSON-LD. A brand-priority surface — treat with Standard
  motion tier, video-first layout. Full-archive/stats upgrade (YouTube Data API key) deferred/optional.
  **Channel (confirmed): youtube.com/@JungleBoysfilms — channelId `UC3FkXgy37Xc5tRBl4ltHuDA`;
  uploads feed `youtube.com/feeds/videos.xml?channel_id=UC3FkXgy37Xc5tRBl4ltHuDA` (verified working).**
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

## Phase status

**PHASE 0: CLOSED (2026-07-19)** — setup runbook 0–9 complete, freezes passed (tagged), security
audit PASS incl. lead-pipeline addendum. **PHASE 1: ACTIVE** — shell + home shipped (intro, inverting
condensing header, menu, hero deck, cards, footer, themes, cookie consent, mobile tab bar); content
templates + Storyblok wiring remain. Lead pipeline LIVE end-to-end (Klaviyo forwarding verified).
Open: LEAD_NOTIFY_EMAIL delivery mechanism (no email provider — Klaviyo flow vs Resend, Avanti decides);
Lemon Milk Pro files pending purchase.

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

**LIGHT + DARK MODE — SITE-WIDE REQUIREMENT (Avanti, 2026-07-19):** the entire build must support
both themes. Rules for every agent: (1) components NEVER hard-code colors — tokens only (the token
set already carries dark defaults at `:root` and a light scope in `.theme-light`; these become the
two theme maps); (2) a `data-theme` switch on `<html>` will drive the site-wide mode (system
preference + user toggle, persisted) — infrastructure lands in Phase 1; (3) AA contrast must pass
in BOTH themes (dark sweep done; light sweep required at theme-system build); (4) imagery/overlays
must be checked in both modes. DECIDED (Avanti 2026-07-19): toggle lives in the sticky
header right of the socials pill; DEFAULT IS LIGHT. Built: light tokens at :root,
dark under [data-theme='dark'], no-flash boot script, persisted localStorage 'jb-theme'.
Brand surfaces (footer, menu overlay, age-gate panel) stay dark in both modes by design.

`design-system/MASTER.md` is the token source (generated via ui-ux-pro-max; dials: variance 7,
motion 7, density 4). **Reconciled + FROZEN 2026-07-19 (see gate status above).**

**Design source-of-truth policy (Avanti, 2026-07-19 — Figma is STALE in places):**
1. **Live Webflow site** = truth for structure + current content (headers, hamburger, footer,
   landing-page details were updated in Webflow and never back-ported to Figma).
2. **Figma** (`figma.com/design/yi6FfGahKw0D04E1t9Unvb/Jungle-Boys-Webdesign`) = truth for copy,
   data, and design intent. Access via `FIGMA_TOKEN` in env (server-side only).
3. **Neither is a pixel-lock.** The new build ELEVATES both — the current design is deliberately
   being replaced with a fully interactive/motion-driven language.

**Design-weight map (Avanti):** the **10 product-line landing pages are the flagship** — immersive,
3D-heavy, scroll-driven (Complex tier; where the brand showcase lives). **Rewards landing**: already
well-designed and on-brand — follow the existing design closely. **Most other pages**: informational,
cleaner, Subtle/Standard motion only.

**Brand anchors:** charcoal base (`#111111`/`#0A0B0D` range), yellow/gold accent family (seen in
rewards UI + gold logo — exact hex from Figma styles or Avanti), JB stacked logo, "PLAYING WITH
FIRE®", "SINCE 2006". **Typography FINAL (Avanti 2026-07-19): Bebas Neue = LEAD voice
(all bold/dramatic headers — brand wants it prominent); LEMON MILK Pro = secondary headers/nav/UI/
short copy (MyFonts webfont license, purchase + upload pending — build with stand-in on the
`--font-brand` token until files land); DM Sans = long-form body only (blog/FAQ/legal readability
carve-out). Cera Pro DROPPED (only ever existed because old Lemon Milk lacked lowercase; Pro has it).**

Motion: GSAP + ScrollTrigger, three tiers (Subtle/Standard/Complex); every animation has a
`prefers-reduced-motion` fallback; animate transform/opacity only; motion never blocks LCP.

## Recorded decisions & gate status

- **Branch protection on `main`: DEFERRED AGAIN at Phase 1 start (Avanti's explicit ruling,
  2026-07-19)** — solo-merger friction outweighs benefit while one agent builds sequentially.
  **Hard trigger remains: enable BEFORE CUTOVER, non-negotiable** (and revisit if multiple agents
  ever build in parallel). Security agent: verify enabled in the pre-cutover audit.
- **Design-token freeze: ✅ PASSED (Avanti sign-off 2026-07-19).** Global palette black/white/JB-yellow
  `#FECF0E` (AA sweep passed; yellow-on-white forbidden), scoped category accents, type = Bebas Neue
  (lead) / Lemon Milk Pro (pending file upload — build on `--font-brand` stand-in) / DM Sans (long-form).
  Tokens are LAW: no hard-coded values in components; changes require Orchestrator + Avanti approval.
- **Data-model freeze: ✅ PASSED (Orchestrator review 2026-07-19).** Frozen contracts: `lib/dutchie/`
  types + provider interface, Supabase schema (migrations 0001/0002, RLS verified live), Storyblok
  content models (`content/models/`). Interface changes require Orchestrator approval + doc update.

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
