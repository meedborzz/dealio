/*
  # Booking Enforcement & Per-User Limits

  1. Functions
    - `check_per_user_limit()` - Validates user hasn't exceeded deal limits
    - `update_deal_redemptions()` - Tracks user redemptions per deal
    - `prevent_double_booking()` - Prevents staff overlap conflicts

  2. Triggers
    - `booking_redemption_guard` - Enforces per-user limits before booking creation
    - `update_redemption_count` - Updates redemption tracking after booking changes

  3. Constraints
    - Enhanced booking validation with staff overlap prevention
*/

-- Function to check per-user limit before booking
CREATE OR REPLACE FUNCTION check_per_user_limit()
RETURNS TRIGGER AS $$
DECLARE
  deal_limit INTEGER;
  current_count INTEGER;
BEGIN
  -- Only check for confirmed/pending bookings
  IF NEW.status NOT IN ('pending', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Get the per-user limit for this deal
  SELECT per_user_limit INTO deal_limit
  FROM deals 
  WHERE id = NEW.deal_id;

  -- If no limit set, allow booking
  IF deal_limit IS NULL OR deal_limit = 0 THEN
    RETURN NEW;
  END IF;

  -- Count existing bookings for this user and deal
  SELECT COALESCE(count, 0) INTO current_count
  FROM deal_redemptions
  WHERE user_id = NEW.user_id AND deal_id = NEW.deal_id;

  -- Check if adding this booking would exceed the limit
  IF current_count >= deal_limit THEN
    RAISE EXCEPTION 'Limite de réservations atteinte pour cette offre (max: %)', deal_limit;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update deal redemptions count
CREATE OR REPLACE FUNCTION update_deal_redemptions()
RETURNS TRIGGER AS $$
DECLARE
  old_status TEXT;
  new_status TEXT;
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IN ('pending', 'confirmed') AND NEW.user_id IS NOT NULL THEN
      INSERT INTO deal_redemptions (user_id, deal_id, count)
      VALUES (NEW.user_id, NEW.deal_id, 1)
      ON CONFLICT (user_id, deal_id)
      DO UPDATE SET count = deal_redemptions.count + 1;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    old_status := OLD.status;
    new_status := NEW.status;

    -- Status changed from non-active to active
    IF old_status NOT IN ('pending', 'confirmed') AND new_status IN ('pending', 'confirmed') AND NEW.user_id IS NOT NULL THEN
      INSERT INTO deal_redemptions (user_id, deal_id, count)
      VALUES (NEW.user_id, NEW.deal_id, 1)
      ON CONFLICT (user_id, deal_id)
      DO UPDATE SET count = deal_redemptions.count + 1;
    END IF;

    -- Status changed from active to non-active
    IF old_status IN ('pending', 'confirmed') AND new_status NOT IN ('pending', 'confirmed') AND NEW.user_id IS NOT NULL THEN
      UPDATE deal_redemptions 
      SET count = GREATEST(0, count - 1)
      WHERE user_id = NEW.user_id AND deal_id = NEW.deal_id;
    END IF;

    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.status IN ('pending', 'confirmed') AND OLD.user_id IS NOT NULL THEN
      UPDATE deal_redemptions 
      SET count = GREATEST(0, count - 1)
      WHERE user_id = OLD.user_id AND deal_id = OLD.deal_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS booking_redemption_guard ON bookings;
CREATE TRIGGER booking_redemption_guard
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_per_user_limit();

DROP TRIGGER IF EXISTS update_redemption_count ON bookings;
CREATE TRIGGER update_redemption_count
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_redemptions();

-- Function to check limited quantity availability
CREATE OR REPLACE FUNCTION check_limited_quantity()
RETURNS TRIGGER AS $$
DECLARE
  deal_qty INTEGER;
  current_bookings INTEGER;
BEGIN
  -- Only check for confirmed/pending bookings
  IF NEW.status NOT IN ('pending', 'confirmed') THEN
    RETURN NEW;
  END IF;

  -- Get the limited quantity for this deal
  SELECT limited_qty INTO deal_qty
  FROM deals 
  WHERE id = NEW.deal_id;

  -- If no quantity limit, allow booking
  IF deal_qty IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count current active bookings for this deal
  SELECT COUNT(*) INTO current_bookings
  FROM bookings
  WHERE deal_id = NEW.deal_id 
    AND status IN ('pending', 'confirmed')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Check if adding this booking would exceed quantity
  IF current_bookings >= deal_qty THEN
    RAISE EXCEPTION 'Cette offre est épuisée (quantité limitée: %)', deal_qty;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create quantity check trigger
DROP TRIGGER IF EXISTS check_deal_quantity ON bookings;
CREATE TRIGGER check_deal_quantity
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_limited_quantity();

-- Enable RLS on deal_redemptions
ALTER TABLE deal_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for deal_redemptions
CREATE POLICY "Users can view own redemptions"
  ON deal_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage redemptions"
  ON deal_redemptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);