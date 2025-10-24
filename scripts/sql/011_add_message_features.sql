-- Add fields for message editing, reactions, and replies
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '[]'::jsonb;

-- Index for replies
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON public.messages(reply_to) WHERE reply_to IS NOT NULL;

-- Index for reactions
CREATE INDEX IF NOT EXISTS idx_messages_reactions ON public.messages USING GIN (reactions) WHERE reactions != '[]'::jsonb;
