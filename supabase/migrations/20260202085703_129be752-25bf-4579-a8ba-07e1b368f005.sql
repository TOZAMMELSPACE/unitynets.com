-- Create poll_votes table to track user votes on polls
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Everyone can view poll votes (to check if they voted)
CREATE POLICY "Anyone can view poll votes"
ON public.poll_votes
FOR SELECT
USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote on polls"
ON public.poll_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete their votes (one vote only)
