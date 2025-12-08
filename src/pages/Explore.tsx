import { useState, useMemo } from "react";
import { User } from "@/lib/storage";
import { Search, TrendingUp, Hash, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCard } from "@/components/UserCard";
import { useSocial } from "@/hooks/useSocial";

interface ExploreProps {
  currentUser: User | null;
  users: User[];
  onSignOut: () => void;
  socialActions: ReturnType<typeof useSocial>;
  setUsers: (users: User[]) => void;
}

export default function Explore({ currentUser, users, onSignOut, socialActions, setUsers }: ExploreProps) {
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

  // Get suggested users (not following)
  const suggestedUsers = useMemo(() => {
    if (!currentUser) return users;
    return users
      .filter(u => u.id !== currentUser.id && !socialActions.isFollowing(u.id))
      .sort((a, b) => b.trustScore - a.trustScore)
      .slice(0, 10);
  }, [users, currentUser, socialActions]);

  // Get trending hashtags (mock data for now)
  const trendingTags = [
    { tag: "#শিক্ষা", count: 234 },
    { tag: "#স্থানীয়কমিউনিটি", count: 189 },
    { tag: "#প্রযুক্তি", count: 156 },
    { tag: "#স্বাস্থ্য", count: 123 },
    { tag: "#ব্যবসা", count: 98 },
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="পোস্ট, ব্যবহারকারী বা ট্যাগ খুঁজুন..."
              className="pl-10 text-bengali"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users" className="text-bengali">ইউজার</TabsTrigger>
            <TabsTrigger value="suggested" className="text-bengali">প্রস্তাবিত</TabsTrigger>
            <TabsTrigger value="hashtags" className="text-bengali">হ্যাশট্যাগ</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">
                {searchQuery ? 'সার্চ রেজাল্ট' : 'সকল ইউজার'}
              </h3>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-bengali">কোন ইউজার পাওয়া যায়নি</h3>
                <p className="text-muted-foreground text-bengali">
                  অন্য কিছু সার্চ করে দেখুন
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    currentUserId={currentUser?.id}
                    isFollowing={socialActions.isFollowing(user.id)}
                    hasSentRequest={socialActions.hasSentFriendRequest(user.id)}
                    onFollow={() => socialActions.followUser(user.id)}
                    onUnfollow={() => socialActions.unfollowUser(user.id)}
                    onSendRequest={() => socialActions.sendFriendRequest(user.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">আপনার জন্য প্রস্তাবিত</h3>
            </div>

            {suggestedUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-bengali">কোন প্রস্তাবনা নেই</h3>
                <p className="text-muted-foreground text-bengali">
                  আপনি সবাইকে ফলো করছেন!
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
                    hasSentRequest={socialActions.hasSentFriendRequest(user.id)}
                    onFollow={() => socialActions.followUser(user.id)}
                    onUnfollow={() => socialActions.unfollowUser(user.id)}
                    onSendRequest={() => socialActions.sendFriendRequest(user.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Hash className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-bengali">জনপ্রিয় হ্যাশট্যাগ</h3>
            </div>

            <div className="grid gap-3">
              {trendingTags.map((item, index) => (
                <div key={index} className="card-enhanced p-4 hover:bg-muted/50 cursor-pointer transition-all">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-primary text-bengali text-lg">{item.tag}</span>
                    <span className="text-sm text-muted-foreground text-bengali">
                      {item.count} পোস্ট
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
