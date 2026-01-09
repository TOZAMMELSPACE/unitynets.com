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
  Newspaper,
  Sparkles,
  Loader2,
  HandHeart,
  GraduationCap,
  Shield
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface DemoPost {
  id: string;
  author: {
    name: string;
    nameBn: string;
    avatar: string;
    role: string;
    roleBn: string;
  };
  content: string;
  contentBn: string;
  likes: number;
  comments: number;
  views: number;
  timeAgo: string;
  timeAgoBn: string;
  communityTag?: string;
}

const demoPosts: DemoPost[] = [
  {
    id: "1",
    author: {
      name: "Tozammel Haque",
      nameBn: "তোজাম্মেল হক",
      avatar: "",
      role: "Community Leader",
      roleBn: "কমিউনিটি লিডার"
    },
    content: "Welcome to UnityNets! 🎉 This platform is built for trust, learning, and unity. Let's build a stronger community together! #UnityNets #Bangladesh",
    contentBn: "UnityNets-এ স্বাগতম! 🎉 এই প্ল্যাটফর্মটি বিশ্বাস, শিক্ষা এবং ঐক্যের জন্য তৈরি। আসুন একসাথে একটি শক্তিশালী কমিউনিটি গড়ি! #UnityNets #বাংলাদেশ",
    likes: 245,
    comments: 32,
    views: 1250,
    timeAgo: "2 hours ago",
    timeAgoBn: "২ ঘন্টা আগে",
    communityTag: "Announcements"
  },
  {
    id: "2",
    author: {
      name: "Fatima Rahman",
      nameBn: "ফাতিমা রহমান",
      avatar: "",
      role: "Educator",
      roleBn: "শিক্ষক"
    },
    content: "Just completed the Python Basics course in Learning Zone! The content is amazing and completely free. Thank you UnityNets for this opportunity! 📚💻",
    contentBn: "এইমাত্র লার্নিং জোনে পাইথন বেসিক কোর্স শেষ করলাম! কন্টেন্ট অসাধারণ এবং সম্পূর্ণ ফ্রি। এই সুযোগের জন্য UnityNets-কে ধন্যবাদ! 📚💻",
    likes: 189,
    comments: 28,
    views: 890,
    timeAgo: "5 hours ago",
    timeAgoBn: "৫ ঘন্টা আগে",
    communityTag: "Learning"
  },
  {
    id: "3",
    author: {
      name: "Karim Ahmed",
      nameBn: "করিম আহমেদ",
      avatar: "",
      role: "Developer",
      roleBn: "ডেভেলপার"
    },
    content: "Looking for collaboration on a community project! We're building a tool to help local farmers connect with markets. Anyone interested in joining? 🌾🤝",
    contentBn: "একটি কমিউনিটি প্রজেক্টে সহযোগিতার জন্য খুঁজছি! আমরা স্থানীয় কৃষকদের বাজারের সাথে সংযুক্ত করতে একটি টুল তৈরি করছি। কেউ যোগ দিতে আগ্রহী? 🌾🤝",
    likes: 156,
    comments: 45,
    views: 720,
    timeAgo: "8 hours ago",
    timeAgoBn: "৮ ঘন্টা আগে",
    communityTag: "Projects"
  },
  {
    id: "4",
    author: {
      name: "Nusrat Jahan",
      nameBn: "নুসরাত জাহান",
      avatar: "",
      role: "Student",
      roleBn: "শিক্ষার্থী"
    },
    content: "The Unity Notes feature is brilliant! I can now exchange value within the community. Already earned 50 notes by helping others. This is the future! 💡",
    contentBn: "ইউনিটি নোটস ফিচারটি অসাধারণ! এখন কমিউনিটির মধ্যে মূল্য বিনিময় করতে পারছি। ইতিমধ্যে অন্যদের সাহায্য করে ৫০ নোটস অর্জন করেছি। এটাই ভবিষ্যৎ! 💡",
    likes: 234,
    comments: 67,
    views: 1100,
    timeAgo: "1 day ago",
    timeAgoBn: "১ দিন আগে",
    communityTag: "Unity Notes"
  }
];

interface DbPost {
  id: string;
  content: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  image_urls: string[] | null;
  video_url: string | null;
  community_tag: string | null;
  profiles: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  comments: { id: string }[];
}

const RealPostCard = ({ post }: { post: DbPost }) => {
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
    if (diffMins < 60) return t(`${diffMins} minutes ago`, `${diffMins} মিনিট আগে`);
    if (diffHours < 24) return t(`${diffHours} hours ago`, `${diffHours} ঘন্টা আগে`);
    return t(`${diffDays} days ago`, `${diffDays} দিন আগে`);
  };
  
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      {/* Author Info */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-12 h-12 border-2 border-primary/20">
          <AvatarImage src={post.profiles?.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {(post.profiles?.full_name || "U").charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{post.profiles?.full_name || t("Anonymous", "অজ্ঞাতনামা")}</h4>
          </div>
          <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
        </div>
        
        {post.community_tag && (
          <Badge variant="outline" className="text-xs">
            {post.community_tag}
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </p>

      {/* Images */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className="mb-4 grid gap-2 grid-cols-2">
          {post.image_urls.slice(0, 4).map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`Post image ${idx + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Video */}
      {post.video_url && (
        <div className="mb-4">
          <video 
            src={post.video_url} 
            controls 
            className="w-full rounded-lg max-h-80"
          />
        </div>
      )}
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pt-4 border-t">
        <span className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          {post.likes_count}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {post.comments?.length || 0}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {post.views_count}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <Heart className="w-4 h-4 mr-2" />
          {t("Like", "লাইক")}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("Comment", "মন্তব্য")}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <Share2 className="w-4 h-4 mr-2" />
          {t("Share", "শেয়ার")}
        </Button>
      </div>
    </Card>
  );
};

const DemoPostCard = ({ post }: { post: DemoPost }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleInteraction = () => {
    navigate('/auth?mode=signup');
  };
  
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      {/* Author Info */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="w-12 h-12 border-2 border-primary/20">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {post.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold">{t(post.author.name, post.author.nameBn)}</h4>
            <Badge variant="secondary" className="text-xs">
              {t(post.author.role, post.author.roleBn)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t(post.timeAgo, post.timeAgoBn)}</p>
        </div>
        
        {post.communityTag && (
          <Badge variant="outline" className="text-xs">
            {post.communityTag}
          </Badge>
        )}
      </div>
      
      {/* Content */}
      <p className="text-foreground mb-4 leading-relaxed">
        {t(post.content, post.contentBn)}
      </p>
      
      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pt-4 border-t">
        <span className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {post.views}
        </span>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <Heart className="w-4 h-4 mr-2" />
          {t("Like", "লাইক")}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <MessageCircle className="w-4 h-4 mr-2" />
          {t("Comment", "মন্তব্য")}
        </Button>
        <Button variant="ghost" size="sm" className="flex-1" onClick={handleInteraction}>
          <Share2 className="w-4 h-4 mr-2" />
          {t("Share", "শেয়ার")}
        </Button>
      </div>
    </Card>
  );
};

export default function PublicFeed() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
          profiles:user_id (
            id,
            full_name,
            avatar_url,
            bio
          ),
          comments (id)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts((data as unknown as DbPost[]) || []);
      setHasMore((data?.length || 0) >= 20);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Message */}
          <Card className="mb-8 p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="flex justify-center gap-3 mb-6">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="p-3 bg-accent/10 rounded-full">
                  <GraduationCap className="w-6 h-6 text-accent" />
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <HandHeart className="w-6 h-6 text-primary" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {t("Welcome to UnityNets!", "UnityNets-এ স্বাগতম!")}
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6">
                {t(
                  "A trusted community where we learn together, grow together, and build a stronger Bangladesh. Trust • Learn • Unite",
                  "একটি বিশ্বস্ত কমিউনিটি যেখানে আমরা একসাথে শিখি, একসাথে বেড়ে উঠি এবং একটি শক্তিশালী বাংলাদেশ গড়ি। বিশ্বাস • শিক্ষা • ঐক্য"
                )}
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm bg-background/50 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{t("1000+ Members", "১০০০+ সদস্য")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-background/50 px-4 py-2 rounded-full">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <span>{t("Free Learning", "ফ্রি শিক্ষা")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-background/50 px-4 py-2 rounded-full">
                  <HandHeart className="w-4 h-4 text-primary" />
                  <span>{t("Community Support", "কমিউনিটি সাপোর্ট")}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?mode=signup')}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {t("Join Our Community", "কমিউনিটিতে যোগ দিন")}
              </Button>
            </div>
          </Card>

          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Newspaper className="w-4 h-4 mr-2" />
              {t("Community Feed", "কমিউনিটি ফিড")}
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t("What's Happening", "কি চলছে")}
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "See what the UnityNets community is sharing, learning, and building together",
                "দেখুন UnityNets কমিউনিটি কি শেয়ার করছে, শিখছে এবং একসাথে তৈরি করছে"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* CTA Card */}
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t("Join the Conversation", "কথোপকথনে যোগ দিন")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("Sign up to share your thoughts and connect with the community", "সাইন আপ করুন আপনার চিন্তা শেয়ার করতে এবং কমিউনিটির সাথে সংযুক্ত হতে")}
                    </p>
                  </div>
                  <Button onClick={() => navigate('/auth?mode=signup')}>
                    {t("Join Now", "জয়েন করুন")}
                  </Button>
                </div>
              </Card>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              
              {/* Real Posts from Database */}
              {!loading && posts.length > 0 && posts.map((post) => (
                <RealPostCard key={post.id} post={post} />
              ))}

              {/* Demo Posts (shown if no real posts or as fallback) */}
              {!loading && posts.length === 0 && demoPosts.map((post) => (
                <DemoPostCard key={post.id} post={post} />
              ))}
              
              {/* Load More CTA */}
              <Card className="p-8 text-center bg-muted/50">
                <h3 className="font-semibold text-lg mb-2">
                  {t("Want to see more?", "আরও দেখতে চান?")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("Join UnityNets to access the full community feed", "পূর্ণ কমিউনিটি ফিড অ্যাক্সেস করতে UnityNets-এ যোগ দিন")}
                </p>
                <Button size="lg" onClick={() => navigate('/auth?mode=signup')}>
                  {t("Create Free Account", "ফ্রি অ্যাকাউন্ট তৈরি করুন")}
                </Button>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Community Stats */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t("Community Stats", "কমিউনিটি স্ট্যাটস")}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Active Members", "সক্রিয় সদস্য")}</span>
                    <span className="font-bold text-xl text-primary">1,000+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Posts Today", "আজকের পোস্ট")}</span>
                    <span className="font-bold text-xl text-primary">150+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">{t("Unity Notes Exchanged", "ইউনিটি নোটস বিনিময়")}</span>
                    <span className="font-bold text-xl text-primary">5,000+</span>
                  </div>
                </div>
              </Card>

              {/* Trending Topics */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  {t("Trending Topics", "ট্রেন্ডিং টপিক")}
                </h3>
                
                <div className="space-y-2">
                  {["#UnityNets", "#Learning", "#Bangladesh", "#Community", "#FreeCourses"].map((tag, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onClick={() => navigate('/auth?mode=signup')}
                    >
                      <span className="text-primary mr-2">{idx + 1}</span>
                      {tag}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Join CTA */}
              <Card className="p-6 bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 mx-auto opacity-80" />
                  <h3 className="font-bold text-lg">
                    {t("Join Our Community", "আমাদের কমিউনিটিতে যোগ দিন")}
                  </h3>
                  <p className="text-sm opacity-90">
                    {t(
                      "Connect with thousands of members, share knowledge, and grow together",
                      "হাজার হাজার সদস্যের সাথে সংযুক্ত হন, জ্ঞান শেয়ার করুন এবং একসাথে বেড়ে উঠুন"
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
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
