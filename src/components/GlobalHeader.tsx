import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";

interface GlobalHeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
}

export const GlobalHeader = ({ currentUser, onSignOut, onCreatePost }: GlobalHeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              Unity<span className="text-primary">Net</span>
            </h1>
            <span className="hidden md:inline-block text-sm text-muted-foreground font-medium">
              একত্রে শক্তিশালী
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Create Post */}
            {currentUser && onCreatePost && (
              <Button
                onClick={onCreatePost}
                variant="hero"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("New Post", "নতুন পোস্ট")}</span>
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {/* User Profile */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground">{currentUser.name}</span>
                  <span className="text-xs text-primary font-medium">
                    Score: {Math.round(currentUser.trustScore)}
                  </span>
                </div>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                >
                  {t("Sign Out", "সাইন আউট")}
                </Button>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {t("Sign In", "সাইন ইন")}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
