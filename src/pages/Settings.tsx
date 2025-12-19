import { useState } from "react";
import { User } from "@/lib/storage";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  User as UserIcon, 
  Shield, 
  ShieldCheck,
  Bell, 
  Moon, 
  Sun,
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight,
  UserX,
  Download,
  Trash2,
  Palette,
  MessageCircle,
  Phone,
  Mail,
  Bug,
  FileText,
  Info,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Clock,
  Users,
  Heart,
  BadgeCheck,
  Camera,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";

interface SettingsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

// Districts of Bangladesh
const districts = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "সিলেট", "বরিশাল", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "টাঙ্গাইল", "জামালপুর", "দিনাজপুর", "বগুড়া"
];

const professions = [
  "শিক্ষার্থী / Student",
  "ব্যবসায়ী / Business",
  "চাকরিজীবী / Service Holder",
  "ডাক্তার / Doctor",
  "ইঞ্জিনিয়ার / Engineer",
  "শিক্ষক / Teacher",
  "গৃহিণী / Homemaker",
  "ফ্রিল্যান্সার / Freelancer",
  "অন্যান্য / Other"
];

export default function Settings({ currentUser, onSignOut }: SettingsProps) {
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications(currentUser?.id || null);
  const t = (en: string, bn: string) => language === 'bn' ? bn : en;

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [blockedUsersOpen, setBlockedUsersOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [displayOpen, setDisplayOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [downloadDataOpen, setDownloadDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Edit Profile state
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
    location: currentUser?.location || "",
    profession: "",
    phone: "",
    email: currentUser?.email || "",
    gender: "male",
    dateOfBirth: ""
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "everyone",
    lastSeen: true,
    onlineStatus: true,
    readReceipts: true,
    whoCanMessage: "everyone",
    showEmail: false,
    showPhone: false,
    twoFactorAuth: false,
    loginAlerts: true
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    messages: true,
    likes: true,
    comments: true,
    followers: true,
    unityNote: true,
    groupActivity: true,
    mentions: true,
    emailWeeklyDigest: true,
    emailSecurityAlerts: true,
    emailProductUpdates: true,
    emailMarketing: false,
    quietHours: false
  });

  // Blocked users mock data
  const [blockedUsers] = useState([
    { id: "1", name: "রাহুল আহমেদ", blockedDate: "১৫ নভেম্বর ২০২৪" },
    { id: "2", name: "মিনা বেগম", blockedDate: "৩ অক্টোবর ২০২৪" }
  ]);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Download data state
  const [downloadOptions, setDownloadOptions] = useState({
    profile: true,
    posts: true,
    messages: true,
    media: true,
    unityNote: true
  });

  const handleSaveProfile = () => {
    toast({
      title: t("Profile Updated", "প্রোফাইল আপডেট হয়েছে"),
      description: t("Your changes have been saved successfully.", "আপনার পরিবর্তনগুলো সফলভাবে সংরক্ষিত হয়েছে।")
    });
    setEditProfileOpen(false);
  };

  const handleSavePrivacy = () => {
    toast({
      title: t("Privacy Settings Updated", "প্রাইভেসি সেটিংস আপডেট হয়েছে"),
      description: t("Your privacy settings have been saved.", "আপনার প্রাইভেসি সেটিংস সংরক্ষিত হয়েছে।")
    });
    setPrivacyOpen(false);
  };

  const handleSaveNotifications = () => {
    toast({
      title: t("Notification Settings Updated", "নোটিফিকেশন সেটিংস আপডেট হয়েছে"),
      description: t("Your notification preferences have been saved.", "আপনার নোটিফিকেশন পছন্দ সংরক্ষিত হয়েছে।")
    });
    setNotificationsOpen(false);
  };

  const handleUnblock = (userId: string) => {
    toast({
      title: t("User Unblocked", "আনব্লক করা হয়েছে"),
      description: t("This user can now contact you.", "এই ব্যবহারকারী এখন আপনার সাথে যোগাযোগ করতে পারবে।")
    });
  };

  const handleRequestDownload = () => {
    toast({
      title: t("Download Requested", "ডাউনলোড অনুরোধ করা হয়েছে"),
      description: t("You'll receive an email when your data is ready (within 24 hours).", "আপনার ডাটা প্রস্তুত হলে ইমেইল পাবেন (২৪ ঘণ্টার মধ্যে)।")
    });
    setDownloadDataOpen(false);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword || !deleteConfirm) {
      toast({
        title: t("Error", "ত্রুটি"),
        description: t("Please enter password and confirm deletion.", "পাসওয়ার্ড দিন এবং নিশ্চিত করুন।"),
        variant: "destructive"
      });
      return;
    }
    toast({
      title: t("Account Deletion Scheduled", "অ্যাকাউন্ট মুছে ফেলার সময়সূচী করা হয়েছে"),
      description: t("Your account will be deleted in 30 days. You can cancel this anytime.", "আপনার অ্যাকাউন্ট ৩০ দিনের মধ্যে মুছে যাবে। যেকোনো সময় বাতিল করতে পারবেন।")
    });
    setDeleteAccountOpen(false);
  };

  const settingsCategories = [
    {
      title: t("Account", "অ্যাকাউন্ট"),
      items: [
        { 
          icon: UserIcon, 
          label: t("Edit Profile", "প্রোফাইল সম্পাদনা"), 
          description: t("Name, photo, and information", "নাম, ছবি এবং তথ্য পরিবর্তন"),
          onClick: () => setEditProfileOpen(true)
        },
        { 
          icon: ShieldCheck, 
          label: t("Verification", "ভেরিফিকেশন"), 
          description: t("Verify your account", "আপনার অ্যাকাউন্ট যাচাই করুন"),
          badge: currentUser?.isVerified ? t("Verified", "ভেরিফাইড") : t("Not Verified", "যাচাই হয়নি"),
          badgeVariant: currentUser?.isVerified ? "default" : "secondary",
          onClick: () => setVerificationOpen(true)
        },
      ]
    },
    {
      title: t("Privacy & Security", "প্রাইভেসি ও নিরাপত্তা"),
      items: [
        { 
          icon: Shield, 
          label: t("Privacy Settings", "প্রাইভেসি সেটিংস"), 
          description: t("Control who can see your info", "কে আপনার তথ্য দেখতে পারবে"),
          onClick: () => setPrivacyOpen(true)
        },
        { 
          icon: UserX, 
          label: t("Blocked Users", "ব্লকড ইউজার"), 
          description: t("Manage blocked accounts", "ব্লক করা অ্যাকাউন্ট পরিচালনা"),
          onClick: () => setBlockedUsersOpen(true)
        },
      ]
    },
    {
      title: t("Notifications", "নোটিফিকেশন"),
      items: [
        { 
          icon: Bell, 
          label: t("Notification Settings", "নোটিফিকেশন সেটিংস"), 
          description: t("Push and email notifications", "পুশ এবং ইমেইল নোটিফিকেশন"),
          onClick: () => setNotificationsOpen(true)
        },
      ]
    },
    {
      title: t("Display", "প্রদর্শন"),
      items: [
        { 
          icon: Palette, 
          label: t("Theme & Display", "থিম ও প্রদর্শন"), 
          description: t("Appearance settings", "চেহারা সেটিংস"),
          onClick: () => setDisplayOpen(true)
        },
        { 
          icon: Globe, 
          label: t("Language", "ভাষা"), 
          description: language === 'bn' ? "বাংলা" : "English",
          onClick: () => setLanguageOpen(true)
        },
      ]
    },
    {
      title: t("Help & Support", "সাহায্য ও সাপোর্ট"),
      items: [
        { 
          icon: HelpCircle, 
          label: t("Help Center", "সাহায্য কেন্দ্র"), 
          description: t("FAQ and guides", "FAQ এবং গাইড"),
          onClick: () => setHelpOpen(true)
        },
        { 
          icon: MessageCircle, 
          label: t("Contact Us", "যোগাযোগ করুন"), 
          description: t("Get in touch with support", "সাপোর্ট টিমের সাথে যোগাযোগ"),
          onClick: () => window.open("mailto:support@unitynets.app", "_blank")
        },
      ]
    },
    {
      title: t("Account Actions", "অ্যাকাউন্ট অ্যাকশন"),
      items: [
        { 
          icon: Download, 
          label: t("Download Your Data", "আপনার ডাটা ডাউনলোড"), 
          description: t("Get a copy of your data", "আপনার ডাটার কপি নিন"),
          onClick: () => setDownloadDataOpen(true)
        },
        { 
          icon: Trash2, 
          label: t("Delete Account", "অ্যাকাউন্ট মুছুন"), 
          description: t("Permanently delete your account", "স্থায়ীভাবে অ্যাকাউন্ট মুছুন"),
          destructive: true,
          onClick: () => setDeleteAccountOpen(true)
        },
      ]
    }
  ];

  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          {t("Settings", "সেটিংস")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("Manage your account and preferences", "আপনার অ্যাকাউন্ট এবং পছন্দ পরিচালনা করুন")}
        </p>
      </div>

      {/* User Info Card */}
      <div className="card-enhanced p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center overflow-hidden">
              {currentUser?.profileImage ? (
                <img src={currentUser.profileImage} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-white">
                  {currentUser?.name.charAt(0)}
                </span>
              )}
            </div>
            {currentUser?.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5">
                <BadgeCheck className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{currentUser?.name}</h3>
              {currentUser?.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  {t("Verified", "ভেরিফাইড")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              @{currentUser?.username || currentUser?.name.toLowerCase().replace(/\s/g, '_')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("Trust Score", "ট্রাস্ট স্কোর")}: <span className="text-primary font-semibold">{Math.round(currentUser?.trustScore || 0)}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditProfileOpen(true)}>
            {t("Edit", "সম্পাদনা")}
          </Button>
        </div>
      </div>

      {/* Settings Categories */}
      <div className="space-y-6">
        {settingsCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3 px-1">
              {category.title}
            </h3>
            <div className="card-enhanced overflow-hidden">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <button
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-all text-left ${
                      item.destructive ? 'text-destructive' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.destructive ? 'bg-destructive/10' : 'bg-primary/10'
                    }`}>
                      <item.icon className={`w-5 h-5 ${item.destructive ? 'text-destructive' : 'text-primary'}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant={item.badgeVariant as any} className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground block truncate">
                        {item.description}
                      </span>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                  
                  {itemIndex < category.items.length - 1 && (
                    <Separator className="ml-16" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <div className="mt-8">
        <Button
          variant="outline"
          onClick={onSignOut}
          className="w-full gap-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <LogOut size={16} />
          {t("Sign Out", "সাইন আউট")}
        </Button>
      </div>

      {/* App Info */}
      <div className="mt-6 text-center text-sm text-muted-foreground space-y-1">
        <p>UnityNets v1.0.0</p>
        <p>© {t("2025 UnityNets. All rights reserved.", "২০২৫ UnityNets। সর্বস্বত্ব সংরক্ষিত।")}</p>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={editProfileOpen} onOpenChange={setEditProfileOpen}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Edit Profile", "প্রোফাইল সম্পাদনা")}</SheetTitle>
            <SheetDescription>
              {t("Update your profile information", "আপনার প্রোফাইল তথ্য আপডেট করুন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-hero rounded-full flex items-center justify-center overflow-hidden">
                  {currentUser?.profileImage ? (
                    <img src={currentUser.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {profileData.name.charAt(0) || "U"}
                    </span>
                  )}
                </div>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm">
                {t("Change Photo", "ছবি পরিবর্তন")}
              </Button>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("Full Name", "পুরো নাম")} *</Label>
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder={t("Enter your full name", "আপনার পুরো নাম লিখুন")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("Username", "ইউজারনেম")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    className="pl-8"
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("Bio", "বায়ো")}</Label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder={t("Tell us about yourself", "নিজের সম্পর্কে বলুন")}
                  maxLength={150}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {profileData.bio.length}/150
                </p>
              </div>

              <div className="space-y-2">
                <Label>{t("Location", "অবস্থান")}</Label>
                <Select
                  value={profileData.location}
                  onValueChange={(value) => setProfileData({ ...profileData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select district", "জেলা নির্বাচন করুন")} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("Profession", "পেশা")}</Label>
                <Select
                  value={profileData.profession}
                  onValueChange={(value) => setProfileData({ ...profileData, profession: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select profession", "পেশা নির্বাচন করুন")} />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((profession) => (
                      <SelectItem key={profession} value={profession}>{profession}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("Gender", "লিঙ্গ")}</Label>
                <RadioGroup
                  value={profileData.gender}
                  onValueChange={(value) => setProfileData({ ...profileData, gender: value })}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal">{t("Male", "পুরুষ")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal">{t("Female", "মহিলা")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="font-normal">{t("Other", "অন্যান্য")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>{t("Phone Number", "ফোন নম্বর")}</Label>
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+880 1XXXXXXXXX"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label>{t("Email", "ইমেইল")}</Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setEditProfileOpen(false)}>
              {t("Cancel", "বাতিল")}
            </Button>
            <Button className="flex-1" onClick={handleSaveProfile}>
              {t("Save Changes", "সংরক্ষণ করুন")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Verification Sheet */}
      <Sheet open={verificationOpen} onOpenChange={setVerificationOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Account Verification", "অ্যাকাউন্ট ভেরিফিকেশন")}</SheetTitle>
            <SheetDescription>
              {t("Verify as a trusted member", "বিশ্বস্ত সদস্য হিসেবে যাচাই করুন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Verification Status */}
            <div className="card-enhanced p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {currentUser?.isVerified ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Shield className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">
                    {currentUser?.isVerified 
                      ? t("Account Verified", "অ্যাকাউন্ট ভেরিফাইড")
                      : t("Not Verified Yet", "এখনো ভেরিফাই হয়নি")
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.isVerified 
                      ? t("Your account is verified and trusted", "আপনার অ্যাকাউন্ট যাচাইকৃত এবং বিশ্বস্ত")
                      : t("Complete verification to increase trust", "ট্রাস্ট বাড়াতে ভেরিফিকেশন সম্পন্ন করুন")
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Methods */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Choose Verification Method", "যাচাই পদ্ধতি বেছে নিন")}</h4>
              
              {/* NID Verification */}
              <div className="card-enhanced p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{t("NID Verification", "NID ভেরিফিকেশন")}</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("Upload NID and selfie for full verification", "সম্পূর্ণ ভেরিফিকেশনের জন্য NID এবং সেলফি আপলোড করুন")}
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>১. {t("Front side of NID", "NID এর সামনের অংশ")}</p>
                      <p>২. {t("Back side of NID", "NID এর পিছনের অংশ")}</p>
                      <p>৩. {t("Selfie holding NID", "NID হাতে ধরে সেলফি")}</p>
                    </div>
                    <Button className="mt-3 w-full" variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      {t("Start NID Verification", "NID ভেরিফিকেশন শুরু করুন")}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⏱️ {t("Verification time: 24-48 hours", "যাচাই সময়: ২৪-৪৮ ঘণ্টা")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Banking OTP */}
              <div className="card-enhanced p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium">{t("Mobile Banking OTP", "মোবাইল ব্যাংকিং OTP")}</h5>
                    <p className="text-sm text-muted-foreground mb-3">
                      {t("Quick verification via bKash/Nagad/Rocket", "bKash/Nagad/Rocket দিয়ে দ্রুত যাচাই")}
                    </p>
                    <RadioGroup defaultValue="bkash" className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bkash" id="bkash" />
                        <Label htmlFor="bkash" className="font-normal">bKash</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="nagad" id="nagad" />
                        <Label htmlFor="nagad" className="font-normal">Nagad</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rocket" id="rocket" />
                        <Label htmlFor="rocket" className="font-normal">Rocket</Label>
                      </div>
                    </RadioGroup>
                    <Button className="mt-3 w-full" variant="outline">
                      {t("Send OTP", "OTP পাঠান")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Badges Info */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t("Verification Badges", "ভেরিফিকেশন ব্যাজ")}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{t("Basic Verified (Phone)", "বেসিক ভেরিফাইড (ফোন)")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  <span>{t("ID Verified (NID)", "আইডি ভেরিফাইড (NID)")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{t("Premium", "প্রিমিয়াম")}</Badge>
                  <span className="text-muted-foreground">{t("Premium Verified (All + Payment)", "প্রিমিয়াম ভেরিফাইড")}</span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Settings Sheet */}
      <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Privacy & Security", "প্রাইভেসি ও নিরাপত্তা")}</SheetTitle>
            <SheetDescription>
              {t("Control your privacy settings", "আপনার প্রাইভেসি সেটিংস নিয়ন্ত্রণ করুন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Profile Visibility */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Profile Visibility", "প্রোফাইল দৃশ্যমানতা")}</h4>
              
              <div className="space-y-2">
                <Label>{t("Who can see your profile", "কে আপনার প্রোফাইল দেখতে পারবে")}</Label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t("Everyone", "সবাই")}</SelectItem>
                    <SelectItem value="members">{t("Members Only", "শুধু সদস্য")}</SelectItem>
                    <SelectItem value="friends">{t("Friends Only", "শুধু বন্ধু")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Show Last Seen", "শেষ দেখা সময় দেখান")}</p>
                  <p className="text-sm text-muted-foreground">{t("Let others see when you were last active", "অন্যরা দেখুক কখন শেষ সক্রিয় ছিলেন")}</p>
                </div>
                <Switch
                  checked={privacySettings.lastSeen}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, lastSeen: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Online Status", "অনলাইন স্ট্যাটাস")}</p>
                  <p className="text-sm text-muted-foreground">{t("Show when you're online", "অনলাইন থাকলে দেখান")}</p>
                </div>
                <Switch
                  checked={privacySettings.onlineStatus}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, onlineStatus: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Read Receipts", "পড়া রিসিট")}</p>
                  <p className="text-sm text-muted-foreground">{t("Let others know you've read their messages", "অন্যরা জানুক আপনি মেসেজ পড়েছেন")}</p>
                </div>
                <Switch
                  checked={privacySettings.readReceipts}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, readReceipts: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Settings */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Contact Settings", "যোগাযোগ সেটিংস")}</h4>
              
              <div className="space-y-2">
                <Label>{t("Who can message you", "কে আপনাকে মেসেজ করতে পারবে")}</Label>
                <Select
                  value={privacySettings.whoCanMessage}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, whoCanMessage: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t("Everyone", "সবাই")}</SelectItem>
                    <SelectItem value="members">{t("Members Only", "শুধু সদস্য")}</SelectItem>
                    <SelectItem value="friends">{t("Friends Only", "শুধু বন্ধু")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Show Email", "ইমেইল দেখান")}</p>
                  <p className="text-sm text-muted-foreground">{t("Display email on profile", "প্রোফাইলে ইমেইল দেখান")}</p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Show Phone", "ফোন নম্বর দেখান")}</p>
                  <p className="text-sm text-muted-foreground">{t("Display phone on profile", "প্রোফাইলে ফোন দেখান")}</p>
                </div>
                <Switch
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* Security */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Security", "নিরাপত্তা")}</h4>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Two-Factor Authentication", "দুই স্তরের নিরাপত্তা")}</p>
                  <p className="text-sm text-muted-foreground">{t("Add extra security to your account", "অ্যাকাউন্টে অতিরিক্ত নিরাপত্তা যোগ করুন")}</p>
                </div>
                <Switch
                  checked={privacySettings.twoFactorAuth}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, twoFactorAuth: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t("Login Alerts", "লগইন সতর্কতা")}</p>
                  <p className="text-sm text-muted-foreground">{t("Get notified of new logins", "নতুন লগইনের সতর্কতা পান")}</p>
                </div>
                <Switch
                  checked={privacySettings.loginAlerts}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, loginAlerts: checked })}
                />
              </div>

              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                {t("View Active Sessions", "সক্রিয় সেশন দেখুন")}
              </Button>
            </div>

            {/* Premium Features */}
            <div className="card-enhanced p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{t("Premium", "প্রিমিয়াম")}</Badge>
                <span className="font-semibold">{t("Advanced Privacy", "উন্নত প্রাইভেসি")}</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("Hide from search", "সার্চে লুকান")}</li>
                <li>• {t("Anonymous profile viewing", "গোপনে প্রোফাইল দেখুন")}</li>
                <li>• {t("Hide online status completely", "অনলাইন সম্পূর্ণ লুকান")}</li>
              </ul>
              <Button className="mt-3 w-full" size="sm">
                {t("Upgrade to Premium", "প্রিমিয়ামে আপগ্রেড করুন")}
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setPrivacyOpen(false)}>
              {t("Cancel", "বাতিল")}
            </Button>
            <Button className="flex-1" onClick={handleSavePrivacy}>
              {t("Save", "সংরক্ষণ")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Blocked Users Sheet */}
      <Sheet open={blockedUsersOpen} onOpenChange={setBlockedUsersOpen}>
        <SheetContent side="bottom" className="h-[70vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Blocked Users", "ব্লকড ইউজার")}</SheetTitle>
            <SheetDescription>
              {t("People you've blocked", "আপনি যাদের ব্লক করেছেন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 py-6">
            <Input placeholder={t("Search blocked users...", "ব্লকড ইউজার সার্চ করুন...")} />
            
            {blockedUsers.length > 0 ? (
              <div className="space-y-2">
                {blockedUsers.map((user) => (
                  <div key={user.id} className="card-enhanced p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("Blocked on", "ব্লক করা হয়েছে")}: {user.blockedDate}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleUnblock(user.id)}>
                      {t("Unblock", "আনব্লক")}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserX className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{t("No blocked users", "কোনো ব্লকড ইউজার নেই")}</p>
              </div>
            )}

            <div className="card-enhanced p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                ℹ️ {t("Blocked users cannot message you or see your profile.", "ব্লক করা ব্যক্তি আপনাকে মেসেজ করতে বা প্রোফাইল দেখতে পারবে না।")}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Notification Settings", "নোটিফিকেশন সেটিংস")}</SheetTitle>
            <SheetDescription>
              {t("Control when and how you receive notifications", "কখন এবং কীভাবে নোটিফিকেশন পাবেন নিয়ন্ত্রণ করুন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Browser Push Notifications */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Browser Push Notifications", "ব্রাউজার পুশ নোটিফিকেশন")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("Get notifications even when the app is closed", "অ্যাপ বন্ধ থাকলেও নোটিফিকেশন পান")}
              </p>
              
              {isSupported ? (
                <Button 
                  onClick={isSubscribed ? unsubscribe : subscribe}
                  disabled={isLoading}
                  variant={isSubscribed ? "outline" : "default"}
                  className="w-full"
                >
                  {isLoading 
                    ? t("Processing...", "প্রক্রিয়াকরণ হচ্ছে...") 
                    : isSubscribed 
                      ? t("Disable Browser Notifications", "ব্রাউজার নোটিফিকেশন বন্ধ করুন") 
                      : t("Enable Browser Notifications", "ব্রাউজার নোটিফিকেশন চালু করুন")
                  }
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("Your browser doesn't support push notifications", "আপনার ব্রাউজার পুশ নোটিফিকেশন সাপোর্ট করে না")}
                </p>
              )}
            </div>

            <Separator />

            {/* In-App Push Notifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{t("In-App Notifications", "ইন-অ্যাপ নোটিফিকেশন")}</h4>
                <Switch
                  checked={notificationSettings.pushEnabled}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushEnabled: checked })}
                />
              </div>
              
              {notificationSettings.pushEnabled && (
                <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                  {[
                    { key: 'messages', label: t("New Messages", "নতুন মেসেজ") },
                    { key: 'likes', label: t("Likes", "লাইক") },
                    { key: 'comments', label: t("Comments", "কমেন্ট") },
                    { key: 'followers', label: t("New Followers", "নতুন ফলোয়ার") },
                    { key: 'unityNote', label: t("Unity Note Updates", "ইউনিটি নোট আপডেট") },
                    { key: 'groupActivity', label: t("Group Activity", "গ্রুপ কার্যকলাপ") },
                    { key: 'mentions', label: t("Mentions", "মেনশন") },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <Switch
                        checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                        onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="font-semibold">{t("Email Notifications", "ইমেইল নোটিফিকেশন")}</h4>
              
              <div className="space-y-3">
                {[
                  { key: 'emailWeeklyDigest', label: t("Weekly Digest", "সাপ্তাহিক সারাংশ"), desc: t("Summary of your activity", "আপনার কার্যকলাপের সারাংশ") },
                  { key: 'emailSecurityAlerts', label: t("Security Alerts", "নিরাপত্তা সতর্কতা"), desc: t("Important security notifications", "গুরুত্বপূর্ণ নিরাপত্তা নোটিফিকেশন") },
                  { key: 'emailProductUpdates', label: t("Product Updates", "নতুন ফিচার আপডেট"), desc: t("New features and improvements", "নতুন ফিচার ও উন্নতি") },
                  { key: 'emailMarketing', label: t("Promotional Emails", "প্রমোশনাল ইমেইল"), desc: t("Special offers and promotions", "বিশেষ অফার ও প্রমোশন") },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, [item.key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quiet Hours - Premium */}
            <div className="card-enhanced p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{t("Quiet Hours", "শান্ত সময়")}</span>
                  <Badge variant="secondary">{t("Premium", "প্রিমিয়াম")}</Badge>
                </div>
                <Switch
                  checked={notificationSettings.quietHours}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, quietHours: checked })}
                  disabled
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("Mute notifications from 10 PM to 7 AM", "রাত ১০টা থেকে সকাল ৭টা পর্যন্ত নোটিফিকেশন বন্ধ")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setNotificationsOpen(false)}>
              {t("Cancel", "বাতিল")}
            </Button>
            <Button className="flex-1" onClick={handleSaveNotifications}>
              {t("Save", "সংরক্ষণ")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Display Settings Sheet */}
      <Sheet open={displayOpen} onOpenChange={setDisplayOpen}>
        <SheetContent side="bottom" className="h-[60vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Theme & Display", "থিম ও প্রদর্শন")}</SheetTitle>
            <SheetDescription>
              {t("Customize app appearance", "অ্যাপের চেহারা কাস্টমাইজ করুন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label>{t("Theme", "থিম")}</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: t("Light", "লাইট") },
                  { value: 'dark', icon: Moon, label: t("Dark", "ডার্ক") },
                  { value: 'system', icon: Smartphone, label: t("System", "সিস্টেম") },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                    className={`card-enhanced p-4 flex flex-col items-center gap-2 transition-all ${
                      theme === option.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <option.icon className="w-6 h-6" />
                    <span className="text-sm">{option.label}</span>
                    {theme === option.value && (
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Font Size */}
            <div className="space-y-4">
              <Label>{t("Font Size", "ফন্ট সাইজ")}</Label>
              <RadioGroup defaultValue="medium" className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="font-small" />
                  <Label htmlFor="font-small" className="font-normal text-sm">{t("Small", "ছোট")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="font-medium" />
                  <Label htmlFor="font-medium" className="font-normal">{t("Medium", "মাঝারি")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large" />
                  <Label htmlFor="font-large" className="font-normal text-lg">{t("Large", "বড়")}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Language Sheet */}
      <Sheet open={languageOpen} onOpenChange={setLanguageOpen}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Language", "ভাষা")}</SheetTitle>
            <SheetDescription>
              {t("Choose your preferred language", "আপনার পছন্দের ভাষা বেছে নিন")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-3 py-6">
            {[
              { value: 'bn', label: 'বাংলা (Bengali)' },
              { value: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguage(lang.value as 'bn' | 'en');
                  setLanguageOpen(false);
                  toast({
                    title: lang.value === 'bn' ? "ভাষা পরিবর্তিত হয়েছে" : "Language Changed",
                    description: lang.value === 'bn' ? "বাংলা ভাষা নির্বাচিত হয়েছে" : "English language selected"
                  });
                }}
                className={`w-full card-enhanced p-4 flex items-center justify-between transition-all ${
                  language === lang.value ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <span className="font-medium">{lang.label}</span>
                {language === lang.value && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Help & Support Sheet */}
      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{t("Help & Support", "সাহায্য ও সাপোর্ট")}</SheetTitle>
            <SheetDescription>
              {t("We're here to help", "আমরা আপনাকে সাহায্য করতে প্রস্তুত")}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* FAQ Accordion */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t("Frequently Asked Questions", "সাধারণ প্রশ্নাবলী")}</h4>
              <Accordion type="single" collapsible className="w-full">
                {[
                  { 
                    q: t("How do I verify my account?", "কীভাবে অ্যাকাউন্ট ভেরিফাই করব?"),
                    a: t("Go to Settings > Verification and choose NID verification or Mobile Banking OTP.", "সেটিংস > ভেরিফিকেশনে যান এবং NID ভেরিফিকেশন বা মোবাইল ব্যাংকিং OTP বেছে নিন।")
                  },
                  {
                    q: t("What is Unity Note?", "ইউনিটি নোট কী?"),
                    a: t("Unity Note is our time-based currency system. 1 hour of service = 1 Unity Note.", "ইউনিটি নোট আমাদের সময়-ভিত্তিক মুদ্রা ব্যবস্থা। ১ ঘণ্টা সেবা = ১ ইউনিটি নোট।")
                  },
                  {
                    q: t("How can I increase my Trust Score?", "ট্রাস্ট স্কোর কীভাবে বাড়াব?"),
                    a: t("Complete verification, help others, participate in community, and maintain good feedback.", "ভেরিফিকেশন সম্পন্ন করুন, অন্যদের সাহায্য করুন, কমিউনিটিতে অংশগ্রহণ করুন।")
                  },
                ].map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Separator />

            {/* Contact Options */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t("Contact Us", "যোগাযোগ করুন")}</h4>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start gap-3">
                  <MessageCircle className="w-4 h-4" />
                  {t("Live Chat (9AM-9PM)", "লাইভ চ্যাট (সকাল ৯টা - রাত ৯টা)")}
                </Button>
                <Button variant="outline" className="justify-start gap-3">
                  <Mail className="w-4 h-4" />
                  support@unitynet.app
                </Button>
                <Button variant="outline" className="justify-start gap-3">
                  <Bug className="w-4 h-4" />
                  {t("Report a Bug", "বাগ রিপোর্ট করুন")}
                </Button>
              </div>
            </div>

            <Separator />

            {/* About */}
            <div className="space-y-3">
              <h4 className="font-semibold">{t("About", "অ্যাপ সম্পর্কে")}</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <FileText className="w-4 h-4" />
                  {t("Terms of Service", "সেবার শর্তাবলী")}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Shield className="w-4 h-4" />
                  {t("Privacy Policy", "প্রাইভেসি পলিসি")}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Users className="w-4 h-4" />
                  {t("Community Guidelines", "কমিউনিটি গাইডলাইন")}
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Info className="w-4 h-4" />
                  {t("Open Source Licenses", "ওপেন সোর্স লাইসেন্স")}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Download Data Dialog */}
      <Dialog open={downloadDataOpen} onOpenChange={setDownloadDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Download Your Data", "আপনার ডাটা ডাউনলোড")}</DialogTitle>
            <DialogDescription>
              {t("Get a copy of all your data", "আপনার সব তথ্যের কপি নিন")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              {t("Select what data you want to download:", "কোন ডাটা ডাউনলোড করতে চান নির্বাচন করুন:")}
            </p>
            
            <div className="space-y-3">
              {[
                { key: 'profile', label: t("Profile Information", "প্রোফাইল তথ্য") },
                { key: 'posts', label: t("Posts and Comments", "পোস্ট এবং কমেন্ট") },
                { key: 'messages', label: t("Messages", "মেসেজ") },
                { key: 'media', label: t("Photos and Media", "ফটো এবং মিডিয়া") },
                { key: 'unityNote', label: t("Unity Note Transactions", "ইউনিটি নোট লেনদেন") },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={downloadOptions[item.key as keyof typeof downloadOptions]}
                    onCheckedChange={(checked) => setDownloadOptions({ ...downloadOptions, [item.key]: checked as boolean })}
                  />
                  <Label htmlFor={item.key} className="font-normal">{item.label}</Label>
                </div>
              ))}
            </div>

            <div className="card-enhanced p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                ⏱️ {t("Preparation may take up to 24 hours. You'll receive an email when ready.", "প্রস্তুত হতে ২৪ ঘণ্টা পর্যন্ত সময় লাগতে পারে। প্রস্তুত হলে ইমেইল পাবেন।")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDownloadDataOpen(false)}>
              {t("Cancel", "বাতিল")}
            </Button>
            <Button onClick={handleRequestDownload}>
              <Download className="w-4 h-4 mr-2" />
              {t("Request Download", "ডাউনলোড অনুরোধ")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t("Delete Account", "অ্যাকাউন্ট মুছুন")}
            </DialogTitle>
            <DialogDescription>
              {t("This action is irreversible!", "এই কাজটি অপরিবর্তনীয়!")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="card-enhanced p-3 bg-destructive/10 border-destructive/20">
              <p className="text-sm font-medium mb-2">{t("All your data will be deleted:", "আপনার সব ডাটা মুছে যাবে:")}</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• {t("Profile and photos", "প্রোফাইল এবং ছবি")}</li>
                <li>• {t("All posts and comments", "সব পোস্ট ও কমেন্ট")}</li>
                <li>• {t("Message history", "মেসেজ ইতিহাস")}</li>
                <li>• ⚠️ {t("Unity Note balance", "ইউনিটি নোট ব্যালেন্স")}</li>
                <li>• {t("Verification status", "ভেরিফিকেশন স্ট্যাটাস")}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label>{t("Enter your password to confirm", "নিশ্চিত করতে পাসওয়ার্ড দিন")}</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("Why are you leaving? (Optional)", "কেন চলে যাচ্ছেন? (ঐচ্ছিক)")}</Label>
              <RadioGroup value={deleteReason} onValueChange={setDeleteReason}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-using" id="not-using" />
                  <Label htmlFor="not-using" className="font-normal text-sm">{t("No longer using", "আর ব্যবহার করি না")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other-account" id="other-account" />
                  <Label htmlFor="other-account" className="font-normal text-sm">{t("Have another account", "অন্য অ্যাকাউন্ট আছে")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="privacy" id="privacy-concern" />
                  <Label htmlFor="privacy-concern" className="font-normal text-sm">{t("Privacy concerns", "প্রাইভেসি উদ্বেগ")}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other-reason" />
                  <Label htmlFor="other-reason" className="font-normal text-sm">{t("Other", "অন্যান্য")}</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="confirm-delete"
                checked={deleteConfirm}
                onCheckedChange={(checked) => setDeleteConfirm(checked as boolean)}
              />
              <Label htmlFor="confirm-delete" className="text-sm font-normal">
                {t("I understand this action cannot be undone", "আমি বুঝি এই কাজ পূর্বাবস্থায় ফেরানো যাবে না")}
              </Label>
            </div>

            <div className="card-enhanced p-3 bg-primary/5 border-primary/20">
              <p className="text-sm">
                💡 <strong>{t("Alternative:", "বিকল্প:")}</strong> {t("Deactivate your account instead. You can come back within 30 days.", "অ্যাকাউন্ট নিষ্ক্রিয় করুন। ৩০ দিনের মধ্যে ফিরে আসতে পারবেন।")}
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDeleteAccountOpen(false)} className="flex-1">
              {t("Cancel", "বাতিল")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} className="flex-1">
              <Trash2 className="w-4 h-4 mr-2" />
              {t("Delete Permanently", "স্থায়ীভাবে মুছুন")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
