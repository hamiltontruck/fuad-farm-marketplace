-- Avoid overlapping permissive SELECT policies while preserving public access
-- to active markets and administrator access to all market records.
drop policy if exists markets_admin_manage on public.markets;
drop policy if exists markets_public_read on public.markets;
drop policy if exists markets_public_read_anon on public.markets;
drop policy if exists markets_authenticated_read on public.markets;
drop policy if exists markets_admin_insert on public.markets;
drop policy if exists markets_admin_update on public.markets;
drop policy if exists markets_admin_delete on public.markets;

create policy markets_public_read_anon
on public.markets
for select
to anon
using (is_active = true);

create policy markets_authenticated_read
on public.markets
for select
to authenticated
using (
  is_active = true
  or (select private.is_admin())
);

create policy markets_admin_insert
on public.markets
for insert
to authenticated
with check ((select private.is_admin()));

create policy markets_admin_update
on public.markets
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy markets_admin_delete
on public.markets
for delete
to authenticated
using ((select private.is_admin()));
