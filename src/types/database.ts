export type CourseStatus = "preparing" | "confirmed" | "ended" | "cancelled";
export type PreparationCategory = "planning" | "instagram" | "youtube" | "landing" | "materials" | "other";
export type PreparationStatus = "not_started" | "in_progress" | "completed" | "blocked";
export type CourseContentType = "instagram_dm" | "contract_template";

export type Course = {
  id: string;
  title: string;
  instructor_name: string | null;
  webinar_at: string | null;
  opening_at: string | null;
  status: CourseStatus;
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

export type ShortUrlClick = {
  id: string;
  landing_page_id: string;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
};

export type LandingPageTraffic = {
  total: number;
  today: number;
  thisWeek: number;
  recent: ShortUrlClick[];
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

export type CoursePreparationTask = {
  id: string;
  course_id: string;
  category: PreparationCategory;
  title: string;
  status: PreparationStatus;
  progress_percent: number;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseContentDocument = {
  id: string;
  course_id: string;
  content_type: CourseContentType;
  content: string;
  created_at: string;
  updated_at: string;
};

export type GlobalCourseLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CourseBundle = {
  course: Course;
  preparationTasks: CoursePreparationTask[];
  contentDocuments: CourseContentDocument[];
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
          status?: CourseStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Course, "id" | "created_at">>;
        Relationships: [];
      };
      course_preparation_tasks: {
        Row: CoursePreparationTask;
        Insert: {
          id?: string;
          course_id: string;
          category?: PreparationCategory;
          title: string;
          status?: PreparationStatus;
          progress_percent?: number;
          start_date?: string | null;
          due_date?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CoursePreparationTask, "id" | "course_id" | "created_at">>;
        Relationships: [];
      };
      course_content_documents: {
        Row: CourseContentDocument;
        Insert: {
          id?: string;
          course_id: string;
          content_type: CourseContentType;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<CourseContentDocument, "id" | "course_id" | "content_type" | "created_at">>;
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
      short_url_clicks: {
        Row: ShortUrlClick;
        Insert: {
          id?: string;
          landing_page_id: string;
          clicked_at?: string;
          referrer?: string | null;
          user_agent?: string | null;
          country_code?: string | null;
          region?: string | null;
          city?: string | null;
        };
        Update: Partial<Omit<ShortUrlClick, "id" | "landing_page_id">>;
        Relationships: [];
      };
      global_course_links: {
        Row: GlobalCourseLink;
        Insert: {
          id?: string;
          title: string;
          url: string;
          description?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<GlobalCourseLink, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
