-- User Inventories table
create table if not exists public.user_inventories (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null references public.profiles(discord_id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(discord_id, item_id)
);

-- Enable RLS
alter table public.user_inventories enable row level security;

-- Users can read their own inventory
drop policy if exists "read_own_inventory" on public.user_inventories;
create policy "read_own_inventory"
on public.user_inventories for select
to authenticated, anon
using (
  exists (
    select 1 from public.sessions s
    where s.discord_id = user_inventories.discord_id
  )
);

-- Users can insert to their own inventory
drop policy if exists "insert_own_inventory" on public.user_inventories;
create policy "insert_own_inventory"
on public.user_inventories for insert
to authenticated, anon
with check (
  exists (
    select 1 from public.sessions s
    where s.discord_id = user_inventories.discord_id
  )
);

-- Users can update their own inventory
drop policy if exists "update_own_inventory" on public.user_inventories;
create policy "update_own_inventory"
on public.user_inventories for update
to authenticated, anon
using (
  exists (
    select 1 from public.sessions s
    where s.discord_id = user_inventories.discord_id
  )
);

-- Users can delete from their own inventory
drop policy if exists "delete_own_inventory" on public.user_inventories;
create policy "delete_own_inventory"
on public.user_inventories for delete
to authenticated, anon
using (
  exists (
    select 1 from public.sessions s
    where s.discord_id = user_inventories.discord_id
  )
);

-- Create index for faster queries
create index if not exists idx_user_inventories_discord_id on public.user_inventories(discord_id);
create index if not exists idx_user_inventories_item_id on public.user_inventories(item_id);
