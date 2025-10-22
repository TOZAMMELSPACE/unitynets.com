import { NavLink, useLocation } from "react-router-dom";
import { Home, Bell, User, MessageCircle, Search, Users, Settings, Coins, Building2, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const BottomNavigation = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Home, labelEn: "Home", labelBn: "হোম" },
    { path: "/explore", icon: Search, labelEn: "Explore", labelBn: "এক্সপ্লোর" },
    { path: "/unity-note", icon: Coins, labelEn: "Note", labelBn: "নোট" },
    { path: "/impact-report", icon: BarChart3, labelEn: "Impact", labelBn: "প্রভাব" },
    { path: "/notifications", icon: Bell, labelEn: "Alerts", labelBn: "সতর্কতা" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 lg:hidden">
      <div className="flex justify-around items-center py-2 px-2 pb-safe">
        {navItems.map(({ path, icon: Icon, labelEn, labelBn }) => {
          const isActive = location.pathname === path;
          
          return (
            <NavLink
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[50px] ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">
                {t(labelEn, labelBn)}
              </span>
              {/* Notification indicator for Bell icon */}
              {path === "/notifications" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></div>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};