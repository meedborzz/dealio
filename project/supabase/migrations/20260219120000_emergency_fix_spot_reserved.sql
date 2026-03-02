/*
  # Emergency Fix: Restore spot_reserved column
  
  This migration restores the spot_reserved column to fix a "record old has no field spot_reserved" error
  caused by a lingering trigger.
*/

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS spot_reserved boolean DEFAULT false;

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS validated_at timestamptz;
