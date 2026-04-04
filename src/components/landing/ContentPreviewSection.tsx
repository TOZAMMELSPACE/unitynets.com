import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Clock, Play, Eye, TrendingUp } from "lucide-react";
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
        .select('id, content, likes_count, views_count, created_at, image_urls, video_url, user_id')
        .in('id', FEATURED_POST_IDS);

      if (postsError) throw postsError;
      if (!postsData || postsData.length === 0) { setPosts([]); return; }

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));

      const postsWithAuthors: FeedPost[] = FEATURED_POST_IDS
        .map(id => postsData.find(p => p.id === id))
        .filter((post): post is NonNullable<typeof post> => post !== undefined)
        .map(post => ({
          id: post.id, content: post.content, likes_count: post.likes_count,
          views_count: post.views_count, created_at: post.created_at,
          image_urls: post.image_urls, video_url: post.video_url,
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
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return language === "bn" ? "এইমাত্র" : "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return language === "bn" ? `${mins} মিনিট আগে` : `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return language === "bn" ? `${hrs} ঘন্টা আগে` : `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return language === "bn" ? `${days} দিন আগে` : `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return language === "bn" ? `${weeks} সপ্তাহ আগে` : `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return language === "bn" ? `${months} মাস আগে` : `${months}mo ago`;
  };

  const getExcerpt = (content: string, max: number = 90) =>
    content.length <= max ? content : content.substring(0, max).trim() + '...';

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const hasMedia = (post: FeedPost) =>
    (post.image_urls && post.image_urls.length > 0) || post.video_url;

  const MediaThumbnail = ({ post, tall = false }: { post: FeedPost; tall?: boolean }) => (
    <div className={`relative overflow-hidden ${tall ? 'h-full min-h-[200px]' : 'h-32 md:h-40'}`}>
      {post.video_url ? (
        <>
          <video src={post.video_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted playsInline preload="metadata" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-11 h-11 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-glow">
              <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
            </div>
          </div>
        </>
      ) : post.image_urls && post.image_urls.length > 0 ? (
        <>
          <img src={post.image_urls[0]} alt="Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
          {post.image_urls.length > 1 && (
            <div className="absolute top-2 right-2 bg-foreground/60 text-background text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
              +{post.image_urls.length - 1}
            </div>
          )}
        </>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent pointer-events-none" />
    </div>
  );

  // Split posts: first 2 featured (large), rest are compact
  const featured = posts.slice(0, 2);
  const rest = posts.slice(2, 8);

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background to-muted/30" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-semibold mb-3 border border-primary/15">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t("Trending Now", "এখন ট্রেন্ডিং")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1.5">
              {t("Community Feed", "কমিউনিটি ফিড")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              {t("Stories and moments shared by our members", "আমাদের সদস্যদের শেয়ার করা গল্প ও মুহূর্ত")}
            </p>
          </div>
          <Button variant="outline" className="mt-4 md:mt-0 group text-sm rounded-full border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300" onClick={() => navigate('/public-feed')}>
            <span>{t("View All Posts", "সকল পোস্ট দেখুন")}</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            {t("No posts available", "কোনো পোস্ট নেই")}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured Row — 2 large horizontal cards */}
            <div className="grid md:grid-cols-2 gap-5 md:gap-6">
              {featured.map((post, i) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="group relative flex flex-col md:flex-row bg-card/90 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden hover:shadow-large hover:-translate-y-1 transition-all duration-500 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Media — left side on desktop */}
                  {hasMedia(post) ? (
                    <div className="md:w-2/5 flex-shrink-0">
                      <MediaThumbnail post={post} tall />
                    </div>
                  ) : (
                    <div className="md:w-2/5 flex-shrink-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-12 h-12 text-primary/20" />
                    </div>
                  )}

                  {/* Content — right side */}
                  <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                          <AvatarImage src={post.author.avatar_url || ''} alt={post.author.full_name || ''} />
                          <AvatarFallback className="text-xs bg-primary/15 text-primary font-semibold">
                            {getInitials(post.author.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground truncate">
                            {post.author.full_name || t("Anonymous", "বেনামী")}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-foreground/80 leading-relaxed line-clamp-3">
                        {getExcerpt(post.content, 150)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5 text-destructive/70" />{post.likes_count || 0}</span>
                      <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{post.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rest — compact grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
              {rest.map((post, i) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="group bg-card/70 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden hover:shadow-medium hover:-translate-y-1 transition-all duration-400 cursor-pointer flex flex-col animate-fade-in"
                  style={{ animationDelay: `${(i + 2) * 80}ms` }}
                >
                  {hasMedia(post) ? (
                    <MediaThumbnail post={post} />
                  ) : (
                    <div className="h-1.5 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30" />
                  )}
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6 ring-1 ring-primary/15">
                        <AvatarImage src={post.author.avatar_url || ''} alt={post.author.full_name || ''} />
                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                          {getInitials(post.author.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] md:text-xs font-semibold text-foreground truncate">
                          {post.author.full_name || t("Anonymous", "বেনামী")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/75 line-clamp-2 flex-1 leading-relaxed mb-2">
                      {getExcerpt(post.content, 70)}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground pt-2 border-t border-border/20">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-destructive/60" />{post.likes_count || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(ContentPreviewSection);
