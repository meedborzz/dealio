/*
  # Enable pgcrypto extension

  1. Changes
    - Enable pgcrypto extension for cryptographic functions
    - Required for gen_random_bytes() used in QR code generation
  
  2. Notes
    - This is a safe operation that adds cryptographic functions
    - Used by booking QR code generation triggers
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;
