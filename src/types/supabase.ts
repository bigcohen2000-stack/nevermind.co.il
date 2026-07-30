/**
 * Manual Database stub matching supabase/migrations/01_init.sql.
 * Replace with generated types after running:
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
          description: string;
          thumbnail_url: string | null;
          playlist_id: string | null;
          is_unlisted: boolean;
          is_gated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          title: string;
          description?: string;
          thumbnail_url?: string | null;
          playlist_id?: string | null;
          is_unlisted?: boolean;
          is_gated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          youtube_id?: string;
          title?: string;
          description?: string;
          thumbnail_url?: string | null;
          playlist_id?: string | null;
          is_unlisted?: boolean;
          is_gated?: boolean;
          created_at?: string;
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
        };
        Insert: {
          video_id: string;
          content?: string;
          search_vector?: unknown | null;
        };
        Update: {
          video_id?: string;
          content?: string;
          search_vector?: unknown | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Video = Database["public"]["Tables"]["videos"]["Row"];
export type Concept = Database["public"]["Tables"]["concepts"]["Row"];
