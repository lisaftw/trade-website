-- Create sessions table for secure token management
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  discord_id text not null references public.profiles(discord_id) on delete cascade,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

-- Index for faster lookups
create index if not exists idx_sessions_discord_id on public.sessions(discord_id);
create index if not exists idx_sessions_token_expires on public.sessions(token_expires_at);

-- Enable RLS
alter table public.sessions enable row level security;

-- Only service role can manage sessions
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'sessions' and policyname = 'Service role manages sessions'
  ) then
    create policy "Service role manages sessions"
      on public.sessions
      for all
      using (current_setting('request.jwt.claim.role', true) = 'service_role')
      with check (true);
  end if;
end $$;

-- Clean up expired sessions periodically (optional, can be run via cron)
create or replace function public.cleanup_expired_sessions()
returns void
language plpgsql
security definer
as $$
begin
  delete from public.sessions
  where token_expires_at < now() - interval '7 days';
end;
$$;
