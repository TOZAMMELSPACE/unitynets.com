import { User } from "@/lib/storage";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, Plus, Lock, Globe, Crown, Calendar, Search, 
  TrendingUp, Sparkles, MessageCircle, LogOut,
  ChevronRight, Star, Zap, Shield, BookOpen, Heart, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGroups, Group } from "@/hooks/useGroups";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GroupsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const getCategoryName = (id: string, t: (en: string, bn: string) => string) => {
  const names: Record<string, [string, string]> = {
    all: ["All", "সব"],
    tech: ["Technology", "প্রযুক্তি"],
    education: ["Education", "শিক্ষা"],
    business: ["Business", "ব্যবসা"],
    health: ["Health", "স্বাস্থ্য"],
    community: ["Community", "সমাজ"],
  };
  const pair = names[id] || ["Other", "অন্যান্য"];
  return t(pair[0], pair[1]);
};

const categories = [
  { id: "all", icon: Sparkles },
  { id: "tech", icon: Zap },
  { id: "education", icon: BookOpen },
  { id: "business", icon: TrendingUp },
  { id: "health", icon: Heart },
  { id: "community", icon: Users },
];

export default function Groups({ currentUser }: GroupsProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [leaveGroupId, setLeaveGroupId] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    category: "community",
    is_private: false
  });

  const userId = currentUser?.id || null;
  const { 
    groups, 
    myGroups, 
    loading, 
    joiningGroupId,
    joinGroup, 
    leaveGroup, 
    isMember, 
    getMemberRole,
    createGroup 
  } = useGroups(userId);

  const featuredGroup = groups.find(g => g.is_featured && g.is_official) || groups.find(g => g.is_featured);
  const suggestedGroups = groups.filter(g => !isMember(g.id));
  const trendingGroups = suggestedGroups.filter(g => g.members_count > 0).slice(0, 4);

  const filteredSuggested = suggestedGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (group.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatMembers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    
    const result = await createGroup(newGroup);
    if (result) {
      setIsCreateDialogOpen(false);
      setNewGroup({ name: "", description: "", category: "community", is_private: false });
    }
  };

  const handleLeaveConfirm = async () => {
    if (leaveGroupId) {
      await leaveGroup(leaveGroupId);
      setLeaveGroupId(null);
    }
  };

  const GroupCard = ({ group, showJoinButton = true }: { group: Group; showJoinButton?: boolean }) => {
    const memberStatus = isMember(group.id);
    const role = getMemberRole(group.id);
    const isJoining = joiningGroupId === group.id;

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm"
        onClick={() => navigate(`/groups/${group.id}`)}
      >
        <div className="relative h-32">
          <img 
            src={group.cover_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop"} 
            alt={group.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 flex gap-2">
            {group.is_official && (
              <Badge className="bg-blue-500/90 text-white">
                <Shield className="w-3 h-3 mr-1" />
                {t("Official", "অফিশিয়াল")}
              </Badge>
            )}
            {role === 'admin' && (
              <Badge className="bg-yellow-500/90 text-white">
                <Crown className="w-3 h-3 mr-1" />
                {t("Admin", "অ্যাডমিন")}
              </Badge>
            )}
            {group.is_private ? (
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Lock className="w-3 h-3 mr-1" />
                {t("Private", "প্রাইভেট")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-black/50 text-white">
                <Globe className="w-3 h-3 mr-1" />
                {t("Public", "পাবলিক")}
              </Badge>
            )}
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            {group.name}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {group.description || t("No description", "কোন বিবরণ নেই")}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {formatMembers(group.members_count)} {t("members", "সদস্য")}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageCircle className="w-3 h-3" />
                {group.posts_count}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {getCategoryName(group.category, t)}
            </Badge>
          </div>
          
          {showJoinButton && (
            <div className="pt-3 border-t border-border/50">
              {memberStatus ? (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/groups/${group.id}`);
                    }}
                  >
                    {t("View", "দেখুন")}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLeaveGroupId(group.id);
                    }}
                    disabled={isJoining}
                  >
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full gap-2" 
                  onClick={(e) => {
                    e.stopPropagation();
                    joinGroup(group.id);
                  }}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {t("Join", "যোগ দিন")}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section with Featured Group */}
      {featuredGroup && (
        <div className="relative rounded-2xl overflow-hidden mb-8 group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          <img 
            src={featuredGroup.cover_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
            alt={featuredGroup.name}
            className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/90 text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                {t("Featured Group", "ফিচার্ড গ্রুপ")}
              </Badge>
              {featuredGroup.is_official && (
                <Badge variant="secondary" className="bg-blue-500/90 text-white">
                  <Shield className="w-3 h-3 mr-1" />
                  {t("Official", "অফিশিয়াল")}
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
              <span className="text-white/90 text-sm">
                <span className="font-semibold">{formatMembers(featuredGroup.members_count)}</span> {t("members", "সদস্য")}
              </span>
              {isMember(featuredGroup.id) ? (
                <Button className="bg-white text-foreground hover:bg-white/90">
                  {t("View", "দেখুন")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button 
                  className="bg-white text-foreground hover:bg-white/90"
                  onClick={() => joinGroup(featuredGroup.id)}
                  disabled={joiningGroupId === featuredGroup.id}
                >
                  {joiningGroupId === featuredGroup.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  {t("Join", "যোগ দিন")}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header with Search */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold">{t("Groups", "গ্রুপসমূহ")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("Find communities on topics you're interested in", "আপনার আগ্রহের বিষয়ে কমিউনিটি খুঁজুন")}
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md">
                <Plus size={18} />
                {t("Create New Group", "নতুন গ্রুপ তৈরি করুন")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{t("Create New Group", "নতুন গ্রুপ তৈরি করুন")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("Group Name *", "গ্রুপের নাম *")}</Label>
                  <Input
                    id="name"
                    placeholder={t("Enter your group name", "আপনার গ্রুপের নাম লিখুন")}
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("Description", "বিবরণ")}</Label>
                  <Textarea
                    id="description"
                    placeholder={t("Write briefly about the group", "গ্রুপ সম্পর্কে সংক্ষেপে লিখুন")}
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">{t("Category", "ক্যাটাগরি")}</Label>
                  <Select 
                    value={newGroup.category} 
                    onValueChange={(value) => setNewGroup(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select a category", "ক্যাটাগরি নির্বাচন করুন")} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.id !== 'all').map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {getCategoryName(cat.id, t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t("Private Group", "প্রাইভেট গ্রুপ")}</Label>
                    <p className="text-xs text-muted-foreground">
                      {t("Only invited members can join", "শুধুমাত্র আমন্ত্রিত সদস্যরা যোগ দিতে পারবে")}
                    </p>
                  </div>
                  <Switch
                    checked={newGroup.is_private}
                    onCheckedChange={(checked) => setNewGroup(prev => ({ ...prev, is_private: checked }))}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t("Cancel", "বাতিল")}
                </Button>
                <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()}>
                  {t("Create", "তৈরি করুন")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder={t("Search groups...", "গ্রুপ খুঁজুন...")}
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
              {getCategoryName(cat.id, t)}
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
            {t("My Groups", "আমার গ্রুপ")} ({myGroups.length})
          </TabsTrigger>
          <TabsTrigger 
            value="discover"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("Discover", "আবিষ্কার করুন")}
          </TabsTrigger>
        </TabsList>

        {/* My Groups Tab */}
        <TabsContent value="my-groups" className="mt-6">
          {myGroups.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("You haven't joined any groups", "কোন গ্রুপে যোগ দেননি")}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {t("Find groups on topics you're interested in and join. Meet new people!", "আপনার আগ্রহের বিষয়ে গ্রুপ খুঁজুন এবং যোগ দিন। নতুন মানুষদের সাথে পরিচিত হন!")}
              </p>
              <Button className="gap-2">
                <Sparkles size={18} />
                {t("Discover Groups", "গ্রুপ আবিষ্কার করুন")}
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Discover Tab */}
        <TabsContent value="discover" className="mt-6">
          {/* Trending Section */}
          {trendingGroups.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{t("Trending Groups", "জনপ্রিয় গ্রুপ")}</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {trendingGroups.map((group) => (
                  <Card 
                    key={group.id}
                    className="flex-shrink-0 w-72 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-sm"
                  >
                    <div className="relative h-28">
                      <img 
                        src={group.cover_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop"} 
                        alt={group.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-2 left-2 bg-orange-500/90 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {t("Trending", "জনপ্রিয়")}
                      </Badge>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-sm line-clamp-1">{group.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatMembers(group.members_count)} {t("members", "সদস্য")}
                        </span>
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => joinGroup(group.id)}
                          disabled={joiningGroupId === group.id}
                        >
                          {joiningGroupId === group.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            t("Join", "যোগ দিন")
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Suggested Groups */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t("All Groups", "সব গ্রুপ")}</h3>
            {filteredSuggested.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredSuggested.map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-2xl">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("No groups found", "কোন গ্রুপ পাওয়া যায়নি")}</h3>
                <p className="text-muted-foreground mb-4">
                  {t("Try a different search term or category", "অন্য সার্চ টার্ম বা ক্যাটাগরি ব্যবহার করুন")}
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}>
                  {t("Reset Filters", "ফিল্টার রিসেট করুন")}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={!!leaveGroupId} onOpenChange={() => setLeaveGroupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Leave this group?", "গ্রুপ থেকে বের হতে চান?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to leave this group? You can rejoin later.", "আপনি কি নিশ্চিত যে এই গ্রুপ থেকে বের হতে চান? আপনি পরে আবার যোগ দিতে পারবেন।")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel", "বাতিল")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("Leave", "বের হন")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
