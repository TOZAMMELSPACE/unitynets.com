-- Add privacy and target_country columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS privacy text NOT NULL DEFAULT 'public',
ADD COLUMN IF NOT EXISTS target_country text DEFAULT NULL;

-- Add check constraint for privacy values
ALTER TABLE public.posts 
ADD CONSTRAINT posts_privacy_check 
CHECK (privacy IN ('public', 'friends', 'only_me'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_privacy ON public.posts(privacy);
CREATE INDEX IF NOT EXISTS idx_posts_target_country ON public.posts(target_country);