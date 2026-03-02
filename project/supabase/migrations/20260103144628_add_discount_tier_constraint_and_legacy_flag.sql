/*
  # Add Discount Tier Constraint and Legacy Flag

  1. Changes
    - Adds `is_legacy_offer` boolean flag to deals table to identify offers created before the tier system
    - Marks all existing offers with discount_percentage not in (10, 20, 30) as legacy offers
    - Adds CHECK constraint to enforce only 10%, 20%, or 30% discounts for new offers
    - Adds `legacy_migrated_at` timestamp to track when legacy offers were migrated
    - Adds `legacy_original_discount` to preserve the original discount percentage for reference

  2. Security
    - Maintains existing RLS policies
    - No changes to access control

  3. Notes
    - Legacy offers can still be displayed but cannot be edited without migration
    - New offers must use one of the three standard tiers (10%, 20%, 30%)
    - Existing legacy offers are grandfathered in but flagged for migration
*/

-- Add columns to track legacy offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'is_legacy_offer'
  ) THEN
    ALTER TABLE deals ADD COLUMN is_legacy_offer boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'legacy_original_discount'
  ) THEN
    ALTER TABLE deals ADD COLUMN legacy_original_discount integer NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'legacy_migrated_at'
  ) THEN
    ALTER TABLE deals ADD COLUMN legacy_migrated_at timestamptz NULL;
  END IF;
END $$;

-- Identify and flag existing legacy offers (those with non-standard discounts)
UPDATE deals
SET 
  is_legacy_offer = true,
  legacy_original_discount = discount_percentage
WHERE discount_percentage NOT IN (10, 20, 30)
  AND is_legacy_offer = false;

-- Add CHECK constraint to enforce discount tiers for new non-legacy offers
-- This constraint allows legacy offers to keep their discount but prevents new ones
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'deals' AND constraint_name = 'deals_discount_percentage_check'
  ) THEN
    ALTER TABLE deals 
    ADD CONSTRAINT deals_discount_percentage_check 
    CHECK (
      is_legacy_offer = true OR 
      discount_percentage IN (10, 20, 30)
    );
  END IF;
END $$;

-- Create index for querying legacy offers
CREATE INDEX IF NOT EXISTS idx_deals_legacy_offers 
  ON deals(is_legacy_offer, is_active) 
  WHERE is_legacy_offer = true;

-- Create function to migrate legacy offer to standard tier
CREATE OR REPLACE FUNCTION migrate_legacy_offer_to_tier(
  p_deal_id uuid,
  p_new_tier integer
)
RETURNS jsonb AS $$
DECLARE
  v_deal record;
  v_new_discounted_price numeric;
  v_new_quota integer;
BEGIN
  -- Validate tier
  IF p_new_tier NOT IN (10, 20, 30) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid tier. Must be 10, 20, or 30'
    );
  END IF;

  -- Get deal
  SELECT * INTO v_deal FROM deals WHERE id = p_deal_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Deal not found'
    );
  END IF;

  IF NOT v_deal.is_legacy_offer THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'This is not a legacy offer'
    );
  END IF;

  -- Calculate new price and quota
  v_new_discounted_price := ROUND(v_deal.original_price * (1 - p_new_tier::numeric / 100));
  
  v_new_quota := CASE p_new_tier
    WHEN 10 THEN 10
    WHEN 20 THEN 25
    WHEN 30 THEN 40
  END;

  -- Update the deal
  UPDATE deals
  SET
    discount_percentage = p_new_tier,
    discounted_price = v_new_discounted_price,
    booking_quota_total = v_new_quota,
    booking_quota_remaining = v_new_quota,
    is_legacy_offer = false,
    legacy_migrated_at = now(),
    updated_at = now()
  WHERE id = p_deal_id;

  RETURN jsonb_build_object(
    'success', true,
    'old_discount', v_deal.discount_percentage,
    'new_discount', p_new_tier,
    'old_price', v_deal.discounted_price,
    'new_price', v_new_discounted_price,
    'new_quota', v_new_quota
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;