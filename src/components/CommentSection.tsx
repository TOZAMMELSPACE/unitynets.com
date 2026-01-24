import { useState } from "react";
import { Comment, User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  currentUser: User;
  onAddComment: (postId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
}

export const CommentSection = ({ 
  postId, 
  comments, 
  currentUser, 
  onAddComment, 
  onLikeComment 
}: CommentSectionProps) => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US');
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      onAddComment(postId, newComment.trim());
      setNewComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        {comments.length > 0 
          ? `${comments.length} ${t('comments', 'মন্তব্য')}` 
          : t('Comment', 'মন্তব্য করুন')}
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {/* Add Comment Form */}
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("Write your comment...", "আপনার মন্তব্য লিখুন...")}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting 
                  ? t('Posting...', 'পোস্ট করা হচ্ছে...') 
                  : t('Comment', 'মন্তব্য করুন')}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-muted/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-6 h-6 bg-gradient-hero rounded-full flex items-center justify-center text-xs text-white font-semibold cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => navigate('/profile', { state: { userId: comment.author.id } })}
                  >
                    {comment.author.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div 
                      className="text-sm font-medium cursor-pointer hover:text-primary hover:underline transition-colors"
                      onClick={() => navigate('/profile', { state: { userId: comment.author.id } })}
                    >
                      {comment.author.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                </div>
                <p className="text-sm mb-2">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLikeComment(comment.id)}
                  className="text-muted-foreground hover:text-primary transition-colors p-0 h-auto"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  <span className="text-xs">{comment.likes}</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
