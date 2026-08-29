-- Browser clients may edit normal profile fields, but must never be able to
-- grant themselves administrator access.
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_read_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
  and is_admin = false
);

create policy profiles_read_own
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  (select private.is_admin())
  or (
    id = (select auth.uid())
    and is_admin = false
  )
);

revoke update on public.profiles from authenticated;
grant update (
  full_name,
  phone,
  role,
  region,
  business_name,
  specialty,
  experience,
  avatar_url,
  updated_at
) on public.profiles to authenticated;

-- Consolidate listing reads and cache auth checks once per statement. Owners
-- retain access to pending posts, public visitors see active/sold posts, and
-- administrators retain moderation access.
drop policy if exists listings_public_read on public.listings;
drop policy if exists listings_public_read_anon on public.listings;
drop policy if exists listings_authenticated_read on public.listings;
drop policy if exists listings_owner_read_all on public.listings;
drop policy if exists listings_owner_insert on public.listings;
drop policy if exists listings_owner_update on public.listings;
drop policy if exists listings_owner_delete on public.listings;

create policy listings_public_read_anon
on public.listings
for select
to anon
using (status = any (array['active'::text, 'sold'::text]));

create policy listings_authenticated_read
on public.listings
for select
to authenticated
using (
  status = any (array['active'::text, 'sold'::text])
  or owner_id = (select auth.uid())
  or (select private.is_admin())
);

create policy listings_owner_insert
on public.listings
for insert
to authenticated
with check (
  owner_id = (select auth.uid())
  and verified = false
  and status = any (array['active'::text, 'pending'::text])
);

create policy listings_owner_update
on public.listings
for update
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_admin())
)
with check (
  (select private.is_admin())
  or (
    owner_id = (select auth.uid())
    and status = any (array['active'::text, 'pending'::text, 'sold'::text])
  )
);

create policy listings_owner_delete
on public.listings
for delete
to authenticated
using (
  owner_id = (select auth.uid())
  or (select private.is_admin())
);

-- Sensitive moderation and ownership fields remain database-controlled.
revoke update on public.listings from authenticated;
grant update (
  title,
  category,
  category_label,
  transaction,
  price,
  price_suffix,
  location,
  seller_name,
  phone,
  role_label,
  condition,
  description,
  image_urls,
  status,
  updated_at,
  market_country,
  area_sqm,
  property_type,
  bedrooms,
  bathrooms
) on public.listings to authenticated;

-- Both indexes had the exact same definition. Keep the clearer *_created_at_idx
-- name and remove duplicate write/storage overhead.
drop index if exists public.listings_market_country_created_idx;
