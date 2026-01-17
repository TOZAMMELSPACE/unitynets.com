import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Eye, ArrowRight, Lock, Heart, Loader2, Clock, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeedPost {
  id: string;
  content: string;
  likes_count: number | null;
  views_count: number | null;
  created_at: string;
  image_urls: string[] | null;
  video_url: string | null;
  author: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Specific post IDs to display
const FEATURED_POST_IDS = [
  '3f84e592-cbfa-450a-9580-af23e93c2024',
  '6616f0a5-75c5-4616-a22b-5efeadb1a8bb',
  'eb529c47-1b94-47eb-b01a-659ebb1e348c',
  'df19f54a-891c-417c-b9f9-97ea0e9fb495',
  '8932172f-d0ca-4765-addb-d6f883515612',
  '4082d58d-d125-4b62-933f-e4129cd2fdaf',
  'ac2e1b27-bfab-47a4-9860-a6c7c858be13',
  '260c2eff-d312-4011-b4b2-7503feee129c',
];

export const ContentPreviewSection = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPosts();
  }, []);

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          likes_count,
          views_count,
          created_at,
          image_urls,
          video_url,
          user_id
        `)
        .in('id', FEATURED_POST_IDS);

      if (postsError) throw postsError;

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get user profiles
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

      // Map posts with authors and maintain the order of FEATURED_POST_IDS
      const postsWithAuthors: FeedPost[] = FEATURED_POST_IDS
        .map(id => postsData.find(p => p.id === id))
        .filter((post): post is NonNullable<typeof post> => post !== undefined)
        .map(post => ({
          id: post.id,
          content: post.content,
          likes_count: post.likes_count,
          views_count: post.views_count,
          created_at: post.created_at,
          image_urls: post.image_urls,
          video_url: post.video_url,
          author: profilesMap.get(post.user_id) || { full_name: null, avatar_url: null }
        }));

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching featured posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return language === "bn" ? "এইমাত্র" : "Just now";
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return language === "bn" ? `${diffInMinutes} মিনিট আগে` : `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return language === "bn" ? `${diffInHours} ঘন্টা আগে` : `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return language === "bn" ? `${diffInDays} দিন আগে` : `${diffInDays}d ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return language === "bn" ? `${diffInWeeks} সপ্তাহ আগে` : `${diffInWeeks}w ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return language === "bn" ? `${diffInMonths} মাস আগে` : `${diffInMonths}mo ago`;
  };

  const getPostExcerpt = (content: string, maxLength: number = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getAuthorInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Recent Posts Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">
                {t("Recent Posts from Feed", "নিউজ ফিড থেকে সাম্প্রতিক পোস্ট")}
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">{t("Latest community posts", "সাম্প্রতিক কমিউনিটি পোস্ট")}</p>
            </div>
            <Button variant="ghost" className="mt-3 md:mt-0 group text-sm" onClick={() => navigate('/public-feed')}>
              <span>{t("View All", "সব দেখুন")}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("No posts available", "কোনো পোস্ট নেই")}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {posts.slice(0, 8).map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="group bg-card border border-border/30 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                >
                  {/* Post media thumbnail - image or video */}
                  {(post.image_urls && post.image_urls.length > 0) || post.video_url ? (
                    <div className="relative h-24 md:h-32 lg:h-36 overflow-hidden bg-muted">
                      {post.video_url ? (
                        <>
                          <video 
                            src={post.video_url} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          {/* Video play indicator */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/60 flex items-center justify-center">
                              <Play className="w-4 h-4 md:w-5 md:h-5 text-white fill-white" />
                            </div>
                          </div>
                        </>
                      ) : post.image_urls && post.image_urls.length > 0 ? (
                        <>
                          <img 
                            src={post.image_urls[0]} 
                            alt="Post thumbnail"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Multiple images indicator */}
                          {post.image_urls.length > 1 && (
                            <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-black/60 text-white text-[10px] md:text-xs px-1.5 py-0.5 rounded">
                              +{post.image_urls.length - 1}
                            </div>
                          )}
                        </>
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    </div>
                  ) : null}
                  
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    {/* Author info with avatar */}
                    <div className="flex items-center gap-2 mb-2 md:mb-3">
                      <Avatar className="w-6 h-6 md:w-8 md:h-8 border-2 border-primary/20">
                        <AvatarImage src={post.author.avatar_url || ''} alt={post.author.full_name || ''} />
                        <AvatarFallback className="text-[10px] md:text-xs bg-primary/10 text-primary">
                          {getAuthorInitials(post.author.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] md:text-sm font-medium text-foreground truncate">
                          {post.author.full_name || t("Anonymous", "বেনামী")}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
                          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          <span>{formatTimeAgo(post.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Post content */}
                    <p className="text-xs md:text-sm text-foreground/80 mb-2 md:mb-3 line-clamp-2 flex-1">
                      {getPostExcerpt(post.content)}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground pt-2 border-t border-border/30">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-destructive" />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span>{post.views_count || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default memo(ContentPreviewSection);
