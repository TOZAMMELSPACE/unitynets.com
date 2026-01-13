-- Function to update trust score based on user activities
CREATE OR REPLACE FUNCTION public.calculate_trust_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_posts_count integer;
  v_likes_received integer;
  v_comments_received integer;
  v_comments_made integer;
  v_followers_count integer;
  v_profile_complete integer;
  v_total_score integer;
BEGIN
  -- Count user's posts (2 points each, max 50 points)
  SELECT LEAST(COUNT(*) * 2, 50) INTO v_posts_count
  FROM public.posts WHERE user_id = p_user_id;
  
  -- Count likes received on user's posts (1 point each, max 100 points)
  SELECT LEAST(COALESCE(SUM(likes_count), 0), 100) INTO v_likes_received
  FROM public.posts WHERE user_id = p_user_id;
  
  -- Count comments received on user's posts (2 points each, max 50 points)
  SELECT LEAST(COUNT(*) * 2, 50) INTO v_comments_received
  FROM public.comments c
  INNER JOIN public.posts p ON c.post_id = p.id
  WHERE p.user_id = p_user_id AND c.user_id != p_user_id;
  
  -- Count comments user made (1 point each, max 30 points)
  SELECT LEAST(COUNT(*), 30) INTO v_comments_made
  FROM public.comments WHERE user_id = p_user_id;
  
  -- Count followers (3 points each, max 60 points)
  SELECT LEAST(COUNT(*) * 3, 60) INTO v_followers_count
  FROM public.follows WHERE following_id = p_user_id;
  
  -- Profile completion bonus (up to 10 points)
  SELECT 
    CASE WHEN avatar_url IS NOT NULL THEN 3 ELSE 0 END +
    CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 10 THEN 3 ELSE 0 END +
    CASE WHEN location IS NOT NULL THEN 2 ELSE 0 END +
    CASE WHEN phone IS NOT NULL THEN 2 ELSE 0 END
  INTO v_profile_complete
  FROM public.profiles WHERE user_id = p_user_id;
  
  -- Calculate total (max 300 points)
  v_total_score := COALESCE(v_posts_count, 0) + 
                   COALESCE(v_likes_received, 0) + 
                   COALESCE(v_comments_received, 0) + 
                   COALESCE(v_comments_made, 0) + 
                   COALESCE(v_followers_count, 0) + 
                   COALESCE(v_profile_complete, 0);
  
  RETURN v_total_score;
END;
$$;

-- Function to update user's trust score
CREATE OR REPLACE FUNCTION public.update_user_trust_score(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET trust_score = public.calculate_trust_score(p_user_id),
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Trigger function for posts
CREATE OR REPLACE FUNCTION public.trigger_update_trust_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_user_trust_score(NEW.user_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_trust_score(OLD.user_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for post likes
CREATE OR REPLACE FUNCTION public.trigger_update_trust_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_owner_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF v_post_owner_id IS NOT NULL THEN
      PERFORM public.update_user_trust_score(v_post_owner_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = OLD.post_id;
    IF v_post_owner_id IS NOT NULL THEN
      PERFORM public.update_user_trust_score(v_post_owner_id);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for comments
CREATE OR REPLACE FUNCTION public.trigger_update_trust_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_owner_id uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update commenter's score
    PERFORM public.update_user_trust_score(NEW.user_id);
    -- Update post owner's score
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = NEW.post_id;
    IF v_post_owner_id IS NOT NULL AND v_post_owner_id != NEW.user_id THEN
      PERFORM public.update_user_trust_score(v_post_owner_id);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_trust_score(OLD.user_id);
    SELECT user_id INTO v_post_owner_id FROM public.posts WHERE id = OLD.post_id;
    IF v_post_owner_id IS NOT NULL THEN
      PERFORM public.update_user_trust_score(v_post_owner_id);
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for follows
CREATE OR REPLACE FUNCTION public.trigger_update_trust_on_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.update_user_trust_score(NEW.following_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.update_user_trust_score(OLD.following_id);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger function for profile updates
CREATE OR REPLACE FUNCTION public.trigger_update_trust_on_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.update_user_trust_score(NEW.user_id);
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_trust_on_post ON public.posts;
CREATE TRIGGER update_trust_on_post
AFTER INSERT OR DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_post();

DROP TRIGGER IF EXISTS update_trust_on_post_update ON public.posts;
CREATE TRIGGER update_trust_on_post_update
AFTER UPDATE OF likes_count ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_post();

DROP TRIGGER IF EXISTS update_trust_on_like ON public.post_likes;
CREATE TRIGGER update_trust_on_like
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_like();

DROP TRIGGER IF EXISTS update_trust_on_comment ON public.comments;
CREATE TRIGGER update_trust_on_comment
AFTER INSERT OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_comment();

DROP TRIGGER IF EXISTS update_trust_on_follow ON public.follows;
CREATE TRIGGER update_trust_on_follow
AFTER INSERT OR DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_follow();

DROP TRIGGER IF EXISTS update_trust_on_profile ON public.profiles;
CREATE TRIGGER update_trust_on_profile
AFTER UPDATE OF avatar_url, bio, location, phone ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_update_trust_on_profile();

-- Reset all trust scores to 0 first, then recalculate
UPDATE public.profiles SET trust_score = 0;

-- Recalculate trust scores for all existing users
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.profiles
  LOOP
    PERFORM public.update_user_trust_score(r.user_id);
  END LOOP;
END $$;