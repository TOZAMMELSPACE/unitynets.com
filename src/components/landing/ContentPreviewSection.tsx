import { memo, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Clock, Play, Eye, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
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

const GRADIENTS = [
  'from-primary/80 via-primary/40 to-accent/60',
  'from-accent/70 via-primary/30 to-primary/60',
  'from-destructive/50 via-primary/30 to-accent/50',
  'from-primary/60 via-accent/40 to-primary/70',
  'from-accent/60 via-destructive/30 to-primary/50',
  'from-primary/70 via-primary/20 to-accent/60',
  'from-accent/50 via-accent/30 to-primary/60',
  'from-primary/50 via-destructive/20 to-accent/50',
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
  const getExcerpt = (c: string, max = 80) => c.length <= max ? c : c.substring(0, max).trim() + '…';

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w * 0.7 : w * 0.7, behavior: 'smooth' });
  };

  return (
    <section className="py-16 md:py-28 relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-background to-accent/[0.02]" />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 md:mb-12 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-3 border border-primary/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("Community Highlights", "কমিউনিটি হাইলাইটস")}</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1">
              {t("Trending Stories", "ট্রেন্ডিং স্টোরিজ")}
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              {t("Swipe through the latest from our community", "আমাদের কমিউনিটি থেকে সর্বশেষ গল্প দেখুন")}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">{t("No posts available", "কোনো পোস্ট নেই")}</div>
        ) : (
          /* Horizontal scrollable story cards */
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {posts.map((post, i) => (
              <StoryCard
                key={post.id}
                post={post}
                index={i}
                gradient={GRADIENTS[i % GRADIENTS.length]}
                navigate={navigate}
                t={t}
                formatTimeAgo={formatTimeAgo}
                getExcerpt={getExcerpt}
                getInitials={getInitials}
              />
            ))}

            {/* "View All" card */}
            <div
              onClick={() => navigate('/public-feed')}
              className="flex-shrink-0 w-[220px] md:w-[260px] h-[340px] md:h-[400px] rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/40 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-500 snap-start"
            >
              <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t("View All", "সব দেখুন")}</p>
              <p className="text-xs text-muted-foreground">{t("Explore the feed", "ফিড এক্সপ্লোর করুন")}</p>
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
  gradient: string;
  navigate: ReturnType<typeof import("react-router-dom").useNavigate>;
  t: (en: string, bn: string) => string;
  formatTimeAgo: (d: string) => string;
  getExcerpt: (c: string, m?: number) => string;
  getInitials: (n: string | null) => string;
}

const StoryCard = memo(({ post, index, gradient, navigate, t, formatTimeAgo, getExcerpt, getInitials }: StoryCardProps) => {
  const hasImage = post.image_urls && post.image_urls.length > 0;
  const hasVideo = !!post.video_url;
  const hasMedia = hasImage || hasVideo;

  return (
    <div
      onClick={() => navigate(`/post/${post.id}`)}
      className="group flex-shrink-0 w-[260px] md:w-[320px] h-[400px] md:h-[480px] rounded-2xl overflow-hidden relative cursor-pointer snap-start hover:-translate-y-3 hover:shadow-glow transition-all duration-500"
      style={{ opacity: 0, animation: `fade-in 0.5s ease-out ${index * 120}ms forwards` }}
    >
      {/* Background — media or gradient */}
      {hasVideo ? (
        <video src={post.video_url!} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" muted playsInline preload="metadata" />
      ) : hasImage ? (
        <img src={post.image_urls![0]} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-foreground/10 group-hover:from-foreground/95 transition-all duration-500" />

      {/* Video play indicator */}
      {hasVideo && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-12 h-12 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>
      )}

      {/* Multi-image badge */}
      {hasImage && post.image_urls!.length > 1 && (
        <div className="absolute top-3 right-3 z-10 bg-foreground/50 backdrop-blur-sm text-background text-[10px] font-bold px-2.5 py-1 rounded-full">
          +{post.image_urls!.length - 1}
        </div>
      )}

      {/* Top — Avatar ring (Instagram-style) */}
      <div className="absolute top-3 left-3 z-10">
        <div className="p-[2px] rounded-full bg-gradient-to-br from-primary via-accent to-primary">
          <Avatar className="w-9 h-9 border-2 border-foreground/80">
            <AvatarImage src={post.author.avatar_url || ''} />
            <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
              {getInitials(post.author.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Time badge */}
      <div className="absolute top-4 right-3 z-10">
        <div className="flex items-center gap-1 text-[10px] text-background/80 bg-foreground/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(post.created_at)}</span>
        </div>
      </div>

      {/* Bottom content — glass overlay */}
      <div className="absolute bottom-0 inset-x-0 p-4 z-10">
        <p className="text-xs font-semibold text-background/90 mb-0.5">
          {post.author.full_name || t("Anonymous", "বেনামী")}
        </p>
        <p className="text-[11px] md:text-xs text-background/75 line-clamp-3 leading-relaxed mb-3">
          {getExcerpt(post.content, 100)}
        </p>

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-[10px] text-background/60">
          <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{post.likes_count || 0}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.views_count || 0}</span>
        </div>

        {/* Progress bar (decorative) */}
        <div className="mt-3 h-[2px] rounded-full bg-background/20 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, ((post.likes_count || 0) + (post.views_count || 0)) / 2 + 30)}%` }}
          />
        </div>
      </div>
    </div>
  );
});

StoryCard.displayName = 'StoryCard';

export default memo(ContentPreviewSection);
