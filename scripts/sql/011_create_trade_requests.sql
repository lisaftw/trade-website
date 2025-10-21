-- Create trade_requests table for users to post trade offers/requests
create table if not exists public.trade_requests (
  id uuid primary key default gen_random_uuid(),
  creator_id text not null references public.profiles(discord_id) on delete cascade,
  game text not null, -- MM2, SAB, GAG, Adopt Me
  type text not null check (type in ('offer', 'request')), -- offering or requesting
  item_name text not null,
  item_value numeric,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_trade_requests_creator on public.trade_requests(creator_id);
create index if not exists idx_trade_requests_game on public.trade_requests(game);
create index if not exists idx_trade_requests_status on public.trade_requests(status);
create index if not exists idx_trade_requests_created on public.trade_requests(created_at desc);

-- Enable RLS
alter table public.trade_requests enable row level security;

-- Everyone can view active trade requests
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trade_requests' and policyname = 'Anyone can view active trade requests'
  ) then
    create policy "Anyone can view active trade requests"
      on public.trade_requests
      for select
      using (true);
  end if;
end $$;

-- Users can create their own trade requests
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trade_requests' and policyname = 'Users can create trade requests'
  ) then
    create policy "Users can create trade requests"
      on public.trade_requests
      for insert
      with check (creator_id = current_setting('request.jwt.claims', true)::json->>'discord_id');
  end if;
end $$;

-- Users can update their own trade requests
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trade_requests' and policyname = 'Users can update their trade requests'
  ) then
    create policy "Users can update their trade requests"
      on public.trade_requests
      for update
      using (creator_id = current_setting('request.jwt.claims', true)::json->>'discord_id')
      with check (creator_id = current_setting('request.jwt.claims', true)::json->>'discord_id');
  end if;
end $$;

-- Users can delete their own trade requests
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'trade_requests' and policyname = 'Users can delete their trade requests'
  ) then
    create policy "Users can delete their trade requests"
      on public.trade_requests
      for delete
      using (creator_id = current_setting('request.jwt.claims', true)::json->>'discord_id');
  end if;
end $$;
