-- Check actual variant values for one Adopt Me item
SELECT 
  name,
  value_f,
  value_r,
  value_n,
  value_fr,
  value_nfr,
  value_m
FROM items
WHERE game = 'Adopt Me'
AND name = 'Bat Dragon'
LIMIT 1;
