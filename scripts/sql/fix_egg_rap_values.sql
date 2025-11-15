-- Fix Adopt Me egg rap_values with correct game name
-- Run this in Supabase SQL Editor

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
UPDATE items SET rap_value = 0.0005 WHERE game = 'Adopt Me' AND name = 'Cracked Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name = 'Crystal Egg';
UPDATE items SET rap_value = 0.0005 WHERE game = 'Adopt Me' AND name = 'Basic Egg';

-- Verify the updates
SELECT name, rap_value 
FROM items 
WHERE game = 'Adopt Me'
AND name ILIKE '%egg%'
ORDER BY name;
