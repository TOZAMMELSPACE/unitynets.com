-- Fix infinite recursion in RLS by removing self-referencing policies
-- and using SECURITY DEFINER helper functions for membership checks.

-- 1) Drop all policies on messaging tables (safe reset)
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('chats','chat_participants','chat_messages','typing_indicators')
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2) Helper functions (bypass RLS safely)
CREATE OR REPLACE FUNCTION public.is_chat_member(p_chat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants cp
    WHERE cp.chat_id = p_chat_id
      AND cp.user_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_chat_admin(p_chat_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants cp
    WHERE cp.chat_id = p_chat_id
      AND cp.user_id = p_user_id
      AND cp.role IN ('admin','owner')
  );
$$;

-- 3) Recreate RLS policies (no recursion)

-- chats
CREATE POLICY "chats_select"
  ON public.chats
  FOR SELECT
  USING (public.is_chat_member(id, auth.uid()));

CREATE POLICY "chats_insert"
  ON public.chats
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "chats_update"
  ON public.chats
  FOR UPDATE
  USING (public.is_chat_admin(id, auth.uid()));

CREATE POLICY "chats_delete"
  ON public.chats
  FOR DELETE
  USING (public.is_chat_admin(id, auth.uid()));

-- chat_participants
CREATE POLICY "chat_participants_select"
  ON public.chat_participants
  FOR SELECT
  USING (public.is_chat_member(chat_id, auth.uid()));

-- Prevent client-side inserting participants (memberships are created via SECURITY DEFINER RPCs)
CREATE POLICY "chat_participants_insert"
  ON public.chat_participants
  FOR INSERT
  WITH CHECK (false);

-- Users can update their own row (mute/pin, etc.)
CREATE POLICY "chat_participants_update"
  ON public.chat_participants
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow leaving chats (optional)
CREATE POLICY "chat_participants_delete"
  ON public.chat_participants
  FOR DELETE
  USING (user_id = auth.uid());

-- chat_messages
CREATE POLICY "chat_messages_select"
  ON public.chat_messages
  FOR SELECT
  USING (public.is_chat_member(chat_id, auth.uid()));

CREATE POLICY "chat_messages_insert"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "chat_messages_update"
  ON public.chat_messages
  FOR UPDATE
  USING (
    sender_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "chat_messages_delete"
  ON public.chat_messages
  FOR DELETE
  USING (
    sender_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );

-- typing_indicators
CREATE POLICY "typing_indicators_select"
  ON public.typing_indicators
  FOR SELECT
  USING (public.is_chat_member(chat_id, auth.uid()));

CREATE POLICY "typing_indicators_insert"
  ON public.typing_indicators
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "typing_indicators_update"
  ON public.typing_indicators
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );

CREATE POLICY "typing_indicators_delete"
  ON public.typing_indicators
  FOR DELETE
  USING (
    user_id = auth.uid()
    AND public.is_chat_member(chat_id, auth.uid())
  );
