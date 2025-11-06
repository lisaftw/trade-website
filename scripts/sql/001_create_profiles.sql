-- Create table
create table if not exists public.profiles (
  id bigint generated always as identity primary key,
  discord_id text unique not null,
  username text,
  global_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Allow everyone to select profiles (you can tighten this later)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Read profiles for all'
  ) then
    create policy "Read profiles for all"
      on public.profiles
      for select
      using (true);
  end if;
end $$;

-- Optional: Only allow inserts/updates via service role (anon cannot modify)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Modify profiles via service role'
  ) then
    create policy "Modify profiles via service role"
      on public.profiles
      for all
      using (current_setting('request.jwt.claim.role', true) = 'service_role')
      with check (true);
  end if;
end $$;
