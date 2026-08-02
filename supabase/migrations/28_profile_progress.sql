-- NeverMind — profile analytical progress
-- watch_time_seconds cumulative dive depth + user_meetings for last session.

alter table public.profiles
  add column if not exists watch_time_seconds integer not null default 0;

alter table public.profiles
  drop constraint if exists profiles_watch_time_seconds_nonneg;

alter table public.profiles
  add constraint profiles_watch_time_seconds_nonneg
  check (watch_time_seconds >= 0);

comment on column public.profiles.watch_time_seconds is
  'Cumulative watched seconds for the signed-in user. Incremented via RPC only.';

-- Authenticated users may bump only their own cumulative watch time (bounded).
create or replace function public.increment_own_watch_time(p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    return;
  end if;
  if p_delta is null or p_delta <= 0 or p_delta > 180 then
    return;
  end if;

  insert into public.profiles (id, watch_time_seconds)
  values (uid, p_delta)
  on conflict (id) do update
  set
    watch_time_seconds = public.profiles.watch_time_seconds + excluded.watch_time_seconds,
    updated_at = now();
end;
$$;

revoke all on function public.increment_own_watch_time(integer) from public;
grant execute on function public.increment_own_watch_time(integer) to authenticated;

-- =============================================================================
-- user_meetings: coaching sessions recorded by Studio
-- =============================================================================

create table if not exists public.user_meetings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  held_at     timestamptz not null,
  note        text,
  created_at  timestamptz not null default now(),

  constraint user_meetings_note_len
    check (note is null or char_length(note) <= 500)
);

create index if not exists user_meetings_user_held_at_idx
  on public.user_meetings (user_id, held_at desc);

alter table public.user_meetings enable row level security;

drop policy if exists user_meetings_select_own on public.user_meetings;
create policy user_meetings_select_own
  on public.user_meetings
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- No insert/update/delete for authenticated. Service role / Studio only.
