// Lead forwarding — behind an interface so the destination is swappable
// (locked decision: Klaviyo now, Dutchie later). Never throws: the Supabase
// consent-ledger write is the source of truth; forwarding is best-effort and
// its outcome is recorded on the lead row.

export type LeadPayload = {
  name?: string
  email: string
  phone?: string
}

export type ForwardResult = 'forwarded' | 'skipped-no-key' | 'failed'

export async function forwardLead(lead: LeadPayload): Promise<ForwardResult> {
  const key = (process.env.KLAVIYO_API_KEY ?? '').trim()
  if (!key) return 'skipped-no-key' // Step 9 pending — activates when the key lands

  try {
    const res = await fetch('https://a.klaviyo.com/api/profile-import/', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${key}`,
        'Content-Type': 'application/vnd.api+json',
        revision: '2024-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'profile',
          attributes: {
            email: lead.email,
            phone_number: lead.phone || undefined,
            first_name: lead.name || undefined,
          },
        },
      }),
    })
    return res.ok ? 'forwarded' : 'failed'
  } catch {
    return 'failed'
  }
}
