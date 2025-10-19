-- Create trades table for trade listings
CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  game text NOT NULL,
  offering jsonb NOT NULL, -- Array of item IDs being offered
  requesting jsonb NOT NULL, -- Array of item IDs being requested
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

-- Anyone can view active trades
CREATE POLICY "Anyone can view active trades"
ON public.trades
FOR SELECT
USING (status = 'active');

-- Users can view their own trades
CREATE POLICY "Users can view own trades"
ON public.trades
FOR SELECT
USING (auth.uid()::text = discord_id OR status = 'active');

-- Users can create trades
CREATE POLICY "Authenticated users can create trades"
ON public.trades
FOR INSERT
WITH CHECK (auth.uid()::text = discord_id);

-- Users can update their own trades
CREATE POLICY "Users can update own trades"
ON public.trades
FOR UPDATE
USING (auth.uid()::text = discord_id);

-- Users can delete their own trades
CREATE POLICY "Users can delete own trades"
ON public.trades
FOR DELETE
USING (auth.uid()::text = discord_id);
