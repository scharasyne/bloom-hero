-- Run once in Supabase SQL Editor (production).
-- Ensures auth delete cascades cleanly; fixes FK that blocks vendor user deletion.

-- ─── 1) FK fix (run once) ───────────────────────────────────────────────────
ALTER TABLE public.vendor_applications
  DROP CONSTRAINT IF EXISTS vendor_applications_approved_vendor_user_id_fkey;

ALTER TABLE public.vendor_applications
  ADD CONSTRAINT vendor_applications_approved_vendor_user_id_fkey
  FOREIGN KEY (approved_vendor_user_id)
  REFERENCES public.users (id)
  ON DELETE SET NULL;

-- ─── 2) Helpers: auth exists but public.users was deleted manually ──────────
-- Usage in SQL Editor:
--   SELECT * FROM public.list_orphan_auth_users();
--   SELECT public.delete_orphan_auth_users();  -- review list first

CREATE OR REPLACE FUNCTION public.list_orphan_auth_users()
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT au.id, au.email::text, au.created_at
  FROM auth.users AS au
  LEFT JOIN public.users AS pu ON pu.id = au.id
  WHERE pu.id IS NULL
  ORDER BY au.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.delete_orphan_auth_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM auth.users AS au
  WHERE au.id IN (
    SELECT o.id
    FROM auth.users AS o
    LEFT JOIN public.users AS pu ON pu.id = o.id
    WHERE pu.id IS NULL
  );
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.list_orphan_auth_users() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_orphan_auth_users() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_orphan_auth_users() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_orphan_auth_users() TO service_role;
