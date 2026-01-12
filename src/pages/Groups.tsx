import { User } from "@/lib/storage";
import { useState } from "react";
import { 
  Users, Plus, Lock, Globe, Crown, Calendar, Search, 
  TrendingUp, Sparkles, MessageCircle, Heart, Share2,
  ChevronRight, Star, Zap, Shield, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

interface GroupsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const categories = [
  { id: "all", name: "সব", icon: Sparkles },
  { id: "tech", name: "প্রযুক্তি", icon: Zap },
  { id: "education", name: "শিক্ষা", icon: BookOpen },
  { id: "business", name: "ব্যবসা", icon: TrendingUp },
  { id: "health", name: "স্বাস্থ্য", icon: Heart },
  { id: "community", name: "সমাজ", icon: Users },
];

const myGroups = [
  {
    id: "1",
    name: "ঢাকা টেক কমিউনিটি",
    members: 156,
    description: "প্রযুক্তি এবং উদ্ভাবন নিয়ে আলোচনা। সফটওয়্যার ডেভেলপমেন্ট, AI, ও স্টার্টআপ।",
    isPrivate: false,
    isAdmin: true,
    lastActivity: "১০ মিনিট আগে",
    cover: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop",
    category: "tech",
    posts: 234,
    activeMembers: [
      { name: "আহমেদ", avatar: "" },
      { name: "সাকিব", avatar: "" },
      { name: "তানিয়া", avatar: "" },
    ],
  },
  {
    id: "2",
    name: "স্থানীয় ব্যবসা নেটওয়ার্ক",
    members: 89,
    description: "স্থানীয় ব্যবসায়ীদের নেটওয়ার্কিং এবং সহযোগিতার প্ল্যাটফর্ম।",
    isPrivate: true,
    isAdmin: false,
    lastActivity: "৩০ মিনিট আগে",
    cover: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400&h=200&fit=crop",
    category: "business",
    posts: 156,
    activeMembers: [
      { name: "রহিম", avatar: "" },
      { name: "করিম", avatar: "" },
    ],
  },
];

const suggestedGroups = [
  {
    id: "3",
    name: "শিক্ষা সংস্কার আন্দোলন",
    members: 1234,
    description: "শিক্ষা ব্যবস্থার উন্নয়ন নিয়ে কাজ করছি। শিক্ষক, শিক্ষার্থী ও অভিভাবকদের জন্য।",
    isPrivate: false,
    category: "education",
    cover: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=200&fit=crop",
    trending: true,
    posts: 567,
    activeMembers: [
      { name: "শিক্ষক ১", avatar: "" },
      { name: "শিক্ষক ২", avatar: "" },
      { name: "শিক্ষক ৩", avatar: "" },
    ],
  },
  {
    id: "4",
    name: "স্বাস্থ্য সচেতনতা",
    members: 2178,
    description: "স্বাস্থ্য টিপস, ডায়েট, ব্যায়াম এবং মানসিক স্বাস্থ্য নিয়ে আলোচনা।",
    isPrivate: false,
    category: "health",
    cover: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
    trending: true,
    posts: 890,
    activeMembers: [
      { name: "ডাক্তার ১", avatar: "" },
      { name: "ডাক্তার ২", avatar: "" },
    ],
  },
  {
    id: "5",  
    name: "উদ্যোক্তা সমিতি",
    members: 845,
    description: "নতুন উদ্যোক্তাদের সহায়তা, ফান্ডিং, মেন্টরশিপ এবং নেটওয়ার্কিং।",
    isPrivate: true,
    category: "business",
    cover: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=200&fit=crop",
    trending: false,
    posts: 345,
    activeMembers: [
      { name: "উদ্যোক্তা ১", avatar: "" },
      { name: "উদ্যোক্তা ২", avatar: "" },
      { name: "উদ্যোক্তা ৩", avatar: "" },
    ],
  },
  {
    id: "6",
    name: "প্রোগ্রামিং বাংলাদেশ",
    members: 3456,
    description: "কোডিং শিখুন, প্রজেক্ট শেয়ার করুন, চাকরি খুঁজুন। সব লেভেলের ডেভেলপারদের জন্য।",
    isPrivate: false,
    category: "tech",
    cover: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
    trending: true,
    posts: 1234,
    activeMembers: [
      { name: "ডেভ ১", avatar: "" },
      { name: "ডেভ ২", avatar: "" },
    ],
  },
];

const featuredGroup = {
  id: "featured",
  name: "ইউনিটিনেটস অফিশিয়াল",
  members: 5678,
  description: "ইউনিটিনেটস প্ল্যাটফর্মের অফিশিয়াল গ্রুপ। নতুন ফিচার, আপডেট এবং কমিউনিটি ইভেন্ট সম্পর্কে জানুন।",
  cover: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
  isPrivate: false,
  isOfficial: true,
  posts: 456,
  activeMembers: [
    { name: "এডমিন", avatar: "" },
    { name: "মডারেটর", avatar: "" },
  ],
};

export default function Groups({ currentUser, onSignOut }: GroupsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSuggested = suggestedGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section with Featured Group */}
      <div className="relative rounded-2xl overflow-hidden mb-8 group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <img 
          src={featuredGroup.cover} 
          alt={featuredGroup.name}
          className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/90 text-primary-foreground">
              <Star className="w-3 h-3 mr-1" />
              ফিচার্ড গ্রুপ
            </Badge>
            {featuredGroup.isOfficial && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white">
                <Shield className="w-3 h-3 mr-1" />
                অফিশিয়াল
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {featuredGroup.name}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-3 line-clamp-2">
            {featuredGroup.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {featuredGroup.activeMembers.map((member, idx) => (
                  <Avatar key={idx} className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-white/90 text-sm">
                <span className="font-semibold">{formatMembers(featuredGroup.members)}</span> সদস্য
              </span>
            </div>
            <Button className="bg-white text-foreground hover:bg-white/90">
              যোগ দিন
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Header with Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">গ্রুপসমূহ</h2>
            <p className="text-muted-foreground text-sm">
              আপনার আগ্রহের বিষয়ে কমিউনিটি খুঁজুন
            </p>
          </div>
          <Button className="gap-2 shadow-md">
            <Plus size={18} />
            নতুন গ্রুপ তৈরি করুন
          </Button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="গ্রুপ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="flex-shrink-0 gap-2 rounded-full"
            >
              <Icon className="w-4 h-4" />
              {cat.name}
            </Button>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-groups" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/50 p-1">
          <TabsTrigger 
            value="my-groups" 
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            আমার গ্রুপ ({myGroups.length})
          </TabsTrigger>
          <TabsTrigger 
            value="discover"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            আবিষ্কার করুন
          </TabsTrigger>
        </TabsList>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {myGroups.map((group) => (
              <Card 
                key={group.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm"
              >
                <div className="relative h-32">
                  <img 
                    src={group.cover} 
                    alt={group.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {group.isAdmin && (
                      <Badge className="bg-yellow-500/90 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        অ্যাডমিন
                      </Badge>
                    )}
                    {group.isPrivate ? (
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        প্রাইভেট
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-black/50 text-white">
                        <Globe className="w-3 h-3 mr-1" />
                        পাবলিক
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {group.activeMembers.slice(0, 3).map((member, idx) => (
                          <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {group.members} সদস্য
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      {group.posts}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {group.lastActivity}
                    </span>
                    <Button size="sm" variant="ghost" className="h-8">
                      দেখুন
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myGroups.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">কোন গ্রুপে যোগ দেননি</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                আপনার আগ্রহের বিষয়ে গ্রুপ খুঁজুন এবং যোগ দিন। নতুন মানুষদের সাথে পরিচিত হন!
              </p>
              <Button className="gap-2">
                <Sparkles size={18} />
                গ্রুপ আবিষ্কার করুন
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-6">
          {/* Trending Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">ট্রেন্ডিং গ্রুপ</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {suggestedGroups.filter(g => g.trending).map((group) => (
                <Card 
                  key={group.id}
                  className="flex-shrink-0 w-72 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm"
                >
                  <div className="relative h-28">
                    <img 
                      src={group.cover} 
                      alt={group.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-2 left-2 bg-orange-500/90 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      ট্রেন্ডিং
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm line-clamp-1">{group.name}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{formatMembers(group.members)} সদস্য</span>
                      <span>•</span>
                      <span>{group.posts} পোস্ট</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Suggested Groups */}
          <div>
            <h3 className="font-bold text-lg mb-4">সব প্রস্তাবিত গ্রুপ</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSuggested.map((group) => (
                <Card 
                  key={group.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm"
                >
                  <div className="relative h-32">
                    <img 
                      src={group.cover} 
                      alt={group.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {group.trending && (
                        <Badge className="bg-orange-500/90 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          ট্রেন্ডিং
                        </Badge>
                      )}
                      {group.isPrivate ? (
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          <Lock className="w-3 h-3" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-black/50 text-white">
                          <Globe className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {group.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {group.activeMembers.slice(0, 3).map((member, idx) => (
                            <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                              <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                {member.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatMembers(group.members)} সদস্য
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {categories.find(c => c.id === group.category)?.name}
                      </Badge>
                    </div>
                    
                    <Button className="w-full gap-2">
                      <Plus className="w-4 h-4" />
                      যোগ দিন
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredSuggested.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">কোন গ্রুপ পাওয়া যায়নি</h3>
              <p className="text-muted-foreground mb-4">
                অন্য সার্চ টার্ম বা ক্যাটাগরি ব্যবহার করুন
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}>
                ফিল্টার রিসেট করুন
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
