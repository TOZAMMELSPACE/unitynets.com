import { useState } from "react";
import { Shield, Settings, Lock, Eye, EyeOff, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PrivacySettings as PrivacySettingsType } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface PrivacySettingsProps {
  privacySettings: PrivacySettingsType;
  onUpdatePrivacy: (settings: PrivacySettingsType) => void;
}

export const PrivacySettings = ({ privacySettings, onUpdatePrivacy }: PrivacySettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(privacySettings);
  const { toast } = useToast();

  const handleSave = () => {
    onUpdatePrivacy(settings);
    setIsOpen(false);
    toast({
      title: "সফল",
      description: "প্রাইভেসি সেটিংস আপডেট করা হয়েছে",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-bengali">প্রাইভেসি সেটিংস</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-bengali">
            <Shield className="w-5 h-5" />
            প্রাইভেসি এবং সিকিউরিটি
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Message Privacy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span className="text-bengali">মেসেজিং প্রাইভেসি</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-bengali">কে আপনাকে মেসেজ করতে পারবে?</Label>
                <Select
                  value={settings.allowMessagesFrom}
                  onValueChange={(value: 'everyone' | 'followers' | 'none') =>
                    setSettings({ ...settings, allowMessagesFrom: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">সবাই</SelectItem>
                    <SelectItem value="followers">শুধু ফলোয়াররা</SelectItem>
                    <SelectItem value="none">কেউ না</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Profile Visibility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-bengali">প্রোফাইল ভিজিবিলিটি</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-bengali">লাস্ট অনলাইন দেখান</Label>
                  <p className="text-xs text-muted-foreground text-bengali">
                    অন্যরা দেখতে পাবে আপনি কখন শেষ অনলাইনে ছিলেন
                  </p>
                </div>
                <Switch
                  checked={settings.showLastOnline}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showLastOnline: checked })
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-bengali">ইমেইল দেখান</Label>
                  <p className="text-xs text-muted-foreground text-bengali">
                    আপনার ইমেইল অন্যদের কাছে দৃশ্যমান হবে
                  </p>
                </div>
                <Switch
                  checked={settings.showEmail}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, showEmail: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-bengali">অ্যাকাউন্ট অ্যাকশন</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2">
                <UserX className="w-4 h-4" />
                <span className="text-bengali">ব্লক করা ইউজার দেখুন</span>
              </Button>
              <Button variant="outline" className="w-full gap-2 text-destructive">
                <Shield className="w-4 h-4" />
                <span className="text-bengali">অ্যাকাউন্ট ডিঅ্যাকটিভেট</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            বাতিল
          </Button>
          <Button onClick={handleSave}>
            সংরক্ষণ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};