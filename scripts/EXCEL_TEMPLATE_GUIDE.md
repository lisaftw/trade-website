# Adopt Me Excel Template Guide

## Your Column Structure

Your Excel file must have these **16 columns** in this exact order:

| # | Column Name | Type | Description | Example |
|---|------------|------|-------------|---------|
| 1 | **Pet Name** | Text | Pet/item name | "Shadow Dragon" |
| 2 | **Image URL** | URL | Direct link to pet image | "https://cdn.example.com/pet.png" |
| 3 | **Rarity** | Text | Rarity tier | "Legendary", "Ultra-Rare", "Rare" |
| 4 | **Demand** | Text | Demand level | "Very High", "High", "Medium", "Low" |
| 5 | **Base Value (No Pot)** | Number | Base value without potions | 270000 |
| 6 | **FR** | Number | Fly Ride value | 275000 |
| 7 | **F** | Number | Fly only value | 272500 |
| 8 | **R** | Number | Ride only value | 272500 |
| 9 | **NFR** | Number | Neon Fly Ride value | 810000 |
| 10 | **NF** | Number | Neon Fly value | 815000 |
| 11 | **NR** | Number | Neon Ride value | 815000 |
| 12 | **N** | Number | Neon (no potion) value | 810000 |
| 13 | **MFR** | Number | Mega Fly Ride value | 2430000 |
| 14 | **MF** | Number | Mega Fly value | 2445000 |
| 15 | **MR** | Number | Mega Ride value | 2445000 |
| 16 | **M** | Number | Mega (no potion) value | 2430000 |

## Important Rules

### ✅ DO:
- Use the **exact column names** shown above (case-sensitive)
- Put column names in the **first row**
- Use **numbers only** for values (no commas, no dollar signs)
- Fill in all 16 columns for each pet
- Use consistent rarity names

### ❌ DON'T:
- Don't use commas in numbers (❌ "270,000" → ✅ "270000")
- Don't use dollar signs (❌ "$270000" → ✅ "270000")
- Don't change column names or order
- Don't skip columns
- Don't leave Pet Name empty

## Understanding Potion Values

**Base Values (Columns 5-8):**
- **No Pot**: Base pet without any potions
- **FR**: Fly + Ride potions (usually highest value)
- **F**: Fly potion only
- **R**: Ride potion only

**Neon Values (Columns 9-12):**
- **NFR**: Neon with Fly + Ride
- **NF**: Neon with Fly only
- **NR**: Neon with Ride only
- **N**: Neon without potions

**Mega Values (Columns 13-16):**
- **MFR**: Mega with Fly + Ride
- **MF**: Mega with Fly only
- **MR**: Mega with Ride only
- **M**: Mega without potions

## Typical Value Patterns

- FR values are usually 2-5% higher than No Pot
- F and R values are usually 1-2.5% higher than No Pot
- Neon is typically 3x base value
- Mega is typically 3x neon value (or 9x base)

## Example Row

\`\`\`
Pet Name: Shadow Dragon
Image URL: https://example.com/shadow-dragon.png
Rarity: Legendary
Demand: Very High
Base Value (No Pot): 270000
FR: 275000
F: 272500
R: 272500
NFR: 810000
NF: 825000
NR: 815000
N: 810000
MFR: 2430000
MF: 2475000
MR: 2445000
M: 2430000
\`\`\`

## How to Use

1. **Open the template:** Open `adoptme-template.csv` in Excel or Google Sheets
2. **Fill in your data:** Add all your pets following the 16-column format
3. **Save as Excel:** Save the file as `adm.xlsx` in the project root directory
4. **Run import:** Execute `npm run import:adoptme` in your terminal

## Tips

- **Start with template:** Use the provided CSV as a starting point
- **Copy format:** Copy the example rows and modify the values
- **Consistent naming:** Use the same spelling for rarity/demand across all pets
- **Test first:** Import a few pets first to verify everything works
- **Backup:** Keep a backup of your Excel file before importing

## Troubleshooting

**"Column not found" error:**
- Verify all 16 column names match exactly (case-sensitive)
- Check that column names are in the first row
- Make sure there are no extra spaces in column names

**"Invalid value" error:**
- Remove all commas from numbers
- Remove all dollar signs
- Ensure all value columns contain numbers

**"Missing Pet Name" error:**
- Every row must have a Pet Name in column 1
- Delete any empty rows at the bottom of your sheet

## Need Help?

Check the console output when running the import - it will show:
- How many pets were found
- Any validation errors with row numbers
- A summary of imported pets by rarity
- Sample imported pets with their values
</markdown>
