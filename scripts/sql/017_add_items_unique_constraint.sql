-- Add unique constraint to items table for migration
-- This ensures we don't duplicate items during migration

-- Drop existing constraint if it exists
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_name_game_unique;

-- Add unique constraint on name + game combination
ALTER TABLE public.items ADD CONSTRAINT items_name_game_unique UNIQUE (name, game);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_items_name_game ON public.items(name, game);
