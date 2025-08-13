export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      candidate_matches: {
        Row: {
          created_at: string | null
          id: string
          is_interested: boolean
          job_posting_id: string
          phone_unlocked: boolean
          recruiter_id: string
          seeker_id: string
          strength_score: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_interested?: boolean
          job_posting_id: string
          phone_unlocked?: boolean
          recruiter_id: string
          seeker_id: string
          strength_score?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_interested?: boolean
          job_posting_id?: string
          phone_unlocked?: boolean
          recruiter_id?: string
          seeker_id?: string
          strength_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_matches_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_matches_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_matches_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          recruiter_id: string
          requirements: string[] | null
          role: string
          salary_max: number | null
          salary_min: number | null
          updated_at: string | null
          years_of_experience: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          recruiter_id: string
          requirements?: string[] | null
          role: string
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string | null
          years_of_experience: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          recruiter_id?: string
          requirements?: string[] | null
          role?: string
          salary_max?: number | null
          salary_min?: number | null
          updated_at?: string | null
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          current_organization: string | null
          email: string | null
          id: string
          name: string | null
          organizations: string[] | null
          persona: string | null
          phone: string | null
          total_experience_years: number | null
          updated_at: string | null
          work_experience: Json | null
        }
        Insert: {
          created_at?: string | null
          current_organization?: string | null
          email?: string | null
          id: string
          name?: string | null
          organizations?: string[] | null
          persona?: string | null
          phone?: string | null
          total_experience_years?: number | null
          updated_at?: string | null
          work_experience?: Json | null
        }
        Update: {
          created_at?: string | null
          current_organization?: string | null
          email?: string | null
          id?: string
          name?: string | null
          organizations?: string[] | null
          persona?: string | null
          phone?: string | null
          total_experience_years?: number | null
          updated_at?: string | null
          work_experience?: Json | null
        }
        Relationships: []
      }
      referral_requests: {
        Row: {
          created_at: string | null
          id: string
          job_requirement_id: string | null
          job_role: string
          referrer_id: string
          seeker_experience_years: number
          seeker_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_requirement_id?: string | null
          job_role: string
          referrer_id: string
          seeker_experience_years: number
          seeker_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_requirement_id?: string | null
          job_role?: string
          referrer_id?: string
          seeker_experience_years?: number
          seeker_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_requests_job_requirement_id_fkey"
            columns: ["job_requirement_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_requests_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_requests_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scores: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          parameter_id: string
          referral_request_id: string
          referrer_id: string
          score: number
          seeker_id: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          parameter_id: string
          referral_request_id: string
          referrer_id: string
          score: number
          seeker_id: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          parameter_id?: string
          referral_request_id?: string
          referrer_id?: string
          score?: number
          seeker_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "scoring_parameters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_referral_request_id_fkey"
            columns: ["referral_request_id"]
            isOneToOne: false
            referencedRelation: "referral_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scores_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scoring_parameters: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          max_score: number
          name: string
          updated_at: string | null
          weight: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          name: string
          updated_at?: string | null
          weight?: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_score?: number
          name?: string
          updated_at?: string | null
          weight?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_strength_score: {
        Args: { seeker_uuid: string }
        Returns: number
      }
      debug_get_job_postings: {
        Args: Record<PropertyKey, never>
        Returns: {
          salary_max: number
          job_role: string
          min_experience: number
          salary_min: number
          job_id: string
        }[]
      }
      debug_get_seekers_with_scores: {
        Args: Record<PropertyKey, never>
        Returns: {
          seeker_name: string
          seeker_persona: string
          work_experience_json: Json
          score_count: number
          seeker_id: string
        }[]
      }
      debug_get_top_candidates: {
        Args: { job_posting_uuid: string }
        Returns: {
          expected_ctc: number
          seeker_id: string
          seeker_name: string
          seeker_role: string
          seeker_experience: number
          current_ctc: number
          job_min_exp: number
          score_count: number
          job_salary_max: number
          job_salary_min: number
        }[]
      }
      find_eligible_referrers: {
        Args: { seeker_experience: number; seeker_role: string }
        Returns: {
          referrer_role: string
          referrer_name: string
          referrer_id: string
          organization: string
          referrer_experience: number
        }[]
      }
      find_eligible_referrers_for_job: {
        Args: { job_requirement_uuid: string }
        Returns: {
          referrer_name: string
          referrer_id: string
          referrer_role: string
          referrer_experience: number
          organization: string
          total_experience_years: number
          organizations: string[]
          current_organization: string
        }[]
      }
      get_top_candidates: {
        Args: { job_posting_uuid: string; limit_count?: number }
        Returns: {
          total_scores: number
          seeker_experience: number
          seeker_role: string
          seeker_name: string
          expected_ctc: number
          seeker_id: string
          current_ctc: number
          strength_score: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

