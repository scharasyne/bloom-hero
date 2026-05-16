-- Bloom Hero — sql/01-rls-helpers.sql
-- Run in Supabase SQL editor (idempotent). Then run 02-rls-policies.sql.
--
-- • private.* RLS helpers (not exposed on /rest/v1/rpc)
-- • public.* wrappers + GRANT EXECUTE for anon/authenticated (fixes login / map errors)
-- See sql/README.md for full briefing.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, authenticated, anon, service_role;

-- ─── Core helpers (SECURITY DEFINER — bypass RLS when reading role / vendor id) ─

CREATE OR REPLACE FUNCTION private.current_user_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION private.current_vendor_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT id FROM public.vendors WHERE owner_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT private.current_user_role() = 'admin'::public.user_role;
$$;

CREATE OR REPLACE FUNCTION private.is_vendor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT private.current_user_role() = 'vendor'::public.user_role;
$$;

CREATE OR REPLACE FUNCTION private.is_customer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT private.current_user_role() = 'customer'::public.user_role;
$$;

CREATE OR REPLACE FUNCTION private.is_approved_vendor_id(vendor_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = vendor_uuid AND v.status = 'approved'::public.vendor_status
  );
$$;

CREATE OR REPLACE FUNCTION private.can_read_public_vendor_catalog()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT (select auth.uid()) IS NULL
    OR (select private.current_user_role()) = 'customer'::public.user_role
    OR (select private.is_admin());
$$;

GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated, anon, service_role;

-- Legacy policies still call public.* — thin wrappers (not exposed as RPC; revoke PUBLIC only).
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.current_user_role(); $$;

CREATE OR REPLACE FUNCTION public.current_vendor_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.current_vendor_id(); $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.is_admin(); $$;

CREATE OR REPLACE FUNCTION public.is_vendor()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.is_vendor(); $$;

CREATE OR REPLACE FUNCTION public.is_customer()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.is_customer(); $$;

CREATE OR REPLACE FUNCTION public.is_approved_vendor_id(vendor_uuid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.is_approved_vendor_id(vendor_uuid); $$;

CREATE OR REPLACE FUNCTION public.can_read_public_vendor_catalog()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO public, private
AS $$ SELECT private.can_read_public_vendor_catalog(); $$;

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
