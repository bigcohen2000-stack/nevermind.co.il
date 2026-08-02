-- NeverMind — saved videos ("My List" / Save for Later)
-- Maps authenticated users to YouTube video ids.

create extension if not exists "pgcrypto";

create table if not exists public.saved_videos (
  user_id     uuid not null references auth.users (id) on delete cascade,
  youtube_id  text not null,
  created_at  timestamptz not null default now(),

  primary key (user_id, youtube_id),

  constraint saved_videos_youtube_id_not_blank
    check (length(trim(youtube_id)) > 0)
);

create index if not exists saved_videos_user_id_created_at_idx
  on public.saved_videos (user_id, created_at desc);

create index if not exists saved_videos_youtube_id_idx
  on public.saved_videos (youtube_id);

alter table public.saved_videos enable row level security;

drop policy if exists saved_videos_select_own on public.saved_videos;
create policy saved_videos_select_own
  on public.saved_videos
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists saved_videos_insert_own on public.saved_videos;
create policy saved_videos_insert_own
  on public.saved_videos
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists saved_videos_delete_own on public.saved_videos;
create policy saved_videos_delete_own
  on public.saved_videos
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- No anon access. Service role bypasses RLS for admin tools if needed.
