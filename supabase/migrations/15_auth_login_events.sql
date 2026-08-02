-- NeverMind — auth login events for Studio analytics
-- Written from /auth/callback via service role. No public read/write.

create extension if not exists "pgcrypto";

create table if not exists public.auth_login_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  email       text,
  event_type  text not null default 'login',
  user_agent  text,
  created_at  timestamptz not null default now(),

  constraint auth_login_events_type_not_blank
    check (length(trim(event_type)) > 0)
);

create index if not exists auth_login_events_created_at_idx
  on public.auth_login_events (created_at desc);

create index if not exists auth_login_events_user_id_idx
  on public.auth_login_events (user_id, created_at desc);

alter table public.auth_login_events enable row level security;

-- No anon/authenticated policies: inserts and reads go through service role only.
