-- NeverMind club access (magic links + optional shared password backup)
-- Run on NeverMind Supabase ONLY. Service role writes. No anon access.

create extension if not exists "pgcrypto";

-- =============================================================================
-- club_tokens: personal magic-link tokens (WhatsApp)
-- Store token_hash only. Raw token appears only in the URL once.
-- =============================================================================

create table if not exists public.club_tokens (
  id           uuid primary key default gen_random_uuid(),
  token_hash   text not null,
  phone        text not null,
  expires_at   timestamptz not null,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,

  constraint club_tokens_token_hash_key unique (token_hash),
  constraint club_tokens_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_tokens_token_hash_not_blank check (length(trim(token_hash)) > 0)
);

create index if not exists club_tokens_phone_idx
  on public.club_tokens (phone);

create index if not exists club_tokens_expires_at_idx
  on public.club_tokens (expires_at desc);

-- =============================================================================
-- club_login_events: who entered and when
-- =============================================================================

create table if not exists public.club_login_events (
  id         uuid primary key default gen_random_uuid(),
  phone      text not null,
  token_id   uuid references public.club_tokens (id) on delete set null,
  source     text not null default 'magic',
  user_agent text,
  created_at timestamptz not null default now(),

  constraint club_login_events_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_login_events_source_check
    check (source in ('magic', 'password'))
);

create index if not exists club_login_events_created_at_idx
  on public.club_login_events (created_at desc);

create index if not exists club_login_events_phone_idx
  on public.club_login_events (phone);

-- =============================================================================
-- club_config: single-row shared password backup (no Vercel redeploy)
-- =============================================================================

create table if not exists public.club_config (
  id            int primary key default 1 check (id = 1),
  password_hash text not null default '',
  version       int not null default 1,
  updated_at    timestamptz not null default now(),

  constraint club_config_version_positive check (version >= 1)
);

insert into public.club_config (id, password_hash, version)
values (1, '', 1)
on conflict (id) do nothing;

-- =============================================================================
-- RLS: deny all for anon/authenticated. Service role bypasses.
-- =============================================================================

alter table public.club_tokens enable row level security;
alter table public.club_login_events enable row level security;
alter table public.club_config enable row level security;

-- No policies for anon/authenticated = no access via PostgREST with anon key.
