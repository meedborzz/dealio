/*
  # Add foreign key relationship between businesses and user_profiles

  1. Database Changes
    - Add foreign key constraint on businesses.owner_id -> user_profiles.id
    - Name the constraint 'businesses_owner_id_fkey' to match query expectations
  
  2. Security
    - Maintains existing RLS policies
    - No changes to permissions
*/

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'businesses_owner_id_fkey' 
    AND table_name = 'businesses'
  ) THEN
    ALTER TABLE businesses 
    ADD CONSTRAINT businesses_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;