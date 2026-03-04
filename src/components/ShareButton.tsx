import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareButtonProps {
  postId: string;
  postContent: string;
}

export const ShareButton = ({ postId, postContent }: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const shareUrl = `${window.location.origin}/post/${postId}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: t("Success", "সফল"),
        description: t("Link copied to clipboard", "লিংক কপি করা হয়েছে"),
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: t("Error", "ত্রুটি"),
        description: t("Failed to copy link", "লিংক কপি করতে পারেনি"),
        variant: "destructive",
      });
    }
  };

  const handleShareToSocial = (platform: string) => {
    const text = `${postContent.slice(0, 100)}...`;
    let url = '';
    
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <Share2 className="w-4 h-4 mr-2" />
          {t('Share', 'শেয়ার')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('Share Post', 'পোস্ট শেয়ার করুন')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShareToSocial('facebook')}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShareToSocial('twitter')}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-sky-500 rounded"></div>
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShareToSocial('whatsapp')}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 bg-green-600 rounded"></div>
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {t('Copy Link', 'লিংক কপি')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
