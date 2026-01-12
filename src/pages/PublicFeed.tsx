import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  TrendingUp,
  Users,
  Sparkles,
  Loader2,
  ArrowRight,
  FileText
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRealStats } from "@/hooks/useRealStats";

interface DbPost {
  id: string;
  content: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  image_urls: string[] | null;
  video_url: string | null;
  community_tag: string | null;
  user_id: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  comments: { id: string }[];
}

const PostCard = ({ post }: { post: DbPost }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleInteraction = () => {
    navigate('/auth?mode=signup');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("Just now", "এইমাত্র");
    if (diffMins < 60) return t(`${diffMins}m`, `${diffMins}মি`);
    if (diffHours < 24) return t(`${diffHours}h`, `${diffHours}ঘ`);
    return t(`${diffDays}d`, `${diffDays}দি`);
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <Avatar className="w-10 h-10 ring-2 ring-primary/10">
          <AvatarImage src={post.author?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {(post.author?.full_name || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">
              {post.author?.full_name || t("Anonymous", "অজ্ঞাতনামা")}
            </h4>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
          </div>
          {post.community_tag && (
            <Badge variant="secondary" className="text-[10px] h-5 mt-0.5">
              {post.community_tag}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-4">
          {post.content}
        </p>
      </div>

      {/* Media */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`grid gap-0.5 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.image_urls.slice(0, 4).map((img, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden">
              <img 
                src={img} 
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {idx === 3 && post.image_urls && post.image_urls.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold">+{post.image_urls.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {post.video_url && (
        <video 
          src={post.video_url} 
          controls 
          className="w-full max-h-64 object-cover"
          preload="metadata"
        />
      )}
      
      {/* Stats & Actions */}
      <div className="p-4 pt-3 space-y-3">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {post.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" /> {post.comments?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {post.views_count}
          </span>
        </div>
        
        <div className="flex gap-1 border-t pt-3">
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs" onClick={handleInteraction}>
            <Heart className="w-4 h-4 mr-1.5" />
            {t("Like", "লাইক")}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs" onClick={handleInteraction}>
            <MessageCircle className="w-4 h-4 mr-1.5" />
            {t("Comment", "মন্তব্য")}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs" onClick={handleInteraction}>
            <Share2 className="w-4 h-4 mr-1.5" />
            {t("Share", "শেয়ার")}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const EmptyState = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  return (
    <Card className="p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="font-semibold text-lg mb-2">
        {t("No posts yet", "এখনও কোনো পোস্ট নেই")}
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        {t("Be the first to share something with the community!", "কমিউনিটিতে প্রথম কিছু শেয়ার করুন!")}
      </p>
      <Button onClick={() => navigate('/auth?mode=signup')}>
        {t("Join & Post", "জয়েন করে পোস্ট করুন")}
      </Button>
    </Card>
  );
};

export default function PublicFeed() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeUsers, totalPosts, isLoading: statsLoading } = useRealStats();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
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
          community_tag,
          user_id,
          comments (id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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

      const postsWithAuthors: DbPost[] = postsData.map(post => ({
        ...post,
        author: profilesMap.get(post.user_id) || { full_name: null, avatar_url: null }
      }));

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatStat = (num: number): string => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-12">
        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-3">
                {t("Community Feed", "কমিউনিটি ফিড")}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mb-6">
                {t(
                  "See what our community is sharing and discussing",
                  "দেখুন আমাদের কমিউনিটি কি শেয়ার করছে"
                )}
              </p>
              
              {/* Stats */}
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-primary">
                    {statsLoading ? "..." : formatStat(activeUsers)}
                  </div>
                  <div className="text-xs text-muted-foreground">{t("Members", "সদস্য")}</div>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-accent">
                    {statsLoading ? "..." : formatStat(totalPosts)}
                  </div>
                  <div className="text-xs text-muted-foreground">{t("Posts", "পোস্ট")}</div>
                </div>
              </div>
              
              <Button onClick={() => navigate('/auth?mode=signup')} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {t("Join Community", "কমিউনিটিতে যোগ দিন")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-4">
              {/* Join CTA - Mobile */}
              <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{t("Join the conversation", "কথোপকথনে যোগ দিন")}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {t("Share your thoughts", "আপনার চিন্তা শেয়ার করুন")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => navigate('/auth?mode=signup')}>
                    {t("Join", "জয়েন")}
                  </Button>
                </div>
              </Card>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              {/* Posts */}
              {!loading && posts.length > 0 && posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Empty State */}
              {!loading && posts.length === 0 && <EmptyState />}
              
              {/* Load More CTA */}
              {!loading && posts.length > 0 && (
                <Card className="p-6 text-center bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-3">
                    {t("Want to see more and interact?", "আরও দেখতে ও ইন্টারেক্ট করতে চান?")}
                  </p>
                  <Button onClick={() => navigate('/auth?mode=signup')}>
                    {t("Create Free Account", "ফ্রি অ্যাকাউন্ট তৈরি করুন")}
                  </Button>
                </Card>
              )}
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-4 space-y-4">
              {/* Join CTA */}
              <Card className="p-5 bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <div className="text-center space-y-3">
                  <Users className="w-10 h-10 mx-auto opacity-90" />
                  <h3 className="font-bold">
                    {t("Join Our Community", "আমাদের কমিউনিটিতে যোগ দিন")}
                  </h3>
                  <p className="text-sm opacity-90">
                    {t(
                      "Connect, share and grow together",
                      "সংযুক্ত হন, শেয়ার করুন এবং একসাথে বেড়ে উঠুন"
                    )}
                  </p>
                  <Button 
                    variant="secondary" 
                    className="w-full"
                    onClick={() => navigate('/auth?mode=signup')}
                  >
                    {t("Get Started Free", "ফ্রিতে শুরু করুন")}
                  </Button>
                </div>
              </Card>

              {/* Community Stats */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  {t("Community Stats", "কমিউনিটি স্ট্যাটস")}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Members", "সদস্য")}</span>
                    <span className="font-bold text-primary">
                      {statsLoading ? "..." : formatStat(activeUsers)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Total Posts", "মোট পোস্ট")}</span>
                    <span className="font-bold text-primary">
                      {statsLoading ? "..." : formatStat(totalPosts)}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Trending Topics */}
              <Card className="p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  {t("Trending", "ট্রেন্ডিং")}
                </h3>
                
                <div className="space-y-1">
                  {["#UnityNets", "#Learning", "#Community", "#Growth"].map((tag, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm h-9"
                      onClick={() => navigate('/auth?mode=signup')}
                    >
                      <span className="text-primary mr-2 text-xs">{idx + 1}</span>
                      {tag}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
