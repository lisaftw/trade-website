-- Create messages table for chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id text not null references public.profiles(discord_id) on delete cascade,
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for faster lookups
create index if not exists idx_messages_conversation on public.messages(conversation_id, created_at desc);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_unread on public.messages(conversation_id, is_read) where is_read = false;

-- Enable RLS
alter table public.messages enable row level security;

-- Users can only see messages in their conversations
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can view messages in their conversations'
  ) then
    create policy "Users can view messages in their conversations"
      on public.messages
      for select
      using (
        exists (
          select 1 from public.conversations
          where conversations.id = messages.conversation_id
          and (
            conversations.participant_1_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
            or conversations.participant_2_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
          )
        )
      );
  end if;
end $$;

-- Users can send messages in their conversations
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can send messages'
  ) then
    create policy "Users can send messages"
      on public.messages
      for insert
      with check (
        sender_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
        and exists (
          select 1 from public.conversations
          where conversations.id = messages.conversation_id
          and (
            conversations.participant_1_id = sender_id
            or conversations.participant_2_id = sender_id
          )
        )
      );
  end if;
end $$;

-- Users can mark their own messages as read
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'messages' and policyname = 'Users can update message read status'
  ) then
    create policy "Users can update message read status"
      on public.messages
      for update
      using (
        exists (
          select 1 from public.conversations
          where conversations.id = messages.conversation_id
          and (
            conversations.participant_1_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
            or conversations.participant_2_id = current_setting('request.jwt.claims', true)::json->>'discord_id'
          )
        )
      )
      with check (true);
  end if;
end $$;

-- Function to update conversation's last_message_at timestamp
create or replace function public.update_conversation_timestamp()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.conversations
  set 
    last_message_at = new.created_at,
    updated_at = new.created_at
  where id = new.conversation_id;
  
  return new;
end;
$$;

-- Trigger to automatically update conversation timestamp when message is sent
drop trigger if exists trigger_update_conversation_timestamp on public.messages;
create trigger trigger_update_conversation_timestamp
  after insert on public.messages
  for each row
  execute function public.update_conversation_timestamp();

-- Enable Realtime for messages (for live updates)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
