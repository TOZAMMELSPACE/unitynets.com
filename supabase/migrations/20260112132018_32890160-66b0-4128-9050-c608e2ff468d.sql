-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  category TEXT NOT NULL DEFAULT 'community',
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  members_count INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  is_official BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group_members table
CREATE TABLE public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'moderator', 'member'
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create group_posts table (optional - for group-specific posts)
CREATE TABLE public.group_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[],
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_posts ENABLE ROW LEVEL SECURITY;

-- Groups policies
CREATE POLICY "Anyone can view public groups" 
ON public.groups 
FOR SELECT 
USING (is_private = false OR EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = groups.id 
  AND group_members.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can create groups" 
ON public.groups 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups" 
ON public.groups 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = groups.id 
  AND group_members.user_id = auth.uid() 
  AND group_members.role = 'admin'
));

CREATE POLICY "Group admins can delete groups" 
ON public.groups 
FOR DELETE 
USING (auth.uid() = created_by);

-- Group members policies
CREATE POLICY "Anyone can view group members" 
ON public.group_members 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can join groups" 
ON public.group_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups" 
ON public.group_members 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update member roles" 
ON public.group_members 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.group_members gm 
  WHERE gm.group_id = group_members.group_id 
  AND gm.user_id = auth.uid() 
  AND gm.role = 'admin'
));

-- Group posts policies
CREATE POLICY "Members can view group posts" 
ON public.group_posts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = group_posts.group_id 
  AND group_members.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.groups 
  WHERE groups.id = group_posts.group_id 
  AND groups.is_private = false
));

CREATE POLICY "Members can create group posts" 
ON public.group_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.group_members 
  WHERE group_members.group_id = group_posts.group_id 
  AND group_members.user_id = auth.uid()
));

CREATE POLICY "Users can update their own group posts" 
ON public.group_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own group posts" 
ON public.group_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update members count
CREATE OR REPLACE FUNCTION public.update_group_members_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups SET members_count = members_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups SET members_count = members_count - 1 WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for members count
CREATE TRIGGER update_group_members_count_trigger
AFTER INSERT OR DELETE ON public.group_members
FOR EACH ROW
EXECUTE FUNCTION public.update_group_members_count();

-- Function to update posts count
CREATE OR REPLACE FUNCTION public.update_group_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.groups SET posts_count = posts_count + 1 WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.groups SET posts_count = posts_count - 1 WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for posts count
CREATE TRIGGER update_group_posts_count_trigger
AFTER INSERT OR DELETE ON public.group_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_group_posts_count();

-- Add updated_at trigger for groups
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for group_posts
CREATE TRIGGER update_group_posts_updated_at
BEFORE UPDATE ON public.group_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample groups
INSERT INTO public.groups (name, description, cover_url, category, is_private, created_by, members_count, is_official, is_featured)
VALUES 
  ('ইউনিটিনেটস অফিশিয়াল', 'ইউনিটিনেটস প্ল্যাটফর্মের অফিশিয়াল গ্রুপ। নতুন ফিচার, আপডেট এবং কমিউনিটি ইভেন্ট সম্পর্কে জানুন।', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop', 'community', false, '00000000-0000-0000-0000-000000000000', 0, true, true),
  ('ঢাকা টেক কমিউনিটি', 'প্রযুক্তি এবং উদ্ভাবন নিয়ে আলোচনা। সফটওয়্যার ডেভেলপমেন্ট, AI, ও স্টার্টআপ।', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop', 'tech', false, '00000000-0000-0000-0000-000000000000', 0, false, false),
  ('শিক্ষা সংস্কার আন্দোলন', 'শিক্ষা ব্যবস্থার উন্নয়ন নিয়ে কাজ করছি। শিক্ষক, শিক্ষার্থী ও অভিভাবকদের জন্য।', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop', 'education', false, '00000000-0000-0000-0000-000000000000', 0, false, true),
  ('স্বাস্থ্য সচেতনতা', 'স্বাস্থ্য টিপস, ডায়েট, ব্যায়াম এবং মানসিক স্বাস্থ্য নিয়ে আলোচনা।', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop', 'health', false, '00000000-0000-0000-0000-000000000000', 0, false, true),
  ('উদ্যোক্তা সমিতি', 'নতুন উদ্যোক্তাদের সহায়তা, ফান্ডিং, মেন্টরশিপ এবং নেটওয়ার্কিং।', 'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=200&fit=crop', 'business', true, '00000000-0000-0000-0000-000000000000', 0, false, false),
  ('প্রোগ্রামিং বাংলাদেশ', 'কোডিং শিখুন, প্রজেক্ট শেয়ার করুন, চাকরি খুঁজুন। সব লেভেলের ডেভেলপারদের জন্য।', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop', 'tech', false, '00000000-0000-0000-0000-000000000000', 0, false, true);