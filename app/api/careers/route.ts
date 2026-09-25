import { supabaseAdmin } from '@/lib/supabase/server'
import { notifyByEmail } from '@/lib/leads/email'

// Careers applications (Avanti, 2026-09-25: the phenos/wholesale concept,
// "upload resume option, and basic info"). Same hardening contract as
// /api/lead: platform-set client key, per-instance rate limit, honeypot,
// strict validation, upstream errors never leak. The resume RIDES THE EMAIL
// as an attachment and is deliberately NOT stored in Supabase; only the
// application facts land in the leads table (topic Careers).

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/
const PHONE_RE = /^[+()\-.\s\d]{7,20}$/

const MAX_RESUME_BYTES = 5 * 1024 * 1024
// extension + magic-byte allowlist: pdf, docx (zip), legacy doc (OLE)
const RESUME_TYPES: { ext: RegExp; magic: (b: Buffer) => boolean }[] = [
  { ext: /\.pdf$/i, magic: (b) => b.subarray(0, 4).toString('latin1') === '%PDF' },
  { ext: /\.docx$/i, magic: (b) => b[0] === 0x50 && b[1] === 0x4b },
  { ext: /\.doc$/i, magic: (b) => b[0] === 0xd0 && b[1] === 0xcf },
]

const hits = new Map<string, number[]>()
const LIMIT = 3
const WINDOW_MS = 60_000

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
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
  const ip = clientKey(req)
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests, try again shortly.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // honeypot: accept silently, store nothing
  if (typeof body.company === 'string' && body.company.length > 0) {
    return Response.json({ ok: true })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 120) : ''
  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 20) : ''
  const role = typeof body.role === 'string' ? body.role.trim().slice(0, 60) : ''
  const storePick = typeof body.store === 'string' ? body.store.trim().slice(0, 60) : ''
  const experience = typeof body.experience === 'string' ? body.experience.trim().slice(0, 40) : ''
  const pitch = typeof body.pitch === 'string' ? body.pitch.trim().slice(0, 2000) : ''

  if (!name || !EMAIL_RE.test(email) || !role || !storePick) {
    return Response.json({ error: 'Name, email, role and location are required.' }, { status: 400 })
  }
  if (phone && !PHONE_RE.test(phone)) {
    return Response.json({ error: 'That phone number does not look right.' }, { status: 400 })
  }

  // resume: optional, base64, small allowlist — decoded and sniffed
  let attachment: { filename: string; contentBase64: string } | undefined
  const resume = body.resume as { filename?: unknown; dataBase64?: unknown } | undefined
  if (resume && typeof resume === 'object' && typeof resume.filename === 'string' && typeof resume.dataBase64 === 'string') {
    const filename = resume.filename.replace(/[^\w.\- ]/g, '').slice(0, 120)
    const rule = RESUME_TYPES.find((t) => t.ext.test(filename))
    if (!rule) {
      return Response.json({ error: 'Resume must be a PDF or Word document.' }, { status: 400 })
    }
    if (resume.dataBase64.length > MAX_RESUME_BYTES * 1.4) {
      return Response.json({ error: 'Resume must be under 5MB.' }, { status: 400 })
    }
    let buf: Buffer
    try {
      buf = Buffer.from(resume.dataBase64, 'base64')
    } catch {
      return Response.json({ error: 'Could not read the resume file.' }, { status: 400 })
    }
    if (buf.length === 0 || buf.length > MAX_RESUME_BYTES || !rule.magic(buf)) {
      return Response.json({ error: 'Resume must be a PDF or Word document under 5MB.' }, { status: 400 })
    }
    attachment = { filename, contentBase64: resume.dataBase64 }
  }

  const summary = [
    `Role: ${role}`,
    `Location: ${storePick}`,
    `Experience: ${experience || 'not given'}`,
    pitch ? `Why the jungle:\n${pitch}` : '',
    attachment ? `Resume attached: ${attachment.filename}` : 'No resume attached.',
  ]
    .filter(Boolean)
    .join('\n')

  // the leads table stays the application ledger; the file rides the email
  // only. Same insert contract as /api/lead (base columns + optional 0004
  // columns with fallback); consent_text records the hiring-use statement
  // shown on the form, not TCPA marketing consent.
  const base = {
    name,
    email,
    phone: phone || null,
    consent_text:
      'Application submitted voluntarily via jungleboys.com/careers; contact information provided for hiring purposes only.',
    source_page: '/careers',
    forwarded_status: 'pending',
  }
  // local-run guard: same records-integrity rule as /api/lead — a laptop
  // must not write rows into the production ledger
  if (!process.env.VERCEL_ENV && process.env.ALLOW_LOCAL_LEAD_WRITES !== 'true') {
    return Response.json({ ok: true, stored: false, note: 'Local run, validated but not written.' })
  }

  const db = supabaseAdmin()
  let ins = await db
    .from('leads')
    .insert({ ...base, message: summary, topic: 'Careers', location: storePick })
    .select('id')
    .single()
  if (ins.error) {
    ins = await db.from('leads').insert(base).select('id').single()
  }
  if (ins.error || !ins.data) {
    return Response.json({ error: 'Could not save your application, try again.' }, { status: 500 })
  }

  await notifyByEmail({
    name,
    email,
    phone,
    topic: 'Careers',
    location: storePick,
    message: summary,
    sourcePage: '/careers',
    attachments: attachment ? [attachment] : undefined,
  })

  return Response.json({ ok: true })
}
