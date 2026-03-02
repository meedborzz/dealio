/*
  # Add category field to deals table

  1. Schema Changes
    - Add `category` column to `deals` table
    - Update existing deals with categories based on their business category
    - Add index for better query performance

  2. Data Migration
    - Copy category from business to deals for existing records
    - Set default category for deals without business category

  3. Performance
    - Add index on deals.category for faster filtering
*/

-- Add category column to deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'category'
  ) THEN
    ALTER TABLE deals ADD COLUMN category text;
  END IF;
END $$;

-- Update existing deals with category from their business
UPDATE deals 
SET category = businesses.category
FROM businesses 
WHERE deals.business_id = businesses.id 
AND deals.category IS NULL;

-- Set default category for any remaining deals without category
UPDATE deals 
SET category = 'Coiffure' 
WHERE category IS NULL;

-- Make category required for new deals
ALTER TABLE deals ALTER COLUMN category SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);

-- Add constraint to ensure valid categories
ALTER TABLE deals ADD CONSTRAINT valid_deal_category 
CHECK (category IN (
  'Coiffure', 'Ongles', 'Massage', 'Spa', 'Esthetique', 
  'Barbier', 'Manucure', 'Epilation', 'Maquillage', 
  'Fitness', 'Sourcils', 'Soins'
));