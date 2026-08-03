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
- **Security headers on redirects: middleware.ts TRIED AND REVERTED — evidence, not opinion
  (2026-07-30).** The security gate ruled "add middleware.ts", and the argument it demolished
  (the stale `notAccepted` note in `security/audit-exceptions.json`) genuinely was dead. But the
  fix does not work, and this was MEASURED rather than reasoned:
  `next.config`'s `redirects()` are matched BEFORE middleware runs, so middleware never sees a
  redirect response. Built it, served it, measured: **0 security headers on the `/verify` 308, 4
  on a rendered page** — i.e. it added nothing `headers()` did not already cover.
  Making it work means moving the redirect map INTO middleware, and three sources are
  parameterised (`/menu/florida/jungle-boys-:city`, `:path*`, `/menu/arizona/:path*`), so that
  means re-implementing Next's path matching for 85 live URLs. The exposure being closed is
  headers on a BODYLESS response, where CSP/XFO/nosniff have nothing to act on and only HSTS
  meaningfully applies. Not worth that risk at this stage.
  `lib/security-headers.ts` was kept — one definition of the CSP is right regardless.
  **Revisit at cutover**, when HSTS on the apex domain is being configured at the Vercel edge
  anyway; that is the cheaper place to close it. Do not re-raise "add middleware" without also
  answering the parameterised-source problem.
- **TCPA consent ledger CLEARED of synthetic rows — done and confirmed by Avanti, 2026-07-30.**
  All **10** rows in `public.leads` were deleted in a single transaction; `select count(*)` returns
  **0**. An empty ledger is the correct pre-cutover state — nothing genuine had been submitted.
  What was removed, so the correction is auditable rather than remembered:
  - **5** written 2026-07-30 14:02:00–02, `ratelimit-probe@example.invalid` — the Phase 2 security
    audit's live XFF rate-limit bypass test. Written from localhost against production keys.
  - **4** explicit test rows, 2026-07-20 → 07-29: two `Pheno hunter (test)`/`a@b.com`, one
    `Pheno hunter (test answer)`/`ava@test.com` (all `/phenos`), one `Jane Doe`/`jane@store.com`
    with a 555 number (`/wholesale`).
  - **1** `Avanti Loussia`/`avantiloussia@gmail.com`, 2026-07-21 — Avanti confirmed this was her
    own form test, not a real signup. It was deliberately excluded from the first delete list and
    only removed once she said so; a row carrying a real person's PII and a real consent record is
    never deleted on inference.
  **Recurrence is blocked in code**, not by discipline: `/api/lead` refuses to write when
  `VERCEL_ENV` is absent (see the guard in that route + `check-invariants`). The 5 audit rows are
  exactly what that guard exists to stop, and they postdate the ruling that prompted it.
  **Still open, and NOT fixed by the delete:** 7 of the 10 had `forwarded_status = 'forwarded'`,
  so `ava@test.com`, `jane@store.com` and the probe address reached **Klaviyo**. Removing rows
  from Supabase does not touch the marketing list. Prune them there before cutover — bounced
  synthetic addresses cost sender reputation.
- **RETRACTED — the 2026-07-30 CWV baseline below is NOT reproducible. Do not cite it.**
  Two gates found it unreliable by independent routes, and both were right.
  `scripts/measure-lcp.mjs` waited only **400ms** after `about:blank` before the next timed
  navigation. On a throttled pipe the PREVIOUS run is still draining and delays the next run's
  LCP request by ~850ms — discovery jumps ~170ms to ~1030ms. That is not noise around a true
  value; the run lands on one of TWO values about half the time. `/products/hash-hole` alternated
  `1872 / 3004 / 1872 / 3028`, and the **2872ms recorded below was a single contaminated sample** —
  reproduced as run 2 of 5 in the tool itself. **Drained, hash-hole measures 1872ms and PASSES.**
  It was never a finding. Every number in the 12-template table is contaminated in the pessimistic
  direction (`/faq` is 796ms, not the range recorded).
  Compounding it: the tool already computed `spread` and printed it, and **nothing consumed it**,
  so a median with a 2164ms spread on a 2500ms budget was recorded as a point fact. The same page
  measured 1928ms over 3 runs and 2820ms over 7.
  **Fixed:** drain is now 4000ms (`--drain=`), and a spread guard refuses a verdict when spread
  exceeds 20% of budget — it reports `UNRELIABLE` instead of a number. Re-measure before quoting
  any CWV figure taken before 2026-07-31. Also: never take performance numbers in a working tree
  while other agents are active in it; rebuild from `git archive <sha>` into an isolated directory.
- **Core Web Vitals baseline, 12 templates (2026-07-30) — SUPERSEDED, see retraction above.** Measured with
  `scripts/measure-lcp.mjs` — mobile 390 + 4x CPU + slow4G, median of runs, CLS alongside LCP.
  All content/shell templates pass: LCP 992–1992ms, CLS ≤ 0.042 (worst `/faq`, the text-heaviest
  page and therefore where a font-swap penalty would show first — it does not).
  **OPEN — two flagship product pages over budget:** `/products/hash-hole` **2872ms**
  (`hero-mobile-poster.webp`) and `/products/premium-flower` **2864ms** (`plant-cutout-m.webp`).
  Never previously raised — QA only ever flagged `/products/pre-rolls`, which is now 2464ms.
  Same hero-image-bound shape, but the font-preload lever that fixed pre-rolls is already spent
  site-wide, so the remaining lever is image-side and is NOT yet measured. Do not propose a fix
  without attributing it first.
  Caveat on the CLS figures: there is no pre-`preload:false` baseline for these ten pages, so the
  0.042 on `/faq` cannot be attributed to the font swap versus pre-existing. Both are inside budget.
- **DATA-MODEL AMENDMENT: `StrainProfile` added to `Product` (Avanti approved, 2026-07-31).**
  The freeze holds; this is the first amendment to it and it is ADDITIVE — two optional fields,
  no existing field changed, nothing to migrate. Recorded here because the freeze says changes
  require approval plus a doc update, and an un-recorded contract change is how drift starts.
  **Why:** inspecting `jungleboysflorida.com/drops/` (the reference for our Drops build) showed
  each featured card carries **Genetics** ("Thin Mint Cookies x Z") and **Taste** ("Citrus cherry,
  grape candy, gas"). Neither had anywhere to live: `strain` is a NAME, `effects` is not flavour,
  and `labResult.terpenes` is chemistry, not tasting notes.
  **Shape:** a nested `strainProfile?: StrainProfile`, NOT two loose fields. These are
  strain-level attributes — Zangria has the same genetics as an eighth or a pre-roll — so when
  the Strains library is built this object lifts out to become the Strain entity and
  `Product.strain` becomes the key pointing at it. Flattening `genetics` onto Product would mean
  populating it hundreds of times and then migrating.
  **Open:** verify against a real Dutchie payload which of these Dutchie actually supplies. If it
  supplies none, they are CMS-authored strain content and belong to the Strains build.
- **DATA-MODEL AMENDMENT #2: `LabResult.cannabinoids[]` + `StrainProfile.terpenes` (per the
  Phase 3 handoff, 2026-08-03).** Additive only; nothing existing changed. Both came from
  inspecting jungleboysflorida.com (the reference for our commerce build):
  (a) their PDP shows an EIGHT-row cannabinoid panel (THCA 34.9%, CBGA 2.39%, THC-D9, THCVA,
  CBG, CBDA, CBD, CBC) where our `Potency` models only thc/cbd — so `Cannabinoid
  { name, value, unit }` and `LabResult.cannabinoids?: Cannabinoid[]`. `potency` stays exactly
  as frozen: it is the headline summary every card reads; the panel is the detail behind it.
  (b) `StrainProfile.terpenes?: string[]` carries terpene NAMES — deliberately NOT the
  `Terpene[]` shape, because `LabResult.terpenes` is measured percentages for one tested batch
  while a strain profile is batch-independent. **The Strains page lists names; the PDP lists
  percents.** Collapsing the two would force fabricated percentages onto strain pages.
  Zangria premium flower is the designated placeholder fixture carrying the full amended shape;
  `scripts/check-commerce.mjs` asserts the panel is SERVER-rendered (the PDP buy box already
  taught us a browser check is blind to missing SSR markup). Same open as amendment #1: verify
  against a real Dutchie payload which of these Dutchie actually supplies.
- **Sitemap: store commerce surfaces IN, `/shop/` PDPs OUT (2026-08-03).** The nested
  menu/deals/brands URLs are in the sitemap — they are the canonical targets the legacy
  `/menu/jungle-boys-*` inventory (DTLA 21k clicks/yr) 301s to, and store slugs are OURS, stable
  regardless of the GraphQL swap. PDPs are deliberately EXCLUDED: their slugs come from the
  placeholder provider, and per-product-vs-per-SKU slug stability against real Dutchie data is
  the recorded open question. A /shop/ URL advertised before that is verified is a future 404 on
  the highest-value page type. `check-commerce.mjs` enforces both halves; add PDPs the moment
  slugs are verified against a real payload.
- **Brands surface shipped multi-brand BY FIXTURE (2026-08-03).** The placeholder catalogue now
  carries third-party entries (Jeeter, 1904, Barrett Farms — real names from the live CA menus;
  every other fact placeholder, `images` deliberately EMPTY rather than invented pack art)
  because a Brands template built against a single-brand catalogue never meets the layout it
  ships with. The menu card labels the brand ONLY on non-JB products — the house brand stays
  unlabelled by design. Do not "clean up" the fixtures to JB-only; the not-JB-only rule
  (2026-07-31) is the point, and check-commerce fails if the brands page goes single-brand.
- **`/shop` is the storefront ENTRY and every Shop button now lands there (Avanti's report,
  2026-08-03: "shop buttons still direct to products page so I can't see anything we built").**
  Phase 3 had built the surfaces but no navigation reached them. Now: `/shop` = server-rendered
  store chooser (CA cards → store menus; FL → /locations honestly, since the FL shells don't
  exist yet) with a client "Continue at <store>" enhancement off `jb-store`; the picker overlay
  still auto-opens there for first-timers and routes on choose. Header Shop pills went
  /products → /shop; the menu-overlay 'Shop' entry promised by the 2026-07-29 note is added
  (FIRST, own href — the double-/products anchor problem that note records is why it waited);
  the mobile tab bar's Deals/Drops tabs deep-link into the chosen CA store's
  deals/drops (fallback /shop; upgraded in an effect AFTER hydration; FL saved store keeps the
  fallback rather than deep-linking a 404). The Products-vs-Shop rule is untouched — /products
  remains the curated collection, and the home hero "Shop now" CTAs are CMS-editable banners
  Avanti can retarget in Storyblok. check-commerce asserts /shop exists, lists all four store
  menus, and is linked from the home nav.
- **Store menu = MERCHANDISED STOREFRONT (Avanti's redesign brief, 2026-08-03).** Her ruling on
  the first version ("really bad and generic, just a collection of products"): the shop page is
  an ECOM surface built to drive sales. Shipped: hero banner TRIO (one large left, two stacked
  right, rounded) → red-highlighted HOT ITEMS push shelf (`product.featured`, in-stock only,
  red HOT badges, `--color-danger` accents) → category shelves (horizontal snap, View All →
  `?category=<c>#browse`) with PROMO BANNERS woven between every second shelf → full filterable
  grid at `#browse`. All banners are Storyblok-overlaid (`shop` story: `shop_banner` ×3 hero +
  `shop_promo` rotation; models in `content/models/`) with evergreen code fallbacks —
  deliberately navigation promos (drops/deals/rewards/brands), NEVER invented discounts, which
  would be a compliance bug; dated promo copy belongs in the CMS where it can die without a
  deploy. Banner hrefs support `@store/<surface>` for store-relative targets so one banner set
  serves all four stores. Everything is SERVER-rendered and `check-commerce.mjs` asserts the
  structure (3 hero tiles, hot section, ≥3 shelves, ≥1 promo, #browse).
  **Trap found by the check, worth keeping:** `useSearchParams` inside MenuBrowser made its
  whole Suspense boundary bail out of static prerender — the deals grid shipped ZERO crawlable
  PDP links. The hook now lives in a null-rendering child (`CategoryFromQuery`) with its own
  boundary; the grid stays in server HTML. Do not move it back.
- **/shop is PICKER-FIRST, and product media wells are WHITE (Avanti, 2026-08-03).** Two
  rulings from her review: (a) every Shop button leads to the location picker MODAL, which
  routes into the chosen store's menu — implemented as /shop ALWAYS opening the picker (even
  with a saved store), while other commerce routes keep opening it only when no store is
  chosen; the /shop page underneath stays the crawlable no-JS fallback. FL picks route to
  /locations until the FL embed shells exist (their menu paths would 404 today) — remove that
  branch when the shells land. (b) Product image wells use `--color-media-well` (white,
  THEME-INVARIANT, deliberately declared in BOTH theme blocks: the token checker matches
  single-declaration tokens by value, and a lone #ffffff would claim every white literal in
  the tree). Reason: Dutchie product shots are white-background JPGs, not transparent PNGs —
  on ink wells every shot read as a floating white box. Applied to menu cards, the Drops
  featured band, and the PDP. Fallout fixed in the same pass: card strain labels used the
  on-dark palette on the now-white surface (2.2–2.7:1) — new themed `--strain-card-*` tokens
  flip with the theme.
- **Fresh Drops LAYOUT shipped with curation STUBBED (Avanti's go-ahead, 2026-08-03).** Avanti
  asked for the page design now rather than waiting on the Dutchie verification, so
  `/menu/california/<store>/drops` is live: editorial header ("new heat lands every Friday"),
  featured band rendering Genetics/Taste from `StrainProfile` (what amendment #1 exists for,
  mirroring the jungleboysflorida.com/drops reference), and THE DROP LIST as the filterable
  shared grid. **The curation source is the still-open question and `lib/drops.ts` is its
  seam**: a hand-picked slug list stands in for whichever mechanism wins (handoff says "set in
  Dutchie" via an UNVERIFIED collection field; the 2026-07-31 scope note said Storyblok —
  reconcile when a real payload exists). Swapping in the real source is one function body,
  no template changes. Genetics strings in the fixtures REUSE lineages already in the
  placeholder file rather than inventing new strain facts. **PRE-CUTOVER CHECK: the slug list
  must be replaced by the real curation source** — a hardcoded drop list in production is a
  stale-promo bug by its second Friday. Legacy note: `/drops` is NOT in the 44-URL inventory;
  its interim 307 → /products stays until the mechanism (and any global-drops chooser) is
  decided. `check-commerce.mjs` asserts the featured band facts are server-rendered and the
  store subnav reaches the page.
- **PHASE 3 COMMERCE SURFACES — scope + URL shape (Avanti, 2026-07-31).**
  Inventory, pricing and specials differ per store, so every commerce surface is
  location-scoped and **nests under the store**: `/menu/california/<store>/<surface>`. Chosen over
  global pages so each store can rank on its own local intent — the stated priority for this whole
  build is visibility and driving online sales, and `/menu/jungle-boys-dtla` (21,227 clicks/yr) +
  `/menu/jungle-boys-pomona` (17,312) are already the highest-traffic URLs in the inventory.
  - **DEALS, not Specials.** They are the same thing; the site says Deals. One surface, one word.
  - **DROPS = "Fresh Drops"** — a CURATED weekly release, dropping every **Friday**. Not a
    computed "new this week" filter and not the same as Deals: it is editorial, so it needs a
    curation source (Storyblok) rather than being derived from the menu.
  - **BRANDS carries ALL brands stocked at a location, not JB only.** Deliberate: the CA stores
    stock third-party brands (Jeeter, 1904, Barrett Farms…) and the goal is to drive traffic for
    those too. This is the one commerce surface that is explicitly NOT JB-curated — do not
    "correct" it to JB-only. Note it does NOT change the Products-vs-Shop rule: `/products/*`
    stays the curated JB-only collection.
  - **STRAINS: DEFERRED, and big.** A full genetics library across the whole JB catalogue — a
    major surface in its own right, not a filter. Build after Deals/Drops/Brands.
  - **PDP nests per store** (`.../<store>/product/<slug>`) for the same local-SEO reason.
    ⚠️ RISK RECORDED, not yet resolved: ~45 products × 4 CA stores = ~180 pages that differ only
    in price and stock. Near-duplicate PDPs can compete with each other for the same product
    query and dilute rather than add. Decide the canonical strategy BEFORE building the PDP —
    self-canonical (bet on local intent) vs consolidating to one primary product page. Getting
    this wrong is expensive to unwind once indexed.
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
