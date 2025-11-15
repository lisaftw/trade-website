-- Fix rap_value column precision issue for Adopt Me eggs
-- Step 1: Check current column type and problematic data

-- First, let's see what data types we're working with
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'items' AND column_name = 'rap_value';

-- Check for any NULL or problematic values
SELECT name, rap_value, game
FROM items
WHERE game = 'Adopt Me' 
AND name ILIKE '%egg%'
AND (rap_value IS NULL OR rap_value > 1000)
LIMIT 10;

-- Step 2: Alter the column to support more decimal places
-- Using NUMERIC(10, 6) which supports values up to 9999.999999
ALTER TABLE items 
ALTER COLUMN rap_value TYPE NUMERIC(10, 6);

-- Step 3: Now update the egg values with proper precision
UPDATE items SET rap_value = 0.008 WHERE game = 'Adopt Me' AND name = 'Aztec Egg';
UPDATE items SET rap_value = 0.00065 WHERE game = 'Adopt Me' AND name = 'Garden Egg';
UPDATE items SET rap_value = 0.009 WHERE game = 'Adopt Me' AND name = 'Golden Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Japan Egg';
UPDATE items SET rap_value = 0.48 WHERE game = 'Adopt Me' AND name = 'Jungle Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Moon Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Mistletroll';
UPDATE items SET rap_value = 0.002 WHERE game = 'Adopt Me' AND name = 'Mythic Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'Adopt Me' AND name = 'Ocean Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name = 'Pet Egg';
UPDATE items SET rap_value = 0.2 WHERE game = 'Adopt Me' AND name = 'Pink Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Retired Egg';
UPDATE items SET rap_value = 0.01 WHERE game = 'Adopt Me' AND name = 'Royal Aztec Egg';
UPDATE items SET rap_value = 0.012 WHERE game = 'Adopt Me' AND name = 'Royal Desert Egg';
UPDATE items SET rap_value = 0.0009 WHERE game = 'Adopt Me' AND name = 'Royal Egg';
UPDATE items SET rap_value = 0.0095 WHERE game = 'Adopt Me' AND name = 'Royal Moon Egg';
UPDATE items SET rap_value = 1.3 WHERE game = 'Adopt Me' AND name = 'Safari Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Southeast Asia Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'Adopt Me' AND name = 'Urban Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'Adopt Me' AND name = 'Woodland Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Zodiac Minion Egg';

-- Step 4: Verify all eggs now have correct values
SELECT name, rap_value
FROM items
WHERE game = 'Adopt Me'
AND name ILIKE '%egg%'
ORDER BY rap_value DESC, name;
