/*
  # Create user_interactions table

  1. New Tables
    - `user_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `deal_id` (uuid, references deals)
      - `interaction_type` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `user_interactions` table
    - Add policy for users to manage their own interactions
*/

CREATE TABLE IF NOT EXISTS public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('view', 'favorite', 'book', 'share')),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own interactions"
  ON public.user_interactions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()))
  WITH CHECK (user_id = (SELECT id FROM user_profiles WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_deal_id ON public.user_interactions(deal_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);