// ─── FROZEN QUERY-LAYER INTERFACE (Phase 0 data-model freeze, 01 §3) ─────────
// The ONLY module components may import commerce data from. No component calls
// Dutchie (or the placeholder) directly.
//
// Phase 3: implement a graphqlProvider (server-only, DUTCHIE_PLUS_* env) with
// the same DutchieProvider shape and swap it in below. Nothing else changes.

import { placeholderProvider, type DutchieProvider } from './placeholder'
import { graphqlProvider } from './graphql'

export type * from './types'

// EXPLICIT opt-in (DUTCHIE_PLUS_PROVIDER=graphql) rather than key-presence
// detection: keys can be present but wrong (the 2026-08-07 retail-key batch),
// and a provider that silently activates on bad keys takes the whole shop
// down. Flip the env var when the PLUS keys verify via scripts/dutchie-probe.
const provider: DutchieProvider =
  process.env.DUTCHIE_PLUS_PROVIDER === 'graphql' ? graphqlProvider : placeholderProvider

export const getLocations = provider.getLocations
export const getLocationBySlug = provider.getLocationBySlug
export const getMenu = provider.getMenu
export const getProducts = provider.getProducts
export const getProductBySlug = provider.getProductBySlug
export const getCategories = provider.getCategories
export const getSpecials = provider.getSpecials
