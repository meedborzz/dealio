/*
  # Allow Anonymous Users to View Businesses

  1. Changes
    - Add RLS policy to allow anonymous users to view businesses
    - This is needed for guest booking pages to display business information
    
  2. Security
    - Businesses are public information displayed on the platform
    - Only SELECT access is granted
    - No sensitive data is exposed (passwords, private keys, etc.)
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'businesses' 
    AND policyname = 'Anyone can view businesses'
  ) THEN
    CREATE POLICY "Anyone can view businesses"
      ON businesses
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
