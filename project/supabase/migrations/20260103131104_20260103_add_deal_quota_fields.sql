/*
  # Add Deal Quota System

  1. New Columns
    - `booking_quota_total` (integer) - Total number of bookings allowed
    - `booking_quota_remaining` (integer) - Remaining bookings available
    - `quota_enabled` (boolean) - Whether quota system is enabled
    - `expires_at` (timestamptz) - Optional expiry timestamp

  2. Changes
    - Backfill existing deals with default quotas
    - Add trigger to decrement quota on booking confirmation
    - Auto-disable offers when quota reaches 0

  3. Notes
    - Offers expire after 7 days or when quota reaches 0
    - Max 2 active offers per business enforced in application logic
*/

-- Add quota columns to deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'booking_quota_total'
  ) THEN
    ALTER TABLE deals ADD COLUMN booking_quota_total integer NOT NULL DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'booking_quota_remaining'
  ) THEN
    ALTER TABLE deals ADD COLUMN booking_quota_remaining integer NOT NULL DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'quota_enabled'
  ) THEN
    ALTER TABLE deals ADD COLUMN quota_enabled boolean NOT NULL DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN expires_at timestamptz NULL;
  END IF;
END $$;

-- Backfill existing deals with default quotas
UPDATE deals
SET
  booking_quota_total = 10,
  booking_quota_remaining = 10,
  quota_enabled = true
WHERE booking_quota_total IS NULL OR booking_quota_total = 0;

-- Function to decrement quota on booking confirmation
CREATE OR REPLACE FUNCTION public.apply_deal_quota_on_booking_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if status changed to 'confirmed' from something else
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status IS DISTINCT FROM 'confirmed') THEN
    -- Decrement quota (but not below 0) and disable offer if quota reaches 0
    UPDATE deals
    SET
      booking_quota_remaining = GREATEST(booking_quota_remaining - 1, 0),
      booking_enabled = CASE
        WHEN booking_quota_remaining - 1 <= 0 THEN false
        ELSE booking_enabled
      END,
      is_active = CASE
        WHEN booking_quota_remaining - 1 <= 0 THEN false
        ELSE is_active
      END
    WHERE id = NEW.deal_id AND quota_enabled = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_deal_quota_on_booking_confirm ON bookings;

CREATE TRIGGER trigger_deal_quota_on_booking_confirm
  AFTER UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_deal_quota_on_booking_confirm();

-- Add index for better performance on quota queries
CREATE INDEX IF NOT EXISTS idx_deals_quota_remaining
  ON deals(booking_quota_remaining)
  WHERE quota_enabled = true;

CREATE INDEX IF NOT EXISTS idx_deals_active_quota
  ON deals(business_id, is_active, booking_quota_remaining)
  WHERE quota_enabled = true;