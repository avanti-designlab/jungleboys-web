'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics'

// view_item for the PDP — product facts only, never PII. Client because the
// event needs the visitor's consent-gated gtag; the page stays server-rendered.
export default function PdpAnalytics({
  slug,
  name,
  price,
  category,
}: {
  slug: string
  name: string
  price: number // cents
  category: string
}) {
  useEffect(() => {
    track('view_item', {
      currency: 'USD',
      value: price / 100,
      items: [{ item_id: slug, item_name: name, item_category: category }],
    })
  }, [slug, name, price, category])
  return null
}
