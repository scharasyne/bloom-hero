-- Vendor suspension appeals. Run in Supabase SQL editor after review.

CREATE TABLE IF NOT EXISTS public.vendor_suspension_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appeal_message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_response text,
  reviewed_by_admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT vendor_suspension_appeals_status_check
    CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  CONSTRAINT vendor_suspension_appeals_message_check
    CHECK (char_length(trim(appeal_message)) >= 10)
);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_vendor_id_idx
  ON public.vendor_suspension_appeals (vendor_id);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_owner_id_idx
  ON public.vendor_suspension_appeals (owner_id);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_reviewed_by_admin_id_idx
  ON public.vendor_suspension_appeals (reviewed_by_admin_id);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_status_idx
  ON public.vendor_suspension_appeals (status);

CREATE INDEX IF NOT EXISTS vendor_suspension_appeals_created_at_idx
  ON public.vendor_suspension_appeals (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS vendor_suspension_appeals_one_pending_per_vendor_idx
  ON public.vendor_suspension_appeals (vendor_id)
  WHERE status = 'pending';

ALTER TABLE public.vendor_suspension_appeals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS vendor_suspension_appeals_select_own ON public.vendor_suspension_appeals;
DROP POLICY IF EXISTS "vendor_suspension_appeals_select_own" ON public.vendor_suspension_appeals;
CREATE POLICY vendor_suspension_appeals_select_own
  ON public.vendor_suspension_appeals FOR SELECT
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS vendor_suspension_appeals_insert_own ON public.vendor_suspension_appeals;
DROP POLICY IF EXISTS "vendor_suspension_appeals_insert_own" ON public.vendor_suspension_appeals;
CREATE POLICY vendor_suspension_appeals_insert_own
  ON public.vendor_suspension_appeals FOR INSERT
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS vendor_suspension_appeals_select_admin ON public.vendor_suspension_appeals;
CREATE POLICY vendor_suspension_appeals_select_admin
  ON public.vendor_suspension_appeals FOR SELECT
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS vendor_suspension_appeals_update_admin ON public.vendor_suspension_appeals;
CREATE POLICY vendor_suspension_appeals_update_admin
  ON public.vendor_suspension_appeals FOR UPDATE
  USING ((select public.is_admin()));
