import type { Product } from './types'

// Card-sized Product for LIST surfaces (shelves, grids, deals, brands, drops,
// related). ProductCard is a client component, so every Product prop is
// serialized whole into the page payload — description, full COA panel, every
// image — even though a card renders one shot, one price, three chips. On
// fixture data that waste is invisible; on San Diego's live menu (~1,500
// products, most discounted) it built a 22.9 MB deals page and Vercel refuses
// ISR pages over ~19 MB (FALLBACK_BODY_TOO_LARGE, 2026-09-10 deploy failure).
// Trim at the server boundary; PDPs keep the full Product.
//
// Kept fields = the union of what ProductCard renders and what MenuBrowser
// filters/sorts on (category/subcategory/strainType/brand/variants/thc) plus
// the cheap flags shelf logic reads. Grow this list only when a LIST surface
// renders a new field.
export function toCardProduct(p: Product): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    subcategory: p.subcategory,
    strainType: p.strainType,
    featured: p.featured,
    retailerId: p.retailerId,
    images: p.images.slice(0, 1),
    variants: p.variants,
    labResult: p.labResult?.potency?.thc
      ? { potency: { thc: p.labResult.potency.thc } }
      : undefined,
  }
}

export function toCardProducts(list: Product[]): Product[] {
  return list.map(toCardProduct)
}
