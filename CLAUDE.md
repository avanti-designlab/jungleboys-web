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
- **`/verify` RETIRED (Avanti, 2026-07-30 — SUPERSEDES the 2026-07-19 entry below).**
  The earlier decision made `/verify` a main anchor of the new build at its preserved URL.
  Avanti has since ruled the opposite: **it served an older verification process the rebuild
  does not use, so it should not exist.** `/verify` **308s permanently** to `/auth`, which is
  the real product-auth flow and the printed sticker format (`jungleboys.com/auth/<CODE>`).
  Permanent, not temporary: a 307 tells Google the URL is coming back, and it is not.
  Consequence, accepted: `/verify` drops out of the index and its ~3.7k clicks/yr land on
  `/auth` instead. Do NOT rebuild a `/verify` page or re-raise this as an SEO finding.
  (Superseded text, kept for history: product-authenticity verification page at the preserved
  `/verify` URL; anti-counterfeit = brand protection; backend TBD.)
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
condensing header, menu, hero deck, cards, footer, themes, cookie consent, mobile tab bar);
**/rewards shipped (2026-07-19)** — built from Figma "JB PWF Reward" frames (assets exported via
Figma API to `public/rewards/`; program facts in `lib/rewards-content.ts`; tables/perks are real
HTML for SEO; FAQPage JSON-LD; brand surface = forced dark incl. body behind footer gutter; app
links: Apple id6759608318, Play com.batchsys.jungleboys — "batchsys" is the JB app vendor, same
party as the pre-existing Klaviyo "batch" key). FAQ answers drafted from program facts (Figma had
lorem) — **Avanti reviews copy before cutover.** **`/media` shipped (2026-07-20)** — video hub auto-pulling @JungleBoysfilms uploads (Atom feed,
no API key, hourly ISR) merged w/ optional Storyblok `media_video` blocks; featured hero + grid +
youtube-nocookie lightbox; VideoObject JSON-LD; CSP frame-src opened for the embed. Storyblok
`media` story not modeled yet (page works from YouTube alone until it is). Remaining content
templates: contact, wholesale, phenos, verify shell, terms/privacy. Lead pipeline LIVE end-to-end
(Klaviyo forwarding verified). Known mobile-header nit: VERIFY PRODUCTS pill can crowd the theme
toggle at 375px — global nav polish item, not page-specific.
Open: LEAD_NOTIFY_EMAIL delivery mechanism (no email provider — Klaviyo flow vs Resend, Avanti decides).
**Lemon Milk Pro PURCHASED + WIRED (2026-07-19):** licensed OTFs → woff2 in `app/fonts/`, self-hosted
via next/font/local (400/500/700), `--font-brand` → `--font-lemon-milk`. Stand-in retired.

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

**Design-weight map (Avanti):** the **9 product-line landing pages are the flagship** — immersive,
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

- **Rosin + ORC stay as live placeholder pages (Avanti, 2026-07-28).** `/products/rosin` and
  `/products/orc` keep rendering the generic `[line]` placeholder (they return 200 today — the
  template generates them from `PRODUCT_LINES`) so both lines stay present on the site. Avanti may
  rebrand/merge them into a single **"Jungle Boys Extracts"** page; revisit then. No redirects are
  owed — neither `/rosin` nor `/orc` was ever a live URL, so nothing legacy is at stake. IF the
  merge happens, that is the point at which these two `/products/` routes need either a 301 to the
  new page or removal from `PRODUCT_LINES`; shipping them as orphaned "coming soon" pages is the
  failure mode to avoid. **Pre-cutover check: confirm this is still the intent.**
- **Phase 2 body copy stays hardcoded, NOT wired to Storyblok (Avanti, 2026-07-28).** The nine
  product-line pages keep their headlines, claims and section copy in the components; only the
  per-page SEO fields go through Storyblok (`pageMetadata`). Asked whether the copy should be
  CMS-editable and Avanti ruled no — she is the only person who would ever edit it, and she is
  happy for changes to come through a code change. Consequence, accepted: **every copy tweak on a
  product page is a deploy, not a CMS login.** This is consistent with the design-weight map (00
  §7) — these pages are the design showcase, and Storyblok is explicitly "never constrains design".
  Do not retrofit CMS bindings onto these pages without asking her first.
- **Phase 2 asset waits — Avanti supplies before cutover (2026-07-28).** Three outstanding, all
  confirmed coming before the live site: (1) two rolling-process clips for `/products/pre-rolls`,
  (2) `roll.mp4` + `smoke.mp4` for the Hash Hole process cards, (3) optional higher-res HASH HOLE
  wordmark. All three degrade cleanly today — the video cards render a designed "Video coming"
  placeholder INSTEAD OF a `<video>`, so nothing 404s while we wait. Dropping each clip in is a
  one-line change: set `src` on the card. **Pre-cutover check: chase these; a placeholder card must
  not ship live.**
- **Gas Tank FREEZE section stays ice-blue (Avanti, 2026-07-28).** The Live Rosin freeze section
  runs an ice/frost palette while the Live Rosin tier is red everywhere else on
  `/products/all-in-one`. This was raised as a possible inconsistency and Avanti ruled: **leave as
  is.** It is intentional, not a bug — do not "correct" it to red in a later polish pass.
- **Hash Hole gold-on-sky headlines: ACCEPTED AS IS (Avanti, 2026-07-30).** `.hh-gold-head`
  (`--hh-gold` `#f5c21a`) renders on the `.hh-page` sky ground (`--hh-sky-mid` `#4db2ef`) at
  **1.41:1**, below the 3:1 large-text floor. This is a deliberate brand pairing and every fix
  costs more than it buys — all three were measured before the ruling:
  (a) darkening the gold to reach 3:1 lands on `#6c5405`, which is olive, not gold;
  (b) deepening the page sky to `#1073af` fixes it globally but turns Hash Hole from a bright
  summer sky into dusk;
  (c) a dark scrim behind the `hh-breakdown` heading fixes the gold ROLL (1.41 → 4.53) but
  **breaks the green words beside it** (`--hh-green-deep` currently PASSES at 3.44:1 and would
  drop to 1.07:1) — two colours in one heading wanting opposite grounds.
  The gold carries a 2–3px `--hh-ink` keyline with `paint-order: stroke fill`, which separates
  the letterforms in practice; a fill-vs-background check cannot credit it. **Do not "fix" this
  in a later pass, and do not re-raise it as a gate blocker.** `hh-finale` IS scrimmed — that
  heading is white + gold with no green, so the scrim was free there (white 2.35 → 8.62, gold
  1.41 → 5.18). Revisit only if the sky ground itself changes.
- **Product-line pages are THEME-INVARIANT — dark and light render identically (Avanti,
  2026-07-30).** The nine `/products/*` line pages are custom designs, each built around its
  own artwork and palette; they are not a light design with a dark variant. There is
  therefore nothing to sweep on them for dark mode, and **a dark-mode contrast finding on a
  product-line page is not a finding** — it is the same surface already measured in light.
  The site-wide dark-mode AA requirement (design system §LIGHT + DARK MODE) applies to the
  CONTENT and SHELL templates: home, `/products` collection, locations, contact, find-jb-products,
  rewards, media, phenos, wholesale, blog, faq, terms, privacy, auth. Gate agents: scope the
  dark sweep to those and say so explicitly rather than silently skipping product pages.
- **Dark-mode contrast sweep: DONE (2026-07-30).** First dark sweep of the content + shell
  templates (the 15 routes in `scripts/lib/routes.mjs`), desktop 1440 + mobile 390, against a
  production build. The design gate's throwaway harness is now promoted into `scripts/`
  (`contrast-sweep.mjs`, `contrast-verify.mjs`, `selftest-contrast.mjs`, `lib/`), so results are
  reproducible. **Run `node scripts/selftest-contrast.mjs` before trusting any number from it** —
  it drives the real sweep over fixtures whose ratios are known analytically and fails if any
  guard regresses. It caught two instrument bugs during promotion.
  FIXED (each re-measured against the ground it actually lands on):
  Leaflet attribution 1.23 → 13.21 and its "Leaflet" link 1.32 → 17.83 on `/contact` +
  `/find-jb-products`; TCPA consent copy 3.16 → 7.30; contact topic hints 4.30 → 6.44;
  `/products` badges 4.18 → 5.08 and 4.48 → 5.45; `/rewards` Gold tier name 3.02 → 5.65.
  **NOT findings — do not re-raise:**
  (a) `/wholesale` "Next →" at 1.86 is a `disabled:opacity-40` control; WCAG 1.4.3 exempts
      inactive components.
  (b) `/find-jb-products` map clusters at 2.95/3.24 are measured through the idle
      "Find your closest drop" scrim (`bg-black/55`), which fades on first interaction. The
      cluster's own design is `#000` on `#fecf0e` = 11.7:1.
  (c) 16 `aria-hidden` decorative items (the giant `contact-letter` watermarks, the `hunt-row`
      texture at 3.5% alpha, the phenos numerals, the blog `|` separator). Pure decoration is
      exempt; the blog card index numbers were the one such item NOT declared decorative and are
      now `aria-hidden`.
  **Measurement trap, learned here:** a scroll-triggered reveal that has not FIRED yet is
  perfectly stable and therefore indistinguishable from one that has finished. Six `/rewards`
  findings looked real at alpha 0.039–0.425 and measured 12.7–20.6:1 once each element was
  centred on a clean page load — "Download the App" read 1.06, then 18.88. Settle-detection alone
  does not catch this; `contrast-verify.mjs` reloads per finding for exactly this reason. Never
  ship a contrast fix off a sweep number that has not been through the verify pass.
- **RLS VERIFIED IN THE DATABASE, not just in the migration (Avanti ran it, 2026-07-30).**
  `select relname, relrowsecurity, relforcerowsecurity from pg_class` returns
  **`relrowsecurity = true` for both `leads` and `retailers`**; `relforcerowsecurity = false` on
  both. This closes the last unverified line of security invariant §9.3 — previous audits could
  only observe that GRANTS deny anon (error 42501), which fires *before* RLS and therefore proves
  nothing about the flag itself.
  `relforcerowsecurity = false` is correct and should stay: FORCE only subjects the table OWNER to
  policies, and no application code connects as owner. It does not constrain `service_role`, which
  has `BYPASSRLS` and ignores policies either way — so enabling it buys nothing here and adds
  migration friction.
  **Know which control is load-bearing:** RLS is the backstop for the `anon` role. `/api/lead`
  writes with the service_role key, which bypasses RLS by design, so the protection on the lead +
  consent ledger is that the service_role key never leaves the server — verified separately (no
  client-side Supabase exists in the tree). Do not read "RLS is on" as "the ledger is protected
  from the app".
- **BANNERS ARE CMS-EDITABLE — homepage already is; shop/store banners must be built that way
  in Phase 3 (Avanti, 2026-07-30).** The homepage hero deck and quick cards were ALREADY wired to
  Storyblok (`getHomeContent()` reads the `home` story's body, filtering `hero_slide` and
  `quick_card` bloks with per-field fallbacks). They went live the moment the API region was
  corrected — 3 hero slides + 4 quick cards, editable now, no build work needed.
  **Phase 3 requirement: every banner on the shop / store / location-menu surfaces gets the same
  treatment from the start** — modelled as Storyblok bloks with code fallbacks, never hardcoded.
  **This REFINES, and does not overturn, "Phase 2 body copy stays hardcoded" (2026-07-28):** that
  ruling covers the nine product-line landing pages' headlines, claims and section copy. BANNERS
  are promotional and time-dated — the homepage h1 was literally "JULY DEALS", which goes stale on
  a date — so they are exactly the content that must not require a deploy.
  **Asset trap, learned the hard way:** a Storyblok asset field is either a real upload
  (`https://a.storyblok.com/...`) or empty. The `home` story carried stale relative paths
  (`/hero/gas-tank-beach.jpg` when the real files are `.webp`) plus one leftover Webflow CDN URL;
  those had been unreachable, and correcting the region made them override working defaults —
  **five of eight homepage hero images broke, invisibly**, because the HTML looked fine and only
  next/image 400'd. `assetUrl()` now ignores anything that is not an absolute URL on an allowed
  CMS host. When modelling Phase 3 banner bloks, upload assets to Storyblok — do not paste paths.
- **Product Finder data stays in CODE — provisional, revisit in Phase 3 (Avanti, 2026-07-30).**
  `/find-jb-products` renders 110 retailers (95 CA + 15 FL) from `lib/product-finder/retailers.ts`.
  The Supabase `retailers` table is EMPTY and nothing queries it — the page is not broken, and a
  gate reading "0 rows" as "no data" is wrong. Kept in code because there is no admin path and no
  plan for one, so a DB would mean hand-editing rows in the Supabase dashboard instead of a typed
  file — trading type safety for a network call and a failure mode. The precedent matters: the
  homepage and `/blog` are BOTH silently on code fallbacks right now because a CMS read fails and
  falls back cleanly (SEC-P2-16); a third DB-with-fallback repeats that. **This is provisional and
  does NOT overturn 00 §9** (which names `retailers` as a sanctioned Supabase table) — the table
  stays in place, deliberately unseeded. **Phase 3 revisit: make the final call.** Flips to
  Supabase if any of these becomes true: someone other than Avanti needs to edit stockists; the
  list updates more than ~monthly; or an admin path or automated feed appears. If it flips, no
  silent code fallback — an honest empty state instead.
- **Gold tier gradient CONFIRMED by Avanti (2026-07-30).** `via` `#96700a` → `#4a3705` on the gold
  tier card. Text colour alone could not fix the 3.02:1 tier name (even pure white measured 3.95
  on the old band at 18px), so the ground moved. Measured 5.65–5.76 after; hue holds 43–47° top to
  bottom, so it still reads as gold beside green and silver. **The real finding underneath: the
  tier palette is nine hardcoded hexes across two files and had ALREADY drifted** — Silver is
  `#e4e4e8` in `tier-cards.tsx` and `#c9c9d1` in `earn-more.tsx`; Gold `#ffe98a` vs `#fecf0e`.
  Tokenise as `--rw-tier-*` and add `rw` to the BRAND regex in `check-color-tokens.mjs`, which
  would not police them even after tokenising. Not done yet.
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
