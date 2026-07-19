-- 0001 — Phase 0 foundation schema (Setup Runbook Step 4c / 01 §5)
-- Supabase's minimal role: lead-capture + TCPA consent ledger, Product Finder retailer directory.
-- RLS default-deny on both; the ONLY policy is anon SELECT of active retailers.

-- leads: lead-capture log + TCPA consent ledger
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  consent_text text not null,
  consent_timestamp timestamptz not null default now(),
  source_page text,
  forwarded_status text default 'pending',
  created_at timestamptz not null default now()
);
alter table public.leads enable row level security;   -- default-deny; writes via server route only

-- retailers: Product Finder directory (public read, restricted write)
create table public.retailers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  lat double precision,
  lng double precision,
  active boolean default true,
  notes text
);
alter table public.retailers enable row level security;

-- retailers are public store-locator data → allow anon SELECT of active rows
create policy "public read active retailers"
  on public.retailers for select
  using (active = true);
-- NOTE: no anon insert/update/delete policy anywhere → default-deny holds.
-- leads has NO anon policy at all → only the service-role server route can write.
