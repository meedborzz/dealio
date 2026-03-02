/*
  # Add working hours system for businesses

  1. New Tables
    - `working_hours`
      - `id` (uuid, primary key)
      - `business_id` (uuid, foreign key to businesses)
      - `day_of_week` (integer, 0=Sunday, 1=Monday, etc.)
      - `is_open` (boolean, whether business is open this day)
      - `open_time` (time, opening time)
      - `close_time` (time, closing time)
      - `break_start_time` (time, optional lunch break start)
      - `break_end_time` (time, optional lunch break end)
      - `slot_duration_minutes` (integer, default slot duration)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `working_hours` table
    - Add policies for business owners to manage their working hours

  3. Functions
    - Function to generate time slots based on working hours
    - Function to check if a time slot is within working hours
*/

-- Create working_hours table
CREATE TABLE IF NOT EXISTS working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  is_open boolean DEFAULT true,
  open_time time DEFAULT '09:00',
  close_time time DEFAULT '18:00',
  break_start_time time DEFAULT NULL,
  break_end_time time DEFAULT NULL,
  slot_duration_minutes integer DEFAULT 30 CHECK (slot_duration_minutes > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(business_id, day_of_week)
);

-- Enable RLS
ALTER TABLE working_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business owners can manage their working hours"
  ON working_hours
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = working_hours.business_id 
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = working_hours.business_id 
      AND businesses.owner_id = auth.uid()
    )
  );

-- Anyone can read working hours for approved businesses
CREATE POLICY "Anyone can read working hours for approved businesses"
  ON working_hours
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses 
      WHERE businesses.id = working_hours.business_id 
      AND businesses.status = 'approved'
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_working_hours_updated_at
  BEFORE UPDATE ON working_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate time slots based on working hours
CREATE OR REPLACE FUNCTION generate_time_slots_for_deal(
  p_deal_id uuid,
  p_start_date date DEFAULT CURRENT_DATE,
  p_end_date date DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deal_record RECORD;
  working_hours_record RECORD;
  current_date date;
  current_time time;
  end_time time;
  slot_end_time time;
BEGIN
  -- Get deal information
  SELECT d.*, b.id as business_id
  INTO deal_record
  FROM deals d
  JOIN businesses b ON b.id = d.business_id
  WHERE d.id = p_deal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal not found';
  END IF;

  -- Delete existing time slots for this deal in the date range
  DELETE FROM time_slots 
  WHERE deal_id = p_deal_id 
  AND slot_date BETWEEN p_start_date AND p_end_date;

  -- Generate slots for each day in the range
  current_date := p_start_date;
  
  WHILE current_date <= p_end_date LOOP
    -- Get working hours for this day of week (0=Sunday, 1=Monday, etc.)
    SELECT *
    INTO working_hours_record
    FROM working_hours
    WHERE business_id = deal_record.business_id
    AND day_of_week = EXTRACT(DOW FROM current_date)
    AND is_open = true;

    -- If business is open on this day, generate time slots
    IF FOUND THEN
      current_time := working_hours_record.open_time;
      end_time := working_hours_record.close_time;

      WHILE current_time + (deal_record.duration_minutes || ' minutes')::interval <= end_time::time LOOP
        slot_end_time := current_time + (deal_record.duration_minutes || ' minutes')::interval;

        -- Skip lunch break if defined
        IF working_hours_record.break_start_time IS NOT NULL 
           AND working_hours_record.break_end_time IS NOT NULL THEN
          -- Skip if slot overlaps with break time
          IF NOT (slot_end_time <= working_hours_record.break_start_time 
                  OR current_time >= working_hours_record.break_end_time) THEN
            current_time := current_time + (working_hours_record.slot_duration_minutes || ' minutes')::interval;
            CONTINUE;
          END IF;
        END IF;

        -- Insert time slot
        INSERT INTO time_slots (
          deal_id,
          slot_date,
          slot_time,
          available_spots,
          booked_spots
        ) VALUES (
          p_deal_id,
          current_date,
          current_time,
          deal_record.max_bookings_per_slot,
          0
        );

        -- Move to next slot
        current_time := current_time + (working_hours_record.slot_duration_minutes || ' minutes')::interval;
      END LOOP;
    END IF;

    current_date := current_date + 1;
  END LOOP;
END;
$$;

-- Function to check if a business has working hours set up
CREATE OR REPLACE FUNCTION has_working_hours_setup(p_business_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM working_hours 
    WHERE business_id = p_business_id
  );
END;
$$;

-- Insert default working hours for existing businesses that don't have them
INSERT INTO working_hours (business_id, day_of_week, is_open, open_time, close_time, slot_duration_minutes)
SELECT 
  b.id,
  generate_series(1, 6) as day_of_week, -- Monday to Saturday
  true,
  '09:00'::time,
  '18:00'::time,
  30
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM working_hours wh WHERE wh.business_id = b.id
)
AND b.status = 'approved';

-- Insert Sunday as closed for existing businesses
INSERT INTO working_hours (business_id, day_of_week, is_open, open_time, close_time, slot_duration_minutes)
SELECT 
  b.id,
  0 as day_of_week, -- Sunday
  false,
  '09:00'::time,
  '18:00'::time,
  30
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM working_hours wh WHERE wh.business_id = b.id AND wh.day_of_week = 0
)
AND b.status = 'approved';