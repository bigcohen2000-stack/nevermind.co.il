-- Demo seed for UI QA without YouTube API quota.
-- Run AFTER 01_init.sql in the NEW Supabase SQL Editor.
-- Uses fixed UUIDs so re-running is idempotent (ON CONFLICT).

insert into public.videos (
  id,
  youtube_id,
  title,
  description,
  thumbnail_url,
  playlist_id,
  is_unlisted,
  is_gated
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'dQw4w9WgXcQ',
    'עובדה מול סיפור — מבוא ציבורי',
    'סרטון דמה ציבורי לבדיקת חיפוש ונגן.',
    'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    null,
    false,
    false
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'jNQXAC9IVRw',
    'הרצאה לא רשומה — בדיקת Unlisted',
    'סרטון דמה עם is_unlisted=true (עדיין לא gated).',
    'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
    'PLdemoUnlisted',
    true,
    false
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '9bZkp7q19f0',
    'פירוק מנגנון — לחברים בלבד',
    'סרטון דמה gated — אורחים לא אמורים לראות בחיפוש או בנגן.',
    'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg',
    'PLdemoGated',
    false,
    true
  )
on conflict (youtube_id) do update set
  title = excluded.title,
  description = excluded.description,
  thumbnail_url = excluded.thumbnail_url,
  playlist_id = excluded.playlist_id,
  is_unlisted = excluded.is_unlisted,
  is_gated = excluded.is_gated;

insert into public.concepts (id, name, category) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'עובדה מול סיפור',
    'identity'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'מנגנון היחסים',
    'relationships'
  )
on conflict (name) do update set
  category = excluded.category;

insert into public.video_concepts (video_id, concept_id, start_timestamp) values
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    12
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    30
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    45
  )
on conflict (video_id, concept_id) do update set
  start_timestamp = excluded.start_timestamp;

insert into public.video_transcripts (video_id, content) values
  (
    '11111111-1111-1111-1111-111111111111',
    'עובדה מול סיפור. הפרדה בין מציאות אובייקטיבית לבין פרשנות. חיפוש ציבורי.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'הרצאה לא רשומה. אותו מבנה, גישה שונה. Unlisted לבדיקה.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'תוכן לחברים. מנגנון היחסים. פירוק מלא למי שרשום.'
  )
on conflict (video_id) do update set
  content = excluded.content;
