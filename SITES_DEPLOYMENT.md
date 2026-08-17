# FUAD Marketplace — Supabase deployment checklist

## Connected cloud resources

- Supabase project: `fuad-marketplace`
- Project URL: `https://gdckzjtneidkngfjfjlx.supabase.co`
- Database tables: `profiles`, `listings`
- Storage bucket: `listing-images`
- Authentication: Supabase email/password

The browser uses only the public project URL and publishable key. Never add a `service_role`, secret key, database password, or personal access token to frontend code.

## Recommended Site environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The repository includes project-specific public fallback values so the Site can connect after deployment, but environment variables are recommended because they are easier to rotate later.

## Before deployment

1. Confirm the `profiles` and `listings` tables exist and RLS is enabled.
2. Confirm the public `listing-images` bucket exists.
3. Confirm Storage policies restrict upload paths to the signed-in user's UUID folder.
4. Save a new Site version.
5. Deploy the saved version.

## Production verification

1. Open `/system-check` and confirm:
   - Supabase database: PASS
   - `listing-images` Storage: PASS
2. Open `/post` and create or sign in to a FUAD Supabase account.
3. Publish a listing with 1–5 JPG, PNG, or WebP images, each no larger than 5 MB.
4. Open `/live-listings` in another browser or phone and confirm the listing and images are visible.
5. Open `/my-listings`, mark the listing Sold, and confirm the change appears in the other browser after refresh.
6. For admin access, set the intended user's `profiles.is_admin` value to `true`, then open `/admin` and test Active, Sold, Hide, and Delete.

## Ownership and security

- Every new listing stores the signed-in Supabase user UUID in `owner_id`.
- RLS allows owners to manage their own listings.
- Admin permissions come from `profiles.is_admin`; browser input cannot grant admin access.
- Storage uploads are restricted to `listing-images/<user-id>/...`.
- Public image URLs are readable by marketplace visitors, while upload/update/delete operations remain protected by Storage RLS.
