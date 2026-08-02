-- Web Push subscribers for Daily Resets (PWA).
-- Run after 01_init.sql on the isolated NeverMind Supabase project.

create table if not exists public.subscribers (
  endpoint    text primary key,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),

  constraint subscribers_endpoint_not_blank check (length(trim(endpoint)) > 0),
  constraint subscribers_p256dh_not_blank check (length(trim(p256dh)) > 0),
  constraint subscribers_auth_not_blank check (length(trim(auth)) > 0)
);

create index if not exists subscribers_created_at_idx
  on public.subscribers (created_at desc);

alter table public.subscribers enable row level security;

-- Clients may subscribe (upsert-friendly insert) without reading the full list.
drop policy if exists subscribers_insert_public on public.subscribers;
create policy subscribers_insert_public
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

-- Clients may update their own row when keys rotate (matched by endpoint PK via upsert).
drop policy if exists subscribers_update_public on public.subscribers;
create policy subscribers_update_public
  on public.subscribers
  for update
  to anon, authenticated
  using (true)
  with check (true);

-- Clients may unsubscribe by endpoint.
drop policy if exists subscribers_delete_public on public.subscribers;
create policy subscribers_delete_public
  on public.subscribers
  for delete
  to anon, authenticated
  using (true);

-- No SELECT for anon/authenticated. Cron uses service_role (bypasses RLS).
