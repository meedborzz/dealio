/*
  # Remove QR Code Functionality

  1. Changes
    - Drop qr_codes table and all related triggers/functions
    - Remove qr_code_id column from bookings table
    - Remove qr_code_id column from booking_validations table
    - Drop all QR code related database functions
    
  2. Security
    - Clean removal of all QR code related policies
    - No data loss for bookings or other core data
*/

-- Drop functions with CASCADE to remove dependent triggers
DROP FUNCTION IF EXISTS validate_booking_with_qr(uuid) CASCADE;
DROP FUNCTION IF EXISTS generate_qr_code_for_booking() CASCADE;

-- Remove foreign key constraints and columns from related tables
ALTER TABLE booking_validations 
  DROP COLUMN IF EXISTS qr_code_id CASCADE;

ALTER TABLE bookings 
  DROP COLUMN IF EXISTS qr_code_id CASCADE;

-- Drop the qr_codes table
DROP TABLE IF EXISTS qr_codes CASCADE;
