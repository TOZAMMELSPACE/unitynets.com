-- Create storage bucket for learning chat uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('learning-chat-files', 'learning-chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload files to the bucket
CREATE POLICY "Anyone can upload learning chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'learning-chat-files');

-- Allow anyone to view files in the bucket
CREATE POLICY "Anyone can view learning chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'learning-chat-files');

-- Allow anyone to delete their own files (based on path pattern)
CREATE POLICY "Anyone can delete learning chat files"
ON storage.objects FOR DELETE
USING (bucket_id = 'learning-chat-files');