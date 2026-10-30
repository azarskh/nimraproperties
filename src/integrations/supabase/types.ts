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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_ref: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_ref?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_ref?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          about_text: string | null
          address: string | null
          business_name: string
          call_phone: string
          email: string
          id: number
          photo_shoot_charge: number
          updated_at: string
          whatsapp_phone: string
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          business_name?: string
          call_phone?: string
          email?: string
          id?: number
          photo_shoot_charge?: number
          updated_at?: string
          whatsapp_phone?: string
        }
        Update: {
          about_text?: string | null
          address?: string | null
          business_name?: string
          call_phone?: string
          email?: string
          id?: number
          photo_shoot_charge?: number
          updated_at?: string
          whatsapp_phone?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          kind: string
          message: string | null
          name: string
          notes: string | null
          phone: string
          property_id: string | null
          ref_code: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          property_id?: string | null
          ref_code?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string
          property_id?: string | null
          ref_code?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_packages: {
        Row: {
          created_at: string
          description: string | null
          duration_days: number
          features: string[]
          id: string
          includes_photo_shoot: boolean
          is_active: boolean
          name: string
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: string[]
          id?: string
          includes_photo_shoot?: boolean
          is_active?: boolean
          name: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: string[]
          id?: string
          includes_photo_shoot?: boolean
          is_active?: boolean
          name?: string
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          application_id: string | null
          created_at: string
          id: string
          method: string
          notes: string | null
          paid_on: string | null
          payer_name: string | null
          photo_shoot_id: string | null
          purpose: string
          ref_code: string | null
          reference_no: string | null
          status: string
          updated_at: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          application_id?: string | null
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_on?: string | null
          payer_name?: string | null
          photo_shoot_id?: string | null
          purpose?: string
          ref_code?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          application_id?: string | null
          created_at?: string
          id?: string
          method?: string
          notes?: string | null
          paid_on?: string | null
          payer_name?: string | null
          photo_shoot_id?: string | null
          purpose?: string
          ref_code?: string | null
          reference_no?: string | null
          status?: string
          updated_at?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pay_shoot_fk"
            columns: ["photo_shoot_id"]
            isOneToOne: false
            referencedRelation: "photo_shoots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "seller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_shoots: {
        Row: {
          address: string | null
          application_id: string | null
          charge: number
          contact_name: string
          contact_phone: string
          created_at: string
          id: string
          notes: string | null
          payment_id: string | null
          payment_status: string
          property_id: string | null
          ref_code: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          charge?: number
          contact_name: string
          contact_phone: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          property_id?: string | null
          ref_code?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          application_id?: string | null
          charge?: number
          contact_name?: string
          contact_phone?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_id?: string | null
          payment_status?: string
          property_id?: string | null
          ref_code?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_shoots_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "seller_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_shoots_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_shoots_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string | null
          amenities: string[]
          application_id: string | null
          bhk: string | null
          builtup_area: number | null
          carpet_area: number | null
          category: string
          city: string
          created_at: string
          deposit: number | null
          description: string | null
          facing: string | null
          featured: boolean
          floor_number: number | null
          furnishing: string | null
          id: string
          interest_count: number
          landmarks: Json
          latitude: number | null
          locality: string
          longitude: number | null
          maintenance: number | null
          owner_email: string | null
          owner_name: string | null
          owner_phone: string | null
          parking: string | null
          photos: string[]
          possession_status: string | null
          price: number
          price_negotiable: boolean
          project_name: string | null
          property_age: string | null
          property_type: string
          published_at: string | null
          purpose: string
          ref_code: string | null
          slug: string
          source_type: string
          status: string
          title: string
          total_floors: number | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          application_id?: string | null
          bhk?: string | null
          builtup_area?: number | null
          carpet_area?: number | null
          category?: string
          city?: string
          created_at?: string
          deposit?: number | null
          description?: string | null
          facing?: string | null
          featured?: boolean
          floor_number?: number | null
          furnishing?: string | null
          id?: string
          interest_count?: number
          landmarks?: Json
          latitude?: number | null
          locality?: string
          longitude?: number | null
          maintenance?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking?: string | null
          photos?: string[]
          possession_status?: string | null
          price?: number
          price_negotiable?: boolean
          project_name?: string | null
          property_age?: string | null
          property_type: string
          published_at?: string | null
          purpose?: string
          ref_code?: string | null
          slug: string
          source_type?: string
          status?: string
          title: string
          total_floors?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          application_id?: string | null
          bhk?: string | null
          builtup_area?: number | null
          carpet_area?: number | null
          category?: string
          city?: string
          created_at?: string
          deposit?: number | null
          description?: string | null
          facing?: string | null
          featured?: boolean
          floor_number?: number | null
          furnishing?: string | null
          id?: string
          interest_count?: number
          landmarks?: Json
          latitude?: number | null
          locality?: string
          longitude?: number | null
          maintenance?: number | null
          owner_email?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          parking?: string | null
          photos?: string[]
          possession_status?: string | null
          price?: number
          price_negotiable?: boolean
          project_name?: string | null
          property_age?: string | null
          property_type?: string
          published_at?: string | null
          purpose?: string
          ref_code?: string | null
          slug?: string
          source_type?: string
          status?: string
          title?: string
          total_floors?: number | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "seller_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ref_counters: {
        Row: {
          last_value: number
          prefix: string
        }
        Insert: {
          last_value?: number
          prefix: string
        }
        Update: {
          last_value?: number
          prefix?: string
        }
        Relationships: []
      }
      seller_applications: {
        Row: {
          admin_notes: string | null
          category: string
          city: string | null
          created_at: string
          details: Json
          expected_price: number | null
          id: string
          locality: string | null
          owner_email: string | null
          owner_name: string
          owner_phone: string
          owner_whatsapp: string | null
          package_id: string | null
          package_snapshot: Json | null
          photo_paths: string[]
          photo_shoot_requested: boolean
          property_id: string | null
          property_type: string
          purpose: string
          ref_code: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          city?: string | null
          created_at?: string
          details?: Json
          expected_price?: number | null
          id?: string
          locality?: string | null
          owner_email?: string | null
          owner_name: string
          owner_phone: string
          owner_whatsapp?: string | null
          package_id?: string | null
          package_snapshot?: Json | null
          photo_paths?: string[]
          photo_shoot_requested?: boolean
          property_id?: string | null
          property_type: string
          purpose: string
          ref_code?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          city?: string | null
          created_at?: string
          details?: Json
          expected_price?: number | null
          id?: string
          locality?: string | null
          owner_email?: string | null
          owner_name?: string
          owner_phone?: string
          owner_whatsapp?: string | null
          package_id?: string | null
          package_snapshot?: Json | null
          photo_paths?: string[]
          photo_shoot_requested?: boolean
          property_id?: string | null
          property_type?: string
          purpose?: string
          ref_code?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_property_fk"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_applications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "listing_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_visits: {
        Row: {
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string
          email: string | null
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string
          property_id: string | null
          ref_code: string | null
          requested_date: string
          requested_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone: string
          property_id?: string | null
          ref_code?: string | null
          requested_date: string
          requested_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string
          property_id?: string | null
          ref_code?: string | null
          requested_date?: string
          requested_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      next_ref: { Args: { _prefix: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "staff"],
    },
  },
} as const
