import { memo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Eye, ArrowRight, Lock, Heart, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface FeedPost {
  id: string;
  content: string;
  likes_count: number | null;
  views_count: number | null;
  created_at: string;
  image_urls: string[] | null;
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
          author: profilesMap.get(post.user_id) || { full_name: null, avatar_url: null }
        }));

      setPosts(postsWithAuthors);
    } catch (err) {
      console.error('Error fetching featured posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const unityNotes = [
    { 
      title: t("Easy Programming Guide", "প্রোগ্রামিং শেখার সহজ গাইড"), 
      author: t("Rahul Ahmed", "রাহুল আহমেদ"), 
      views: 1250 
    },
    { 
      title: t("Freelancing A to Z", "ফ্রিল্যান্সিং শুরু করার A to Z"), 
      author: t("Fatima Khatun", "ফাতিমা খাতুন"), 
      views: 2340 
    },
    { 
      title: t("Graphic Design Basics", "গ্রাফিক ডিজাইনের মূল বিষয়সমূহ"), 
      author: t("Arif Hasan", "আরিফ হাসান"), 
      views: 890 
    },
    { 
      title: t("Best English Learning Tips", "ইংরেজি শেখার সেরা টিপস"), 
      author: t("Nusrat Jahan", "নুসরাত জাহান"), 
      views: 3100 
    },
    { 
      title: t("Business Startup Plan", "ব্যবসা শুরুর পরিকল্পনা"), 
      author: t("Karim Uddin", "করিম উদ্দিন"), 
      views: 1560 
    },
    { 
      title: t("Social Media Marketing", "সোশ্যাল মিডিয়া মার্কেটিং"), 
      author: t("Sara Begum", "সারা বেগম"), 
      views: 2780 
    },
    { 
      title: t("Mobile App Development", "মোবাইল অ্যাপ ডেভেলপমেন্ট"), 
      author: t("Tanvir Alam", "তানভীর আলম"), 
      views: 1890 
    },
    { 
      title: t("Digital Marketing Course", "ডিজিটাল মার্কেটিং কোর্স"), 
      author: t("Rumana Akter", "রুমানা আক্তার"), 
      views: 2100 
    },
  ];

  const formatViews = (views: number) => {
    return language === "bn" ? views.toLocaleString('bn-BD') : views.toLocaleString();
  };

  const getPostExcerpt = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getPostTitle = (content: string) => {
    // Get first line or first 40 characters as title
    const firstLine = content.split('\n')[0];
    if (firstLine.length <= 50) return firstLine;
    return firstLine.substring(0, 50).trim() + '...';
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Unity Notes Section */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="section-header mb-2">
                {t("Recent Unity Notes", "সাম্প্রতিক ইউনিটি নোটস")}
              </h2>
              <p className="text-muted-foreground">{t("Latest educational content", "সাম্প্রতিক শিক্ষামূলক কন্টেন্ট")}</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('/unity-note')}>
              <span>{t("View All", "সব দেখুন")}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {unityNotes.map((note, index) => (
              <div
                key={index}
                className="group bg-card border border-border/30 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Lock overlay */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{t("Login to read", "লগইন করে পড়ুন")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground">{t("Unity Note", "ইউনিটি নোট")}</span>
                </div>
                <h3 className="font-medium text-foreground mb-2 line-clamp-2">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t("Author", "লেখক")}: {note.author}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(note.views)} {t("views", "বার দেখা হয়েছে")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="section-header mb-2">
                {t("Recent Posts from Feed", "নিউজ ফিড থেকে সাম্প্রতিক পোস্ট")}
              </h2>
              <p className="text-muted-foreground">{t("Latest community posts", "সাম্প্রতিক কমিউনিটি পোস্ট")}</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('/public-feed')}>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {posts.slice(0, 8).map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="group bg-card border border-border/30 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* Post image thumbnail if available */}
                  {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mb-3 -mx-5 -mt-5 rounded-t-xl overflow-hidden">
                      <img 
                        src={post.image_urls[0]} 
                        alt="Post thumbnail"
                        className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-accent" />
                    <span className="text-xs text-muted-foreground">{t("Post", "পোস্ট")}</span>
                  </div>
                  <h3 className="font-medium text-foreground mb-2 line-clamp-1">
                    {getPostTitle(post.content)}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {getPostExcerpt(post.content)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate max-w-[120px]">
                      {post.author.full_name || t("Anonymous", "বেনামী")}
                    </span>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-destructive" />
                      <span>{post.likes_count || 0}</span>
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
