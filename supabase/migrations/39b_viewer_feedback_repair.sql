-- Repair: finish migration 39 B3 when viewer_feedback was missing.
-- Safe to re-run. Paste into Supabase SQL editor.

create table if not exists public.viewer_feedback (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,
  video_id      uuid references public.videos (id) on delete set null,
  video_title   text,
  body          text not null,
  author_name   text,
  contact_phone text,
  contact_email text,
  want_reply    boolean not null default false,
  status        text not null default 'open'
                  check (status in ('open', 'replied', 'closed')),
  created_at    timestamptz not null default now(),
  user_id       uuid references auth.users (id) on delete set null,
  reply_body    text,
  replied_at    timestamptz,

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

alter table public.viewer_feedback
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.viewer_feedback
  add column if not exists reply_body text;

alter table public.viewer_feedback
  add column if not exists replied_at timestamptz;

do $$
declare
  cname text;
begin
  for cname in
    select conname
    from pg_constraint
    where conrelid = 'public.viewer_feedback'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%kind%'
  loop
    execute format('alter table public.viewer_feedback drop constraint %I', cname);
  end loop;
end $$;

alter table public.viewer_feedback
  drop constraint if exists viewer_feedback_kind_check;

alter table public.viewer_feedback
  add constraint viewer_feedback_kind_check
  check (kind in ('heart_reply', 'dislike', 'reply_request', 'method_question'));

create index if not exists viewer_feedback_user_id_idx
  on public.viewer_feedback (user_id, created_at desc)
  where user_id is not null;

drop policy if exists viewer_feedback_select_own on public.viewer_feedback;
create policy viewer_feedback_select_own
  on public.viewer_feedback
  for select
  to authenticated
  using (user_id = (select auth.uid()));
