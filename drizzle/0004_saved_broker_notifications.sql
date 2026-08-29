-- Saved listings belong only to the signed-in user. The composite key prevents
-- duplicate favorites and cascades cleanup when a listing or account is removed.
create table if not exists public.saved_listings (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create index if not exists saved_listings_listing_id_idx
  on public.saved_listings (listing_id);

alter table public.saved_listings enable row level security;

drop policy if exists saved_listings_read_own on public.saved_listings;
drop policy if exists saved_listings_insert_own on public.saved_listings;
drop policy if exists saved_listings_delete_own on public.saved_listings;

create policy saved_listings_read_own
on public.saved_listings
for select
to authenticated
using (user_id = (select auth.uid()));

create policy saved_listings_insert_own
on public.saved_listings
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy saved_listings_delete_own
on public.saved_listings
for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.saved_listings from anon;
revoke update on public.saved_listings from authenticated;
grant select, insert, delete on public.saved_listings to authenticated;

-- Moderation events are immutable and admin-readable. Listing metadata is
-- copied so the audit trail remains useful after an administrator deletes a row.
create table if not exists public.moderation_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  owner_id uuid references auth.users(id) on delete set null,
  listing_title text not null,
  action text not null check (action in ('activate', 'mark_sold', 'hide', 'delete')),
  previous_status text,
  new_status text,
  reason text not null check (length(btrim(reason)) >= 3),
  created_at timestamptz not null default now()
);

create index if not exists moderation_events_created_at_idx
  on public.moderation_events (created_at desc);
create index if not exists moderation_events_listing_id_idx
  on public.moderation_events (listing_id);

alter table public.moderation_events enable row level security;

drop policy if exists moderation_events_admin_read on public.moderation_events;
create policy moderation_events_admin_read
on public.moderation_events
for select
to authenticated
using ((select private.is_admin()));

revoke all on public.moderation_events from anon, authenticated;
grant select on public.moderation_events to authenticated;

-- Notifications are private to the recipient. Browser clients can only mark
-- their own rows read or delete them; creation stays inside trusted functions.
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  type text not null check (type in ('moderation_status', 'moderation_delete')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

alter table public.notifications enable row level security;

drop policy if exists notifications_read_own on public.notifications;
drop policy if exists notifications_update_own on public.notifications;
drop policy if exists notifications_delete_own on public.notifications;

create policy notifications_read_own
on public.notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy notifications_update_own
on public.notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy notifications_delete_own
on public.notifications
for delete
to authenticated
using (user_id = (select auth.uid()));

revoke all on public.notifications from anon;
revoke update on public.notifications from authenticated;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

create or replace function public.admin_moderate_listing(
  p_listing_id uuid,
  p_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_title text;
  v_previous_status text;
  v_action text;
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_status not in ('active', 'sold', 'hidden') then
    raise exception 'Unsupported moderation status';
  end if;

  if length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A moderation reason of at least 3 characters is required';
  end if;

  select owner_id, title, status
    into v_owner_id, v_title, v_previous_status
  from public.listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'Listing not found';
  end if;

  v_action := case p_status
    when 'active' then 'activate'
    when 'sold' then 'mark_sold'
    else 'hide'
  end;

  update public.listings
  set status = p_status,
      updated_at = now()
  where id = p_listing_id;

  insert into public.moderation_events (
    listing_id, actor_id, owner_id, listing_title, action,
    previous_status, new_status, reason
  ) values (
    p_listing_id, auth.uid(), v_owner_id, v_title, v_action,
    v_previous_status, p_status, btrim(p_reason)
  );

  insert into public.notifications (user_id, listing_id, type, title, body)
  values (
    v_owner_id,
    p_listing_id,
    'moderation_status',
    'Post status changed',
    format('Your post "%s" changed from %s to %s. Reason: %s', v_title, v_previous_status, p_status, btrim(p_reason))
  );
end;
$$;

create or replace function public.admin_delete_listing(
  p_listing_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_owner_id uuid;
  v_title text;
  v_previous_status text;
begin
  if not private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_reason, ''))) < 3 then
    raise exception 'A deletion reason of at least 3 characters is required';
  end if;

  select owner_id, title, status
    into v_owner_id, v_title, v_previous_status
  from public.listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'Listing not found';
  end if;

  insert into public.moderation_events (
    listing_id, actor_id, owner_id, listing_title, action,
    previous_status, new_status, reason
  ) values (
    p_listing_id, auth.uid(), v_owner_id, v_title, 'delete',
    v_previous_status, null, btrim(p_reason)
  );

  insert into public.notifications (user_id, listing_id, type, title, body)
  values (
    v_owner_id,
    p_listing_id,
    'moderation_delete',
    'Post removed by moderation',
    format('Your post "%s" was removed. Reason: %s', v_title, btrim(p_reason))
  );

  delete from public.listings where id = p_listing_id;
end;
$$;

revoke all on function public.admin_moderate_listing(uuid, text, text) from public;
revoke all on function public.admin_delete_listing(uuid, text) from public;
grant execute on function public.admin_moderate_listing(uuid, text, text) to authenticated;
grant execute on function public.admin_delete_listing(uuid, text) to authenticated;
