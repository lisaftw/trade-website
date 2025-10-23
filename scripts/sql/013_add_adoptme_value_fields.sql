-- MongoDB script to add neon_value and mega_value fields to Adopt Me items
-- Run this in MongoDB Compass or mongosh

-- Example: Update a specific pet with neon and mega values
-- db.items.updateOne(
--   { name: "Frost Dragon", game: "Adopt Me" },
--   { 
--     $set: { 
--       neon_value: 2200,
--       mega_value: 8500,
--       fly_bonus: 50,
--       ride_bonus: 50
--     } 
--   }
-- )

-- Bulk update template for multiple pets
-- db.items.updateMany(
--   { game: "Adopt Me" },
--   { 
--     $set: { 
--       fly_bonus: 50,
--       ride_bonus: 50
--     } 
--   }
-- )

-- To set neon/mega values for specific pets, use this pattern:
-- db.items.updateOne(
--   { name: "PET_NAME", game: "Adopt Me" },
--   { $set: { neon_value: NEON_VALUE, mega_value: MEGA_VALUE } }
-- )

-- Example pets with typical value ratios (adjust based on actual market):
-- Common pets: neon ~2x base, mega ~6-8x base
-- Legendary pets: neon ~2-2.5x base, mega ~8-12x base
-- High demand pets: Values vary significantly, must be set manually

-- Sample updates (replace with your actual values):
/*
db.items.updateOne(
  { name: "Shadow Dragon", game: "Adopt Me" },
  { $set: { value: 5000, neon_value: 12000, mega_value: 48000 } }
)

db.items.updateOne(
  { name: "Bat Dragon", game: "Adopt Me" },
  { $set: { value: 4500, neon_value: 10000, mega_value: 40000 } }
)

db.items.updateOne(
  { name: "Giraffe", game: "Adopt Me" },
  { $set: { value: 3500, neon_value: 8000, mega_value: 32000 } }
)
*/
