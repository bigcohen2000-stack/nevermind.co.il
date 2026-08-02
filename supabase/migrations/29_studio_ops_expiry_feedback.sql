-- Studio ops: member/profile expiry + public viewer feedback
-- Prefer running supabase/imports/bootstrap-club-and-studio.sql if club tables
-- are missing. This file alone requires club_members (migration 24) to exist.

alter table public.club_members
  add column if not exists expires_at timestamptz;

comment on column public.club_members.expires_at is
  'When set and in the past, password login is rejected for this member.';

alter table public.profiles
  add column if not exists access_expires_at timestamptz;

comment on column public.profiles.access_expires_at is
  'Optional entitlement expiry for account-based video access.';

create table if not exists public.viewer_feedback (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('heart_reply', 'dislike', 'reply_request')),
  video_id      uuid references public.videos (id) on delete set null,
  video_title   text,
  body          text not null,
  author_name   text,
  contact_phone text,
  contact_email text,
  want_reply    boolean not null default false,
  status        text not null default 'open' check (status in ('open', 'replied', 'closed')),
  created_at    timestamptz not null default now(),

  constraint viewer_feedback_body_not_blank check (length(trim(body)) > 0)
);

create index if not exists viewer_feedback_created_at_idx
  on public.viewer_feedback (created_at desc);

create index if not exists viewer_feedback_status_idx
  on public.viewer_feedback (status);

alter table public.viewer_feedback enable row level security;

drop policy if exists viewer_feedback_anon_insert on public.viewer_feedback;
create policy viewer_feedback_anon_insert
  on public.viewer_feedback
  for insert
  to anon, authenticated
  with check (true);
