-- Vendor vs customer access. Run in Supabase SQL editor after review.
-- Enables RLS on tables that had policies but no RLS, and locks down catalog / location requests.

CREATE OR REPLACE FUNCTION public.is_customer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT public.current_user_role() = 'customer'::public.user_role;
$$;

CREATE OR REPLACE FUNCTION public.is_approved_vendor_id(vendor_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.vendors v
    WHERE v.id = vendor_uuid
      AND v.status = 'approved'::public.vendor_status
  );
$$;

-- Public catalog: anon + customers only (not vendors browsing as customers).
CREATE OR REPLACE FUNCTION public.can_read_public_vendor_catalog()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $$
  SELECT (select auth.uid()) IS NULL
    OR (select public.current_user_role()) = 'customer'::public.user_role
    OR (select public.is_admin());
$$;

-- ─── users ───────────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_select_admin ON public.users;
DROP POLICY IF EXISTS users_select_public_reviewers ON public.users;
DROP POLICY IF EXISTS users_select_vendor_reviewers ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_all_admin ON public.users;

CREATE POLICY users_select ON public.users FOR SELECT
  USING (
    (select public.is_admin())
    OR id = (select auth.uid())
    OR (
      (select public.can_read_public_vendor_catalog())
      AND id IN (
        SELECT r.customer_id FROM public.reviews r WHERE r.status = 'approved'
      )
    )
    OR (
      (select public.is_vendor())
      AND id IN (
        SELECT r.customer_id FROM public.reviews r
        WHERE r.vendor_id = (select public.current_vendor_id())
      )
    )
  );

CREATE POLICY users_update ON public.users FOR UPDATE
  USING (
    (select public.is_admin())
    OR id = (select auth.uid())
  )
  WITH CHECK (
    (select public.is_admin())
    OR id = (select auth.uid())
  );

-- ─── customers (tighten insert: customers only) ─────────────────────────────

DROP POLICY IF EXISTS "Customers can insert own profile" ON public.customers;
CREATE POLICY customers_insert_own_role
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    AND (
      (select public.is_customer())
      OR (select public.is_admin())
    )
  );

-- ─── vendors ─────────────────────────────────────────────────────────────────

ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendors_select_admin ON public.vendors;
DROP POLICY IF EXISTS vendors_select_own ON public.vendors;
DROP POLICY IF EXISTS vendors_select_public_catalog ON public.vendors;
DROP POLICY IF EXISTS vendors_insert_own ON public.vendors;
DROP POLICY IF EXISTS vendors_update_own ON public.vendors;
DROP POLICY IF EXISTS vendors_all_admin ON public.vendors;

CREATE POLICY vendors_select ON public.vendors FOR SELECT
  USING (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
    OR (
      (select public.can_read_public_vendor_catalog())
      AND status = 'approved'::public.vendor_status
    )
  );

CREATE POLICY vendors_insert ON public.vendors FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendors_update ON public.vendors FOR UPDATE
  USING (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  )
  WITH CHECK (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  );

-- ─── products ────────────────────────────────────────────────────────────────

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_admin ON public.products;
DROP POLICY IF EXISTS products_select_own_vendor ON public.products;
DROP POLICY IF EXISTS products_select_public_catalog ON public.products;

CREATE POLICY products_select ON public.products FOR SELECT
  USING (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
    OR (
      (select public.can_read_public_vendor_catalog())
      AND (select public.is_approved_vendor_id(vendor_id))
    )
  );

DROP POLICY IF EXISTS products_insert_own_vendor ON public.products;
CREATE POLICY products_insert_own_vendor
  ON public.products FOR INSERT
  WITH CHECK (vendor_id = (select public.current_vendor_id()));

DROP POLICY IF EXISTS products_update_own_vendor ON public.products;
CREATE POLICY products_update_own_vendor
  ON public.products FOR UPDATE
  USING (vendor_id = (select public.current_vendor_id()))
  WITH CHECK (vendor_id = (select public.current_vendor_id()));

DROP POLICY IF EXISTS products_delete_own_vendor ON public.products;
CREATE POLICY products_delete_own_vendor
  ON public.products FOR DELETE
  USING (vendor_id = (select public.current_vendor_id()));

-- ─── reviews ─────────────────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reviews_select_admin ON public.reviews;
DROP POLICY IF EXISTS reviews_select_own_customer ON public.reviews;
DROP POLICY IF EXISTS reviews_select_own_vendor ON public.reviews;
DROP POLICY IF EXISTS reviews_select_public_approved ON public.reviews;

CREATE POLICY reviews_select ON public.reviews FOR SELECT
  USING (
    (select public.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select public.current_vendor_id())
    OR (
      (select public.can_read_public_vendor_catalog())
      AND status = 'approved'
      AND (select public.is_approved_vendor_id(vendor_id))
    )
  );

DROP POLICY IF EXISTS reviews_insert_customer ON public.reviews;
CREATE POLICY reviews_insert_customer
  ON public.reviews FOR INSERT
  WITH CHECK (
    (select public.is_customer())
    AND customer_id = (select auth.uid())
  );

DROP POLICY IF EXISTS reviews_update_admin ON public.reviews;
CREATE POLICY reviews_update_admin
  ON public.reviews FOR UPDATE
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- ─── orders / order_items (policies existed but RLS was off) ─────────────────

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS orders_select_vendor ON public.orders;
DROP POLICY IF EXISTS orders_update_vendor ON public.orders;
DROP POLICY IF EXISTS orders_all_admin ON public.orders;

CREATE POLICY orders_select ON public.orders FOR SELECT
  USING (
    (select public.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select public.current_vendor_id())
  );

CREATE POLICY orders_insert ON public.orders FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR customer_id = (select auth.uid())
  );

CREATE POLICY orders_update ON public.orders FOR UPDATE
  USING (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  )
  WITH CHECK (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  );

DROP POLICY IF EXISTS "Customers can manage own order items" ON public.order_items;
DROP POLICY IF EXISTS order_items_select_vendor ON public.order_items;
DROP POLICY IF EXISTS order_items_all_admin ON public.order_items;

CREATE POLICY order_items_select ON public.order_items FOR SELECT
  USING (
    (select public.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
    OR order_id IN (
      SELECT o.id FROM public.orders o
      WHERE o.vendor_id = (select public.current_vendor_id())
    )
  );

CREATE POLICY order_items_insert ON public.order_items FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

CREATE POLICY order_items_update ON public.order_items FOR UPDATE
  USING (
    (select public.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    (select public.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

CREATE POLICY order_items_delete ON public.order_items FOR DELETE
  USING (
    (select public.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

-- ─── popup_locations ─────────────────────────────────────────────────────────

ALTER TABLE public.popup_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS popup_locations_select_public ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_select_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_insert_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_update_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_delete_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_all_admin ON public.popup_locations;

CREATE POLICY popup_locations_select ON public.popup_locations FOR SELECT
  USING (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
    OR (
      (select public.can_read_public_vendor_catalog())
      AND (select public.is_approved_vendor_id(vendor_id))
    )
  );

CREATE POLICY popup_locations_insert ON public.popup_locations FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  );

CREATE POLICY popup_locations_update ON public.popup_locations FOR UPDATE
  USING (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  )
  WITH CHECK (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  );

CREATE POLICY popup_locations_delete ON public.popup_locations FOR DELETE
  USING (
    (select public.is_admin())
    OR vendor_id = (select public.current_vendor_id())
  );

-- ─── popup_location_requests ─────────────────────────────────────────────────

ALTER TABLE public.popup_location_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS popup_location_requests_insert_customer ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_select_customer ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_select_vendor ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_all_admin ON public.popup_location_requests;

CREATE POLICY popup_location_requests_insert ON public.popup_location_requests FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR (
      (select public.is_customer())
      AND customer_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.user_id = (select auth.uid())
      )
      AND (select public.is_approved_vendor_id(vendor_id))
    )
  );

CREATE POLICY popup_location_requests_select ON public.popup_location_requests FOR SELECT
  USING (
    (select public.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select public.current_vendor_id())
  );

-- ─── vendor_applications ─────────────────────────────────────────────────────

ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendor_applications_select_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_insert_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_update_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_all_admin ON public.vendor_applications;

CREATE POLICY vendor_applications_select ON public.vendor_applications FOR SELECT
  USING (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendor_applications_insert ON public.vendor_applications FOR INSERT
  WITH CHECK (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendor_applications_update ON public.vendor_applications FOR UPDATE
  USING (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  )
  WITH CHECK (
    (select public.is_admin())
    OR owner_id = (select auth.uid())
  );
