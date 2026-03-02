/*
  # Add business reply functionality to reviews

  1. Schema Changes
    - Add `business_reply` column to reviews table for salon responses
    - Add `business_reply_at` timestamp for when reply was posted
    - Add `is_reported` boolean for content moderation
    - Add `report_reason` text for moderation details

  2. Security
    - Update RLS policies to allow business owners to update their reviews
    - Ensure only business owners can add replies to reviews for their business
*/

-- Add new columns to reviews table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'business_reply'
  ) THEN
    ALTER TABLE reviews ADD COLUMN business_reply text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'business_reply_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN business_reply_at timestamp with time zone;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'is_reported'
  ) THEN
    ALTER TABLE reviews ADD COLUMN is_reported boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'report_reason'
  ) THEN
    ALTER TABLE reviews ADD COLUMN report_reason text;
  END IF;
END $$;

-- Add policy for business owners to reply to reviews
CREATE POLICY IF NOT EXISTS "Business owners can reply to reviews for their business"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reviews.business_id
      AND businesses.owner_id = auth.uid()
    )
  );