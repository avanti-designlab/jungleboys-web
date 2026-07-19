-- 0002 — Explicit least-privilege grants (required because "Automatically expose
-- new tables" is disabled on this project — access is manual by design, per 04 §4).
--
--   service_role : full access to both tables (server routes only; never shipped to client)
--   anon         : SELECT on retailers ONLY (the RLS policy further limits to active=true)
--   anon         : NO access to leads whatsoever
--   authenticated: nothing (we run no user auth — Dutchie owns it)

grant usage on schema public to anon, service_role;

grant all on public.leads     to service_role;
grant all on public.retailers to service_role;

grant select on public.retailers to anon;
