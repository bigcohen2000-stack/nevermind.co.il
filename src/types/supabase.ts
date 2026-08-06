/**
 * Manual Database stub matching supabase/migrations:
 *   01_init.sql
 *   02_ingestion_guards.sql
 *   03_search_analytics.sql
 *   04_saved_videos.sql
 *   05_video_progress.sql
 *   06_watch_history.sql
 *   07_search_feedback.sql
 *   08_pre_meeting_leads.sql
 *   09_push_subscribers.sql
 *   10_core_facts.sql
 *   11_transcript_segments.sql
 *   12_profiles_premium.sql
 *   13_pre_meeting_leads_email.sql
 *   14_has_video_access.sql
 *   15_auth_login_events.sql
 *   16_unlisted_auto_gate.sql
 *   17_club_access.sql
 *   18_gated_teaser_select.sql
 *   19_videos_select_entitled.sql
 *   20_video_publish_duration.sql
 *   21_single_video_leads.sql
 *   22_unlisted_gate_backfill.sql
 *   23_site_presence.sql
 *   24_investigation_protocol.sql
 *   29_unlisted_live.sql
 *   29_studio_ops_expiry_feedback.sql
 *   30_quotes_and_banners.sql
 *   31_profile_theme.sql
 *   32_live_video_votes.sql
 *   38_newsletter_subscribers.sql
 *
 * Replace with generated types after linking a live project:
 *   npx supabase gen types typescript --project-id <YOUR_NEW_PROJECT_ID> > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      videos: {
        Row: {
          id: string;
          youtube_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          playlist_id: string | null;
          is_unlisted: boolean;
          is_gated: boolean;
          core_facts: string[];
          created_at: string;
          published_at: string | null;
          duration_seconds: number | null;
          breakdown_level: string | null;
          club_teaser_label: string | null;
          club_teaser_href: string | null;
          teaser_youtube_id: string | null;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          playlist_id?: string | null;
          is_unlisted?: boolean;
          is_gated?: boolean;
          core_facts?: string[];
          created_at?: string;
          published_at?: string | null;
          duration_seconds?: number | null;
          breakdown_level?: string | null;
          club_teaser_label?: string | null;
          club_teaser_href?: string | null;
          teaser_youtube_id?: string | null;
        };
        Update: {
          id?: string;
          youtube_id?: string;
          title?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          playlist_id?: string | null;
          is_unlisted?: boolean;
          is_gated?: boolean;
          core_facts?: string[];
          created_at?: string;
          published_at?: string | null;
          duration_seconds?: number | null;
          breakdown_level?: string | null;
          club_teaser_label?: string | null;
          club_teaser_href?: string | null;
          teaser_youtube_id?: string | null;
        };
        Relationships: [];
      };
      video_featured_comments: {
        Row: {
          id: string;
          video_id: string;
          author_name: string | null;
          body: string;
          youtube_comment_id: string | null;
          is_creator_hearted: boolean;
          sort_order: number;
          created_at: string;
          commented_at: string | null;
          timestamp_seconds: number | null;
          youtube_url: string | null;
        };
        Insert: {
          id?: string;
          video_id: string;
          author_name?: string | null;
          body: string;
          youtube_comment_id?: string | null;
          is_creator_hearted?: boolean;
          sort_order?: number;
          created_at?: string;
          commented_at?: string | null;
          timestamp_seconds?: number | null;
          youtube_url?: string | null;
        };
        Update: {
          id?: string;
          video_id?: string;
          author_name?: string | null;
          body?: string;
          youtube_comment_id?: string | null;
          is_creator_hearted?: boolean;
          sort_order?: number;
          created_at?: string;
          commented_at?: string | null;
          timestamp_seconds?: number | null;
          youtube_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_featured_comments_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      concepts: {
        Row: {
          id: string;
          name: string;
          category: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
        };
        Relationships: [];
      };
      video_concepts: {
        Row: {
          video_id: string;
          concept_id: string;
          start_timestamp: number | null;
        };
        Insert: {
          video_id: string;
          concept_id: string;
          start_timestamp?: number | null;
        };
        Update: {
          video_id?: string;
          concept_id?: string;
          start_timestamp?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "video_concepts_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "video_concepts_concept_id_fkey";
            columns: ["concept_id"];
            isOneToOne: false;
            referencedRelation: "concepts";
            referencedColumns: ["id"];
          },
        ];
      };
      video_transcripts: {
        Row: {
          video_id: string;
          content: string;
          search_vector: unknown | null;
          segments: Json;
        };
        Insert: {
          video_id: string;
          content?: string;
          search_vector?: unknown | null;
          segments?: Json;
        };
        Update: {
          video_id?: string;
          content?: string;
          search_vector?: unknown | null;
          segments?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "video_transcripts_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: true;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      search_analytics: {
        Row: {
          id: string;
          search_query: string;
          user_id: string | null;
          session_id: string | null;
          created_at: string;
          results_count: number;
          user_feedback: boolean | null;
          feedback_note: string | null;
        };
        Insert: {
          id?: string;
          search_query: string;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          results_count?: number;
          user_feedback?: boolean | null;
          feedback_note?: string | null;
        };
        Update: {
          id?: string;
          search_query?: string;
          user_id?: string | null;
          session_id?: string | null;
          created_at?: string;
          results_count?: number;
          user_feedback?: boolean | null;
          feedback_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "search_analytics_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_videos: {
        Row: {
          user_id: string;
          youtube_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          youtube_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          youtube_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_videos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      video_progress: {
        Row: {
          user_id: string;
          youtube_id: string;
          progress_seconds: number;
          duration_seconds: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          youtube_id: string;
          progress_seconds?: number;
          duration_seconds?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          youtube_id?: string;
          progress_seconds?: number;
          duration_seconds?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "video_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      watch_history: {
        Row: {
          user_id: string;
          youtube_id: string;
          watched_at: string;
        };
        Insert: {
          user_id: string;
          youtube_id: string;
          watched_at?: string;
        };
        Update: {
          user_id?: string;
          youtube_id?: string;
          watched_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      pre_meeting_leads: {
        Row: {
          id: string;
          situation_text: string;
          objective_facts: string;
          subjective_story: string;
          name: string;
          phone: string;
          email: string | null;
          source: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          situation_text: string;
          objective_facts: string;
          subjective_story: string;
          name: string;
          phone: string;
          email?: string | null;
          source?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          situation_text?: string;
          objective_facts?: string;
          subjective_story?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          source?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      booking_leads: {
        Row: {
          id: string;
          name: string;
          phone: string;
          email: string;
          context: string;
          source: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          email: string;
          context?: string;
          source?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          email?: string;
          context?: string;
          source?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      single_video_leads: {
        Row: {
          id: string;
          video_id: string | null;
          video_title: string;
          phone: string | null;
          status: string;
          source: string;
          note: string | null;
          watch_url: string | null;
          club_token_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          video_id?: string | null;
          video_title?: string;
          phone?: string | null;
          status?: string;
          source?: string;
          note?: string | null;
          watch_url?: string | null;
          club_token_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string | null;
          video_title?: string;
          phone?: string | null;
          status?: string;
          source?: string;
          note?: string | null;
          watch_url?: string | null;
          club_token_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "single_video_leads_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "single_video_leads_club_token_id_fkey";
            columns: ["club_token_id"];
            isOneToOne: false;
            referencedRelation: "club_tokens";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: {
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          created_at: string;
          notify_live: boolean;
          notify_daily: boolean;
          user_id: string | null;
        };
        Insert: {
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
          notify_live?: boolean;
          notify_daily?: boolean;
          user_id?: string | null;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
          notify_live?: boolean;
          notify_daily?: boolean;
          user_id?: string | null;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          is_premium: boolean;
          has_video_access: boolean;
          age_confirmed_at: string | null;
          access_expires_at: string | null;
          watch_time_seconds: number;
          theme: "light" | "dark";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          is_premium?: boolean;
          has_video_access?: boolean;
          age_confirmed_at?: string | null;
          access_expires_at?: string | null;
          watch_time_seconds?: number;
          theme?: "light" | "dark";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_premium?: boolean;
          has_video_access?: boolean;
          age_confirmed_at?: string | null;
          access_expires_at?: string | null;
          watch_time_seconds?: number;
          theme?: "light" | "dark";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      user_meetings: {
        Row: {
          id: string;
          user_id: string;
          held_at: string;
          note: string | null;
          created_at: string;
          status: string;
          confirmation_token: string | null;
          confirmation_requested_at: string | null;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          held_at: string;
          note?: string | null;
          created_at?: string;
          status?: string;
          confirmation_token?: string | null;
          confirmation_requested_at?: string | null;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          held_at?: string;
          note?: string | null;
          created_at?: string;
          status?: string;
          confirmation_token?: string | null;
          confirmation_requested_at?: string | null;
          confirmed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_meetings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      live_stream_config: {
        Row: {
          id: number;
          is_live: boolean;
          youtube_url: string;
          topic: string;
          started_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          is_live?: boolean;
          youtube_url?: string;
          topic?: string;
          started_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          is_live?: boolean;
          youtube_url?: string;
          topic?: string;
          started_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      live_stream_queue: {
        Row: {
          id: string;
          youtube_url: string;
          topic: string;
          scheduled_at: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          youtube_url: string;
          topic?: string;
          scheduled_at: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          youtube_url?: string;
          topic?: string;
          scheduled_at?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      live_video_likes: {
        Row: {
          user_id: string;
          video_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          video_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          video_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_video_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_video_likes_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      live_video_like_counts: {
        Row: {
          video_id: string;
          like_count: number;
        };
        Insert: {
          video_id: string;
          like_count?: number;
        };
        Update: {
          video_id?: string;
          like_count?: number;
        };
        Relationships: [];
      };
      live_video_requests: {
        Row: {
          id: string;
          user_id: string;
          video_id: string | null;
          video_title: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id?: string | null;
          video_title: string;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          video_id?: string | null;
          video_title?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_video_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "live_video_requests_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      auth_login_events: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          event_type: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          event_type?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          event_type?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      club_tokens: {
        Row: {
          id: string;
          token_hash: string;
          phone: string;
          expires_at: string;
          revoked_at: string | null;
          created_at: string;
          last_used_at: string | null;
        };
        Insert: {
          id?: string;
          token_hash: string;
          phone: string;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
        Update: {
          id?: string;
          token_hash?: string;
          phone?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          last_used_at?: string | null;
        };
        Relationships: [];
      };
      club_feed_tokens: {
        Row: {
          id: string;
          phone: string;
          token_hash: string;
          label: string;
          created_at: string;
          last_used_at: string | null;
          revoked_at: string | null;
        };
        Insert: {
          id?: string;
          phone: string;
          token_hash: string;
          label?: string;
          created_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
        Update: {
          id?: string;
          phone?: string;
          token_hash?: string;
          label?: string;
          created_at?: string;
          last_used_at?: string | null;
          revoked_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "club_feed_tokens_phone_fkey";
            columns: ["phone"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["phone"];
          },
        ];
      };
      club_members: {
        Row: {
          phone: string;
          display_name: string;
          notes: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
          last_seen_at: string | null;
        };
        Insert: {
          phone: string;
          display_name?: string;
          notes?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string | null;
        };
        Update: {
          phone?: string;
          display_name?: string;
          notes?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          last_seen_at?: string | null;
        };
        Relationships: [];
      };
      viewer_feedback: {
        Row: {
          id: string;
          kind: "heart_reply" | "dislike" | "reply_request";
          video_id: string | null;
          video_title: string | null;
          body: string;
          author_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          want_reply: boolean;
          status: "open" | "replied" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: "heart_reply" | "dislike" | "reply_request";
          video_id?: string | null;
          video_title?: string | null;
          body: string;
          author_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          want_reply?: boolean;
          status?: "open" | "replied" | "closed";
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: "heart_reply" | "dislike" | "reply_request";
          video_id?: string | null;
          video_title?: string | null;
          body?: string;
          author_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          want_reply?: boolean;
          status?: "open" | "replied" | "closed";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "viewer_feedback_video_id_fkey";
            columns: ["video_id"];
            isOneToOne: false;
            referencedRelation: "videos";
            referencedColumns: ["id"];
          },
        ];
      };
      club_login_events: {
        Row: {
          id: string;
          phone: string;
          display_name: string | null;
          token_id: string | null;
          source: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          display_name?: string | null;
          token_id?: string | null;
          source?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          display_name?: string | null;
          token_id?: string | null;
          source?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "club_login_events_token_id_fkey";
            columns: ["token_id"];
            isOneToOne: false;
            referencedRelation: "club_tokens";
            referencedColumns: ["id"];
          },
        ];
      };
      club_watch_events: {
        Row: {
          id: string;
          phone: string;
          video_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          video_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          video_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "club_watch_events_phone_fkey";
            columns: ["phone"];
            isOneToOne: false;
            referencedRelation: "club_members";
            referencedColumns: ["phone"];
          },
        ];
      };
      club_config: {
        Row: {
          id: number;
          password_hash: string;
          version: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          password_hash?: string;
          version?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          password_hash?: string;
          version?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_presence: {
        Row: {
          session_key: string;
          kind: string;
          display_label: string;
          user_id: string | null;
          path: string | null;
          last_seen_at: string;
        };
        Insert: {
          session_key: string;
          kind: string;
          display_label: string;
          user_id?: string | null;
          path?: string | null;
          last_seen_at?: string;
        };
        Update: {
          session_key?: string;
          kind?: string;
          display_label?: string;
          user_id?: string | null;
          path?: string | null;
          last_seen_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_presence_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      studio_quotes: {
        Row: {
          id: string;
          public_token: string;
          status: string;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          product_kind: string;
          product_label: string;
          product_ref: string | null;
          price_ils: number;
          currency: string;
          validity_label: string | null;
          body: string;
          payment_url: string | null;
          lead_source: string | null;
          lead_ref: string | null;
          approved_at: string | null;
          paid_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          public_token: string;
          status?: string;
          customer_name?: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          product_kind: string;
          product_label: string;
          product_ref?: string | null;
          price_ils: number;
          currency?: string;
          validity_label?: string | null;
          body?: string;
          payment_url?: string | null;
          lead_source?: string | null;
          lead_ref?: string | null;
          approved_at?: string | null;
          paid_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          public_token?: string;
          status?: string;
          customer_name?: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          product_kind?: string;
          product_label?: string;
          product_ref?: string | null;
          price_ils?: number;
          currency?: string;
          validity_label?: string | null;
          body?: string;
          payment_url?: string | null;
          lead_source?: string | null;
          lead_ref?: string | null;
          approved_at?: string | null;
          paid_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_banners: {
        Row: {
          id: string;
          slot: string;
          title: string;
          body: string;
          cta_label: string | null;
          cta_href: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot: string;
          title: string;
          body?: string;
          cta_label?: string | null;
          cta_href?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot?: string;
          title?: string;
          body?: string;
          cta_label?: string | null;
          cta_href?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_random_video: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["videos"]["Row"][];
      };
      increment_own_watch_time: {
        Args: { p_delta: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type Concept = Database["public"]["Tables"]["concepts"]["Row"];
export type VideoTranscript =
  Database["public"]["Tables"]["video_transcripts"]["Row"];
export type VideoConcept =
  Database["public"]["Tables"]["video_concepts"]["Row"];
export type SearchAnalytics =
  Database["public"]["Tables"]["search_analytics"]["Row"];
export type SavedVideo = Database["public"]["Tables"]["saved_videos"]["Row"];
export type VideoProgress =
  Database["public"]["Tables"]["video_progress"]["Row"];
export type WatchHistory =
  Database["public"]["Tables"]["watch_history"]["Row"];
export type PreMeetingLead =
  Database["public"]["Tables"]["pre_meeting_leads"]["Row"];
export type SingleVideoLead =
  Database["public"]["Tables"]["single_video_leads"]["Row"];
export type BookingLead =
  Database["public"]["Tables"]["booking_leads"]["Row"];
export type PushSubscriber =
  Database["public"]["Tables"]["subscribers"]["Row"];
export type NewsletterSubscriber =
  Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserMeeting =
  Database["public"]["Tables"]["user_meetings"]["Row"];
export type LiveStreamConfig =
  Database["public"]["Tables"]["live_stream_config"]["Row"];
export type AuthLoginEvent =
  Database["public"]["Tables"]["auth_login_events"]["Row"];
export type ViewerFeedback =
  Database["public"]["Tables"]["viewer_feedback"]["Row"];
export type StudioQuote =
  Database["public"]["Tables"]["studio_quotes"]["Row"];
export type SiteBanner =
  Database["public"]["Tables"]["site_banners"]["Row"];
