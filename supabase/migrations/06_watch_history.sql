-- NeverMind — watch history (profile "recently watched")
-- One row per user + youtube_id. Re-watching updates watched_at.

create extension if not exists "pgcrypto";

create table if not exists public.watch_history (
  user_id     uuid not null references auth.users (id) on delete cascade,
  youtube_id  text not null,
  watched_at  timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint watch_history_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0)
);

create index if not exists watch_history_user_watched_at_idx
  on public.watch_history (user_id, watched_at desc);

alter table public.watch_history enable row level security;

drop policy if exists watch_history_select_own on public.watch_history;
create policy watch_history_select_own
  on public.watch_history
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists watch_history_insert_own on public.watch_history;
create policy watch_history_insert_own
  on public.watch_history
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists watch_history_update_own on public.watch_history;
create policy watch_history_update_own
  on public.watch_history
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists watch_history_delete_own on public.watch_history;
create policy watch_history_delete_own
  on public.watch_history
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
