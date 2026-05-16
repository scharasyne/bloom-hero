-- Manual only. Run once in Supabase SQL editor (idempotent).
-- Covers foreign keys flagged by Supabase linter (unindexed_foreign_keys).
-- Does not drop "unused" indexes — those are INFO-level and often unused in dev/staging only.

CREATE INDEX IF NOT EXISTS order_items_order_id_idx
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS order_items_product_id_idx
  ON public.order_items (product_id);

CREATE INDEX IF NOT EXISTS popup_location_requests_customer_id_idx
  ON public.popup_location_requests (customer_id);

CREATE INDEX IF NOT EXISTS popup_location_requests_vendor_id_idx
  ON public.popup_location_requests (vendor_id);

CREATE INDEX IF NOT EXISTS popup_locations_vendor_id_idx
  ON public.popup_locations (vendor_id);

CREATE INDEX IF NOT EXISTS products_category_id_idx
  ON public.products (category_id);

CREATE INDEX IF NOT EXISTS products_vendor_id_idx
  ON public.products (vendor_id);

CREATE INDEX IF NOT EXISTS reviews_customer_id_idx
  ON public.reviews (customer_id);

CREATE INDEX IF NOT EXISTS reviews_vendor_id_idx
  ON public.reviews (vendor_id);

CREATE INDEX IF NOT EXISTS vendor_applications_approved_vendor_user_id_idx
  ON public.vendor_applications (approved_vendor_user_id);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_owner_id_idx
  ON public.vendor_suspension_appeals (owner_id);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_reviewed_by_admin_id_idx
  ON public.vendor_suspension_appeals (reviewed_by_admin_id);

CREATE INDEX IF NOT EXISTS vendors_suspended_by_admin_id_idx
  ON public.vendors (suspended_by_admin_id);
