-- Investigation protocol: breakdown level + optional club continue teaser.
-- Tags stay as concepts (category = 'investigation').

alter table public.videos
  add column if not exists breakdown_level text;

alter table public.videos
  drop constraint if exists videos_breakdown_level_check;

alter table public.videos
  add constraint videos_breakdown_level_check
  check (
    breakdown_level is null
    or breakdown_level in (
      'primary',
      'no_difference',
      'perspective_flip',
      'unfiltered'
    )
  );

comment on column public.videos.breakdown_level is
  'Investigation depth: primary | no_difference | perspective_flip | unfiltered';

create index if not exists videos_breakdown_level_idx
  on public.videos (breakdown_level)
  where breakdown_level is not null;

alter table public.videos
  add column if not exists club_teaser_label text;

alter table public.videos
  add column if not exists club_teaser_href text;

comment on column public.videos.club_teaser_label is
  'Optional public-page upsell copy for continue exploration';

comment on column public.videos.club_teaser_href is
  'Optional path or URL for club continue teaser (defaults to /members)';
