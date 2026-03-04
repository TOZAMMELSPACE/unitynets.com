-- Create a table to store user learning memory/preferences
CREATE TABLE public.learning_user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  personality_notes TEXT,
  learning_interests TEXT[],
  accomplishments JSONB DEFAULT '[]'::jsonb,
  important_dates JSONB DEFAULT '[]'::jsonb,
  conversation_summary TEXT,
  last_mood TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_memory UNIQUE (user_id),
  CONSTRAINT unique_device_memory UNIQUE (device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.learning_user_memory ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view their own memory"
ON public.learning_user_memory
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory"
ON public.learning_user_memory
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory"
ON public.learning_user_memory
FOR UPDATE
USING (auth.uid() = user_id);

-- Policies for anonymous users (using device fingerprint)
CREATE POLICY "Anonymous users can view their memory by fingerprint"
ON public.learning_user_memory
FOR SELECT
USING (device_fingerprint IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can insert memory by fingerprint"
ON public.learning_user_memory
FOR INSERT
WITH CHECK (device_fingerprint IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Anonymous users can update memory by fingerprint"
ON public.learning_user_memory
FOR UPDATE
USING (device_fingerprint IS NOT NULL AND user_id IS NULL);

-- Trigger for updated_at
CREATE TRIGGER update_learning_user_memory_updated_at
BEFORE UPDATE ON public.learning_user_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();