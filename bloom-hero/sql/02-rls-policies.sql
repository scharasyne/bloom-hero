-- Bloom Hero — sql/02-rls-policies.sql
-- Run after 01-rls-helpers.sql. Idempotent.
--
-- One permissive RLS policy per action (vendor/customer/admin/catalog rules).
-- Clears linter: multiple_permissive_policies, auth_rls_initplan (uses (select ...) helpers).

-- RLS must be ON for policies to take effect (advisor: "Policy Exists RLS Disabled").
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_location_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_suspension_appeals ENABLE ROW LEVEL SECURITY;

-- ─── orders ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Customers can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS orders_all_admin ON public.orders;
DROP POLICY IF EXISTS orders_select_vendor ON public.orders;
DROP POLICY IF EXISTS orders_update_vendor ON public.orders;

CREATE POLICY orders_select ON public.orders FOR SELECT
  USING (
    (select private.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select private.current_vendor_id())
    OR status = 'completed'::public.order_status
  );

CREATE POLICY orders_insert ON public.orders FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR customer_id = (select auth.uid())
  );

CREATE POLICY orders_update ON public.orders FOR UPDATE
  USING (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  )
  WITH CHECK (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  );

-- ─── order_items ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Customers can manage own order items" ON public.order_items;
DROP POLICY IF EXISTS order_items_all_admin ON public.order_items;
DROP POLICY IF EXISTS order_items_select_vendor ON public.order_items;

CREATE POLICY order_items_select ON public.order_items FOR SELECT
  USING (
    (select private.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
    OR order_id IN (
      SELECT o.id FROM public.orders o
      WHERE o.vendor_id = (select private.current_vendor_id())
    )
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
        AND o.status = 'completed'::public.order_status
    )
  );

CREATE POLICY order_items_insert ON public.order_items FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

CREATE POLICY order_items_update ON public.order_items FOR UPDATE
  USING (
    (select private.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  )
  WITH CHECK (
    (select private.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

CREATE POLICY order_items_delete ON public.order_items FOR DELETE
  USING (
    (select private.is_admin())
    OR order_id IN (
      SELECT orders.id FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

-- ─── users ───────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS users_select_admin ON public.users;
DROP POLICY IF EXISTS users_select_public_reviewers ON public.users;
DROP POLICY IF EXISTS users_select_vendor_reviewers ON public.users;
DROP POLICY IF EXISTS users_update_own ON public.users;
DROP POLICY IF EXISTS users_all_admin ON public.users;

CREATE POLICY users_select ON public.users FOR SELECT
  USING (
    (select private.is_admin())
    OR id = (select auth.uid())
    OR (
      (select private.can_read_public_vendor_catalog())
      AND id IN (
        SELECT r.customer_id FROM public.reviews r WHERE r.status = 'approved'
      )
    )
    OR (
      (select private.is_vendor())
      AND id IN (
        SELECT r.customer_id FROM public.reviews r
        WHERE r.vendor_id = (select private.current_vendor_id())
      )
    )
  );

CREATE POLICY users_update ON public.users FOR UPDATE
  USING (
    (select private.is_admin())
    OR id = (select auth.uid())
  )
  WITH CHECK (
    (select private.is_admin())
    OR id = (select auth.uid())
  );

-- ─── vendors ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS vendors_select_admin ON public.vendors;
DROP POLICY IF EXISTS vendors_select_own ON public.vendors;
DROP POLICY IF EXISTS vendors_select_public_catalog ON public.vendors;
DROP POLICY IF EXISTS vendors_insert_own ON public.vendors;
DROP POLICY IF EXISTS vendors_update_own ON public.vendors;
DROP POLICY IF EXISTS vendors_all_admin ON public.vendors;

CREATE POLICY vendors_select ON public.vendors FOR SELECT
  USING (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
    OR (
      (select private.can_read_public_vendor_catalog())
      AND status = 'approved'::public.vendor_status
    )
    OR EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.vendor_id = vendors.id
        AND o.customer_id = (select auth.uid())
    )
  );

CREATE POLICY vendors_insert ON public.vendors FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendors_update ON public.vendors FOR UPDATE
  USING (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  )
  WITH CHECK (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );

-- ─── products ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS products_select_admin ON public.products;
DROP POLICY IF EXISTS products_select_own_vendor ON public.products;
DROP POLICY IF EXISTS products_select_public_catalog ON public.products;

CREATE POLICY products_select ON public.products FOR SELECT
  USING (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
    OR (
      (select private.can_read_public_vendor_catalog())
      AND (select private.is_approved_vendor_id(vendor_id))
    )
    OR EXISTS (
      SELECT 1
      FROM public.order_items oi
      INNER JOIN public.orders o ON o.id = oi.order_id
      WHERE oi.product_id = products.id
        AND o.customer_id = (select auth.uid())
    )
  );

-- ─── reviews ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS reviews_select_admin ON public.reviews;
DROP POLICY IF EXISTS reviews_select_own_customer ON public.reviews;
DROP POLICY IF EXISTS reviews_select_own_vendor ON public.reviews;
DROP POLICY IF EXISTS reviews_select_public_approved ON public.reviews;

CREATE POLICY reviews_select ON public.reviews FOR SELECT
  USING (
    (select private.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select private.current_vendor_id())
    OR (
      (select private.can_read_public_vendor_catalog())
      AND status = 'approved'
      AND (select private.is_approved_vendor_id(vendor_id))
    )
  );

-- ─── popup_locations ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS popup_locations_select_public ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_select_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_insert_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_update_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_delete_own_vendor ON public.popup_locations;
DROP POLICY IF EXISTS popup_locations_all_admin ON public.popup_locations;

CREATE POLICY popup_locations_select ON public.popup_locations FOR SELECT
  USING (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
    OR (
      (select private.can_read_public_vendor_catalog())
      AND (select private.is_approved_vendor_id(vendor_id))
    )
  );

CREATE POLICY popup_locations_insert ON public.popup_locations FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  );

CREATE POLICY popup_locations_update ON public.popup_locations FOR UPDATE
  USING (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  )
  WITH CHECK (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  );

CREATE POLICY popup_locations_delete ON public.popup_locations FOR DELETE
  USING (
    (select private.is_admin())
    OR vendor_id = (select private.current_vendor_id())
  );

-- ─── popup_location_requests ─────────────────────────────────────────────────

DROP POLICY IF EXISTS popup_location_requests_insert_customer ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_select_customer ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_select_vendor ON public.popup_location_requests;
DROP POLICY IF EXISTS popup_location_requests_all_admin ON public.popup_location_requests;

CREATE POLICY popup_location_requests_insert ON public.popup_location_requests FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR (
      (select private.is_customer())
      AND customer_id = (select auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.customers c
        WHERE c.user_id = (select auth.uid())
      )
      AND (select private.is_approved_vendor_id(vendor_id))
    )
  );

CREATE POLICY popup_location_requests_select ON public.popup_location_requests FOR SELECT
  USING (
    (select private.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select private.current_vendor_id())
  );

-- ─── vendor_applications ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS vendor_applications_select_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_insert_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_update_own ON public.vendor_applications;
DROP POLICY IF EXISTS vendor_applications_all_admin ON public.vendor_applications;

CREATE POLICY vendor_applications_select ON public.vendor_applications FOR SELECT
  USING (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendor_applications_insert ON public.vendor_applications FOR INSERT
  WITH CHECK (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );

CREATE POLICY vendor_applications_update ON public.vendor_applications FOR UPDATE
  USING (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  )
  WITH CHECK (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );

-- ─── vendor_suspension_appeals ───────────────────────────────────────────────

DROP POLICY IF EXISTS vendor_suspension_appeals_select_own ON public.vendor_suspension_appeals;
DROP POLICY IF EXISTS "vendor_suspension_appeals_select_own" ON public.vendor_suspension_appeals;
DROP POLICY IF EXISTS vendor_suspension_appeals_select_admin ON public.vendor_suspension_appeals;
DROP POLICY IF EXISTS "vendor_suspension_appeals_select_admin" ON public.vendor_suspension_appeals;

CREATE POLICY vendor_suspension_appeals_select ON public.vendor_suspension_appeals FOR SELECT
  USING (
    (select private.is_admin())
    OR owner_id = (select auth.uid())
  );
