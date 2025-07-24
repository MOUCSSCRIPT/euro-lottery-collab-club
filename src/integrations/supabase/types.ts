export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      draws: {
        Row: {
          created_at: string
          draw_date: string
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          jackpot: number | null
          status: string | null
          winning_numbers: number[]
          winning_stars: number[] | null
        }
        Insert: {
          created_at?: string
          draw_date: string
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          jackpot?: number | null
          status?: string | null
          winning_numbers: number[]
          winning_stars?: number[] | null
        }
        Update: {
          created_at?: string
          draw_date?: string
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          jackpot?: number | null
          status?: string | null
          winning_numbers?: number[]
          winning_stars?: number[] | null
        }
        Relationships: []
      }
      group_grids: {
        Row: {
          cost: number
          created_at: string
          created_by: string | null
          draw_date: string | null
          grid_number: number
          group_id: string
          id: string
          is_active: boolean | null
          numbers: number[]
          player_name: string | null
          stars: number[] | null
        }
        Insert: {
          cost: number
          created_at?: string
          created_by?: string | null
          draw_date?: string | null
          grid_number: number
          group_id: string
          id?: string
          is_active?: boolean | null
          numbers: number[]
          player_name?: string | null
          stars?: number[] | null
        }
        Update: {
          cost?: number
          created_at?: string
          created_by?: string | null
          draw_date?: string | null
          grid_number?: number
          group_id?: string
          id?: string
          is_active?: boolean | null
          numbers?: number[]
          player_name?: string | null
          stars?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "group_grids_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_invitations: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          group_id: string
          id: string
          invitation_code: string
          invited_by: string
          status: string | null
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at?: string
          group_id: string
          id?: string
          invitation_code: string
          invited_by: string
          status?: string | null
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          group_id?: string
          id?: string
          invitation_code?: string
          invited_by?: string
          status?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_invitations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          contribution: number
          group_id: string
          id: string
          joined_at: string
          percentage: number
          user_id: string
        }
        Insert: {
          contribution: number
          group_id: string
          id?: string
          joined_at?: string
          percentage: number
          user_id: string
        }
        Update: {
          contribution?: number
          group_id?: string
          id?: string
          joined_at?: string
          percentage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          game_type: Database["public"]["Enums"]["game_type"]
          grids_count: number
          id: string
          max_members: number
          mode: Database["public"]["Enums"]["group_mode"]
          name: string
          next_draw_date: string | null
          status: string
          team_code: string
          total_budget: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          grids_count?: number
          id?: string
          max_members?: number
          mode?: Database["public"]["Enums"]["group_mode"]
          name: string
          next_draw_date?: string | null
          status?: string
          team_code?: string
          total_budget?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          game_type?: Database["public"]["Enums"]["game_type"]
          grids_count?: number
          id?: string
          max_members?: number
          mode?: Database["public"]["Enums"]["group_mode"]
          name?: string
          next_draw_date?: string | null
          status?: string
          team_code?: string
          total_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      loto_foot_matches: {
        Row: {
          created_at: string
          group_id: string
          id: string
          match_date: string | null
          match_position: number
          team_away: string
          team_home: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          match_date?: string | null
          match_position: number
          team_away: string
          team_home: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          match_date?: string | null
          match_position?: number
          team_away?: string
          team_home?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          coins: number
          country: string | null
          created_at: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          coins?: number
          country?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          coins?: number
          country?: string | null
          created_at?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      team_join_requests: {
        Row: {
          created_at: string
          group_id: string
          id: string
          message: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          message?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_join_requests_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      accessible_group_ids: {
        Row: {
          group_id: string | null
        }
        Insert: {
          group_id?: string | null
        }
        Update: {
          group_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_team_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_group_creator: {
        Args: { check_group_id: string; check_user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { check_group_id: string; check_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      game_type: "euromillions"
      group_mode: "demo" | "real"
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
      game_type: ["euromillions"],
      group_mode: ["demo", "real"],
    },
  },
} as const
