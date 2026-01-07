-- Create a table to store chat sessions
CREATE TABLE public.learning_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  device_fingerprint TEXT
);

-- Enable Row Level Security
ALTER TABLE public.learning_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert sessions (public feature, no auth required)
CREATE POLICY "Anyone can insert chat sessions"
ON public.learning_chat_sessions
FOR INSERT
WITH CHECK (true);

-- Create policy to allow anyone to view sessions by device fingerprint
CREATE POLICY "Anyone can view chat sessions"
ON public.learning_chat_sessions
FOR SELECT
USING (true);

-- Create policy to allow anyone to update their sessions
CREATE POLICY "Anyone can update chat sessions"
ON public.learning_chat_sessions
FOR UPDATE
USING (true);

-- Create policy to allow anyone to delete their sessions
CREATE POLICY "Anyone can delete chat sessions"
ON public.learning_chat_sessions
FOR DELETE
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_learning_chat_sessions_updated_at
BEFORE UPDATE ON public.learning_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();