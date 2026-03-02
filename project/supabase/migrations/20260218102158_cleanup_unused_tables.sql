/*
  # Clean Up Unused Tables

  ## Removed Tables (8 total)
  
  This migration removes tables that are either:
  - Behind disabled feature flags with no user data
  - Completely unused in the codebase
  - Have zero or minimal test data only

  ### Tables Being Removed:
  
  1. **saved_searches** 
     - Feature flag disabled (FEATURES.SAVED_SEARCHES = false)
     - Component exists but never imported
     - 0 rows
  
  2. **favorites**
     - Feature flag disabled (FEATURES.FAVORITES = false)
     - UI hidden behind feature flag
     - 0 rows
  
  3. **wallet_transactions**
     - Feature flag disabled (FEATURES.WALLET = false)
     - Component never imported
     - 1 test row only
  
  4. **commission_logs**
     - Feature flag disabled (FEATURES.COMMISSION = false)
     - Not used anywhere in codebase
     - 0 rows
  
  5. **booking_validations**
     - Not used anywhere in codebase
     - 0 rows
  
  6. **conversations**
     - Feature flag disabled (FEATURES.MESSAGING = false)
     - Routes never registered
     - 1 test row only
  
  7. **messages**
     - Feature flag disabled (FEATURES.MESSAGING = false)
     - Routes never registered
     - 1 test row only
  
  8. **user_interactions**
     - Minimal usage (only 3 rows)
     - Only used for basic view tracking
     - Recommendations feature works without it

  ## Security
  - All tables being dropped have RLS policies that will be automatically removed
  - No foreign key dependencies exist from active tables to these tables

  ## Data Impact
  - Total data loss: ~6 rows (all test/demo data)
  - No production user data affected
*/

-- Drop tables in order (messages before conversations due to FK)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Drop remaining unused tables
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS commission_logs CASCADE;
DROP TABLE IF EXISTS booking_validations CASCADE;
DROP TABLE IF EXISTS user_interactions CASCADE;
