import { Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from "lucide-react";

interface FeedProps {
  posts: Post[];
  onLikePost: (postId: string) => void;
}

export const Feed = ({ posts, onLikePost }: FeedProps) => {
  if (posts.length === 0) {
    return (
      <div className="card-enhanced p-8 text-center">
        <div className="text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-bengali">কোন পোস্ট নেই। প্রথম পোস্ট করুন!</p>
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
              <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white font-semibold">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-bengali">{post.author.name}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString('bn-BD')}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                post.community === 'global' 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-accent/10 text-accent'
              }`}>
                {post.community === 'global' ? '🌍 Global' : `🏘️ ${post.community}`}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-card-foreground leading-relaxed text-bengali">
              {post.content}
            </p>
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
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
};