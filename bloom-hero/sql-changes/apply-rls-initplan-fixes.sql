-- Manual only. Run in Supabase SQL editor, then run apply-rls-consolidate-permissive-policies.sql.
-- Step 1 (this file): auth_rls_initplan — wraps auth.uid() in (select ...) on legacy policy names.
-- Step 2: apply-rls-consolidate-permissive-policies.sql — one permissive policy per action (OR merged).
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Helper used by public catalog policies
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

-- ─── Legacy policies (pre–vendor-access RLS names) ───────────────────────────

DROP POLICY IF EXISTS "Customers can create own orders" ON public.orders;
CREATE POLICY "Customers can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING ((select auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Customers can manage own order items" ON public.order_items;
CREATE POLICY "Customers can manage own order items"
  ON public.order_items
  USING (
    order_id IN (
      SELECT orders.id
      FROM public.orders
      WHERE orders.customer_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Customers can read own profile" ON public.customers;
CREATE POLICY "Customers can read own profile"
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (select public.is_admin())
  );

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (select public.is_admin())
  )
  WITH CHECK (
    (select auth.uid()) = user_id
    OR (select public.is_admin())
  );

DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.activity_logs;
CREATE POLICY "Admins can insert activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS activity_logs_select_admins ON public.activity_logs;
CREATE POLICY activity_logs_select_admins
  ON public.activity_logs FOR SELECT
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Vendors can insert product images for their products" ON public.product_images;
CREATE POLICY "Vendors can insert product images for their products"
  ON public.product_images FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update their product images" ON public.product_images;
CREATE POLICY "Vendors can update their product images"
  ON public.product_images FOR UPDATE
  USING (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can delete their product images" ON public.product_images;
CREATE POLICY "Vendors can delete their product images"
  ON public.product_images FOR DELETE
  USING (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can insert product categories for own products" ON public.product_categories;
CREATE POLICY "Vendors can insert product categories for own products"
  ON public.product_categories FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update product categories for own products" ON public.product_categories;
CREATE POLICY "Vendors can update product categories for own products"
  ON public.product_categories FOR UPDATE
  USING (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can delete product categories for own products" ON public.product_categories;
CREATE POLICY "Vendors can delete product categories for own products"
  ON public.product_categories FOR DELETE
  USING (
    product_id IN (
      SELECT products.id
      FROM public.products
      JOIN public.vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Popup vendors can insert their own gallery photos" ON public.popup_gallery_photos;
CREATE POLICY "Popup vendors can insert their own gallery photos"
  ON public.popup_gallery_photos FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT vendors.id FROM public.vendors
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Popup vendors can update their own gallery photos" ON public.popup_gallery_photos;
CREATE POLICY "Popup vendors can update their own gallery photos"
  ON public.popup_gallery_photos FOR UPDATE
  USING (
    vendor_id IN (
      SELECT vendors.id FROM public.vendors
      WHERE vendors.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT vendors.id FROM public.vendors
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Popup vendors can delete their own gallery photos" ON public.popup_gallery_photos;
CREATE POLICY "Popup vendors can delete their own gallery photos"
  ON public.popup_gallery_photos FOR DELETE
  USING (
    vendor_id IN (
      SELECT vendors.id FROM public.vendors
      WHERE vendors.owner_id = (select auth.uid())
    )
  );

-- Remaining initplan on vendor-access tables: run apply-rls-consolidate-permissive-policies.sql next.

DROP POLICY IF EXISTS customers_insert_own_role ON public.customers;
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

-- ─── Duplicate uniqueness on vendors.owner_id ────────────────────────────────
-- Constraint unique_vendor_owner and index vendors_owner_id_key both enforce
-- one row per owner_id. Keep vendors_owner_id_key; drop the extra constraint.

ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS unique_vendor_owner;
