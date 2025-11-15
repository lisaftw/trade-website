-- Fix eggs showing "FR" in section/rarity fields
-- Eggs should not have variants like FR, they should show their actual rarity/section

-- First, let's see what eggs currently have in section/rarity
SELECT name, section, rarity, category
FROM items
WHERE game = 'Adopt Me'
  AND name LIKE '%Egg%'
  AND (section = 'FR' OR rarity = 'FR')
ORDER BY name;

-- Update eggs that have 'FR' in section field
-- Set section to the appropriate value based on egg type
UPDATE items 
SET section = CASE
  WHEN name IN ('Safari Egg', 'Jungle Egg', 'Farm Egg', 'Blue Egg', 'Pink Egg') THEN 'Legendary'
  WHEN name IN ('Christmas Egg', 'Easter 2020 Egg', 'Easter 2019 Egg') THEN 'Legendary'
  WHEN name LIKE '%Royal%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Diamond%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Golden%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Mythic%Egg%' THEN 'Ultra-Rare'
  WHEN name LIKE '%Ocean%Egg%' THEN 'Ultra-Rare'
  WHEN name LIKE '%Fossil%Egg%' THEN 'Ultra-Rare'
  WHEN name IN ('Cracked Egg', 'Pet Egg') THEN 'Common'
  ELSE 'Uncommon'
END
WHERE game = 'Adopt Me'
  AND name LIKE '%Egg%'
  AND section = 'FR';

-- Update eggs that have 'FR' in rarity field
UPDATE items 
SET rarity = CASE
  WHEN name IN ('Safari Egg', 'Jungle Egg', 'Farm Egg', 'Blue Egg', 'Pink Egg') THEN 'Legendary'
  WHEN name IN ('Christmas Egg', 'Easter 2020 Egg', 'Easter 2019 Egg') THEN 'Legendary'
  WHEN name LIKE '%Royal%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Diamond%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Golden%Egg%' THEN 'Legendary'
  WHEN name LIKE '%Mythic%Egg%' THEN 'Ultra-Rare'
  WHEN name LIKE '%Ocean%Egg%' THEN 'Ultra-Rare'
  WHEN name LIKE '%Fossil%Egg%' THEN 'Ultra-Rare'
  WHEN name IN ('Cracked Egg', 'Pet Egg') THEN 'Common'
  ELSE 'Uncommon'
END
WHERE game = 'Adopt Me'
  AND name LIKE '%Egg%'
  AND rarity = 'FR';

-- Verify the changes
SELECT name, section, rarity, category, rap_value
FROM items
WHERE game = 'Adopt Me'
  AND name LIKE '%Egg%'
ORDER BY name
LIMIT 20;
