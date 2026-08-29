-- Supabase may preserve explicit function grants from project defaults. These
-- admin-only RPCs must not be executable by anonymous browser sessions even
-- though they also perform an internal private.is_admin() authorization check.
revoke execute on function public.admin_moderate_listing(uuid, text, text) from anon;
revoke execute on function public.admin_delete_listing(uuid, text) from anon;
