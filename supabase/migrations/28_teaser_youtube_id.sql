-- Dedicated public teaser clip (separate YouTube upload).
-- Non-members may receive teaser_youtube_id only. Full youtube_id stays server-side
-- until club / has_video_access entitlement.

alter table public.videos
  add column if not exists teaser_youtube_id text;

alter table public.videos
  drop constraint if exists videos_teaser_youtube_id_format;

alter table public.videos
  add constraint videos_teaser_youtube_id_format
  check (
    teaser_youtube_id is null
    or teaser_youtube_id ~ '^[\w-]{11}$'
  );

create unique index if not exists videos_teaser_youtube_id_uidx
  on public.videos (teaser_youtube_id)
  where teaser_youtube_id is not null;

comment on column public.videos.teaser_youtube_id is
  'Public short clip YouTube id for locked watch teasers. Never equal to full youtube_id for gated rows.';
