-- NeverMind — manual video library access (has_video_access)
-- Default FALSE. Only service_role / SQL editor may set TRUE.
-- App unlock checks has_video_access (and legacy is_premium for back-compat).

alter table public.profiles
  add column if not exists has_video_access boolean not null default false;

comment on column public.profiles.has_video_access is
  'Manual grant for gated video library. Default false. Service role / SQL editor only.';

-- Backfill from legacy is_premium grants.
update public.profiles
set has_video_access = true, updated_at = now()
where is_premium = true
  and has_video_access = false;

create index if not exists profiles_has_video_access_idx
  on public.profiles (has_video_access)
  where has_video_access = true;

-- Tighten insert: new profiles must start without video access.
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (
    id = (select auth.uid())
    and is_premium = false
    and has_video_access = false
  );

-- Explicitly: no authenticated UPDATE policy on profiles.
-- Grant access (SQL editor / service role):
--   update public.profiles
--   set has_video_access = true, updated_at = now()
--   where id = (
--     select id from auth.users where email = 'user@example.com' limit 1
--   );
