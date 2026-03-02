/*
  # Add Working Hours to Businesses

  1. Changes
    - Add `working_hours` JSONB column to businesses table
    - Add `special_dates` JSONB column for holidays/closed days overrides
    - Set default working hours (Mon-Fri 9am-6pm, Sat 9am-5pm, Sun closed)
  
  2. Structure
    - working_hours: { "monday": {"open": "09:00", "close": "18:00", "closed": false}, ... }
    - special_dates: { "2024-12-25": {"closed": true, "reason": "Christmas"}, ... }
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'working_hours'
  ) THEN
    ALTER TABLE businesses 
    ADD COLUMN working_hours JSONB DEFAULT '{
      "monday": {"open": "09:00", "close": "18:00", "closed": false},
      "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
      "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
      "thursday": {"open": "09:00", "close": "18:00", "closed": false},
      "friday": {"open": "09:00", "close": "18:00", "closed": false},
      "saturday": {"open": "09:00", "close": "17:00", "closed": false},
      "sunday": {"open": "10:00", "close": "16:00", "closed": true}
    }'::JSONB;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'special_dates'
  ) THEN
    ALTER TABLE businesses 
    ADD COLUMN special_dates JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;