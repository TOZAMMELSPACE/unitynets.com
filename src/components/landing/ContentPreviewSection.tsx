import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, MessageSquare, Eye, ArrowRight, Lock } from "lucide-react";

const unityNotes = [
  { title: "প্রোগ্রামিং শেখার সহজ গাইড", author: "রাহুল আহমেদ", views: 1250 },
  { title: "ফ্রিল্যান্সিং শুরু করার A to Z", author: "ফাতিমা খাতুন", views: 2340 },
  { title: "গ্রাফিক ডিজাইনের মূল বিষয়সমূহ", author: "আরিফ হাসান", views: 890 },
  { title: "ইংরেজি শেখার সেরা টিপস", author: "নুসরাত জাহান", views: 3100 },
  { title: "ব্যবসা শুরুর পরিকল্পনা", author: "করিম উদ্দিন", views: 1560 },
  { title: "সোশ্যাল মিডিয়া মার্কেটিং", author: "সারা বেগম", views: 2780 },
  { title: "মোবাইল অ্যাপ ডেভেলপমেন্ট", author: "তানভীর আলম", views: 1890 },
  { title: "ডিজিটাল মার্কেটিং কোর্স", author: "রুমানা আক্তার", views: 2100 },
];

const recentPosts = [
  { 
    title: "শিক্ষার আলো ছড়িয়ে দিন", 
    excerpt: "প্রতিটি জ্ঞান ভাগ করলে তা দ্বিগুণ হয়...",
    author: "ইউনিটিনেটস টিম",
    likes: 234 
  },
  { 
    title: "একসাথে এগিয়ে যাই", 
    excerpt: "সংঘবদ্ধতায় শক্তি, একতায় জয়...",
    author: "সম্প্রদায় সদস্য",
    likes: 189 
  },
  { 
    title: "নতুন দক্ষতা শিখুন", 
    excerpt: "প্রতিদিন কিছু না কিছু শেখা উচিত...",
    author: "শিক্ষা বিভাগ",
    likes: 312 
  },
  { 
    title: "স্বপ্ন দেখতে শিখুন", 
    excerpt: "বড় স্বপ্ন দেখুন, বড় অর্জন করুন...",
    author: "প্রেরণা কর্নার",
    likes: 456 
  },
];

export const ContentPreviewSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Unity Notes Section */}
        <div className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="section-header text-bengali mb-2">
                সাম্প্রতিক ইউনিটি নোটস
              </h2>
              <p className="text-muted-foreground">Recent Unity Notes</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('/unity-note')}>
              <span className="text-bengali">সব দেখুন</span>
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
                    <p className="text-sm text-muted-foreground text-bengali">লগইন করে পড়ুন</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-xs text-muted-foreground text-bengali">ইউনিটি নোট</span>
                </div>
                <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-bengali">
                  {note.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 text-bengali">
                  লেখক: {note.author}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span>{note.views.toLocaleString('bn-BD')} বার দেখা হয়েছে</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="section-header text-bengali mb-2">
                নিউজ ফিড থেকে সাম্প্রতিক পোস্ট
              </h2>
              <p className="text-muted-foreground">Recent Feed Posts</p>
            </div>
            <Button variant="ghost" className="mt-4 md:mt-0 group" onClick={() => navigate('/home')}>
              <span className="text-bengali">সব দেখুন</span>
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
                  <span className="text-xs text-muted-foreground text-bengali">পোস্ট</span>
                </div>
                <h3 className="font-medium text-foreground mb-2 text-bengali">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2 text-bengali">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="text-bengali">{post.author}</span>
                  <span className="text-bengali">❤️ {post.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
