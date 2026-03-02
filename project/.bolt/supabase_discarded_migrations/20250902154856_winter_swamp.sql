/*
  # Add Special-Offer Features to Deals

  1. New Columns
    - `service_id` (optional link to POS services)
    - `deal_type` (standard, flash, limited, happy_hour, bundle)
    - `starts_at` and `ends_at` (offer time windows)
    - `limited_qty` (quantity limits for limited offers)
    - `per_user_limit` (max bookings per user)
    - `days_of_week` (for happy hour scheduling)
    - `happy_hour_start` and `happy_hour_end` (time windows)
    - `requires_deposit` and `deposit_cents` (deposit handling)

  2. New Tables
    - `deal_redemptions` (track per-user usage)

  3. Constraints
    - Deal type validation
    - Deposit amount validation
    - Quantity limits validation

  4. Indexes
    - Performance indexes for home feed queries
*/

-- Link deals to POS services (optional, nice for analytics)
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS service_id uuid REFERENCES services(id) ON DELETE SET NULL;

-- Special-offer mechanics
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS deal_type text NOT NULL DEFAULT 'standard'
    CHECK (deal_type IN ('standard','flash','limited','happy_hour','bundle')),
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS limited_qty integer CHECK (limited_qty IS NULL OR limited_qty >= 0),
  ADD COLUMN IF NOT EXISTS per_user_limit integer NOT NULL DEFAULT 1 CHECK (per_user_limit >= 0),
  ADD COLUMN IF NOT EXISTS days_of_week smallint[] NULL,   -- 0=Sun..6=Sat, for happy hour windows
  ADD COLUMN IF NOT EXISTS happy_hour_start time,
  ADD COLUMN IF NOT EXISTS happy_hour_end time,
  ADD COLUMN IF NOT EXISTS requires_deposit boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deposit_cents integer NOT NULL DEFAULT 0 CHECK (deposit_cents >= 0);

-- Integrity: if requires_deposit, deposit_cents must be > 0
ALTER TABLE deals
  ADD CONSTRAINT deposit_amount_if_required CHECK (
    (requires_deposit = false AND deposit_cents >= 0)
    OR (requires_deposit = true AND deposit_cents > 0)
  );

-- Optional: track per-user redemptions (server guard for per_user_limit)
CREATE TABLE IF NOT EXISTS deal_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, deal_id)
);

-- Enable RLS on deal_redemptions
ALTER TABLE deal_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_redemptions
CREATE POLICY "Users can view own redemptions"
  ON deal_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own redemptions"
  ON deal_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own redemptions"
  ON deal_redemptions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Indexes for fast home feed
CREATE INDEX IF NOT EXISTS idx_deals_is_active_ends ON deals(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_deals_business_active ON deals(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_deals_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_active_window ON deals(is_active, ends_at, starts_at);
CREATE INDEX IF NOT EXISTS idx_deal_redemptions_user_deal ON deal_redemptions(user_id, deal_id);