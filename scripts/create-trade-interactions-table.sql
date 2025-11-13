-- Create trade_interactions table for managing trade requests
CREATE TABLE IF NOT EXISTS trade_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL,
  initiator_id TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_trade FOREIGN KEY (trade_id) REFERENCES trades(id) ON DELETE CASCADE,
  CONSTRAINT fk_initiator FOREIGN KEY (initiator_id) REFERENCES profiles(discord_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trade_interactions_trade_id ON trade_interactions(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_interactions_initiator_id ON trade_interactions(initiator_id);
CREATE INDEX IF NOT EXISTS idx_trade_interactions_status ON trade_interactions(status);

-- Enable RLS
ALTER TABLE trade_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view trade interactions"
  ON trade_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create trade interactions"
  ON trade_interactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can manage trade interactions"
  ON trade_interactions FOR ALL
  TO service_role
  USING (true);

-- Add comment
COMMENT ON TABLE trade_interactions IS 'Stores trade request messages and interactions between users';
