-- FIX: "permission denied for table orders" (often shown twice on home / search)
--
-- Root causes:
--   1. sql/04-database-hardening.sql (or apply-database-linter-fixes.sql) runs
--      REVOKE ALL ON orders/order_items FROM anon → Postgres denies the table
--      before RLS policies run (best-sellers joins order_items → orders).
--   2. orders_select only exposed completed rows via can_read_public_vendor_catalog(),
--      which excludes vendors — logged-in vendors on the home page still failed.
--
-- Run in Supabase SQL editor AFTER sql/01-rls-helpers.sql.
-- Safe to re-run (idempotent).

-- ─── 1. Table privileges (required for RLS to apply) ─────────────────────────

GRANT SELECT ON TABLE public.orders TO anon, authenticated;
GRANT SELECT ON TABLE public.order_items TO anon, authenticated;

-- ─── 2. Row policies ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS orders_select ON public.orders;
CREATE POLICY orders_select ON public.orders FOR SELECT
  USING (
    (select private.is_admin())
    OR customer_id = (select auth.uid())
    OR vendor_id = (select private.current_vendor_id())
    OR status = 'completed'::public.order_status
  );

DROP POLICY IF EXISTS order_items_select ON public.order_items;
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
