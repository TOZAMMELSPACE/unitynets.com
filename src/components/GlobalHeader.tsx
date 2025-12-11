import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface GlobalHeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
}

export const GlobalHeader = ({ currentUser, onSignOut }: GlobalHeaderProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-card/95 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground tracking-tight">
              Unity<span className="text-primary">Nets</span>
            </h1>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium tracking-wide">
              Trust • Learn • Unite
            </span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
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
                    Score: {Math.round(currentUser.trustScore)}
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
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="default" size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
