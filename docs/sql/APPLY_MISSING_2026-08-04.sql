-- NeverMind: missing production schema (probed 2026-08-04)
-- Apply in Supabase SQL Editor (one run). Idempotent where possible.
-- Order: 21 → 23 → 30 → 31 → 32
-- Already OK in prod (do not re-need): 24–29 partial, 33, 34 cols, club tables.


-- ===== BEGIN supabase/migrations/21_single_video_leads.sql =====

-- Single-video purchase / request leads for Studio.
-- Click logging from the 50 NIS CTA + manual Studio status updates.

create table if not exists public.single_video_leads (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid references public.videos (id) on delete set null,
  video_title  text not null default '',
  phone        text,
  status       text not null default 'requested',
  source       text not null default 'cta',
  note         text,
  watch_url    text,
  club_token_id uuid references public.club_tokens (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint single_video_leads_status_check
    check (status in ('requested', 'chatting', 'paid', 'sent', 'closed')),
  constraint single_video_leads_source_check
    check (source in ('cta', 'whatsapp', 'studio', 'other')),
  constraint single_video_leads_title_not_blank
    check (length(trim(video_title)) > 0)
);

create index if not exists single_video_leads_created_at_idx
  on public.single_video_leads (created_at desc);

create index if not exists single_video_leads_status_idx
  on public.single_video_leads (status);

create index if not exists single_video_leads_video_id_idx
  on public.single_video_leads (video_id);

alter table public.single_video_leads enable row level security;
-- No anon/authenticated policies: service role only (Studio + CTA logger).


-- ===== END supabase/migrations/21_single_video_leads.sql =====


-- ===== BEGIN supabase/migrations/23_site_presence.sql =====

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


-- ===== END supabase/migrations/23_site_presence.sql =====


-- ===== BEGIN supabase/migrations/30_quotes_and_banners.sql =====

-- Quotes (price proposals) + editable site banners. Service role for studio.
-- Public: quote approve by token. Banners: public read of active rows.

-- =============================================================================
-- studio_quotes
-- =============================================================================

create table if not exists public.studio_quotes (
  id              uuid primary key default gen_random_uuid(),
  public_token    text not null,
  status          text not null default 'draft'
    check (status in ('draft', 'sent', 'approved', 'payment_sent', 'paid', 'expired', 'cancelled')),
  customer_name   text not null default '',
  customer_phone  text,
  customer_email  text,
  product_kind    text not null
    check (product_kind in ('archive', 'single_video', 'meeting', 'custom')),
  product_label   text not null,
  product_ref     text,
  price_ils       numeric(12, 2) not null,
  currency        text not null default 'ILS',
  validity_label  text,
  body            text not null default '',
  payment_url     text,
  lead_source     text,
  lead_ref        text,
  approved_at     timestamptz,
  paid_at         timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint studio_quotes_token_unique unique (public_token),
  constraint studio_quotes_token_len check (char_length(public_token) between 16 and 64),
  constraint studio_quotes_price_nonneg check (price_ils >= 0)
);

create index if not exists studio_quotes_status_idx
  on public.studio_quotes (status, created_at desc);
create index if not exists studio_quotes_phone_idx
  on public.studio_quotes (customer_phone);

alter table public.studio_quotes enable row level security;

-- Public may read a single quote by token via Next.js service role only.
-- No anon policies: app uses service role for public quote page.

-- =============================================================================
-- site_banners
-- =============================================================================

create table if not exists public.site_banners (
  id           uuid primary key default gen_random_uuid(),
  slot         text not null
    check (slot in ('home_join', 'members_hero', 'watch_gate', 'live', 'custom')),
  title        text not null,
  body         text not null default '',
  cta_label    text,
  cta_href     text,
  is_active    boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint site_banners_title_len check (char_length(trim(title)) between 1 and 200)
);

create index if not exists site_banners_slot_active_idx
  on public.site_banners (slot, is_active, sort_order);

alter table public.site_banners enable row level security;

drop policy if exists site_banners_public_read_active on public.site_banners;
create policy site_banners_public_read_active
  on public.site_banners
  for select
  to anon, authenticated
  using (is_active = true);

-- Seed a few inactive templates Yakir can edit/activate.
insert into public.site_banners (slot, title, body, cta_label, cta_href, is_active, sort_order)
select * from (values
  (
    'members_hero',
    '׳›׳ ׳™׳¡׳” ׳׳׳•׳¢׳“׳•׳',
    '׳׳׳’׳¨ ׳”׳—׳§׳™׳¨׳” ׳₪׳×׳•׳— ׳׳—׳‘׳¨׳™׳. ׳¡׳™׳¡׳׳” ׳׳• ׳§׳™׳©׳•׳¨ ׳‘׳•׳•׳׳˜׳¡׳׳₪ ׳׳—׳¨׳™ ׳”׳×׳׳׳”.',
    '׳‘׳§׳©׳× ׳’׳™׳©׳”',
    '/members#login',
    false,
    0
  ),
  (
    'watch_gate',
    '׳׳”׳׳©׳™׳ ׳‘׳—׳§׳™׳¨׳”',
    '׳”׳¡׳¨׳˜׳•׳ ׳”׳׳׳ ׳‘׳׳•׳¢׳“׳•׳. ׳׳₪׳©׳¨ ׳׳‘׳§׳© ׳׳¡׳’׳¨׳× ׳’׳™׳©׳” ׳׳• ׳¡׳¨׳˜׳•׳ ׳‘׳•׳“׳“.',
    '׳׳׳•׳¢׳“׳•׳',
    '/members',
    false,
    0
  ),
  (
    'home_join',
    '׳”׳¦׳˜׳¨׳₪׳•׳× ׳׳—׳§׳™׳¨׳”',
    '׳׳¢׳ 150 ׳©׳¢׳•׳× ׳‘׳׳׳’׳¨. ׳׳¨׳‘׳¢ ׳¨׳׳•׳×. ׳‘׳׳™ ׳“׳¨׳׳”.',
    '׳׳׳•׳¢׳“׳•׳',
    '/members',
    false,
    0
  ),
  (
    'live',
    '׳©׳™׳“׳•׳¨ ׳—׳™',
    '׳›׳©׳™׳© ׳©׳™׳“׳•׳¨, ׳”׳›׳ ׳™׳¡׳” ׳“׳¨׳ /live ׳׳—׳¨׳™ ׳”׳¨׳©׳׳”.',
    '׳׳©׳™׳“׳•׳¨',
    '/live',
    false,
    0
  )
) as v(slot, title, body, cta_label, cta_href, is_active, sort_order)
where not exists (select 1 from public.site_banners limit 1);


-- ===== END supabase/migrations/30_quotes_and_banners.sql =====


-- ===== BEGIN supabase/migrations/31_profile_theme.sql =====

-- NeverMind ג€” per-user light/dark theme preference (signed-in accounts).
-- Club-only sessions store theme in cookie/localStorage only.

alter table public.profiles
  add column if not exists theme text not null default 'light';

alter table public.profiles
  drop constraint if exists profiles_theme_check;

alter table public.profiles
  add constraint profiles_theme_check
  check (theme in ('light', 'dark'));

comment on column public.profiles.theme is
  'UI color theme for signed-in users. Guests stay light.';


-- ===== END supabase/migrations/31_profile_theme.sql =====


-- ===== BEGIN supabase/migrations/32_live_video_votes.sql =====

-- NeverMind ג€” LIVE archive votes + requests
-- Registered users can like archive candidates and request a video for a future LIVE.
-- Watching unlisted archive remains club-gated in the app (/watch).

create extension if not exists "pgcrypto";

-- =============================================================================
-- live_video_likes: one like per signed-in user per video
-- =============================================================================

create table if not exists public.live_video_likes (
  user_id     uuid not null references auth.users (id) on delete cascade,
  video_id    uuid not null references public.videos (id) on delete cascade,
  created_at  timestamptz not null default now(),

  primary key (user_id, video_id)
);

create index if not exists live_video_likes_video_id_idx
  on public.live_video_likes (video_id);

create index if not exists live_video_likes_created_at_idx
  on public.live_video_likes (created_at desc);

alter table public.live_video_likes enable row level security;

drop policy if exists live_video_likes_select_authenticated on public.live_video_likes;
create policy live_video_likes_select_authenticated
  on public.live_video_likes
  for select
  to authenticated
  using (true);

drop policy if exists live_video_likes_insert_own on public.live_video_likes;
create policy live_video_likes_insert_own
  on public.live_video_likes
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists live_video_likes_delete_own on public.live_video_likes;
create policy live_video_likes_delete_own
  on public.live_video_likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Public-readable counts (anon + authenticated) without exposing user ids.
create or replace view public.live_video_like_counts
with (security_invoker = false)
as
select
  video_id,
  count(*)::int as like_count
from public.live_video_likes
group by video_id;

grant select on public.live_video_like_counts to anon, authenticated;

comment on table public.live_video_likes is
  'Votes for LIVE archive / next free registered LIVE candidates.';

comment on view public.live_video_like_counts is
  'Aggregate like counts for LIVE voting. Safe for public read.';

-- =============================================================================
-- live_video_requests: "put this video on a future LIVE"
-- =============================================================================

create table if not exists public.live_video_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  video_id     uuid references public.videos (id) on delete set null,
  video_title  text not null,
  note         text not null default '',
  created_at   timestamptz not null default now(),

  constraint live_video_requests_title_len
    check (char_length(video_title) between 2 and 200),
  constraint live_video_requests_note_len
    check (char_length(note) <= 500)
);

create index if not exists live_video_requests_user_id_created_at_idx
  on public.live_video_requests (user_id, created_at desc);

create index if not exists live_video_requests_created_at_idx
  on public.live_video_requests (created_at desc);

alter table public.live_video_requests enable row level security;

drop policy if exists live_video_requests_select_own on public.live_video_requests;
create policy live_video_requests_select_own
  on public.live_video_requests
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists live_video_requests_insert_own on public.live_video_requests;
create policy live_video_requests_insert_own
  on public.live_video_requests
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

comment on table public.live_video_requests is
  'Signed-in requests to feature a specific video on a future LIVE.';


-- ===== END supabase/migrations/32_live_video_votes.sql =====


notify pgrst, 'reload schema';

