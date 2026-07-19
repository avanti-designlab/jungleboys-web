// TEMPORARY guarded route — Setup Runbook Step 6 verify gate (cloud wiring).
// Secret-gated so it exposes nothing publicly. Deleted after the gate passes.
import { supabaseAdmin } from '@/lib/supabase/server'
import { getStory } from '@/lib/storyblok'

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  const results: Record<string, string> = {}

  const { error } = await supabaseAdmin
    .from('retailers')
    .select('*', { count: 'exact', head: true })
  results.supabase = error ? `ERR: ${error.message}` : 'ok'

  try {
    const story = await getStory('home')
    results.storyblok = story?.name === 'Home' ? 'ok' : 'unexpected story'
  } catch (e) {
    results.storyblok = `ERR: ${e instanceof Error ? e.message : 'unknown'}`
  }

  const ok = results.supabase === 'ok' && results.storyblok === 'ok'
  return Response.json({ ok, ...results })
}
