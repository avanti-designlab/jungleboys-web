import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { supabaseAdmin } from '@/lib/supabase/server'
import { forwardLead } from '@/lib/leads/forward'

// Lead capture (06 §5 lead-pipeline skill, 07 §4 TCPA):
//   validate → write Supabase consent ledger (source of truth) → best-effort forward.
// The consent text logged is the server's canonical copy — never client-supplied.

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/

// Baseline per-instance rate limit (edge/serverless caveat noted in audit;
// upgrade to a shared store if abuse appears).
const hits = new Map<string, number[]>()
const LIMIT = 5
const WINDOW_MS = 60_000

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  return arr.length > LIMIT
}

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests — try again shortly.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // honeypot: bots fill the hidden "company" field — accept silently, store nothing
  if (typeof body.company === 'string' && body.company.length > 0) {
    return Response.json({ ok: true })
  }

  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 120) : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : ''
  const sourcePage =
    typeof body.sourcePage === 'string' ? body.sourcePage.slice(0, 200) : null

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (phone && !PHONE_RE.test(phone)) {
    return Response.json({ error: 'Enter a valid phone number.' }, { status: 400 })
  }

  const consentText = (
    await readFile(path.join(process.cwd(), 'content/legal/tcpa-consent.txt'), 'utf-8')
  ).trim()

  // 1) consent ledger first — if forwarding fails, the lead is safe
  const { data: row, error } = await supabaseAdmin()
    .from('leads')
    .insert({
      name: name || null,
      email,
      phone: phone || null,
      consent_text: consentText,
      source_page: sourcePage,
      forwarded_status: 'pending',
    })
    .select('id')
    .single()

  if (error) {
    return Response.json({ error: 'Could not save signup — try again.' }, { status: 500 })
  }

  // 2) best-effort forward; record outcome
  const status = await forwardLead({ name, email, phone })
  await supabaseAdmin().from('leads').update({ forwarded_status: status }).eq('id', row.id)

  return Response.json({ ok: true })
}
