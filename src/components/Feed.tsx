import { Post, User, Comment } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { CommentSection } from "@/components/CommentSection";
import { ShareButton } from "@/components/ShareButton";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedProps {
  posts: Post[];
  currentUser: User;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const Feed = ({ posts, currentUser, onLikePost, onAddComment, onLikeComment }: FeedProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleUserClick = (userId: string) => {
    navigate('/profile', { state: { userId } });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US');
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

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <article key={post.id} className="card-enhanced p-6 hover:shadow-large transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              {/* Profile Image or Avatar */}
              {post.author.profileImage ? (
                <img
                  src={post.author.profileImage}
                  alt={`${post.author.name} profile`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  style={{ objectPosition: 'center 20%' }}
                  onClick={() => handleUserClick(post.author.id)}
                />
              ) : (
                <div 
                  className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => handleUserClick(post.author.id)}
                >
                  {post.author.name.charAt(0)}
                </div>
              )}
              <div>
                <div 
                  className="font-semibold cursor-pointer hover:text-primary hover:underline transition-colors"
                  onClick={() => handleUserClick(post.author.id)}
                >
                  {post.author.name}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                post.community === 'global' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-accent/10 text-accent'
              }`}>
                {post.community === 'global' ? `🌍 ${t('Global', 'গ্লোবাল')}` : `🏘️ ${post.community}`}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-card-foreground leading-relaxed">
              {post.content}
            </p>
            
            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className={`mt-4 grid gap-2 ${
                post.images.length === 1 
                  ? 'grid-cols-1' 
                  : post.images.length === 2 
                    ? 'grid-cols-2' 
                    : post.images.length === 3
                      ? 'grid-cols-2'
                      : 'grid-cols-2'
              }`}>
                {post.images.map((image, index) => (
                  <div key={index} className={`relative ${
                    post.images.length === 3 && index === 0 ? 'col-span-2' : ''
                  }`}>
                    <img
                      src={image}
                      alt={`${t('Post image', 'পোস্টের ছবি')} ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Create image preview modal
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
          </div>

          <div className="flex items-center gap-4 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLikePost(post.id)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Heart className="w-4 h-4 mr-2" />
              {post.likes}
            </Button>
            
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
          </div>
        </article>
      ))}
    </div>
  );
};
