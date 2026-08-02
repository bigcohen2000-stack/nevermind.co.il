-- NeverMind — user profiles with premium entitlement
-- is_premium is a manual/admin flag for now (no payment provider in Stage 1).
-- Anonymous visitors are treated as non-premium in the app layer.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  is_premium  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_is_premium_idx
  on public.profiles (is_premium)
  where is_premium = true;

alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Optional: allow a signed-in user to upsert their own stub row (is_premium stays false).
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and is_premium = false
  );

-- No public update of is_premium (service role / SQL editor only).
--
-- Grant premium (SQL editor / service role):
--   update public.profiles
--   set is_premium = true, updated_at = now()
--   where id = (
--     select id from auth.users where email = 'user@example.com' limit 1
--   );
