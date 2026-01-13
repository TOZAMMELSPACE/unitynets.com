-- Call signaling table for WebRTC
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'accepted', 'rejected', 'ended', 'missed', 'busy')),
  signal_data JSONB,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- RLS policies using helper function
CREATE POLICY call_signals_select ON public.call_signals
  FOR SELECT USING (public.is_chat_member(chat_id, auth.uid()));

CREATE POLICY call_signals_insert ON public.call_signals
  FOR INSERT WITH CHECK (
    caller_id = auth.uid() 
    AND public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY call_signals_update ON public.call_signals
  FOR UPDATE USING (
    (caller_id = auth.uid() OR receiver_id = auth.uid())
    AND public.is_chat_member(chat_id, auth.uid())
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;

-- Index for faster lookups
CREATE INDEX idx_call_signals_chat_id ON public.call_signals(chat_id);
CREATE INDEX idx_call_signals_receiver ON public.call_signals(receiver_id, status);
CREATE INDEX idx_call_signals_active ON public.call_signals(status) WHERE status IN ('ringing', 'accepted');