-- Manual only. EMERGENCY — run in Supabase SQL editor when you see:
--   permission denied for function is_admin
--
-- Safe to re-run. Restores RLS helper EXECUTE for anon + authenticated.

CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO postgres, authenticated, anon, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated, anon, service_role;

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
