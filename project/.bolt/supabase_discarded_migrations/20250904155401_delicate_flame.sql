/*
  # Add deal_type column to deals table

  1. Schema Changes
    - Add `deal_type` column to deals table with default 'standard'
    - Add constraint to ensure valid deal types
    - Add other missing columns for enhanced deal features

  2. Data Migration
    - Set existing deals to 'standard' type
    - Update any null values with defaults
*/

-- Add deal_type column with constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'deal_type'
  ) THEN
    ALTER TABLE deals ADD COLUMN deal_type text DEFAULT 'standard';
    ALTER TABLE deals ADD CONSTRAINT valid_deal_type 
      CHECK (deal_type IN ('standard', 'flash', 'limited', 'happy_hour', 'bundle'));
  END IF;
END $$;

-- Add other missing columns for enhanced deals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'starts_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN starts_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'ends_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN ends_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'limited_qty'
  ) THEN
    ALTER TABLE deals ADD COLUMN limited_qty integer;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'per_user_limit'
  ) THEN
    ALTER TABLE deals ADD COLUMN per_user_limit integer DEFAULT 1;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'days_of_week'
  ) THEN
    ALTER TABLE deals ADD COLUMN days_of_week integer[];
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_start'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_start time;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'happy_hour_end'
  ) THEN
    ALTER TABLE deals ADD COLUMN happy_hour_end time;
  END IF;
END $$;

-- Update existing deals to have default values
UPDATE deals 
SET deal_type = 'standard' 
WHERE deal_type IS NULL;

UPDATE deals 
SET per_user_limit = 1 
WHERE per_user_limit IS NULL;