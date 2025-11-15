-- Update remaining eggs that still show 0.00 rap_value
-- Run this in Supabase SQL Editor

-- Update eggs that were missing from previous script
UPDATE items SET rap_value = 0.0009 WHERE game = 'Adopt Me' AND name = 'Royal Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Southeast Asia Egg';
UPDATE items SET rap_value = 0.0025 WHERE game = 'Adopt Me' AND name = 'Urban Egg';
UPDATE items SET rap_value = 0.0015 WHERE game = 'Adopt Me' AND name = 'Woodland Egg';
UPDATE items SET rap_value = 0.001 WHERE game = 'Adopt Me' AND name = 'Zodiac Minion Egg';

-- Handle potential name variations
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Striped Eggy'; -- Check spreadsheet for correct value
UPDATE items SET rap_value = 0.0003 WHERE game = 'Adopt Me' AND name LIKE '%Pet Egg%';
UPDATE items SET rap_value = 0.0006 WHERE game = 'Adopt Me' AND name LIKE '%Retired Egg%';
UPDATE items SET rap_value = 0.00065 WHERE game = 'Adopt Me' AND name LIKE '%Garden Egg%';

-- Also update any eggs with "Eggnog" in name (saw these in console logs)
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name LIKE '%Eggnog Dog%';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name LIKE '%Eggnog Hare%';

-- Update other common eggs that might be missing
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Basic Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Cracked Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Crystal Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Danger Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Desert Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Dotted Eggy';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Floral Eggy';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Fool Egg';
UPDATE items SET rap_value = 0.14 WHERE game = 'Adopt Me' AND name = 'Christmas Egg';
UPDATE items SET rap_value = 0.00 WHERE game = 'Adopt Me' AND name = 'Christmas Future Egg';
UPDATE items SET rap_value = 0.2 WHERE game = 'Adopt Me' AND name = 'Pink Egg';

-- Verify all eggs now have correct values
SELECT name, rap_value 
FROM items 
WHERE game = 'Adopt Me' 
AND name ILIKE '%egg%'
ORDER BY rap_value DESC, name;
