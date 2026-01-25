import { useState, useMemo } from "react";
import { Post, User, Comment } from "@/lib/storage";
import { PostWithAuthor } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsDown,
  Calendar,
  MapPin,
  Briefcase,
  BarChart3,
  Users,
  Clock,
  Bookmark,
  BookmarkCheck,
  Eye,
  Play,
  Volume2,
  VolumeX
} from "lucide-react";
import { CommentSection } from "@/components/CommentSection";
import { ShareButton } from "@/components/ShareButton";
import { useNavigate } from "react-router-dom";
import { ImageCarousel } from "@/components/ImageCarousel";
import { PostOptionsMenu } from "@/components/PostOptionsMenu";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnhancedFeedProps {
  posts: (Post | PostWithAuthor)[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onDislikePost?: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onVotePoll?: (postId: string, optionIndex: number) => void;
  onSavePost?: (postId: string) => void;
  isPostSaved?: (postId: string) => boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onTrackView?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onUpdatePost?: (postId: string, newContent: string) => void;
}

export const EnhancedFeed = ({ 
  posts, 
  currentUser, 
  onLikePost, 
  onDislikePost,
  onAddComment, 
  onLikeComment,
  onVotePoll,
  onSavePost,
  isPostSaved,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  onTrackView,
  onDeletePost,
  onUpdatePost
}: EnhancedFeedProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [dislikedPosts, setDislikedPosts] = useState<Set<string>>(new Set());
  const [viewedPosts, setViewedPosts] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    search: "",
    community: "all",
    postType: "all",
    sortBy: "recent"
  });

  // Track views when posts become visible
  const handlePostVisible = (postId: string) => {
    if (!viewedPosts.has(postId) && onTrackView) {
      setViewedPosts(prev => new Set(prev).add(postId));
      onTrackView(postId);
    }
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesContent = post.content.toLowerCase().includes(searchTerm);
        const matchesAuthor = post.author.name.toLowerCase().includes(searchTerm);
        const matchesHashtags = post.hashtags?.some(tag => 
          tag.toLowerCase().includes(searchTerm)
        );
        if (!matchesContent && !matchesAuthor && !matchesHashtags) {
          return false;
        }
      }

      if (filters.community !== "all" && post.community !== filters.community) {
        return false;
      }

      if (filters.postType !== "all" && post.postType !== filters.postType) {
        return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "trending":
          const aScore = (a.likes || 0) + (a.comments?.length || 0) * 2;
          const bScore = (b.likes || 0) + (b.comments?.length || 0) * 2;
          return bScore - aScore;
        case "popular":
          return (b.likes || 0) - (a.likes || 0);
        case "most_liked":
          return (b.likes || 0) - (a.likes || 0);
        case "most_commented":
          return (b.comments?.length || 0) - (a.comments?.length || 0);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [posts, filters]);

  const handleLike = (postId: string) => {
    if (dislikedPosts.has(postId)) {
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
    
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setLikedPosts(prev => new Set(prev).add(postId));
    }
    onLikePost(postId);
  };

  const handleDislike = (postId: string) => {
    if (likedPosts.has(postId)) {
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
    
    if (dislikedPosts.has(postId)) {
      setDislikedPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    } else {
      setDislikedPosts(prev => new Set(prev).add(postId));
    }
    onDislikePost?.(postId);
  };

  if (posts.length === 0) {
    return (
      <div className="card-enhanced p-8 text-center">
        <div className="text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t("No posts yet. Be the first to post!", "কোন পোস্ট নেই। প্রথম পোস্ট করুন!")}</p>
        </div>
      </div>
    );
  }

  const renderPostContent = (post: Post) => {
    switch (post.postType) {
      case 'event':
        return (
          <div className="space-y-3">
            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="font-semibold text-accent">{t("Event", "ইভেন্ট")}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{post.eventDetails?.title}</h3>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.eventDetails?.date && new Date(post.eventDetails.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {post.eventDetails?.location}
                </div>
              </div>
              <p className="mt-2">{post.eventDetails?.description}</p>
            </div>
            {post.content && <p className="text-card-foreground">{post.content}</p>}
          </div>
        );

      case 'job':
        return (
          <div className="space-y-3">
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-warning" />
                <span className="font-semibold text-warning">{t("Job Opportunity", "কাজের সুযোগ")}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{post.jobDetails?.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                <span>{t("Budget", "বাজেট")}: {post.jobDetails?.budget}</span>
                <span>{t("Deadline", "ডেডলাইন")}: {post.jobDetails?.deadline && new Date(post.jobDetails.deadline).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
              </div>
              {post.jobDetails?.skills && post.jobDetails.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {post.jobDetails.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              <p>{post.jobDetails?.description}</p>
            </div>
            {post.content && <p className="text-card-foreground">{post.content}</p>}
          </div>
        );

      case 'poll':
        const totalVotes = post.pollOptions?.reduce((sum, option) => sum + option.votes, 0) || 0;
        return (
          <div className="space-y-3">
            {post.content && <p className="text-card-foreground">{post.content}</p>}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">{t("Poll", "পোল")}</span>
                <span className="text-sm text-muted-foreground">({totalVotes} {t("votes", "ভোট")})</span>
              </div>
              <div className="space-y-3">
                {post.pollOptions?.map((option, index) => {
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option.option}</span>
                        <span className="text-muted-foreground">{option.votes} {t("votes", "ভোট")}</span>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-2" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => onVotePoll?.(post.id, index)}
                        >
                          {t("Vote", "ভোট দিন")}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">{post.content}</p>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('just now', 'এইমাত্র');
    if (diffMins < 60) return `${diffMins} ${t('minutes ago', 'মিনিট আগে')}`;
    if (diffHours < 24) return `${diffHours} ${t('hours ago', 'ঘণ্টা আগে')}`;
    if (diffDays < 7) return `${diffDays} ${t('days ago', 'দিন আগে')}`;
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US');
  };

  return (
    <div className="space-y-4">
      {filteredAndSortedPosts.map((post) => (
        <article 
          key={post.id} 
          className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
          onMouseEnter={() => handlePostVisible(post.id)}
          onTouchStart={() => handlePostVisible(post.id)}
        >
          {/* Post Header */}
          <div className="p-4 pb-3">
            <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                {post.author.profileImage ? (
                  <img
                    src={post.author.profileImage}
                    alt={`${post.author.name} profile`}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-primary/20 cursor-pointer hover:ring-primary/50 transition-all"
                    style={{ objectPosition: 'center 20%' }}
                    onClick={() => navigate('/profile', { state: { userId: post.author.id } })}
                  />
                ) : (
                  <div 
                    className="w-11 h-11 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white font-semibold text-lg cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => navigate('/profile', { state: { userId: post.author.id } })}
                  >
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div 
                    className="font-semibold text-foreground cursor-pointer hover:text-primary hover:underline transition-colors"
                    onClick={() => navigate('/profile', { state: { userId: post.author.id } })}
                  >
                    {post.author.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatTimeAgo(post.createdAt)}</span>
                    {post.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {post.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {'isGroupPost' in post && post.isGroupPost ? (
                  <Badge 
                    variant="secondary" 
                    className="text-xs bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                    onClick={() => navigate(`/groups/${post.groupId}`)}
                  >
                    👥 {post.groupName}
                  </Badge>
                ) : (
                  <Badge variant={post.community === 'global' ? 'default' : 'secondary'} className="text-xs">
                    {post.community === 'global' ? '🌍 Global' : `🏘️ ${post.community}`}
                  </Badge>
                )}
                <PostOptionsMenu
                  postId={post.id}
                  authorId={post.author.id}
                  currentUserId={currentUser.id}
                  postContent={post.content}
                  onDelete={onDeletePost}
                  onSave={onSavePost}
                  onUpdate={onUpdatePost}
                  isSaved={isPostSaved?.(post.id)}
                />
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="px-4 pb-3">
            {renderPostContent(post)}
            
            {/* Post Video */}
            {post.videoUrl && (
              <div className="mt-3 rounded-xl overflow-hidden bg-black relative group">
                <video 
                  src={post.videoUrl}
                  className="w-full max-h-[500px] object-contain"
                  controls
                  preload="metadata"
                  poster={post.videoThumbnail}
                >
                  {t("Your browser does not support video.", "আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।")}
                </video>
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3" />
                  {t("Video", "ভিডিও")}
                </div>
              </div>
            )}

            {/* Post Images - Carousel */}
            {post.images && post.images.length > 0 && (
              <div className="mt-3">
                <ImageCarousel images={post.images} />
              </div>
            )}

            {/* Hashtags */}
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.hashtags.map(tag => (
                  <span key={tag} className="text-primary text-sm font-medium hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Stats */}
          <div className="px-4 py-2 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50">
            <div className="flex items-center gap-4">
              {(post.likes > 0 || likedPosts.has(post.id)) && (
                <span>{(post.likes || 0) + (likedPosts.has(post.id) ? 1 : 0)} {t("likes", "লাইক")}</span>
              )}
              {(post.dislikes || 0) > 0 && (
                <span>{post.dislikes} {t("dislikes", "ডিসলাইক")}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {(post.comments?.length || 0) > 0 && (
                <span>{post.comments?.length} {t("comments", "মন্তব্য")}</span>
              )}
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {post.views || 0}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-2 py-1 flex items-center justify-between border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(post.id)}
              className={`flex-1 gap-2 h-10 rounded-lg transition-all ${
                likedPosts.has(post.id) 
                  ? 'text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50' 
                  : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
              }`}
            >
              <Heart className={`w-5 h-5 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{t("Like", "লাইক")}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDislike(post.id)}
              className={`flex-1 gap-2 h-10 rounded-lg transition-all ${
                dislikedPosts.has(post.id) 
                  ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50' 
                  : 'text-muted-foreground hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30'
              }`}
            >
              <ThumbsDown className={`w-5 h-5 ${dislikedPosts.has(post.id) ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{t("Dislike", "ডিসলাইক")}</span>
            </Button>
            
            <div className="flex-1">
              <CommentSection 
                postId={post.id}
                comments={post.comments}
                currentUser={currentUser}
                onAddComment={onAddComment}
                onLikeComment={onLikeComment}
              />
            </div>
            
            <div className="flex-1">
              <ShareButton 
                postId={post.id} 
                postContent={post.content}
              />
            </div>

            {onSavePost && isPostSaved && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSavePost(post.id)}
                className={`flex-1 gap-2 h-10 rounded-lg transition-all ${
                  isPostSaved(post.id) 
                    ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                {isPostSaved(post.id) ? (
                  <BookmarkCheck className="w-5 h-5" />
                ) : (
                  <Bookmark className="w-5 h-5" />
                )}
                <span className="hidden sm:inline">{t("Save", "সেভ")}</span>
              </Button>
            )}
          </div>
        </article>
      ))}

      {filteredAndSortedPosts.length === 0 && (
        <div className="card-enhanced p-8 text-center">
          <div className="text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>
              {filters.search || filters.community !== "all" || filters.postType !== "all" 
                ? t("No posts found with this filter.", "এই ফিল্টারে কোন পোস্ট পাওয়া যায়নি।") 
                : t("No posts yet. Be the first to post!", "কোন পোস্ট নেই। প্রথম পোস্ট করুন!")
              }
            </p>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !loadingMore && filteredAndSortedPosts.length > 0 && (
        <div className="flex justify-center py-4">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="w-full max-w-xs"
          >
            {t("Load more posts", "আরও পোস্ট দেখুন")}
          </Button>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};