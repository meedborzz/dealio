/*
  # Time Slot Generation System

  1. Functions
    - `generate_time_slots_for_deal()` - Auto-generate time slots for new deals
    - `cleanup_expired_slots()` - Remove expired time slots
    
  2. Automation
    - Trigger to auto-generate slots when deal is created
    - Daily cleanup of old slots
    
  3. Flexibility
    - Configurable slot duration and intervals
    - Business hours consideration
    - Holiday and break handling
*/

-- Function to generate time slots for a deal
CREATE OR REPLACE FUNCTION generate_time_slots_for_deal(
  p_deal_id UUID,
  p_days_ahead INTEGER DEFAULT 30,
  p_start_hour INTEGER DEFAULT 9,
  p_end_hour INTEGER DEFAULT 18,
  p_slot_interval INTEGER DEFAULT 60,
  p_max_slots_per_time INTEGER DEFAULT 3
) RETURNS INTEGER AS $$
DECLARE
  v_current_date DATE;
  v_end_date DATE;
  v_current_time TIME;
  v_slots_created INTEGER := 0;
  v_deal_duration INTEGER;
BEGIN
  -- Get deal duration
  SELECT duration_minutes INTO v_deal_duration
  FROM deals WHERE id = p_deal_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;

  -- Set date range
  v_current_date := CURRENT_DATE;
  v_end_date := CURRENT_DATE + p_days_ahead;

  -- Generate slots for each day
  WHILE v_current_date <= v_end_date LOOP
    -- Skip Sundays (adjust based on business needs)
    IF EXTRACT(DOW FROM v_current_date) != 0 THEN
      v_current_time := (p_start_hour || ':00')::TIME;
      
      -- Generate slots for the day
      WHILE v_current_time <= (p_end_hour || ':00')::TIME - (v_deal_duration || ' minutes')::INTERVAL LOOP
        -- Insert time slot
        INSERT INTO time_slots (
          deal_id,
          date,
          start_time,
          end_time,
          available_spots,
          is_available,
          slot_date,
          slot_time
        ) VALUES (
          p_deal_id,
          v_current_date,
          v_current_time,
          v_current_time + (v_deal_duration || ' minutes')::INTERVAL,
          p_max_slots_per_time,
          true,
          v_current_date,
          v_current_time
        )
        ON CONFLICT (deal_id, date, start_time) DO NOTHING;
        
        -- Check if row was inserted
        IF FOUND THEN
          v_slots_created := v_slots_created + 1;
        END IF;
        
        -- Move to next slot
        v_current_time := v_current_time + (p_slot_interval || ' minutes')::INTERVAL;
      END LOOP;
    END IF;
    
    -- Move to next day
    v_current_date := v_current_date + 1;
  END LOOP;

  RETURN v_slots_created;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired time slots
CREATE OR REPLACE FUNCTION cleanup_expired_slots() RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete time slots older than yesterday
  DELETE FROM time_slots 
  WHERE date < CURRENT_DATE - INTERVAL '1 day';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate time slots when a deal is created
CREATE OR REPLACE FUNCTION trigger_generate_time_slots() RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slots for active deals with booking enabled
  IF NEW.is_active AND NEW.booking_enabled THEN
    PERFORM generate_time_slots_for_deal(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new deals
DROP TRIGGER IF EXISTS auto_generate_time_slots ON deals;
CREATE TRIGGER auto_generate_time_slots
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_time_slots();

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_time_slots_for_deal(UUID, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_slots() TO authenticated;

-- Add unique constraint to prevent duplicate time slots
ALTER TABLE time_slots 
ADD CONSTRAINT unique_deal_date_time 
UNIQUE (deal_id, date, start_time);