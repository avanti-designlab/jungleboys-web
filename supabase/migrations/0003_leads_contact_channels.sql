-- 0003 — Phone-first signup support (live form parity, 2026-07-19)
-- The live site's footer form collects PHONE (SMS list); email becomes optional.
-- A lead must carry at least one contact channel.

alter table public.leads alter column email drop not null;

alter table public.leads
  add constraint leads_contact_channel_check
  check (email is not null or phone is not null);
