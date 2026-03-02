/*
  # Tighten RLS Policies for Security

  1. Security Updates
    - Restrict businesses to approved only for public access
    - Restrict deals to active + valid + approved business only
    - Restrict time slots to future + eligible deals only

  2. Changes Made
    - Updated businesses public read policy
    - Updated deals public read policy  
    - Updated time_slots public read policy
*/

-- Tighten businesses policy - only show approved businesses to public
DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
DROP POLICY IF EXISTS "Anyone can view approved businesses" ON businesses;

CREATE POLICY "Public can view approved businesses"
  ON businesses FOR SELECT TO public
  USING (status = 'approved');

-- Tighten deals policy - only show active deals from approved businesses
DROP POLICY IF EXISTS "Public can view active deals" ON deals;
DROP POLICY IF EXISTS "Anyone can view active deals" ON deals;

CREATE POLICY "Public can view bookable deals"
  ON deals FOR SELECT TO public
  USING (
    is_active = true
    AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
    AND EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = deals.business_id AND b.status = 'approved'
    )
  );

-- Tighten time slots policy - only show future slots for eligible deals
DROP POLICY IF EXISTS "Public can view available time slots" ON time_slots;
DROP POLICY IF EXISTS "Anyone can view available time slots" ON time_slots;

CREATE POLICY "Public can view eligible future slots"
  ON time_slots FOR SELECT TO public
  USING (
    is_available = true
    AND date >= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM deals d JOIN businesses b ON b.id = d.business_id
      WHERE d.id = time_slots.deal_id
        AND d.is_active = true
        AND (d.valid_until IS NULL OR d.valid_until >= CURRENT_DATE)
        AND b.status = 'approved'
    )
  );