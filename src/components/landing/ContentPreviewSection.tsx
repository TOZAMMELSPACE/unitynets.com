import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Clock, Play, Eye, TrendingUp, Sparkles, MessageSquare } from "lucide-react";
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

  // Split: 1 spotlight + rest in masonry
  const spotlight = posts[0];
  const masonryPosts = posts.slice(1, 7);
  const leftCol = masonryPosts.filter((_, i) => i % 2 === 0);
  const rightCol = masonryPosts.filter((_, i) => i % 2 === 1);

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-background to-accent/[0.03]" />
      <div className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -left-32 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 border border-primary/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t("Community Highlights", "কমিউনিটি হাইলাইটস")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            {t("What's Happening", "কী হচ্ছে")}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            {t("Real stories, real moments — from our vibrant community", "সত্যিকারের গল্প, সত্যিকারের মুহূর্ত — আমাদের প্রাণবন্ত কমিউনিটি থেকে")}
          </p>
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
          <div className="grid lg:grid-cols-[1fr_1fr] gap-6 md:gap-8">
            {/* LEFT — Spotlight Card */}
            {spotlight && (
              <div
                onClick={() => navigate(`/post/${spotlight.id}`)}
                className="group relative rounded-3xl overflow-hidden cursor-pointer animate-fade-in min-h-[420px] lg:min-h-[520px] flex flex-col justify-end"
              >
                {/* Full-bleed media background */}
                {spotlight.video_url ? (
                  <video src={spotlight.video_url} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted playsInline preload="metadata" />
                ) : spotlight.image_urls && spotlight.image_urls.length > 0 ? (
                  <img src={spotlight.image_urls[0]} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />

                {/* Video play icon */}
                {spotlight.video_url && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-primary-foreground fill-primary-foreground ml-1" />
                    </div>
                  </div>
                )}

                {/* Trending badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    {t("Featured", "ফিচার্ড")}
                  </div>
                </div>

                {/* Content overlay */}
                <div className="relative z-10 p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 ring-2 ring-background/30">
                      <AvatarImage src={spotlight.author.avatar_url || ''} />
                      <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                        {getInitials(spotlight.author.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-background">
                        {spotlight.author.full_name || t("Anonymous", "বেনামী")}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-background/70">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(spotlight.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-background/90 text-base md:text-lg leading-relaxed line-clamp-3 mb-4">
                    {getExcerpt(spotlight.content, 200)}
                  </p>
                  <div className="flex items-center gap-5 text-xs text-background/70">
                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{spotlight.likes_count || 0}</span>
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{spotlight.views_count || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* RIGHT — Masonry 2-column staggered grid */}
            <div className="grid grid-cols-2 gap-4 md:gap-5 content-start">
              {/* Left column */}
              <div className="space-y-4 md:space-y-5">
                {leftCol.map((post, i) => (
                  <MasonryCard key={post.id} post={post} index={i} navigate={navigate} t={t} language={language} formatTimeAgo={formatTimeAgo} getExcerpt={getExcerpt} getInitials={getInitials} hasMedia={hasMedia} tall={i === 0} />
                ))}
              </div>
              {/* Right column — offset for stagger */}
              <div className="space-y-4 md:space-y-5 pt-8 md:pt-10">
                {rightCol.map((post, i) => (
                  <MasonryCard key={post.id} post={post} index={i + leftCol.length} navigate={navigate} t={t} language={language} formatTimeAgo={formatTimeAgo} getExcerpt={getExcerpt} getInitials={getInitials} hasMedia={hasMedia} tall={i === 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12 md:mt-16 animate-fade-in">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-base group bg-gradient-hero shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
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

/* ─── Masonry Card ─── */
interface MasonryCardProps {
  post: FeedPost;
  index: number;
  navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
  t: (en: string, bn: string) => string;
  language: string;
  formatTimeAgo: (d: string) => string;
  getExcerpt: (c: string, m?: number) => string;
  getInitials: (n: string | null) => string;
  hasMedia: (p: FeedPost) => boolean | string | null;
  tall?: boolean;
}

const MasonryCard = memo(({ post, index, navigate, t, language, formatTimeAgo, getExcerpt, getInitials, hasMedia, tall }: MasonryCardProps) => (
  <div
    onClick={() => navigate(`/post/${post.id}`)}
    className="group relative bg-card border border-border/40 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-500 animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

    {/* Media */}
    {hasMedia(post) ? (
      <div className={`relative overflow-hidden ${tall ? 'h-44 md:h-56' : 'h-28 md:h-36'}`}>
        {post.video_url ? (
          <>
            <video src={post.video_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" muted playsInline preload="metadata" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
              </div>
            </div>
          </>
        ) : post.image_urls && post.image_urls.length > 0 ? (
          <>
            <img src={post.image_urls[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
            {post.image_urls.length > 1 && (
              <div className="absolute top-2 right-2 bg-foreground/60 text-background text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                +{post.image_urls.length - 1}
              </div>
            )}
          </>
        ) : null}
      </div>
    ) : (
      <div className="h-1 bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" />
    )}

    {/* Content */}
    <div className="relative p-3 md:p-4">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="w-6 h-6 ring-1 ring-primary/15">
          <AvatarImage src={post.author.avatar_url || ''} />
          <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
            {getInitials(post.author.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] md:text-xs font-semibold text-foreground truncate">
            {post.author.full_name || t("Anonymous", "বেনামী")}
          </p>
        </div>
      </div>

      <p className="text-xs text-foreground/75 line-clamp-2 leading-relaxed mb-2.5">
        {getExcerpt(post.content, tall ? 80 : 55)}
      </p>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/30">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-destructive/60" />{post.likes_count || 0}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count || 0}</span>
        </div>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTimeAgo(post.created_at)}</span>
      </div>
    </div>
  </div>
));

MasonryCard.displayName = 'MasonryCard';

export default memo(ContentPreviewSection);
