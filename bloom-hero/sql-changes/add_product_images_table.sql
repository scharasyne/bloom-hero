-- Add product_images table to store multiple images per product
-- Maintains backward compatibility with existing product_image_url field

CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  image_url text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX product_images_display_order_idx ON public.product_images(product_id, display_order);

-- RLS policies
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Allow vendors to insert their own product images
CREATE POLICY "Vendors can insert product images for their products"
  ON public.product_images
  FOR INSERT
  WITH CHECK (
    product_id IN (
      SELECT products.id FROM products
      JOIN vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = auth.uid()
    )
  );

-- Allow vendors to update their own product images
CREATE POLICY "Vendors can update their product images"
  ON public.product_images
  FOR UPDATE
  USING (
    product_id IN (
      SELECT products.id FROM products
      JOIN vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = auth.uid()
    )
  );

-- Allow vendors to delete their own product images
CREATE POLICY "Vendors can delete their product images"
  ON public.product_images
  FOR DELETE
  USING (
    product_id IN (
      SELECT products.id FROM products
      JOIN vendors ON products.vendor_id = vendors.id
      WHERE vendors.owner_id = auth.uid()
    )
  );

-- Allow public read access (anyone can view product images)
CREATE POLICY "Anyone can view product images"
  ON public.product_images
  FOR SELECT
  USING (true);
