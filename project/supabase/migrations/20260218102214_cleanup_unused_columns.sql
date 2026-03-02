/*
  # Clean Up Unused Columns

  ## Removed Columns (8 total)
  
  This migration removes columns that are either:
  - Behind disabled feature flags
  - Never queried or used in application logic
  - Duplicate/redundant generated columns

  ### Columns Being Removed:

  #### From user_profiles (2 columns):
  1. **wallet_balance** (numeric)
     - Only used when FEATURES.WALLET = false
     - Never displayed in UI
  
  2. **total_spent** (numeric)
     - Only used when FEATURES.WALLET = false
     - Never displayed in UI

  #### From time_slots (2 columns):
  3. **slot_date** (generated column)
     - Duplicates the 'date' field
     - Never queried anywhere
  
  4. **slot_time** (generated column)
     - Duplicates the 'start_time' field
     - Never queried anywhere

  #### From bookings (4 columns):
  5. **spot_reserved** (boolean)
     - Only exists in types
     - Never queried or used in logic
  
  6. **validated_at** (timestamp)
     - Only exists in types
     - Not actively used
  
  7. **commission_calculated** (boolean)
     - Commission feature disabled
     - Only exists in types
  
  8. **payment_status** (enum)
     - Only exists in types
     - Not actively used

  ## Data Impact
  - No active features depend on these columns
  - Reduces database overhead and simplifies schema
*/

-- Remove wallet-related columns from user_profiles
ALTER TABLE user_profiles 
  DROP COLUMN IF EXISTS wallet_balance,
  DROP COLUMN IF EXISTS total_spent;

-- Remove redundant generated columns from time_slots
ALTER TABLE time_slots 
  DROP COLUMN IF EXISTS slot_date,
  DROP COLUMN IF EXISTS slot_time;

-- Remove unused tracking columns from bookings
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS spot_reserved,
  DROP COLUMN IF EXISTS validated_at,
  DROP COLUMN IF EXISTS commission_calculated,
  DROP COLUMN IF EXISTS payment_status;
