/*
  # Create Storage Buckets for Images

  1. Storage Buckets
    - `deal-images` - Stores offer/deal images uploaded by businesses
    - `review-photos` - Stores photos uploaded in reviews

  2. Security
    - Enable RLS on storage buckets
    - Allow authenticated users to upload to their business folders
    - Allow public read access to all images
*/

-- Create deal-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'deal-images',
  'deal-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create review-photos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'review-photos',
  'review-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to upload deal images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update own deal images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete own deal images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public to read deal images" ON storage.objects;
  DROP POLICY IF EXISTS "Allow authenticated users to upload review photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update own review photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete own review photos" ON storage.objects;
  DROP POLICY IF EXISTS "Allow public to read review photos" ON storage.objects;
END $$;

-- Policy: Allow authenticated users to upload deal images
CREATE POLICY "Allow authenticated users to upload deal images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'deal-images');

-- Policy: Allow users to update their own deal images
CREATE POLICY "Allow users to update own deal images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'deal-images');

-- Policy: Allow users to delete their own deal images
CREATE POLICY "Allow users to delete own deal images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'deal-images');

-- Policy: Allow public to read deal images
CREATE POLICY "Allow public to read deal images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'deal-images');

-- Policy: Allow authenticated users to upload review photos
CREATE POLICY "Allow authenticated users to upload review photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'review-photos');

-- Policy: Allow users to update their own review photos
CREATE POLICY "Allow users to update own review photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'review-photos');

-- Policy: Allow users to delete their own review photos
CREATE POLICY "Allow users to delete own review photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'review-photos');

-- Policy: Allow public to read review photos
CREATE POLICY "Allow public to read review photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'review-photos');