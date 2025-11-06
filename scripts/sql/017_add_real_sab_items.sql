-- Add real SAB (Steal a Brainrot) items to MongoDB
-- This script adds authentic brainrot characters from the game

-- First, let's add some popular SAB brainrots across different rarities
-- Note: These are inserted into MongoDB via the API, not directly into Postgres

-- Common Brainrots
-- Noobini Pizzanini, Lirili Larila, Tim Cheese, FluriFlura, Talpa Di Fero

-- Rare Brainrots  
-- Trippi Troppi, Tung Tung Tung Sahur, Gangster Footera, Bandito Bobritto

-- Epic Brainrots
-- Cappuccino Assassino, Brr Brr Patapim, Trulimero Trulicina, Bambini Crostini

-- Legendary Brainrots
-- Burbaloni Loliloli, Chimpazini Bananini, Ballerina Cappuccina, Chef Crabracadabra

-- Mythic Brainrots
-- Frigo Camelo, Orangutini Ananassini, Rhino Toasterino, Bombardiro Crocodilo

-- Brainrot God Tier
-- Coco Elefanto, Girafa Celestre, Gattatino Nyanino, Matteo, Tralalero Tralala

-- Secret Brainrots
-- La Vacca Saturno Saturnita, Chimpanzini Spiderini, Los Tralaleritos, La Grande Combinasion

-- This is a reference file. Actual items should be added via the admin panel or Discord bot
-- using the /additem command with game="SAB"

SELECT 'SAB items should be added via admin panel or Discord bot' as note;
