-- Pop-up visibility toggle for registered vendors (unregistered vendors are pop-up-only).

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS holds_popups boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.vendors.holds_popups IS
  'When true, vendor appears in pop-up search/map and accepts location requests. Always true for unregistered vendors.';

-- Pop-up-only vendors always hold pop-ups.
UPDATE public.vendors
SET holds_popups = true
WHERE business_type = 'unregistered'::public.business_type;
