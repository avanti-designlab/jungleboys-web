# Phase 0 Security Audit — 2026-07-19

**Auditor:** Security agent (04 §8 checklist, Phase 0 emphasis: secrets discipline, headers
baseline, Supabase RLS, CI security). **Scope:** everything built in Phase 0 (Setup Runbook
Steps 0–8 + foundation deliverables). `/api/lead` does not exist yet — audited in the
**Step 9 addendum** below before Phase 0 formally closes.

## Results by checklist item

| # | Check | Result |
|---|---|---|
| 1 | Secrets: git history scan (all branches, full history) | ✅ CLEAN — no key-like values ever committed |
| 1 | Secrets: tracked files | ✅ only `.env.example` (names-only) tracked |
| 1 | Secrets: hardcoded strings in source | ✅ CLEAN |
| 1 | Secrets: client bundle scan (`.next/static`) | ✅ CLEAN — no server-only env names in client chunks |
| 1 | `NEXT_PUBLIC_` inventory | ✅ only `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` (public by design; anon role verified powerless below) |
| 2 | Security headers | ✅ full baseline implemented + verified locally; production verification logged below. CSP note → finding SEC-P0-1 |
| 3 | Supabase RLS: anon INSERT/SELECT/DELETE on `leads` | ✅ ALL BLOCKED (live test) |
| 3 | Supabase RLS: anon INSERT/UPDATE on `retailers` | ✅ BLOCKED; SELECT allowed by design (store locator) |
| 3 | Supabase: API grants | ✅ explicit least-privilege (auto-expose OFF, migration 0002) |
| 4 | API routes: inventory | ✅ one route (`/api/revalidate`) |
| 4 | API routes: auth | ✅ live-verified — 401 no secret, 401 wrong secret, 405 wrong method |
| 5 | Dependencies: `npm audit` | ✅ 0 critical, 0 high. 2 moderate → finding SEC-P0-2 |
| 5 | Imported third-party repos | ✅ none yet (registry empty; vetting rule recorded for Phase 2) |
| 6 | Injection/XSS surfaces | ✅ none exposed — no forms, no CMS rendering yet; revalidate route parses JSON defensively, echoes nothing |
| 7 | Auth boundary (Dutchie) | N/A — no auth surfaces built in Phase 0 |
| 8 | PII in URLs/logs/analytics | ✅ no PII collected or logged anywhere; `leads` table empty |
| 9 | Age gate | N/A — Phase 1 build; compliance invariants recorded in CLAUDE.md |
| — | Infra: deployment protection | ✅ verified externally — deployment URL 302s to Vercel auth; production 200 public |
| — | Infra: env-var scoping | ✅ Production + Preview; `DUTCHIE_PLUS_*` empty until Phase 3 |
| — | CI security | ✅ workflow active (gitleaks + `npm audit --audit-level=high` + lint + build) — see SEC-P0-3 |

## Findings

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| SEC-P0-1 | **Medium** | CSP `script-src` includes `'unsafe-inline'` (Next.js inline runtime; no nonces yet) | **Accepted for Phase 0 with deadline:** nonce-based CSP via middleware is a Phase 1 exit requirement |
| SEC-P0-2 | **Moderate** | 2 moderate advisories on `postcss` — transitive, pinned inside Next.js's own bundle; build-time only | **Accepted/tracked:** remediate by Next.js patch upgrade when released; re-check each phase audit |
| SEC-P0-3 | **Info** | CI runs can't be verified from this environment (no `gh`); green run needs eyeballing | Avanti: repo → Actions tab → confirm latest run green |
| SEC-P0-4 | **Info** | Branch protection on `main` deferred (recorded owner decision) | Enable at Phase 1 start; mandatory before cutover |

**Criticals: 0. Highs: 0. → Phase 0 audit verdict: PASS** (per 04 §8, criticals block; none exist).

## Step 9 addendum — COMPLETE (2026-07-19)

`/api/lead` audited with the Klaviyo key live:

| Check | Result |
|---|---|
| Input validation (email/phone regex, length caps, at least one contact channel) | ✅ verified (400s on bad input) |
| Rate limiting | ✅ verified (429 after 5/min/IP) |
| Honeypot | ✅ verified (bot submissions silently discarded, no row) |
| Consent ledger | ✅ verbatim 590-char TCPA text + timestamp + source page written per submission (live prod test) |
| Forwarding | ✅ end-to-end verified: forwarded_status='forwarded', profile confirmed present in Klaviyo via API |
| Klaviyo key exposure | ✅ server-only — client bundle scan clean; env in Vercel Production+Preview |
| Anon Supabase write path | ✅ still blocked (RLS re-verified this session) |

**Known gap (tracked, non-blocking):** the `LEAD_NOTIFY_EMAIL` copy is not yet delivered — no email
provider exists in the stack. Options for Phase 1: a Klaviyo notification flow (no new vendor) or a
transactional provider (e.g. Resend). Decision owner: Avanti.

**PHASE 0: FORMALLY CLOSED.** All setup steps 0–9 complete and verified; both freeze gates passed;
audit PASS held through the addendum.
