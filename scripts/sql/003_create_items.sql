-- Create items table for trade values
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game TEXT NOT NULL CHECK (game IN ('MM2', 'SAB', 'GAG', 'Adopt Me')),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rap_value NUMERIC(15, 2) NOT NULL,
  exist_count INTEGER NOT NULL DEFAULT 0,
  change_percent NUMERIC(5, 2) NOT NULL DEFAULT 0,
  rating NUMERIC(3, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 10),
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster game filtering
CREATE INDEX IF NOT EXISTS idx_items_game ON public.items(game);
CREATE INDEX IF NOT EXISTS idx_items_updated ON public.items(last_updated_at DESC);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can view items"
  ON public.items
  FOR SELECT
  USING (true);

-- Only authenticated users can insert/update (for admin functionality)
CREATE POLICY "Authenticated users can insert items"
  ON public.items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON public.items
  FOR UPDATE
  TO authenticated
  USING (true);
