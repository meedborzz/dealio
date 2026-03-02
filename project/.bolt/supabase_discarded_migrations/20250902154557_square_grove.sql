/*
  # Add Business Constraints

  1. Constraints Added
    - One business per owner (unique constraint)
    - Performance indexes for common queries

  2. Security
    - Ensures data integrity
    - Prevents multiple businesses per owner
*/

-- Ensure one business per owner
ALTER TABLE businesses
  ADD CONSTRAINT unique_business_per_owner UNIQUE (owner_id);

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_deals_active_window ON deals(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_deals_business ON deals(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_business_date ON bookings(deal_id, booking_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_uniq ON favorites(user_id, deal_id);