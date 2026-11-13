# Key rotation runbook

Required by the security brief (04 §3). Every secret this project uses, where
it lives, how to rotate it, and how fast a leak can be contained. Names only,
per invariant §9.1: real values exist ONLY in Vercel env vars and the vendor
dashboards; they are never pasted into chat, committed, or stored elsewhere.

**The one move that matters in a leak:** rotate at the VENDOR first (the old
value dies there), then update the Vercel env var, then redeploy. Rotating
only in Vercel leaves the leaked value alive.

**Where env vars live:** Vercel > jungleboys project > Settings > Environment
Variables. After any change, redeploy (Deployments > ... > Redeploy) so
serverless functions pick it up. Local `.env.local` mirrors a subset for
development; update it by hand, it is gitignored.

## Inventory

| Secret | Scope | Vendor console | Blast radius if leaked | Rotation steps |
|---|---|---|---|---|
| `DUTCHIE_PLUS_PUBLIC_KEY` | server | Dutchie support issues keys (ask via the Lily thread) | Menu reads + checkout creation under our org; no customer PII readable | Ask Dutchie for a reissue, swap in Vercel, redeploy, verify a menu page + a bag quote |
| Dutchie SECRET key (held, unused in code) | offline | Dutchie support | Order/customer reads if ever wired | Same as above; it is stored in Vercel but no code path uses it yet |
| `DUTCHIE_PLUS_KEY_<STORE>` ×4 | server | Dutchie | Dead credentials (the 2026-08 retail keys, superseded) | Delete from Vercel at cutover cleanup; nothing reads them when the public key is present |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Supabase > Settings > API | FULL database access incl. the leads + consent ledger. Highest-value secret in the project | Supabase dashboard > rotate service role key (instant), swap in Vercel, redeploy, submit a test lead |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public by design | Supabase > Settings > API | Nothing: RLS verified on, grants deny anon | Rotate alongside the service key if ever desired; update env + redeploy |
| `KLAVIYO_API_KEY` | server | Klaviyo > Settings > API keys | Read/write marketing list | Create new private key, swap in Vercel, delete old key in Klaviyo, redeploy, submit a test lead and confirm forward |
| `RESEND_API_KEY` | server | Resend > API keys | Could send mail AS contact.jungleboys.com (phishing risk, treat seriously) | Create new key, swap, delete old, redeploy, send a test contact inquiry |
| `STORYBLOK_TOKEN` (delivery) | server | Storyblok > Settings > Access tokens | Read-only CMS content (public-ish risk) | Generate new delivery token, swap, revoke old, redeploy |
| `STORYBLOK_WEBHOOK_SECRET` / `REVALIDATE_SECRET` | server | Ours (random strings) | Someone could trigger cache revalidation (nuisance only) | Generate a new random string, update env + any webhook config, redeploy |
| `FIGMA_TOKEN` | server, dev-time only | Figma > Personal access tokens | Read access to the design file | Revoke in Figma, generate new, update `.env.local` (not needed in Vercel prod) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | public by nature | GA4 admin | None (every GA site ships it) | Not a secret; swap only if the property changes |
| Vercel + GitHub + GoDaddy + vendor dashboard logins | humans | each vendor | Everything downstream | MFA on (launch-day runbook item); rotate passwords on personnel change |

## Cadence

- **On any suspected leak:** rotate that key the same day, vendor-first.
- **On personnel/vendor change:** rotate every key the departing party could
  have seen, plus dashboard passwords.
- **Annually (with the privacy-policy annual review):** rotate
  `SUPABASE_SERVICE_ROLE_KEY`, `KLAVIYO_API_KEY`, `RESEND_API_KEY`, and the
  two webhook secrets even without an incident; they are the write-capable set.
- **At cutover cleanup:** delete the four dead `DUTCHIE_PLUS_KEY_<STORE>`
  retail keys and `DUTCHIE_PLUS_SANDBOX_*` from Vercel.

## Verification after any rotation

One pass of: a menu page renders with live products, a bag quote returns
numbers, a test contact-form submission lands in the leads table AND the
notify inbox AND Klaviyo. That exercises Dutchie, Supabase, Resend, and
Klaviyo in one sweep.
