-- Add indexes to speed up slow queries

-- Index for game-based queries (used in values pages)
CREATE INDEX IF NOT EXISTS idx_items_game ON items(game);

-- Index for game and rap_value sorting (main query pattern)
CREATE INDEX IF NOT EXISTS idx_items_game_rap_value ON items(game, rap_value DESC NULLS LAST);

-- Index for section filtering in SAB
CREATE INDEX IF NOT EXISTS idx_items_game_section ON items(game, section);

-- Index for item lookups by ID (image proxy route)
CREATE INDEX IF NOT EXISTS idx_items_id ON items(id);

-- Index for name searches
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);

-- Show all indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'items'
ORDER BY indexname;
