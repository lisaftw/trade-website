-- Update rap_values for eggs with small decimal values
-- Based on current market values

-- Fixed table name from adoptme_items to items
UPDATE items SET rap_value = 0.00065 WHERE name = 'Garden Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.009 WHERE name = 'Golden Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.001 WHERE name = 'Japan Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.48 WHERE name = 'Jungle Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.001 WHERE name = 'Mistletroll' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0006 WHERE name = 'Moon Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.002 WHERE name = 'Mythic Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0025 WHERE name = 'Ocean Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0003 WHERE name = 'Pet Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.2 WHERE name = 'Pink Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0006 WHERE name = 'Retired Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.008 WHERE (name = 'Royal Aztec Egg' OR name = 'Aztec Egg') AND game = 'adoptme';
UPDATE items SET rap_value = 0.012 WHERE name = 'Royal Desert Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0009 WHERE name = 'Royal Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0095 WHERE name = 'Royal Moon Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 1.3 WHERE name = 'Safari Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.001 WHERE name = 'Southeast Asia Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0025 WHERE name = 'Urban Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.0015 WHERE name = 'Woodland Egg' AND game = 'adoptme';
UPDATE items SET rap_value = 0.001 WHERE name = 'Zodiac Minion Egg' AND game = 'adoptme';

-- Verify the updates
SELECT name, rap_value FROM items WHERE game = 'adoptme' AND name IN (
  'Garden Egg', 'Golden Egg', 'Japan Egg', 'Aztec Egg', 'Royal Aztec Egg', 
  'Pet Egg', 'Moon Egg', 'Royal Moon Egg'
) ORDER BY name;
