-- Check if Adopt Me items have variant values
SELECT 
  name,
  value_f,
  value_r,
  value_n,
  value_fr,
  value_nfr,
  value_m
FROM items
WHERE game = 'adoptme'
LIMIT 10;
