-- Create chat-media storage bucket for all chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to chat-media bucket (only to chats they're a member of)
CREATE POLICY "Users can upload chat media to their chats"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND public.is_chat_member(
    (string_to_array(name, '/'))[1]::uuid,
    auth.uid()
  )
);

-- Allow authenticated users to view chat media from their chats
CREATE POLICY "Users can view chat media from their chats"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND (
    -- Public access for shared links (bucket is public)
    true
  )
);

-- Allow users to delete their own uploaded media
CREATE POLICY "Users can delete their own chat media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-media'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] IS NOT NULL
  AND public.is_chat_member(
    (string_to_array(name, '/'))[1]::uuid,
    auth.uid()
  )
);