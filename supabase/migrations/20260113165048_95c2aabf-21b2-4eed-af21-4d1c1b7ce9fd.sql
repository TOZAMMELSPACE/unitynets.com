-- Create table for contributor applications
CREATE TABLE public.contributor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  country_city TEXT NOT NULL,
  primary_areas TEXT[] NOT NULL,
  skills_proof TEXT NOT NULL,
  weekly_hours TEXT NOT NULL,
  why_unitynets TEXT NOT NULL,
  portfolio_links TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contributor_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit applications (no auth required for public form)
CREATE POLICY "Anyone can submit applications"
ON public.contributor_applications
FOR INSERT
WITH CHECK (true);

-- Only admins should view applications (using false for now, admin access via service role)
CREATE POLICY "No public read access"
ON public.contributor_applications
FOR SELECT
USING (false);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contributor_applications_updated_at
BEFORE UPDATE ON public.contributor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();