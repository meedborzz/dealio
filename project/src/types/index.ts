// Consolidated types for the entire application
export type UUID = string;

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: UUID;
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  role: 'client' | 'business_owner' | 'admin';
  completed_bookings_count: number;
  loyalty_points: number;
  created_at: string;
  updated_at: string;
}

// Business Types
export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
  breakStart?: string;
  breakEnd?: string;
}

export interface WorkingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface SpecialDate {
  closed: boolean;
  reason?: string;
  open?: string;
  close?: string;
}

export interface Business {
  id: UUID;
  name: string;
  description?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  category: string;
  rating: number;
  review_count: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  owner_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_rate: number;
  total_commission_owed: number;
  total_validated_bookings: number;
  working_hours?: WorkingHours;
  special_dates?: Record<string, SpecialDate>;
  created_at: string;
  updated_at: string;
}

// Deal Types
export interface Deal {
  id: UUID;
  business_id: UUID;
  title: string;
  description?: string;
  image_url?: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  valid_until: string;
  is_active: boolean;
  booking_enabled: boolean;
  max_bookings_per_slot: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  business?: Business;
  businesses?: Business; // For joined queries
  // Quota system
  booking_quota_total: number;
  booking_quota_remaining: number;
  quota_enabled?: boolean;
  expires_at?: string;
  // Legacy offer migration
  is_legacy_offer?: boolean;
  legacy_original_discount?: number;
  legacy_migrated_at?: string;
  // Special offer features
  service_id?: UUID;
  deal_type?: 'standard' | 'flash' | 'limited' | 'happy_hour' | 'bundle';
  starts_at?: string; // ISO string
  ends_at?: string;   // ISO string
  limited_qty?: number;
  per_user_limit?: number;
  days_of_week?: number[]; // 0=Sun..6=Sat
  happy_hour_start?: string; // time string
  happy_hour_end?: string;   // time string
  // UI-only computed fields
  distance?: number;
  likes_count?: number;
  dislikes_count?: number;
}

// Booking Types
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TimeSlot {
  id: UUID;
  deal_id: UUID;
  date: string;
  start_time: string;
  end_time?: string;
  available_spots: number;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: UUID;
  deal_id: UUID;
  time_slot_id: UUID;
  user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: BookingStatus;
  notes?: string;
  booking_date: string;
  booking_time?: string;
  total_price: number;
  created_at: string;
  updated_at: string;
  booking_token?: string;
  guest_session_id?: string;
  deal?: Deal;
  time_slot?: TimeSlot;
  has_review?: boolean;
  has_feedback?: boolean;
}

// Review Types
export interface Review {
  id: UUID;
  business_id: UUID;
  user_id: UUID;
  booking_id?: UUID;
  rating: number;
  comment?: string;
  created_at: string;
}

// Notification Types
export type NotificationType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancellation'
  | 'booking_rescheduled'
  | 'booking_completed'
  | 'deal_expiring_soon'
  | 'promotional_offer'
  | 'business_message'
  | 'system_update';

export type NotificationChannelType = 'email' | 'sms' | 'in_app' | 'push';

export interface Notification {
  id: UUID;
  user_id: UUID;
  type: NotificationType;
  channel: NotificationChannelType;
  title: string;
  content: string;
  data?: any;
  sent_at: string;
  is_read: boolean;
  related_booking_id?: UUID;
  related_deal_id?: UUID;
  related_business_id?: UUID;
}

export interface NotificationPayload {
  type: NotificationType;
  recipient_id: UUID;
  channels: NotificationChannelType[];
  data: {
    booking?: Booking;
    deal?: Deal;
    business?: Business;
    user?: UserProfile;
    custom_message?: string;
    [key: string]: any;
  };
  template_override?: {
    subject?: string;
    body?: string;
  };
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  city: string;
  category: string;
  priceRange: [number, number];
  sortBy: 'relevance' | 'price' | 'rating' | 'distance' | 'discount' | 'newest';
  minRating?: number;
  maxPrice?: number;
  minDiscountPercentage?: number;
  maxDiscountPercentage?: number;
}

// Offline Booking Types
export interface OfflineBooking {
  id: UUID;
  business_id: UUID;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  service_name: string;
  service_price: number;
  booking_date: string;
  notes?: string;
  synced_booking_id?: UUID;
  created_by: UUID;
  created_at: string;
}

// Payment Types
export interface PaymentTransaction {
  id: UUID;
  booking_id: UUID;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'refunded';
  transaction_id?: string;
  payment_gateway?: string;
  created_at: string;
  completed_at?: string;
}

// Messaging Types
export interface Message {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  content: string;
  is_read?: boolean;
  created_at: string;
}

export interface Conversation {
  id: UUID;
  client_id: UUID;
  business_id: UUID;
  client_unread_count: number;
  business_unread_count: number;
  last_message_at?: string;
  created_at: string;
  business?: {
    id: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
  };
  client?: {
    id: string;
    full_name?: string;
    phone?: string;
  };
}