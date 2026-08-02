-- Tighten videos SELECT: guests must not read youtube_id / thumbs for gated rows
-- via the anon key. Teasers stay in Next.js (service role + redacted payloads).
-- Playback remains app-enforced. Transcripts stay entitlement-gated.

drop policy if exists videos_select_public on public.videos;
create policy videos_select_public
  on public.videos
  for select
  to anon, authenticated
  using (
    (
      coalesce(is_gated, false) = false
      and coalesce(is_unlisted, false) = false
    )
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
  );

comment on policy videos_select_public on public.videos is
  'Public catalog only for guests. Gated/unlisted rows require has_video_access (or legacy premium). Club cookie users resolve via Next.js service role.';
