-- 0004 — Store the full submission so Supabase is the single organized record the
-- team can browse (2026-07-21). message/topic/location previously only reached the
-- forwarding destination (Klaviyo); now every contact/wholesale/phenos/newsletter
-- submission is fully logged here. All additive + nullable (safe to apply anytime).

alter table public.leads
  add column if not exists message text,
  add column if not exists topic text,
  add column if not exists location text;
