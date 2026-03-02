// Auto-generated from actual Supabase schema — DO NOT EDIT MANUALLY
// Generated: 2026-02-18 from schema provided by user

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {

      // ─── user_profiles ───────────────────────────────────────────────
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          date_of_birth: string | null
          role: 'client' | 'business_owner' | 'admin' | null
          completed_bookings_count: number | null
          loyalty_points: number | null
          referral_code: string | null
          referred_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          role?: 'client' | 'business_owner' | 'admin' | null
          completed_bookings_count?: number | null
          loyalty_points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          date_of_birth?: string | null
          role?: 'client' | 'business_owner' | 'admin' | null
          completed_bookings_count?: number | null
          loyalty_points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // ─── businesses ──────────────────────────────────────────────────
      businesses: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string
          city: string
          phone: string | null
          email: string | null
          website: string | null
          category: string
          rating: number | null
          review_count: number | null
          coordinates: Json | null
          owner_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'suspended' | null
          commission_rate: number | null
          total_commission_owed: number | null
          total_validated_bookings: number | null
          working_hours: Json | null
          special_dates: Json | null
          likes_count: number
          dislikes_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address: string
          city: string
          phone?: string | null
          email?: string | null
          website?: string | null
          category: string
          rating?: number | null
          review_count?: number | null
          coordinates?: Json | null
          owner_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended' | null
          commission_rate?: number | null
          total_commission_owed?: number | null
          total_validated_bookings?: number | null
          working_hours?: Json | null
          special_dates?: Json | null
          likes_count?: number
          dislikes_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string
          city?: string
          phone?: string | null
          email?: string | null
          website?: string | null
          category?: string
          rating?: number | null
          review_count?: number | null
          coordinates?: Json | null
          owner_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'suspended' | null
          commission_rate?: number | null
          total_commission_owed?: number | null
          total_validated_bookings?: number | null
          working_hours?: Json | null
          special_dates?: Json | null
          likes_count?: number
          dislikes_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // ─── categories ──────────────────────────────────────────────────
      categories: {
        Row: {
          id: string
          name: string
          icon: string | null
        }
        Insert: {
          id: string
          name: string
          icon?: string | null
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
        }
      }

      // ─── deals ───────────────────────────────────────────────────────
      deals: {
        Row: {
          id: string
          business_id: string
          title: string
          description: string | null
          image_url: string | null
          original_price: number
          discounted_price: number
          discount_percentage: number
          valid_until: string
          is_active: boolean | null
          booking_enabled: boolean | null
          max_bookings_per_slot: number | null
          duration_minutes: number | null
          deal_type: 'standard' | 'flash' | 'limited' | 'happy_hour' | 'bundle' | null
          starts_at: string | null
          ends_at: string | null
          limited_qty: number | null
          per_user_limit: number | null
          days_of_week: number[] | null
          happy_hour_start: string | null
          happy_hour_end: string | null
          category: string
          booking_quota_total: number
          booking_quota_remaining: number
          quota_enabled: boolean
          expires_at: string | null
          is_legacy_offer: boolean
          legacy_original_discount: number | null
          legacy_migrated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          business_id: string
          title: string
          description?: string | null
          image_url?: string | null
          original_price: number
          discounted_price: number
          discount_percentage: number
          valid_until: string
          is_active?: boolean | null
          booking_enabled?: boolean | null
          max_bookings_per_slot?: number | null
          duration_minutes?: number | null
          deal_type?: 'standard' | 'flash' | 'limited' | 'happy_hour' | 'bundle' | null
          starts_at?: string | null
          ends_at?: string | null
          limited_qty?: number | null
          per_user_limit?: number | null
          days_of_week?: number[] | null
          happy_hour_start?: string | null
          happy_hour_end?: string | null
          category: string
          booking_quota_total?: number
          booking_quota_remaining?: number
          quota_enabled?: boolean
          expires_at?: string | null
          is_legacy_offer?: boolean
          legacy_original_discount?: number | null
          legacy_migrated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          business_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          original_price?: number
          discounted_price?: number
          discount_percentage?: number
          valid_until?: string
          is_active?: boolean | null
          booking_enabled?: boolean | null
          max_bookings_per_slot?: number | null
          duration_minutes?: number | null
          deal_type?: 'standard' | 'flash' | 'limited' | 'happy_hour' | 'bundle' | null
          starts_at?: string | null
          ends_at?: string | null
          limited_qty?: number | null
          per_user_limit?: number | null
          days_of_week?: number[] | null
          happy_hour_start?: string | null
          happy_hour_end?: string | null
          category?: string
          booking_quota_total?: number
          booking_quota_remaining?: number
          quota_enabled?: boolean
          expires_at?: string | null
          is_legacy_offer?: boolean
          legacy_original_discount?: number | null
          legacy_migrated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // ─── time_slots ──────────────────────────────────────────────────
      time_slots: {
        Row: {
          id: string
          deal_id: string
          date: string
          start_time: string
          end_time: string
          available_spots: number
          is_available: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          date: string
          start_time: string
          end_time: string
          available_spots?: number
          is_available?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          date?: string
          start_time?: string
          end_time?: string
          available_spots?: number
          is_available?: boolean | null
          created_at?: string | null
        }
      }

      // ─── bookings ────────────────────────────────────────────────────
      bookings: {
        Row: {
          id: string
          deal_id: string
          time_slot_id: string | null
          user_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested' | 'checked_in' | 'noshow' | 'rejected' | null
          notes: string | null
          booking_date: string
          booking_time: string | null
          total_price: number
          staff_id: string | null
          service_summary: string | null
          start_at: string | null
          end_at: string | null
          booking_token: string | null
          guest_session_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          time_slot_id?: string | null
          user_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested' | 'checked_in' | 'noshow' | 'rejected' | null
          notes?: string | null
          booking_date: string
          booking_time?: string | null
          total_price?: number
          staff_id?: string | null
          service_summary?: string | null
          start_at?: string | null
          end_at?: string | null
          booking_token?: string | null
          guest_session_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          time_slot_id?: string | null
          user_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested' | 'checked_in' | 'noshow' | 'rejected' | null
          notes?: string | null
          booking_date?: string
          booking_time?: string | null
          total_price?: number
          staff_id?: string | null
          service_summary?: string | null
          start_at?: string | null
          end_at?: string | null
          booking_token?: string | null
          guest_session_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // ─── booking_feedback ────────────────────────────────────────────
      booking_feedback: {
        Row: {
          id: string
          booking_id: string
          deal_id: string
          business_id: string
          user_id: string | null
          guest_session_id: string | null
          rating: number   // 1 or -1
          guest_booking_token: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          deal_id: string
          business_id: string
          user_id?: string | null
          guest_session_id?: string | null
          rating: number
          guest_booking_token?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          deal_id?: string
          business_id?: string
          user_id?: string | null
          guest_session_id?: string | null
          rating?: number
          guest_booking_token?: string | null
          created_at?: string | null
        }
      }

      // ─── notification_preferences ────────────────────────────────────
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          booking_reminders: boolean | null
          deal_alerts: boolean | null
          business_messages: boolean | null
          promotional_offers: boolean | null
          push_enabled: boolean | null
          email_enabled: boolean | null
          sms_enabled: boolean | null
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          booking_reminders?: boolean | null
          deal_alerts?: boolean | null
          business_messages?: boolean | null
          promotional_offers?: boolean | null
          push_enabled?: boolean | null
          email_enabled?: boolean | null
          sms_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          booking_reminders?: boolean | null
          deal_alerts?: boolean | null
          business_messages?: boolean | null
          promotional_offers?: boolean | null
          push_enabled?: boolean | null
          email_enabled?: boolean | null
          sms_enabled?: boolean | null
          quiet_hours_start?: string | null
          quiet_hours_end?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }

      // ─── notifications ───────────────────────────────────────────────
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          channel: string
          title: string
          content: string
          data: Json | null
          sent_at: string | null
          is_read: boolean | null
          related_booking_id: string | null
          related_deal_id: string | null
          related_business_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          channel: string
          title: string
          content: string
          data?: Json | null
          sent_at?: string | null
          is_read?: boolean | null
          related_booking_id?: string | null
          related_deal_id?: string | null
          related_business_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          channel?: string
          title?: string
          content?: string
          data?: Json | null
          sent_at?: string | null
          is_read?: boolean | null
          related_booking_id?: string | null
          related_deal_id?: string | null
          related_business_id?: string | null
        }
      }

      // ─── push_subscriptions ──────────────────────────────────────────
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          p256dh: string
          auth: string
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          p256dh?: string
          auth?: string
          user_agent?: string | null
          created_at?: string
        }
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_booking: {
        Args: {
          p_deal_id: string
          p_time_slot_id: string
          p_customer_name: string
          p_customer_phone: string
          p_customer_email: string
          p_notes: string | null
          p_booking_date: string
          p_start_at: string
          p_end_at: string
          p_service_summary: string
          p_total_price: number
          p_guest_session_id: string | null
        }
        Returns: {
          success: boolean
          booking: Database['public']['Tables']['bookings']['Row'] | null
          conflict: boolean
          error: string | null
        }
      }
      transfer_guest_bookings_to_user: {
        Args: {
          p_user_id: string
          p_guest_session_id: string | null
          p_booking_tokens: string[] | null
        }
        Returns: number
      }
      check_availability: {
        Args: {
          p_deal_id: string
          p_start_time: string
          p_end_time: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'client' | 'business_owner' | 'admin'
      booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'requested' | 'checked_in' | 'noshow' | 'rejected'
      business_status: 'pending' | 'approved' | 'rejected' | 'suspended'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Convenience row types ────────────────────────────────────────────────────
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row']
export type BusinessRow = Database['public']['Tables']['businesses']['Row']
export type DealRow = Database['public']['Tables']['deals']['Row']
export type TimeSlotRow = Database['public']['Tables']['time_slots']['Row']
export type BookingRow = Database['public']['Tables']['bookings']['Row']
export type BookingFeedbackRow = Database['public']['Tables']['booking_feedback']['Row']
export type NotificationPreferencesRow = Database['public']['Tables']['notification_preferences']['Row']
export type NotificationRow = Database['public']['Tables']['notifications']['Row']
export type PushSubscriptionRow = Database['public']['Tables']['push_subscriptions']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']