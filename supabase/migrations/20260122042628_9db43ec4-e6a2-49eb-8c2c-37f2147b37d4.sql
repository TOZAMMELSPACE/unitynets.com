-- Create study rooms table
CREATE TABLE public.study_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  topic TEXT,
  max_members INTEGER NOT NULL DEFAULT 8 CHECK (max_members >= 2 AND max_members <= 8),
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study room members table
CREATE TABLE public.study_room_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create study room messages table (for real-time chat)
CREATE TABLE public.study_room_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'note', 'quiz', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study room notes table (shared notes)
CREATE TABLE public.study_room_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.study_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.study_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_room_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for study_rooms
CREATE POLICY "Anyone can view active study rooms"
ON public.study_rooms FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can create study rooms"
ON public.study_rooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms"
ON public.study_rooms FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms"
ON public.study_rooms FOR DELETE
USING (auth.uid() = created_by);

-- RLS Policies for study_room_members
CREATE POLICY "Anyone can view room members"
ON public.study_room_members FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join rooms"
ON public.study_room_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms"
ON public.study_room_members FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for study_room_messages
CREATE POLICY "Room members can view messages"
ON public.study_room_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_room_members
  WHERE room_id = study_room_messages.room_id
  AND user_id = auth.uid()
));

CREATE POLICY "Room members can send messages"
ON public.study_room_messages FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.study_room_members
    WHERE room_id = study_room_messages.room_id
    AND user_id = auth.uid()
  )
);

-- RLS Policies for study_room_notes
CREATE POLICY "Room members can view notes"
ON public.study_room_notes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.study_room_members
  WHERE room_id = study_room_notes.room_id
  AND user_id = auth.uid()
));

CREATE POLICY "Room members can create notes"
ON public.study_room_notes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.study_room_members
    WHERE room_id = study_room_notes.room_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Note creators can update their notes"
ON public.study_room_notes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Note creators can delete their notes"
ON public.study_room_notes FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.study_room_messages;

-- Create updated_at trigger for study_rooms
CREATE TRIGGER update_study_rooms_updated_at
BEFORE UPDATE ON public.study_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for study_room_notes
CREATE TRIGGER update_study_room_notes_updated_at
BEFORE UPDATE ON public.study_room_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();