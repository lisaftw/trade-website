-- Check Safari Egg values in database
SELECT 
  name,
  game,
  value_fr,
  value_n,
  value_f,
  value_r,
  rap_value,
  value_m,
  value_mfr
FROM items
WHERE name ILIKE '%Safari Egg%' AND game = 'Adopt Me';
