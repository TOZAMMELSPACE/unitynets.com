import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Clock, Play, Eye, Sparkles } from "lucide-react";
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

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );

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

  const getPostExcerpt = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getAuthorInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      <div className="absolute top-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto relative z-10">
        {/* Premium Section Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>{t("Community Highlights", "কমিউনিটি হাইলাইটস")}</span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            {t("Recent Posts from Feed", "নিউজ ফিড থেকে সাম্প্রতিক পোস্ট")}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t(
              "Discover what our community is sharing right now",
              "আমাদের কমিউনিটি এখন কী শেয়ার করছে তা দেখুন"
            )}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {t("No posts available", "কোনো পোস্ট নেই")}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {posts.slice(0, 8).map((post, index) => (
              <div
                key={post.id}
                onClick={() => navigate(`/post/${post.id}`)}
                className="group relative bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden hover:shadow-glow hover:-translate-y-2 transition-all duration-500 cursor-pointer flex flex-col animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                {/* Post media thumbnail */}
                {(post.image_urls && post.image_urls.length > 0) || post.video_url ? (
                  <div className="relative h-28 md:h-36 lg:h-44 overflow-hidden">
                    {post.video_url ? (
                      <>
                        <video 
                          src={post.video_url} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : post.image_urls && post.image_urls.length > 0 ? (
                      <>
                        <img 
                          src={post.image_urls[0]} 
                          alt="Post thumbnail"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                        {post.image_urls.length > 1 && (
                          <div className="absolute top-2 right-2 bg-foreground/70 text-background text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                            +{post.image_urls.length - 1}
                          </div>
                        )}
                      </>
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 pointer-events-none" />
                  </div>
                ) : (
                  /* Text-only post gets a decorative gradient top */
                  <div className="h-2 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
                )}
                
                <div className="relative p-3 md:p-4 flex flex-col flex-1">
                  {/* Author info */}
                  <div className="flex items-center gap-2 mb-2.5 md:mb-3">
                    <Avatar className="w-7 h-7 md:w-9 md:h-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={post.author.avatar_url || ''} alt={post.author.full_name || ''} />
                      <AvatarFallback className="text-[10px] md:text-xs bg-primary/15 text-primary font-semibold">
                        {getAuthorInitials(post.author.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-sm font-semibold text-foreground truncate">
                        {post.author.full_name || t("Anonymous", "বেনামী")}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground">
                        <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                        <span>{formatTimeAgo(post.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post content */}
                  <p className="text-xs md:text-sm text-foreground/75 mb-3 md:mb-4 line-clamp-2 flex-1 leading-relaxed">
                    {getPostExcerpt(post.content)}
                  </p>

                  {/* Stats bar */}
                  <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground pt-2.5 border-t border-border/30">
                    <div className="flex items-center gap-1.5 group/like">
                      <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-destructive/70 group-hover/like:text-destructive transition-colors" />
                      <span className="font-medium">{post.likes_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 md:w-4 md:h-4 text-muted-foreground/60" />
                      <span className="font-medium">{post.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-10 md:mt-14 animate-fade-in">
          <Button 
            size="lg"
            className="btn-hero rounded-xl px-8 py-6 text-base group"
            onClick={() => navigate('/public-feed')}
          >
            <span>{t("Explore All Posts", "সকল পোস্ট দেখুন")}</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default memo(ContentPreviewSection);
