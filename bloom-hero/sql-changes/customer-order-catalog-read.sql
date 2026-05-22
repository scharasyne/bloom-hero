-- Allow customers to read vendor + product rows tied to their own orders
-- (e.g. pop-up / pending-approval vendors not in the public catalog).

DROP POLICY IF EXISTS vendors_select ON public.vendors;
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

DROP POLICY IF EXISTS products_select ON public.products;
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
