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

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #DC2626;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #1E293B;
  border: 2px solid #1E293B;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #1E293B;
  outline: none;
  box-shadow: 0 0 0 3px #1E293B20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Modern Dark (Cinema Mobile)

**Keywords:** dark mode, cinematic, ambient light, glassmorphism, deep black, indigo, glow, blur, atmospheric, reanimated, haptic, premium, layered, frosted glass, linear gradient

**Best For:** Developer tools, pro productivity apps, fintech/trading dashboards, media/streaming platforms, AI tool interfaces, high-end gaming companion apps

**Key Effects:** Expo.out Bezier(0.16,1,0.3,1) easing; spring modals (damping:20 stiffness:90); haptic-linked press (Impact Light/Medium); animated ambient light blobs (Reanimated translateX/Y slow oscillation); BlurView glassmorphism headers/nav (intensity 20); scale press 0.97 → 1.0; avoid pure #000000 (OLED smear)

### Page Pattern

**Pattern Name:** Feature-Rich Showcase

- **CTA Placement:** Above fold
- **Section Order:** Hero > Features > CTA

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
