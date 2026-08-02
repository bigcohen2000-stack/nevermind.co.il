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
    'כניסה למועדון',
    'מאגר החקירה פתוח לחברים. סיסמה או קישור בוואטסאפ אחרי התאמה.',
    'בקשת גישה',
    '/members#login',
    false,
    0
  ),
  (
    'watch_gate',
    'להמשיך בחקירה',
    'הסרטון המלא במועדון. אפשר לבקש מסגרת גישה או סרטון בודד.',
    'למועדון',
    '/members',
    false,
    0
  ),
  (
    'home_join',
    'הצטרפות לחקירה',
    'מעל 150 שעות במאגר. ארבע רמות. בלי דרמה.',
    'למועדון',
    '/members',
    false,
    0
  ),
  (
    'live',
    'שידור חי',
    'כשיש שידור, הכניסה דרך /live אחרי הרשמה.',
    'לשידור',
    '/live',
    false,
    0
  )
) as v(slot, title, body, cta_label, cta_href, is_active, sort_order)
where not exists (select 1 from public.site_banners limit 1);
