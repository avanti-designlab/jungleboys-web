import { revalidatePath, revalidateTag } from 'next/cache'

// ISR revalidation webhook target (Setup Runbook Step 7, 01 §2).
// Callers: Storyblok "story published" (now) + Dutchie inventory events (Phase 3).
// Every caller must present the shared secret — unauthenticated calls are rejected.

export async function POST(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const valid =
    secret &&
    (secret === (process.env.STORYBLOK_WEBHOOK_SECRET ?? '').trim() ||
      secret === (process.env.REVALIDATE_SECRET ?? '').trim())
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
