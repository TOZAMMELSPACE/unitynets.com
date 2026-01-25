import { useState } from "react";
import { User } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Award,
  TrendingUp,
  Calendar,
  Users,
  Lock,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface GamificationPanelProps {
  user: User | null;
  users: User[];
}

export const GamificationPanel = ({ user, users }: GamificationPanelProps) => {
  const { t, language } = useLanguage();
  const [showFollowers, setShowFollowers] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  if (!user) return null;

  // Calculate user stats
  const userRank = users
    .sort((a, b) => b.trustScore - a.trustScore)
    .findIndex(u => u.id === user.id) + 1;
  
  // Get followers list (mock data - in real app would come from database)
  const followersList = users
    .filter(u => u.id !== user.id)
    .slice(0, Math.min(user.followers, 10));

  const nextLevel = Math.ceil(user.trustScore / 20) * 20;
  const progressToNextLevel = ((user.trustScore % 20) / 20) * 100;
  
  // Mock streak data (in real app, this would come from user activity)
  const loginStreak = Math.floor(Math.random() * 15) + 1;
  const weeklyGoal = 100;
  const weeklyProgress = Math.min(user.trustScore % 100, weeklyGoal);

  const achievements = [
    { 
      id: 'first_post', 
      name: t('First Post', 'প্রথম পোস্ট'), 
      icon: '🎯', 
      unlocked: true,
      description: t('Made your first post', 'আপনার প্রথম পোস্ট করেছেন'),
      requirement: 1,
      current: 1,
      category: t('Basic', 'প্রাথমিক')
    },
    { 
      id: 'trusted_member', 
      name: t('Trusted Member', 'বিশ্বস্ত সদস্য'), 
      icon: '🛡️', 
      unlocked: user.trustScore >= 50,
      description: t('Achieve 50+ trust score', '৫০+ ট্রাস্ট স্কোর অর্জন করুন'),
      requirement: 50,
      current: user.trustScore,
      category: t('Trust', 'ট্রাস্ট')
    },
    { 
      id: 'community_leader', 
      name: t('Community Leader', 'কমিউনিটি নেতা'), 
      icon: '👑', 
      unlocked: user.trustScore >= 80,
      description: t('Achieve 80+ trust score', '৮০+ ট্রাস্ট স্কোর অর্জন করুন'),
      requirement: 80,
      current: user.trustScore,
      category: t('Trust', 'ট্রাস্ট')
    },
    { 
      id: 'popular_creator', 
      name: t('Popular Creator', 'জনপ্রিয় ক্রিয়েটর'), 
      icon: '⭐', 
      unlocked: user.followers >= 100,
      description: t('Gain 100+ followers', '১০০+ ফলোয়ার অর্জন করুন'),
      requirement: 100,
      current: user.followers,
      category: t('Social', 'সোশ্যাল')
    },
    { 
      id: 'helpful_member', 
      name: t('Helpful Member', 'সহায়ক সদস্য'), 
      icon: '🤝', 
      unlocked: user.trustScore >= 30,
      description: t('Achieve 30+ trust score by helping the community', '৩০+ ট্রাস্ট স্কোর অর্জন করে কমিউনিটিতে সাহায্য করুন'),
      requirement: 30,
      current: user.trustScore,
      category: t('Trust', 'ট্রাস্ট')
    },
    { 
      id: 'early_adopter', 
      name: t('Early Adopter', 'প্রাথমিক ব্যবহারকারী'), 
      icon: '🚀', 
      unlocked: true,
      description: t('Early member of the platform', 'প্ল্যাটফর্মের প্রাথমিক সদস্য'),
      requirement: 1,
      current: 1,
      category: t('Basic', 'প্রাথমিক')
    },
    { 
      id: 'top_contributor', 
      name: t('Top Contributor', 'টপ কন্ট্রিবিউটর'), 
      icon: '🏆', 
      unlocked: userRank <= 3,
      description: t('Rank in top 3 in community', 'কমিউনিটিতে টপ ৩ এ স্থান করুন'),
      requirement: 3,
      current: userRank,
      category: t('Rank', 'র‍্যাঙ্ক')
    },
    { 
      id: 'influencer', 
      name: t('Influencer', 'ইনফ্লুয়েন্সার'), 
      icon: '💎', 
      unlocked: user.followers >= 500,
      description: t('Gain 500+ followers', '৫০০+ ফলোয়ার অর্জন করুন'),
      requirement: 500,
      current: user.followers,
      category: t('Social', 'সোশ্যাল')
    },
    { 
      id: 'master', 
      name: t('Master', 'মাস্টার'), 
      icon: '⚡', 
      unlocked: user.trustScore >= 100,
      description: t('Achieve 100 trust score', '১০০ ট্রাস্ট স্কোর অর্জন করুন'),
      requirement: 100,
      current: user.trustScore,
      category: t('Trust', 'ট্রাস্ট')
    }
  ];

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalAchievements = achievements.length;

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" />
          {t("Your Progress", "আপনার অগ্রগতি")}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Trust Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{t("Trust Level", "ট্রাস্ট লেভেল")}</span>
            <span className="text-sm text-muted-foreground">
              {user.trustScore}/{nextLevel}
            </span>
          </div>
          <Progress value={progressToNextLevel} className="h-2" />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3" />
            {t("Level", "লেভেল")} {Math.floor(user.trustScore / 20) + 1}
          </div>
        </div>

        {/* Rank */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{t("Community Rank", "কমিউনিটি র‍্যাঙ্ক")}</span>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            #{userRank}
          </Badge>
        </div>

        {/* Login Streak */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-warning/10 to-destructive/10 rounded-lg">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">{t("Login Streak", "লগইন স্ট্রিক")}</span>
          </div>
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            {loginStreak} {t("days", "দিন")}
          </Badge>
        </div>

        {/* Weekly Goal */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{t("Weekly Goal", "সাপ্তাহিক লক্ষ্য")}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {weeklyProgress}/{weeklyGoal}
            </span>
          </div>
          <Progress value={(weeklyProgress / weeklyGoal) * 100} className="h-2" />
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">{t("Achievements", "অর্জনসমূহ")}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {unlockedAchievements.length}/{totalAchievements}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {achievements.slice(0, 6).map((achievement) => (
              <button
                key={achievement.id}
                onClick={() => setShowAchievements(true)}
                className={`p-2 rounded-lg text-center transition-all hover:scale-105 active:scale-95 relative group ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-success/20 to-success/10 border border-success/30 shadow-sm' 
                    : 'bg-muted/30 border border-border/50 opacity-60 hover:opacity-80'
                }`}
                title={achievement.description}
              >
                {achievement.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-success rounded-full p-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                {!achievement.unlocked && (
                  <div className="absolute -top-1 -right-1 bg-muted rounded-full p-0.5 border">
                    <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                  </div>
                )}
                <div className={`text-lg mb-1 ${achievement.unlocked ? 'animate-pulse' : 'grayscale'}`}>
                  {achievement.icon}
                </div>
                <div className="text-xs font-medium line-clamp-2">
                  {achievement.name}
                </div>
              </button>
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            onClick={() => setShowAchievements(true)}
          >
            <Sparkles className="w-3 h-3 mr-2" />
            {t("View All Achievements", "সব অর্জন দেখুন")}
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <Button 
            variant="ghost" 
            className="h-auto p-3 flex flex-col items-center hover:bg-primary/5"
            onClick={() => setShowFollowers(true)}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("Followers", "ফলোয়ার")}</span>
            </div>
            <div className="font-semibold">{user.followers}</div>
          </Button>
          <div className="text-center p-3">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("Member Since", "সদস্য হওয়ার তারিখ")}</span>
            </div>
            <div className="font-semibold text-xs">
              {new Date(user.joinDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Followers Dialog */}
      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("Followers", "ফলোয়ার")} ({user.followers})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {followersList.length > 0 ? (
              followersList.map((follower) => (
                <div 
                  key={follower.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  {follower.profileImage ? (
                    <img 
                      src={follower.profileImage} 
                      alt={follower.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-white font-semibold">
                      {follower.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{follower.name}</div>
                    <div className="text-xs text-muted-foreground">
                      @{follower.username}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(follower.trustScore)}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("No followers yet", "এখনো কোনো ফলোয়ার নেই")}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Achievements Dialog */}
      <Dialog open={showAchievements} onOpenChange={setShowAchievements}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              {t("Achievements", "অর্জনসমূহ")} ({unlockedAchievements.length}/{totalAchievements})
            </DialogTitle>
            <DialogDescription>
              {t("View all your achievements and progress", "আপনার সকল অর্জন এবং প্রগ্রেস দেখুন")}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t("All", "সব")}</TabsTrigger>
              <TabsTrigger value="unlocked">{t("Unlocked", "আনলক")}</TabsTrigger>
              <TabsTrigger value="locked">{t("Locked", "লক")}</TabsTrigger>
              <TabsTrigger value="progress">{t("Progress", "প্রগ্রেস")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
              <div className="grid gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-success/10 to-success/5 border-success/30'
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-3xl ${!achievement.unlocked && 'grayscale opacity-50'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2">
                              {achievement.name}
                              {achievement.unlocked ? (
                                <Badge variant="secondary" className="bg-success/20 text-success">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {t("Unlocked", "আনলক")}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <Lock className="w-3 h-3" />
                                  {t("Locked", "লক")}
                                </Badge>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.description}
                            </p>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {achievement.category}
                            </Badge>
                          </div>
                        </div>
                        
                        {!achievement.unlocked && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t("Progress", "প্রগ্রেস")}</span>
                              <span>
                                {achievement.current}/{achievement.requirement}
                              </span>
                            </div>
                            <Progress 
                              value={(Math.min(achievement.current, achievement.requirement) / achievement.requirement) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="unlocked" className="flex-1 overflow-y-auto mt-4">
              <div className="grid gap-3">
                {achievements.filter(a => a.unlocked).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg border bg-gradient-to-r from-success/10 to-success/5 border-success/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl animate-pulse">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {achievement.name}
                          <Badge variant="secondary" className="bg-success/20 text-success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            আনলক
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {achievement.description}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="locked" className="flex-1 overflow-y-auto mt-4">
              <div className="grid gap-3">
                {achievements.filter(a => !a.unlocked).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="p-4 rounded-lg border bg-muted/30 border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl grayscale opacity-50">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2">
                            {achievement.name}
                            <Badge variant="outline" className="gap-1">
                              <Lock className="w-3 h-3" />
                              লক
                            </Badge>
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {achievement.description}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {achievement.category}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>প্রগ্রেস</span>
                            <span>
                              {achievement.current}/{achievement.requirement}
                            </span>
                          </div>
                          <Progress 
                            value={(Math.min(achievement.current, achievement.requirement) / achievement.requirement) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="progress" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    আপনার সামগ্রিক প্রগ্রেস
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>অর্জন সম্পন্ন</span>
                        <span className="font-medium">
                          {unlockedAchievements.length}/{totalAchievements}
                        </span>
                      </div>
                      <Progress 
                        value={(unlockedAchievements.length / totalAchievements) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ট্রাস্ট স্কোর</span>
                        <span className="font-medium">{user.trustScore}/100</span>
                      </div>
                      <Progress 
                        value={(user.trustScore / 100) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ফলোয়ার</span>
                        <span className="font-medium">{user.followers}/500</span>
                      </div>
                      <Progress 
                        value={(user.followers / 500) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-3">
                  <h3 className="font-semibold">পরবর্তী অর্জন</h3>
                  {achievements
                    .filter(a => !a.unlocked)
                    .sort((a, b) => {
                      const progressA = (a.current / a.requirement) * 100;
                      const progressB = (b.current / b.requirement) * 100;
                      return progressB - progressA;
                    })
                    .slice(0, 3)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="p-4 rounded-lg border bg-muted/30 border-border"
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl grayscale opacity-50">
                            {achievement.icon}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-medium">{achievement.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {achievement.description}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>
                                  আর মাত্র {achievement.requirement - achievement.current} প্রয়োজন
                                </span>
                                <span>
                                  {Math.round((achievement.current / achievement.requirement) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(Math.min(achievement.current, achievement.requirement) / achievement.requirement) * 100} 
                                className="h-2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </Card>
  );
};