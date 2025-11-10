# Adopt Me Excel Import Guide

This guide explains how to import your Adopt Me pets from the `adm.xlsx` Excel file into the database.

## Prerequisites

1. Your Excel file should be named `adm.xlsx`
2. Place it in the project root directory (same level as `package.json`)

## Excel File Structure

The import script expects the following columns in your Excel file:

| Column Name | Description | Required | Example |
|------------|-------------|----------|---------|
| Name | Pet name | Yes | "Frost Dragon" |
| Section | Category/Tier | Yes | "Legendary" |
| Base Value | Base pet value | Yes | 1000 |
| Neon Value | Neon variant value | Yes | 2200 |
| Mega Value | Mega variant value | Yes | 8500 |
| Rarity | Rarity tier | No | "Legendary" |
| Demand | Demand level | No | "High" |
| Image URL | Image link | No | "https://..." |

**Note:** If your Excel columns have different names, you'll need to update the mapping in `scripts/import-adoptme-excel.ts`

## How to Import

### Step 1: Place Your Excel File
\`\`\`bash
# Make sure adm.xlsx is in the project root
ls adm.xlsx  # Should show the file
\`\`\`

### Step 2: Run the Import Script
\`\`\`bash
npm run import:adoptme
\`\`\`

### Step 3: Verify Import
The script will:
- Read your Excel file
- Clear existing Adopt Me pets (optional - can be disabled)
- Import all pets to MongoDB
- Show a summary of imported pets

Example output:
\`\`\`
Reading Excel file...
Found 150 pets in Excel file
Clearing existing Adopt Me pets...
Importing pets to MongoDB...
Successfully imported 150 Adopt Me pets!

Sample imported pets:
- Shadow Dragon (Legendary): Base=185000, Neon=400000, Mega=1500000
- Bat Dragon (Legendary): Base=165000, Neon=350000, Mega=1300000
- Frost Dragon (Legendary): Base=128000, Neon=280000, Mega=1000000
\`\`\`

## Customizing the Import

### Keep Existing Pets
If you want to add pets without deleting existing ones, edit `scripts/import-adoptme-excel.ts` and comment out this line:
\`\`\`typescript
// await collection.deleteMany({ game: 'Adopt Me' })
\`\`\`

### Different Column Names
If your Excel has different column names, update the mapping in the script:
\`\`\`typescript
{
  name: row['Your Column Name'] || 'Unknown',
  baseValue: Number(row['Your Value Column']) || 0,
  // ... etc
}
\`\`\`

### Multiple Sheets
If your Excel has multiple sheets, change which sheet to read:
\`\`\`typescript
const sheetName = workbook.SheetNames[1] // Use second sheet (index 1)
\`\`\`

## Troubleshooting

### "adm.xlsx file not found"
- Make sure the file is in the project root directory
- Check the filename is exactly `adm.xlsx` (case-sensitive)

### "Cannot connect to MongoDB"
- Verify your `MONGODB_URI` environment variable is set
- Check your MongoDB connection is working

### Wrong Values Imported
- Check your Excel column names match the expected format
- Verify the data types (numbers should be numbers, not text)
- Look at the console output to see what was imported

## After Import

Once imported, your Adopt Me pets will be available:
- In the Adopt Me Calculator: `/adoptme-calculator`
- Via the API: `/api/adoptme/pets`
- In the Discord bot commands
- In the admin panel for editing

You can verify the import by visiting the Adopt Me Calculator page on your website.
