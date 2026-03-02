/*
  # Fix Category Mapping for Deals

  1. Category Updates
    - Maps old category names to new standardized categories
    - Updates all existing deals to use correct category values
    
  2. Mapping Details
    - 'Ongles', 'Manucure' → 'Onglerie'
    - 'Barbier' → 'Coiffure'
    - 'Spa', 'Massage' → 'Spa & Corps'
    - 'Epilation', 'Esthetique' → 'Esthetique & Regard'
    - 'Fitness' → 'Bien-être & Minceur'
    - 'Soins', 'Sourcils' → 'Esthetique & Regard'
    - 'Coiffure' remains 'Coiffure'
    
  3. Validation
    - Replaces old category constraint with new one
    - Ensures only valid categories can be saved
    
  4. Valid Categories
    - Coiffure
    - Soins du Visage
    - Onglerie
    - Spa & Corps
    - Esthetique & Regard
    - Maquillage
    - Bien-être & Minceur
    - Forfaits Spéciaux
*/

-- Step 1: Drop the old category constraint
ALTER TABLE deals DROP CONSTRAINT IF EXISTS valid_deal_category;

-- Step 2: Update existing deals with corrected category names
UPDATE deals SET category = 'Onglerie' WHERE category IN ('Ongles', 'Manucure');
UPDATE deals SET category = 'Coiffure' WHERE category = 'Barbier';
UPDATE deals SET category = 'Spa & Corps' WHERE category IN ('Spa', 'Massage');
UPDATE deals SET category = 'Esthetique & Regard' WHERE category IN ('Epilation', 'Esthetique', 'Sourcils', 'Soins');
UPDATE deals SET category = 'Bien-être & Minceur' WHERE category = 'Fitness';

-- Step 3: Add new CHECK constraint with standardized categories
ALTER TABLE deals ADD CONSTRAINT valid_deal_category 
  CHECK (category IN (
    'Coiffure',
    'Soins du Visage',
    'Onglerie',
    'Spa & Corps',
    'Esthetique & Regard',
    'Maquillage',
    'Bien-être & Minceur',
    'Forfaits Spéciaux'
  ));
