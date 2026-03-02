/*
  # Add advanced deal features to deals table

  1. New Columns
    - `deal_type` (text) - Type of deal: standard, flash, limited, happy_hour, bundle
    - `starts_at` (timestamptz) - When the deal becomes active
    - `ends_at` (timestamptz) - When the deal expires
    - `limited_qty` (integer) - Maximum quantity for limited deals
    - `per_user_limit` (integer) - Maximum bookings per user
    - `days_of_week` (integer[]) - Days when deal is available (0=Sun, 6=Sat)
    - `happy_hour_start` (time) - Start time for happy hour deals
    - `happy_hour_end` (time) - End time for happy hour deals
    - `requires_deposit` (boolean) - Whether deal requires deposit
    - `deposit_cents` (integer) - Deposit amount in cents

  2. Constraints
    - Valid deal types constraint
    - Valid days of week constraint
    - Positive deposit amount constraint

  3. Indexes
    - Index on deal_type for filtering
    - Index on starts_at and ends_at for time-based queries
*/

-- Add new columns to deals table
DO $$
BEGIN
  -- Add deal_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'deal_type'
  ) THEN
    ALTER TABLE deals ADD COLUMN deal_type text DEFAULT 'standard';
  END IF;

  -- Add starts_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN starts_at timestamptz;
  END IF;

  -- Add ends_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'ends_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN ends_at timestamptz;
  END IF;

  -- Add limited_qty column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'limited_qty'
  ) THEN
    ALTER TABLE deals ADD COLUMN limited_qty integer;
  END IF;

  -- Add per_user_limit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'per_user_limit'
  ) THEN
    ALTER TABLE deals ADD COLUMN per_user_limit integer DEFAULT 1;
  END IF;

  -- Add days_of_week column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE deals ADD COLUMN days_of_week integer[];
  END IF;

  -- Add happy_hour_start column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_start'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_start time;
  END IF;

  -- Add happy_hour_end column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_end'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_end time;
  END IF;

  -- Add requires_deposit column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'requires_deposit'
  ) THEN
    ALTER TABLE deals ADD COLUMN requires_deposit boolean DEFAULT false;
  END IF;

  -- Add deposit_cents column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'deposit_cents'
  ) THEN
    ALTER TABLE deals ADD COLUMN deposit_cents integer DEFAULT 0;
  END IF;
END $$;

-- Add constraints
DO $$
BEGIN
  -- Add deal_type constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_deal_type'
  ) THEN
    ALTER TABLE deals ADD CONSTRAINT valid_deal_type 
    CHECK (deal_type IN ('standard', 'flash', 'limited', 'happy_hour', 'bundle'));
  END IF;

  -- Add days_of_week constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_days_of_week'
  ) THEN
    ALTER TABLE deals ADD CONSTRAINT valid_days_of_week 
    CHECK (days_of_week IS NULL OR (
      array_length(days_of_week, 1) <= 7 AND
      NOT EXISTS (
        SELECT 1 FROM unnest(days_of_week) AS day 
        WHERE day < 0 OR day > 6
      )
    ));
  END IF;

  -- Add deposit amount constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_deposit_amount'
  ) THEN
    ALTER TABLE deals ADD CONSTRAINT valid_deposit_amount 
    CHECK (deposit_cents >= 0);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_starts_at ON deals(starts_at);
CREATE INDEX IF NOT EXISTS idx_deals_ends_at ON deals(ends_at);
CREATE INDEX IF NOT EXISTS idx_deals_time_range ON deals(starts_at, ends_at);