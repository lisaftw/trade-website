-- Create site_access_tokens table for password-protected site access
CREATE TABLE IF NOT EXISTS site_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_site_access_tokens_token ON site_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_site_access_tokens_expires_at ON site_access_tokens(expires_at);

-- Clean up expired tokens (optional, can be run periodically)
DELETE FROM site_access_tokens WHERE expires_at < NOW();
