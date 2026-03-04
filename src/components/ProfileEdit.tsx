import { useState, useRef } from "react";
import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Camera, X, Image, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadProfileImage } from "@/lib/profileImageUpload";
import { supabase } from "@/integrations/supabase/client";

interface ProfileEditProps {
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
}

export const ProfileEdit = ({ user, onUpdateProfile }: ProfileEditProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [bio, setBio] = useState(user.bio || "");
  const [location, setLocation] = useState(user.location || "");
  const [role, setRole] = useState(user.role || "user");
  const [nidMasked, setNidMasked] = useState(user.nidMasked);
  const [profileImage, setProfileImage] = useState(user.profileImage || "");
  const [coverImage, setCoverImage] = useState(user.coverImage || "");
  const [imagePreview, setImagePreview] = useState(user.profileImage || "");
  const [coverPreview, setCoverPreview] = useState(user.coverImage || "");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ত্রুটি",
          description: "ছবির সাইজ ৫ MB এর বেশি হতে পারে না",
          variant: "destructive",
        });
        return;
      }

      // Store file for upload later
      if (type === 'profile') {
        setProfileFile(file);
      } else {
        setCoverFile(file);
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === 'profile') {
          setImagePreview(result);
        } else {
          setCoverPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: 'profile' | 'cover') => {
    if (type === 'profile') {
      setProfileImage("");
      setImagePreview("");
      setProfileFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setCoverImage("");
      setCoverPreview("");
      setCoverFile(null);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "ত্রুটি",
        description: "নাম খালি থাকতে পারে না",
        variant: "destructive",
      });
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "ত্রুটি",
        description: "সঠিক ইমেইল ঠিকানা দিন",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl = profileImage;
      let coverUrl = coverImage;

      // Upload profile image if changed
      if (profileFile) {
        const uploadedUrl = await uploadProfileImage(profileFile, user.id, 'avatar');
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        } else {
          toast({
            title: "ত্রুটি",
            description: "প্রোফাইল ছবি আপলোড করতে সমস্যা হয়েছে",
            variant: "destructive",
          });
        }
      }

      // Upload cover image if changed
      if (coverFile) {
        const uploadedUrl = await uploadProfileImage(coverFile, user.id, 'cover');
        if (uploadedUrl) {
          coverUrl = uploadedUrl;
        } else {
          toast({
            title: "ত্রুটি",
            description: "কভার ছবি আপলোড করতে সমস্যা হয়েছে",
            variant: "destructive",
          });
        }
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: name.trim(),
          username: username.trim() || null,
          email: email.trim() || null,
          bio: bio.trim() || null,
          location: location.trim() || null,
          role: role,
          avatar_url: avatarUrl || null,
          cover_url: coverUrl || null,
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "ত্রুটি",
          description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        username: username.trim() || undefined,
        email: email.trim() || undefined,
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        role: role as User['role'],
        nidMasked: nidMasked.trim() || user.nidMasked,
        profileImage: avatarUrl || undefined,
        coverImage: coverUrl || undefined,
      };

      onUpdateProfile(updatedUser);
      setProfileImage(avatarUrl);
      setCoverImage(coverUrl);
      setProfileFile(null);
      setCoverFile(null);
      setIsOpen(false);
      
      toast({
        title: "সফল",
        description: "প্রোফাইল আপডেট করা হয়েছে",
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({
        title: "ত্রুটি",
        description: "প্রোফাইল আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit size={16} />
          সম্পাদনা
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-bengali">প্রোফাইল সম্পাদনা</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-bengali">কভার ছবি</Label>
            <div className="space-y-3">
              <div className="relative">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-32 rounded-lg object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => removeImage('cover')}
                      disabled={isSaving}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gradient-hero rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Image size={24} className="mx-auto mb-1" />
                      <p className="text-sm text-bengali">কভার ছবি যোগ করুন</p>
                    </div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => coverInputRef.current?.click()}
                className="gap-2"
                disabled={isSaving}
              >
                <Camera size={16} />
                কভার ছবি নির্বাচন
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'cover')}
                className="hidden"
              />
            </div>
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label className="text-bengali">প্রোফাইল ছবি</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={() => removeImage('profile')}
                      disabled={isSaving}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                  disabled={isSaving}
                >
                  <Camera size={16} />
                  ছবি নির্বাচন
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  সর্বোচ্চ ৫ MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelect(e, 'profile')}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-bengali">নাম</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="আপনার নাম লিখুন"
              className="text-bengali"
              disabled={isSaving}
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-bengali">ব্যবহারকারীর নাম (ঐচ্ছিক)</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="@username"
              className="text-bengali"
              disabled={isSaving}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-bengali">সংক্ষিপ্ত পরিচিতি (ঐচ্ছিক)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="নিজের সম্পর্কে কিছু লিখুন..."
              className="text-bengali min-h-[80px]"
              maxLength={200}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground text-right">
              {bio.length}/200
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-bengali">অবস্থান (ঐচ্ছিক)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="ঢাকা, বাংলাদেশ"
              className="text-bengali"
              disabled={isSaving}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="text-bengali">ভূমিকা</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">সাধারণ ব্যবহারকারী</SelectItem>
                <SelectItem value="freelancer">ফ্রিল্যান্সার</SelectItem>
                <SelectItem value="trainer">প্রশিক্ষক</SelectItem>
                <SelectItem value="learner">শিক্ষার্থী</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-bengali">ইমেইল (ঐচ্ছিক)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isSaving}
            />
          </div>

          {/* NID */}
          <div className="space-y-2">
            <Label htmlFor="nid" className="text-bengali">NID (শেষের ৪ ডিজিট)</Label>
            <Input
              id="nid"
              value={nidMasked}
              onChange={(e) => setNidMasked(e.target.value)}
              placeholder="****1234"
              maxLength={8}
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              বাতিল
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                'সংরক্ষণ'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
