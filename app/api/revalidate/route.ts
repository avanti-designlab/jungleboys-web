import { revalidatePath, revalidateTag } from 'next/cache'

// ISR revalidation webhook target (Setup Runbook Step 7, 01 §2).
// Callers: Storyblok "story published" (now) + Dutchie inventory events (Phase 3).
// Every caller must present the shared secret — unauthenticated calls are rejected.

// Constant-time compare. `===` on a secret leaks its length and, in principle,
// its prefix through timing — cheap to remove, and this endpoint had no rate
// limit to blunt the attempt.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Same shape as /api/lead's limiter, keyed on a value the client cannot choose.
// 20 wrong secrets in a row were previously all processed, which makes an
// offline-capable target out of an endpoint that purges the whole cache.
const WINDOW_MS = 60_000
const LIMIT = 10
const hits = new Map<string, number[]>()
function rateLimited(key: string): boolean {
  const now = Date.now()
  const arr = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(key, arr)
  return arr.length > LIMIT
}
function clientKey(req: Request): string {
  const vercel = req.headers.get('x-vercel-forwarded-for')
  if (vercel) return vercel.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return 'unknown'
}

export async function POST(req: Request) {
  if (rateLimited(clientKey(req))) {
    return new Response('Too many requests', { status: 429 })
  }

  // Header first. The query string lands in access logs, referrers and browser
  // history; ?secret= is still accepted so the existing Storyblok webhook keeps
  // working, and should be migrated to the header before Phase 3 adds Dutchie.
  const url = new URL(req.url)
  const secret = (req.headers.get('x-webhook-secret') ?? url.searchParams.get('secret') ?? '').trim()
  const candidates = [
    (process.env.STORYBLOK_WEBHOOK_SECRET ?? '').trim(),
    (process.env.REVALIDATE_SECRET ?? '').trim(),
  ].filter(Boolean)
  const valid = secret.length > 0 && candidates.some((c) => safeEqual(secret, c))
  if (!valid) {
    return new Response('Unauthorized', { status: 401 })
  }

  let slug: string | undefined
  try {
    const body = await req.json()
    // Storyblok publish payload carries full_slug; fall back to story_id-less no-op
    slug = body?.full_slug ?? body?.story?.full_slug
  } catch {
    // empty/non-JSON body → revalidate nothing specific
  }

  if (slug) {
    revalidateTag(`story:${slug}`, 'max')
    revalidatePath(slug === 'home' ? '/' : `/${slug}`)
    return Response.json({ revalidated: true, slug })
  }
  return Response.json({ revalidated: false, reason: 'no slug in payload' })
}
