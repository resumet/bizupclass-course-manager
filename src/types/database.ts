export type Course = {
  id: string;
  title: string;
  instructor_name: string | null;
  webinar_at: string | null;
  opening_at: string | null;
  created_at: string;
  updated_at: string;
};

export type YoutubeAppearance = {
  id: string;
  course_id: string;
  channel_name: string;
  appearance_fee: number;
  revenue_share: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  filming_at: string | null;
  youtube_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LandingPage = {
  id: string;
  course_id: string;
  name: string;
  original_url: string;
  short_code: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SharedResource = {
  id: string;
  course_id: string;
  name: string;
  resource_type: string | null;
  url: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseBundle = {
  course: Course;
  youtube: YoutubeAppearance[];
  landingPages: LandingPage[];
  resources: SharedResource[];
};

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: Course;
        Insert: {
          id?: string;
          title: string;
          instructor_name?: string | null;
          webinar_at?: string | null;
          opening_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Course, "id" | "created_at">>;
        Relationships: [];
      };
      youtube_appearances: {
        Row: YoutubeAppearance;
        Insert: {
          id?: string;
          course_id: string;
          channel_name: string;
          appearance_fee?: number;
          revenue_share?: number | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          filming_at?: string | null;
          youtube_url?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<YoutubeAppearance, "id" | "course_id" | "created_at">>;
        Relationships: [];
      };
      landing_pages: {
        Row: LandingPage;
        Insert: {
          id?: string;
          course_id: string;
          name: string;
          original_url: string;
          short_code: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<LandingPage, "id" | "course_id" | "created_at">>;
        Relationships: [];
      };
      shared_resources: {
        Row: SharedResource;
        Insert: {
          id?: string;
          course_id: string;
          name: string;
          resource_type?: string | null;
          url: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<SharedResource, "id" | "course_id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
