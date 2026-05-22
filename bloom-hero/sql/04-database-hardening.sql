-- Bloom Hero — sql/04-database-hardening.sql
-- Run after 01–02. Pins search_path on triggers; revokes anon on sensitive tables.
-- Keeps GRANT EXECUTE on public RLS wrappers (required for login). See sql/README.md.
--
-- Addresses Supabase database linter warnings:
--   0011 function_search_path_mutable
--   0028/0029 security definer functions callable via RPC
--   0026 pg_graphql_anon_table_exposed (sensitive tables only; catalog tables need anon REST)
--   For remaining 0026/0027 on catalog tables, run apply-disable-pg-graphql.sql
--
-- Catalog tables (products, vendors, reviews, etc.) keep anon SELECT for guest
-- browsing with RLS. GraphQL may still list those; data stays protected by RLS.
-- Bloom Hero uses the REST API, not client-side GraphQL RPC for helpers.

-- ─── 1. Pin search_path on trigger / helper functions ───────────────────────

CREATE OR REPLACE FUNCTION public.enforce_product_category_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
DECLARE
  category_count integer;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT COUNT(*)
    INTO category_count
    FROM public.product_categories
    WHERE product_id = NEW.product_id;

    IF category_count >= 3 THEN
      RAISE EXCEPTION 'A product can have at most 3 categories.';
    END IF;
  ELSIF TG_OP = 'UPDATE' AND NEW.product_id <> OLD.product_id THEN
    SELECT COUNT(*)
    INTO category_count
    FROM public.product_categories
    WHERE product_id = NEW.product_id;

    IF category_count >= 3 THEN
      RAISE EXCEPTION 'A product can have at most 3 categories.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_customer_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_vendor_applications_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── 2. RLS helpers: do NOT revoke from anon/authenticated here ───────────────
-- Policies call is_admin() for guests and signed-in users. Revoking EXECUTE breaks
-- the app (login, map, catalog). For linter 0029 use apply-rls-helpers-private-schema.sql.
-- Emergency restore: apply-rls-helper-execute-grants.sql

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

-- Triggers only (not used in RLS): revoke from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_product_category_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_customer_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_order_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_vendor_applications_updated_at() FROM PUBLIC, anon, authenticated;

-- ─── 3. Sensitive tables: block anon REST where the app never needs guest access ─
-- orders / order_items: keep SELECT on anon + authenticated so RLS can gate rows
-- (home best-sellers joins order_items → orders for completed sold counts).

REVOKE ALL ON TABLE public.activity_logs FROM anon;
REVOKE ALL ON TABLE public.customers FROM anon;
REVOKE ALL ON TABLE public.popup_location_requests FROM anon;
REVOKE ALL ON TABLE public.vendor_applications FROM anon;
REVOKE ALL ON TABLE public.vendor_suspension_appeals FROM anon;

GRANT SELECT ON TABLE public.orders TO anon, authenticated;
GRANT SELECT ON TABLE public.order_items TO anon, authenticated;
