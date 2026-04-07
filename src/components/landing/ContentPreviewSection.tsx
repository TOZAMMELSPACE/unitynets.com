import { memo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Clock, Play, Eye, Sparkles, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
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
  author: { full_name: string | null; avatar_url: string | null };
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchFeaturedPosts(); }, []);

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true);
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, content, likes_count, views_count, created_at, image_urls, video_url, user_id')
        .in('id', FEATURED_POST_IDS);
      if (error) throw error;
      if (!postsData || postsData.length === 0) { setPosts([]); return; }

      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);
      const profilesMap = new Map((profilesData || []).map(p => [p.user_id, p]));

      const result: FeedPost[] = FEATURED_POST_IDS
        .map(id => postsData.find(p => p.id === id))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map(p => ({
          id: p.id, content: p.content, likes_count: p.likes_count,
          views_count: p.views_count, created_at: p.created_at,
          image_urls: p.image_urls, video_url: p.video_url,
          author: profilesMap.get(p.user_id) || { full_name: null, avatar_url: null },
        }));
      setPosts(result);
    } catch (err) { console.error('Error fetching featured posts:', err); }
    finally { setLoading(false); }
  };

  const formatTimeAgo = (d: string) => {
    const diff = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (diff < 60) return language === "bn" ? "এইমাত্র" : "Just now";
    const m = Math.floor(diff / 60);
    if (m < 60) return language === "bn" ? `${m} মিনিট আগে` : `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return language === "bn" ? `${h} ঘন্টা আগে` : `${h}h`;
    const dy = Math.floor(h / 24);
    if (dy < 7) return language === "bn" ? `${dy} দিন আগে` : `${dy}d`;
    const w = Math.floor(dy / 7);
    if (w < 4) return language === "bn" ? `${w} সপ্তাহ আগে` : `${w}w`;
    return language === "bn" ? `${Math.floor(dy / 30)} মাস আগে` : `${Math.floor(dy / 30)}mo`;
  };

  const getInitials = (n: string | null) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '?';
  const getExcerpt = (c: string, max = 90) => c.length <= max ? c : c.substring(0, max).trim() + '…';

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w * 0.7 : w * 0.7, behavior: 'smooth' });
  };

  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/[0.06] rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/[0.05] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 md:mb-14">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm text-primary px-5 py-2 rounded-full text-xs font-bold mb-4 border border-primary/20 shadow-sm">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t("Community Highlights", "কমিউনিটি হাইলাইটস")}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2 tracking-tight">
              {t("Trending", "ট্রেন্ডিং")}{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                {t("Stories", "স্টোরিজ")}
              </span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base max-w-md">
              {t("Swipe through the latest from our community", "আমাদের কমিউনিটি থেকে সর্বশেষ গল্প দেখুন")}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 md:mt-0 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <button
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">{t("Loading stories...", "স্টোরি লোড হচ্ছে...")}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">{t("No posts available", "কোনো পোস্ট নেই")}</div>
        ) : (
          <div
            ref={scrollRef}
            className="flex gap-5 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-none -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.map((post, i) => (
              <StoryCard
                key={post.id}
                post={post}
                index={i}
                navigate={navigate}
                t={t}
                formatTimeAgo={formatTimeAgo}
                getExcerpt={getExcerpt}
                getInitials={getInitials}
              />
            ))}

            {/* CTA card */}
            <div
              onClick={() => navigate('/public-feed')}
              className="flex-shrink-0 w-[280px] md:w-[340px] h-[440px] md:h-[520px] rounded-3xl bg-gradient-to-br from-primary/[0.08] via-card/80 to-accent/[0.08] backdrop-blur-sm border border-border/30 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all duration-500 snap-start group hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-primary/10">
                <ArrowRight className="w-8 h-8 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-foreground mb-1">{t("View All Stories", "সব স্টোরি দেখুন")}</p>
                <p className="text-xs text-muted-foreground">{t("Explore the full feed", "পুরো ফিড এক্সপ্লোর করুন")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Story Card ─── */
interface StoryCardProps {
  post: FeedPost;
  index: number;
  navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
  t: (en: string, bn: string) => string;
  formatTimeAgo: (d: string) => string;
  getExcerpt: (c: string, m?: number) => string;
  getInitials: (n: string | null) => string;
}

const StoryCard = memo(({ post, index, navigate, t, formatTimeAgo, getExcerpt, getInitials }: StoryCardProps) => {
  const hasImage = post.image_urls && post.image_urls.length > 0;
  const hasVideo = !!post.video_url;

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="group flex-shrink-0 w-[280px] md:w-[340px] h-[440px] md:h-[520px] rounded-3xl overflow-hidden relative cursor-pointer snap-start transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10"
      style={{ opacity: 0, animation: `fade-in 0.6s ease-out ${index * 100}ms forwards` }}
    >
      {/* Background */}
      {hasVideo ? (
        <video src={post.video_url!} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]" muted playsInline preload="metadata" />
      ) : hasImage ? (
        <img src={post.image_urls![0]} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/30 to-accent/50" />
      )}

      {/* Cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 group-hover:from-black/85 transition-all duration-500" />
      
      {/* Top shimmer line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Video play */}
      {hasVideo && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
            <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>
      )}

      {/* Multi-image badge */}
      {hasImage && post.image_urls!.length > 1 && (
        <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full border border-white/10">
          +{post.image_urls!.length - 1}
        </div>
      )}

      {/* Avatar with gradient ring */}
      <div className="absolute top-4 left-4 z-10">
        <div className="p-[2.5px] rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-lg shadow-primary/20">
          <Avatar className="w-10 h-10 border-2 border-black/60">
            <AvatarImage src={post.author.avatar_url || ''} />
            <AvatarFallback className="text-[11px] bg-primary/30 text-primary-foreground font-bold">
              {getInitials(post.author.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Time badge */}
      <div className="absolute top-5 right-4 z-10">
        <div className="flex items-center gap-1.5 text-[11px] text-white/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(post.created_at)}</span>
        </div>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-5 z-10">
        {/* Author name */}
        <p className="text-sm font-bold text-white mb-1.5 tracking-wide">
          {post.author.full_name || t("Anonymous", "বেনামী")}
        </p>

        {/* Content excerpt */}
        <p className="text-[12px] md:text-[13px] text-white/70 line-clamp-3 leading-relaxed mb-4">
          {getExcerpt(post.content, 100)}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-[11px] text-white/50">
            <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Heart className="w-3.5 h-3.5" />{post.likes_count || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />{post.views_count || 0}
            </span>
          </div>
          
          {/* Read more indicator */}
          <div className="flex items-center gap-1 text-[11px] text-primary/80 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <span>{t("Read", "পড়ুন")}</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-4 h-[2px] rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 group-hover:opacity-100 opacity-70"
            style={{ width: `${Math.min(100, ((post.likes_count || 0) + (post.views_count || 0)) / 2 + 30)}%` }}
          />
        </div>
      </div>
    </div>
  );
});

StoryCard.displayName = 'StoryCard';

export default memo(ContentPreviewSection);
