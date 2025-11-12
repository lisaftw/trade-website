-- Check what games exist in database
SELECT 
  game,
  COUNT(*) as item_count
FROM items
GROUP BY game
ORDER BY game;
