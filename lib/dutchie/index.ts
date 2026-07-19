// ─── FROZEN QUERY-LAYER INTERFACE (Phase 0 data-model freeze, 01 §3) ─────────
// The ONLY module components may import commerce data from. No component calls
// Dutchie (or the placeholder) directly.
//
// Phase 3: implement a graphqlProvider (server-only, DUTCHIE_PLUS_* env) with
// the same DutchieProvider shape and swap it in below. Nothing else changes.

import { placeholderProvider, type DutchieProvider } from './placeholder'

export type * from './types'

const provider: DutchieProvider = placeholderProvider // Phase 3: graphqlProvider

export const getLocations = provider.getLocations
export const getLocationBySlug = provider.getLocationBySlug
export const getMenu = provider.getMenu
export const getProducts = provider.getProducts
export const getProductBySlug = provider.getProductBySlug
export const getCategories = provider.getCategories
