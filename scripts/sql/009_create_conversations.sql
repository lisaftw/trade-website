-- Create conversations table for 1-on-1 chats
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  participant_1_id text not null references public.profiles(discord_id) on delete cascade,
  participant_2_id text not null references public.profiles(discord_id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_message_at timestamptz,
  
  -- Ensure unique conversation between two users (order doesn't matter)
  constraint unique_conversation unique (least(participant_1_id, participant_2_id), greatest(participant_1_id, participant_2_id))
);

-- Indexes for faster lookups
create index if not exists idx_conversations_participant_1 on public.conversations(participant_1_id);
create index if not exists idx_conversations_participant_2 on public.conversations(participant_2_id);
create index if not exists idx_conversations_last_message on public.conversations(last_message_at desc);

-- Enable RLS
alter table public.conversations enable row level security;

-- Users can only see conversations they're part of
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'conversations' and policyname = 'Users can view their conversations'
  ) then
    create policy "Users can view their conversations"
      on public.conversations
      for select
      using (
        participant_1_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
        or participant_2_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
      );
  end if;
end $$;

-- Users can create conversations
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'conversations' and policyname = 'Users can create conversations'
  ) then
    create policy "Users can create conversations"
      on public.conversations
      for insert
      with check (
        participant_1_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
        or participant_2_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
      );
  end if;
end $$;
