import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Trash2, 
  Lock, 
  Globe, 
  Users, 
  Eye, 
  EyeOff,
  Flag,
  Bookmark,
  BookmarkCheck,
  Edit,
  Copy,
  Share2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PostEditDialog } from "./PostEditDialog";

interface PostOptionsMenuProps {
  postId: string;
  authorId: string;
  currentUserId: string;
  postContent: string;
  onDelete?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onUpdate?: (postId: string, newContent: string) => void;
  isSaved?: boolean;
}

const COUNTRIES = [
  { code: 'BD', name: 'বাংলাদেশ', flag: '🇧🇩' },
  { code: 'IN', name: 'ভারত', flag: '🇮🇳' },
  { code: 'PK', name: 'পাকিস্তান', flag: '🇵🇰' },
  { code: 'NP', name: 'নেপাল', flag: '🇳🇵' },
  { code: 'LK', name: 'শ্রীলঙ্কা', flag: '🇱🇰' },
  { code: 'MM', name: 'মায়ানমার', flag: '🇲🇲' },
  { code: 'BT', name: 'ভুটান', flag: '🇧🇹' },
  { code: 'AF', name: 'আফগানিস্তান', flag: '🇦🇫' },
  { code: 'US', name: 'যুক্তরাষ্ট্র', flag: '🇺🇸' },
  { code: 'GB', name: 'যুক্তরাজ্য', flag: '🇬🇧' },
  { code: 'CA', name: 'কানাডা', flag: '🇨🇦' },
  { code: 'AU', name: 'অস্ট্রেলিয়া', flag: '🇦🇺' },
  { code: 'AE', name: 'সংযুক্ত আরব আমিরাত', flag: '🇦🇪' },
  { code: 'SA', name: 'সৌদি আরব', flag: '🇸🇦' },
  { code: 'QA', name: 'কাতার', flag: '🇶🇦' },
  { code: 'KW', name: 'কুয়েত', flag: '🇰🇼' },
  { code: 'MY', name: 'মালয়েশিয়া', flag: '🇲🇾' },
  { code: 'SG', name: 'সিঙ্গাপুর', flag: '🇸🇬' },
  { code: 'JP', name: 'জাপান', flag: '🇯🇵' },
  { code: 'KR', name: 'দক্ষিণ কোরিয়া', flag: '🇰🇷' },
  { code: 'DE', name: 'জার্মানি', flag: '🇩🇪' },
  { code: 'FR', name: 'ফ্রান্স', flag: '🇫🇷' },
  { code: 'IT', name: 'ইতালি', flag: '🇮🇹' },
  { code: 'ALL', name: 'সব দেশ', flag: '🌍' },
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'পাবলিক', icon: Globe, description: 'সবাই দেখতে পারবে' },
  { value: 'friends', label: 'শুধু বন্ধুরা', icon: Users, description: 'শুধু বন্ধুরা দেখতে পারবে' },
  { value: 'only_me', label: 'শুধু আমি', icon: EyeOff, description: 'শুধু আপনি দেখতে পারবেন' },
];

export const PostOptionsMenu = ({
  postId,
  authorId,
  currentUserId,
  postContent,
  onDelete,
  onSave,
  onUpdate,
  isSaved = false,
}: PostOptionsMenuProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = authorId === currentUserId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast.success('পোস্ট ডিলিট হয়েছে');
      onDelete?.(postId);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('পোস্ট ডিলিট করতে সমস্যা হয়েছে');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handlePrivacyChange = async (privacy: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ privacy })
        .eq('id', postId);

      if (error) throw error;
      
      toast.success(`প্রাইভেসি "${PRIVACY_OPTIONS.find(p => p.value === privacy)?.label}" সেট করা হয়েছে`);
    } catch (error) {
      console.error('Error updating privacy:', error);
      toast.error('প্রাইভেসি আপডেট করতে সমস্যা হয়েছে');
    }
  };

  const handleCountryTarget = async (countryCode: string) => {
    try {
      const targetCountry = countryCode === 'ALL' ? null : countryCode;
      
      const { error } = await supabase
        .from('posts')
        .update({ target_country: targetCountry })
        .eq('id', postId);

      if (error) throw error;
      
      const country = COUNTRIES.find(c => c.code === countryCode);
      toast.success(`পোস্ট "${country?.name}" এ দেখাবে`);
    } catch (error) {
      console.error('Error updating country target:', error);
      toast.error('দেশ সেট করতে সমস্যা হয়েছে');
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(url);
    toast.success('লিঙ্ক কপি হয়েছে');
  };

  const handleReport = () => {
    toast.success('রিপোর্ট পাঠানো হয়েছে। আমরা শীঘ্রই রিভিউ করব।');
  };

  const handleSave = () => {
    onSave?.(postId);
    toast.success(isSaved ? 'পোস্ট সেভ থেকে সরানো হয়েছে' : 'পোস্ট সেভ করা হয়েছে');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Save/Bookmark */}
          <DropdownMenuItem onClick={handleSave} className="gap-2 cursor-pointer">
            {isSaved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-primary" />
                <span>সেভ থেকে সরান</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>সেভ করুন</span>
              </>
            )}
          </DropdownMenuItem>

          {/* Copy Link */}
          <DropdownMenuItem onClick={handleCopyLink} className="gap-2 cursor-pointer">
            <Copy className="w-4 h-4" />
            <span>লিঙ্ক কপি করুন</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Owner-only options */}
          {isOwner && (
            <>
              {/* Edit */}
              <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="gap-2 cursor-pointer">
                <Edit className="w-4 h-4" />
                <span>এডিট করুন</span>
              </DropdownMenuItem>

              {/* Privacy Sub-menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Lock className="w-4 h-4" />
                  <span>প্রাইভেসি</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {PRIVACY_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => handlePrivacyChange(option.value)}
                      className="gap-2 cursor-pointer"
                    >
                      <option.icon className="w-4 h-4" />
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Country Targeting Sub-menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span>দেশ টার্গেট</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56 max-h-72 overflow-y-auto">
                  {COUNTRIES.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onClick={() => handleCountryTarget(country.code)}
                      className="gap-2 cursor-pointer"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span>{country.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {/* Delete */}
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                <span>ডিলিট করুন</span>
              </DropdownMenuItem>
            </>
          )}

          {/* Non-owner options */}
          {!isOwner && (
            <DropdownMenuItem onClick={handleReport} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <Flag className="w-4 h-4" />
              <span>রিপোর্ট করুন</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-bengali">পোস্ট ডিলিট করতে চান?</AlertDialogTitle>
            <AlertDialogDescription className="text-bengali">
              এই পোস্টটি স্থায়ীভাবে মুছে যাবে এবং পুনরুদ্ধার করা যাবে না। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'ডিলিট হচ্ছে...' : 'ডিলিট করুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <PostEditDialog
        postId={postId}
        initialContent={postContent}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onUpdate={onUpdate}
      />
    </>
  );
};
