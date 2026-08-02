-- NeverMind — video playback progress (Continue Watching)
-- Logged-in users only. Anonymous progress stays in localStorage on the client.

create extension if not exists "pgcrypto";

create table if not exists public.video_progress (
  user_id           uuid not null references auth.users (id) on delete cascade,
  youtube_id        text not null,
  progress_seconds  integer not null default 0,
  duration_seconds  integer,
  updated_at        timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint video_progress_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0),
  constraint video_progress_seconds_nonneg
    check (progress_seconds >= 0),
  constraint video_progress_duration_positive
    check (duration_seconds is null or duration_seconds > 0)
);

create index if not exists video_progress_user_updated_at_idx
  on public.video_progress (user_id, updated_at desc);

alter table public.video_progress enable row level security;

drop policy if exists video_progress_select_own on public.video_progress;
create policy video_progress_select_own
  on public.video_progress
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists video_progress_insert_own on public.video_progress;
create policy video_progress_insert_own
  on public.video_progress
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists video_progress_update_own on public.video_progress;
create policy video_progress_update_own
  on public.video_progress
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists video_progress_delete_own on public.video_progress;
create policy video_progress_delete_own
  on public.video_progress
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
