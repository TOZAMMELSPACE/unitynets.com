-- Add missed_call and call_summary types to chat_messages
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_type_check;

ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_type_check 
CHECK (type IN ('text', 'image', 'video', 'voice', 'file', 'call_started', 'call_ended', 'system', 'missed_call', 'call_summary'));