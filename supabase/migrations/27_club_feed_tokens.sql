-- Long-lived personal club podcast feed tokens (hash only).
-- Separate from short-lived club_tokens magic links.

create table if not exists public.club_feed_tokens (
  id uuid primary key default gen_random_uuid(),
  phone text not null references public.club_members (phone) on delete cascade,
  token_hash text not null,
  label text not null default '',
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz,
  constraint club_feed_tokens_token_hash_key unique (token_hash),
  constraint club_feed_tokens_phone_not_blank check (length(trim(phone)) > 0),
  constraint club_feed_tokens_token_hash_not_blank check (length(trim(token_hash)) > 0)
);

create index if not exists club_feed_tokens_phone_idx
  on public.club_feed_tokens (phone);

create index if not exists club_feed_tokens_active_idx
  on public.club_feed_tokens (token_hash)
  where revoked_at is null;

alter table public.club_feed_tokens enable row level security;

-- Service role only (no public policies).

comment on table public.club_feed_tokens is
  'Personal private podcast RSS secrets for club members (HMAC hash only)';
