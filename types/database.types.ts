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
    PostgrestVersion: "14.5"
  }
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
      badges: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          metadata: Json
          name: string
          tier: string
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id: string
          metadata?: Json
          name: string
          tier?: string
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          metadata?: Json
          name?: string
          tier?: string
        }
        Relationships: []
      }
      bankroll_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          description: string | null
          id: string
          kind: Database["public"]["Enums"]["bankroll_kind"]
          slip_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          description?: string | null
          id?: string
          kind: Database["public"]["Enums"]["bankroll_kind"]
          slip_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          description?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["bankroll_kind"]
          slip_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bankroll_transactions_slip_id_fkey"
            columns: ["slip_id"]
            isOneToOne: false
            referencedRelation: "slips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bankroll_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bankroll_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string
          created_at: string
          emoji: string | null
          id: string
          name: string
          short_name: string | null
          sort_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          emoji?: string | null
          id: string
          name: string
          short_name?: string | null
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          short_name?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          entity_id: number
          entity_slug: string | null
          entity_type: Database["public"]["Enums"]["follow_entity"]
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id: number
          entity_slug?: string | null
          entity_type: Database["public"]["Enums"]["follow_entity"]
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: number
          entity_slug?: string | null
          entity_type?: Database["public"]["Enums"]["follow_entity"]
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "follows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          country: string | null
          created_at: string
          external_id: string | null
          id: number
          logo_url: string | null
          metadata: Json
          name: string
          season: number | null
          short_name: string | null
          source: string
          sport: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          external_id?: string | null
          id?: number
          logo_url?: string | null
          metadata?: Json
          name: string
          season?: number | null
          short_name?: string | null
          source?: string
          sport?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          external_id?: string | null
          id?: number
          logo_url?: string | null
          metadata?: Json
          name?: string
          season?: number | null
          short_name?: string | null
          source?: string
          sport?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: number | null
          events: Json
          external_id: string | null
          home_score: number | null
          home_team_id: number | null
          id: number
          league_id: number | null
          metadata: Json
          minute: number | null
          source: string
          sport: string
          starts_at: string
          statistics: Json
          status: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id?: number | null
          events?: Json
          external_id?: string | null
          home_score?: number | null
          home_team_id?: number | null
          id?: number
          league_id?: number | null
          metadata?: Json
          minute?: number | null
          source?: string
          sport?: string
          starts_at: string
          statistics?: Json
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: number | null
          events?: Json
          external_id?: string | null
          home_score?: number | null
          home_team_id?: number | null
          id?: number
          league_id?: number | null
          metadata?: Json
          minute?: number | null
          source?: string
          sport?: string
          starts_at?: string
          statistics?: Json
          status?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      news_bookmarks: {
        Row: {
          created_at: string
          news_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          news_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          news_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_bookmarks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_bookmarks_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news_with_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "news_bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          hash: string
          id: string
          image_url: string | null
          lang: string
          link: string
          priority: number
          published_at: string
          source_id: string
          source_name: string
          tags: string[]
          title: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          hash: string
          id?: string
          image_url?: string | null
          lang?: string
          link: string
          priority?: number
          published_at: string
          source_id: string
          source_name: string
          tags?: string[]
          title: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          hash?: string
          id?: string
          image_url?: string | null
          lang?: string
          link?: string
          priority?: number
          published_at?: string
          source_id?: string
          source_name?: string
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          kind: Database["public"]["Enums"]["notif_kind"]
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind: Database["public"]["Enums"]["notif_kind"]
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind?: Database["public"]["Enums"]["notif_kind"]
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bankroll_cents: number
          base_currency: string
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          prefs: Json
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bankroll_cents?: number
          base_currency?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          prefs?: Json
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bankroll_cents?: number
          base_currency?: string
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          prefs?: Json
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      slip_picks: {
        Row: {
          id: string
          market: string
          match_id: number | null
          odds: number
          position: number
          resolved_at: string | null
          selection: string
          slip_id: string
          status: Database["public"]["Enums"]["pick_status"]
        }
        Insert: {
          id?: string
          market: string
          match_id?: number | null
          odds: number
          position?: number
          resolved_at?: string | null
          selection: string
          slip_id: string
          status?: Database["public"]["Enums"]["pick_status"]
        }
        Update: {
          id?: string
          market?: string
          match_id?: number | null
          odds?: number
          position?: number
          resolved_at?: string | null
          selection?: string
          slip_id?: string
          status?: Database["public"]["Enums"]["pick_status"]
        }
        Relationships: [
          {
            foreignKeyName: "slip_picks_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slip_picks_slip_id_fkey"
            columns: ["slip_id"]
            isOneToOne: false
            referencedRelation: "slips"
            referencedColumns: ["id"]
          },
        ]
      }
      slips: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          notes: string | null
          potential_win_cents: number | null
          settled_at: string | null
          share_token: string | null
          stake_cents: number
          status: Database["public"]["Enums"]["slip_status"]
          title: string | null
          total_odds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          notes?: string | null
          potential_win_cents?: number | null
          settled_at?: string | null
          share_token?: string | null
          stake_cents: number
          status?: Database["public"]["Enums"]["slip_status"]
          title?: string | null
          total_odds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          notes?: string | null
          potential_win_cents?: number | null
          settled_at?: string | null
          share_token?: string | null
          stake_cents?: number
          status?: Database["public"]["Enums"]["slip_status"]
          title?: string | null
          total_odds?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "slips_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          country: string | null
          created_at: string
          external_id: string | null
          id: number
          league_id: number | null
          logo_url: string | null
          metadata: Json
          name: string
          short_name: string | null
          source: string
          sport: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          external_id?: string | null
          id?: number
          league_id?: number | null
          logo_url?: string | null
          metadata?: Json
          name: string
          short_name?: string | null
          source?: string
          sport?: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          external_id?: string | null
          id?: number
          league_id?: number | null
          logo_url?: string | null
          metadata?: Json
          name?: string
          short_name?: string | null
          source?: string
          sport?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard_view"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_view: {
        Row: {
          avatar_url: string | null
          losses: number | null
          profit_cents: number | null
          roi_pct: number | null
          total_slips: number | null
          user_id: string | null
          username: string | null
          wins: number | null
        }
        Relationships: []
      }
      news_with_category: {
        Row: {
          category_color: string | null
          category_emoji: string | null
          category_id: string | null
          category_name: string | null
          category_sort: number | null
          created_at: string | null
          description: string | null
          hash: string | null
          id: string | null
          image_url: string | null
          lang: string | null
          link: string | null
          priority: number | null
          published_at: string | null
          source_id: string | null
          source_name: string | null
          tags: string[] | null
          title: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      bytea_to_text: { Args: { data: string }; Returns: string }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      news_count_by_category: {
        Args: never
        Returns: {
          category_id: string
          count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      text_to_bytea: { Args: { data: string }; Returns: string }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
    }
    Enums: {
      bankroll_kind: "deposit" | "withdraw" | "stake" | "win" | "adjust"
      follow_entity: "team" | "league" | "competition" | "category"
      notif_kind:
        | "match_start"
        | "slip_settled"
        | "badge_unlocked"
        | "news_followed"
        | "system"
      pick_status: "pending" | "won" | "lost" | "void"
      slip_status: "open" | "won" | "lost" | "void" | "cashout"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
    Enums: {
      bankroll_kind: ["deposit", "withdraw", "stake", "win", "adjust"],
      follow_entity: ["team", "league", "competition", "category"],
      notif_kind: [
        "match_start",
        "slip_settled",
        "badge_unlocked",
        "news_followed",
        "system",
      ],
      pick_status: ["pending", "won", "lost", "void"],
      slip_status: ["open", "won", "lost", "void", "cashout"],
    },
  },
} as const
