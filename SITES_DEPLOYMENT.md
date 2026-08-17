# FUAD Marketplace — Sites deployment checklist

## Required resources

- D1 binding: `DB`
- R2 binding: `MEDIA`
- Secret: `ADMIN_EMAILS`
  - Value: the email address used by the marketplace administrator to sign in with ChatGPT.
  - Multiple administrators may be separated with commas.

Do not put the administrator email list in `.openai/hosting.json`; keep it in the Site environment variables/secrets settings.

## Before deployment

1. Review `drizzle/0002_admin_photos.sql`.
2. Confirm `.openai/hosting.json` contains D1 `DB` and R2 `MEDIA`.
3. Add `ADMIN_EMAILS` in Site settings.
4. Save a new Site version.
5. Review and approve the D1 migration and R2 resource changes.
6. Deploy the saved version.

## Production verification

1. Open `/system-check` and confirm:
   - API: PASS
   - D1 database: PASS
   - R2 photo storage: PASS
   - ADMIN_EMAILS configured: PASS
2. Open `/post` and sign in with ChatGPT.
3. Publish a listing with 1–5 JPG, PNG, or WebP images, each no larger than 5 MB.
4. Open `/live-listings` in another browser or phone and confirm the listing and images are visible.
5. Open `/my-listings`, mark the listing Sold, and confirm the change appears in the other browser after refresh.
6. Open `/admin` with an administrator account and test Active, Sold, Hide, and Delete.

## Ownership note

Listings created through `/post` while signed in have server-verified ownership and can be managed from `/my-listings`. Legacy listings created by the old local form may not have an owner email; an administrator can still moderate or delete them.
