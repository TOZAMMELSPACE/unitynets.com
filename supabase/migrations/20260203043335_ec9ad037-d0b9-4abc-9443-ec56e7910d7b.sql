-- Add user_id column to learning_chat_sessions for authenticated users
ALTER TABLE public.learning_chat_sessions 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON public.learning_chat_sessions;
DROP POLICY IF EXISTS "Anyone can insert chat sessions" ON public.learning_chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.learning_chat_sessions;
DROP POLICY IF EXISTS "Anyone can delete chat sessions" ON public.learning_chat_sessions;

-- Create new secure policies

-- Authenticated users can only view their own sessions
CREATE POLICY "Users can view their own chat sessions" 
ON public.learning_chat_sessions 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND user_id IS NULL)
);

-- Authenticated users can insert sessions with their user_id
CREATE POLICY "Users can insert their own chat sessions" 
ON public.learning_chat_sessions 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND user_id IS NULL)
);

-- Users can update only their own sessions
CREATE POLICY "Users can update their own chat sessions" 
ON public.learning_chat_sessions 
FOR UPDATE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND user_id IS NULL)
);

-- Users can delete only their own sessions
CREATE POLICY "Users can delete their own chat sessions" 
ON public.learning_chat_sessions 
FOR DELETE 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND device_fingerprint IS NOT NULL AND user_id IS NULL)
);