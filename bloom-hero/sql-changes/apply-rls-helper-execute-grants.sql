-- Manual only. EMERGENCY fix — run in Supabase SQL editor if you see:
--   permission denied for function is_admin
--
-- RLS policies call is_admin() etc. for BOTH anon (guests) and authenticated (login).
-- apply-database-linter-fixes.sql wrongly revoked EXECUTE from both.
--
-- This restores the app. You will still see linter 0029 WARN on public.* helpers.
-- Permanent fix: apply-rls-helpers-private-schema.sql then re-run
-- apply-rls-consolidate-permissive-policies.sql (uses private.*, clears 0029).

REVOKE EXECUTE ON FUNCTION public.can_read_public_vendor_catalog() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_vendor_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_vendor() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_customer() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_approved_vendor_id(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.can_read_public_vendor_catalog() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_vendor_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_vendor() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_customer() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved_vendor_id(uuid) TO anon, authenticated;
