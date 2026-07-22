# Phase 1 → Phase 2 Handoff

**Date:** 2026-07-22 · **Status:** Phase 1 feature-complete; all three exit gates PASSED (with documented conditions). Staging: `jungleboys-web.vercel.app`.

> Read `CLAUDE.md` (root) first — it's the live decision record. This file is the "where we are + what's next" bridge into Phase 2. Nothing here overrides a locked decision in CLAUDE.md.

---

## 1. What shipped in Phase 1

**Global shell & system**
- First-load intro, inverting condensing header (morphs to a floating pill), full-screen 3-column menu, hero deck, footer (pill nav + marquee + newsletter modal trigger), light/dark themes (**light default** + header toggle, persisted), cookie consent, mobile bottom tab bar (**Deals · Drops · [Verify scan] · Locations · Contact**), age gate (YES/NO, no DOB).
- Character-hero banner system shared across pages (`.hero-alive`, bottom-anchored mascot + giant wordmark).

**Templates (all live)**
| Page | State |
|---|---|
| `/` home | Shipped (Swiss hero deck, quick cards, brand marquee footer) |
| `/products` | Curated JB collection (1-col mobile, square stages, hover FX fire on scroll-in on touch); `/products/[line]` = branded "coming soon" stubs (flagship 3D pages = Phase 2) |
| `/rewards` | Shipped, forced-dark; loyalty landing (⚠️ app links point at dead BatchSys app — Phase 2 → Dutchie app) |
| `/media` | Video hub, auto-pulls @JungleBoysfilms (channel-page scrape, hourly ISR) + optional Storyblok `media_video` |
| `/contact` `/wholesale` `/phenos` | Shipped — character banner + interactive forms → lead pipeline |
| `/blog` + `/blog/[slug]` | Shipped (marquee, featured card, black-pill sections, reading progress, drop-cap prose). 3 SAMPLE posts as fallback until real Storyblok posts published |
| `/faq` | Shipped — Storyblok `faq` story → accordion + FAQPage JSON-LD |
| `/auth` + `/auth/[code]` | **Scan/verify flow** — camera QR scan (BarcodeDetector + jsQR fallback) + manual entry; result screens (authentic/claimed/failed). Verification is a **STUB** pending BatchSys endpoint |
| `/locations` `/find-jb-products` | Shipped (owned stores vs 3rd-party stockists — two-map rule) |
| `/terms` `/privacy` | Ported verbatim (⚠️ privacy copy describes old e-commerce — needs reality rewrite + counsel before cutover) |

**Systems**
- **Lead pipeline:** `/api/lead` → Supabase consent ledger (verbatim TCPA + timestamp) → routes by topic (newsletter→Klaviyo, else→email via Resend). Migration 0004 applied.
- **Storyblok CMS** (US-hosted, fallback-safe): home banners/deals, per-page SEO, blog, FAQ, media — all render identically to code defaults with no token.
- **Newsletter popup** (site-wide) + footer "Let's Stay In Touch" both open it.

---

## 2. Phase 1 exit gates (2026-07-22)

| Gate | Result | Fixed at exit | Documented / accepted |
|---|---|---|---|
| **Security** | PASS (no Critical/High) | JSON-LD `<` escaping (`jsonLdHtml`); `camera=(self)` header (was blocking the scanner in prod) | CSP `'unsafe-inline'` (remove before cutover); per-instance rate limiter; richtext sanitize before public authoring; sharp advisory |
| **QA / Perf** | PASS after fixes | form `aria-label`s; global `:focus-visible`; video preload→metadata; legacy deal redirects repointed; age-gate typo | `/design-check` gate before cutover; newsletter focus-trap (minor) |
| **Design** | PASS | blog featured yellow-on-white → accent-ink; `/auth` AA via new semantic status tokens; oversized wordmark shrunk; **MASTER.md reconciled** | unify 4 brand near-blacks → one token; locations ◆ marquee on light |

---

## 3. Before cutover (not Phase 1 blockers, but required to go live)

**Avanti activation to-dos**
- Resend account + verify `jungleboys.com` domain → set Vercel env `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL=hello@jungleboys.com`, `RESEND_FROM`. (Until then, leads still log to Supabase; no email sent.)
- `KLAVIYO_API_KEY` (newsletter forwarding).
- Publish real blog posts + FAQ + per-page SEO in Storyblok (samples auto-replace).

**Engineering pre-cutover**
- Privacy Policy reality rewrite (Dutchie owns payments; we hold only leads) + counsel review.
- Remove/gate `/design-check`.
- CSP `'unsafe-inline'` → nonce **or** keep documented (nonce forces dynamic rendering — decision revisit).
- Enable branch protection on `main` (hard trigger: before cutover).
- Swap staging URLs → `jungleboys.com`; final redirect QA; security re-audit.

---

## 4. Deferred to Phase 2 / 3 (with why)

- **Deals (`/710-deals`) + Drops (`/drops`)** — connect to Dutchie live menu/inventory → **Phase 2**. Tab-bar + Explore-more links to them 404 for now (accepted). Legacy deal redirects temporarily point to `/rewards`.
- **`/auth` real verification** — needs **BatchSys** production endpoint/API (see §5). UI is done; swap the stub in `lib/auth/verify.ts`.
- **Rewards loyalty** — moved BatchSys → **Dutchie app**; app links + earn/redeem mechanics update in Phase 2.
- **Account shells** (`/login` `/signup` `/forgot-password`, logged-in `/profile-reward`) — Phase 2, once Dutchie/Dovetail auth is connected (header login icon already points at `/login`, 404s until built).
- **Flagship product-line landing pages** (10× immersive/3D, Complex tier, scoped category accents) — Phase 2 product-experience agent.
- **Shop / commerce** (Dutchie Plus GraphQL: products, pricing, inventory, COA, cart, checkout) — **Phase 3**. CA-native menus (4) vs FL-embed shells (15).

---

## 5. What Phase 2 inherits (do NOT relitigate)

**Frozen contracts** (changes need Orchestrator + Avanti + doc update):
- **Design tokens** — black / white / JB-yellow `#FECF0E`; type Bebas (lead) / Lemon Milk Pro (brand-ui) / DM Sans (long-form). `design-system/MASTER.md` is reconciled and accurate — **read it before building**. Product-line pages layer **scoped category accents on top of** the frozen base tokens (per-line in `design-system/pages/<line>.md`).
- **Data model** — `lib/dutchie/` types + provider interface, Supabase schema (migrations 0001–0004, RLS on), Storyblok content models (`content/models/`).
- **URL preservation** — every existing URL resolves or 301s single-hop (`lib/redirects.ts`, `seo/url-inventory.csv`).

**Key decisions Phase 2 needs:**
- **BatchSys** = product authentication only now (not loyalty). Real sticker QR format is **path-based** `jungleboys.com/auth/<CODE>` (no scheme). To wire: replace the stub in `lib/auth/verify.ts` with their **production API endpoint** (NOT the stage `auth.js` — that needs a CSP script-src exception; a direct server-side API call is CSP-safe). `encodeURIComponent(code)` + allowlist the code charset + pin the host.
- **Loyalty = Dutchie app** (integrated web + in-store + app). BatchSys app links on `/rewards` are dead — repoint to Dutchie.
- **Two-map rule** — Locations (owned → Dutchie menus) and Product Finder (stockists → Supabase) never share data/components.
- **CA-native / FL-embed** — only 4 CA menus are built natively on Dutchie Plus; FL stays embeds in a branded shell.

**Security items to carry into the Phase 2 threat model:**
- CSP `'unsafe-inline'` should become nonce-based before third-party scripts (Dutchie embeds, GA4) land — those make it materially more valuable.
- Storyblok richtext needs a sanitize pass **before any untrusted/public authoring**.
- Move the `/api/lead` rate limiter to a shared store (Vercel KV/Upstash) before high-traffic cutover.

---

## 6. Environment / ops notes

- **Next.js is newer than training data** — read `node_modules/next/dist/docs/` before unfamiliar APIs (`revalidateTag` needs a 2nd arg; `_`-prefixed app folders don't route).
- No `gh` CLI / no brew; SSH push as `avanti-designlab`. Port 3000 belongs to another project — never kill; dev server uses `.claude/launch.json` autoPort.
- **Preview browser freezes the CSS/GSAP animation clock** — verify motion via DOM state / computed styles / `getBoundingClientRect`, not screenshots. Heavy-animation pages (rewards, phenos, products) often won't screenshot cleanly.
- Secrets: real values live in Vercel env vars, entered by Avanti — never in chat, never committed. `.env.example` = names only.
