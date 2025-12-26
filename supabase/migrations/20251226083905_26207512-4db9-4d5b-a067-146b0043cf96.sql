-- Drop the existing permissive SELECT policy that exposes all profiles
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

-- Create new policy: Users can only view their own profile with sensitive data
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Update the public_profiles view to ensure it excludes sensitive fields
-- First drop and recreate to ensure it's correct
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
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

-- Grant SELECT on the view to authenticated and anon users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;