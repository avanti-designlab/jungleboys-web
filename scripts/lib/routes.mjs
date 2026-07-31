// Route sets for the a11y/design harness.
//
// SCOPE IS A RECORDED DECISION, NOT A CONVENIENCE. Avanti ruled 2026-07-30 that
// the nine /products/* line pages are THEME-INVARIANT — each is a custom design
// built around its own artwork and renders identically in both modes. A
// dark-mode finding on one of them is not a finding; it is the same surface
// already measured in light. That scope lives here, in the instrument, so a
// future run cannot quietly widen or narrow it. See CLAUDE.md, recorded decisions.

/** Content + shell templates. These carry the site-wide light/dark requirement. */
export const THEMED = [
  '/',
  '/products',
  '/locations',
  '/contact',
  '/find-jb-products',
  '/rewards',
  '/media',
  '/phenos',
  '/wholesale',
  '/blog',
  '/blog/playing-with-fire-since-2006',
  '/faq',
  '/terms',
  '/privacy',
  '/auth',
]

/** Theme-invariant by ruling. Swept in light only; never swept for dark. */
export const THEME_INVARIANT = [
  '/products/hash-hole',
  '/products/pre-rolls',
  '/products/10-pack-prerolls',
  '/products/premium-flower',
  '/products/all-in-one',
  '/products/pops',
  '/products/twins',
  '/products/rosin',
  '/products/orc',
]

export function resolve(name, origin) {
  const set = name === 'themed' ? THEMED
    : name === 'product-lines' ? THEME_INVARIANT
    : name === 'all' ? [...THEMED, ...THEME_INVARIANT]
    : null
  if (!set) throw new Error(`unknown route set '${name}' (themed | product-lines | all)`)
  return set.map((p) => origin.replace(/\/$/, '') + p)
}
