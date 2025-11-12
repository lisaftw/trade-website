# Discord Bot Item Search Guide

The bot's `/edititem` and `/removeitem` commands use smart search autocomplete to help you find items quickly from 800-900 items.

## How to Use Search

### 1. Select the Game
First, choose the game (MM2, SAB, or Adopt Me) from the dropdown.

### 2. Type to Search
In the item field, type at least **2 characters** to start searching:
- Type "chroma" to find all Chroma items
- Type "knife" to find all knives
- Type "gun" to find all guns
- Type partial names like "bat" to find "Bat", "BattleAxe", etc.

### 3. Results Display
- Shows up to **25 best matches** sorted by value (highest first)
- Format: `Item Name (Value - Section)`
- Example: `Chroma Evergreen (1325 - Knife)`

### 4. Select Your Item
Click on the item you want to edit or remove from the search results.

## Search Tips

**Be Specific:**
- Instead of "a", try "axe" or "ancient"
- Instead of "c", try "chroma" or "corrupt"

**Use Key Words:**
- Search by item type: "knife", "gun", "pet"
- Search by rarity: "chroma", "ancient", "legendary"
- Search by value range: High-value items appear first

**Common Searches:**
- `chroma` - All chroma items
- `ancient` - All ancient items
- `godly` - All godly items
- `legendary` - Legendary pets (Adopt Me)
- `secret` - Secret items (SAB)

## Troubleshooting

**"Type at least 2 characters to search..."**
- You need to type more characters before results appear

**"No items found matching..."**
- Try different search terms
- Check spelling
- Try shorter/partial names

**"Please select a game first"**
- Make sure you selected a game before searching for items

**"Error during search"**
- The bot might be experiencing issues
- Try again in a few seconds
- Contact an admin if it persists

## Examples

### Edit a Chroma Knife (MM2)
1. `/edititem`
2. Game: `Murder Mystery 2`
3. Item: Type `chroma knife`
4. Select from results like "Chroma Evergreen (1325 - Knife)"
5. Fill in the modal with new values

### Remove a Pet (Adopt Me)
1. `/removeitem`
2. Game: `Adopt Me`
3. Item: Type `shadow`
4. Select "Shadow Dragon" from results
5. Confirm removal

### Edit a Secret Item (SAB)
1. `/edititem`
2. Game: `Steal a Brain Rot`
3. Item: Type `secret`
4. Select from secret items list
5. Update values in modal

## Performance

- Search is **instant** for up to 25 results
- Results are sorted by **value** (highest first)
- Works with **all 800-900 items** in the database
- No pagination needed - just type what you're looking for!
