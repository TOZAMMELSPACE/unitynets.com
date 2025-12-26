-- Fix Security Definer View warning by setting the view to use invoker security
ALTER VIEW public.public_profiles SET (security_invoker = on);