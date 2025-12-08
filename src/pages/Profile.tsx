import { ProfileEdit } from "@/components/ProfileEdit";
import { ProfileBadges } from "@/components/ProfileBadges";
import { PortfolioSection } from "@/components/PortfolioSection";
import { PrivacySettings } from "@/components/PrivacySettings";
import { User, Post, PortfolioItem, PrivacySettings as PrivacySettingsType } from "@/lib/storage";
import { MapPin, Calendar, Users, UserPlus, MessageCircle, Heart, Share, Clock, Globe, Camera, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileProps {
  currentUser: User | null;
  onSignOut: () => void;
  posts: Post[];
  onUpdateProfile: (user: User) => void;
}

export default function Profile({ currentUser, onSignOut, posts, onUpdateProfile }: ProfileProps) {
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Initialize missing fields with defaults
  const user: User = {
    ...currentUser,
    username: currentUser.username || `user_${currentUser.id}`,
    bio: currentUser.bio || "",
    location: currentUser.location || "",
    role: currentUser.role || "user",
    followers: currentUser.followers || 0,
    following: currentUser.following || 0,
    achievements: currentUser.achievements || ["trusted_member", "early_adopter"],
    portfolioItems: currentUser.portfolioItems || [],
    lastOnline: currentUser.lastOnline || new Date().toISOString(),
    isOnline: currentUser.isOnline ?? true,
    isVerified: currentUser.isVerified ?? true,
    joinDate: currentUser.joinDate || new Date().toISOString(),
    privacySettings: currentUser.privacySettings || {
      allowMessagesFrom: 'everyone',
      showLastOnline: true,
      showEmail: false,
      showPhone: false,
    }
  };

  const userPosts = posts.filter(post => post.author.name === user.name);
  const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

  const handleUpdateProfile = (updatedUser: User) => {
    onUpdateProfile(updatedUser);
  };

  const handleUpdatePrivacy = (settings: PrivacySettingsType) => {
    handleUpdateProfile({
      ...user,
      privacySettings: settings
    });
  };

  const getRoleText = (role: string) => {
    const roles = {
      freelancer: 'ফ্রিল্যান্সার',
      trainer: 'প্রশিক্ষক', 
      learner: 'শিক্ষার্থী',
      moderator: 'মডারেটর',
      user: 'সদস্য'
    };
    return roles[role as keyof typeof roles] || 'সদস্য';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">

        {/* Cover Image & Profile Header */}
        <div className="relative mb-6">
          {/* Cover Image */}
          <div className="h-48 md:h-64 bg-gradient-hero rounded-t-xl overflow-hidden">
            {user.coverImage ? (
              <img
                src={user.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white/70" />
              </div>
            )}
          </div>

          {/* Profile Info Card */}
          <div className="card-enhanced mx-4 -mt-20 relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-background rounded-full overflow-hidden bg-gradient-hero">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl md:text-4xl text-bengali">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-success border-2 border-background rounded-full"></div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-bengali">{user.name}</h1>
                      {user.isVerified && (
                        <Badge variant="secondary" className="gap-1">
                          <Globe className="w-3 h-3 text-primary" />
                          <span className="text-xs text-bengali">ভেরিফাইড</span>
                        </Badge>
                      )}
                    </div>
                    
                    {user.username && (
                      <p className="text-muted-foreground text-sm mb-2">@{user.username}</p>
                    )}
                    
                    <Badge variant="outline" className="mb-3">
                      <span className="text-bengali">{getRoleText(user.role || 'user')}</span>
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <ProfileEdit user={user} onUpdateProfile={handleUpdateProfile} />
                    <PrivacySettings 
                      privacySettings={user.privacySettings!} 
                      onUpdatePrivacy={handleUpdatePrivacy} 
                    />
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-bengali leading-relaxed">{user.bio}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-bengali">{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-bengali">যোগদান {formatDate(user.joinDate)}</span>
                  </div>
                  {user.privacySettings?.showLastOnline && !user.isOnline && user.lastOnline && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-bengali">শেষ সক্রিয় {formatDate(user.lastOnline)}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">{userPosts.length}</div>
                    <div className="text-sm text-muted-foreground text-bengali">পোস্ট</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{user.followers}</div>
                    <div className="text-sm text-muted-foreground text-bengali">ফলোয়ার</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{user.following}</div>
                    <div className="text-sm text-muted-foreground text-bengali">ফলোয়িং</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{totalLikes}</div>
                    <div className="text-sm text-muted-foreground text-bengali">লাইক</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-xl font-bold text-primary">{Math.round(user.trustScore)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground text-bengali">ট্রাস্ট স্কোর</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="card-enhanced p-6 mb-6">
          <ProfileBadges 
            achievements={user.achievements} 
            trustScore={user.trustScore} 
            isVerified={user.isVerified}
          />
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts" className="text-bengali">
              পোস্ট ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="text-bengali">
              পোর্টফোলিও
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-bengali">
              কার্যকলাপ
            </TabsTrigger>
            <TabsTrigger value="media" className="text-bengali">
              মিডিয়া
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {userPosts.map((post) => (
              <div key={post.id} className="card-enhanced p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.community}
                      </Badge>
                      <span className="text-sm text-muted-foreground text-bengali">
                        {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">123</span>
                    </div>
                  </div>
                  <p className="text-bengali leading-relaxed text-base">{post.content}</p>
                  
                  {post.images && post.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {post.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Post image ${index + 1}`}
                          className="rounded-lg object-cover aspect-square"
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-destructive transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-bengali">{post.likes || 0} লাইক</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-bengali">{post.comments?.length || 0} মন্তব্য</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Share className="w-4 h-4" />
                    <span className="text-bengali">শেয়ার</span>
                  </button>
                </div>
              </div>
            ))}

            {userPosts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-bengali">এখনও কোন পোস্ট নেই</h3>
                  <p className="text-muted-foreground text-bengali mb-6">
                    আপনার প্রথম পোস্ট করুন এবং কমিউনিটির সাথে যুক্ত হন
                  </p>
                  <Button className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-bengali">প্রথম পোস্ট করুন</span>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-4">
            <PortfolioSection
              portfolioItems={user.portfolioItems || []}
              isOwnProfile={true}
              onAddItem={() => {}}
              onEditItem={() => {}}
              onDeleteItem={() => {}}
            />
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-bengali">মিডিয়া গ্যালারি</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const allImages = userPosts
                    .filter(post => post.images && post.images.length > 0)
                    .flatMap(post => post.images || []);
                    
                  return allImages.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {allImages.map((image, index) => (
                        <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-bengali">কোনো মিডিয়া ফাইল নেই</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-bengali">সাম্প্রতিক কার্যকলাপ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center mt-1">
                      <Heart className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-bengali">আপনি করিম উল্লাহর পোস্টে লাইক দিয়েছেন</p>
                      <p className="text-xs text-muted-foreground text-bengali mt-1">২ ঘন্টা আগে</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-bengali">আপনি "কমিউনিটি সেবায় স্বচ্ছতা" পোস্ট করেছেন</p>
                      <p className="text-xs text-muted-foreground text-bengali mt-1">৫ ঘন্টা আগে</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mt-1">
                      <Users className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-bengali">৫ জন নতুন ব্যক্তি আপনাকে ফলো করেছেন</p>
                      <p className="text-xs text-muted-foreground text-bengali mt-1">১২ ঘন্টা আগে</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center mt-1">
                      <Badge className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-bengali">"ট্রাস্টেড মেম্বার" ব্যাজ অর্জন করেছেন</p>
                      <p className="text-xs text-muted-foreground text-bengali mt-1">১ দিন আগে</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mt-1">
                      <UserPlus className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-bengali">UnityNet কমিউনিটিতে যোগদান করেছেন</p>
                      <p className="text-xs text-muted-foreground text-bengali mt-1">{formatDate(user.joinDate)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </main>
  );
}