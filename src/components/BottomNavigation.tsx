import { NavLink, useLocation } from "react-router-dom";
import { Home, Bell, User, MessageCircle, Search, Users, Settings } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/notifications", icon: Bell, label: "Notifications" },
  { path: "/messages", icon: MessageCircle, label: "Messages" },
  { path: "/explore", icon: Search, label: "Explore" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/groups", icon: Users, label: "Groups" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center py-2 px-1">
        {navItems.map(({ path, icon: Icon, label }) => {
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
              <span className="text-xs mt-1 font-medium">{label}</span>
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