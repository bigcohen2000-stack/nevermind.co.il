-- NeverMind — search analytics
-- Target: NEW isolated Supabase project only.
-- Logs search queries for product insight (authenticated + anonymous sessions).

create extension if not exists "pgcrypto";

create table if not exists public.search_analytics (
  id             uuid primary key default gen_random_uuid(),
  search_query   text not null,
  user_id        uuid references auth.users (id) on delete set null,
  session_id     text,
  created_at     timestamptz not null default now(),
  results_count  integer not null default 0,

  constraint search_analytics_query_not_blank
    check (length(trim(search_query)) > 0),
  constraint search_analytics_results_count_nonneg
    check (results_count >= 0)
);

create index if not exists search_analytics_created_at_idx
  on public.search_analytics (created_at desc);

create index if not exists search_analytics_search_query_idx
  on public.search_analytics (search_query);

create index if not exists search_analytics_user_id_idx
  on public.search_analytics (user_id)
  where user_id is not null;

create index if not exists search_analytics_session_id_idx
  on public.search_analytics (session_id)
  where session_id is not null;

-- RLS: clients may insert their own events; reads stay service-role only.
alter table public.search_analytics enable row level security;

drop policy if exists search_analytics_insert_own on public.search_analytics;
create policy search_analytics_insert_own
  on public.search_analytics
  for insert
  to anon, authenticated
  with check (
    user_id is null
    or user_id = (select auth.uid())
  );

-- No SELECT/UPDATE/DELETE for anon/authenticated — service role bypasses RLS.
