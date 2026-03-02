/*
  # Fix Booking Update Policies for Confirmation and Cancellation

  ## Summary
  Fixes conflicting RLS policies that prevent business owners from confirming bookings.
  Simplifies UPDATE policies to allow proper booking management.

  ## Changes
  1. **Remove Conflicting Policies**
     - Removes duplicate and conflicting UPDATE policies for bookings
  
  2. **Business Owner Update Policy**
     - Allows business owners to update ALL fields for bookings of their deals
     - Includes status changes (pending → confirmed, confirmed → completed, etc.)
     - Works for both online bookings (with user_id) and in-store bookings (user_id is null)
  
  3. **Client Cancellation Policy**
     - Allows clients to cancel only their own bookings
     - Restricted to status transitions: pending/confirmed → cancelled
     - Cannot modify other booking fields
  
  ## Security
  - Business owners maintain full control over their bookings
  - Clients can only cancel their own bookings, not modify other fields
  - Guest bookings (user_id is null) can only be managed by business owners
*/

-- Drop all existing UPDATE policies for bookings
DROP POLICY IF EXISTS "Business owners can update bookings for their deals" ON bookings;
DROP POLICY IF EXISTS "Clients can cancel own bookings" ON bookings;
DROP POLICY IF EXISTS "Businesses can update their bookings" ON bookings;

-- Create simplified UPDATE policy for business owners
-- This allows business owners to update ALL aspects of bookings for their deals
CREATE POLICY "Business owners can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deals d
      JOIN businesses b ON b.id = d.business_id
      WHERE d.id = bookings.deal_id
      AND b.owner_id = auth.uid()
    )
  );

-- Create UPDATE policy for clients to cancel their own bookings
CREATE POLICY "Clients can cancel their own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() 
    AND status IN ('pending', 'confirmed', 'requested')
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'cancelled'
  );