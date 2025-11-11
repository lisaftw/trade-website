-- Add section column to items table for SAB rarity filtering
ALTER TABLE items ADD COLUMN IF NOT EXISTS section TEXT;

-- Create index for section-based queries
CREATE INDEX IF NOT EXISTS idx_items_game_section ON items(game, section);
CREATE INDEX IF NOT EXISTS idx_items_game_section_rapvalue ON items(game, section, rap_value DESC);
