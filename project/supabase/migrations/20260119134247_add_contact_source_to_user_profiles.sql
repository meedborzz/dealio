/*
  # Add Contact Source Tracking
  
  1. Changes
    - Add `contact_source` field to `user_profiles` table to track how users heard about Dealio
    - Field is optional (nullable) and stores the marketing source/channel
  
  2. Notes
    - This helps track which influencers/channels are driving signups
    - Supports values like: "Dr Nouhaila", "Instagram", "Facebook", "Friend", etc.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'contact_source'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN contact_source text;
  END IF;
END $$;