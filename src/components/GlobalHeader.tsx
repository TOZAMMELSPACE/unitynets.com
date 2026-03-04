import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Moon, Sun, PenSquare, LogIn } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, useNavigate } from "react-router-dom";

interface GlobalHeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
}

export const GlobalHeader = ({ currentUser, onSignOut, onCreatePost }: GlobalHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/home";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card/95 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="UnityNets Logo" 
              className="h-10 sm:h-12 w-auto"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* New Post Button - Desktop only */}
            {currentUser && onCreatePost && isHomePage && (
              <Button
                onClick={onCreatePost}
                variant="default"
                size="sm"
                className="hidden lg:flex items-center gap-2 font-medium"
              >
                <PenSquare className="h-4 w-4" />
                {t("New Post", "নতুন পোস্ট")}
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full hover:bg-primary/10"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 text-primary" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 text-primary" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* User Info */}
            {currentUser ? (
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-primary font-medium">
                    {t("Score", "স্কোর")}: {Math.round(currentUser.trustScore)}
                  </span>
                </div>
                <div className="flex sm:hidden flex-col items-end">
                  <span className="text-xs font-semibold text-foreground truncate max-w-[80px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-primary font-medium">
                    {Math.round(currentUser.trustScore)}
                  </span>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="font-medium"
                >
                  {t("Sign Out", "সাইন আউট")}
                </Button>
              </div>
            ) : (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {t("Sign In", "সাইন ইন")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
