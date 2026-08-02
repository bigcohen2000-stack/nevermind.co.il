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
        };
        Relationships: [];
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
          created_at: string;
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
          created_at?: string;
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
          created_at?: string;
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
        };
        Insert: {
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          is_premium: boolean;
          has_video_access: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          is_premium?: boolean;
          has_video_access?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          is_premium?: boolean;
          has_video_access?: boolean;
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
      club_login_events: {
        Row: {
          id: string;
          phone: string;
          token_id: string | null;
          source: string;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          token_id?: string | null;
          source?: string;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
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
    };
    Views: Record<string, never>;
    Functions: {
      get_random_video: {
        Args: Record<PropertyKey, never>;
        Returns: Database["public"]["Tables"]["videos"]["Row"][];
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
export type PushSubscriber =
  Database["public"]["Tables"]["subscribers"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type AuthLoginEvent =
  Database["public"]["Tables"]["auth_login_events"]["Row"];
