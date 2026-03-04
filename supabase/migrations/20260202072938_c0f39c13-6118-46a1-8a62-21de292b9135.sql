-- Add poll_options column to posts table for storing poll data
ALTER TABLE public.posts 
ADD COLUMN poll_options JSONB DEFAULT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN public.posts.poll_options IS 'JSON array of poll options with structure: [{option: string, votes: number}]';