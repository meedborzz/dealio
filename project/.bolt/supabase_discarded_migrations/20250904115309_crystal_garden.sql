/*
  # Security tightening and cleanup

  1. Security
    - Remove overly permissive QR code policy
    - Ensure proper business ownership validation
  
  2. Cleanup
    - Remove duplicate/unused functions
    - Clean any duplicate business records
*/

-- Remove overly permissive QR code policy since SECURITY DEFINER functions handle inserts
DROP POLICY IF EXISTS "System functions can insert QR codes" ON qr_codes;

-- Clean up any duplicate business records (keep only the first one per owner)
DELETE FROM businesses 
WHERE id NOT IN (
  SELECT DISTINCT ON (owner_id) id 
  FROM businesses 
  ORDER BY owner_id, created_at ASC
);

-- Ensure businesses.owner_id is unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'businesses_owner_id_unique' 
    AND table_name = 'businesses'
  ) THEN
    ALTER TABLE businesses ADD CONSTRAINT businesses_owner_id_unique UNIQUE (owner_id);
  END IF;
END $$;

-- Drop any old/duplicate confirmation functions
DROP FUNCTION IF EXISTS public.confirm_booking(uuid, timestamptz);
DROP FUNCTION IF EXISTS public.generate_qr_code_for_booking();

-- Ensure we have the loyalty points trigger
CREATE OR REPLACE FUNCTION update_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Award loyalty points when booking is completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE user_profiles 
    SET 
      loyalty_points = loyalty_points + FLOOR(NEW.total_price / 10),
      completed_bookings_count = completed_bookings_count + 1
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS trigger_update_loyalty_points ON bookings;
CREATE TRIGGER trigger_update_loyalty_points
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_loyalty_points();