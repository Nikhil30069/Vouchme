export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "seeker" | "recruiter" | "referrer";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          avatar_url: string | null;
          roles: AppRole[];
          workExperience: Json | null;
          total_experience_years: number | null;
          organizations: string[] | null;
          current_organization: string | null;
          onboarded: boolean;
          calendly_url: string | null;
          availability_start: string;
          availability_end: string;
          availability_days: number[];
          availability_timezone: string;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          roles?: AppRole[];
          workExperience?: Json | null;
          total_experience_years?: number | null;
          organizations?: string[] | null;
          current_organization?: string | null;
          onboarded?: boolean;
          calendly_url?: string | null;
          availability_start?: string;
          availability_end?: string;
          availability_days?: number[];
          availability_timezone?: string;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      oauth_credentials: {
        Row: {
          user_id: string;
          provider: string;
          refresh_token: string;
          scopes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          provider?: string;
          refresh_token: string;
          scopes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["oauth_credentials"]["Insert"]>;
        Relationships: [];
      };
      job_requirements: {
        Row: {
          id: string;
          userId: string;
          type: AppRole;
          role: string;
          yearsOfExperience: number;
          currentCtc: number | null;
          expectedCtc: number | null;
          salaryBracketMin: number | null;
          salaryBracketMax: number | null;
          noticePeriod: number | null;
          readyToJoinIn: number | null;
          resumeUrl: string | null;
          createdAt: string | null;
        };
        Insert: {
          id?: string;
          userId: string;
          type: AppRole;
          role: string;
          yearsOfExperience: number;
          currentCtc?: number | null;
          expectedCtc?: number | null;
          salaryBracketMin?: number | null;
          salaryBracketMax?: number | null;
          noticePeriod?: number | null;
          readyToJoinIn?: number | null;
          resumeUrl?: string | null;
          createdAt?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["job_requirements"]["Insert"]>;
        Relationships: [];
      };
      job_postings: {
        Row: {
          id: string;
          recruiter_id: string;
          title: string | null;
          role: string;
          years_of_experience: number;
          salary_min: number | null;
          salary_max: number | null;
          description: string | null;
          requirements: string[] | null;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          recruiter_id: string;
          title?: string | null;
          role: string;
          years_of_experience: number;
          salary_min?: number | null;
          salary_max?: number | null;
          description?: string | null;
          requirements?: string[] | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["job_postings"]["Insert"]>;
        Relationships: [];
      };
      referral_requests: {
        Row: {
          id: string;
          seeker_id: string;
          referrer_id: string;
          job_requirement_id: string | null;
          job_role: string;
          seeker_experience_years: number;
          status: string;
          slot_id: string | null;
          interview_at: string | null;
          meet_link: string | null;
          hire_inclination: string | null;
          resume_url: string | null;
          google_event_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          seeker_id: string;
          referrer_id: string;
          job_requirement_id?: string | null;
          job_role: string;
          seeker_experience_years: number;
          status?: string;
          slot_id?: string | null;
          interview_at?: string | null;
          meet_link?: string | null;
          hire_inclination?: string | null;
          resume_url?: string | null;
          google_event_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["referral_requests"]["Insert"]>;
        Relationships: [];
      };
      referrer_slots: {
        Row: {
          id: string;
          referrer_id: string;
          slot_start: string;
          duration_mins: number;
          is_booked: boolean;
          booked_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          slot_start: string;
          duration_mins?: number;
          is_booked?: boolean;
          booked_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["referrer_slots"]["Insert"]>;
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          referral_request_id: string;
          referrer_id: string;
          seeker_id: string;
          parameter_id: string;
          score: number;
          comments: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          referral_request_id: string;
          referrer_id: string;
          seeker_id: string;
          parameter_id: string;
          score: number;
          comments?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["scores"]["Insert"]>;
        Relationships: [];
      };
      scoring_parameters: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          max_score: number;
          weight: number;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          max_score?: number;
          weight?: number;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["scoring_parameters"]["Insert"]>;
        Relationships: [];
      };
      strength_scores: {
        Row: {
          id: string;
          job_requirement_id: string | null;
          seeker_id: string;
          role: string;
          avg_score: number;
          total_scores: number;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          job_requirement_id?: string | null;
          seeker_id: string;
          role: string;
          avg_score?: number;
          total_scores?: number;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["strength_scores"]["Insert"]>;
        Relationships: [];
      };
      candidate_matches: {
        Row: {
          id: string;
          job_posting_id: string;
          seeker_id: string;
          recruiter_id: string;
          strength_score: number | null;
          is_interested: boolean;
          phone_unlocked: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          job_posting_id: string;
          seeker_id: string;
          recruiter_id: string;
          strength_score?: number | null;
          is_interested?: boolean;
          phone_unlocked?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["candidate_matches"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      calculate_strength_score: {
        Args: { seeker_uuid: string };
        Returns: number;
      };
      find_eligible_referrers: {
        Args: { seeker_role: string; seeker_experience: number };
        Returns: {
          referrer_id: string;
          referrer_name: string;
          referrer_role: string;
          referrer_experience: number;
          organization: string | null;
        }[];
      };
      find_eligible_referrers_for_job: {
        Args: { job_requirement_uuid: string };
        Returns: {
          referrer_id: string;
          referrer_name: string;
          referrer_role: string;
          referrer_experience: number;
          organization: string | null;
          total_experience_years: number | null;
          organizations: string[] | null;
          current_organization: string | null;
        }[];
      };
      get_top_candidates: {
        Args: { job_posting_uuid: string; limit_count?: number };
        Returns: {
          seeker_id: string;
          seeker_name: string;
          seeker_role: string;
          seeker_experience: number;
          strength_score: number;
          total_scores: number;
          expected_ctc: number | null;
          current_ctc: number | null;
        }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Tables<
  T extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][T]["Row"];
