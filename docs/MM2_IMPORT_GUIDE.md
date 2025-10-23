# MM2 Values Import Guide

This guide explains how to import MM2 item values from the JSON file into your MongoDB database.

## Overview

The import script reads the MM2 values JSON file and automatically:
- Converts item data to the database schema
- Generates proper Roblox thumbnail URLs
- Calculates demand levels based on value and rarity
- Handles chroma variants
- Organizes items by type (Gun, Knife, Pet)

## Running the Import

### Step 1: Ensure MongoDB is Connected

Make sure your `MONGODB_URI` environment variable is set in `.env.local`:

\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trading-db?retryWrites=true&w=majority
\`\`\`

### Step 2: Run the Import Script

\`\`\`bash
npm run import:mm2
\`\`\`

The script will:
1. Read the JSON file from `user_read_only_context/text_attachments/values-V1baU.json`
2. Delete all existing MM2 items from the database
3. Import all items from the JSON file
4. Display import statistics

### Expected Output

\`\`\`
[v0] Starting MM2 values import...
[v0] Found 500 items in JSON file
[v0] Deleted 0 existing MM2 items
[v0] Inserted batch 1: 100 items
[v0] Inserted batch 2: 100 items
[v0] Inserted batch 3: 100 items
[v0] Inserted batch 4: 100 items
[v0] Inserted batch 5: 100 items
[v0] ✅ Successfully imported 500 MM2 items!

📊 Import Statistics:
   Total Items: 500
   Guns: 150
   Knives: 200
   Pets: 150
   Godly Rarity: 75
   Chroma Items: 25
\`\`\`

## Data Mapping

The script maps JSON fields to database fields as follows:

| JSON Field | Database Field | Transformation |
|------------|---------------|----------------|
| `display_name` | `name` | Prefixed with "Chroma" if `chroma: true` |
| `value` | `value` | Direct mapping |
| `item_type` | `section` | Gun, Knife, or Pet |
| `thumbnail` | `image_url` | Converted to Roblox asset URL |
| `rarity` | `rarity` | Direct mapping |
| `chroma` | `name` | Added as prefix if true |
| - | `game` | Set to "MM2" |
| - | `demand` | Calculated based on value/rarity |
| - | `createdAt` | Current timestamp |
| - | `updatedAt` | Current timestamp |

## Demand Calculation

Demand is automatically calculated based on value and rarity:

- **High**: Godly rarity OR value ≥ 1000
- **Medium**: Legendary rarity OR value ≥ 100
- **Low**: Value ≥ 10
- **Very Low**: Value < 10

## Thumbnail URLs

Roblox asset IDs are converted to proper image URLs:

\`\`\`
Input: "12965349193"
Output: "https://www.roblox.com/asset-thumbnail/image?assetId=12965349193&width=420&height=420&format=png"
\`\`\`

## Viewing Imported Items

After import, items will be visible on:
- **Value List**: `/values?game=MM2`
- **Trade Calculator**: `/calculator/trade` (select MM2)
- **In-game Calculator**: `/calculator/ingame` (select MM2)

The website automatically refreshes data every 30 seconds, or you can reload the page to see changes immediately.

## Troubleshooting

**Error: MONGODB_URI not configured**
- Add `MONGODB_URI` to your `.env.local` file
- Restart the development server

**Error: Cannot find JSON file**
- Ensure the file exists at `user_read_only_context/text_attachments/values-V1baU.json`
- Check file permissions

**Items not appearing on website**
- Wait 30 seconds for auto-refresh
- Clear browser cache
- Check MongoDB Compass to verify items were inserted

**Duplicate items**
- The script deletes all existing MM2 items before importing
- If you see duplicates, run the import script again

## Re-importing Data

To update values or re-import:

1. Update the JSON file
2. Run `npm run import:mm2` again
3. The script will delete old data and import fresh data

## Manual Database Access

To view or edit items manually:

1. Open MongoDB Compass
2. Connect using your `MONGODB_URI`
3. Navigate to `trading-db` → `items`
4. Filter by `{ game: "MM2" }`

## Next Steps

After importing:
1. Verify items appear on the website
2. Test the calculators with imported items
3. Use the Discord bot to add/edit individual items
4. Monitor the database for any issues
