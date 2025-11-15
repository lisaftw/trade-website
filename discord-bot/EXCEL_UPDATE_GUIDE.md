# Excel Bulk Update Feature

## Overview

The Excel bulk update feature allows administrators to update multiple Adopt Me items at once by uploading an Excel spreadsheet. This streamlines the process of updating item values, demand, rarity, and other attributes.

## Commands

### `/excel-update template`
Downloads an example Excel template with sample data to help you get started.

### `/excel-update help`
Shows detailed instructions and formatting guidelines.

### `/excel-update upload`
Uploads and processes an Excel file to update items in the database.

**Options:**
- `file` (required): The Excel file (.xlsx or .xls)
- `dry-run` (optional): Preview changes without updating the database

## Excel Format

### Required Column
- **name**: Item name (must match existing items in database, case-insensitive)

### Optional Columns
You only need to include columns for fields you want to update:

**Value Columns:**
- `rap_value`: Regular Average Price
- `value_fr`: Fly Ride variant
- `value_f`: Fly variant
- `value_r`: Ride variant
- `value_n`: Normal variant
- `value_nfr`: Neon Fly Ride
- `value_nf`: Neon Fly
- `value_nr`: Neon Ride
- `value_mfr`: Mega Fly Ride
- `value_mf`: Mega Fly
- `value_mr`: Mega Ride
- `value_m`: Mega Normal
- `value_h`: Hero variant

**Metadata Columns:**
- `demand`: Demand level (e.g., "High", "Medium", "Low")
- `rarity`: Rarity level (e.g., "Legendary", "Ultra-Rare")
- `section`: Item category (e.g., "Pets", "Vehicles")
- `category`: Additional categorization

## Usage Examples

### Example 1: Update Values Only
\`\`\`
name                | rap_value | value_fr | value_f
Shadow Dragon      | 270000    | 270000   | 135000
Frost Dragon       | 120000    | 120000   | 60000
\`\`\`

### Example 2: Update Demand and Rarity
\`\`\`
name                | demand    | rarity
Bat Dragon         | Very High | Legendary
Parrot             | High      | Legendary
\`\`\`

### Example 3: Comprehensive Update
\`\`\`
name           | rap_value | value_fr | demand | rarity     | section
Shadow Dragon  | 270000    | 270000   | High   | Legendary  | Pets
Giraffe        | 180000    | 180000   | High   | Legendary  | Pets
\`\`\`

## Important Rules

1. **Header Row**: First row must contain column names (case-insensitive)
2. **Item Names**: Must match existing items in the database
3. **Numeric Values**: Must be positive numbers (decimals allowed)
4. **Empty Cells**: Leave blank to skip updating that field
5. **File Size**: Maximum 10MB
6. **Row Limit**: Maximum 1000 items per upload
7. **File Format**: .xlsx or .xls files only

## Workflow

### Step 1: Download Template
\`\`\`
/excel-update template
\`\`\`
This gives you a properly formatted Excel file to start with.

### Step 2: Fill in Your Data
- Keep the header row
- Add/modify rows with your item updates
- Only include columns you want to update
- Remove example rows or replace with your data

### Step 3: Test with Dry Run
\`\`\`
/excel-update upload file:your_file.xlsx dry-run:true
\`\`\`
This shows you what would be updated without making changes.

### Step 4: Apply Updates
\`\`\`
/excel-update upload file:your_file.xlsx
\`\`\`
This applies the updates to the database.

## Error Handling

The bot provides detailed feedback for:
- **Parsing Errors**: Invalid file format, missing headers
- **Validation Errors**: Invalid values, missing required fields
- **Not Found**: Items that don't exist in database
- **Update Failures**: Database errors during update

All errors include row numbers and specific details to help you fix issues.

## Security Features

1. **Admin Only**: Command requires administrator permissions
2. **Validation**: All data is validated before database updates
3. **Dry Run Mode**: Preview changes before applying
4. **Transaction Safety**: Failed updates don't affect other items
5. **Audit Trail**: All updates are timestamped in database

## Tips

- Start with a small batch to test your format
- Use dry-run mode first to catch errors
- Keep item names consistent with database
- Export current data first as a backup reference
- Include only changed values to minimize errors

## Troubleshooting

**"Required column 'name' not found"**
- Ensure first row has a column named "name"
- Check for typos in header row

**"Item not found: [name]"**
- Item doesn't exist in database or name doesn't match
- Check spelling and capitalization
- Use exact names from the website

**"Invalid [field] value"**
- Numeric fields must contain valid numbers
- Remove currency symbols or text from number fields

**"File too large"**
- Split your update into multiple files
- Each file can have up to 1000 items

## Support

For issues or questions about the Excel update feature, contact the bot administrator or check `/excel-update help` for quick reference.
