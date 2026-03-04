import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Eye, ArrowRight, Lock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const ContentPreviewSection = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

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

  const recentPosts = [
    { 
      title: t("Spread the Light of Education", "শিক্ষার আলো ছড়িয়ে দিন"), 
      excerpt: t("Every knowledge shared doubles...", "প্রতিটি জ্ঞান ভাগ করলে তা দ্বিগুণ হয়..."),
      author: t("UnityNets Team", "ইউনিটিনেটস টিম"),
      likes: 234 
    },
    { 
      title: t("Let's Move Forward Together", "একসাথে এগিয়ে যাই"), 
      excerpt: t("Strength in unity, victory in togetherness...", "সংঘবদ্ধতায় শক্তি, একতায় জয়..."),
      author: t("Community Member", "সম্প্রদায় সদস্য"),
      likes: 189 
    },
    { 
      title: t("Learn New Skills", "নতুন দক্ষতা শিখুন"), 
      excerpt: t("Something should be learned every day...", "প্রতিদিন কিছু না কিছু শেখা উচিত..."),
      author: t("Education Department", "শিক্ষা বিভাগ"),
      likes: 312 
    },
    { 
      title: t("Learn to Dream", "স্বপ্ন দেখতে শিখুন"), 
      excerpt: t("Dream big, achieve big...", "বড় স্বপ্ন দেখুন, বড় অর্জন করুন..."),
      author: t("Inspiration Corner", "প্রেরণা কর্নার"),
      likes: 456 
    },
  ];

  const formatViews = (views: number) => {
    return language === "bn" ? views.toLocaleString('bn-BD') : views.toLocaleString();
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
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('/home')}>
              <span>{t("View All", "সব দেখুন")}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recentPosts.map((post, index) => (
              <div
                key={index}
                className="group bg-card border border-border/30 rounded-xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span className="text-xs text-muted-foreground">{t("Post", "পোস্ট")}</span>
                </div>
                <h3 className="font-medium text-foreground mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>❤️ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(ContentPreviewSection);
