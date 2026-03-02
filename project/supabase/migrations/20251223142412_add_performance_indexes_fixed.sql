/*
  # Add Performance Indexes

  1. Indexes Added
    - Deals table indexes for common queries
    - Businesses table indexes for filtering
    - Bookings table indexes for user and deal lookups
    - Reviews table indexes for business reviews
    - Time slots table indexes for availability checks
    - Messages and conversations indexes
    - Full-text search indexes

  2. Benefits
    - Dramatically faster query performance
    - Better scalability for large datasets
    - Reduced database load
    - Improved user experience with faster page loads
*/

-- ============================================
-- DEALS TABLE INDEXES
-- ============================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_deals_is_active ON deals(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deals_category ON deals(category);
CREATE INDEX IF NOT EXISTS idx_deals_business_id ON deals(business_id);
CREATE INDEX IF NOT EXISTS idx_deals_valid_until ON deals(valid_until);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_discount_percentage ON deals(discount_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_deals_discounted_price ON deals(discounted_price);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_deals_active_created 
  ON deals(is_active, created_at DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_deals_active_discount 
  ON deals(is_active, discount_percentage DESC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_deals_category_active 
  ON deals(category, is_active, created_at DESC) 
  WHERE is_active = true;

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_deals_title_search 
  ON deals USING gin(to_tsvector('english', title));

CREATE INDEX IF NOT EXISTS idx_deals_description_search 
  ON deals USING gin(to_tsvector('english', description));

-- ============================================
-- BUSINESSES TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_businesses_status 
  ON businesses(status) 
  WHERE status = 'approved';

CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_rating ON businesses(rating DESC);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- Full text search for business names
CREATE INDEX IF NOT EXISTS idx_businesses_name_search 
  ON businesses USING gin(to_tsvector('english', name));

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_businesses_status_city 
  ON businesses(status, city) 
  WHERE status = 'approved';

-- ============================================
-- BOOKINGS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_deal_id ON bookings(deal_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot_id ON bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- Composite indexes for common booking queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_status 
  ON bookings(user_id, status, booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_deal_status 
  ON bookings(deal_id, status);

-- Index for finding pending bookings
CREATE INDEX IF NOT EXISTS idx_bookings_pending 
  ON bookings(status, created_at DESC) 
  WHERE status = 'pending';

-- ============================================
-- REVIEWS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_business_id ON reviews(business_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Composite index for business reviews with rating
CREATE INDEX IF NOT EXISTS idx_reviews_business_rating 
  ON reviews(business_id, rating, created_at DESC);

-- ============================================
-- TIME SLOTS TABLE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_time_slots_deal_id ON time_slots(deal_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_is_available 
  ON time_slots(is_available) 
  WHERE is_available = true;

-- Composite index for availability queries
CREATE INDEX IF NOT EXISTS idx_time_slots_deal_date_available 
  ON time_slots(deal_id, date, is_available) 
  WHERE is_available = true;

-- Index for finding available slots in date range
CREATE INDEX IF NOT EXISTS idx_time_slots_available_dates 
  ON time_slots(date, is_available, deal_id) 
  WHERE is_available = true;

-- ============================================
-- MESSAGES & CONVERSATIONS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_user_id ON conversations(client_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Composite index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, is_read, sent_at DESC) 
  WHERE is_read = false;

-- ============================================
-- FAVORITES TABLE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_deal_id ON favorites(deal_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);

-- Composite index for user's favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user_created 
  ON favorites(user_id, created_at DESC);

-- ============================================
-- USER INTERACTIONS TABLE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_deal_id ON user_interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Composite index for tracking user behavior
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type 
  ON user_interactions(user_id, interaction_type, created_at DESC);