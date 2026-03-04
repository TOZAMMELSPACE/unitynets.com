import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useSocialDB } from "@/hooks/useSocialDB";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileProps {
  currentUser: User | null;
  onSignOut: () => void;
  posts: Post[];
  onUpdateProfile: (user: User) => void;
  users?: User[];
  socialDB?: ReturnType<typeof useSocialDB>;
}

export default function Profile({ currentUser, onSignOut, posts, onUpdateProfile, users = [], socialDB }: ProfileProps) {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewedProfile, setViewedProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  
  // Get userId from route state (when clicking on another user's profile)
  const viewUserId = location.state?.userId;
  const isOwnProfile = !viewUserId || viewUserId === currentUser?.id;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isOwnProfile || !viewUserId) {
        setViewedProfile(null);
        // Fetch follower counts for current user
        if (currentUser?.id && socialDB?.getFollowCounts) {
          const counts = await socialDB.getFollowCounts(currentUser.id);
          setFollowerCount(counts.followers);
          setFollowingCount(counts.following);
        }
        return;
      }

      setLoading(true);
      try {
        // First check in the users array
        const foundUser = users.find(u => u.id === viewUserId);
        if (foundUser) {
          setViewedProfile(foundUser);
          // Fetch follower counts for viewed user
          if (socialDB?.getFollowCounts) {
            const counts = await socialDB.getFollowCounts(viewUserId);
            setFollowerCount(counts.followers);
            setFollowingCount(counts.following);
          }
          setLoading(false);
          return;
        }

        // Otherwise fetch from database
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', viewUserId)
          .maybeSingle();

        if (data) {
          const profile: User = {
            id: data.user_id,
            name: data.full_name,
            username: (data as any).username || data.full_name.toLowerCase().replace(/\s+/g, ''),
            phone: data.phone || '',
            nidMasked: '****',
            profileImage: data.avatar_url || undefined,
            coverImage: (data as any).cover_url || undefined,
            bio: data.bio || undefined,
            location: data.location || undefined,
            role: ((data as any).role || 'user') as User['role'],
            trustScore: data.trust_score || 0,
            followers: 0,
            following: 0,
            achievements: [],
            isOnline: false,
            isVerified: true,
            joinDate: data.created_at,
            unityBalance: data.unity_notes || 0,
          };
          setViewedProfile(profile);

          // Fetch follower counts
          if (socialDB?.getFollowCounts) {
            const counts = await socialDB.getFollowCounts(viewUserId);
            setFollowerCount(counts.followers);
            setFollowingCount(counts.following);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [viewUserId, isOwnProfile, users, currentUser?.id, socialDB]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use viewed profile if viewing someone else, otherwise use current user
  const displayUser = isOwnProfile ? currentUser : viewedProfile;

  if (!displayUser) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <p>{t("Profile not found", "প্রোফাইল পাওয়া যায়নি")}</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          {t("Go to Home", "হোম পেইজে যান")}
        </Button>
      </div>
    );
  }

  // Initialize missing fields with defaults
  const user: User = {
    ...displayUser,
    username: displayUser.username || `user_${displayUser.id}`,
    bio: displayUser.bio || "",
    location: displayUser.location || "",
    role: displayUser.role || "user",
    followers: displayUser.followers || 0,
    following: displayUser.following || 0,
    achievements: displayUser.achievements || ["trusted_member", "early_adopter"],
    portfolioItems: displayUser.portfolioItems || [],
    lastOnline: displayUser.lastOnline || new Date().toISOString(),
    isOnline: displayUser.isOnline ?? true,
    isVerified: displayUser.isVerified ?? true,
    joinDate: displayUser.joinDate || new Date().toISOString(),
    privacySettings: displayUser.privacySettings || {
      allowMessagesFrom: 'everyone',
      showLastOnline: true,
      showEmail: false,
      showPhone: false,
    }
  };

  const userPosts = posts.filter(post => post.author.name === user.name || post.author.id === user.id);
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

  const handleFollow = async () => {
    if (socialDB && viewUserId) {
      await socialDB.followUser(viewUserId);
    }
  };

  const handleSendMessage = () => {
    navigate('/messages', { state: { startChatWith: viewUserId } });
  };

  const handleSendFriendRequest = async () => {
    if (socialDB && viewUserId) {
      await socialDB.sendFriendRequest(viewUserId);
    }
  };

  const getRoleText = (role: string) => {
    const rolesEn = {
      freelancer: 'Freelancer',
      trainer: 'Trainer', 
      learner: 'Learner',
      moderator: 'Moderator',
      user: 'Member'
    };
    const rolesBn = {
      freelancer: 'ফ্রিল্যান্সার',
      trainer: 'প্রশিক্ষক', 
      learner: 'শিক্ষার্থী',
      moderator: 'মডারেটর',
      user: 'সদস্য'
    };
    const roles = language === 'bn' ? rolesBn : rolesEn;
    return roles[role as keyof typeof roles] || (language === 'bn' ? 'সদস্য' : 'Member');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
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
                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-background rounded-full overflow-hidden bg-gradient-hero shadow-lg">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-full h-full object-cover object-top"
                      style={{ objectPosition: 'center 20%' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl md:text-4xl text-bengali bg-gradient-to-br from-primary to-primary/70">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                {user.isOnline && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-success border-2 border-background rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                      {user.isVerified && (
                        <Badge variant="secondary" className="gap-1">
                          <Globe className="w-3 h-3 text-primary" />
                          <span className="text-xs">{t("Verified", "ভেরিফাইড")}</span>
                        </Badge>
                      )}
                    </div>
                    
                    {user.username && (
                      <p className="text-muted-foreground text-sm mb-2">@{user.username}</p>
                    )}
                    
                    <Badge variant="outline" className="mb-3">
                      <span>{getRoleText(user.role || 'user')}</span>
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    {isOwnProfile ? (
                      <>
                        <ProfileEdit user={user} onUpdateProfile={handleUpdateProfile} />
                        <PrivacySettings 
                          privacySettings={user.privacySettings!} 
                          onUpdatePrivacy={handleUpdatePrivacy} 
                        />
                      </>
                    ) : (
                      <>
                        <Button onClick={handleFollow} className="gap-2">
                          <UserPlus className="w-4 h-4" />
                          <span>{t("Follow", "ফলো করুন")}</span>
                        </Button>
                        <Button onClick={handleSendMessage} variant="outline" className="gap-2">
                          <MessageCircle className="w-4 h-4" />
                          <span>{t("Message", "মেসেজ")}</span>
                        </Button>
                        <Button onClick={handleSendFriendRequest} variant="outline" className="gap-2">
                          <Users className="w-4 h-4" />
                          <span>{t("Friend Request", "বন্ধু রিকোয়েস্ট")}</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="leading-relaxed">{user.bio}</p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {user.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{t("Joined", "যোগদান")} {formatDate(user.joinDate)}</span>
                  </div>
                  {user.privacySettings?.showLastOnline && !user.isOnline && user.lastOnline && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{t("Last active", "শেষ সক্রিয়")} {formatDate(user.lastOnline)}</span>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold">{userPosts.length}</div>
                    <div className="text-sm text-muted-foreground">{t("Posts", "পোস্ট")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{followerCount}</div>
                    <div className="text-sm text-muted-foreground">{t("Followers", "ফলোয়ার")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{followingCount}</div>
                    <div className="text-sm text-muted-foreground">{t("Following", "ফলোয়িং")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold">{totalLikes}</div>
                    <div className="text-sm text-muted-foreground">{t("Likes", "লাইক")}</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-xl font-bold text-primary">{Math.round(user.trustScore)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{t("Trust Score", "ট্রাস্ট স্কোর")}</div>
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
            <TabsTrigger value="posts">
              {t("Posts", "পোস্ট")} ({userPosts.length})
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              {t("Portfolio", "পোর্টফোলিও")}
            </TabsTrigger>
            <TabsTrigger value="activity">
              {t("Activity", "কার্যকলাপ")}
            </TabsTrigger>
            <TabsTrigger value="media">
              {t("Media", "মিডিয়া")}
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
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">123</span>
                    </div>
                  </div>
                  <p className="leading-relaxed text-base">{post.content}</p>
                  
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
                      <span>{post.likes || 0} {t("likes", "লাইক")}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} {t("comments", "মন্তব্য")}</span>
                    </button>
                  </div>
                  <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <Share className="w-4 h-4" />
                    <span>{t("Share", "শেয়ার")}</span>
                  </button>
                </div>
              </div>
            ))}

            {userPosts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{t("No posts yet", "এখনও কোন পোস্ট নেই")}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t("Create your first post and connect with the community", "আপনার প্রথম পোস্ট করুন এবং কমিউনিটির সাথে যুক্ত হন")}
                  </p>
                  <Button className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{t("Create First Post", "প্রথম পোস্ট করুন")}</span>
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
                <CardTitle>{t("Media Gallery", "মিডিয়া গ্যালারি")}</CardTitle>
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
                      <p className="text-muted-foreground">{t("No media files", "কোনো মিডিয়া ফাইল নেই")}</p>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Recent Activity", "সাম্প্রতিক কার্যকলাপ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center mt-1">
                      <Heart className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{t("You liked a post by Karim Ullah", "আপনি করিম উল্লাহর পোস্টে লাইক দিয়েছেন")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("2 hours ago", "২ ঘন্টা আগে")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{t('You posted "Transparency in Community Service"', 'আপনি "কমিউনিটি সেবায় স্বচ্ছতা" পোস্ট করেছেন')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("5 hours ago", "৫ ঘন্টা আগে")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center mt-1">
                      <Users className="w-4 h-4 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{t("5 new people followed you", "৫ জন নতুন ব্যক্তি আপনাকে ফলো করেছেন")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("12 hours ago", "১২ ঘন্টা আগে")}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center mt-1">
                      <Badge className="w-4 h-4 text-warning" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{t('Earned "Trusted Member" badge', '"ট্রাস্টেড মেম্বার" ব্যাজ অর্জন করেছেন')}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("1 day ago", "১ দিন আগে")}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center mt-1">
                      <UserPlus className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{t("Joined UnityNets community", "UnityNets কমিউনিটিতে যোগদান করেছেন")}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(user.joinDate)}</p>
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