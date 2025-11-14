-- Add category field to items table for better organization
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- Update existing items: Eggs have no variants (all variant values are NULL)
-- Pets have at least one variant value set
UPDATE items 
SET category = CASE 
  WHEN name ILIKE '%egg%' THEN 'Eggs'
  WHEN value_f IS NOT NULL OR value_r IS NOT NULL OR value_n IS NOT NULL THEN 'Pets'
  ELSE 'Other'
END
WHERE game = 'Adopt Me' AND category IS NULL;
