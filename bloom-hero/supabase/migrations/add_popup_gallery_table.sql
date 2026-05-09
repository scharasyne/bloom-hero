-- Store popup vendor gallery photos with editable caption metadata.

CREATE TABLE public.popup_gallery_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL,
  image_url text NOT NULL,
  caption text NOT NULL,
  location text,
  event_name text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT popup_gallery_photos_pkey PRIMARY KEY (id),
  CONSTRAINT popup_gallery_photos_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE CASCADE
);

CREATE INDEX popup_gallery_photos_vendor_id_idx ON public.popup_gallery_photos(vendor_id);
CREATE INDEX popup_gallery_photos_vendor_order_idx ON public.popup_gallery_photos(vendor_id, display_order, created_at);

ALTER TABLE public.popup_gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popup gallery photos"
  ON public.popup_gallery_photos
  FOR SELECT
  USING (true);

CREATE POLICY "Popup vendors can insert their own gallery photos"
  ON public.popup_gallery_photos
  FOR INSERT
  WITH CHECK (
    vendor_id IN (
      SELECT id
      FROM public.vendors
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Popup vendors can update their own gallery photos"
  ON public.popup_gallery_photos
  FOR UPDATE
  USING (
    vendor_id IN (
      SELECT id
      FROM public.vendors
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    vendor_id IN (
      SELECT id
      FROM public.vendors
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Popup vendors can delete their own gallery photos"
  ON public.popup_gallery_photos
  FOR DELETE
  USING (
    vendor_id IN (
      SELECT id
      FROM public.vendors
      WHERE owner_id = auth.uid()
    )
  );