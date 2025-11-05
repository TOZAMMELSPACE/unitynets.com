import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Bell, User, MessageCircle, Search, Users, Settings, Coins, Building2, BarChart3 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { path: "/explore", icon: Search, labelEn: "Explore", labelBn: "এক্সপ্লোর" },
    { path: "/unity-note", icon: Coins, labelEn: "Note", labelBn: "নোট" },
    { path: "/impact-report", icon: BarChart3, labelEn: "Impact", labelBn: "প্রভাব" },
    { path: "/notifications", icon: Bell, labelEn: "Alerts", labelBn: "সতর্কতা" },
    { path: "/messages", icon: MessageCircle, labelEn: "Messages", labelBn: "মেসেজ" },
    { path: "/groups", icon: Users, labelEn: "Groups", labelBn: "গ্রুপ" },
    { path: "/profile", icon: User, labelEn: "Profile", labelBn: "প্রোফাইল" },
    { path: "/settings", icon: Settings, labelEn: "Settings", labelBn: "সেটিংস" },
    { path: "/unity-government", icon: Building2, labelEn: "Government", labelBn: "সরকার" },
  ];

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      setIsExpanded(!isExpanded);
    } else {
      navigate("/");
      setIsExpanded(false);
    }
  };

  // Calculate position for each item in a 90-degree arc
  const getItemPosition = (index: number) => {
    const totalItems = navItems.length;
    const angle = (90 / (totalItems + 1)) * (index + 1) - 45; // -45 to +45 degrees
    const radius = 100; // Distance from center
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pointer-events-none">
      <div className="relative h-24 flex items-end justify-center pb-4">
        {/* Floating menu items */}
        {navItems.map(({ path, icon: Icon, labelEn, labelBn }, index) => {
          const isActive = location.pathname === path;
          const { x, y } = getItemPosition(index);
          
          return (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsExpanded(false)}
              className={`absolute pointer-events-auto transition-all duration-500 ease-out ${
                isExpanded 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-0 pointer-events-none"
              }`}
              style={{
                transform: isExpanded 
                  ? `translate(${x}px, ${y}px)` 
                  : "translate(0, 0)",
                bottom: "80px",
                left: "50%",
                marginLeft: "-20px",
              }}
            >
              <div
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} />
                <span className="text-[8px] mt-0.5 font-medium truncate max-w-[50px] text-center">
                  {t(labelEn, labelBn)}
                </span>
                {path === "/notifications" && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></div>
                )}
              </div>
            </NavLink>
          );
        })}

        {/* Home FAB button */}
        <button
          onClick={handleHomeClick}
          className={`pointer-events-auto w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            location.pathname === "/"
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-card text-foreground hover:scale-105"
          } ${isExpanded ? "rotate-45" : "rotate-0"}`}
        >
          <Home size={28} />
        </button>
      </div>
    </nav>
  );
};