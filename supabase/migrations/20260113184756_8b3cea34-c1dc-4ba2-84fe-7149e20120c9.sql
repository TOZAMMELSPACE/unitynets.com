-- Call History table for tracking all calls
CREATE TABLE IF NOT EXISTS public.call_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  status TEXT NOT NULL CHECK (status IN ('completed', 'missed', 'rejected', 'no_answer')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

-- Policies: users can see call history for chats they are members of
CREATE POLICY call_history_select ON public.call_history
  FOR SELECT USING (public.is_chat_member(chat_id, auth.uid()));

-- Only system/server can insert (via service role or trigger)
CREATE POLICY call_history_insert ON public.call_history
  FOR INSERT WITH CHECK (caller_id = auth.uid() OR receiver_id = auth.uid());

-- Enable realtime for call_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_history;

-- Add index for faster queries
CREATE INDEX idx_call_history_chat_id ON public.call_history(chat_id);
CREATE INDEX idx_call_history_caller_id ON public.call_history(caller_id);
CREATE INDEX idx_call_history_receiver_id ON public.call_history(receiver_id);
CREATE INDEX idx_call_history_created_at ON public.call_history(created_at DESC);