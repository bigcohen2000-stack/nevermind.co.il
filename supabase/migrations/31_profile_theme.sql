-- NeverMind — per-user light/dark theme preference (signed-in accounts).
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
