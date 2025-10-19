-- Profiles extension
alter table if exists public.profiles
  add column if not exists bio text,
  add column if not exists theme_preference text check (theme_preference in ('light','dark','system')) default 'light',
  add column if not exists is_public boolean default true,
  add column if not exists show_email boolean default false,
  add column if not exists show_activity boolean default true;

-- Activity history
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null references public.profiles(discord_id) on delete cascade,
  type text not null, -- e.g. 'login', 'update_profile', 'add_inventory'
  meta jsonb,
  created_at timestamptz not null default now()
);

alter table public.activities enable row level security;

-- RLS: a user can see own activities; others can see only if profile is public and show_activity=true
drop policy if exists "read_own_activities" on public.activities;
create policy "read_own_activities"
on public.activities for select
to authenticated, anon
using (
  exists (
    select 1 from public.sessions s
    where s.discord_id = activities.discord_id
  )
);

-- Public read when profile allows it
drop policy if exists "read_public_activities" on public.activities;
create policy "read_public_activities"
on public.activities for select
to anon, authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.discord_id = activities.discord_id
      and p.is_public = true
      and p.show_activity = true
  )
);

-- Writes via service role only (no public insert/update/delete)
drop policy if exists "write_activities_service_role" on public.activities;
create policy "write_activities_service_role"
on public.activities for all
to service_role
using (true)
with check (true);
