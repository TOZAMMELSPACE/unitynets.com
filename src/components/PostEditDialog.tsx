import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PostEditDialogProps {
  postId: string;
  initialContent: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (postId: string, newContent: string) => void;
}

export const PostEditDialog = ({
  postId,
  initialContent,
  open,
  onOpenChange,
  onUpdate,
}: PostEditDialogProps) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("পোস্টের কন্টেন্ট খালি রাখা যাবে না");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("posts")
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq("id", postId);

      if (error) throw error;

      toast.success("পোস্ট আপডেট হয়েছে");
      onUpdate?.(postId, content.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("পোস্ট আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-bengali">পোস্ট এডিট করুন</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="আপনার পোস্ট লিখুন..."
            className="min-h-[150px] resize-none text-bengali"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {content.length} অক্ষর
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            বাতিল
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                সেভ হচ্ছে...
              </>
            ) : (
              "সেভ করুন"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
