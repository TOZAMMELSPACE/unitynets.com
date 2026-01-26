import { useState, useMemo } from "react";
import { User } from "@/lib/storage";
import { Search, TrendingUp, Hash, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "@/components/UserCard";
import { useSocial } from "@/hooks/useSocial";
import { useSocialDB } from "@/hooks/useSocialDB";
import { SEOHead } from "@/components/SEOHead";
import { useLanguage } from "@/contexts/LanguageContext";

interface ExploreProps {
  currentUser: User | null;
  currentUserId: string | null;
  users: User[];
  onSignOut: () => void;
  socialActions: ReturnType<typeof useSocial>;
  socialDB: ReturnType<typeof useSocialDB>;
  setUsers: (users: User[]) => void;
}

export default function Explore({ currentUser, currentUserId, users, onSignOut, socialActions, socialDB, setUsers }: ExploreProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.username.toLowerCase().includes(query) ||
      (user.bio && user.bio.toLowerCase().includes(query))
    );
  }, [users, searchQuery]);

  // Get suggested users (not following) - use DB if authenticated
  const suggestedUsers = useMemo(() => {
    if (!currentUser) return users;
    return users
      .filter(u => u.id !== currentUser.id && !socialDB.isFollowing(u.id))
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 10);
  }, [users, currentUser, socialDB]);

  // Get trending hashtags (mock data for now)
  const trendingTags = [
    { tag: language === 'bn' ? "#শিক্ষা" : "#Education", count: 234 },
    { tag: language === 'bn' ? "#স্থানীয়কমিউনিটি" : "#LocalCommunity", count: 189 },
    { tag: language === 'bn' ? "#প্রযুক্তি" : "#Technology", count: 156 },
    { tag: language === 'bn' ? "#স্বাস্থ্য" : "#Health", count: 123 },
    { tag: language === 'bn' ? "#ব্যবসা" : "#Business", count: 98 },
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      <SEOHead
        title={t("Explore - Discover & Find", "Explore - খুঁজুন ও আবিষ্কার করুন")}
        description={t(
          "Discover new people, popular hashtags, and trending content in the UnityNets community.",
          "UnityNets এ নতুন মানুষ খুঁজুন, জনপ্রিয় হ্যাশট্যাগ দেখুন, ট্রেন্ডিং কনটেন্ট আবিষ্কার করুন।"
        )}
        keywords="explore UnityNets, discover users, trending hashtags, community search"
        canonicalUrl="https://unitynets.com/explore"
      />
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={t("Search posts, users or tags...", "পোস্ট, ব্যবহারকারী বা ট্যাগ খুঁজুন...")}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">{t("Users", "ইউজার")}</TabsTrigger>
            <TabsTrigger value="suggested">{t("Suggested", "প্রস্তাবিত")}</TabsTrigger>
            <TabsTrigger value="hashtags">{t("Hashtags", "হ্যাশট্যাগ")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {searchQuery ? t('Search Results', 'সার্চ রেজাল্ট') : t('All Users', 'সকল ইউজার')}
              </h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("No users found", "কোন ইউজার পাওয়া যায়নি")}</h3>
                <p className="text-muted-foreground">
                  {t("Try searching for something else", "অন্য কিছু সার্চ করে দেখুন")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    isFollowing={socialDB.isFollowing(user.id)}
                    hasSentRequest={socialDB.hasSentFriendRequest(user.id)}
                    onFollow={() => socialDB.followUser(user.id)}
                    onUnfollow={() => socialDB.unfollowUser(user.id)}
                    onSendRequest={() => socialDB.sendFriendRequest(user.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("Suggested for you", "আপনার জন্য প্রস্তাবিত")}</h3>
            </div>

            {suggestedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t("No suggestions", "কোন প্রস্তাবনা নেই")}</h3>
                <p className="text-muted-foreground">
                  {t("You're following everyone!", "আপনি সবাইকে ফলো করছেন!")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    isFollowing={false}
                    hasSentRequest={socialDB.hasSentFriendRequest(user.id)}
                    onFollow={() => socialDB.followUser(user.id)}
                    onUnfollow={() => socialDB.unfollowUser(user.id)}
                    onSendRequest={() => socialDB.sendFriendRequest(user.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">{t("Popular Hashtags", "জনপ্রিয় হ্যাশট্যাগ")}</h3>
            </div>

            <div className="grid gap-3">
              {trendingTags.map((item, index) => (
                <div key={index} className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary text-lg">{item.tag}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} {t("posts", "পোস্ট")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
    </main>
  );
}