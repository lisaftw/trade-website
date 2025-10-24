-- Create trades table for trade listings
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  game text NOT NULL,
  offering jsonb NOT NULL, -- Array of item names being offered
  requesting jsonb NOT NULL, -- Array of item names being requested
  notes text,
  status text DEFAULT 'active', -- active, completed, cancelled
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trades_game ON public.trades(game);
CREATE INDEX IF NOT EXISTS idx_trades_discord_id ON public.trades(discord_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON public.trades(created_at DESC);

-- Enable RLS
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Updated RLS policies to work with custom Discord OAuth session system
-- Anyone can view active trades
DROP POLICY IF EXISTS "Anyone can view active trades" ON public.trades;
CREATE POLICY "Anyone can view active trades"
ON public.trades
FOR SELECT
USING (status = 'active');

-- Service role can manage all trades (for API endpoints)
DROP POLICY IF EXISTS "Service role can manage trades" ON public.trades;
CREATE POLICY "Service role can manage trades"
ON public.trades
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anon role to insert trades (API will validate session)
DROP POLICY IF EXISTS "Anon can create trades" ON public.trades;
CREATE POLICY "Anon can create trades"
ON public.trades
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anon role to update trades (API will validate session)
DROP POLICY IF EXISTS "Anon can update trades" ON public.trades;
CREATE POLICY "Anon can update trades"
ON public.trades
FOR UPDATE
TO anon
USING (true);

-- Allow anon role to delete trades (API will validate session)
DROP POLICY IF EXISTS "Anon can delete trades" ON public.trades;
CREATE POLICY "Anon can delete trades"
ON public.trades
FOR DELETE
TO anon
USING (true);
