-- First drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create chats" ON public.chats;
DROP POLICY IF EXISTS "Users can update chats they created" ON public.chats;
DROP POLICY IF EXISTS "Users can insert chat participations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view their chat participations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view chats they participate in" ON public.chats;
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view typing indicators in their chats" ON public.typing_indicators;
DROP POLICY IF EXISTS "Users can manage their typing status" ON public.typing_indicators;

-- Recreate chat_participants policies - simple direct check, no recursion
CREATE POLICY "chat_participants_select"
  ON public.chat_participants
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "chat_participants_insert"
  ON public.chat_participants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "chat_participants_update"
  ON public.chat_participants
  FOR UPDATE
  USING (user_id = auth.uid());

-- Recreate chats policies
CREATE POLICY "chats_select"
  ON public.chats
  FOR SELECT
  USING (
    id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chats_insert"
  ON public.chats
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chats_update"
  ON public.chats
  FOR UPDATE
  USING (created_by = auth.uid());

-- Recreate chat_messages policies
CREATE POLICY "chat_messages_select"
  ON public.chat_messages
  FOR SELECT
  USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "chat_messages_update"
  ON public.chat_messages
  FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "chat_messages_delete"
  ON public.chat_messages
  FOR DELETE
  USING (sender_id = auth.uid());

-- Recreate typing_indicators policies
CREATE POLICY "typing_indicators_select"
  ON public.typing_indicators
  FOR SELECT
  USING (
    chat_id IN (
      SELECT chat_id FROM public.chat_participants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "typing_indicators_all"
  ON public.typing_indicators
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());