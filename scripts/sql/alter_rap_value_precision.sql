-- Fix Adopt Me egg rap_value precision issue
-- The rap_value column needs more decimal places to store small egg values

-- Step 1: Alter the rap_value column to support 6 decimal places
ALTER TABLE items 
ALTER COLUMN rap_value TYPE NUMERIC(12, 6);

-- Step 2: Now update all the egg values with proper precision
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
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Basic Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Cracked Egg';
UPDATE items SET rap_value = 0.14 WHERE game = 'Adopt Me' AND name = 'Christmas Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Christmas Future Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Crystal Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Danger Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Desert Egg';
UPDATE items SET rap_value = 0.02 WHERE game = 'Adopt Me' AND name = 'Easter 2020 Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Eggnog Dog';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Eggnog Hare';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Floral Eggy';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Fool Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Dotted Eggy';

-- Step 3: Verify the updates worked
SELECT name, rap_value
FROM items
WHERE game = 'Adopt Me'
AND name ILIKE '%egg%'
ORDER BY rap_value DESC, name;
