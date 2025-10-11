import { useState, useMemo } from "react";
import { Post, User, Comment } from "@/lib/storage";
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
  BookmarkCheck
} from "lucide-react";
import { CommentSection } from "@/components/CommentSection";
import { ShareButton } from "@/components/ShareButton";
import { FeedFilter } from "@/components/FeedFilter";

interface EnhancedFeedProps {
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onDislikePost?: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
  onVotePoll?: (postId: string, optionIndex: number) => void;
  onSavePost?: (postId: string) => void;
  isPostSaved?: (postId: string) => boolean;
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
  isPostSaved
}: EnhancedFeedProps) => {
  const [filters, setFilters] = useState({
    search: "",
    community: "all",
    postType: "all",
    sortBy: "recent"
  });

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      // Search filter
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

      // Community filter
      if (filters.community !== "all" && post.community !== filters.community) {
        return false;
      }

      // Post type filter
      if (filters.postType !== "all" && post.postType !== filters.postType) {
        return false;
      }

      return true;
    });

    // Sort posts
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
        default: // recent
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [posts, filters]);

  if (posts.length === 0) {
    return (
      <div className="space-y-6">
        <FeedFilter onFilterChange={setFilters} />
        <div className="card-enhanced p-8 text-center">
          <div className="text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-bengali">কোন পোস্ট নেই। প্রথম পোস্ট করুন!</p>
          </div>
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
                <span className="font-semibold text-accent">ইভেন্ট</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{post.eventDetails?.title}</h3>
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.eventDetails?.date && new Date(post.eventDetails.date).toLocaleDateString('bn-BD')}
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
                <span className="font-semibold text-warning">কাজের সুযোগ</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{post.jobDetails?.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                <span>বাজেট: {post.jobDetails?.budget}</span>
                <span>ডেডলাইন: {post.jobDetails?.deadline && new Date(post.jobDetails.deadline).toLocaleDateString('bn-BD')}</span>
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
                <span className="font-semibold text-primary">পোল</span>
                <span className="text-sm text-muted-foreground">({totalVotes} ভোট)</span>
              </div>
              <div className="space-y-3">
                {post.pollOptions?.map((option, index) => {
                  const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{option.option}</span>
                        <span className="text-muted-foreground">{option.votes} ভোট</span>
                      </div>
                      <div className="relative">
                        <Progress value={percentage} className="h-2" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute inset-0 w-full h-full opacity-0 hover:opacity-100 transition-opacity"
                          onClick={() => onVotePoll?.(post.id, index)}
                        >
                          ভোট দিন
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
        return <p className="text-card-foreground leading-relaxed">{post.content}</p>;
    }
  };

  return (
    <div className="space-y-6">
      <FeedFilter onFilterChange={setFilters} />
      
      <div className="space-y-4">
        {filteredAndSortedPosts.map((post) => (
          <article key={post.id} className="card-enhanced p-6 hover:shadow-large transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {post.author.profileImage ? (
                  <img
                    src={post.author.profileImage}
                    alt={`${post.author.name} profile`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-semibold">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-bengali">{post.author.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString('bn-BD')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={post.community === 'global' ? 'default' : 'secondary'}>
                  {post.community === 'global' ? '🌍 Global' : `🏘️ ${post.community}`}
                </Badge>
                {post.postType !== 'text' && (
                  <Badge variant="outline">
                    {post.postType === 'image' ? '🖼️' :
                     post.postType === 'video' ? '🎥' :
                     post.postType === 'poll' ? '📊' :
                     post.postType === 'event' ? '🎟️' : '💼'}
                  </Badge>
                )}
              </div>
            </div>

            <div className="mb-4">
              {renderPostContent(post)}
              
              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className={`mt-4 grid gap-2 ${
                  post.images.length === 1 ? 'grid-cols-1' : 
                  post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                }`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          const overlay = document.createElement('div');
                          overlay.className = 'fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4';
                          overlay.onclick = () => overlay.remove();
                          
                          const img = document.createElement('img');
                          img.src = image;
                          img.className = 'max-w-full max-h-full object-contain rounded-lg';
                          
                          overlay.appendChild(img);
                          document.body.appendChild(overlay);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Location and hashtags */}
              <div className="flex flex-wrap gap-2 mt-3">
                {post.location && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {post.location}
                  </Badge>
                )}
                {post.hashtags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLikePost(post.id)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Heart className="w-4 h-4 mr-2" />
                {post.likes || 0}
              </Button>

              {onDislikePost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDislikePost(post.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  {post.dislikes || 0}
                </Button>
              )}
              
              <CommentSection 
                postId={post.id}
                comments={post.comments}
                currentUser={currentUser}
                onAddComment={onAddComment}
                onLikeComment={onLikeComment}
              />
              
              <ShareButton 
                postId={post.id} 
                postContent={post.content}
              />

              {onSavePost && isPostSaved && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSavePost(post.id)}
                  className={`ml-auto transition-colors ${
                    isPostSaved(post.id) 
                      ? 'text-primary hover:text-primary/80' 
                      : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  {isPostSaved(post.id) ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>
              )}

              {/* Trending indicator */}
              {filters.sortBy === "trending" && !onSavePost && (
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  {((post.likes || 0) + (post.comments?.length || 0) * 2)} engagement
                </div>
              )}
            </div>
          </article>
        ))}

        {filteredAndSortedPosts.length === 0 && (
          <div className="card-enhanced p-8 text-center">
            <div className="text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-bengali">
                {filters.search || filters.community !== "all" || filters.postType !== "all" 
                  ? "এই ফিল্টারে কোন পোস্ট পাওয়া যায়নি।" 
                  : "কোন পোস্ট নেই। প্রথম পোস্ট করুন!"
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};