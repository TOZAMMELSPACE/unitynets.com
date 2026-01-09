-- Allow public read access to profiles for viewing post authors
-- This only exposes public profile info like name and avatar, not sensitive data

CREATE POLICY "Profiles are publicly viewable"
ON public.profiles
FOR SELECT
USING (true);