# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Jungle Boys
**Generated:** 2026-07-19 02:28:27
**Category:** E-commerce Luxury
**Design Dials:** Variance 7/10 (Balanced / Modern) | Motion 7/10 (Standard) | Density 4/10 (Standard)

---

## Global Rules

### Color Palette — FINAL (reconciled with Figma + brand, Avanti-confirmed 2026-07-19)

**Global palette (site-wide — strictly black / white / yellow):**

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Background (near-black, from Figma usage) | `#040303` | `--color-background` |
| Surface (charcoal, cards/nav) | `#111111` | `--color-surface` |
| Text primary | `#FFFFFF` | `--color-foreground` |
| Text warm / long-form | `#F5F5F5` | `--color-foreground-soft` |
| Text muted | `#9A9AA0` | `--color-muted` |
| Border / divider | `#231F20` | `--color-border` |
| **Brand accent — JB Yellow (official)** | `#FECF0E` | `--color-accent` |
| On-accent (text/icons on yellow) | `#000000` | `--color-on-accent` |
| Light surface (rare, e.g. rewards dashboard) | `#FFFFFF` | `--color-surface-light` |

**Pairing rules (AA-verified):** yellow works ON black (13.9:1) or AS a surface with black
text/icons (14.1:1). **Yellow text on white is forbidden (1.5:1 — fails WCAG).** Muted gray
#9A9AA0 passes on background (7.4:1). All verified pairings:

| Foreground on background | Use | Ratio | AA |
|---|---|---|---|
| #FFFFFF on #040303 | text on background | 20.6:1 | PASS |
| #F5F5F5 on #040303 | warm text | 18.9:1 | PASS |
| #9A9AA0 on #040303 | muted text | 7.4:1 | PASS |
| #FFFFFF on #111111 | text on surface | 18.9:1 | PASS |
| #FECF0E on #040303 | yellow accents on black | 13.9:1 | PASS |
| #000000 on #FECF0E | black on yellow (buttons/CTAs) | 14.1:1 | PASS |
| #FECF0E on #FFFFFF | — | 1.5:1 | FAIL — never use |

**Category accents (scoped — product-line landing pages ONLY):** each JB product line carries its
own branding palette (e.g. Hash Hole reds `#DE312A`/`#AB1F22`/`#640C0F`, Gas Tank orange `#F47702`).
These are defined per line in `design-system/pages/<line>.md` at Phase 2 build time, extracted from
that line's Figma frames + packaging art. They never leak into global components.

### Typography — FINAL v2 (Avanti-confirmed 2026-07-19)

| Role | Face | Weights | Source |
|---|---|---|---|
| **Main headers — all bold & dramatic moments (lead voice)** | **Bebas Neue** | 700 / 400 | Google Fonts (free) |
| Secondary headers, nav, buttons, labels, short copy | **LEMON MILK Pro** | Light / Regular / Medium / Bold | MyFonts webfont license — **purchase + upload pending (Avanti)** |
| Long-form body ONLY (blog articles, FAQ answers, legal) | **DM Sans** | 400 / 500 / 700 | Google Fonts (free) — readability carve-out; review at first Phase 1 page render |

- History: Cera Pro existed only because original LEMON MILK lacked lowercase; **Lemon Milk Pro has
  lowercase**, so Cera Pro is DROPPED (no license needed). Legacy faces (Bebas Kai, Futura, Phosphate)
  are artifacts — never use.
- Bebas Neue is deliberately prominent — the brand wants MORE of it, not less.
- Load via `next/font/google` (Bebas Neue, DM Sans) + `next/font/local` (Lemon Milk Pro woff2 when
  delivered); `font-display: swap`; preload critical weights only.
- Until Lemon Milk Pro files arrive, build with a stand-in mapped to the same token so the swap is
  one line (`--font-brand`).

### Spacing Variables

*Density: 4/10 — Standard*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

> Reconciled 2026-07-22 to the patterns actually shipped in Phase 1. Reference
> implementations: `components/pill-cta.tsx`, `components/newsletter-popup.tsx`,
> `components/age-gate.tsx`, product/blog cards, the character-hero banners.
> **Rule:** components use TOKENS only — never hard-code hex. Utilities shown are
> Tailwind + CSS vars.

### Buttons

- **Primary (accent pill):** `bg-[var(--color-accent)]` + black text (`--color-on-accent`),
  `rounded-full`, uppercase Lemon Milk (`--font-brand`), tracking-wide. Often carries a black
  circular arrow/cart disc on the right (`PillCta`). Hover → invert to
  `bg-[var(--color-foreground)]` / `--color-background` text. Never a layout-shifting scale.
- **Secondary (bordered pill):** transparent, `border-2 border-[var(--color-foreground)]`,
  foreground text, `rounded-full`; hover fills to foreground bg / background text. On dark brand
  surfaces the border/text is white.
- **Accent-yellow TEXT is forbidden on light** — use `--color-accent-ink` for yellow-toned text.

### Cards

- **Light surface:** `rounded-[1.4rem–1.75rem]`, `bg-[var(--color-surface)]`,
  `border border-[var(--color-border)]`, soft shadow; hover → lift (`-translate-y-1.5`) +
  `border-[var(--color-accent)]`. No layout-shifting scale.
- **Brand-dark "pill" panels** (footer, menu overlay, black content slabs, character banners,
  modals): near-black, `rounded-[1.75rem–2.75rem]`, with `data-theme="dark"` on the wrapper so
  tokenized children flip to their dark values automatically.
  *(TODO: the near-blacks in use — `#050505` / `#0b0b0b` / `#0b0b0d` / `#111114` — should collapse
  into one `--color-ink` token; pick one when the token is added.)*

### Inputs

- `rounded-full` (short fields) or `rounded-2xl` (textareas); token border; focus shows the global
  keyboard ring (`:focus-visible` = 2px `--color-accent`) plus `focus:border-[var(--color-foreground)]`
  where used. **Every field has an accessible name** (`aria-label` or a linked `<label>`) —
  placeholder-only is not acceptable (AA).

### Modals / overlays

- **Dark by default** (brand surface): near-black bg, white text, `rounded-[1.5rem–2rem]`,
  backdrop `bg-black/70` + blur. Focus-trapped, Esc-to-close, `role="dialog"` + `aria-modal`,
  focus moved into the dialog on open. See `age-gate.tsx` (reference focus-trap) and
  `newsletter-popup.tsx`.

### Status colors (semantic — added at Phase 1 exit)

- `--color-success` / `--color-danger` / `--color-warning` — theme-aware (AA-darkened on the light
  bg, vivid in dark). Use these tokens for verify states, form errors, alerts — never hard-coded
  green/red/amber.

---

## Style Guidelines

**Style:** Premium cannabis, bold editorial — **"Playing With Fire®"**. Streetwear-meets-magazine:
oversized Bebas display, graffiti-mural energy, JB character mascots, dark brand surfaces
punctuated by a single yellow accent. NOT a generic "dark UI" — no glassmorphism/indigo/fintech
tropes.

**Keywords:** bold editorial, Bebas display, uppercase, graffiti, character mascots, dark brand
surfaces, single yellow accent, scroll-driven motion, marquees, rounded "pill" panels.

**Brand anchors:** JB stacked logo, "PLAYING WITH FIRE®", "SINCE 2006"; charcoal/near-black +
official JB yellow `#FECF0E`.

**Key effects:** GSAP + ScrollTrigger, three motion tiers (Subtle / Standard / Complex);
reveal-on-scroll (transform + opacity only); character-hero banners (bottom-anchored `.hero-alive`
mascot + giant wordmark behind); counter-scrolling marquees. Every animation has a
`prefers-reduced-motion` fallback; motion never blocks LCP; avoid pure `#000000` / `#FFFFFF`.

**Theme:** ships **light by default** with a header dark toggle (persisted); tokens live at `:root`
(light) + `[data-theme='dark']`. Brand surfaces (footer, menu overlay, age-gate panel, /rewards,
/phenos) stay dark in BOTH themes by design.

**Design-weight:** informational pages = clean, Subtle/Standard motion. The **10 product-line
landing pages = the flagship** — immersive, 3D-heavy, Complex tier, carrying **scoped category
accents layered on top of the frozen base tokens** (see Color Palette → Category accents; defined
per line in `design-system/pages/<line>.md`). Base tokens stay law: `#FECF0E` + black/white never
change globally.

### Page Pattern

- Character-hero banner (where applicable) → content sections → CTA.
- **One** primary CTA per hero — never two competing CTAs.

---

## Motion

**Page Transition** (Standard) — Trigger: route change | Duration: 400-600ms | Easing: `power2.inOut`

```js
const tl = gsap.timeline(); tl.to('.transition-overlay', { yPercent: 0, duration: 0.4, ease: 'power2.inOut' }).call(navigate).to('.transition-overlay', { yPercent: -100, duration: 0.4, ease: 'power2.inOut', delay: 0.1 });
```

**Framework notes:** Keep the overlay element mounted at the layout root (outside the page component) so it survives the route swap

- ✅ Show a lightweight loading indicator if the destination route's data fetch outlasts the overlay
- ❌ Don't tie the overlay's reveal directly to data-fetch completion without a max-wait timeout; a slow API stalls the whole transition
- ⚡ Prefer CSS transform (yPercent) over top/left to keep the overlay animation on the compositor thread

---

## Anti-Patterns (Do NOT Use)

- ❌ Vibrant & Block-based
- ❌ Playful colors

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
