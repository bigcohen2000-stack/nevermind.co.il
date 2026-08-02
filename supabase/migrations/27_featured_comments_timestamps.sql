-- Enrich featured investigator comments for watch-page deep links.

alter table public.video_featured_comments
  add column if not exists timestamp_seconds integer
    check (timestamp_seconds is null or timestamp_seconds >= 0);

alter table public.video_featured_comments
  add column if not exists youtube_url text;

alter table public.video_featured_comments
  add column if not exists commented_at timestamptz;

comment on table public.video_featured_comments is
  'Creator-hearted / curated YouTube comments. Up to 3 shown under the watch player.';
