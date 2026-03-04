-- Emergency fix for missing likes_count and dislikes_count on deals table
-- This ensures the booking feedback system works correctly and the trigger can update stats.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE deals ADD COLUMN likes_count int NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deals' AND column_name = 'dislikes_count'
  ) THEN
    ALTER TABLE deals ADD COLUMN dislikes_count int NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Recreate function to increment satisfaction counters correctly
CREATE OR REPLACE FUNCTION increment_satisfaction_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rating = 1 THEN
    UPDATE deals
    SET likes_count = likes_count + 1
    WHERE id = NEW.deal_id;
  ELSIF NEW.rating = -1 THEN
    UPDATE deals
    SET dislikes_count = dislikes_count + 1
    WHERE id = NEW.deal_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger on booking_feedback
DROP TRIGGER IF EXISTS trigger_increment_satisfaction ON booking_feedback;
CREATE TRIGGER trigger_increment_satisfaction
  AFTER INSERT ON booking_feedback
  FOR EACH ROW
  EXECUTE FUNCTION increment_satisfaction_counters();
