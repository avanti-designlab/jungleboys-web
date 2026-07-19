import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Service-role client — SERVER ONLY. Never import into a client component.
// Lazily constructed so module evaluation at build time never requires env vars.
let _admin: SupabaseClient | null = null

export function supabaseAdmin(): SupabaseClient {
  if (!_admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Supabase env vars are not set')
    _admin = createClient(url, key, { auth: { persistSession: false } })
  }
  return _admin
}
