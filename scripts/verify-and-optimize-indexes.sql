-- Verify that indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('items', 'sessions', 'profiles', 'user_inventories', 'activities', 'trades', 'messages')
ORDER BY tablename, indexname;

-- Update statistics for query planner (CRITICAL after adding indexes)
ANALYZE items;
ANALYZE sessions;
ANALYZE profiles;
ANALYZE user_inventories;
ANALYZE activities;
ANALYZE trades;
ANALYZE messages;

-- Optional: Show table sizes to understand data volume
SELECT 
    schemaname,
    relname AS tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||relname)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;
