-- NeverMind site presence (who's active now)
-- Studio-only reads via service role. No public/anon access.

create table if not exists public.site_presence (
  session_key   text primary key,
  kind          text not null,
  display_label text not null,
  user_id       uuid references auth.users (id) on delete cascade,
  path          text,
  last_seen_at  timestamptz not null default now(),

  constraint site_presence_kind_check check (kind in ('auth', 'club')),
  constraint site_presence_session_key_not_blank check (length(trim(session_key)) > 0),
  constraint site_presence_display_label_not_blank check (length(trim(display_label)) > 0)
);

create index if not exists site_presence_last_seen_at_idx
  on public.site_presence (last_seen_at desc);

create index if not exists site_presence_kind_idx
  on public.site_presence (kind);

alter table public.site_presence enable row level security;

-- No policies for anon/authenticated = no PostgREST access with anon key.
-- Service role (Server Actions / Studio) bypasses RLS.
