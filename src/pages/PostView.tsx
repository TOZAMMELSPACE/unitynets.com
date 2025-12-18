import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/ImageCarousel";
import { formatDistanceToNow } from "date-fns";
import { bn } from "date-fns/locale";
import { ArrowLeft, Heart, MessageCircle, Eye } from "lucide-react";

interface Post {
  id: string;
  content: string;
  image_urls: string[] | null;
  video_url: string | null;
  likes_count: number;
  views_count: number;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string | null;
    username: string | null;
  };
  comments_count: number;
}

const PostView = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("পোস্ট পাওয়া যায়নি");
        setLoading(false);
        return;
      }

      try {
        // Fetch post
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();

        if (postError || !postData) {
          setError("পোস্ট পাওয়া যায়নি");
          setLoading(false);
          return;
        }

        // Fetch author profile
        const { data: profileData } = await supabase
          .from("public_profiles")
          .select("full_name, avatar_url, username")
          .eq("user_id", postData.user_id)
          .single();

        // Fetch comments count
        const { count: commentsCount } = await supabase
          .from("comments")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);

        setPost({
          ...postData,
          author: profileData || {
            full_name: "Unknown User",
            avatar_url: null,
            username: null,
          },
          comments_count: commentsCount || 0,
        });
      } catch (err) {
        setError("পোস্ট লোড করতে সমস্যা হয়েছে");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{error || "পোস্ট পাওয়া যায়নি"}</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            হোমে ফিরে যান
          </Button>
        </Link>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale: bn,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold text-foreground">পোস্ট</h1>
            <p className="text-xs text-muted-foreground">UnityNets</p>
          </div>
        </div>
      </header>

      {/* Post Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.author.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {post.author.full_name}
                </p>
                {post.author.username && (
                  <p className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Text Content */}
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>

            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
              <ImageCarousel images={post.image_urls} />
            )}

            {/* Video */}
            {post.video_url && (
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <video
                  src={post.video_url}
                  controls
                  className="w-full max-h-[500px] object-contain"
                  poster={post.image_urls?.[0]}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-border text-muted-foreground">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments_count || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                <span>{post.views_count || 0}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 border-t border-border">
              <Link to="/auth">
                <Button className="w-full">
                  লাইক, কমেন্ট এবং আরো দেখতে সাইন ইন করুন
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostView;
