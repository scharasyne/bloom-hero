-- Add coordinate columns for map pins on popup schedules.
ALTER TABLE public.popup_locations
  ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
  ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);

-- Keep coordinates valid for standard lat/lng ranges.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'popup_locations_latitude_range_check'
  ) THEN
    ALTER TABLE public.popup_locations
      ADD CONSTRAINT popup_locations_latitude_range_check
      CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'popup_locations_longitude_range_check'
  ) THEN
    ALTER TABLE public.popup_locations
      ADD CONSTRAINT popup_locations_longitude_range_check
      CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));
  END IF;
END $$;

-- Backfill ALL existing popup schedules for vendor "puppy" -> Ayala Central Bloc.
UPDATE public.popup_locations AS pl
SET
  location = 'Ayala Central Bloc, Cebu IT Park',
  latitude = 10.32970000,
  longitude = 123.90660000
FROM public.vendors AS v
WHERE pl.vendor_id = v.id
  AND regexp_replace(lower(coalesce(v.shop_name, '')), '[^a-z0-9]', '', 'g') = 'puppy';

-- Backfill ALL existing popup schedules for vendor "zarah''s flowers" -> Fuente Osmena Circle.
UPDATE public.popup_locations AS pl
SET
  location = 'Fuente Osmena Circle, Cebu City',
  latitude = 10.31050000,
  longitude = 123.89450000
FROM public.vendors AS v
WHERE pl.vendor_id = v.id
  AND regexp_replace(lower(coalesce(v.shop_name, '')), '[^a-z0-9]', '', 'g') = 'zarahsflowers';

-- If popup_locations is empty for these vendors, create one default schedule row each.
-- This makes the map immediately show pins after migration runs.
INSERT INTO public.popup_locations (
  vendor_id,
  location,
  scheduled_date,
  start_time,
  end_time,
  latitude,
  longitude
)
SELECT
  v.id,
  'Ayala Central Bloc, Cebu IT Park',
  CURRENT_DATE,
  date_trunc('day', now()) + INTERVAL '9 hours',
  date_trunc('day', now()) + INTERVAL '18 hours',
  10.32970000,
  123.90660000
FROM public.vendors AS v
WHERE regexp_replace(lower(coalesce(v.shop_name, '')), '[^a-z0-9]', '', 'g') = 'puppy'
  AND NOT EXISTS (
    SELECT 1
    FROM public.popup_locations AS pl
    WHERE pl.vendor_id = v.id
  );

INSERT INTO public.popup_locations (
  vendor_id,
  location,
  scheduled_date,
  start_time,
  end_time,
  latitude,
  longitude
)
SELECT
  v.id,
  'Fuente Osmena Circle, Cebu City',
  CURRENT_DATE,
  date_trunc('day', now()) + INTERVAL '9 hours',
  date_trunc('day', now()) + INTERVAL '18 hours',
  10.31050000,
  123.89450000
FROM public.vendors AS v
WHERE regexp_replace(lower(coalesce(v.shop_name, '')), '[^a-z0-9]', '', 'g') = 'zarahsflowers'
  AND NOT EXISTS (
    SELECT 1
    FROM public.popup_locations AS pl
    WHERE pl.vendor_id = v.id
  );
