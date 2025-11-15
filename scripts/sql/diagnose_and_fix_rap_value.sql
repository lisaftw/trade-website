-- Step 1: Check current data range to determine appropriate precision
SELECT 
  MAX(rap_value) as max_value,
  MIN(rap_value) as min_value,
  COUNT(*) as total_items
FROM items;

-- Step 2: Check current column type
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'items' 
AND column_name = 'rap_value';

-- Step 3: Alter column to support large values with 6 decimal places
-- NUMERIC(16, 6) supports values up to 9,999,999,999.999999
ALTER TABLE items 
ALTER COLUMN rap_value TYPE NUMERIC(16, 6);

-- Step 4: Now update all egg values with proper precision
UPDATE items SET rap_value = 0.008 WHERE game = 'Adopt Me' AND name = 'Aztec Egg';
UPDATE items SET rap_value = 0.00065 WHERE game = 'Adopt Me' AND name = 'Garden Egg';
UPDATE items SET rap_value = 0.009 WHERE game = 'Adopt Me' AND name = 'Golden Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Japan Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Moon Egg';
UPDATE items SET rap_value = 0.002 WHERE game = 'Adopt Me' AND name = 'Mythic Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'Adopt Me' AND name = 'Ocean Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Pet Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Retired Egg';
UPDATE items SET rap_value = 0.0009 WHERE game = 'Adopt Me' AND name = 'Royal Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Southeast Asia Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'Adopt Me' AND name = 'Urban Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'Adopt Me' AND name = 'Woodland Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Zodiac Minion Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Cracked Egg';
UPDATE items SET rap_value = 0.00065 WHERE game = 'Adopt Me' AND name = 'Basic Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Crystal Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Danger Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Desert Egg';
UPDATE items SET rap_value = 0.0005 WHERE game = 'Adopt Me' AND name = 'Fool Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Eggnog Dog';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Eggnog Hare';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Floral Eggy';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Dotted Eggy';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Christmas Future Egg';

-- Step 5: Verify all eggs now have correct values (including tiny decimals)
SELECT name, rap_value
FROM items
WHERE game = 'Adopt Me'
AND name ILIKE '%egg%'
ORDER BY rap_value DESC, name;
