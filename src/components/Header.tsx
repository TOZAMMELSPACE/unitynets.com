import { User } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
  onCreatePost?: () => void;
}

export const Header = ({ currentUser, onSignOut, onCreatePost }: HeaderProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="card-enhanced p-4 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              UnityNet
            </h1>
            <p className="text-muted-foreground text-bengali font-medium text-sm">
              Trust • Learn • Unite
            </p>
          </div>
          
          {/* Create Post Button */}
          {currentUser && onCreatePost && (
            <Button
              onClick={onCreatePost}
              className="btn-hero flex items-center gap-2 px-4 py-2"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Post</span>
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 hover:bg-primary/10"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right bg-gradient-to-r from-accent/10 to-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                <div className="font-semibold text-bengali text-primary">{currentUser.name}</div>
                <div className="trust-score text-xs">
                  Trust: {Math.round(currentUser.trustScore)}
                </div>
              </div>
              <Button
                onClick={onSignOut}
                variant="outline"
                size="sm"
                className="border-primary/20 text-primary hover:bg-primary/10 hover:text-primary"
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
};