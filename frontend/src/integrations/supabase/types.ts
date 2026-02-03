export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      reports: {
        Row: {
          address: string | null
          after_image_url: string | null
          ai_confidence: number | null
          ai_description: string | null
          assigned_to: string | null
          before_image_url: string
          category: Database["public"]["Enums"]["issue_category"]
          citizen_feedback: string | null
          citizen_verified: boolean | null
          cluster_id: string | null
          created_at: string
          id: string
          landmark: string | null
          latitude: number
          longitude: number
          priority: Database["public"]["Enums"]["priority_level"]
          reporter_count: number | null
          reporter_name: string | null
          reporter_phone: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
          ward: string | null
        }
        Insert: {
          address?: string | null
          after_image_url?: string | null
          ai_confidence?: number | null
          ai_description?: string | null
          assigned_to?: string | null
          before_image_url: string
          category?: Database["public"]["Enums"]["issue_category"]
          citizen_feedback?: string | null
          citizen_verified?: boolean | null
          cluster_id?: string | null
          created_at?: string
          id?: string
          landmark?: string | null
          latitude: number
          longitude: number
          priority?: Database["public"]["Enums"]["priority_level"]
          reporter_count?: number | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          ward?: string | null
        }
        Update: {
          address?: string | null
          after_image_url?: string | null
          ai_confidence?: number | null
          ai_description?: string | null
          assigned_to?: string | null
          before_image_url?: string
          category?: Database["public"]["Enums"]["issue_category"]
          citizen_feedback?: string | null
          citizen_verified?: boolean | null
          cluster_id?: string | null
          created_at?: string
          id?: string
          landmark?: string | null
          latitude?: number
          longitude?: number
          priority?: Database["public"]["Enums"]["priority_level"]
          reporter_count?: number | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
          ward?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_reports: {
        Row: {
          address: string | null
          after_image_url: string | null
          ai_confidence: number | null
          ai_description: string | null
          assigned_to: string | null
          before_image_url: string | null
          category: Database["public"]["Enums"]["issue_category"] | null
          citizen_feedback: string | null
          citizen_verified: boolean | null
          cluster_id: string | null
          created_at: string | null
          id: string | null
          landmark: string | null
          latitude: number | null
          longitude: number | null
          priority: Database["public"]["Enums"]["priority_level"] | null
          reporter_count: number | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["report_status"] | null
          updated_at: string | null
          ward: string | null
        }
        Insert: {
          address?: string | null
          after_image_url?: string | null
          ai_confidence?: number | null
          ai_description?: string | null
          assigned_to?: string | null
          before_image_url?: string | null
          category?: Database["public"]["Enums"]["issue_category"] | null
          citizen_feedback?: string | null
          citizen_verified?: boolean | null
          cluster_id?: string | null
          created_at?: string | null
          id?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          reporter_count?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          ward?: string | null
        }
        Update: {
          address?: string | null
          after_image_url?: string | null
          ai_confidence?: number | null
          ai_description?: string | null
          assigned_to?: string | null
          before_image_url?: string | null
          category?: Database["public"]["Enums"]["issue_category"] | null
          citizen_feedback?: string | null
          citizen_verified?: boolean | null
          cluster_id?: string | null
          created_at?: string | null
          id?: string | null
          landmark?: string | null
          latitude?: number | null
          longitude?: number | null
          priority?: Database["public"]["Enums"]["priority_level"] | null
          reporter_count?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["report_status"] | null
          updated_at?: string | null
          ward?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_report_feedback: {
        Args: { report_id: string; verified: boolean }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      issue_category:
        | "garbage_dump"
        | "dustbin_not_cleaned"
        | "burning_garbage"
        | "open_manhole"
        | "stagnant_water"
        | "dead_animal"
        | "sewage_overflow"
        | "sweeping_not_done"
        | "other"
      priority_level: "low" | "medium" | "high" | "critical"
      report_status: "pending" | "in_progress" | "resolved" | "duplicate"
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
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      issue_category: [
        "garbage_dump",
        "dustbin_not_cleaned",
        "burning_garbage",
        "open_manhole",
        "stagnant_water",
        "dead_animal",
        "sewage_overflow",
        "sweeping_not_done",
        "other",
      ],
      priority_level: ["low", "medium", "high", "critical"],
      report_status: ["pending", "in_progress", "resolved", "duplicate"],
    },
  },
} as const
