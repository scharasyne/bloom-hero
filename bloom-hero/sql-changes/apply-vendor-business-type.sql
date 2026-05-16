-- Manual only. Run in the local Supabase SQL editor.
-- Do not place this file under supabase/migrations.
-- Target model: public.business_type = registered | unregistered.

BEGIN;

DO $$
BEGIN
  CREATE TYPE public.business_type AS ENUM ('registered', 'unregistered');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS business_type public.business_type;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'vendors'
      AND column_name = 'vendor_type'
  ) THEN
    UPDATE public.vendors
    SET business_type = CASE
      WHEN vendor_type::text IN ('market', 'handcrafted') THEN 'registered'::public.business_type
      ELSE 'unregistered'::public.business_type
    END
    WHERE business_type IS NULL;

    ALTER TABLE public.vendors DROP COLUMN vendor_type;
  END IF;
END
$$;

ALTER TABLE public.vendors
  ALTER COLUMN business_type SET NOT NULL;

ALTER TABLE public.vendor_applications
  ADD COLUMN IF NOT EXISTS business_type public.business_type;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'vendor_applications'
      AND column_name = 'vendor_type'
  ) THEN
    UPDATE public.vendor_applications
    SET business_type = CASE
      WHEN vendor_type::text IN ('market', 'handcrafted') THEN 'registered'::public.business_type
      ELSE 'unregistered'::public.business_type
    END
    WHERE business_type IS NULL
      AND vendor_type IS NOT NULL;

    ALTER TABLE public.vendor_applications DROP COLUMN vendor_type;
  END IF;
END
$$;

DROP TYPE IF EXISTS public.vendor_type;

CREATE UNIQUE INDEX IF NOT EXISTS vendors_owner_id_key ON public.vendors (owner_id);

COMMIT;
