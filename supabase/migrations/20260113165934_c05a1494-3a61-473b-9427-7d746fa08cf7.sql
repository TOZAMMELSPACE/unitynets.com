-- Add sentiment_score column to posts for tracking
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS sentiment_score integer DEFAULT 0;

-- Function to analyze sentiment based on keywords
CREATE OR REPLACE FUNCTION public.analyze_post_sentiment(p_content text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score integer := 0;
  v_content_lower text;
  -- Positive keywords (English + Bangla)
  v_positive_keywords text[] := ARRAY[
    -- English positive
    'thank', 'thanks', 'helpful', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 
    'love', 'appreciate', 'good', 'best', 'fantastic', 'brilliant', 'outstanding',
    'perfect', 'beautiful', 'nice', 'kind', 'support', 'inspire', 'motivate', 'success',
    'happy', 'joy', 'blessed', 'grateful', 'welcome', 'congrats', 'congratulations',
    'well done', 'proud', 'respect', 'learned', 'learning', 'growing', 'progress',
    -- Bangla positive (transliterated)
    'ধন্যবাদ', 'সাহায্য', 'ভালো', 'সুন্দর', 'অসাধারণ', 'চমৎকার', 'দারুণ', 
    'শুভকামনা', 'অভিনন্দন', 'সফল', 'আনন্দ', 'খুশি', 'কৃতজ্ঞ', 'সম্মান',
    'শিখলাম', 'শেখা', 'উন্নতি', 'অনুপ্রেরণা', 'সহযোগিতা', 'বন্ধু', 'ভাই',
    'আপা', 'মাশাআল্লাহ', 'আলহামদুলিল্লাহ', 'জাজাকাল্লাহ', 'বাহ', 'সেরা'
  ];
  -- Negative keywords (English + Bangla)
  v_negative_keywords text[] := ARRAY[
    -- English negative
    'hate', 'terrible', 'awful', 'worst', 'stupid', 'idiot', 'dumb', 'useless',
    'scam', 'fraud', 'fake', 'liar', 'cheat', 'spam', 'abuse', 'harass',
    'threat', 'kill', 'die', 'attack', 'violence', 'racist', 'sexist', 'ugly',
    'disgusting', 'pathetic', 'loser', 'trash', 'garbage', 'waste', 'worthless',
    'toxic', 'poison', 'dangerous', 'harmful', 'illegal', 'criminal',
    -- Bangla negative (transliterated)
    'বোকা', 'গাধা', 'চোর', 'মিথ্যাবাদী', 'প্রতারক', 'ফেক', 'স্ক্যাম',
    'খারাপ', 'জঘন্য', 'বাজে', 'নষ্ট', 'ধ্বংস', 'মার', 'হুমকি',
    'গালি', 'অশ্লীল', 'বেয়াদব', 'অভদ্র', 'হারামি', 'শালা', 'বদমাশ'
  ];
  v_keyword text;
BEGIN
  v_content_lower := lower(p_content);
  
  -- Check positive keywords (+1 each, max +10)
  FOREACH v_keyword IN ARRAY v_positive_keywords
  LOOP
    IF v_content_lower LIKE '%' || lower(v_keyword) || '%' THEN
      v_score := v_score + 1;
    END IF;
  END LOOP;
  v_score := LEAST(v_score, 10);
  
  -- Check negative keywords (-2 each, min -20)
  FOREACH v_keyword IN ARRAY v_negative_keywords
  LOOP
    IF v_content_lower LIKE '%' || lower(v_keyword) || '%' THEN
      v_score := v_score - 2;
    END IF;
  END LOOP;
  v_score := GREATEST(v_score, -20);
  
  RETURN v_score;
END;
$$;

-- Updated function to calculate trust score with sentiment
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
  v_sentiment_score integer;
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
  
  -- Calculate sentiment score from all user's posts (can be negative!)
  SELECT COALESCE(SUM(sentiment_score), 0) INTO v_sentiment_score
  FROM public.posts WHERE user_id = p_user_id;
  -- Cap sentiment between -50 and +50
  v_sentiment_score := GREATEST(LEAST(v_sentiment_score, 50), -50);
  
  -- Calculate total (can go below 0 if very negative)
  v_total_score := COALESCE(v_posts_count, 0) + 
                   COALESCE(v_likes_received, 0) + 
                   COALESCE(v_comments_received, 0) + 
                   COALESCE(v_comments_made, 0) + 
                   COALESCE(v_followers_count, 0) + 
                   COALESCE(v_profile_complete, 0) +
                   COALESCE(v_sentiment_score, 0);
  
  -- Minimum score is 0
  RETURN GREATEST(v_total_score, 0);
END;
$$;

-- Trigger function to analyze sentiment when post is created/updated
CREATE OR REPLACE FUNCTION public.trigger_analyze_post_sentiment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Analyze sentiment of the post content
  NEW.sentiment_score := public.analyze_post_sentiment(NEW.content);
  RETURN NEW;
END;
$$;

-- Create trigger to analyze sentiment before insert/update
DROP TRIGGER IF EXISTS analyze_post_sentiment ON public.posts;
CREATE TRIGGER analyze_post_sentiment
BEFORE INSERT OR UPDATE OF content ON public.posts
FOR EACH ROW EXECUTE FUNCTION public.trigger_analyze_post_sentiment();

-- Update existing posts with sentiment scores
UPDATE public.posts 
SET sentiment_score = public.analyze_post_sentiment(content);

-- Recalculate trust scores for all users with new sentiment
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT user_id FROM public.profiles
  LOOP
    PERFORM public.update_user_trust_score(r.user_id);
  END LOOP;
END $$;