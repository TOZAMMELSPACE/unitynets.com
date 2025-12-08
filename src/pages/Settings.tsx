import { User } from "@/lib/storage";
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Shield, 
  Bell, 
  Moon, 
  Globe, 
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SettingsProps {
  currentUser: User | null;
  onSignOut: () => void;
}

const settingsCategories = [
  {
    title: "অ্যাকাউন্ট",
    items: [
      { icon: UserIcon, label: "প্রোফাইল সম্পাদনা", description: "নাম, ছবি এবং তথ্য পরিবর্তন" },
      { icon: Shield, label: "ভেরিফিকেশন", description: "আপনার অ্যাকাউন্ট ভেরিফাই করুন" },
    ]
  },
  {
    title: "প্রাইভেসি এবং নিরাপত্তা",
    items: [
      { icon: Shield, label: "প্রাইভেসি সেটিংস", description: "কে আপনার তথ্য দেখতে পারবে" },
      { icon: Bell, label: "ব্লকড ইউজার", description: "ব্লক করা ব্যবহারকারীদের তালিকা" },
    ]
  },
  {
    title: "নোটিফিকেশন",
    items: [
      { icon: Bell, label: "পুশ নোটিফিকেশন", description: "মোবাইল এবং ডেস্কটপ নোটিফিকেশন", hasSwitch: true },
      { icon: Bell, label: "ইমেইল নোটিফিকেশন", description: "ইমেইলে আপডেট পান", hasSwitch: true },
    ]
  },
  {
    title: "প্রদর্শন",
    items: [
      { icon: Moon, label: "ডার্ক মোড", description: "থিম পরিবর্তন করুন", hasSwitch: true },
      { icon: Globe, label: "ভাষা", description: "অ্যাপের ভাষা পরিবর্তন করুন" },
    ]
  },
  {
    title: "সাহায্য এবং সাপোর্ট",
    items: [
      { icon: HelpCircle, label: "সাহায্য কেন্দ্র", description: "FAQ এবং গাইড" },
      { icon: HelpCircle, label: "যোগাযোগ করুন", description: "সাপোর্ট টিমের সাথে যোগাযোগ" },
    ]
  }
];

export default function Settings({ currentUser, onSignOut }: SettingsProps) {
  return (
    <main className="container mx-auto px-4 py-6 max-w-2xl">

        {/* User Info Card */}
        <div className="card-enhanced p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-white text-bengali">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-bengali">{currentUser?.name}</h3>
              <p className="text-sm text-muted-foreground text-bengali">
                ট্রাস্ট স্কোর: {Math.round(currentUser?.trustScore || 0)}
              </p>
            </div>
            <Button variant="outline" size="sm" className="text-bengali">
              সম্পাদনা
            </Button>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="space-y-6">
          {settingsCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="font-semibold text-bengali mb-3">{category.title}</h3>
              <div className="card-enhanced overflow-hidden">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-all cursor-pointer">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-bengali">{item.label}</div>
                        <div className="text-sm text-muted-foreground text-bengali">
                          {item.description}
                        </div>
                      </div>
                      
                      {item.hasSwitch ? (
                        <Switch defaultChecked />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
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
            variant="destructive"
            onClick={onSignOut}
            className="w-full gap-2 text-bengali"
          >
            <LogOut size={16} />
            সাইন আউট
          </Button>
        </div>

        {/* App Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="text-bengali">UnityNet v1.0.0</p>
          <p className="text-bengali">© ২০২৪ UnityNet. সকল অধিকার সংরক্ষিত।</p>
        </div>
    </main>
  );
}