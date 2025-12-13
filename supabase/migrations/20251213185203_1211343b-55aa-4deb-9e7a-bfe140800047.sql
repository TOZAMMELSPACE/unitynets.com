-- Create post_views table for tracking unique views per user per post
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id UUID NOT NULL,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on post_views
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for post_views
CREATE POLICY "Anyone can view post views count" ON public.post_views
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add views" ON public.post_views
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix profiles table RLS - Remove public read access for sensitive data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create new policy: authenticated users can view basic profile info
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- Create a view for public profile info (excluding sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  username,
  avatar_url,
  cover_url,
  bio,
  location,
  role,
  trust_score,
  unity_notes,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;