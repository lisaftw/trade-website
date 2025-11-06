-- Create trade interactions table for messaging and trade requests
CREATE TABLE IF NOT EXISTS public.trade_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id text NOT NULL REFERENCES public.profiles(discord_id) ON DELETE CASCADE,
  trade_id uuid NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  message text,
  status text DEFAULT 'pending', -- pending, accepted, rejected, completed
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trade_interactions_trade_id ON public.trade_interactions(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_interactions_initiator_id ON public.trade_interactions(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trade_interactions_status ON public.trade_interactions(status);

-- Enable RLS
ALTER TABLE public.trade_interactions ENABLE ROW LEVEL SECURITY;

-- Users can view interactions on their trades
CREATE POLICY "Users can view interactions on their trades"
ON public.trade_interactions
FOR SELECT
USING (
  initiator_id = auth.uid()::text OR
  trade_id IN (SELECT id FROM public.trades WHERE discord_id = auth.uid()::text)
);

-- Users can create interactions
CREATE POLICY "Authenticated users can create interactions"
ON public.trade_interactions
FOR INSERT
WITH CHECK (initiator_id = auth.uid()::text);

-- Users can update their own interactions
CREATE POLICY "Users can update own interactions"
ON public.trade_interactions
FOR UPDATE
USING (
  initiator_id = auth.uid()::text OR
  trade_id IN (SELECT id FROM public.trades WHERE discord_id = auth.uid()::text)
);
