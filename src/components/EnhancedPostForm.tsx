import { useState, useRef } from "react";
import { User, Post } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  X, 
  FileText, 
  Camera, 
  Video, 
  BarChart3, 
  Calendar, 
  Briefcase,
  MapPin,
  Hash,
  Eye,
  Save,
  Plus,
  Loader2,
  Play
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { uploadPostImage } from "@/lib/imageUpload";
import { uploadPostVideo } from "@/lib/videoUpload";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedPostFormProps {
  user: User;
  onPostCreated: (post: Post) => void;
  initialPostType?: 'text' | 'image' | 'video' | 'poll' | 'event' | 'job';
}

export const EnhancedPostForm = ({ user, onPostCreated, initialPostType = 'text' }: EnhancedPostFormProps) => {
  const [content, setContent] = useState("");
  const [community, setCommunity] = useState("global");
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'poll' | 'event' | 'job'>(initialPostType);
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [video, setVideo] = useState<{ file: File; preview: string } | null>(null);
  const [location, setLocation] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Event fields
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  
  // Job fields
  const [jobTitle, setJobTitle] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const [jobSkills, setJobSkills] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  
  // Poll fields
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

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
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "ত্রুটি", 
          description: "প্রতিটি ছবির সাইজ ৫ MB এর বেশি হতে পারে না",
          variant: "destructive",
        });
        return;
      }

      const preview = URL.createObjectURL(file);
      setImages(prev => [...prev, { file, preview }]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "ত্রুটি",
        description: "ভিডিওর সাইজ ৫০ MB এর বেশি হতে পারে না",
        variant: "destructive"
      });
      return;
    }

    // Validate video type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "ত্রুটি",
        description: "শুধুমাত্র MP4, WebM, OGG বা MOV ভিডিও গ্রহণযোগ্য",
        variant: "destructive"
      });
      return;
    }

    const preview = URL.createObjectURL(file);
    setVideo({ file, preview });

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const removeVideo = () => {
    if (video) {
      URL.revokeObjectURL(video.preview);
      setVideo(null);
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    
    if (!content.trim() && postType === 'text') {
      toast({
        title: "ত্রুটি",
        description: "একটি পোস্ট লিখুন",
        variant: "destructive"
      });
      return;
    }

    if (postType === 'video' && !video && !content.trim()) {
      toast({
        title: "ত্রুটি",
        description: "ভিডিও যুক্ত করুন অথবা কিছু লিখুন",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to storage if any
      let uploadedImageUrls: string[] = [];
      if (images.length > 0) {
        setIsUploading(true);
        setUploadProgress("ছবি আপলোড হচ্ছে...");
        const uploadPromises = images.map(img => uploadPostImage(img.file, user.id));
        const results = await Promise.all(uploadPromises);
        uploadedImageUrls = results.filter((url): url is string => url !== null);

        if (uploadedImageUrls.length < images.length) {
          toast({
            title: "সতর্কতা",
            description: "কিছু ছবি আপলোড করতে সমস্যা হয়েছে",
            variant: "destructive"
          });
        }
      }

      // Upload video if any
      let uploadedVideoUrl: string | undefined;
      if (video) {
        setIsUploading(true);
        setUploadProgress("ভিডিও আপলোড হচ্ছে...");
        const result = await uploadPostVideo(video.file, user.id);
        if (result) {
          uploadedVideoUrl = result;
        } else {
          toast({
            title: "ত্রুটি",
            description: "ভিডিও আপলোড করতে সমস্যা হয়েছে",
            variant: "destructive"
          });
        }
      }

      setIsUploading(false);
      setUploadProgress("");

      const newPost: Post = {
        id: Date.now().toString(),
        author: { 
          id: user.id, 
          name: user.name,
          profileImage: user.profileImage 
        },
        content: content.trim(),
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
        videoUrl: uploadedVideoUrl,
        community,
        postType,
        location: location || undefined,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        views: Math.floor(Math.random() * 10) + 1,
        comments: [],
        isDraft: saveAsDraft,
        isEvent: postType === 'event',
        eventDetails: postType === 'event' ? {
          title: eventTitle,
          date: eventDate,
          location: eventLocation,
          description: eventDescription
        } : undefined,
        isJob: postType === 'job',
        jobDetails: postType === 'job' ? {
          title: jobTitle,
          budget: jobBudget,
          deadline: jobDeadline,
          skills: jobSkills,
          description: jobDescription
        } : undefined,
        pollOptions: postType === 'poll' ? pollOptions.filter(opt => opt.trim()).map(option => ({
          option,
          votes: 0
        })) : undefined
      };

      onPostCreated(newPost);
      
      // Cleanup preview URLs
      images.forEach(img => URL.revokeObjectURL(img.preview));
      if (video) URL.revokeObjectURL(video.preview);
      
      // Reset form
      setContent("");
      setImages([]);
      setVideo(null);
      setLocation("");
      setHashtags([]);
      setEventTitle("");
      setEventDate("");
      setEventLocation("");
      setEventDescription("");
      setJobTitle("");
      setJobBudget("");
      setJobDeadline("");
      setJobSkills([]);
      setJobDescription("");
      setPollOptions(["", ""]);
      
      toast({
        title: "সফল",
        description: saveAsDraft ? "ড্রাফট সেভ করা হয়েছে!" : "আপনার পোস্টটি কমিউনিটিতে শেয়ার করা হয়েছে!",
      });
    } catch (error) {
      toast({
        title: "ত্রুটি",
        description: "পোস্ট তৈরি করতে সমস্যা হয়েছে।",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const postTypeIcons = {
    text: FileText,
    image: Camera,
    video: Video,
    poll: BarChart3,
    event: Calendar,
    job: Briefcase
  };

  if (showPreview) {
    return (
      <Card className="card-enhanced">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>পোস্ট প্রিভিউ</CardTitle>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <X className="w-4 h-4 mr-2" />
            বন্ধ করুন
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {user.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-10 h-10 rounded-full" />
            ) : (
              <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center text-white">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">এখনই</div>
            </div>
          </div>
          
          <div className="text-card-foreground">{content}</div>
          
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary">#{tag}</Badge>
              ))}
            </div>
          )}
          
          {location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          )}
          
          <Button onClick={() => setShowPreview(false)} className="w-full">
            এডিট করুন
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <div className="flex items-center gap-4">
          {user.profileImage ? (
            <img src={user.profileImage} alt="Profile" className="w-12 h-12 rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center text-white">
              {user.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold">{user.name}</div>
            <div className="trust-score">Trust: {Math.round(user.trustScore)}</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={postType} onValueChange={(value) => setPostType(value as any)}>
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(postTypeIcons).map(([type, Icon]) => (
              <TabsTrigger key={type} value={type} className="flex items-center gap-1">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {type === 'text' ? 'টেক্সট' : 
                   type === 'image' ? 'ছবি' :
                   type === 'video' ? 'ভিডিও' :
                   type === 'poll' ? 'পোল' :
                   type === 'event' ? 'ইভেন্ট' : 'কাজ'}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4 mt-4">
            {/* Common fields */}
            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="আপনার মতামত শেয়ার করুন..."
                className="min-h-[120px]"
              />
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ছবির সাথে বর্ণনা লিখুন..."
                className="min-h-[80px]"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Camera className="w-4 h-4 mr-2" />
                ছবি যুক্ত করুন
              </Button>
            </TabsContent>

            <TabsContent value="video" className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="ভিডিওর সাথে বর্ণনা লিখুন..."
                className="min-h-[80px]"
              />
              
              {!video ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-primary/30 hover:border-primary/50 flex flex-col items-center justify-center gap-2"
                >
                  <Video className="w-8 h-8 text-primary/60" />
                  <span className="text-muted-foreground">ভিডিও যুক্ত করুন (সর্বোচ্চ ৫০MB)</span>
                  <span className="text-xs text-muted-foreground">MP4, WebM, OGG, MOV</span>
                </Button>
              ) : (
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video 
                    src={video.preview} 
                    className="w-full max-h-64 object-contain"
                    controls
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeVideo}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="poll" className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="পোলের প্রশ্ন লিখুন..."
                className="min-h-[80px]"
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">পোলের অপশন:</label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                      placeholder={`অপশন ${index + 1}`}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removePollOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <Button type="button" variant="outline" onClick={addPollOption}>
                    <Plus className="w-4 h-4 mr-2" />
                    অপশন যুক্ত করুন
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="event" className="space-y-4">
              <Input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="ইভেন্টের নাম"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
                <Input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="স্থান"
                />
              </div>
              <Textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="ইভেন্টের বিস্তারিত..."
              />
            </TabsContent>

            <TabsContent value="job" className="space-y-4">
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="কাজের শিরোনাম"
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={jobBudget}
                  onChange={(e) => setJobBudget(e.target.value)}
                  placeholder="বাজেট (টাকা)"
                />
                <Input
                  type="date"
                  value={jobDeadline}
                  onChange={(e) => setJobDeadline(e.target.value)}
                />
              </div>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="কাজের বিস্তারিত..."
              />
            </TabsContent>

            {/* Image preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative">
                    <img src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => {
                        URL.revokeObjectURL(img.preview);
                        setImages(images.filter((_, i) => i !== index));
                      }}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {isUploading && (
              <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">ছবি আপলোড হচ্ছে...</span>
              </div>
            )}

            {/* Location and hashtags */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="লোকেশন যুক্ত করুন"
                    className="w-full"
                  />
                </div>
                <Button type="button" variant="outline" size="sm">
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  placeholder="হ্যাশট্যাগ যুক্ত করুন"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addHashtag}>
                  <Hash className="w-4 h-4" />
                </Button>
              </div>

              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeHashtag(tag)}>
                      #{tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Community and actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">🌍 Global</SelectItem>
                  <SelectItem value="ward-1">🏘️ Ward-1</SelectItem>
                  <SelectItem value="ward-2">🏘️ Ward-2</SelectItem>
                  <SelectItem value="ward-3">🏘️ Ward-3</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  প্রিভিউ
                </Button>
                <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)}>
                  <Save className="w-4 h-4 mr-2" />
                  ড্রাফট
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading} className="btn-trust">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploadProgress || "পোস্ট করছি..."}
                    </>
                  ) : "পোস্ট করুন"}
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};