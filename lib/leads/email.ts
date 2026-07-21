// Team notification email for inquiry forms (contact / wholesale / phenos).
// Sent via Resend's REST API — no SDK dependency, same best-effort contract as
// the Klaviyo forwarder (never throws; the Supabase row is the source of truth).
// Marketing signups (newsletter) do NOT come through here — they go to Klaviyo.

export type EmailResult = 'sent' | 'skipped-no-key' | 'failed'

export type NotifyPayload = {
  name?: string
  email?: string
  phone?: string
  topic?: string
  message?: string
  location?: string
  sourcePage?: string | null
}

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c] as string)
}

export async function notifyByEmail(lead: NotifyPayload): Promise<EmailResult> {
  const key = (process.env.RESEND_API_KEY ?? '').trim()
  const to = (process.env.LEAD_NOTIFY_EMAIL ?? '').trim()
  if (!key || !to) return 'skipped-no-key' // activates once the key + inbox land
  // Must be an address on a domain verified in Resend (e.g. jungleboys.com).
  const from = (process.env.RESEND_FROM ?? 'Jungle Boys Website <notifications@jungleboys.com>').trim()

  const kind = lead.topic || 'Contact'
  const rows: [string, string | undefined][] = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Topic', lead.topic],
    ['Store', lead.location],
    ['Page', lead.sourcePage || undefined],
  ]
  const table = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#888">${k}</td><td style="padding:4px 0"><strong>${esc(String(v))}</strong></td></tr>`)
    .join('')
  const messageBlock = lead.message
    ? `<p style="margin:16px 0 4px;color:#888">Message</p><div style="white-space:pre-wrap;border-left:3px solid #FECF0E;padding:8px 12px;background:#faf9f6">${esc(lead.message)}</div>`
    : ''
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;color:#111">
    <h2 style="margin:0 0 12px">New ${esc(kind)} submission</h2>
    <table style="border-collapse:collapse">${table}</table>${messageBlock}
    <p style="margin-top:20px;color:#aaa;font-size:12px">Sent from the Jungle Boys website. Reply to reach ${esc(lead.email || 'the sender')}.</p>
  </div>`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: lead.email || undefined,
        subject: `New ${kind} submission${lead.name ? ` — ${lead.name}` : ''}`,
        html,
      }),
    })
    return res.ok ? 'sent' : 'failed'
  } catch {
    return 'failed'
  }
}
