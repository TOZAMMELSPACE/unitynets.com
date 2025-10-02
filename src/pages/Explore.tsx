import { Header } from "@/components/Header";
import { User } from "@/lib/storage";
import { Search, TrendingUp, Hash, Users, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExploreProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const trendingTags = ["#শিক্ষা", "#স্থানীয়কমিউনিটি", "#প্রযুক্তি", "#স্বাস্থ্য", "#ব্যবসা"];

const trendingPosts = [
  {
    id: "1",
    author: "ডঃ সামিনা রহমান",
    content: "শিক্ষা ক্ষেত্রে ডিজিটাল রূপান্তর নিয়ে আলোচনা",
    likes: 45,
    trending: true,
  },
  {
    id: "2", 
    author: "আহমেদ হাসান",
    content: "স্থানীয় ব্যবসায়ীদের সাথে নেটওয়ার্কিং এর গুরুত্ব",
    likes: 32,
    trending: true,
  },
];

const categories = [
  { name: "শিক্ষা", icon: BookOpen, count: "১২৩+ পোস্ট" },
  { name: "কমিউনিটি", icon: Users, count: "৮৯+ পোস্ট" },
  { name: "প্রযুক্তি", icon: TrendingUp, count: "৬৭+ পোস্ট" },
];

export default function Explore({ currentUser, onSignOut }: ExploreProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Header currentUser={currentUser} onSignOut={onSignOut} />
      
      <main className="container mx-auto px-4 max-w-2xl">
        {/* Page Heading with Topics */}
        <div className="card-enhanced p-4 mb-6">
          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-gradient-hero bg-clip-text text-transparent">Explore | এক্সপ্লোর</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Trending Topics, Search Posts & Users, Discover New People, Categories, Hashtags
          </p>
        </div>

        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="পোস্ট, ব্যবহারকারী বা ট্যাগ খুঁজুন..."
              className="pl-10 text-bengali"
            />
          </div>
        </div>

        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending" className="text-bengali">ট্রেন্ডিং</TabsTrigger>
            <TabsTrigger value="categories" className="text-bengali">ক্যাটাগরি</TabsTrigger>
            <TabsTrigger value="hashtags" className="text-bengali">হ্যাশট্যাগ</TabsTrigger>
          </TabsList>

          <TabsContent value="trending" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">জনপ্রিয় পোস্ট</h3>
            </div>

            {trendingPosts.map((post) => (
              <div key={post.id} className="card-enhanced p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-bengali">{post.author}</span>
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-bengali mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="text-bengali">{post.likes} লাইক</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">বিষয়ভিত্তিক বিভাগ</h3>
            </div>

            <div className="grid gap-4">
              {categories.map((category) => (
                <div key={category.name} className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <category.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-bengali">{category.name}</h4>
                      <p className="text-sm text-muted-foreground text-bengali">{category.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">জনপ্রিয় হ্যাশট্যাগ</h3>
            </div>

            <div className="grid gap-3">
              {trendingTags.map((tag, index) => (
                <div key={index} className="card-enhanced p-3 hover:bg-muted/50 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary text-bengali">{tag}</span>
                    <span className="text-sm text-muted-foreground text-bengali">
                      {Math.floor(Math.random() * 50) + 10} পোস্ট
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}