/*
  # Security tightening and cleanup

  1. Security Changes
    - Remove overly permissive QR code policy for system functions
    - Tighten QR code access to only booking owners and business owners
  
  2. Data Cleanup
    - Remove duplicate business records if any exist
    - Clean up orphaned data
*/

-- Remove overly permissive QR code policy
DROP POLICY IF EXISTS "System functions can insert QR codes" ON qr_codes;

-- Ensure QR codes can only be accessed by booking owners or business owners
CREATE POLICY "QR codes restricted access" ON qr_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN deals d ON b.deal_id = d.id
      JOIN businesses bus ON d.business_id = bus.id
      WHERE b.id = qr_codes.booking_id
      AND (b.user_id = auth.uid() OR bus.owner_id = auth.uid())
    )
  );

-- Clean up any duplicate business records (keep the most recent one for each owner)
WITH duplicates AS (
  SELECT id, 
         ROW_NUMBER() OVER (PARTITION BY owner_id, name ORDER BY created_at DESC) as rn
  FROM businesses
  WHERE owner_id IS NOT NULL
)
DELETE FROM businesses 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Ensure all QR codes have proper expiry dates
UPDATE qr_codes 
SET expires_at = (
  SELECT b.booking_date + INTERVAL '24 hours'
  FROM bookings b 
  WHERE b.id = qr_codes.booking_id
)
WHERE expires_at IS NULL;