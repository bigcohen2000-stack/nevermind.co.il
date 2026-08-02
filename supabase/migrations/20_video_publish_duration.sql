-- Run on project dcehznkiftjxfniejgjt (NeverMind) ONLY.
-- Dashboard: https://supabase.com/dashboard/project/dcehznkiftjxfniejgjt/sql/new

alter table public.videos
  add column if not exists published_at timestamptz;

alter table public.videos
  add column if not exists duration_seconds integer;

alter table public.videos
  drop constraint if exists videos_duration_seconds_positive;

alter table public.videos
  add constraint videos_duration_seconds_positive
  check (duration_seconds is null or duration_seconds > 0);

create index if not exists videos_published_at_idx
  on public.videos (published_at desc nulls last);

create index if not exists videos_duration_seconds_idx
  on public.videos (duration_seconds);
