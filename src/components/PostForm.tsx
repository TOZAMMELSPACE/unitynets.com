import { useState, useRef } from "react";
import { User, Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { worldCountries } from "@/lib/countries";

interface PostFormProps {
  user: User;
  onPostCreated: (post: Post) => void;
}

export const PostForm = ({ user, onPostCreated }: PostFormProps) => {
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("global");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 4) {
      toast({
        title: "ত্রুটি",
        description: "সর্বোচ্চ ৪টি ছবি যুক্ত করতে পারেন",
        variant: "destructive"
      });
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ত্রুটি",
          description: "প্রতিটি ছবির সাইজ ৫ MB এর বেশি হতে পারে না",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && images.length === 0) {
      toast({
        title: "ত্রুটি",
        description: "একটি পোস্ট লিখুন অথবা ছবি যুক্ত করুন",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newPost: Post = {
        id: Date.now().toString(),
        author: { 
          id: user.id, 
          name: user.name,
          profileImage: user.profileImage 
        },
        content: content.trim(),
        images: images.length > 0 ? images : undefined,
        community,
        postType: 'text',
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: []
      };

      onPostCreated(newPost);
      setContent("");
      setImages([]);
      
      toast({
        title: "সফল",
        description: "আপনার পোস্টটি কমিউনিটিতে শেয়ার করা হয়েছে!",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পোস্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-enhanced p-6">
      <div className="flex items-center gap-4 mb-4">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover border-2 border-border"
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user.name.charAt(0)}
          </div>
        )}
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

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 w-6 h-6 rounded-full p-0"
                  onClick={() => removeImage(index)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex gap-2">
            <Select value={community} onValueChange={setCommunity}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select community" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {worldCountries.map((country) => (
                  <SelectItem key={country.value} value={country.value}>
                    {country.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 4}
              className="gap-2"
            >
              <Image size={16} />
              ছবি
            </Button>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || (!content.trim() && images.length === 0)}
            className="btn-trust"
          >
            {isSubmitting ? "পোস্ট করছি..." : "পোস্ট শেয়ার করুন"}
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
      </form>
    </div>
  );
};