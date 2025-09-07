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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      coin_purchases: {
        Row: {
          amount: number
          coins: number
          created_at: string
          id: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          coins: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          coins?: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      draw_results: {
        Row: {
          created_at: string
          draw_date: string
          id: string
          jackpot_amount: number | null
          updated_at: string
          winning_numbers: number[]
          winning_stars: number[]
        }
        Insert: {
          created_at?: string
          draw_date: string
          id?: string
          jackpot_amount?: number | null
          updated_at?: string
          winning_numbers: number[]
          winning_stars: number[]
        }
        Update: {
          created_at?: string
          draw_date?: string
          id?: string
          jackpot_amount?: number | null
          updated_at?: string
          winning_numbers?: number[]
          winning_stars?: number[]
        }
        Relationships: []
      }
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
      grid_wins: {
        Row: {
          created_at: string
          draw_result_id: string
          grid_id: string
          id: string
          matched_numbers: number
          matched_stars: number
          prize_amount: number | null
          prize_rank: number | null
        }
        Insert: {
          created_at?: string
          draw_result_id: string
          grid_id: string
          id?: string
          matched_numbers?: number
          matched_stars?: number
          prize_amount?: number | null
          prize_rank?: number | null
        }
        Update: {
          created_at?: string
          draw_result_id?: string
          grid_id?: string
          id?: string
          matched_numbers?: number
          matched_stars?: number
          prize_amount?: number | null
          prize_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grid_wins_draw_result_id_fkey"
            columns: ["draw_result_id"]
            isOneToOne: false
            referencedRelation: "draw_results"
            referencedColumns: ["id"]
          },
        ]
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
          play_deadline: string | null
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
          play_deadline?: string | null
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
          play_deadline?: string | null
          status?: string
          team_code?: string
          total_budget?: number
          updated_at?: string
        }
        Relationships: []
      }
      loto_foot_grids: {
        Row: {
          cost: number
          created_at: string
          created_by: string | null
          draw_date: string
          grid_number: number
          group_id: string
          id: string
          is_active: boolean | null
          player_name: string | null
          potential_winnings: number
          predictions: Json
          stake: number
        }
        Insert: {
          cost: number
          created_at?: string
          created_by?: string | null
          draw_date: string
          grid_number: number
          group_id: string
          id?: string
          is_active?: boolean | null
          player_name?: string | null
          potential_winnings?: number
          predictions: Json
          stake?: number
        }
        Update: {
          cost?: number
          created_at?: string
          created_by?: string | null
          draw_date?: string
          grid_number?: number
          group_id?: string
          id?: string
          is_active?: boolean | null
          player_name?: string | null
          potential_winnings?: number
          predictions?: Json
          stake?: number
        }
        Relationships: [
          {
            foreignKeyName: "loto_foot_grids_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      loto_foot_matches: {
        Row: {
          away_team: string
          created_at: string
          draw_date: string
          home_team: string
          id: string
          match_datetime: string
          match_position: number
          result: string | null
          status: string
          updated_at: string
        }
        Insert: {
          away_team: string
          created_at?: string
          draw_date: string
          home_team: string
          id?: string
          match_datetime: string
          match_position: number
          result?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          away_team?: string
          created_at?: string
          draw_date?: string
          home_team?: string
          id?: string
          match_datetime?: string
          match_position?: number
          result?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      loto_foot_wins: {
        Row: {
          correct_predictions: number
          created_at: string
          draw_date: string
          grid_id: string
          id: string
          prize_amount: number | null
          prize_rank: number | null
        }
        Insert: {
          correct_predictions: number
          created_at?: string
          draw_date: string
          grid_id: string
          id?: string
          prize_amount?: number | null
          prize_rank?: number | null
        }
        Update: {
          correct_predictions?: number
          created_at?: string
          draw_date?: string
          grid_id?: string
          id?: string
          prize_amount?: number | null
          prize_rank?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loto_foot_wins_grid_id_fkey"
            columns: ["grid_id"]
            isOneToOne: false
            referencedRelation: "loto_foot_grids"
            referencedColumns: ["id"]
          },
        ]
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
      user_grids: {
        Row: {
          cost: number
          created_at: string
          draw_date: string | null
          grid_number: number | null
          id: string
          is_active: boolean | null
          numbers: number[]
          player_name: string | null
          stars: number[]
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          draw_date?: string | null
          grid_number?: number | null
          id?: string
          is_active?: boolean | null
          numbers: number[]
          player_name?: string | null
          stars: number[]
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          draw_date?: string | null
          grid_number?: number | null
          id?: string
          is_active?: boolean | null
          numbers?: number[]
          player_name?: string | null
          stars?: number[]
          user_id?: string
        }
        Relationships: []
      }
      user_loto_foot_grids: {
        Row: {
          cost: number
          created_at: string
          draw_date: string
          id: string
          is_active: boolean | null
          player_name: string | null
          potential_winnings: number
          predictions: Json
          stake: number
          user_id: string
        }
        Insert: {
          cost: number
          created_at?: string
          draw_date: string
          id?: string
          is_active?: boolean | null
          player_name?: string | null
          potential_winnings?: number
          predictions: Json
          stake?: number
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string
          draw_date?: string
          id?: string
          is_active?: boolean | null
          player_name?: string | null
          potential_winnings?: number
          predictions?: Json
          stake?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      add_coins_to_user: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
      check_grid_wins: {
        Args: {
          p_draw_result_id: string
          p_winning_numbers: number[]
          p_winning_stars: number[]
        }
        Returns: undefined
      }
      generate_invitation_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_team_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_creator: {
        Args: { check_group_id: string; check_user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { check_group_id: string; check_user_id: string }
        Returns: boolean
      }
      set_user_coins: {
        Args: { _amount: number; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      game_type: "euromillions" | "loto_foot"
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
      app_role: ["admin", "moderator", "user"],
      game_type: ["euromillions", "loto_foot"],
      group_mode: ["demo", "real"],
    },
  },
} as const
