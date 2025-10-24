-- Create conversations table for 1-on-1 chats
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id TEXT NOT NULL,
  participant_2_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);

-- Create unique index using expression instead of constraint to ensure unique conversations
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_conversation 
  ON public.conversations (LEAST(participant_1_id, participant_2_id), GREATEST(participant_1_id, participant_2_id));

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Allow service role and anon to manage conversations (API will handle auth)
DROP POLICY IF EXISTS "Allow all operations for service role" ON public.conversations;
CREATE POLICY "Allow all operations for service role"
  ON public.conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);
