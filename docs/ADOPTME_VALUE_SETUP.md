# Adopt Me Calculator - Value Setup Guide

The Adopt Me calculator is integrated with your existing value list (items database). This guide explains how to set up NFR (Neon Fly Ride) and MFR (Mega Fly Ride) values.

## Database Structure

Each Adopt Me pet in your `items` collection should have these fields:

\`\`\`javascript
{
  name: "Pet Name",
  game: "Adopt Me",
  value: 1000,           // Base pet value (normal, no potions)
  neon_value: 2200,      // Neon variant value (manually set)
  mega_value: 8500,      // Mega variant value (manually set)
  fly_bonus: 50,         // Bonus value for Fly potion (default: 50)
  ride_bonus: 50,        // Bonus value for Ride potion (default: 50)
  image_url: "...",
  section: "Legendary",
  rarity: "Legendary",
  demand: "High"
}
\`\`\`

## How Values Work

### Base Value
- The normal pet value without any potions or variants
- Field: `value` or `rap_value`

### Neon Value (NFR)
- **NOT calculated automatically** - must be manually set
- Typically ~2× base value, but varies significantly by pet
- Field: `neon_value`
- Requires 4 identical pets to create in-game

### Mega Value (MFR)
- **NOT calculated automatically** - must be manually set
- Typically ~8-12× base value, but varies significantly by pet
- Field: `mega_value`
- Requires 4 identical Neon pets to create in-game

### Potion Bonuses
- **Fly Potion**: Adds `fly_bonus` to the value (default: 50)
- **Ride Potion**: Adds `ride_bonus` to the value (default: 50)
- Can be combined: Fly Ride adds both bonuses

## Setting Values

### Using MongoDB Compass or mongosh

\`\`\`javascript
// Update a single pet with neon and mega values
db.items.updateOne(
  { name: "Frost Dragon", game: "Adopt Me" },
  { 
    $set: { 
      value: 1000,
      neon_value: 2200,
      mega_value: 8500,
      fly_bonus: 50,
      ride_bonus: 50
    } 
  }
)

// Bulk update multiple pets
const pets = [
  { name: "Shadow Dragon", value: 5000, neon_value: 12000, mega_value: 48000 },
  { name: "Bat Dragon", value: 4500, neon_value: 10000, mega_value: 40000 },
  { name: "Giraffe", value: 3500, neon_value: 8000, mega_value: 32000 }
]

pets.forEach(pet => {
  db.items.updateOne(
    { name: pet.name, game: "Adopt Me" },
    { $set: pet }
  )
})
\`\`\`

### Using Discord Bot Commands

If you have Discord bot integration:

\`\`\`
!edititem "Frost Dragon" value 1000
!edititem "Frost Dragon" neon_value 2200
!edititem "Frost Dragon" mega_value 8500
\`\`\`

## Value Calculation Examples

### Example 1: Normal Frost Dragon
- Base: 1000
- **Total: 1000**

### Example 2: Fly Ride Frost Dragon (FR)
- Base: 1000
- Fly Bonus: +50
- Ride Bonus: +50
- **Total: 1100**

### Example 3: Neon Frost Dragon (N)
- Neon Value: 2200
- **Total: 2200**

### Example 4: Neon Fly Ride Frost Dragon (NFR)
- Neon Value: 2200
- Fly Bonus: +50
- Ride Bonus: +50
- **Total: 2300**

### Example 5: Mega Fly Ride Frost Dragon (MFR)
- Mega Value: 8500
- Fly Bonus: +50
- Ride Bonus: +50
- **Total: 8600**

## Important Notes

1. **Manual Values Required**: Neon and Mega values MUST be set manually for each pet. The calculator will show a warning if these values are missing.

2. **Market Variations**: Values vary significantly based on:
   - Pet rarity and demand
   - Current market trends
   - Seasonal events
   - Game updates

3. **No Automatic Calculation**: The calculator does NOT multiply base values to get neon/mega values. Each variant must have its own value set in the database.

4. **Potion Bonuses**: Fly and Ride bonuses can be customized per pet if needed, but default to 50 each.

## Checking Current Values

To see which pets are missing neon/mega values:

\`\`\`javascript
// Find pets without neon values
db.items.find({ 
  game: "Adopt Me", 
  $or: [
    { neon_value: { $exists: false } },
    { neon_value: 0 }
  ]
})

// Find pets without mega values
db.items.find({ 
  game: "Adopt Me", 
  $or: [
    { mega_value: { $exists: false } },
    { mega_value: 0 }
  ]
})
\`\`\`

## Calculator Display

The calculator shows:
- **Short Name**: NFR Dragon, MFR Unicorn, F Turtle, R Kangaroo
- **Full Name**: Neon Fly Ride Dragon, Mega Fly Ride Unicorn, Fly Turtle, Ride Kangaroo
- **Value Breakdown**: Shows base/neon/mega value + potion bonuses
- **Multiplier**: Shows how neon/mega values compare to base (e.g., "2.2× base")
- **Warnings**: Alerts when neon/mega values are not set

## Support

If you need help setting up values or have questions about the calculator, please contact your admin team.
