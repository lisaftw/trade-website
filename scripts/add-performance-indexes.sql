-- Add indexes to improve query performance for frequently accessed columns
-- This will significantly speed up queries on sessions, profiles, items, and inventories

-- Index for profiles lookup by discord_id (105ms -> <10ms)
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON profiles(discord_id);

-- Index for sessions lookup by discord_id
CREATE INDEX IF NOT EXISTS idx_sessions_discord_id ON sessions(discord_id);

-- Index for sessions last_activity_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity_at);

-- Composite index for user_inventories lookup by discord_id and item_id (553ms -> <10ms)
CREATE INDEX IF NOT EXISTS idx_user_inventories_discord_item ON user_inventories(discord_id, item_id);

-- Index for user_inventories by discord_id only (for listing all user items)
CREATE INDEX IF NOT EXISTS idx_user_inventories_discord_id ON user_inventories(discord_id);

-- Index for items by game (507-949ms -> <50ms)
CREATE INDEX IF NOT EXISTS idx_items_game ON items(game);

-- Index for items by rap_value for sorting (helps with ORDER BY rap_value DESC)
CREATE INDEX IF NOT EXISTS idx_items_rap_value ON items(rap_value DESC NULLS LAST);

-- Composite index for items by game and rap_value (fastest for filtered + sorted queries)
CREATE INDEX IF NOT EXISTS idx_items_game_rap_value ON items(game, rap_value DESC NULLS LAST);

-- Index for activities by discord_id
CREATE INDEX IF NOT EXISTS idx_activities_discord_id ON activities(discord_id);

-- Index for activities by created_at for recent activity queries
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Index for trades by discord_id
CREATE INDEX IF NOT EXISTS idx_trades_discord_id ON trades(discord_id);

-- Index for trades by game
CREATE INDEX IF NOT EXISTS idx_trades_game ON trades(game);

-- Index for trades by status
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

-- Index for trades by created_at for recent trades
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);

-- Index for conversations participants
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON conversations(participant_2_id);

-- Index for messages by conversation_id
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Index for messages by sender_id
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
