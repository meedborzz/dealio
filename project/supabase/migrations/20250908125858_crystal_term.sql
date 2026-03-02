/*
  # Add referral code to user profiles

  1. Changes
    - Add `referral_code` column to `user_profiles` table
    - Add unique constraint for referral codes
    - Add index for performance

  2. Security
    - No changes to RLS policies needed
*/

-- Add referral_code column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN referral_code text;
    
    -- Add unique constraint
    ALTER TABLE user_profiles ADD CONSTRAINT unique_referral_code UNIQUE (referral_code);
    
    -- Add index for performance
    CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
  END IF;
END $$;