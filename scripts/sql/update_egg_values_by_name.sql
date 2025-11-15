-- Update Adopt Me egg values directly by name
-- Run this in Supabase SQL Editor

UPDATE items SET rap_value = 0.00065 WHERE game = 'adoptme' AND name = 'Garden Egg';
UPDATE items SET rap_value = 0.009 WHERE game = 'adoptme' AND name = 'Golden Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Japan Egg';
UPDATE items SET rap_value = 0.48 WHERE game = 'adoptme' AND name = 'Jungle Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Mistletroll';
UPDATE items SET rap_value = 0.0006 WHERE game = 'adoptme' AND name = 'Moon Egg';
UPDATE items SET rap_value = 0.002 WHERE game = 'adoptme' AND name = 'Mythic Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'adoptme' AND name = 'Ocean Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'adoptme' AND name = 'Pet Egg';
UPDATE items SET rap_value = 0.2 WHERE game = 'adoptme' AND name = 'Pink Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'adoptme' AND name = 'Retired Egg';
UPDATE items SET rap_value = 0.008 WHERE game = 'adoptme' AND name = 'Royal Aztec Egg';
UPDATE items SET rap_value = 0.012 WHERE game = 'adoptme' AND name = 'Royal Desert Egg';
UPDATE items SET rap_value = 0.0009 WHERE game = 'adoptme' AND name = 'Royal Egg';
UPDATE items SET rap_value = 0.0095 WHERE game = 'adoptme' AND name = 'Royal Moon Egg';
UPDATE items SET rap_value = 1.3 WHERE game = 'adoptme' AND name = 'Safari Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Southeast Asia Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'adoptme' AND name = 'Urban Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'adoptme' AND name = 'Woodland Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Zodiac Minion Egg';
UPDATE items SET rap_value = 0.008 WHERE game = 'adoptme' AND name = 'Aztec Egg';
UPDATE items SET rap_value = 0.0003 WHERE game = 'adoptme' AND name = 'Basic Egg';
UPDATE items SET rap_value = 0.003 WHERE game = 'adoptme' AND name = 'Christmas Future Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'adoptme' AND name = 'Cracked Egg';
UPDATE items SET rap_value = 0.002 WHERE game = 'adoptme' AND name = 'Crystal Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'adoptme' AND name = 'Danger Egg';
UPDATE items SET rap_value = 0.0008 WHERE game = 'adoptme' AND name = 'Desert Egg';
UPDATE items SET rap_value = 0.0005 WHERE game = 'adoptme' AND name = 'Fool Egg';
UPDATE items SET rap_value = 0.00065 WHERE game = 'adoptme' AND name = 'Garden Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Japan Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'adoptme' AND name = 'Moon Egg';
UPDATE items SET rap_value = 0.002 WHERE game = 'adoptme' AND name = 'Mythic Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'adoptme' AND name = 'Ocean Egg';
UPDATE items SET rap_value = 0.0006 WHERE game = 'adoptme' AND name = 'Retired Egg';
UPDATE items SET rap_value = 0.0009 WHERE game = 'adoptme' AND name = 'Royal Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Southeast Asia Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'adoptme' AND name = 'Urban Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'adoptme' AND name = 'Woodland Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'adoptme' AND name = 'Zodiac Minion Egg';

-- Verify the updates
SELECT name, rap_value 
FROM items 
WHERE game = 'adoptme' 
AND name ILIKE '%egg%'
ORDER BY name;
