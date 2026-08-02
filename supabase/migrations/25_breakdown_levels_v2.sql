-- Levels 1-4 taxonomy alignment with Master Architectural Protocol.
-- Remap legacy perspective_flip → no_difference. Add archive_shards (level 4).

update public.videos
set breakdown_level = 'no_difference'
where breakdown_level = 'perspective_flip';

alter table public.videos
  drop constraint if exists videos_breakdown_level_check;

alter table public.videos
  add constraint videos_breakdown_level_check
  check (
    breakdown_level is null
    or breakdown_level in (
      'primary',
      'no_difference',
      'unfiltered',
      'archive_shards'
    )
  );

comment on column public.videos.breakdown_level is
  'Investigation depth L1-4: primary | no_difference | unfiltered | archive_shards';
