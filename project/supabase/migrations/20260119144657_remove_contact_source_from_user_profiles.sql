/*
  # Remove Contact Source Field
  
  1. Changes
    - Remove `contact_source` field from `user_profiles` table
  
  2. Notes
    - This reverts the previous migration that added contact source tracking
*/

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'contact_source'
  ) THEN
    ALTER TABLE user_profiles DROP COLUMN contact_source;
  END IF;
END $$;