# Product-line colour scopes

`design-system/MASTER.md` §48–51 says the per-line accents live in this folder. The
folder was empty, and in the gap ~370 hard-coded colours accumulated in
`components/products/**` — several of which drifted off the token they were copied
from, so a single line rendered two near-identical-but-different brand colours
depending on which section you were looking at.

This file is the spec. **The tokens in `app/globals.css` are the source of truth;
this documents what they are for.** Never retype a value into a component.

## Site-wide

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#0b0b0d` | The generic near-black panel surface. NOT a substitute for the line-specific darks below, which are deliberately tinted. |
| `--strain-indica` | `#2358d8` | Strain type. Product semantics, not decoration. |
| `--strain-sativa` | `#c2410c` | |
| `--strain-hybrid` | `#157a37` | |

The strain trio is site-wide on purpose. It was previously duplicated across six
shop components in **three different palettes**, so the same "INDICA" label
rendered in three different blues across the site. Two of those palettes also
failed AA — `#6f9bff` is 2.69:1 on white and `#43d16f` is 1.98:1. The current
values all clear 4.5:1 against white, which is what lets them work both as an
outline colour on a light panel and as a filled chip with white text.

Phase 3 commerce will map the Dutchie product shape onto these. Do not add a
local strain map to a new component.

## Per line

Each line owns a dark base, an ink, and an accent ramp. The ramp is `-hot` →
base → `-deep`, which is exactly what the shop card gradients consume, so a
gradient never needs a literal.

| Line | Base | Ink | Accent ramp |
|---|---|---|---|
| Hash Hole | — | `--hh-ink` | `--hh-gold`, `--hh-green`, `--hh-green-deep`, `--hh-sky-top/-mid`, `--hh-brown` |
| 10-Pack | `--tp-black` | `--tp-ink` | `--tp-blue-hot` → `--tp-blue` → `--tp-blue-deep`; `--tp-cyan`, `--tp-glow` |
| Gas Tank | `--gt-black` | `--gt-ink` | `--gt-red`, `--gt-orange`, `--gt-yellow` |
| Pre-Rolls | `--pr-black` | `--pr-ink` | `--pr-green-hot` → `--pr-green` → `--pr-green-deep`; `--pr-lime`, `--pr-glow` |
| Twins | `--tw-black` | `--tw-ink` | `--tw-red-hot` → `--tw-red` → `--tw-red-deep`; `--tw-navy`, `--tw-blue`, `--tw-blue-hot`, `--tw-cream` |
| Pops | — | `--pops-ink` | `--pops-red` |

Shop panels also carry `--tw-shop-ink`, `--tp-shop-ink`, `--pr-shop-ink` — the
deep text colour on that line's light shop panel.

## What is allowed to stay a literal

Not every colour should become a token. These are fine as-is and should be left
alone:

- **Simulation colours** — `gt-fire.tsx` and `gt-snow.tsx` compute per-particle
  colour on a canvas. These are art, not UI, and tokenising them would mean
  reading CSS custom properties per frame.
- **Scene gradients** — `hh-sky.tsx`'s sky ramp, `tw-claims.tsx`'s radial disc.
  One-off illustration, used once, no consistency risk.
- **Generated fields** — `pops-nugs.ts`.

The test: if the same colour appears in two components, or if it is a brand
colour a customer would recognise, it belongs in a token. If it exists once
inside a piece of illustration, it does not.

## The failure mode this prevents

Before this pass, `tw-shop.tsx` painted its card with `#e0242c` while
`--tw-red-hot` was `#e6242c`; `tp-shop.tsx` used `#0d5296` against a
`--tp-blue` of `#0b5897`; `pr-shop.tsx` used `#0f7a3d` against a `--pr-green`
of `#14a04a`. Nobody chose those differences — they are what happens when a
value is copied by eye instead of referenced.
