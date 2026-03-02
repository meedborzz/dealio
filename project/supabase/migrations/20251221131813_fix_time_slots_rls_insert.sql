/*
  # Fix Time Slots RLS for Customer Bookings

  1. Changes
    - Add policy to allow anyone to insert time slots for active deals
    - This enables the booking flow where slots are generated on-demand
    
  2. Security
    - Only allows insertion for deals that exist and are active
    - Foreign key constraint ensures deal_id is valid
    - Business status is checked via deal relationship
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'time_slots' 
    AND policyname = 'Anyone can insert time slots for active deals'
  ) THEN
    CREATE POLICY "Anyone can insert time slots for active deals"
      ON time_slots
      FOR INSERT
      TO public
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM deals d
          JOIN businesses b ON d.business_id = b.id
          WHERE d.id = time_slots.deal_id
            AND d.is_active = true
            AND b.status = 'approved'::business_status
        )
      );
  END IF;
END $$;