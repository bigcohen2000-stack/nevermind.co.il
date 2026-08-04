# Supabase migrations (NeverMind video index)

Apply these **in order** on the **new** isolated Supabase project (SQL Editor or CLI).

| File | Purpose |
|------|---------|
| `01_init.sql` | Core tables: videos, concepts, video_concepts, video_transcripts + RLS |
| `02_ingestion_guards.sql` | Sync / ingestion helpers |
| `02_random_video.sql` | Random public video helper (if used) |
| `03_search_analytics.sql` | Search event log |
| `04_saved_videos.sql` | My List bookmarks |
| `05_video_progress.sql` | Continue watching |
| `06_watch_history.sql` | Profile watch history |
| `07_search_feedback.sql` | `user_feedback` + `feedback_note` on search_analytics |
| `08_pre_meeting_leads.sql` | Thought Deconstructor / pre-meeting intake |
| `09_push_subscribers.sql` | Web push subscribers |
| `10_core_facts.sql` | Core facts content |
| `11_transcript_segments.sql` | Transcript segments |
| `12_profiles_premium.sql` | Profiles / premium flags |
| `13_pre_meeting_leads_email.sql` | Optional email on pre-meeting leads |
| `14_has_video_access.sql` | Manual video library grant (`has_video_access`) |
| `15_auth_login_events.sql` | Login event log for Studio users analytics |
| `16_unlisted_auto_gate.sql` | Unlisted (לא רשום) always forces `is_gated` |
| `17_club_access.sql` | Club magic links (`club_tokens`) + login log + shared password config |
| `18_gated_teaser_select.sql` | Anon can read gated video teasers (lock UI). Transcripts stay entitlement-gated. |
| `19_videos_select_entitled.sql` | Entitled select policies for full gated rows |
| `20_video_publish_duration.sql` | `published_at` + `duration_seconds` for /videos sort |
| `21_single_video_leads.sql` | Single-video 50 NIS request leads for Studio |
| `22`-`35` | Club, presence, quotes, live archive, booking, meetings (see files in this folder) |
| `36_live_stream_queue.sql` | Live stream queue + `notify_live` / `notify_daily` / `user_id` on subscribers. Apply after `35_ensure_club_members.sql`. Types: `live_stream_queue` + subscriber prefs in `src/types/supabase.ts`. |

## How to apply

1. Open Supabase → SQL Editor.
2. If `01_init.sql` is already applied: paste and run **`../go-live.sql`** once (bundles 02–13).
3. Or paste each numbered file in order (skip if already applied).
4. Optional demo data: `../seed/01_demo_videos.sql`.
5. Transcripts: `npm run transcripts:backfill` (no YouTube Data API quota). Do not full re-sync just for captions.

Do **not** reuse keys or schema from other Cursor / old Supabase projects.
