-- Create the popup gallery storage bucket used by vendor uploads.

INSERT INTO storage.buckets (id, name, public)
VALUES ('popup-gallery-images', 'popup-gallery-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view popup gallery images" ON storage.objects;
CREATE POLICY "Anyone can view popup gallery images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'popup-gallery-images');

DROP POLICY IF EXISTS "Authenticated users can upload popup gallery images" ON storage.objects;
CREATE POLICY "Authenticated users can upload popup gallery images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'popup-gallery-images' AND auth.uid() IS NOT NULL);