export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string;
          slug: string;
          name: string;
          address: string;
          city: string;
          country_code: string;
          subdivision_code: string | null;
          postal_code: string | null;
          latitude: number;
          longitude: number;
          timezone: string;
          diocese: string | null;
          consecration_year: number | null;
          architectural_style: string | null;
          capacity: number | null;
          short_note: string | null;
          description: string;
          hero_image_url: string | null;
          website: string | null;
          phone: string | null;
          email: string | null;
          status: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["churches"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["churches"]["Row"]>;
      };
      ratings: {
        Row: {
          id: string;
          church_id: string;
          user_id: string;
          liturgy_quality: number;
          music: number;
          homily_clarity: number;
          vibrancy: number;
          review_text: string | null;
          is_anonymous: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["ratings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["ratings"]["Row"]>;
      };
      mass_times: {
        Row: {
          id: string;
          church_id: string;
          weekday: number;
          start_time: string;
          language_code: string;
          rite: string;
          form: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mass_times"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["mass_times"]["Row"]>;
      };
      tags: {
        Row: {
          id: string;
          slug: string;
          label_en: string;
          label_de: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
      };
      church_tags: {
        Row: {
          church_id: string;
          tag_id: string;
        };
        Insert: { church_id: string; tag_id: string };
        Update: Partial<{ church_id: string; tag_id: string }>;
      };
      invite_tokens: {
        Row: {
          id: string;
          token_hash: string;
          email: string;
          invited_by: string | null;
          role: string;
          country_code: string | null;
          subdivision_code: string | null;
          quota_override: number | null;
          redeemed_by: string | null;
          redeemed_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["invite_tokens"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["invite_tokens"]["Row"]>;
      };
      church_submissions: {
        Row: {
          id: string;
          church_name: string;
          city: string;
          country_code: string;
          timezone: string;
          payload: Json;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["church_submissions"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["church_submissions"]["Row"]>;
      };
    };
    Views: {
      church_ratings_summary: {
        Row: {
          church_id: string;
          rating_count: number;
          avg_liturgy: number;
          avg_music: number;
          avg_homily: number;
          avg_vibrancy: number;
          avg_overall: number;
        };
      };
    };
  };
};
