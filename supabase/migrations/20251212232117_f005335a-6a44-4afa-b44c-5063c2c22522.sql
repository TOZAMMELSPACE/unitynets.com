-- Create storage bucket for post videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'post-videos', 
  'post-videos', 
  true,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- Create policy for viewing videos (public access)
CREATE POLICY "Anyone can view post videos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-videos');

-- Create policy for uploading videos (authenticated users only)
CREATE POLICY "Authenticated users can upload post videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'post-videos' 
  AND auth.role() = 'authenticated'
);

-- Create policy for deleting own videos
CREATE POLICY "Users can delete their own post videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'post-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add video_url column to posts table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'posts' 
                 AND column_name = 'video_url') THEN
    ALTER TABLE public.posts ADD COLUMN video_url TEXT;
  END IF;
END $$;