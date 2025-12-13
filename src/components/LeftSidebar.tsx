import { NavLink, useLocation } from "react-router-dom";
import { Home, Bell, User, MessageCircle, Search, Users, Settings, Plus, Coins, Building2, BarChart3, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface LeftSidebarProps {
  onCreatePost?: () => void;
}

export const LeftSidebar = ({ onCreatePost }: LeftSidebarProps) => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Home, labelEn: "Home", labelBn: "হোম" },
    { path: "/explore", icon: Search, labelEn: "Explore", labelBn: "এক্সপ্লোর" },
    { path: "/learning-zone", icon: BookOpen, labelEn: "Learning Zone", labelBn: "লার্নিং জোন" },
    { path: "/unity-note", icon: Coins, labelEn: "Unity Note", labelBn: "ঐক্য নোট" },
    { path: "/impact-report", icon: BarChart3, labelEn: "Impact Report", labelBn: "প্রভাব রিপোর্ট" },
    { path: "/unity-government", icon: Building2, labelEn: "Unity Government", labelBn: "ইউনিটি সরকার" },
    { path: "/notifications", icon: Bell, labelEn: "Notifications", labelBn: "নোটিফিকেশন" },
    { path: "/messages", icon: MessageCircle, labelEn: "Messages", labelBn: "মেসেজ" },
    { path: "/groups", icon: Users, labelEn: "Groups", labelBn: "গ্রুপ" },
    { path: "/profile", icon: User, labelEn: "Profile", labelBn: "প্রোফাইল" },
    { path: "/settings", icon: Settings, labelEn: "Settings", labelBn: "সেটিংস" },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex-col overflow-y-auto">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              UnityNet
            </h1>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ path, icon: Icon, labelEn, labelBn }) => {
            const isActive = location.pathname === path;
            
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-primary/15 text-primary shadow-md border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon 
                  size={24} 
                  className={`${isActive ? "text-primary" : "group-hover:text-foreground"}`} 
                />
                <span className="font-medium text-sm">
                  {t(labelEn, labelBn)}
                </span>
                {/* Notification indicator for Bell icon */}
                {path === "/notifications" && (
                  <div className="ml-auto w-2 h-2 bg-destructive rounded-full"></div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Button - Only on Home page */}
        {onCreatePost && location.pathname === "/" && (
          <div className="mt-8">
            <Button
              onClick={onCreatePost}
              className="w-full btn-hero flex items-center justify-center gap-2 py-3 shadow-elegant hover:shadow-glow transition-all duration-300"
            >
              <Plus className="h-5 w-5" />
              <span className="font-semibold">
                {t("New Post", "নতুন পোস্ট")}
              </span>
            </Button>
          </div>
        )}
      </div>

      {/* Bottom section with branding */}
      <div className="mt-auto p-6 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          Trust • Learn • Unite
        </p>
      </div>
    </aside>
  );
};