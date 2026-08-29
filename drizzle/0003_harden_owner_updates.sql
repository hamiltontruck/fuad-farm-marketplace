begin;

-- A signed-in user may edit normal profile fields, but browser clients must
-- never be able to grant themselves administrator access.
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or private.is_admin()
)
with check (
  private.is_admin()
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

-- Ownership is enforced by RLS and sensitive moderation fields are excluded
-- from browser-level UPDATE privileges. Admin flags and verification remain
-- database-controlled operations.
drop policy if exists listings_owner_update on public.listings;
create policy listings_owner_update
on public.listings
for update
to authenticated
using (
  owner_id = (select auth.uid())
  or private.is_admin()
)
with check (
  private.is_admin()
  or (
    owner_id = (select auth.uid())
    and status = any (array['active'::text, 'pending'::text, 'sold'::text])
  )
);

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

commit;
