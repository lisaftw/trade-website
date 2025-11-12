-- Optimize the slow "SELECT * FROM items WHERE game = $1 ORDER BY rap_value DESC NULLS LAST" query
-- Create a composite index that covers both the filter and the sort

-- Drop existing indexes that might conflict
DROP INDEX IF EXISTS idx_items_game_rap_value;

-- Create optimized composite index for game filtering + rap_value sorting
-- NULLS LAST is built into the index definition
CREATE INDEX idx_items_game_rap_value_opt ON items (game, rap_value DESC NULLS LAST);

-- Update statistics for the query planner
ANALYZE items;

-- Verify the index was created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'items' 
AND indexname = 'idx_items_game_rap_value_opt';
