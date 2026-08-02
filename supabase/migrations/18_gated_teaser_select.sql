-- Gated / unlisted teasers: guests may SELECT video rows (title, thumb, flags)
-- so lock overlays can render on /videos and /search.
-- Playback still blocked in the app. Transcripts stay locked for anon on gated.

drop policy if exists videos_select_public on public.videos;
create policy videos_select_public
  on public.videos
  for select
  to anon, authenticated
  using (true);

-- Transcripts: public videos for everyone. Gated only with has_video_access
-- (or legacy is_premium). Authenticated without access sees metadata only.
drop policy if exists video_transcripts_select_visible on public.video_transcripts;
create policy video_transcripts_select_visible
  on public.video_transcripts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.videos v
      where v.id = video_id
        and (
          v.is_gated = false
          or (
            (select auth.uid()) is not null
            and exists (
              select 1
              from public.profiles p
              where p.id = (select auth.uid())
                and (
                  coalesce(p.has_video_access, false) = true
                  or coalesce(p.is_premium, false) = true
                )
            )
          )
        )
    )
  );

-- Concept links follow the same entitlement as transcripts for gated videos.
drop policy if exists video_concepts_select_visible on public.video_concepts;
create policy video_concepts_select_visible
  on public.video_concepts
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.videos v
      where v.id = video_id
        and (
          v.is_gated = false
          or (select auth.role()) = 'authenticated'
        )
    )
  );

comment on policy videos_select_public on public.videos is
  'Teaser metadata (including gated) is public. Lock UI + transcript RLS enforce access.';
