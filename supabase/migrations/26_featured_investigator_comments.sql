-- Featured investigator comments (creator-hearted YouTube comments).
-- Curated / synced rows rendered as "החוקר המצטיין" on watch pages.

create table if not exists public.video_featured_comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos (id) on delete cascade,
  author_name text,
  body text not null,
  youtube_comment_id text,
  is_creator_hearted boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint video_featured_comments_body_len check (char_length(body) between 1 and 4000)
);

create unique index if not exists video_featured_comments_yt_id_uidx
  on public.video_featured_comments (youtube_comment_id)
  where youtube_comment_id is not null;

create index if not exists video_featured_comments_video_idx
  on public.video_featured_comments (video_id, sort_order, created_at desc);

alter table public.video_featured_comments enable row level security;

drop policy if exists "Public read featured comments" on public.video_featured_comments;
create policy "Public read featured comments"
  on public.video_featured_comments
  for select
  to anon, authenticated
  using (true);

comment on table public.video_featured_comments is
  'Creator-hearted / curated comments shown as החוקר המצטיין';
