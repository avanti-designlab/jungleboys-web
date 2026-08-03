// The visitor's chosen store — the spine of every commerce surface.
//
// Inventory, pricing and specials all differ per location, so nothing under
// /menu can render honestly without knowing which store the visitor means.
// Persisted like the other entry-state keys (jb-theme, jb-age-gate) so it
// survives a reload and a return visit.
//
// HARNESS NOTE: this is a fourth piece of entry state that can put an overlay
// over the page, and every one of those has cost us a wrong measurement —
// the age gate covered every frame until it was seeded, and the newsletter
// scrim dimmed whole sweeps. scripts/lib/cdp.mjs seeds this key from the start
// rather than after the fact.
export const STORE_KEY = 'jb-store'

export type StoredStore = { slug: string; state: 'CA' | 'FL'; chosenAt: number }

export function readStore(): StoredStore | null {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredStore
    // A malformed value must not be treated as a choice. The age gate shipped
    // with the mirror of this bug: the string "1" did not parse, so the gate
    // treated every visitor as unverified and covered the page.
    if (!parsed || typeof parsed.slug !== 'string' || !parsed.slug) return null
    if (parsed.state !== 'CA' && parsed.state !== 'FL') return null
    return parsed
  } catch {
    return null
  }
}

export function writeStore(slug: string, state: 'CA' | 'FL'): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ slug, state, chosenAt: Date.now() }))
  } catch {
    // private mode / storage disabled — the picker still works for this session
  }
}

/**
 * Where a chosen store sends the visitor.
 *
 * CA menus are NATIVE (Dutchie Plus API); FL stays a Dutchie EMBED in a branded
 * shell, because we have their embed codes and not their API access. That split
 * is a locked decision (Avanti 2026-07-19), so it lives here rather than being
 * re-derived at each call site.
 */
export function menuPathFor(slug: string, state: 'CA' | 'FL'): string {
  return `/menu/${state === 'CA' ? 'california' : 'florida'}/${slug}`
}
