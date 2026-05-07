-- Shared profile photo bucket for all users.
-- Path convention: <auth.uid()>/<filename>

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
CREATE POLICY "Users can update own profile photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'profile-photos'
    AND auth.uid() IS NOT NULL
    AND owner = auth.uid()
  );
