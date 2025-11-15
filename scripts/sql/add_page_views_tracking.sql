-- Add page view tracking to activities table
-- The activities table already exists, we'll use the 'meta' jsonb field to store page view data

-- Create an index for faster activity queries
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);
CREATE INDEX IF NOT EXISTS idx_activities_discord_id ON activities(discord_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_type_created ON activities(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_discord_created ON activities(discord_id, created_at DESC);

-- GIN index for JSONB meta field for faster meta queries
CREATE INDEX IF NOT EXISTS idx_activities_meta ON activities USING GIN(meta);

-- Add a comment to document the structure
COMMENT ON TABLE activities IS 'Stores all user activities including page views. Page views have type=''page_view'' and meta contains {page: string, referrer?: string}';

-- Example activity types:
-- 'login' - User logged in
-- 'logout' - User logged out  
-- 'page_view' - User viewed a page (meta: {page: string, referrer?: string})
-- 'trade_created' - User created a trade
-- 'trade_updated' - User updated a trade
-- 'trade_deleted' - User deleted a trade
-- 'item_added' - User added item to inventory
-- 'profile_updated' - User updated profile

SELECT 'Page view tracking indexes created successfully' as status;
