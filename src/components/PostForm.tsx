import { useState } from "react";
import { User, Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface PostFormProps {
  user: User;
  onPostCreated: (post: Post) => void;
}

export const PostForm = ({ user, onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("global");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something to post",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPost: Post = {
        id: Date.now().toString(),
        author: { id: user.id, name: user.name },
        content: content.trim(),
        community,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      onPostCreated(newPost);
      setContent("");
      
      toast({
        title: "Success",
        description: "Your post has been shared with the community!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user.name.charAt(0)}
        </div>
        <div>
          <div className="font-semibold text-bengali">{user.name}</div>
          <div className="trust-score">
            Trust: {Math.round(user.trustScore)}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="আপনার পোস্ট লিখুন... (লোকাল ইস্যু/জ্ঞান শেয়ার করুন)"
          className="min-h-[120px] resize-none text-bengali"
        />
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Select value={community} onValueChange={setCommunity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select community" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">🌍 Global</SelectItem>
              <SelectItem value="ward-1">🏘️ Ward-1</SelectItem>
              <SelectItem value="ward-2">🏘️ Ward-2</SelectItem>
              <SelectItem value="ward-3">🏘️ Ward-3</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="btn-trust"
          >
            {isSubmitting ? "Posting..." : "Share Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};