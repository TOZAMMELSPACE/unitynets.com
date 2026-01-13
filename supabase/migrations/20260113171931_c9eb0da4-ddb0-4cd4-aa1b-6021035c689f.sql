
-- =====================================================
-- UnityNets Production Messaging System Schema
-- =====================================================

-- 1. Create chats table (supports both direct and group chats)
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  group_name TEXT,
  group_avatar_url TEXT,
  group_description TEXT,
  pinned_message_id UUID,
  created_by UUID REFERENCES auth.users(id),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create chat_participants table
CREATE TABLE IF NOT EXISTS public.chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'owner')),
  muted_until TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- 3. Create enhanced chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'voice', 'file', 'call_started', 'call_ended', 'system')),
  content TEXT,
  encrypted_content TEXT,
  metadata JSONB DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  reactions JSONB DEFAULT '{}',
  reply_to_id UUID REFERENCES public.chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_forwarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 4. Create typing_indicators table for real-time typing
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

-- 5. Add last_seen to profiles if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'last_seen') THEN
    ALTER TABLE public.profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT now();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'profiles' 
                 AND column_name = 'is_online') THEN
    ALTER TABLE public.profiles ADD COLUMN is_online BOOLEAN DEFAULT false;
  END IF;
END $$;

-- =====================================================
-- Indexes for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id_created ON public.chat_messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chats_type ON public.chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_updated ON public.chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_chat_user ON public.typing_indicators(chat_id, user_id);

-- GIN index for metadata search
CREATE INDEX IF NOT EXISTS idx_chat_messages_metadata ON public.chat_messages USING GIN(metadata);

-- =====================================================
-- Enable RLS
-- =====================================================

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS Policies for chats
-- =====================================================

CREATE POLICY "Users can view chats they participate in"
ON public.chats FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Chat owners/admins can update chats"
ON public.chats FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.role IN ('admin', 'owner')
  )
);

CREATE POLICY "Chat owners can delete chats"
ON public.chats FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chats.id
    AND chat_participants.user_id = auth.uid()
    AND chat_participants.role = 'owner'
  )
);

-- =====================================================
-- RLS Policies for chat_participants
-- =====================================================

CREATE POLICY "Users can view participants of their chats"
ON public.chat_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants cp
    WHERE cp.chat_id = chat_participants.chat_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can join chats"
ON public.chat_participants FOR INSERT
WITH CHECK (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.chat_participants
  WHERE chat_participants.chat_id = chat_participants.chat_id
  AND chat_participants.user_id = auth.uid()
  AND chat_participants.role IN ('admin', 'owner')
));

CREATE POLICY "Users can update their participation"
ON public.chat_participants FOR UPDATE
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.chat_participants cp
  WHERE cp.chat_id = chat_participants.chat_id
  AND cp.user_id = auth.uid()
  AND cp.role IN ('admin', 'owner')
));

CREATE POLICY "Users can leave chats"
ON public.chat_participants FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- RLS Policies for chat_messages
-- =====================================================

CREATE POLICY "Users can view messages in their chats"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chat_messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages to their chats"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = chat_messages.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages"
ON public.chat_messages FOR UPDATE
USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
USING (sender_id = auth.uid());

-- =====================================================
-- RLS Policies for typing_indicators
-- =====================================================

CREATE POLICY "Users can view typing in their chats"
ON public.typing_indicators FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE chat_participants.chat_id = typing_indicators.chat_id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their typing status"
ON public.typing_indicators FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their typing"
ON public.typing_indicators FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their typing"
ON public.typing_indicators FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- Functions
-- =====================================================

-- Function to update chat's updated_at when new message arrives
CREATE OR REPLACE FUNCTION public.update_chat_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.chats 
  SET updated_at = now() 
  WHERE id = NEW.chat_id;
  
  -- Update unread count for other participants
  UPDATE public.chat_participants
  SET unread_count = unread_count + 1
  WHERE chat_id = NEW.chat_id
  AND user_id != NEW.sender_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for message insert
DROP TRIGGER IF EXISTS on_message_insert ON public.chat_messages;
CREATE TRIGGER on_message_insert
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_on_message();

-- Function to get or create direct chat
CREATE OR REPLACE FUNCTION public.get_or_create_direct_chat(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_chat_id UUID;
  new_chat_id UUID;
BEGIN
  -- Check if direct chat already exists
  SELECT c.id INTO existing_chat_id
  FROM public.chats c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM public.chat_participants cp1
    WHERE cp1.chat_id = c.id AND cp1.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.chat_participants cp2
    WHERE cp2.chat_id = c.id AND cp2.user_id = other_user_id
  )
  AND (SELECT COUNT(*) FROM public.chat_participants WHERE chat_id = c.id) = 2
  LIMIT 1;
  
  IF existing_chat_id IS NOT NULL THEN
    RETURN existing_chat_id;
  END IF;
  
  -- Create new chat
  INSERT INTO public.chats (type, created_by)
  VALUES ('direct', auth.uid())
  RETURNING id INTO new_chat_id;
  
  -- Add both participants
  INSERT INTO public.chat_participants (chat_id, user_id, role)
  VALUES 
    (new_chat_id, auth.uid(), 'member'),
    (new_chat_id, other_user_id, 'member');
  
  RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to create group chat
CREATE OR REPLACE FUNCTION public.create_group_chat(
  p_group_name TEXT,
  p_member_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  new_chat_id UUID;
  member_id UUID;
BEGIN
  -- Create the group chat
  INSERT INTO public.chats (type, group_name, created_by)
  VALUES ('group', p_group_name, auth.uid())
  RETURNING id INTO new_chat_id;
  
  -- Add creator as owner
  INSERT INTO public.chat_participants (chat_id, user_id, role)
  VALUES (new_chat_id, auth.uid(), 'owner');
  
  -- Add all members
  FOREACH member_id IN ARRAY p_member_ids
  LOOP
    IF member_id != auth.uid() THEN
      INSERT INTO public.chat_participants (chat_id, user_id, role)
      VALUES (new_chat_id, member_id, 'member')
      ON CONFLICT (chat_id, user_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN new_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(p_chat_id UUID)
RETURNS void AS $$
BEGIN
  -- Update read_by array on messages
  UPDATE public.chat_messages
  SET read_by = array_append(read_by, auth.uid())
  WHERE chat_id = p_chat_id
  AND NOT (auth.uid() = ANY(read_by))
  AND sender_id != auth.uid();
  
  -- Reset unread count
  UPDATE public.chat_participants
  SET unread_count = 0, last_read_at = now()
  WHERE chat_id = p_chat_id
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;
