/*
  # Remove Waiting Lists Feature

  1. Changes
    - Drop waiting_lists table and all related functionality
    
  2. Security
    - Clean removal of all waiting list references
*/

DROP TABLE IF EXISTS waiting_lists CASCADE;