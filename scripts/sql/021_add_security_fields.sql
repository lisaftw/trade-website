-- Add fingerprint_hash to sessions table for session hijacking prevention
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS fingerprint_hash TEXT;

-- Add role to profiles table for RBAC
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Add request_signature table for tracking signed requests
CREATE TABLE IF NOT EXISTS request_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  signature TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for signature lookups
CREATE INDEX IF NOT EXISTS idx_request_signatures_signature ON request_signatures(signature);
CREATE INDEX IF NOT EXISTS idx_request_signatures_timestamp ON request_signatures(timestamp);

-- Add cleanup function for old signatures (prevent replay attacks)
CREATE OR REPLACE FUNCTION cleanup_old_signatures()
RETURNS void AS $$
BEGIN
  DELETE FROM request_signatures 
  WHERE created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
