import { Post } from "@/lib/storage";
import { MapPin, Users } from "lucide-react";

interface LocalCommunityProps {
  posts: Post[];
}

export const LocalCommunity = ({ posts }: LocalCommunityProps) => {
  const localPosts = posts.filter(post => post.community !== 'global').slice(0, 5);

  return (
    <div className="card-enhanced p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Local Community
      </h3>
      
      {localPosts.length === 0 ? (
        <p className="text-muted-foreground text-sm text-bengali">
          স্থানীয় কোন পোস্ট নেই
        </p>
      ) : (
        <div className="space-y-3">
          {localPosts.map((post) => (
            <div
              key={post.id}
              className="p-3 rounded-lg bg-muted/20 hover:bg-muted/40 
                        transition-colors cursor-pointer border border-border/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-medium text-sm text-bengali">{post.author.name}</div>
                <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                  {post.community}
                </span>
              </div>
              <p className="text-sm text-muted-foreground text-bengali line-clamp-2">
                {post.content}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString('bn-BD')}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {post.likes}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};