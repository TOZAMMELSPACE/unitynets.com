import { User } from "@/lib/storage";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, Lock, Globe, Crown, ArrowLeft, Send, Image as ImageIcon,
  Heart, MessageCircle, Share2, MoreHorizontal, Shield, Settings,
  UserPlus, Loader2, X, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface GroupDetailProps {
  currentUser: User | null;
  onSignOut: () => void;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  is_private: boolean;
  created_by: string;
  members_count: number;
  posts_count: number;
  is_official: boolean;
  created_at: string;
}

interface GroupPost {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  image_urls: string[] | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
}

export default function GroupDetail({ currentUser }: GroupDetailProps) {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = currentUser?.id || null;

  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast({
          title: "গ্রুপ পাওয়া যায়নি",
          variant: "destructive"
        });
        navigate('/groups');
        return;
      }
      setGroup(data as Group);
    } catch (error) {
      console.error('Error fetching group:', error);
    }
  }, [groupId, navigate, toast]);

  const fetchPosts = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data: postsData, error } = await supabase
        .from('group_posts')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch author profiles
      if (postsData && postsData.length > 0) {
        const userIds = [...new Set(postsData.map(p => p.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, username')
          .in('user_id', userIds);

        const postsWithAuthors = postsData.map(post => ({
          ...post,
          author: profiles?.find(p => p.user_id === post.user_id) || {
            full_name: 'Unknown User',
            avatar_url: null,
            username: null
          }
        }));

        setPosts(postsWithAuthors as GroupPost[]);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [groupId]);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data: membersData, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      if (membersData && membersData.length > 0) {
        const userIds = membersData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url, username')
          .in('user_id', userIds);

        const membersWithProfiles = membersData.map(member => ({
          ...member,
          profile: profiles?.find(p => p.user_id === member.user_id) || {
            full_name: 'Unknown User',
            avatar_url: null,
            username: null
          }
        }));

        setMembers(membersWithProfiles as GroupMember[]);

        // Check if current user is member
        if (userId) {
          const currentMember = membersData.find(m => m.user_id === userId);
          setIsMember(!!currentMember);
          setUserRole(currentMember?.role || null);
        }
      } else {
        setMembers([]);
        setIsMember(false);
        setUserRole(null);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  }, [groupId, userId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroup(), fetchPosts(), fetchMembers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchGroup, fetchPosts, fetchMembers]);

  const handleJoinGroup = async () => {
    if (!userId || !groupId) {
      toast({
        title: "লগইন প্রয়োজন",
        description: "গ্রুপে যোগ দিতে প্রথমে লগইন করুন",
        variant: "destructive"
      });
      return;
    }

    setIsJoining(true);
    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: userId,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "আপনি সফলভাবে গ্রুপে যোগ দিয়েছেন"
      });

      await Promise.all([fetchGroup(), fetchMembers()]);
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "ত্রুটি",
        description: "গ্রুপে যোগ দিতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim() || !userId || !groupId) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          user_id: userId,
          content: postContent.trim()
        });

      if (error) throw error;

      setPostContent("");
      toast({
        title: "সফল!",
        description: "আপনার পোস্ট প্রকাশিত হয়েছে"
      });

      await Promise.all([fetchPosts(), fetchGroup()]);
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "ত্রুটি",
        description: "পোস্ট করতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!deletePostId) return;

    try {
      const { error } = await supabase
        .from('group_posts')
        .delete()
        .eq('id', deletePostId);

      if (error) throw error;

      toast({
        title: "সফল!",
        description: "পোস্ট মুছে ফেলা হয়েছে"
      });

      await Promise.all([fetchPosts(), fetchGroup()]);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "ত্রুটি",
        description: "পোস্ট মুছতে সমস্যা হয়েছে",
        variant: "destructive"
      });
    } finally {
      setDeletePostId(null);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'এইমাত্র';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} মিনিট আগে`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ঘন্টা আগে`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} দিন আগে`;
    return date.toLocaleDateString('bn-BD');
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

  if (!group) {
    return (
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold mb-2">গ্রুপ পাওয়া যায়নি</h2>
          <Button onClick={() => navigate('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            ফিরে যান
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate('/groups')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        ফিরে যান
      </Button>

      {/* Group Header */}
      <div className="relative rounded-2xl overflow-hidden mb-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <img 
          src={group.cover_url || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop"} 
          alt={group.name}
          className="w-full h-48 md:h-64 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-center gap-2 mb-2">
            {group.is_official && (
              <Badge variant="secondary" className="bg-blue-500/90 text-white">
                <Shield className="w-3 h-3 mr-1" />
                অফিশিয়াল
              </Badge>
            )}
            {group.is_private ? (
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
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {group.name}
          </h1>
          <p className="text-white/80 text-sm md:text-base mb-3 line-clamp-2">
            {group.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.members_count} সদস্য
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {group.posts_count} পোস্ট
              </span>
            </div>
            {!isMember ? (
              <Button 
                className="bg-white text-foreground hover:bg-white/90"
                onClick={handleJoinGroup}
                disabled={isJoining}
              >
                {isJoining ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-1" />
                )}
                যোগ দিন
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/90 text-white">
                  সদস্য
                </Badge>
                {userRole === 'admin' && (
                  <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                    <Settings className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-muted/50 p-1 mb-6">
          <TabsTrigger 
            value="posts" 
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            পোস্ট ({group.posts_count})
          </TabsTrigger>
          <TabsTrigger 
            value="members"
            className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            সদস্য ({group.members_count})
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {/* Create Post */}
          {isMember && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={currentUser?.profileImage} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Textarea
                      placeholder="আপনার মনের কথা লিখুন..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="min-h-[80px] resize-none border-0 bg-muted/50 focus-visible:ring-1"
                    />
                    <div className="flex items-center justify-between mt-3">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        ছবি
                      </Button>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!postContent.trim() || isPosting}
                        size="sm"
                      >
                        {isPosting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                        ) : (
                          <Send className="w-4 h-4 mr-1" />
                        )}
                        পোস্ট করুন
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Posts List */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <Card key={post.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.author?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.author?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold">
                            {post.author?.full_name || 'Unknown'}
                          </span>
                          {post.author?.username && (
                            <span className="text-muted-foreground text-sm ml-2">
                              @{post.author.username}
                            </span>
                          )}
                          <span className="text-muted-foreground text-sm ml-2">
                            • {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        {(post.user_id === userId || userRole === 'admin') && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => setDeletePostId(post.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                মুছে ফেলুন
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="mt-2 text-foreground whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {post.image_urls && post.image_urls.length > 0 && (
                        <div className="mt-3 grid gap-2">
                          {post.image_urls.map((url, idx) => (
                            <img 
                              key={idx}
                              src={url}
                              alt=""
                              className="rounded-lg max-h-96 object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 mt-4 pt-3 border-t">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes_count > 0 && post.likes_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments_count > 0 && post.comments_count}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground">
                          <Share2 className="w-4 h-4 mr-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোন পোস্ট নেই</h3>
              <p className="text-muted-foreground">
                {isMember 
                  ? "প্রথম পোস্ট করে আলোচনা শুরু করুন!" 
                  : "গ্রুপে যোগ দিয়ে পোস্ট করুন"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {member.profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {member.profile?.full_name || 'Unknown'}
                        </span>
                        {member.role === 'admin' && (
                          <Badge className="bg-yellow-500/90 text-white">
                            <Crown className="w-3 h-3 mr-1" />
                            অ্যাডমিন
                          </Badge>
                        )}
                        {member.role === 'moderator' && (
                          <Badge variant="secondary">
                            মডারেটর
                          </Badge>
                        )}
                      </div>
                      {member.profile?.username && (
                        <span className="text-muted-foreground text-sm">
                          @{member.profile.username}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    যোগ দিয়েছেন {formatTimeAgo(member.joined_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {members.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোন সদস্য নেই</h3>
              <p className="text-muted-foreground">
                প্রথম সদস্য হিসেবে যোগ দিন!
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Post Confirmation */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>পোস্ট মুছে ফেলতে চান?</AlertDialogTitle>
            <AlertDialogDescription>
              এই পোস্ট চিরতরে মুছে যাবে। এই কাজ পূর্বাবস্থায় ফেরানো যাবে না।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
